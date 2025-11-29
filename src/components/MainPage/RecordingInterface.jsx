/**
 * RecordingInterface - Recording controls and waveform
 * Supports both PT and Chiropractic templates with profession-aware AI generation
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, Pause, Play } from 'lucide-react';
import { useAppState, APP_STATES } from './StateManager';
import { transcribeAudio } from '../../services/transcriptionService';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import { useProfession, PROFESSIONS } from '../../hooks/useProfession';
import { createAIService } from '../../services/structuredAI';
import { authenticatedFetch } from '../../lib/authHeaders';
import GenerationProgress from '../recording/GenerationProgress';
import MagneticButton from '../ui/MagneticButton';

export default function RecordingInterface() {
  const { appState, selectedTemplate, startRecording, stopRecording, finishProcessing, sessionName, setSessionName, triggerRefresh } = useAppState();
  const { profession } = useProfession();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Get default template based on profession
  const getDefaultTemplate = () => {
    return profession === PROFESSIONS.CHIROPRACTIC ? 'cervical-adjustment' : 'knee';
  };
  
  // Pass profession to template manager for proper custom template handling
  const templateManager = useTemplateManager(selectedTemplate || getDefaultTemplate(), profession);

  // Show recording button only when template is selected
  const showRecordButton = appState === APP_STATES.TEMPLATE_SELECTED;
  const showStopButton = appState === APP_STATES.RECORDING;
  const showProcessing = appState === APP_STATES.PROCESSING;

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        // Validate audio blob has content
        if (audioBlob.size === 0) {
          console.error('❌ Audio blob is empty');
          alert('⚠️ Recording Failed\n\nNo audio was captured. Please try again and ensure your microphone is working.');
          setAudioBlob(null);
          return;
        }

        console.log('✅ Audio recorded successfully:', {
          size: audioBlob.size,
          type: audioBlob.type
        });

        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setShowNameInput(true);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      startRecording();
      console.log('🎤 Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      console.log('⏸️ Recording paused');
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      console.log('▶️ Recording resumed');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopRecording();
    }
  };

  const handleSubmitSession = async () => {
    if (!sessionName.trim()) {
      alert('Please enter a session name');
      return;
    }

    if (!audioBlob) {
      alert('No audio recording found');
      return;
    }

    try {
      setShowNameInput(false);
      setProcessingStatus('Initializing AI service...');

      // Step 0: Initialize AI service first (needed for both transcription and SOAP generation)
      // Pass profession for profession-aware system prompts
      console.log('🤖 Initializing AI service for profession:', profession);
      const aiService = createAIService(profession);
      console.log('✅ AI service initialized with profession:', profession);

      setProcessingStatus('Transcribing audio...');

      console.log('🎤 Starting transcription...', {
        audioSize: audioBlob.size,
        templateType: selectedTemplate
      });

      // Step 1: Transcribe audio
      const transcript = await transcribeAudio(audioBlob);
      console.log('✅ Transcription complete:', transcript.substring(0, 200) + '...');

      // Validate transcript has sufficient content
      if (!transcript || transcript.trim().length < 20) {
        throw new Error('Insufficient audio content. Please record a longer session with clear speech.');
      }

      console.log('📊 Transcript validation:', {
        length: transcript.length,
        wordCount: transcript.split(/\s+/).length,
        preview: transcript.substring(0, 100)
      });

      setProcessingStatus('Generating SOAP note...');

      // Step 2: Generate SOAP using template manager (aiService already initialized above)
      console.log('📝 Generating SOAP with template manager...', {
        templateType: selectedTemplate,
        transcriptLength: transcript.length
      });

      const soapResult = await templateManager.generateSOAP(transcript, aiService);

      if (!soapResult.success) {
        throw new Error(soapResult.error || 'SOAP generation failed');
      }

      console.log('✅ SOAP generated successfully');

      setProcessingStatus('Saving to database...');

      // Step 3: Save to Azure PostgreSQL
      const saveResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'POST',
        body: JSON.stringify({
          templateType: selectedTemplate,
          sessionTitle: sessionName
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save encounter to database');
      }

      const encounter = await saveResponse.json();

      // Step 4: Update with SOAP data
      const updateResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'PUT',
        body: JSON.stringify({
          id: encounter.id,
          soap: soapResult.data,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update encounter with SOAP data');
      }

      const updatedEncounter = await updateResponse.json();

      console.log('✅ Encounter saved to Azure:', updatedEncounter);

      // Step 5: Finish processing and show in editor
      finishProcessing(updatedEncounter);
      triggerRefresh(); // Refresh sidebar
      setRecordingTime(0);
      setAudioBlob(null);
      setProcessingStatus('');

    } catch (error) {
      console.error('❌ Error processing recording:', error);

      // Categorize errors and provide appropriate feedback
      const errorMessage = error.message || 'Unknown error occurred';

      // Check if it's an insufficient audio error
      if (errorMessage.includes('Insufficient audio') ||
        errorMessage.includes('no speech detected') ||
        errorMessage.includes('Empty transcription')) {
        alert('⚠️ No speech detected in recording\n\nPlease record again and speak clearly into the microphone.');

        // Reset to template selection
        setShowNameInput(false);
        setAudioBlob(null);
        setRecordingTime(0);
        setProcessingStatus('');

        // Navigate back to template selection
        window.location.reload(); // Simple reload to reset state
        return;
      }

      // Check if it's an API/network error
      if (errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('API') ||
        errorMessage.includes('fetch')) {
        alert('🌐 Network Error\n\nUnable to connect to AI services. Please check your internet connection and try again.');
        setProcessingStatus('');
        setShowNameInput(true);
        return;
      }

      // Check if it's an AI initialization error
      if (errorMessage.includes('not initialized') ||
        errorMessage.includes('API key')) {
        alert('⚙️ Configuration Error\n\nAI service is not properly configured. Please contact support.');
        setProcessingStatus('');
        setShowNameInput(true);
        return;
      }

      // Generic error
      alert(`❌ Processing Failed\n\n${errorMessage}\n\nPlease try recording again.`);
      setProcessingStatus('');
      setShowNameInput(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {/* Start Recording Button */}
        {showRecordButton && (
          <motion.div
            key="start-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <MagneticButton
              onClick={handleStartRecording}
              className="mx-auto w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)] transition-shadow bg-gradient-to-br from-blue-600 to-indigo-700"
            >
              <Mic className="w-10 h-10 text-white" />
            </MagneticButton>
            <p className="mt-6 text-gray-600 dark:text-gray-300 font-medium text-lg">Click to start recording</p>
          </motion.div>
        )}

        {/* Recording in Progress */}
        {showStopButton && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            {/* Timer */}
            <div className="text-4xl font-mono font-bold text-grey-900 dark:text-grey-100">
              {formatTime(recordingTime)}
            </div>

            {/* Waveform Placeholder - Enhanced */}
            <div className="flex items-center justify-center gap-1.5 h-24">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isPaused ? [24, 24, 24] : [24, Math.random() * 80 + 24, 24],
                    opacity: isPaused ? 0.5 : 1
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    delay: i * 0.03,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                />
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              {/* Pause/Resume Button */}
              {!isPaused ? (
                <MagneticButton
                  onClick={handlePauseRecording}
                  className="w-16 h-16 bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800/70"
                  title="Pause recording"
                >
                  <Pause className="w-6 h-6 text-white fill-white" />
                </MagneticButton>
              ) : (
                <MagneticButton
                  onClick={handleResumeRecording}
                  className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-500"
                  title="Resume recording"
                >
                  <Play className="w-6 h-6 text-white fill-white" />
                </MagneticButton>
              )}

              {/* Stop Button */}
              <MagneticButton
                onClick={handleStopRecording}
                className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 shadow-red-500/30"
                title="Stop recording"
              >
                <Square className="w-8 h-8 text-white fill-white" />
              </MagneticButton>
            </div>
            <p className="text-grey-600 dark:text-grey-400 font-medium">{isPaused ? 'Paused' : 'Recording...'}</p>
          </motion.div>
        )}

        {/* Session Name Input */}
        {showNameInput && (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 border border-grey-200 dark:border-white/10 shadow-xl transition-colors"
          >
            <h3 className="text-xl font-semibold text-grey-900 dark:text-grey-100 mb-4">Name this session</h3>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., John D. - Initial Eval"
              className="w-full px-4 py-3 bg-white dark:bg-[#1f1f1f] border border-grey-200 dark:border-white/15 rounded-lg text-grey-900 dark:text-grey-100 placeholder-grey-500 dark:placeholder-grey-400 focus:outline-none mb-4 transition-colors"
              onFocus={(e) => {
                e.target.style.borderColor = 'rgb(var(--blue-primary-rgb))';
                e.target.style.boxShadow = `0 0 0 3px rgba(var(--blue-primary-rgb), 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmitSession();
                } else if (e.key === 'Escape') {
                  setShowCancelConfirm(true);
                }
              }}
            />
            <p className="text-sm text-grey-500 dark:text-grey-400 mb-4">
              Note: Do not include patient identifiable information
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 px-4 py-2 border border-grey-300 dark:border-grey-600 rounded-lg hover:bg-grey-50 dark:hover:bg-grey-700 text-grey-900 dark:text-grey-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSession}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
              >
                Generate SOAP Note
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing */}
        {showProcessing && (
          <GenerationProgress
            onComplete={() => {
              // Component will handle its own cleanup
            }}
          />
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Dialog */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] dark:border dark:border-white/10 rounded-xl shadow-xl max-w-md w-full p-6 transition-colors"
            >
              <h3 className="text-xl font-semibold text-grey-900 dark:text-grey-100 mb-2">Cancel Recording?</h3>
              <p className="text-grey-600 dark:text-grey-300 mb-6">
                Your recording will be lost. Are you sure you want to cancel?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 border border-grey-300 dark:border-white/15 rounded-lg hover:bg-grey-50 dark:hover:bg-[#1f1f1f] text-grey-900 dark:text-grey-100 transition-colors"
                >
                  Keep Recording
                </button>
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setShowNameInput(false);
                    setAudioBlob(null);
                    setRecordingTime(0);
                    window.location.reload(); // Reset to template selection
                  }}
                  className="flex-1 px-4 py-2 text-white rounded-lg transition-colors bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Cancel Recording
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
