import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SetupForm from '@/components/recording/SetupForm';
import ProcessingIndicator from '@/components/recording/ProcessingIndicator';
import useTemplates from '@/hooks/useTemplates';
import useSessions from '@/hooks/useSessions';
import * as aiService from '@/services/ai';
import { motion } from 'framer-motion';

// Import SimpleAudioRecorder dynamically with SSR disabled
// This prevents issues with browser APIs during server-side rendering
const SimpleAudioRecorder = dynamic(
  () => import('@/components/recording/SimpleAudioRecorder'),
  { ssr: false }
);

/**
 * Recording Page
 * A dedicated page for audio recording, transcription, and SOAP note generation
 * Uses modular components for different aspects of the recording process
 */
const RecordPage = () => {
  // Router for navigation
  const router = useRouter();
  
  // Recording workflow state
  const [step, setStep] = useState('setup'); // setup, recording, processing
  const [selectedBodyRegion, setSelectedBodyRegion] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [aiInitialized, setAiInitialized] = useState(false);
  const [aiProcessingError, setAiProcessingError] = useState(null);
  const [autoSelectTemplate, setAutoSelectTemplate] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  
  // Audio recording state
  const [audioData, setAudioData] = useState(null);
  
  // Hooks
  const templates = useTemplates();
  const { saveSession } = useSessions();
  
  // Initialize AI service with API key from environment variables
  const initializeAIService = () => {
    if (aiInitialized) return true;
    
    // Get API key from Next.js environment variables
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      setAiProcessingError('OpenAI API key not found. Please add your API key to the .env.local file.');
      toast.error('API key configuration error');
      return false;
    }
    
    try {
      // Initialize AI service with API key
      aiService.initializeAI(apiKey);
      setAiInitialized(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      setAiProcessingError('Failed to initialize AI service. Please check your API key.');
      toast.error('AI service initialization failed');
      return false;
    }
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
    console.log('🔄 RecordPage: Starting recording completion process');
    console.log('RecordPage received recordingData:', {
      hasBlob: !!recordingData.blob,
      blobSize: recordingData.blob?.size,
      blobType: recordingData.blob?.type,
      duration: recordingData.duration,
      templateSelected: !!templates.selectedTemplate,
      templateName: templates.selectedTemplate?.name
    });
    setStep('processing');
    setAiProcessingError(null);
    toast.loading('Processing recording...');
    
    // Store audio data for processing
    setAudioData(recordingData);
    
    // Make sure AI service is initialized
    if (!aiInitialized && !initializeAIService()) {
      console.error('🔄 RecordPage: AI service initialization failed');
      toast.dismiss();
      toast.error('AI service initialization failed');
      router.push('/sessions');
      return;
    }
    
    try {
      // Get the audio blob from the recording data
      const { blob: audioBlob, duration } = recordingData;
      
      console.log('RecordPage extracted audioBlob:', {
        blobExists: !!audioBlob,
        blobSize: audioBlob?.size,
        blobType: audioBlob?.type
      });
      
      if (!audioBlob) {
        throw new Error('No audio recording found. Please try recording again.');
      }
      
      // Get the selected template data
      const templateData = templates.selectedTemplate;
      
      if (!templateData) {
        throw new Error('No template selected');
      }
      
      // Process the recording using AI service
      console.log('RecordPage calling AI service with:', {
        audioBlob: !!audioBlob,
        audioBlobSize: audioBlob?.size,
        templateData: !!templateData,
        templateName: templateData?.name,
        bodyRegion: selectedBodyRegion,
        sessionType: selectedSessionType
      });
      
      const result = await aiService.processRecordingToSOAP(
        audioBlob,
        templateData,
        {
          bodyRegion: selectedBodyRegion,
          sessionType: selectedSessionType
        }
      );
      
      console.log('RecordPage received result from AI service:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process recording');
      }
      
      console.log('RecordPage received successful result from AI service:', {
        hasTranscription: !!result.transcription,
        transcriptionLength: result.transcription?.length,
        hasSoapNote: !!result.soapNote
      });
      
      // Save session to database
      const sessionData = {
        bodyRegion: selectedBodyRegion,
        sessionType: selectedSessionType,
        transcription: result.transcription || '',
        soapNote: result.soapNote,
        duration: duration || 0,
        // Do not store audio data in the database - privacy by design
      };
      
      console.log('RecordPage saving session to database:', {
        bodyRegion: selectedBodyRegion,
        sessionType: selectedSessionType,
        transcriptionLength: (result.transcription || '').length,
        hasSoapNote: !!result.soapNote,
        duration: duration || 0
      });
      
      await saveSession(sessionData);
      
      toast.dismiss();
      toast.success('Session recorded and saved successfully');
      
      // Navigate to sessions page
      router.push('/sessions');
    } catch (err) {
      console.error('🔴 RecordPage: Error processing recording:', err);
      setAiProcessingError(err.message);
      toast.dismiss();
      toast.error(err.message || 'Failed to process recording');
      
      // Still navigate to sessions page after a short delay
      setTimeout(() => {
        router.push('/sessions');
      }, 2000);
    }
  };
  

  
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
              {step === 'complete' && 'Recording Complete'}
            </h1>
            <p className="text-blue-100 mt-1">
              {step === 'setup' && 'Select body region and session type to begin'}
              {step === 'recording' && 'Speak clearly into your microphone'}
              {step === 'processing' && 'Generating SOAP note from your recording'}
              {step === 'complete' && 'Review your transcription and SOAP note'}
            </p>
          </div>
          
          {/* Content area */}
          <div className="p-6">
            {/* Setup step */}
            {step === 'setup' && (
              <SetupForm
                bodyRegion={selectedBodyRegion}
                setBodyRegion={setSelectedBodyRegion}
                sessionType={selectedSessionType}
                setSessionType={setSelectedSessionType}
                autoSelectTemplate={autoSelectTemplate}
                setAutoSelectTemplate={setAutoSelectTemplate}
                selectedTemplateId={selectedTemplateId}
                setSelectedTemplateId={setSelectedTemplateId}
                templates={templates}
                onComplete={handleSetupComplete}
              />
            )}
            
            {/* Recording step */}
            {step === 'recording' && (
              <div>
                <div className="mb-4">
                  <h3 className="font-medium text-lg mb-2">
                    {selectedBodyRegion.charAt(0).toUpperCase() + selectedBodyRegion.slice(1)} - 
                    {selectedSessionType.charAt(0).toUpperCase() + selectedSessionType.slice(1)}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Speak clearly about your session. Include subjective findings, objective measurements, your assessment, and treatment plan.
                  </p>
                </div>
                
                <SimpleAudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                />
              </div>
            )}
            
            {/* Processing step */}
            {step === 'processing' && (
              <ProcessingIndicator />
            )}
            

          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default RecordPage;
