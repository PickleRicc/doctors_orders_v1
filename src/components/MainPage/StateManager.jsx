/**
 * StateManager - Manages the main application state
 * States: idle, templateSelected, recording, processing, editing, viewing
 */

import { createContext, useContext, useState } from 'react';
import authService from '../../services/supabase';
import { transformCustomTemplateForEditor, isCustomTemplateFormat } from '../../utils/customTemplateTransformer';

const StateContext = createContext();

export const APP_STATES = {
  IDLE: 'idle',
  TEMPLATE_SELECTED: 'templateSelected',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  EDITING: 'editing',
  VIEWING: 'viewing'
};

export function StateProvider({ children }) {
  const [appState, setAppState] = useState(APP_STATES.IDLE);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [sessionName, setSessionName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const selectTemplate = (template) => {
    // Toggle selection - if clicking the same template, deselect it
    if (selectedTemplate === template) {
      setSelectedTemplate(null);
      setAppState(APP_STATES.IDLE);
    } else {
      setSelectedTemplate(template);
      setAppState(APP_STATES.TEMPLATE_SELECTED);
    }
  };

  const startRecording = () => {
    setAppState(APP_STATES.RECORDING);
  };

  const stopRecording = () => {
    setAppState(APP_STATES.PROCESSING);
  };

  const finishProcessing = async (note) => {
    try {
      // Check if this is a custom template
      if (note.custom_template_id && isCustomTemplateFormat(note.soap)) {
        console.log('🔄 Processing custom template data for editor...');
        
        // Fetch the custom template configuration
        const { session } = await authService.getSession();
        const accessToken = session?.access_token;
        
        if (accessToken) {
          const templateResponse = await fetch(`/api/phi/custom-templates?id=${note.custom_template_id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          
          if (templateResponse.ok) {
            const templateData = await templateResponse.json();
            console.log('📄 Fetched custom template config:', templateData);
            
            // Transform the SOAP data for the editor
            const transformedSOAP = transformCustomTemplateForEditor(note.soap, templateData.template_config);
            console.log('✅ Transformed SOAP for editor:', transformedSOAP);
            
            note.soap = transformedSOAP;
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Error transforming custom template data:', error);
      // Continue with original data if transformation fails
    }
    
    setCurrentNote(note);
    setAppState(APP_STATES.EDITING);
  };

  const viewNote = async (note) => {
    try {
      // Get the auth token
      const { session } = await authService.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error('Not authenticated');
      }
      
      // Fetch full encounter data including SOAP
      const response = await fetch(`/api/phi/encounters?id=${note.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch encounter');
      }
      
      const fullNote = await response.json();
      
      console.log('📋 Loaded full encounter:', fullNote);
      
      // Check if this is a custom template and transform the data
      if (fullNote.custom_template_id && isCustomTemplateFormat(fullNote.soap)) {
        console.log('🔄 Detected custom template format, fetching template config...');
        
        try {
          const templateResponse = await fetch(`/api/phi/custom-templates?id=${fullNote.custom_template_id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          
          if (templateResponse.ok) {
            const templateData = await templateResponse.json();
            console.log('📄 Fetched custom template config:', templateData);
            
            // Transform the SOAP data for the editor
            const transformedSOAP = transformCustomTemplateForEditor(fullNote.soap, templateData.template_config);
            console.log('✅ Transformed SOAP for editor:', transformedSOAP);
            
            fullNote.soap = transformedSOAP;
          }
        } catch (transformError) {
          console.error('⚠️ Error transforming custom template data:', transformError);
          // Continue with original data if transformation fails
        }
      }
      
      setCurrentNote(fullNote);
      setSelectedTemplate(fullNote.template_type);
      setSessionName(fullNote.session_title || '');
      setAppState(APP_STATES.VIEWING);
    } catch (error) {
      console.error('Error loading note:', error);
      alert('Failed to load note');
    }
  };

  const createNewNote = () => {
    setSelectedTemplate(null);
    setCurrentNote(null);
    setSessionName('');
    setAppState(APP_STATES.IDLE);
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const updateCurrentNote = (updatedNote) => {
    setCurrentNote(updatedNote);
  };

  const value = {
    appState,
    selectedTemplate,
    currentNote,
    sessionName,
    refreshTrigger,
    setSessionName,
    selectTemplate,
    startRecording,
    stopRecording,
    finishProcessing,
    viewNote,
    createNewNote,
    triggerRefresh,
    updateCurrentNote
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within StateProvider');
  }
  return context;
}
