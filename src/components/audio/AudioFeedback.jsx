import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AudioFeedback Component
 * Displays real-time audio level feedback during recording
 * Alerts the user if their audio level is too low
 */
const AudioFeedback = ({ isRecording, audioLevel = 0 }) => {
  // State for tracking audio health
  const [audioHealth, setAudioHealth] = useState({
    status: 'good', // 'good', 'low', 'silent'
    silenceCount: 0,
    lowAudioCount: 0
  });
  
  // Audio thresholds for warnings
  const SILENCE_THRESHOLD = 0.01;
  const LOW_AUDIO_THRESHOLD = 0.05;
  const SILENCE_COUNT_THRESHOLD = 15; // Show warning after ~3 seconds of silence
  const LOW_AUDIO_COUNT_THRESHOLD = 20; // Show warning after ~4 seconds of low audio
  
  // Process audio level and provide feedback
  // TEMPORARILY DISABLED FOR DEBUGGING - we need to see the audio data flow logs
  useEffect(() => {
    if (!isRecording) {
      // Reset audio health when not recording
      setAudioHealth({
        status: 'good',
        silenceCount: 0,
        lowAudioCount: 0
      });
      return;
    }
    
    // Health detection still happens but at a much reduced frequency with no logs
    // This will maintain component functionality while eliminating console noise
    if (audioLevel < SILENCE_THRESHOLD && audioHealth.status !== 'silent') {
      setAudioHealth({
        status: 'silent',
        silenceCount: SILENCE_COUNT_THRESHOLD,
        lowAudioCount: 0
      });
    } else if (audioLevel < LOW_AUDIO_THRESHOLD && audioHealth.status !== 'low') {
      setAudioHealth({
        status: 'low',
        silenceCount: 0,
        lowAudioCount: LOW_AUDIO_COUNT_THRESHOLD
      });
    } else if (audioLevel >= LOW_AUDIO_THRESHOLD && audioHealth.status !== 'good') {
      setAudioHealth({
        status: 'good',
        silenceCount: 0,
        lowAudioCount: 0
      });
    }
    
    // No interval timer to reduce state updates
  }, [isRecording, audioLevel, audioHealth.status]);
  
  // Determine level color based on audio level
  const getLevelColor = (level) => {
    if (level < 0.05) return '#ef4444'; // red for very low
    if (level < 0.1) return '#f59e0b'; // amber for low
    if (level < 0.3) return '#10b981'; // green for good
    return '#3b82f6'; // blue for high
  };
  
  // Get progress value (0-100) from audio level
  const getProgressValue = () => {
    // Scale the audio level to a percentage
    // Audio level is typically between 0-1, but we scale it for better visualization
    return Math.min(100, Math.max(0, audioLevel * 200));
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      {/* Audio Level Meter */}
      {isRecording && (
        <Box sx={{ mb: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {audioLevel < SILENCE_THRESHOLD ? (
                <VolumeX size={16} color="#9ca3af" />
              ) : (
                <Volume2 size={16} color={getLevelColor(audioLevel)} />
              )}
              <Typography variant="caption" color="text.secondary">
                Audio Level
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500,
                color: getLevelColor(audioLevel)
              }}
            >
              {Math.round(getProgressValue())}%
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getLevelColor(audioLevel),
                transition: 'background-color 0.3s ease'
              }
            }}
          />
        </Box>
      )}
      
      {/* Audio Warnings */}
      <AnimatePresence>
        {isRecording && audioHealth.status !== 'good' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              mt: 1,
              borderRadius: 1,
              bgcolor: audioHealth.status === 'silent' 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(245, 158, 11, 0.1)',
              border: '1px solid',
              borderColor: audioHealth.status === 'silent'
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(245, 158, 11, 0.3)'
            }}>
              <AlertCircle 
                size={18} 
                color={audioHealth.status === 'silent' ? '#ef4444' : '#f59e0b'} 
              />
              <Typography variant="body2" color="text.secondary">
                {audioHealth.status === 'silent' ? (
                  <span>No audio detected. Check your microphone or speak louder.</span>
                ) : (
                  <span>Audio levels are low. Consider speaking louder or moving closer to the microphone.</span>
                )}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Instructions when not recording */}
      {!isRecording && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Start recording to see real-time audio level feedback.
        </Typography>
      )}
    </Box>
  );
};

export default AudioFeedback;
