/**
 * AudioVisualizer2D - Simple 2D audio-reactive visualization
 * Uses Canvas API for better performance and reliability
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { useAppState, APP_STATES } from './StateManager';

const TEMPLATE_COLORS = {
  knee: '#007AFF',
  shoulder: '#5856D6',
  back: '#34C759',
  hip: '#FF9500',
  'ankle-foot': '#5AC8FA',
  neck: '#FF2D55',
  default: '#00CED1'
};

export default function AudioVisualizer2D() {
  const canvasRef = useRef(null);
  const { appState, selectedTemplate } = useAppState();
  const [audioData, setAudioData] = useState(new Uint8Array(128));
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const color = selectedTemplate ? TEMPLATE_COLORS[selectedTemplate] : TEMPLATE_COLORS.default;

  // Setup audio
  useEffect(() => {
    if (appState === APP_STATES.RECORDING) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          
          analyserRef.current.fftSize = 256;
          source.connect(analyserRef.current);
        })
        .catch(err => console.log('Mic access denied:', err));
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [appState]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    let rotation = 0;

    const draw = () => {
      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#0a0a0a');
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Get audio data if recording
      if (analyserRef.current && appState === APP_STATES.RECORDING) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        setAudioData(dataArray);
      }

      // Draw circular audio bars
      const numBars = 64;
      const radius = 80;
      const barWidth = 4;
      const maxBarHeight = 100;

      ctx.save();
      ctx.translate(centerX, centerY);

      for (let i = 0; i < numBars; i++) {
        const angle = (Math.PI * 2 * i) / numBars;
        const dataIndex = Math.floor((i / numBars) * audioData.length);
        const amplitude = audioData[dataIndex] || 0;
        
        // Calculate bar height with idle animation
        const idleWave = Math.sin(rotation + i * 0.1) * 5 + 10;
        const barHeight = appState === APP_STATES.RECORDING 
          ? (amplitude / 255) * maxBarHeight + idleWave
          : idleWave;

        // Bar position
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const x2 = Math.cos(angle) * (radius + barHeight);
        const y2 = Math.sin(angle) * (radius + barHeight);

        // Gradient for bar
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(0.5, color + 'CC');
        gradient.addColorStop(1, color + 'FF');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = barWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.restore();

      // Draw center circle with glow
      const centerSize = appState === APP_STATES.RECORDING ? 70 : 60;
      
      // Outer glow
      const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerSize + 30);
      outerGlow.addColorStop(0, color + 'FF');
      outerGlow.addColorStop(0.4, color + '60');
      outerGlow.addColorStop(1, color + '00');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerSize + 30, 0, Math.PI * 2);
      ctx.fill();

      // Center circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerSize, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      const highlight = ctx.createRadialGradient(
        centerX - 20, centerY - 20, 0,
        centerX, centerY, centerSize
      );
      highlight.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlight;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerSize, 0, Math.PI * 2);
      ctx.fill();

      // Rotate
      rotation += 0.02;

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [color, appState, audioData]);

  return (
    <div className="relative w-full h-80 flex items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        width={800}
        height={320}
        className="w-full h-full"
      />

      <div className="absolute bottom-4 text-center pointer-events-none">
        <p className="text-sm font-medium text-white">
          {appState === APP_STATES.IDLE && 'Ready to begin'}
          {appState === APP_STATES.TEMPLATE_SELECTED && 'Template selected'}
          {appState === APP_STATES.RECORDING && 'Recording...'}
          {appState === APP_STATES.PROCESSING && 'Processing...'}
        </p>
      </div>
    </div>
  );
}
