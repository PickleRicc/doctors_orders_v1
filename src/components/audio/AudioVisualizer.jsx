import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';

/**
 * AudioVisualizer Component
 * Renders a real-time waveform visualization of audio levels
 * Provides visual feedback to the user during recording
 */
const AudioVisualizer = ({ audioLevels = [] }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Draw the waveform on the canvas
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // No data to render
    if (!audioLevels.length) {
      return;
    }
    
    const levels = [...audioLevels]; // Create a copy to avoid issues with concurrent updates
    const centerY = height / 2;
    
    // Set up the line style
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.7)';
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    
    // Calculate bar width based on number of points
    const maxBars = Math.min(levels.length, 100); // Limit to prevent performance issues
    const barWidth = width / maxBars;
    
    // Begin the path
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    // Create points for the top of the waveform
    for (let i = 0; i < maxBars; i++) {
      const x = i * barWidth;
      const levelIndex = Math.floor(i * levels.length / maxBars);
      const level = levels[levelIndex] || 0;
      
      // Scale the level to fit the canvas height
      const scaledLevel = level * (height * 0.45);
      
      if (i === 0) {
        ctx.moveTo(x, centerY - scaledLevel);
      } else {
        // Create a smooth curve
        ctx.lineTo(x, centerY - scaledLevel);
      }
    }
    
    // Continue the path for the bottom of the waveform (mirror of the top)
    for (let i = maxBars - 1; i >= 0; i--) {
      const x = i * barWidth;
      const levelIndex = Math.floor(i * levels.length / maxBars);
      const level = levels[levelIndex] || 0;
      
      // Scale the level to fit the canvas height
      const scaledLevel = level * (height * 0.45);
      
      ctx.lineTo(x, centerY + scaledLevel);
    }
    
    // Close the path
    ctx.closePath();
    
    // Fill and stroke
    ctx.fill();
    ctx.stroke();
    
    // Create a gradient reflection effect
    const gradient = ctx.createLinearGradient(0, centerY, 0, height);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.1)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, centerY, width, height - centerY);
    
    // Animate the waveform
    animationRef.current = requestAnimationFrame(drawWaveform);
  };
  
  // Handle canvas resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    drawWaveform();
  };
  
  // Set up the canvas and animation
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Start the animation
    animationRef.current = requestAnimationFrame(drawWaveform);
    
    return () => {
      // Clean up
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Update when audioLevels changes
  useEffect(() => {
    drawWaveform();
  }, [audioLevels]);
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </Box>
  );
};

export default AudioVisualizer;
