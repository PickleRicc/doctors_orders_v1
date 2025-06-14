import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, StopCircle } from 'lucide-react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * SimpleAudioRecorder Component
 * A simplified, reliable audio recorder based on the proven SimpleRecorder test
 * Uses native MediaRecorder API directly to ensure reliable audio capture
 */
const SimpleAudioRecorder = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  // Refs for audio processing
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const microphoneRef = useRef(null); // Reference for the microphone source node
  const animationRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  // Format time as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Separate function to check if audio visualization is working
  const isAudioVisualizationWorking = useRef(false);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    try {
      if (!analyserRef.current) {
        console.log('Analyzer not initialized, skipping monitoring loop');
        return;
      }
      
      // Always monitor audio levels, even when not recording
      // This ensures visualization works without needing pause/resume

      // Get frequency data from analyzer
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Check if we're getting real data (not all zeros)
      const hasData = dataArray.some(value => value > 0);
      // TEMPORARILY DISABLED for debugging
      // if (!hasData) {
      //   console.log('No audio data detected, possibly not initialized correctly');
      // }

      // Calculate RMS (Root Mean Square) for more accurate volume detection
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      
      // Convert to percentage with better scaling
      const normalizedLevel = Math.min(100, Math.max(0, (rms / 128) * 100 * 2));
      
      // TEMPORARILY DISABLED for debugging
      // console.log('Audio level:', normalizedLevel, 'RMS:', rms, 'Raw data present:', hasData);
      setAudioLevel(normalizedLevel);
    } catch (error) {
      console.error('Error in monitorAudioLevel:', error);
    }
    
    // Continue monitoring while recording
    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  }, [isRecording]);

  // Audio level monitoring can now work independently of recording state
  useEffect(() => {
    // Request microphone access and set up audio context when component mounts
    setupAudioContext();
    
    return () => {
      // Clean up on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => {
          console.warn('Error closing audio context:', err);
        });
      }
    };
  }, []);
  
  // Request microphone access and setup audio context
  const setupAudioContext = async () => {
    try {
      console.log('Setting up audio context...');
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
      
      // Create new audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;
      
      // Create and configure analyzer
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyserRef.current = analyser;
      
      // Connect the media stream to the analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      microphoneRef.current = source;
      
      // Start monitoring immediately
      monitorAudioLevel();
      
      console.log('Audio context setup complete');
      return true;
    } catch (err) {
      console.error('Error setting up audio context:', err);
      setError(`Microphone access error: ${err.message}`);
      return false;
    }
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      // Ensure audio context is set up
      if (!streamRef.current) {
        const success = await setupAudioContext();
        if (!success) {
          throw new Error('Could not initialize audio');
        }
      }
      
      // Set up MediaRecorder
      const options = { mimeType: 'audio/webm' }; 
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      // Set up MediaRecorder event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Reset recording state
        setIsRecording(false);
        setIsPaused(false);
        
        // Create audio blob from chunks
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Update state with new audio
        setAudioUrl(audioUrl);
        console.log('MediaRecorder stopped');
      };
      
      // Audio context should already be initialized
      // Just update recording state
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
        setRecordingDuration(Math.floor(elapsed / 1000));
      }, 1000);
      
      setIsRecording(true);
      setIsPaused(false);
      
      // Start recording
      mediaRecorder.start(1000);
      
      // Start monitoring with progressive retry mechanism
      const startMonitoring = () => {
        if (analyserRef.current) {
          console.log('Starting audio monitoring with analyzer');
          monitorAudioLevel();
        } else {
          console.log('Analyzer not ready, retrying soon...');
        }
      };
      
      // Try multiple times with increasing delays to account for initialization time
      setTimeout(startMonitoring, 100);
      setTimeout(startMonitoring, 500);
      setTimeout(startMonitoring, 1000);
      
      // WORKAROUND: Automatically trigger a fake pause/resume cycle after initialization
      // This resolves the issue where audio monitoring doesn't work until after a pause/resume
      setTimeout(() => {
        console.log('Executing automatic pause/resume cycle to kickstart audio monitoring');
        // Briefly pause and immediately resume to trigger the audio flow
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.pause();
          // Resume after a very short delay
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
              mediaRecorderRef.current.resume();
              console.log('Auto-resumed recording to initialize audio flow');
              // Make sure we're monitoring
              monitorAudioLevel();
            }
          }, 50); // Very short pause
        }
      }, 1500); // Give enough time for initial setup
      
      toast.success('Recording started');
      
      // Show guidance toast about visualization after a short delay
      setTimeout(() => {
        toast('Tip: If audio bars are not moving, press pause and resume once to activate visualization.', {
          duration: 6000,
          id: 'visualization-tip',
          icon: 'ℹ️'
        });
      }, 2500);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message);
      toast.error(`Microphone error: ${err.message}`);
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    if (isPaused) {
      // Resume recording
      const pauseDuration = Date.now() - pausedTimeRef.current;
      pausedTimeRef.current += pauseDuration;
      
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Make sure audio context is resumed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('Audio context resumed on recording resume');
        });
      }
      
      toast.success('Recording resumed');
    } else {
      // Pause recording
      pausedTimeRef.current = Date.now();
      
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      toast.success('Recording paused');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    // Stop the recorder
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach(track => track.stop());
    
    // Clear intervals and animations
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Create audio blob and URL
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    
    // Update state
    setAudioUrl(url);
    setIsRecording(false);
    setIsPaused(false);
    
    toast.success('Recording stopped');
    
    return {
      blob: audioBlob,
      url: url,
      duration: recordingDuration
    };
  };

  // Handle complete button click
  const handleComplete = () => {
    if (!audioUrl) {
      toast.error('No recording available');
      return;
    }
    
    console.log('SimpleAudioRecorder - Preparing recording data:', {
      chunksCount: chunksRef.current.length,
      totalSize: chunksRef.current.reduce((size, chunk) => size + chunk.size, 0),
      firstChunkType: chunksRef.current[0]?.type,
      recordingDuration
    });
    
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
    
    console.log('SimpleAudioRecorder - Created audioBlob:', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      blobIsValid: audioBlob.size > 0
    });
    
    // Call the onRecordingComplete callback with recording data
    onRecordingComplete({
      blob: audioBlob,
      url: audioUrl,
      duration: recordingDuration
    });
    
    console.log('SimpleAudioRecorder - Called onRecordingComplete with data');
    
    // Reset for next recording
    resetRecording();
  };

  // Reset recording state
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioUrl(null);
    setRecordingDuration(0);
    setAudioLevel(0);
    chunksRef.current = [];
  };

  // Initialize audio context on mount and clean up on unmount
  useEffect(() => {
    // Setup audio context as soon as component mounts
    setupAudioContext();
    
    // Clean up on unmount
    return () => {
      // Stop all monitoring
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Stop media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Close audio context
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
          }
        } catch (err) {
          console.warn('Error closing audio context:', err);
        }
      }
      
      // Clean up URL objects
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Clear timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Render recording button based on state
  const renderRecordButton = () => {
    if (!isRecording) {
      return (
        <Button
          variant="contained"
          color="error"
          onClick={startRecording}
          startIcon={<Mic />}
          sx={{ mx: 1 }}
        >
          Start Recording
        </Button>
      );
    }
    
    if (isPaused) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={togglePause}
          startIcon={<Play />}
          sx={{ mx: 1 }}
        >
          Resume
        </Button>
      );
    }
    
    return (
      <Button
        variant="contained"
        color="warning"
        onClick={togglePause}
        startIcon={<Pause />}
        sx={{ mx: 1 }}
      >
        Pause
      </Button>
    );
  };

  return (
    <Box>
      {/* Status indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Paper
          elevation={0}
          sx={{ 
            py: 1, 
            px: 3, 
            borderRadius: 3,
            display: 'inline-flex',
            alignItems: 'center',
            bgcolor: isRecording && !isPaused ? 'rgba(244, 67, 54, 0.1)' : 'background.paper'
          }}
        >
          {isRecording && !isPaused && (
            <motion.div
              animate={{ opacity: [1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              style={{ marginRight: 8, display: 'flex' }}
            >
              <Mic color="error" size={20} />
            </motion.div>
          )}
          
          <Typography variant="body1" fontWeight={500}>
            {!isRecording ? 'Ready to Record' : 
             isRecording && !isPaused ? 'Recording' :
             isPaused ? 'Paused' : 'Recorded'}
            {(isRecording || recordingDuration > 0) && 
              ` — ${formatDuration(recordingDuration)}`
            }
          </Typography>
        </Paper>
      </Box>
      
      {/* Audio Level Indicator */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ width: '100%', mb: 1, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" component="div">
            {formatDuration(recordingDuration)}
          </Typography>
        </Box>
        
        {isRecording && audioLevel === 0 && (
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ mb: 1, fontStyle: 'italic', textAlign: 'center' }}
          >
            No audio detected. Try pause/resume to activate visualization.
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Audio Level
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(audioLevel)}%
          </Typography>
        </Box>
        <Box sx={{ 
          width: '100%', 
          height: '8px', 
          bgcolor: 'rgba(0,0,0,0.05)', 
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <Box 
            sx={{
              height: '100%',
              bgcolor: audioLevel > 70 ? 'error.main' : 
                      audioLevel > 30 ? 'success.main' : 
                      audioLevel > 5 ? 'primary.main' : 'grey.400',
              transition: 'width 0.1s, background-color 0.3s',
              borderRadius: 1
            }}
            style={{ width: `${Math.max(2, audioLevel)}%` }}
          />
        </Box>
        {audioLevel < 5 && isRecording && !isPaused && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Try speaking louder or moving closer to the microphone
          </Typography>
        )}
      </Box>
      
      {/* Voice Visualization */}
      {isRecording && !isPaused && audioLevel > 0 && (
        <Box sx={{ mb: 4, height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: 10 }).map((_, i) => {
            // Create dynamic heights based on audio level and position
            const frequency = (i + 1) / 10;
            const baseHeight = Math.max(0.1, audioLevel / 100);
            const frequencyMultiplier = 1 - Math.abs(0.5 - frequency) * 1.2;
            const height = baseHeight * frequencyMultiplier * 60;
            
            return (
              <Box
                key={i}
                sx={{
                  width: '5px',
                  mx: '3px',
                  height: `${Math.max(4, Math.min(60, height))}px`,
                  bgcolor: audioLevel > 60 ? 'error.main' : 
                           audioLevel > 25 ? 'success.main' : 
                           audioLevel > 8 ? 'primary.main' : 'grey.300',
                  borderRadius: '2px',
                  transition: 'height 0.1s ease-in-out'
                }}
              />
            );
          })}
        </Box>
      )}
      
      {/* Recording controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        {/* Record/Pause/Resume button */}
        {renderRecordButton()}
        
        {/* Stop button (only show when recording/paused) */}
        {isRecording && (
          <Button 
            variant="outlined" 
            color="error"
            onClick={stopRecording}
            startIcon={<StopCircle />}
            sx={{ mx: 1 }}
          >
            Stop
          </Button>
        )}
      </Box>
      
      {/* Audio playback */}
      {audioUrl && !isRecording && (
        <Box sx={{ 
          mt: 3,
          pt: 3,
          pb: 2,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Recording Preview
          </Typography>
          
          <audio controls className="w-full my-2" style={{ width: '100%', marginBottom: '16px' }}>
            <source src={audioUrl} type="audio/webm" />
            Your browser does not support the audio element.
          </audio>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleComplete}
            sx={{ mb: 2 }}
          >
            Complete Recording
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={resetRecording}
          >
            New Recording
          </Button>
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default SimpleAudioRecorder;
