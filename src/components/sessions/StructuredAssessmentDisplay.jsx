import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip
} from '@mui/material';
import { logInfo } from '../../utils/logging';

/**
 * Displays structured assessment data from a SOAP note
 * Uses the structured_data format from our templates
 */
const StructuredAssessmentDisplay = ({ data }) => {
  // Log render with data structure
  logInfo('StructuredAssessmentDisplay', 'Rendering structured assessment data', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : []
  });

  if (!data) {
    return <Typography color="text.secondary">No assessment data available</Typography>;
  }

  const { diagnosis, clinical_impression, problem_list, functional_deficits } = data;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Diagnosis Section */}
      {diagnosis && (
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
            Diagnosis
          </Typography>

          {typeof diagnosis === 'string' ? (
            <Typography variant="body2">{diagnosis}</Typography>
          ) : (
            <Grid container spacing={2}>
              {diagnosis.primary && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Primary Diagnosis:
                  </Typography>
                  <Typography variant="body2">
                    {diagnosis.primary}
                  </Typography>
                </Grid>
              )}
              
              {diagnosis.secondary && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Secondary Diagnosis:
                  </Typography>
                  <Typography variant="body2">
                    {diagnosis.secondary}
                  </Typography>
                </Grid>
              )}
              
              {diagnosis.icd10 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                      ICD-10 Codes:
                    </Typography>
                    {typeof diagnosis.icd10 === 'string' ? (
                      <Chip 
                        label={diagnosis.icd10}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          borderRadius: '8px',
                          color: '#2563eb',
                          fontFamily: 'monospace'
                        }}
                      />
                    ) : (
                      diagnosis.icd10.map((code, index) => (
                        <Chip 
                          key={index}
                          label={code}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            borderRadius: '8px',
                            color: '#2563eb',
                            fontFamily: 'monospace'
                          }}
                        />
                      ))
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      )}

      {/* Clinical Impression Section */}
      {clinical_impression && (
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
            Clinical Impression
          </Typography>
          
          {typeof clinical_impression === 'string' ? (
            <Typography variant="body2">{clinical_impression}</Typography>
          ) : (
            <Grid container spacing={2}>
              {clinical_impression.presentation && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Clinical Presentation:
                  </Typography>
                  <Typography variant="body2">
                    {clinical_impression.presentation}
                  </Typography>
                </Grid>
              )}
              
              {clinical_impression.etiology && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Likely Etiology:
                  </Typography>
                  <Typography variant="body2">
                    {clinical_impression.etiology}
                  </Typography>
                </Grid>
              )}
              
              {clinical_impression.severity && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Severity:
                  </Typography>
                  <Typography variant="body2">
                    {clinical_impression.severity}
                  </Typography>
                </Grid>
              )}
              
              {clinical_impression.prognosis && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>
                    Prognosis:
                  </Typography>
                  <Typography variant="body2">
                    {clinical_impression.prognosis}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Paper>
      )}

      {/* Problem List Section */}
      {problem_list && (
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
            Problem List
          </Typography>
          
          {typeof problem_list === 'string' ? (
            <Typography variant="body2">{problem_list}</Typography>
          ) : (
            <Box sx={{ pl: 2 }}>
              {problem_list.map((problem, index) => (
                <Typography 
                  key={`problem-${index}`}
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    mb: index < problem_list.length - 1 ? 1 : 0 
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: 5, 
                      height: 5, 
                      borderRadius: '50%', 
                      backgroundColor: '#ef4444', 
                      display: 'inline-block', 
                      mr: 1 
                    }}
                  />
                  {typeof problem === 'string' ? problem : problem.description}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* Functional Deficits Section */}
      {functional_deficits && (
        <Paper sx={{ 
          p: 2,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Functional Deficits
          </Typography>
          
          {typeof functional_deficits === 'string' ? (
            <Typography variant="body2">{functional_deficits}</Typography>
          ) : (
            <Box sx={{ pl: 2 }}>
              {functional_deficits.map((deficit, index) => (
                <Typography 
                  key={`deficit-${index}`}
                  variant="body2" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'baseline', 
                    mb: index < functional_deficits.length - 1 ? 1 : 0 
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: 5, 
                      height: 5, 
                      borderRadius: '50%', 
                      backgroundColor: '#3b82f6', 
                      display: 'inline-block', 
                      mr: 1 
                    }}
                  />
                  {typeof deficit === 'string' ? deficit : deficit.description}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default StructuredAssessmentDisplay;
