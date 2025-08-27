import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { logInfo } from '../../utils/logging';

/**
 * Displays structured subjective data from a SOAP note
 * Uses the structured_data format from our templates
 */
const StructuredSubjectiveDisplay = ({ data }) => {
  // Log render with data structure
  logInfo('StructuredSubjectiveDisplay', 'Rendering structured subjective data', { 
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [] 
  });

  if (!data) {
    return <Typography color="text.secondary">No subjective data available</Typography>;
  }

  const { chief_complaint, history, medical_history, functional } = data;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Chief Complaint Section */}
      {chief_complaint && (
        <Paper sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Chief Complaint
          </Typography>
          
          <Grid container spacing={2}>
            {chief_complaint.pain_location && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Location:
                </Typography>
                <Typography variant="body2">
                  {chief_complaint.pain_location}
                </Typography>
              </Grid>
            )}
            
            {chief_complaint.duration && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Duration:
                </Typography>
                <Typography variant="body2">
                  {chief_complaint.duration}
                </Typography>
              </Grid>
            )}
            
            {(chief_complaint.pain_scale || chief_complaint.scale_worst || chief_complaint.scale_best) && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Pain Intensity:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {chief_complaint.pain_scale && (
                    <Chip 
                      label={`Current: ${chief_complaint.pain_scale}/10`} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderRadius: '8px',
                        color: '#2563eb'
                      }}
                    />
                  )}
                  {chief_complaint.scale_worst && (
                    <Chip 
                      label={`Worst: ${chief_complaint.scale_worst}/10`} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        color: '#ef4444'
                      }}
                    />
                  )}
                  {chief_complaint.scale_best && (
                    <Chip 
                      label={`Best: ${chief_complaint.scale_best}/10`} 
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        color: '#10b981'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            )}
            
            {chief_complaint.quality && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Pain Quality:
                </Typography>
                <Typography variant="body2">
                  {chief_complaint.quality}
                </Typography>
              </Grid>
            )}
            
            {chief_complaint.pattern && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Pain Pattern:
                </Typography>
                <Typography variant="body2">
                  {chief_complaint.pattern}
                </Typography>
              </Grid>
            )}
            
            {chief_complaint.radiation && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Radiation:
                </Typography>
                <Typography variant="body2">
                  {typeof chief_complaint.radiation === 'string' 
                    ? chief_complaint.radiation 
                    : `${chief_complaint.radiation.symptoms || 'None'} ${chief_complaint.radiation.location ? 'to ' + chief_complaint.radiation.location : ''}`}
                </Typography>
              </Grid>
            )}
            
            {chief_complaint.aggravating_factors && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Aggravating Factors:
                </Typography>
                <Typography variant="body2">
                  {chief_complaint.aggravating_factors}
                </Typography>
              </Grid>
            )}
            
            {chief_complaint.relieving_factors && (
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Relieving Factors:
                </Typography>
                <Typography variant="body2">
                  {chief_complaint.relieving_factors}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
      
      {/* History Section */}
      {history && (
        <Paper sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            History
          </Typography>
          
          <Grid container spacing={2}>
            {history.onset && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Onset/Mechanism:
                </Typography>
                <Typography variant="body2">
                  {history.onset}
                </Typography>
              </Grid>
            )}
            
            {history.associated_symptoms && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Associated Symptoms:
                </Typography>
                <Typography variant="body2">
                  {history.associated_symptoms}
                </Typography>
              </Grid>
            )}
            
            {(history.prior_treatments || history.treatment_effectiveness) && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Prior Interventions:
                </Typography>
                <Typography variant="body2">
                  {history.prior_treatments}{history.treatment_effectiveness ? ` with ${history.treatment_effectiveness}` : ''}
                </Typography>
              </Grid>
            )}
            
            {history.imaging && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Diagnostic Imaging:
                </Typography>
                <Typography variant="body2">
                  {history.imaging}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
      
      {/* Medical History Section */}
      {medical_history && (
        <Paper sx={{ 
          p: 2, 
          mb: 2,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Medical History
          </Typography>
          
          {typeof medical_history === 'string' ? (
            <Typography variant="body2">
              {medical_history}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {medical_history.relevant && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Relevant Medical History:
                  </Typography>
                  <Typography variant="body2">
                    {medical_history.relevant}
                  </Typography>
                </Grid>
              )}
              
              {medical_history.medications && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Current Medications:
                  </Typography>
                  <Typography variant="body2">
                    {medical_history.medications}
                  </Typography>
                </Grid>
              )}
              
              {medical_history.previous_injuries && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Previous Injuries:
                  </Typography>
                  <Typography variant="body2">
                    {medical_history.previous_injuries}
                  </Typography>
                </Grid>
              )}
              
              {medical_history.surgeries && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Surgical History:
                  </Typography>
                  <Typography variant="body2">
                    {medical_history.surgeries}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      )}
      
      {/* Functional Section */}
      {functional && (
        <Paper sx={{ 
          p: 2,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Functional Status
          </Typography>
          
          <Grid container spacing={2}>
            {functional.limitations && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Functional Limitations:
                </Typography>
                <Typography variant="body2">
                  {functional.limitations}
                </Typography>
              </Grid>
            )}
            
            {functional.impact && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Impact on Daily Activities:
                </Typography>
                <Typography variant="body2">
                  {functional.impact}
                </Typography>
              </Grid>
            )}
            
            {functional.goals && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                  Patient Goals:
                </Typography>
                <Typography variant="body2">
                  {functional.goals}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default StructuredSubjectiveDisplay;
