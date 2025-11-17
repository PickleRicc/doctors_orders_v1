/**
 * BlobPlaceholder - Temporary placeholder for 3D blob (Phase 1)
 * Will be replaced with actual 3D blob in Phase 2
 */

import { motion } from 'framer-motion';
import { useAppState, APP_STATES } from './StateManager';

// Helper to get CSS variable color value
const getCSSColor = (varName) => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#007AFF';
  }
  return '#007AFF';
};

const TEMPLATE_COLORS = {
  knee: () => getCSSColor('--blue-primary'),
  shoulder: '#5856D6',
  back: '#34C759',
  hip: '#FF9500',
  'ankle-foot': '#5AC8FA',
  neck: '#FF2D55'
};

export default function BlobPlaceholder() {
  const { appState, selectedTemplate } = useAppState();

  const getColor = () => {
    if (selectedTemplate) {
      const colorValue = TEMPLATE_COLORS[selectedTemplate];
      if (colorValue) {
        return typeof colorValue === 'function' ? colorValue() : colorValue;
      }
      return getCSSColor('--blue-primary');
    }
    return getCSSColor('--blue-primary');
  };

  const getBlobState = () => {
    switch (appState) {
      case APP_STATES.IDLE:
        return { scale: 1, opacity: 0.6, rotate: 0 };
      case APP_STATES.TEMPLATE_SELECTED:
        return { scale: 1.1, opacity: 0.8, rotate: 0 };
      case APP_STATES.RECORDING:
        return { scale: [1, 1.2, 1], opacity: 1, rotate: 0 };
      case APP_STATES.PROCESSING:
        return { scale: 1, opacity: 0.9, rotate: 360 };
      default:
        return { scale: 1, opacity: 0.6, rotate: 0 };
    }
  };

  const state = getBlobState();

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Placeholder Blob */}
      <motion.div
        animate={state}
        transition={{
          scale: {
            duration: appState === APP_STATES.RECORDING ? 1 : 2,
            repeat: appState === APP_STATES.RECORDING ? Infinity : 0,
            ease: 'easeInOut'
          },
          rotate: {
            duration: 2,
            repeat: appState === APP_STATES.PROCESSING ? Infinity : 0,
            ease: 'linear'
          },
          opacity: { duration: 0.5 }
        }}
        className="relative"
      >
        {/* Main Blob Shape */}
        <div
          className="w-64 h-64 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${getColor()}80, ${getColor()}20)`,
          }}
        />

        {/* Inner Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute inset-0 m-auto w-32 h-32 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${getColor()}FF, transparent)`,
          }}
        />
      </motion.div>

      {/* State Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 text-center"
      >
        <p className="text-sm font-medium text-grey-600">
          {appState === APP_STATES.IDLE && 'Ready to begin'}
          {appState === APP_STATES.TEMPLATE_SELECTED && 'Template selected'}
          {appState === APP_STATES.RECORDING && 'Recording...'}
          {appState === APP_STATES.PROCESSING && 'Processing...'}
        </p>
      </motion.div>

      {/* Placeholder Note */}
      <div className="absolute top-4 right-4 text-xs text-grey-400 bg-white/80 px-3 py-1 rounded-full">
        3D Blob (Phase 2)
      </div>
    </div>
  );
}
