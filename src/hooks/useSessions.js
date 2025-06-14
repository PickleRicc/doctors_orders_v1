import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from './useAuth';

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
      
      // Apply current sort option
      const sortedSessions = sortSessions(data, sortOption);
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
    
    console.log('🔵 Starting session save operation:', {
      bodyRegion: sessionData.bodyRegion,
      sessionType: sessionData.sessionType,
      hasSoapNote: !!sessionData.soapNote,
      soapNoteLength: sessionData.soapNote ? JSON.stringify(sessionData.soapNote).length : 0,
      transcriptionLength: sessionData.transcription ? sessionData.transcription.length : 0,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Validate required fields
      if (!sessionData.bodyRegion || !sessionData.sessionType || !sessionData.soapNote) {
        const missingFields = [];
        if (!sessionData.bodyRegion) missingFields.push('bodyRegion');
        if (!sessionData.sessionType) missingFields.push('sessionType');
        if (!sessionData.soapNote) missingFields.push('soapNote');
        
        console.error('❌ Validation failed - missing fields:', missingFields);
        throw new Error(`Missing required session data: ${missingFields.join(', ')}`);
      }
      
      console.log('✅ Validation passed, preparing to save to Supabase');
      
      if (!user || !user.id) {
        console.error('❌ No authenticated user found when trying to save session');
        throw new Error('You must be logged in to save a session');
      }

      // Insert into Supabase - schema has individual fields for SOAP sections
      const sessionToSave = {
        user_id: user.id, // Add the authenticated user's ID for RLS policy
        body_region: sessionData.bodyRegion,
        session_type: sessionData.sessionType,
        // Split SOAP note into individual fields as per DB schema
        subjective: sessionData.soapNote?.subjective || '',
        objective: sessionData.soapNote?.objective || '',
        assessment: sessionData.soapNote?.assessment || '',
        plan: sessionData.soapNote?.plan || '',
        transcript: sessionData.transcription || '', // Note: schema uses transcript, not transcription
        audio_url: sessionData.audioUrl || null,
        // The sessions table doesn't have a duration column
        session_number: 1, // Required field in schema
      };
      
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
      });
      
      // Update local state
      await fetchSessionsByDate();
      toast.success('Session saved successfully');
      return data[0];
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
    
    try {
      // Update in Supabase
      const { data, error } = await supabase
        .from('sessions')
        .update(updatedData)
        .eq('id', sessionId)
        .select();
      
      if (error) throw error;
      
      // Update local state
      await fetchSessionsByDate();
      toast.success('Session updated successfully');
      return data[0];
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
