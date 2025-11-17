/**
 * GenerationProgress Component
 * Displays progress bar, timer, time saved calculation, and positive quotes
 * during SOAP note generation
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Zap } from 'lucide-react';

// Pool of positive quotes to display randomly
const POSITIVE_QUOTES = [
  "You're saving valuable time for patient care!",
  "Every second counts in healthcare - you're making a difference!",
  "Your efficiency helps you focus on what matters most: your patients.",
  "Technology working for you - just like it should be!",
  "You're streamlining documentation so you can spend more time with patients.",
  "Great things take time, but we're making it faster for you!",
  "Your dedication to efficient care is inspiring!",
  "Every note you generate brings you closer to better patient outcomes.",
  "You're transforming how healthcare documentation works!",
  "Time saved here means more time for healing.",
  "Your commitment to quality care shines through!",
  "We're here to make your day easier - one note at a time.",
  "Efficiency meets excellence - that's what you're achieving!",
  "You're revolutionizing patient care documentation!",
  "Every moment saved is a moment gained for patient interaction.",
];

// Estimated time to manually write a SOAP note (in seconds)
// Average is about 8-12 minutes, we'll use 10 minutes = 600 seconds
const MANUAL_NOTE_TIME_SECONDS = 600;

export default function GenerationProgress({ onComplete }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentQuote, setCurrentQuote] = useState('');
  const [timeSaved, setTimeSaved] = useState(0);
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef(null);
  const quoteIntervalRef = useRef(null);

  // Initialize with a random quote
  useEffect(() => {
    setCurrentQuote(POSITIVE_QUOTES[Math.floor(Math.random() * POSITIVE_QUOTES.length)]);
  }, []);

  // Rotate quotes every 4 seconds
  useEffect(() => {
    quoteIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * POSITIVE_QUOTES.length);
      setCurrentQuote(POSITIVE_QUOTES[randomIndex]);
    }, 4000);

    return () => {
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current);
      }
    };
  }, []);

  // Timer and progress calculation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
      
      // Calculate time saved (manual time - elapsed time)
      const saved = Math.max(0, MANUAL_NOTE_TIME_SECONDS - elapsed);
      setTimeSaved(saved);

      // Simulate progress (0-95% max, actual completion handled by onComplete)
      // Progress increases faster at the beginning, slower as it approaches completion
      // Using a logarithmic curve for more realistic progress
      const maxProgress = 95;
      const estimatedTotalSeconds = 60; // Estimated time for generation
      const progressRatio = Math.min(1, elapsed / estimatedTotalSeconds);
      // Use ease-out curve: faster at start, slower at end
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
      const progressValue = Math.min(maxProgress, easedProgress * maxProgress);
      setProgress(progressValue);
    }, 100); // Update every 100ms for smooth animation

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onComplete]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format time saved in a readable format
  const formatTimeSaved = (seconds) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
      }
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`;
    }
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-8 shadow-xl transition-colors">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--blue-primary-rgb), 0.2), rgba(var(--blue-primary-rgb), 0.1))',
            }}
          >
            <Sparkles className="w-8 h-8" style={{ color: 'rgb(var(--blue-primary-rgb))' }} />
          </motion.div>
          <h3 className="text-2xl font-semibold text-grey-900 dark:text-grey-100 mb-2">
            Generating Your SOAP Note
          </h3>
          <p className="text-sm text-grey-600 dark:text-grey-400">
            Our AI is working hard to create your professional documentation
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-grey-700 dark:text-grey-300">
              Progress
            </span>
            <span className="text-sm font-semibold text-grey-900 dark:text-grey-100">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-grey-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgb(var(--blue-primary-rgb)), rgb(var(--blue-dark-rgb)))',
                boxShadow: '0 0 10px rgba(var(--blue-primary-rgb), 0.5)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Timer and Time Saved */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Elapsed Time */}
          <div className="bg-grey-50 dark:bg-[#1f1f1f] rounded-xl p-4 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" style={{ color: 'rgb(var(--blue-primary-rgb))' }} />
              <span className="text-sm font-medium text-grey-700 dark:text-grey-300">
                Elapsed Time
              </span>
            </div>
            <p className="text-2xl font-bold text-grey-900 dark:text-grey-100">
              {formatTime(elapsedSeconds)}
            </p>
          </div>

          {/* Time Saved */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" style={{ color: 'rgb(var(--blue-primary-rgb))' }} />
              <span className="text-sm font-medium text-grey-700 dark:text-grey-300">
                Time Saved
              </span>
            </div>
            <p className="text-2xl font-bold text-grey-900 dark:text-grey-100">
              {formatTimeSaved(timeSaved)}
            </p>
          </div>
        </div>

        {/* Positive Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl border border-blue-100 dark:border-blue-800/20"
          >
            <p className="text-base font-medium text-grey-800 dark:text-grey-200 italic">
              "{currentQuote}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Processing Steps Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
          />
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

