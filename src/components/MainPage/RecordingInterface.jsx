/**
 * RecordingInterface - Recording controls and waveform
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useAppState, APP_STATES } from './StateManager';
import { transcribeAudio } from '../../services/transcriptionService';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import { createAIService } from '../../services/structuredAI';

export default function RecordingInterface() {
  const { appState, selectedTemplate, startRecording, stopRecording, finishProcessing, sessionName, setSessionName, triggerRefresh } = useAppState();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showNameInput, setShowNameInput] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const templateManager = useTemplateManager(selectedTemplate || 'knee');

  // Show recording button only when template is selected
  const showRecordButton = appState === APP_STATES.TEMPLATE_SELECTED;
  const showStopButton = appState === APP_STATES.RECORDING;
  const showProcessing = appState === APP_STATES.PROCESSING;

  useEffect(() => {
    if (isRecording) {
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
  }, [isRecording]);

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
      setRecordingTime(0);
      startRecording();
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      
      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('🎤 Microphone Access Denied\n\nPlease allow microphone access in your browser settings and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('🎤 No Microphone Found\n\nPlease connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert('🎤 Microphone In Use\n\nYour microphone may be in use by another application. Please close other apps and try again.');
      } else {
        alert(`🎤 Recording Error\n\n${error.message}\n\nPlease check your microphone and try again.`);
      }
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
      console.log('🤖 Initializing AI service...');
      const aiService = createAIService();
      console.log('✅ AI service initialized');
      
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
      const saveResponse = await fetch('/api/phi/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const updateResponse = await fetch('/api/phi/encounters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartRecording}
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-shadow"
              style={{
                background: 'radial-gradient(circle at 30% 30%, #5AC8FA, #007AFF)'
              }}
            >
              <Mic className="w-10 h-10 text-white" />
            </motion.button>
            <p className="mt-4 text-grey-600 font-medium">Click to start recording</p>
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
            <div className="text-4xl font-mono font-bold text-grey-900">
              {formatTime(recordingTime)}
            </div>

            {/* Waveform Placeholder */}
            <div className="flex items-center justify-center gap-1 h-16">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: [20, Math.random() * 60 + 20, 20],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                  className="w-1 rounded-full"
                  style={{ backgroundColor: '#007AFF' }}
                />
              ))}
            </div>

            {/* Stop Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStopRecording}
              className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <Square className="w-8 h-8 text-white fill-white" />
            </motion.button>
            <p className="text-grey-600 font-medium">Recording...</p>
          </motion.div>
        )}

        {/* Session Name Input */}
        {showNameInput && (
          <motion.div
            key="name-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/80 backdrop-blur-12 rounded-2xl p-8 border border-grey-200 shadow-xl"
          >
            <h3 className="text-xl font-semibold text-grey-900 mb-4">Name this session</h3>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g., John D. - Initial Eval"
              className="w-full px-4 py-3 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-primary focus:border-transparent mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitSession()}
            />
            <p className="text-sm text-grey-500 mb-4">
              Note: Do not include patient identifiable information
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNameInput(false);
                  setAudioBlob(null);
                  setRecordingTime(0);
                  window.location.reload(); // Reset to template selection
                }}
                className="flex-1 px-4 py-2 border border-grey-300 rounded-lg hover:bg-grey-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSession}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#007AFF' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0051D5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007AFF'}
              >
                Generate SOAP Note
              </button>
            </div>
          </motion.div>
        )}

        {/* Processing */}
        {showProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <Loader2 className="w-12 h-12 mx-auto animate-spin mb-4" style={{ color: '#007AFF' }} />
            <p className="text-grey-600 font-medium">{processingStatus || 'Processing...'}</p>
            <p className="text-sm text-grey-500 mt-2">This may take a few moments</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
