/**
 * SOAP Generation Page
 * Main page for generating and editing SOAP notes using the new refactored system
 * Integrates template hooks, AI generation, and the clean SOAP editor UI
 * Follows glassmorphism design system with Notion-inspired UX
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SOAPEditor from '../../components/soap/SOAPEditor';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import { createAIService, calculateConfidenceScores } from '../../services/structuredAI';
import { transcribeAudio } from '../../services/transcriptionService';
import { exportToPDF, copyToClipboard } from '../../services/exportService';
import { useAuth } from '../../hooks/useAuth';
import useSessions from '../../hooks/useSessions';

const SOAPGenerationPage = () => {
  const router = useRouter();
  const { sessionId, templateType = 'knee' } = router.query;
  const { user } = useAuth();
  const { updateSession, getSession } = useSessions();
  
  // Template manager for dynamic template loading
  const templateManager = useTemplateManager(templateType);
  
  // State management
  const [currentSession, setCurrentSession] = useState(null);
  const [soapData, setSoapData] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [confidenceScores, setConfidenceScores] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load session data on mount
  useEffect(() => {
    if (sessionId) {
      loadSession();
    } else {
      // New session - initialize with empty template
      initializeNewSession();
    }
  }, [sessionId, templateType]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const loadSession = async () => {
    try {
      const session = await getSession(sessionId);
      setCurrentSession(session);
      
      if (session.structured_notes) {
        setSoapData(session.structured_notes);
        if (session.transcript) {
          setTranscript(session.transcript);
          // Calculate confidence scores if we have both data and transcript
          const scores = calculateConfidenceScores(session.structured_notes, session.transcript);
          setConfidenceScores(scores);
        }
      } else {
        // Session exists but no SOAP data yet
        initializeNewSession();
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      initializeNewSession();
    }
  };

  const initializeNewSession = () => {
    const emptySOAP = templateManager.getEmptySOAP();
    setSoapData(emptySOAP.data);
    setConfidenceScores({});
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
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleTranscribeAndGenerate = async () => {
    if (!audioBlob) {
      alert('Please record audio first');
      return;
    }

    try {
      // Step 1: Transcribe audio
      setIsTranscribing(true);
      const transcriptionResult = await transcribeAudio(audioBlob);
      setTranscript(transcriptionResult.text);
      setIsTranscribing(false);

      // Step 2: Generate SOAP note
      setIsGenerating(true);
      const aiService = createAIService();
      const soapResult = await templateManager.generateSOAP(transcriptionResult.text, aiService);

      if (soapResult.success) {
        setSoapData(soapResult.data);
        
        // Calculate confidence scores
        const scores = calculateConfidenceScores(soapResult.data, transcriptionResult.text);
        setConfidenceScores(scores);
        
        setHasUnsavedChanges(true);
      } else {
        console.error('SOAP generation failed:', soapResult.error);
        alert('Failed to generate SOAP note. Please try again.');
      }
    } catch (error) {
      console.error('Transcription/Generation failed:', error);
      alert('Failed to process recording. Please try again.');
    } finally {
      setIsTranscribing(false);
      setIsGenerating(false);
    }
  };

  const handleSOAPChange = (newSoapData) => {
    setSoapData(newSoapData);
    setHasUnsavedChanges(true);
  };

  const handleSave = async (soapDataToSave) => {
    try {
      const sessionData = {
        structured_notes: soapDataToSave,
        transcript: transcript,
        template_type: templateType,
        status: 'completed',
        updated_at: new Date().toISOString()
      };

      if (sessionId) {
        await updateSession(sessionId, sessionData);
      } else {
        // Create new session
        const newSession = await createSession({
          ...sessionData,
          user_id: user.id,
          session_number: await getNextSessionNumber(),
          body_region: templateType,
          session_type: 'evaluation'
        });
        setCurrentSession(newSession);
        // Update URL to include session ID
        router.replace(`/soap/generate?sessionId=${newSession.id}&templateType=${templateType}`);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  };

  const handleExport = async (soapDataToExport, format) => {
    try {
      const sessionInfo = {
        sessionNumber: currentSession?.session_number,
        templateType: templateType,
        sessionDate: new Date().toLocaleDateString()
      };

      if (format === 'pdf') {
        await exportToPDF(soapDataToExport, sessionInfo);
        alert('PDF exported successfully!');
      } else if (format === 'copy') {
        await copyToClipboard(soapDataToExport, sessionInfo);
        alert('SOAP note copied to clipboard!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
      throw error;
    }
  };

  const convertSOAPToText = (soapData) => {
    let text = '';
    
    if (soapData.subjective?.content) {
      text += 'SUBJECTIVE:\n';
      text += soapData.subjective.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    if (soapData.objective?.rows?.length > 0) {
      text += 'OBJECTIVE:\n';
      soapData.objective.rows.forEach(row => {
        if (row.test || row.result || row.notes) {
          text += `${row.test || 'N/A'}: ${row.result || 'N/A'}`;
          if (row.notes) text += ` (${row.notes})`;
          text += '\n';
        }
      });
      text += '\n';
    }
    
    if (soapData.assessment?.content) {
      text += 'ASSESSMENT:\n';
      text += soapData.assessment.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    if (soapData.plan?.content) {
      text += 'PLAN:\n';
      text += soapData.plan.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    return text;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!soapData) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

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
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="p-2 bg-white/25 backdrop-blur-8 border border-white/20 rounded-lg hover:bg-white/35 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-semibold text-grey-900">
                      {templateManager.metadata?.name || 'Loading...'}
                    </h1>
                    <p className="text-grey-600">
                      {currentSession ? `Session #${currentSession.session_number}` : 'New Session'}
                    </p>
                  </div>
                </div>

                {/* Recording Controls */}
                <div className="flex items-center gap-3">
                  {!transcript && (
                    <div className="flex items-center gap-2 bg-white/25 backdrop-blur-16 border border-white/20 rounded-xl px-4 py-2">
                      {isRecording && (
                        <div className="flex items-center gap-2 text-red-500">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                        </div>
                      )}
                      
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTranscribing || isGenerating}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                          ${isRecording 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-blue-primary text-white hover:bg-blue-dark'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </button>
                    </div>
                  )}

                  {audioBlob && !transcript && (
                    <button
                      onClick={handleTranscribeAndGenerate}
                      disabled={isTranscribing || isGenerating}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-primary to-purple-600 text-white rounded-lg hover:from-blue-dark hover:to-purple-700 transition-all disabled:opacity-50"
                    >
                      {isTranscribing || isGenerating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {isTranscribing ? 'Transcribing...' : isGenerating ? 'Generating...' : 'Generate SOAP'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-6 py-8">
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-white/25 backdrop-blur-16 border border-white/20 rounded-2xl p-6"
              >
                <h3 className="text-lg font-medium text-grey-900 mb-3">Session Transcript</h3>
                <div className="text-grey-700 bg-white/20 backdrop-blur-8 rounded-lg p-4 max-h-32 overflow-y-auto">
                  {transcript}
                </div>
              </motion.div>
            )}

            <SOAPEditor
              soapData={soapData}
              onSoapChange={handleSOAPChange}
              onSave={handleSave}
              onExport={handleExport}
              isLoading={isGenerating}
              confidenceScores={confidenceScores}
            />
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SOAPGenerationPage;
