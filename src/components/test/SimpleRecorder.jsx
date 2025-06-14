import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Mic, Square, Play, Pause } from 'lucide-react';

const AudioRecordingModal = ({ isOpen, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  // Refs for audio processing
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const animationRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  // Audio visualization component
  const AudioVisualizer = ({ level }) => {
    // Use the actual audio level to drive visualization
    const bars = Array.from({ length: 20 }, (_, i) => {
      // Create frequency-based visualization
      const frequency = (i + 1) / 20; // 0.05 to 1.0
      const baseHeight = Math.max(0.05, level / 100);
      
      // Add some frequency-based variation
      const frequencyMultiplier = 1 - (frequency * 0.5); // Lower frequencies are taller
      const randomVariation = (Math.random() - 0.5) * 0.3 * (level / 100);
      
      const barHeight = (baseHeight * frequencyMultiplier) + randomVariation;
      
      return (
        <div
          key={i}
          className={`rounded-sm transition-all duration-100 ${
            level > 60 ? 'bg-red-500' : 
            level > 25 ? 'bg-green-500' : 
            level > 8 ? 'bg-blue-500' : 
            'bg-gray-300'
          }`}
          style={{
            height: `${Math.max(3, Math.min(50, barHeight * 60))}px`,
            width: '6px',
            opacity: level > 3 ? 0.7 + (level/200) : 0.3
          }}
        />
      );
    });

    return (
      <div className="flex items-end justify-center gap-1 h-16 mb-4 bg-gray-50 rounded-lg p-2">
        {bars}
        {level === 0 && isRecording && (
          <div className="absolute text-xs text-gray-400 mt-6">
            Speak into your microphone...
          </div>
        )}
      </div>
    );
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current || !isRecording) {
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for more accurate volume detection
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    
    // Convert to percentage with better scaling
    const normalizedLevel = Math.min(100, Math.max(0, (rms / 128) * 100 * 2));
    
    console.log('Audio level:', normalizedLevel, 'RMS:', rms); // Debug log
    setAudioLevel(normalizedLevel);
    
    // Continue monitoring while recording
    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  }, [isRecording]);

  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;

      // Set up audio context for visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if it's suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3; // Less smoothing for more responsive visualization
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      // Start recording and timer
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      
      // Start timer
      timerRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRecordingTime(elapsed);
        }
      }, 1000);

      // Start audio monitoring immediately after setup
      setTimeout(() => {
        console.log('Starting audio monitoring...');
        monitorAudioLevel();
      }, 200);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      // Resume recording
      if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      setIsPaused(false);
      
      // Restart timer from where we left off
      startTimeRef.current = Date.now() - (recordingTime * 1000);
      
      // Restart timer interval
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
      }, 1000);
      
      // Restart audio monitoring
      console.log('Resuming audio monitoring...');
      monitorAudioLevel();
      
    } else {
      // Pause recording
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(true);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Cancel audio monitoring
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // Keep showing last audio level briefly, then fade to 0
      setTimeout(() => {
        if (isPaused) {
          setAudioLevel(0);
        }
      }, 500);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      setAudioLevel(0);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Cancel animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      // Stop media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Reset everything
  const resetRecording = () => {
    stopRecording();
    setRecordingTime(0);
    setAudioUrl(null);
    setError(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetRecording();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Audio Recording</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Audio Visualizer */}
        <AudioVisualizer level={audioLevel} />

        {/* Recording Status */}
        <div className="text-center mb-6">
          <div className="text-2xl font-mono text-gray-800 mb-2">
            {formatTime(recordingTime)}
          </div>
          <div className="flex items-center justify-center gap-2">
            {isRecording && (
              <>
                <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                <span className="text-sm text-gray-600">
                  {isPaused ? 'Paused' : 'Recording...'}
                </span>
              </>
            )}
            {!isRecording && recordingTime > 0 && (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600">Stopped</span>
              </>
            )}
            {!isRecording && recordingTime === 0 && (
              <span className="text-sm text-gray-600">Ready to record</span>
            )}
          </div>
        </div>

        {/* Audio Level Indicator */}
        {(isRecording || audioLevel > 0) && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Audio Level</span>
              <span>{Math.round(audioLevel)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-75 ${
                  audioLevel > 70 ? 'bg-red-500' : 
                  audioLevel > 30 ? 'bg-green-500' : 
                  audioLevel > 5 ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}
                style={{ width: `${Math.max(2, audioLevel)}%` }}
              />
            </div>
            {audioLevel < 5 && isRecording && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                Try speaking louder or moving closer to the microphone
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Mic size={20} />
              Start Recording
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Square size={20} />
                Stop
              </button>
            </>
          )}
        </div>

        {/* Playback */}
        {audioUrl && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-800 mb-2">Recording Playback:</h3>
            <audio controls className="w-full mb-3">
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
            <button
              onClick={resetRecording}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
            >
              New Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Demo App
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Audio Recording Demo</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors"
        >
          Open Audio Recorder
        </button>
      </div>
      
      <AudioRecordingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default App;