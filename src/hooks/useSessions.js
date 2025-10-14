import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { phiFetch, PHIClient } from '@/lib/phiFetch';
import { toast } from 'react-hot-toast';
import { useAuth } from './useAuth';
import { enhanceSessionWithTemplate, processTemplateData } from '@/utils/templateProcessor';
import { logInfo, logWarning, logAIProcess } from '@/utils/logging';

/**
 * Custom hook for managing sessions and SOAP notes
 * @returns {Object} Session management functions and data
 */
export default function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'bodyRegion', 'sessionType'
  const { user } = useAuth(); // Get the authenticated user
  
  // Fetch template by id
  const fetchTemplate = async (templateId) => {
    if (!templateId) return null;
    
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      logWarning('Template Fetch', 'Failed to fetch template', { error: err.message, templateId });
      return null;
    }
  };

  // Get all sessions for the specified date, defaults to today
  const fetchSessionsByDate = useCallback(async (date = new Date()) => {
    setIsLoading(true);
    setError(null);
    
    // Format date to YYYY-MM-DD for database query
    const formattedDate = date.toISOString().split('T')[0];
    
    console.log('🔍 Fetching sessions for date:', {
      date: formattedDate,
      queryRange: `${formattedDate}T00:00:00 to ${formattedDate}T23:59:59`,
      sortOption,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Query PHI API for encounters (sessions)
      console.log('📡 Fetching encounters from PHI API...');
      
      const response = await phiFetch('/encounters?limit=50');
      const data = response.encounters || response || [];
      
      // Filter for today's encounters (PHI API doesn't support date filtering yet)
      const todayEncounters = data.filter(encounter => {
        const createdAt = new Date(encounter.created_at);
        return createdAt.toISOString().split('T')[0] === formattedDate;
      });
      
      console.log(`✅ Found ${todayEncounters?.length || 0} encounters for today`, {
        encounterIds: todayEncounters?.map(e => e.id) || [],
        firstEncounter: todayEncounters?.[0] ? {
          id: todayEncounters[0].id,
          templateType: todayEncounters[0].template_type,
          status: todayEncounters[0].status,
          hasSoap: !!todayEncounters[0].soap,
          createdAt: todayEncounters[0].created_at
        } : 'No encounters found'
      });
      
      // Process each encounter to match session format
      const processedSessions = [];
      for (const encounter of todayEncounters || []) {
        // Convert encounter to session format for compatibility
        const session = {
          id: encounter.id,
          body_region: encounter.template_type, // Using template_type as body region
          session_type: 'evaluation', // Default session type
          session_title: encounter.session_title,
          soap_note: encounter.soap,
          transcript: encounter.transcript_text,
          status: encounter.status,
          created_at: encounter.created_at,
          updated_at: encounter.updated_at
        };
        // For now, just push the session without template enhancement
        // Templates will be handled differently with the new architecture
        processedSessions.push(session);
      }
      
      // Apply current sort option
      const sortedSessions = sortSessions(processedSessions, sortOption);
      setSessions(sortedSessions);
      
      return sortedSessions;
    } catch (err) {
      console.error('❌ Error fetching sessions:', err);
      setError('Failed to load sessions. Please try again.');
      toast.error('Could not load sessions: ' + (err.message || 'Unknown error'));
      return [];
    } finally {
      setIsLoading(false);
      console.log('🔄 Session fetch operation completed');
    }
  }, [sortOption]);
  
  // Save a new session to the PHI API
  const saveSession = async (sessionData) => {
    setIsLoading(true);
    setError(null);
    logAIProcess('SAVE_SESSION', 'Starting encounter save process', {
      templateType: sessionData.templateType || sessionData.bodyRegion,
      hasTranscript: !!sessionData.transcript
    });
    
    console.log('🔵 Starting encounter save operation:', {
      templateType: sessionData.templateType || sessionData.bodyRegion,
      hasSoapNote: !!sessionData.soapNote,
      soapNoteLength: sessionData.soapNote ? JSON.stringify(sessionData.soapNote).length : 0,
      transcriptionLength: sessionData.transcript ? sessionData.transcript.length : 0,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Prepare encounter data for PHI API
      const templateType = sessionData.templateType || sessionData.bodyRegion || sessionData.body_region || 'knee';
      const sessionTitle = sessionData.sessionTitle || sessionData.session_title || `Session ${Date.now()}`;
      
      // Use soapNote directly if it exists (it's already in the correct format from AI)
      const soapData = sessionData.soapNote || {
        subjective: sessionData.subjective || '',
        objective: sessionData.objective || '',
        assessment: sessionData.assessment || '',
        plan: sessionData.plan || ''
      };
      
      console.log('💾 Preparing to save SOAP data:', {
        hasSoapNote: !!sessionData.soapNote,
        soapDataKeys: Object.keys(soapData),
        soapDataPreview: JSON.stringify(soapData).substring(0, 200)
      });
      
      
      console.log('✅ Validation passed, preparing to save to PHI API');
      
      if (!user || !user.id) {
        console.error('❌ No authenticated user found when trying to save encounter');
        throw new Error('You must be logged in to save an encounter');
      }
      
      // Create encounter via PHI API
      console.log('📦 Creating encounter via PHI API:', {
        templateType,
        sessionTitle,
        soapDataPreview: JSON.stringify(soapData).substring(0, 100) + '...'
      });
      
      
      // First create the encounter
      const encounter = await phiFetch('/encounters', {
        method: 'POST',
        body: JSON.stringify({
          templateType,
          orgId: user?.org_id || 'default-org',
          clinicianId: user?.id,
          sessionTitle
        })
      });
      
      if (!encounter || !encounter.id) {
        throw new Error('Failed to create encounter');
      }
      
      console.log('🎉 Encounter created successfully:', { 
        encounterId: encounter.id,
        createdAt: encounter.created_at
      });
      
      // Now update it with SOAP data and transcript
      const savedEncounter = await phiFetch(`/encounters/${encounter.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          soap: soapData,
          transcript_text: sessionData.transcript || sessionData.transcription || '',
          status: 'draft'
        })
      });
      
      if (!savedEncounter || !savedEncounter.id) {
        throw new Error('Failed to update encounter with SOAP data');
      }
      console.log('✅ Encounter updated with SOAP data:', {
        encounterId: savedEncounter.id,
        hasSoap: !!savedEncounter.soap,
        hasTranscript: !!savedEncounter.transcript_text,
        soapStructure: savedEncounter.soap ? Object.keys(savedEncounter.soap) : [],
        soapDataPreview: JSON.stringify(savedEncounter.soap).substring(0, 300)
      });
      
      // Convert back to session format for compatibility
      const savedSession = {
        id: savedEncounter.id,
        body_region: savedEncounter.template_type,
        session_type: 'evaluation',
        session_title: savedEncounter.session_title,
        soap_note: savedEncounter.soap,
        transcript: savedEncounter.transcript_text,
        status: savedEncounter.status,
        created_at: savedEncounter.created_at,
        updated_at: savedEncounter.updated_at
      };
      
      // Update local state
      await fetchSessionsByDate();
      toast.success('Session saved successfully');
      return savedSession;
    } catch (err) {
      console.error('❌ Error saving session:', err);
      setError('Failed to save session. Please try again.');
      toast.error('Could not save session: ' + (err.message || 'Unknown error'));
      return null;
    } finally {
      setIsLoading(false);
      console.log('🔄 Session save operation completed');
    }
  };
  
  // Update an existing session
  const updateSession = async (sessionId, updatedData) => {
    setIsLoading(true);
    setError(null);
    
    logInfo('Session Update', 'Updating session', { 
      sessionId,
      updatedFields: Object.keys(updatedData)
    });
    
    try {
      // Get current session to check for template_id
      const { data: currentSession, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Prepare SOAP data
      const soapData = updates.soap || updates.soap_note || {
        subjective: updates.subjective || '',
        objective: updates.objective || '',
        assessment: updates.assessment || '',
        plan: updates.plan || ''
      };
      
      // Update via PHI API
      const response = await phiFetch(`/encounters/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          soap: soapData,
          transcript_text: updates.transcript || updates.transcript_text || '',
          status: updates.status || 'draft'
        })
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update encounter');
      }
      
      const updatedEncounter = response.data;
      
      // Convert back to session format
      const updatedSession = {
        id: updatedEncounter.id,
        body_region: updatedEncounter.template_type,
        session_type: 'evaluation',
        session_title: updatedEncounter.session_title,
        soap_note: updatedEncounter.soap,
        transcript: updatedEncounter.transcript_text,
        status: updatedEncounter.status,
        created_at: updatedEncounter.created_at,
        updated_at: updatedEncounter.updated_at
      };
      
      // Update local state
      await fetchSessionsByDate();
      toast.success('Session updated successfully');
      return updatedSession;
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session. Please try again.');
      toast.error('Could not update session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a session
  const deleteSession = async (sessionId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
      
      if (error) throw error;
      
      // Update local state
      setSessions(sessions.filter(session => session.id !== sessionId));
      toast.success('Session deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete session. Please try again.');
      toast.error('Could not delete session');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get a single session by ID
  const getSession = async (sessionId) => {
    try {
      const response = await phiFetch(`/encounters/${sessionId}`);
      
      if (!response.success && !response.id) {
        throw new Error('Encounter not found');
      }
      
      // Handle both response formats (with/without success wrapper)
      const encounter = response.data || response;
      
      // Convert to session format
      const session = {
        id: encounter.id,
        body_region: encounter.template_type,
        session_type: 'evaluation',
        session_title: encounter.session_title,
        soap_note: encounter.soap,
        structured_notes: encounter.soap, // For compatibility
        transcript: encounter.transcript_text,
        status: encounter.status,
        created_at: encounter.created_at,
        updated_at: encounter.updated_at
      };
      
      return session;
    } catch (err) {
      console.error('Error fetching session:', err);
      throw err;
    }
  };
  
  // Update the current sort option and resort sessions
  const updateSortOption = (option) => {
    setSortOption(option);
    setSessions(sortSessions([...sessions], option));
  };
  
  // Helper function to sort sessions based on the current sort option
  const sortSessions = (sessionsToSort, option) => {
    if (!sessionsToSort) return [];
    
    switch (option) {
      case 'newest':
        return [...sessionsToSort].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at));
      
      case 'oldest':
        return [...sessionsToSort].sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at));
      
      case 'bodyRegion':
        return [...sessionsToSort].sort((a, b) => 
          a.body_region.localeCompare(b.body_region));
      
      case 'sessionType':
        return [...sessionsToSort].sort((a, b) => 
          a.session_type.localeCompare(b.session_type));
      
      default:
        return sessionsToSort;
    }
  };
  
  // Load sessions on first render
  useEffect(() => {
    fetchSessionsByDate();
  }, [fetchSessionsByDate]);
  
  return {
    sessions,
    isLoading,
    error,
    sortOption,
    fetchSessionsByDate,
    saveSession,
    updateSession,
    deleteSession,
    getSession,
    updateSortOption
  };
}
