import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

/**
 * ProcessingIndicator Component
 * Displays an animated loading state with progress steps
 * while the AI processes the recording
 */
const ProcessingIndicator = () => {
  // Processing steps
  const steps = [
    { id: 'transcribing', label: 'Transcribing audio recording', delay: 0 },
    { id: 'analyzing', label: 'Analyzing transcription content', delay: 2000 },
    { id: 'generating', label: 'Generating SOAP note sections', delay: 4000 },
    { id: 'formatting', label: 'Formatting professional note', delay: 6000 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center"
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* AI processing animation */}
        <Box
          sx={{
            position: 'relative',
            width: 140,
            height: 140,
            mb: 4
          }}
        >
          {/* Outer pulse */}
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 0.5, 0.7]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              backdropFilter: 'blur(4px)',
              zIndex: 1
            }}
          />
          
          {/* Inner circle */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(29, 78, 216, 0.25)',
              zIndex: 2
            }}
          >
            <Zap size={36} color="white" />
          </Box>
          
          {/* Rotating progress */}
          <Box
            component={motion.div}
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            sx={{
              position: 'absolute',
              top: 5,
              left: 5,
              width: 130,
              height: 130,
              zIndex: 3
            }}
          >
            <CircularProgress
              variant="indeterminate"
              size={130}
              thickness={2}
              sx={{
                color: 'rgba(37, 99, 235, 0.7)',
              }}
            />
          </Box>
        </Box>
        
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Processing Recording
        </Typography>
        
        <Typography variant="body2" color="text.secondary" mb={4}>
          Our AI is working to transcribe and analyze your recording. 
          This typically takes less than a minute to complete.
        </Typography>
        
        {/* Progress steps */}
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay / 1000, duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  mb: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    mr: 2
                  }}
                >
                  {index + 1}
                </Box>
                <Typography variant="body2">
                  {step.label}
                </Typography>
                
                <Box sx={{ ml: 'auto' }}>
                  <CircularProgress 
                    size={16} 
                    sx={{ color: 'primary.main' }} 
                  />
                </Box>
              </Paper>
            </motion.div>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

export default ProcessingIndicator;
