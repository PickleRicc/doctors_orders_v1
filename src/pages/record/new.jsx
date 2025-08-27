/**
 * New Recording Page
 * Modern recording interface with template selection using the new template hook system
 * Replaces old template database system with clean, code-based approach
 * Follows glassmorphism design system with Notion-inspired UX
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Play, Pause, Square, Sparkles, ArrowRight } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TemplateSelector from '../../components/ui/TemplateSelector';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import { createAIService } from '../../services/structuredAI';
import { transcribeAudio } from '../../services/transcriptionService';
import { useAuth } from '../../hooks/useAuth';
import useSessions from '../../hooks/useSessions';

const NewRecordingPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { createSession } = useSessions();
  
  // State management
  const [selectedTemplate, setSelectedTemplate] = useState('knee');
  const [step, setStep] = useState(1); // 1: Template Selection, 2: Recording, 3: Processing
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Template manager
  const templateManager = useTemplateManager(selectedTemplate);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && isRecording) {
      if (isPaused) {
        mediaRecorder.resume();
        setIsPaused(false);
      } else {
        mediaRecorder.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      setMediaRecorder(null);
    }
  };

  const processRecording = async () => {
    if (!audioBlob) {
      alert('No recording found. Please record audio first.');
      return;
    }

    setIsProcessing(true);
    setStep(3);

    try {
      // Step 1: Transcribe audio
      setProcessingStep('Transcribing audio...');
      const transcriptionResult = await transcribeAudio(audioBlob);
      setTranscript(transcriptionResult.text);

      // Step 2: Generate SOAP note
      setProcessingStep('Generating SOAP note...');
      const aiService = createAIService();
      const soapResult = await templateManager.generateSOAP(transcriptionResult.text, aiService);

      if (!soapResult.success) {
        throw new Error(soapResult.error || 'SOAP generation failed');
      }

      // Step 3: Create session
      setProcessingStep('Saving session...');
      const sessionData = {
        template_type: selectedTemplate,
        body_region: selectedTemplate,
        session_type: 'evaluation',
        transcript: transcriptionResult.text,
        structured_notes: soapResult.data,
        audio_url: null, // We could upload the audio blob if needed
        status: 'completed'
      };

      const newSession = await createSession(sessionData);

      // Navigate to SOAP editor
      router.push(`/soap/generate?sessionId=${newSession.id}&templateType=${selectedTemplate}`);

    } catch (error) {
      console.error('Processing failed:', error);
      alert(`Processing failed: ${error.message}`);
      setIsProcessing(false);
      setStep(2); // Go back to recording step
    }
  };

  const handleTemplateChange = (templateType) => {
    setSelectedTemplate(templateType);
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBackStep = () => {
    if (step === 2 && !isRecording) {
      setStep(1);
    } else if (step === 1) {
      router.push('/dashboard');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-white via-grey-50 to-blue-light/20">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-30 bg-white/80 backdrop-blur-20 border-b border-white/30"
          >
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackStep}
                    disabled={isRecording}
                    className="p-2 bg-white/25 backdrop-blur-8 border border-white/20 rounded-lg hover:bg-white/35 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold text-grey-900">New Session</h1>
                    <p className="text-grey-600">
                      {step === 1 && 'Choose evaluation template'}
                      {step === 2 && 'Record patient session'}
                      {step === 3 && 'Processing recording...'}
                    </p>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((stepNum) => (
                    <div
                      key={stepNum}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                        ${step >= stepNum 
                          ? 'bg-blue-primary text-white' 
                          : 'bg-white/25 backdrop-blur-8 border border-white/20 text-grey-500'
                        }
                      `}
                    >
                      {stepNum}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-6 py-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Template Selection */}
              {step === 1 && (
                <motion.div
                  key="template-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold text-grey-900 mb-4">
                      Choose Evaluation Template
                    </h2>
                    <p className="text-grey-600 max-w-2xl mx-auto">
                      Select the body region you'll be evaluating. Our AI will use specialized prompts 
                      and assessments tailored to your chosen area.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <TemplateSelector
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={handleTemplateChange}
                      showSuggestion={false}
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleNextStep}
                      className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-primary to-purple-600 text-white rounded-xl hover:from-blue-dark hover:to-purple-700 transition-all shadow-lg"
                    >
                      <span className="font-medium">Continue to Recording</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Recording */}
              {step === 2 && (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold text-grey-900 mb-4">
                      Record Patient Session
                    </h2>
                    <p className="text-grey-600 max-w-2xl mx-auto">
                      Record your patient evaluation session. Speak naturally about your findings, 
                      tests performed, and treatment plan.
                    </p>
                  </div>

                  {/* Recording Interface */}
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-2xl p-8 text-center">
                      {/* Recording Status */}
                      <div className="mb-8">
                        {isRecording && (
                          <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-lg font-medium text-red-500">
                              {isPaused ? 'Paused' : 'Recording'}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-4xl font-mono font-bold text-grey-900 mb-2">
                          {formatTime(recordingTime)}
                        </div>
                        
                        {audioBlob && !isRecording && (
                          <div className="text-green-600 font-medium">
                            Recording completed
                          </div>
                        )}
                      </div>

                      {/* Recording Controls */}
                      <div className="flex items-center justify-center gap-4">
                        {!isRecording ? (
                          <button
                            onClick={startRecording}
                            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <Mic className="w-6 h-6" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={pauseRecording}
                              className="w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </button>
                            
                            <button
                              onClick={stopRecording}
                              className="w-12 h-12 bg-grey-600 hover:bg-grey-700 text-white rounded-full flex items-center justify-center transition-colors"
                            >
                              <Square className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Process Button */}
                      {audioBlob && !isRecording && (
                        <div className="mt-8">
                          <button
                            onClick={processRecording}
                            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-primary to-purple-600 text-white rounded-xl hover:from-blue-dark hover:to-purple-700 transition-all shadow-lg mx-auto"
                          >
                            <Sparkles className="w-5 h-5" />
                            <span className="font-medium">Generate SOAP Note</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Processing */}
              {step === 3 && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-3xl font-semibold text-grey-900 mb-4">
                      Processing Recording
                    </h2>
                    <p className="text-grey-600 max-w-2xl mx-auto">
                      Our AI is analyzing your recording and generating a professional SOAP note. 
                      This usually takes 30-60 seconds.
                    </p>
                  </div>

                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-2xl p-8 text-center">
                      <div className="w-16 h-16 bg-blue-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-blue-primary animate-pulse" />
                      </div>
                      
                      <div className="text-xl font-medium text-grey-900 mb-2">
                        {processingStep || 'Processing...'}
                      </div>
                      
                      <div className="w-full bg-grey-200 rounded-full h-2 mb-4">
                        <div className="bg-gradient-to-r from-blue-primary to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                      
                      <p className="text-grey-600">
                        Please wait while we create your SOAP note...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default NewRecordingPage;
