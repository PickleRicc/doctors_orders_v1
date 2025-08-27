import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import logging from '@/utils/logging';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProcessingIndicator from '@/components/recording/ProcessingIndicator';
import SOAPEditor from '@/components/soap/SOAPEditor';
import { useTemplateManager } from '@/hooks/templates/useTemplateManager';
import { createAIService } from '@/services/structuredAI';
import { initializeAI, isAIInitialized } from '@/services/aiClient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

// DEVELOPMENT ONLY: Import test transcription data
// TODO: REMOVE BEFORE PRODUCTION
import { sampleTranscriptions } from '@/utils/testData';

// Import SimpleAudioRecorder dynamically with SSR disabled
// This prevents issues with browser APIs during server-side rendering
const SimpleAudioRecorder = dynamic(
  () => import('@/components/recording/SimpleAudioRecorder'),
  { ssr: false }
);

// Destructure logging functions for use throughout this component
const { logInfo, logWarning, logError, logAIProcess } = logging;

/**
 * Convert template structured data format to ObjectiveDataChart compatible format
 * Template format has variables like {{hip_flexion}}, UI expects actual values
 */
function convertToUIFormat(templateStructuredData) {
  if (!templateStructuredData?.objective) {
    return templateStructuredData;
  }

  const converted = { ...templateStructuredData };
  const objective = templateStructuredData.objective;

  // Convert ROM data from template format to UI format
  if (objective.rom) {
    const convertedRom = {};
    Object.entries(objective.rom).forEach(([movement, data]) => {
      if (data && typeof data === 'object') {
        convertedRom[movement] = {
          r_value: data.value || data.r_value || null,
          l_value: data.value || data.l_value || null,
          r_symptoms: data.symptoms || data.r_symptoms || null,
          l_symptoms: data.symptoms || data.l_symptoms || null,
          normal: data.normal || null
        };
      }
    });
    converted.objective.rom = convertedRom;
  }

  // Convert MMT data from template format to UI format  
  if (objective.mmt) {
    const convertedMmt = {};
    Object.entries(objective.mmt).forEach(([muscle, data]) => {
      if (data && typeof data === 'object') {
        convertedMmt[muscle] = {
          r_grade: data.grade || data.r_grade || null,
          l_grade: data.grade || data.l_grade || null,
          r_pain: data.pain || data.r_pain || false,
          l_pain: data.pain || data.l_pain || false
        };
      }
    });
    converted.objective.mmt = convertedMmt;
  }

  // Special tests and observations should already be in correct format
  if (objective.special_tests && typeof objective.special_tests === 'object') {
    converted.objective.special_tests = objective.special_tests;
  }

  if (objective.observations && Array.isArray(objective.observations)) {
    converted.objective.observations = objective.observations;
  }

  return converted;
}

/**
 * Recording Page
 * A dedicated page for audio recording, transcription, and SOAP note generation
 * Uses modular components for different aspects of the recording process
 */
const RecordPage = () => {
  // Router for navigation
  const router = useRouter();
  
  // Recording workflow state
  const [step, setStep] = useState('setup'); // setup, recording, processing, editing
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [aiInitialized, setAiInitialized] = useState(false);
  const [aiProcessingError, setAiProcessingError] = useState(null);
  const [aiService, setAiService] = useState(null);
  
  // Audio recording state
  const [audioData, setAudioData] = useState(null);
  const [transcription, setTranscription] = useState('');
  
  // Generated SOAP data
  const [generatedSOAP, setGeneratedSOAP] = useState(null);
  
  // DEVELOPMENT ONLY: Testing states to bypass recording
  // TODO: REMOVE BEFORE PRODUCTION
  const [devMode, setDevMode] = useState(false);
  const [selectedTestTranscript, setSelectedTestTranscript] = useState('');
  const [customTestTranscript, setCustomTestTranscript] = useState('');
  
  // Hooks
  const { getAvailableTemplates, getTemplateHook, generateSOAP, switchTemplate } = useTemplateManager();
  const { user } = useAuth();
  
  // Initialize AI service with API key from environment variables
  const initializeAIService = async () => {
    if (aiInitialized && aiService) return true;
    
    try {
      // Get API key from environment variables
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.');
      }
      
      // Initialize AI client with API key
      await initializeAI(apiKey);
      
      if (!isAIInitialized()) {
        throw new Error('AI client initialization failed');
      }
      
      // Create AI service instance
      const service = createAIService();
      setAiService(service);
      setAiInitialized(true);
      setAiProcessingError(null);
      
      logInfo('AI service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      setAiProcessingError(`Failed to initialize AI service: ${error.message}`);
      toast.error('AI service initialization failed');
      return false;
    }
  };
  
  // When the user confirms the template selection, move to recording step
  const handleTemplateSelect = (templateType) => {
    setSelectedTemplate(templateType);
    
    logInfo('RecordPage', 'Template selected', { 
      templateType,
      availableTemplates: getAvailableTemplates()
    });
    
    setStep('recording');
  };
  
  // Handle setup completion and move to recording step
  const handleSetupComplete = () => {
    if (!selectedBodyRegion || !selectedSessionType) {
      return; // Require body region and session type selections
    }
    
    // Handle template selection based on user choice
    if (autoSelectTemplate) {
      // Auto-select template based on body region and session type
      templates.selectTemplateByBodyRegionAndType(selectedBodyRegion, selectedSessionType);
    } else {
      // Use manually selected template if available
      if (selectedTemplateId) {
        templates.selectTemplateById(selectedTemplateId);
      } else {
        // If no template manually selected, fall back to auto-selection
        templates.selectTemplateByBodyRegionAndType(selectedBodyRegion, selectedSessionType);
        // Show toast notification about the fallback
        toast.info('No template selected. Using best match based on selections.');
      }
    }
    
    // Initialize AI service before starting recording
    initializeAIService();
    
    setStep('recording');
  };
  
  // Process recording when complete
  const handleRecordingComplete = async (recordingData) => {
    const { audioBlob, duration, transcription } = recordingData;
    
    if (!transcription) {
      toast.error('No transcription available. Please try recording again.');
      return;
    }
    
    // Set processing step
    setStep('processing');
    setTranscription(transcription);
    
    try {
      // Store audio data for potential future use
      setAudioData(audioBlob);
      
      logAIProcess('RECORDING_COMPLETE', 'Starting recording processing', {
        selectedTemplate,
        recordingDuration: duration,
        hasTranscription: !!transcription,
        transcriptionLength: transcription.length
      });
      
      // Make sure AI service is initialized
      if (!aiInitialized && !await initializeAIService()) {
        logError('RecordPage', 'AI service initialization failed');
        toast.error('AI service is not available.');
        setStep('recording'); // Go back to recording step
        return;
      }
      
      logAIProcess('AI_PROCESSING', 'AI service initialized and ready');
      
      // Generate SOAP note using the new template hook system
      if (!selectedTemplate) {
        throw new Error('No template selected');
      }
      
      // Switch to the selected template first
      switchTemplate(selectedTemplate);
      
      logAIProcess('SOAP_GENERATION', 'Starting SOAP generation', {
        templateType: selectedTemplate,
        transcriptionLength: transcription.length
      });
      
      // Use the new template hook system to generate SOAP
      const result = await generateSOAP(transcription, aiService);
      
      if (!result.success) {
        throw new Error(result.error || 'SOAP generation failed');
      }
      
      logAIProcess('SOAP_GENERATION_SUCCESS', 'SOAP generation completed', {
        templateType: selectedTemplate,
        hasData: !!result.soapData,
        confidence: result.confidence?.overall || 0
      });
      
      // Store the generated SOAP data
      setGeneratedSOAP(result);
      
      // Move to editing step
      setStep('editing');
      
      toast.success('SOAP note generated successfully!');
      
    } catch (error) {
      console.error('Recording processing failed:', error);
      logError('RecordPage', 'Recording processing failed', { error: error.message });
      
      toast.error(`Failed to process recording: ${error.message}`);
      setStep('recording'); // Go back to recording step
      setAiProcessingError(error.message);
    }
  };

  // Initialize AI service on component mount
  useEffect(() => {
    initializeAIService();
  }, []);
  

  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] p-6">
            <h1 className="text-2xl font-semibold text-white">
              {step === 'setup' && 'New Recording Session'}
              {step === 'recording' && 'Recording In Progress'}
              {step === 'processing' && 'Processing Recording'}
              {step === 'editing' && 'Edit SOAP Note'}
              {step === 'complete' && 'Recording Complete'}
            </h1>
            <p className="text-blue-100 mt-1">
              {step === 'setup' && 'Select template type to begin'}
              {step === 'recording' && 'Speak clearly into your microphone'}
              {step === 'processing' && 'Generating SOAP note from your recording'}
              {step === 'editing' && 'Review and edit your generated SOAP note'}
              {step === 'complete' && 'Review your transcription and SOAP note'}
            </p>
          </div>
          
          {/* Content area */}
          <div className="p-6">
            {/* DEVELOPMENT ONLY: Testing mode toggle */}
            {/* TODO: REMOVE BEFORE PRODUCTION */}
            {process.env.NODE_ENV === 'development' && step === 'setup' && (
              <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Development Only</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={devMode}
                      onChange={() => setDevMode(!devMode)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-amber-800">Enable Testing Mode</span>
                  </label>
                </div>
                {devMode && (
                  <p className="mt-2 text-xs text-amber-700">
                    Testing mode enabled. Recording step will be replaced with a transcript input form.
                  </p>
                )}
              </div>
            )}
            {/* Setup step */}
            {step === 'setup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-grey-900 mb-4">Select Template Type</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getAvailableTemplates().map((template) => (
                      <button
                        key={template.key}
                        onClick={() => handleTemplateSelect(template.key)}
                        className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                          selectedTemplate === template.key
                            ? 'border-blue-primary bg-blue-light text-blue-primary'
                            : 'border-grey-100 hover:border-blue-primary hover:bg-blue-light/50'
                        }`}
                      >
                        <div className="font-medium capitalize">
                          {template.name || template.key.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-grey-500 mt-1">
                          {template.description || `${template.key.replace('_', ' ')} evaluation and treatment`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Service Status */}
                <div className="flex items-center justify-between p-4 bg-grey-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${aiInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      AI Service: {aiInitialized ? 'Ready' : 'Not Ready'}
                    </span>
                  </div>
                  {aiProcessingError && (
                    <div className="text-sm text-red-600">
                      {aiProcessingError}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Recording step */}
            {step === 'recording' && (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium text-lg mb-2 capitalize">
                    {selectedTemplate?.replace('_', ' ')} Evaluation
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Speak clearly about your session. Include subjective findings, objective measurements, your assessment, and treatment plan.
                  </p>
                </div>
                
                {/* DEVELOPMENT ONLY: Dev mode toggle */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <span className="text-sm font-medium text-amber-800">Development Mode</span>
                      <p className="text-xs text-amber-600 mt-1">Use test transcripts instead of recording</p>
                    </div>
                    <button
                      onClick={() => setDevMode(!devMode)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        devMode 
                          ? 'bg-amber-600 text-white' 
                          : 'bg-white text-amber-600 border border-amber-300'
                      }`}
                    >
                      {devMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}
                
                {/* DEVELOPMENT ONLY: Testing interface to bypass recording */}
                {/* TODO: REMOVE BEFORE PRODUCTION */}
                {process.env.NODE_ENV === 'development' && devMode ? (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-blue-800">Development Testing Mode</h3>
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">Dev Only</span>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Select Test Transcription
                      </label>
                      <select
                        value={selectedTestTranscript}
                        onChange={(e) => {
                          setSelectedTestTranscript(e.target.value);
                          if (e.target.value) {
                            setCustomTestTranscript(sampleTranscriptions[e.target.value] || '');
                          }
                        }}
                        className="w-full p-2 border border-blue-300 rounded text-sm"
                      >
                        <option value="">-- Select a sample --</option>
                        {Object.keys(sampleTranscriptions).map(key => (
                          <option key={key} value={key}>
                            {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Test Transcription Content
                      </label>
                      <textarea
                        value={customTestTranscript}
                        onChange={(e) => setCustomTestTranscript(e.target.value)}
                        className="w-full h-32 text-sm border border-blue-300 rounded p-2"
                        placeholder="Enter or edit test transcription here..."
                      />
                    </div>
                    
                    <button
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition duration-200"
                      onClick={() => {
                        if (!customTestTranscript.trim()) {
                          toast.error('Please enter test transcription content');
                          return;
                        }
                        setStep('processing');
                        
                        // Use the mock recording data with our test transcript
                        // DEVELOPMENT ONLY: Directly trigger processing without actual recording
                        // TODO: REMOVE BEFORE PRODUCTION
                        handleRecordingComplete({
                          transcription: customTestTranscript,
                          duration: 120, // Mock 2-minute duration
                          mock: true // Flag to indicate this is test data
                        });
                      }}
                    >
                      Test with This Transcription
                    </button>
                  </div>
                ) : (
                  <SimpleAudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                  />
                )}
              </div>
            )}
            
            {/* Processing step */}
            {step === 'processing' && (
              <ProcessingIndicator />
            )}
            
            {/* Editing step */}
            {step === 'editing' && generatedSOAP && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-grey-900">Generated SOAP Note</h3>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-grey-500">
                      Confidence: {Math.round((generatedSOAP.confidence?.overall || 0) * 100)}%
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      (generatedSOAP.confidence?.overall || 0) > 0.8 ? 'bg-green-500' : 
                      (generatedSOAP.confidence?.overall || 0) > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                </div>
                
                <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg">
                  <SOAPEditor
                    soapData={generatedSOAP.soapData}
                    onSoapChange={(data) => {
                      setGeneratedSOAP(prev => ({
                        ...prev,
                        soapData: data
                      }));
                    }}
                    onSave={async (data) => {
                      try {
                        // Save to database or handle save logic here
                        console.log('Saving SOAP data:', data);
                        toast.success('SOAP note saved successfully!');
                      } catch (error) {
                        console.error('Save failed:', error);
                        toast.error('Failed to save SOAP note');
                      }
                    }}
                    onExport={(data, format) => {
                      console.log('Exporting SOAP data:', format, data);
                      toast.success(`SOAP note exported as ${format.toUpperCase()}`);
                    }}
                    confidenceScores={generatedSOAP.confidence}
                    isLoading={false}
                  />
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep('recording')}
                    className="px-4 py-2 text-grey-600 hover:text-grey-800 transition-colors"
                  >
                    ← Back to Recording
                  </button>
                  <div className="space-x-3">
                    <button
                      onClick={() => {
                        toast.success('Session completed successfully!');
                        router.push('/sessions');
                      }}
                      className="px-6 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-dark transition-colors"
                    >
                      Complete Session
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default RecordPage;
