import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid
} from '@mui/material';
import ViewToggle from '../ui/ViewToggle';
import logging from '../../utils/logging';

const { logInfo } = logging;

/**
 * Renders objective data from a SOAP note in a structured chart format
 * Uses structured data from templates with fallback to raw text display
 * 
 * @param {string} objectiveData - Raw text objective data
 * @param {Object} structuredData - Structured objective data from template
 * @param {string} displayMode - Current display mode ('structured' or 'raw')
 * @param {function} onDisplayModeChange - Callback when display mode changes
 * @returns {JSX.Element} The ObjectiveDataChart component
 */
const ObjectiveDataChart = ({ 
  objectiveData, 
  structuredData,
  displayMode = 'structured',
  onDisplayModeChange
}) => {
  const [localDisplayMode, setLocalDisplayMode] = useState(displayMode);
  
  // Sync with parent component's display mode if provided
  useEffect(() => {
    if (displayMode) {
      setLocalDisplayMode(displayMode);
    }
  }, [displayMode]);
  
  // Handler for changing display mode locally or via parent
  const handleDisplayModeChange = (newMode) => {
    setLocalDisplayMode(newMode);
    if (onDisplayModeChange) {
      onDisplayModeChange(newMode);
    }
    logInfo('ObjectiveDataChart', `Display mode changed to ${newMode}`);
  };
  
  // If no data at all, show a message
  if (!objectiveData && !structuredData?.objective) {
    return <Typography color="text.secondary">No objective data available</Typography>;
  }
  
  // Use the effective display mode (local or from parent)
  const effectiveDisplayMode = displayMode || localDisplayMode;

  // Check if structured data is available
  const hasStructuredData = structuredData && 
    structuredData.objective && 
    (structuredData.objective.rom || 
     structuredData.objective.mmt ||
     structuredData.objective.special_tests ||
     structuredData.objective.observations);

  // Return early if no structured data or raw mode selected
  if (!hasStructuredData || effectiveDisplayMode === 'raw') {
    return (
      <Box sx={{ width: '100%' }}>
        {/* Display toggle using reusable ViewToggle component */}
        <ViewToggle
          value={effectiveDisplayMode}
          onChange={handleDisplayModeChange}
          hasStructuredData={hasStructuredData}
          sx={{ mb: 2 }}
        />
        
        {/* Display raw text */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
            {objectiveData}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Get data from the structured objective section
  const { rom, mmt, special_tests, observations } = structuredData.objective;
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Display toggle using reusable ViewToggle component */}
      <ViewToggle
        value={effectiveDisplayMode}
        onChange={handleDisplayModeChange}
        hasStructuredData={hasStructuredData}
        sx={{ mb: 2 }}
      />
      
      {/* ROM Section */}
      {rom && Object.keys(rom).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Range of Motion
          </Typography>
          <TableContainer component={Paper} sx={{ 
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Movement</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Right AROM</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Left AROM</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Right PROM</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Left PROM</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(rom).map(([movement, values], index) => (
                  <TableRow key={`rom-${index}`}>
                    <TableCell>{movement}</TableCell>
                    <TableCell>{values.r_arom || 'Not assessed'}</TableCell>
                    <TableCell>{values.l_arom || 'Not assessed'}</TableCell>
                    <TableCell>{values.r_prom || 'Not assessed'}</TableCell>
                    <TableCell>{values.l_prom || 'Not assessed'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* MMT Section */}
      {mmt && Object.keys(mmt).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Manual Muscle Testing
          </Typography>
          <TableContainer component={Paper} sx={{ 
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Muscle</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Right Grade</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Left Grade</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>Pain</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(mmt).map(([muscle, values], index) => (
                  <TableRow key={`mmt-${index}`}>
                    <TableCell>{muscle}</TableCell>
                    <TableCell>{values.r_grade || 'Not assessed'}</TableCell>
                    <TableCell>{values.l_grade || 'Not assessed'}</TableCell>
                    <TableCell>
                      {values.r_pain || values.l_pain ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Special Tests Section */}
      {special_tests && Object.keys(special_tests).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Special Tests
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(special_tests).map(([test, result], index) => {
              const resultValue = typeof result === 'string' ? result : result.result;
              const isPositive = resultValue.toLowerCase().includes('positive');
              const isNegative = resultValue.toLowerCase().includes('negative');
              
              return (
                <Grid item xs={6} sm={4} md={3} key={`test-${index}`}>
                  <Chip
                    label={`${test}: ${resultValue}`}
                    sx={{
                      width: '100%',
                      height: 'auto',
                      padding: '8px 0',
                      borderRadius: '8px',
                      '& .MuiChip-label': { 
                        display: 'flex', 
                        flexDirection: 'column', 
                        whiteSpace: 'normal',
                        padding: '4px 8px'
                      },
                      backgroundColor: isPositive 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : isNegative
                          ? 'rgba(16, 185, 129, 0.1)'
                          : 'rgba(156, 163, 175, 0.1)',
                      color: isPositive 
                        ? '#ef4444' 
                        : isNegative
                          ? '#10b981'
                          : '#4b5563'
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Observations Section */}
      {observations && observations.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Clinical Observations
          </Typography>
          <Paper sx={{ 
            p: 2, 
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            {typeof observations === 'string' ? (
              <Typography variant="body2">{observations}</Typography>
            ) : (
              observations.map((obs, index) => (
                <Typography 
                  key={`obs-${index}`} 
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: index < observations.length - 1 ? 1 : 0
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: 4, 
                      height: 4, 
                      borderRadius: '50%', 
                      backgroundColor: '#2563eb', 
                      display: 'inline-block', 
                      mr: 1 
                    }}
                  />
                  {obs}
                </Typography>
              ))
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ObjectiveDataChart;