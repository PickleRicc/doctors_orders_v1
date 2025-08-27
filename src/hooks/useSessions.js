import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
      // Query Supabase for sessions on the given date
      console.log('📡 Sending query to Supabase...');
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .gte('created_at', `${formattedDate}T00:00:00`)
        .lte('created_at', `${formattedDate}T23:59:59`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase error fetching sessions:', error);
        throw error;
      }
      
      console.log(`✅ Received ${data?.length || 0} sessions from Supabase`, {
        sessionIds: data?.map(s => s.id) || [],
        firstSession: data?.[0] ? {
          id: data[0].id,
          bodyRegion: data[0].body_region,
          sessionType: data[0].session_type,
          hasSoapNote: !!data[0].soap_note,
          createdAt: data[0].created_at
        } : 'No sessions found'
      });
      
      // Process each session to add structured data if available
      const processedSessions = [];
      for (const session of data || []) {
        if (session.template_id) {
          logInfo('Session Processing', 'Session has a template, fetching template data', { 
            sessionId: session.id, 
            templateId: session.template_id 
          });
          
          const template = await fetchTemplate(session.template_id);
          if (template && template.structured_data) {
            const enhancedSession = enhanceSessionWithTemplate(session, template, session.transcript || '');
            processedSessions.push(enhancedSession);
          } else {
            processedSessions.push(session);
          }
        } else {
          processedSessions.push(session);
        }
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
  
  // Save a new session to the database
  const saveSession = async (sessionData) => {
    setIsLoading(true);
    setError(null);
    logAIProcess('SAVE_SESSION', 'Starting session save process', {
      bodyRegion: sessionData.bodyRegion,
      sessionType: sessionData.sessionType,
      hasTemplate: !!sessionData.templateId
    });
    
    console.log('🔵 Starting session save operation:', {
      bodyRegion: sessionData.bodyRegion,
      sessionType: sessionData.sessionType,
      hasSoapNote: !!sessionData.soapNote,
      soapNoteLength: sessionData.soapNote ? JSON.stringify(sessionData.soapNote).length : 0,
      transcriptionLength: sessionData.transcription ? sessionData.transcription.length : 0,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Validate required fields - check for both camelCase and snake_case fields
      // to support different formats from different parts of the application
      const bodyRegion = sessionData.bodyRegion || sessionData.body_region;
      const sessionType = sessionData.sessionType || sessionData.session_type;
      const hasSoapData = !!(sessionData.soapNote || 
                         (sessionData.subjective && sessionData.objective && 
                          sessionData.assessment && sessionData.plan));
      
      // Log the session data structure to help with debugging
      console.log('Session data structure:', {
        hasBodyRegion: !!bodyRegion,
        hasSessionType: !!sessionType,
        hasSoapData,
        fieldNames: Object.keys(sessionData).join(', ')
      });
      
      if (!bodyRegion || !sessionType || !hasSoapData) {
        const missingFields = [];
        if (!bodyRegion) missingFields.push('body_region');
        if (!sessionType) missingFields.push('session_type');
        if (!hasSoapData) missingFields.push('SOAP note data');
        
        console.error('❌ Validation failed - missing fields:', missingFields);
        throw new Error(`Missing required session data: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ Validation passed, preparing to save to Supabase');
      
      if (!user || !user.id) {
        console.error('❌ No authenticated user found when trying to save session');
        throw new Error('You must be logged in to save a session');
      }

      // Handle template type (new system) or legacy template_id
      let validatedTemplateId = null;
      const templateType = sessionData.template_type || sessionData.templateType || bodyRegion;
      
      // Legacy template ID handling (for backward compatibility during transition)
      const templateId = sessionData.templateId || sessionData.template_id;
      if (templateId) {
        try {
          const template = await fetchTemplate(templateId);
          if (template) {
            validatedTemplateId = template.id;
            logInfo('Session Save', 'Legacy template fetched for session', { 
              templateId: validatedTemplateId, 
              templateName: template.name
            });
          }
        } catch (templateError) {
          console.warn('⚠️ Legacy template fetch failed, using template_type instead:', templateError);
        }
      }
      
      // Construct the session object for the database
      const sessionToSave = {
        user_id: user.id, // Add the authenticated user's ID for RLS policy
        body_region: bodyRegion, // Use the validated field
        session_type: sessionType, // Use the validated field
        template_type: templateType, // New template system
        // Split SOAP note into individual fields as per DB schema
        subjective: sessionData.subjective || sessionData.soapNote?.subjective || '',
        objective: sessionData.objective || sessionData.soapNote?.objective || '',
        assessment: sessionData.assessment || sessionData.soapNote?.assessment || '',
        plan: sessionData.plan || sessionData.soapNote?.plan || '',
        transcript: sessionData.transcript || sessionData.transcription || '', // Handle both field names
        audio_url: sessionData.audio_url || sessionData.audioUrl || null, // Handle both field names
        template_id: validatedTemplateId, // Legacy template ID (nullable for transition)
        session_number: sessionData.session_number || sessionData.sessionNumber || 1, // Required field in schema
        structured_notes: sessionData.structured_notes || sessionData.soapNote?.structured_data || null // New structured data
      };
      
      // Log structured data (we can't save it yet without a migration)
      const structuredData = sessionData.structured_data || sessionData.soapNote?.structured_data;
      if (structuredData) {
        console.log('📑 Structured data available (not saving to DB yet):', {
          hasRom: !!structuredData?.objective?.rom,
          hasMmt: !!structuredData?.objective?.mmt,
          dataSize: JSON.stringify(structuredData).length
        });
      }
      
      console.log('📦 Saving session data to Supabase:', {
        body_region: sessionToSave.body_region,
        session_type: sessionToSave.session_type,
        subjective_preview: sessionToSave.subjective?.substring(0, 20) + '...',
        objective_preview: sessionToSave.objective?.substring(0, 20) + '...',
        assessment_preview: sessionToSave.assessment?.substring(0, 20) + '...',
        plan_preview: sessionToSave.plan?.substring(0, 20) + '...',
        transcript_length: sessionToSave.transcript.length,
      });
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionToSave])
        .select();
      
      if (error) {
        console.error('❌ Supabase error saving session:', error);
        throw error;
      }
      
      console.log('🎉 Session saved successfully to Supabase:', { 
        sessionId: data[0].id,
        createdAt: data[0].created_at,
        templateId: data[0].template_id
      });
      
      // Enhance the saved session with template structured data if available
      let savedSession = data[0];
      if (template && template.structured_data) {
        savedSession = enhanceSessionWithTemplate(savedSession, template, savedSession.transcript || '');
        logAIProcess('SESSION_ENHANCEMENT', 'Enhanced new session with template data', {
          sessionId: savedSession.id,
          hasStructuredData: true
        });
      }
      
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
      
      // Update in Supabase
      const { data, error } = await supabase
        .from('sessions')
        .update(updatedData)
        .eq('id', sessionId)
        .select();
      
      if (error) throw error;
      
      // If session has a template, re-enhance with structured data
      let updatedSession = data[0];
      if (updatedSession.template_id) {
        const template = await fetchTemplate(updatedSession.template_id);
        if (template && template.structured_data) {
          updatedSession = enhanceSessionWithTemplate(updatedSession, template, updatedSession.transcript || '');
          logAIProcess('SESSION_UPDATE', 'Re-enhanced session with template data after update', {
            sessionId: updatedSession.id,
            hasStructuredData: true
          });
        }
      }
      
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
    updateSortOption
  };
}
