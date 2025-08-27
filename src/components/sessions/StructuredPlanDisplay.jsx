import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { logInfo } from '../../utils/logging';

/**
 * Displays structured plan data from a SOAP note
 * Uses the structured_data format from our templates
 */
const StructuredPlanDisplay = ({ data }) => {
  // Log render with data structure
  logInfo('StructuredPlanDisplay', 'Rendering structured plan data', {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : []
  });

  if (!data) {
    return <Typography color="text.secondary">No plan data available</Typography>;
  }

  const { interventions, goals, frequency, duration, home_program, education, referrals } = data;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Interventions Section */}
      {interventions && (
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
            Interventions
          </Typography>
          
          {typeof interventions === 'string' ? (
            <Typography variant="body2">{interventions}</Typography>
          ) : (
            <List dense disablePadding>
              {interventions.map((item, index) => {
                const interventionText = typeof item === 'string' ? item : item.description;
                const details = typeof item === 'string' ? null : item.details;
                
                return (
                  <ListItem 
                    key={`intervention-${index}`}
                    sx={{ 
                      px: 0, 
                      py: 0.5,
                      alignItems: 'flex-start'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckIcon 
                        fontSize="small" 
                        sx={{ color: '#2563eb' }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={interventionText}
                      secondary={details}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'body2',
                        sx: { mt: 0.5 }
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      )}

      {/* Goals Section */}
      {goals && (
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
            Goals
          </Typography>

          {typeof goals === 'string' ? (
            <Typography variant="body2">{goals}</Typography>
          ) : (
            <List dense disablePadding>
              {goals.map((item, index) => {
                const goalText = typeof item === 'string' ? item : item.description;
                const timeline = typeof item === 'string' ? null : item.timeline;
                
                return (
                  <ListItem 
                    key={`goal-${index}`}
                    sx={{ 
                      px: 0, 
                      py: 0.5,
                      alignItems: 'flex-start'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <TimeIcon 
                        fontSize="small" 
                        sx={{ color: '#10b981' }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={goalText}
                      secondary={timeline && `Timeline: ${timeline}`}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'body2',
                        sx: { mt: 0.5, color: '#4b5563' }
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      )}

      {/* Treatment Parameters */}
      {(frequency || duration) && (
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
            Treatment Parameters
          </Typography>
          
          <Grid container spacing={2}>
            {frequency && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon 
                    fontSize="small" 
                    sx={{ color: '#4b5563', mr: 1 }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563', mr: 1 }}>
                    Frequency:
                  </Typography>
                  <Chip 
                    label={frequency}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      color: '#3b82f6'
                    }}
                  />
                </Box>
              </Grid>
            )}
            
            {duration && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon 
                    fontSize="small" 
                    sx={{ color: '#4b5563', mr: 1 }} 
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563', mr: 1 }}>
                    Duration:
                  </Typography>
                  <Chip 
                    label={duration}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      color: '#3b82f6'
                    }}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
      )}

      {/* Home Program */}
      {home_program && (
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
            Home Program
          </Typography>
          
          {typeof home_program === 'string' ? (
            <Typography variant="body2">{home_program}</Typography>
          ) : (
            <List dense disablePadding>
              {home_program.map((item, index) => {
                const exerciseText = typeof item === 'string' ? item : item.description;
                const parameters = typeof item === 'string' ? null : item.parameters;
                
                return (
                  <ListItem 
                    key={`hep-${index}`}
                    sx={{ 
                      px: 0, 
                      py: 0.5,
                      alignItems: 'flex-start'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckIcon 
                        fontSize="small" 
                        sx={{ color: '#2563eb' }} 
                      />
                    </ListItemIcon>
                    <ListItemText 
                      primary={exerciseText}
                      secondary={parameters}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'body2',
                        sx: { mt: 0.5 }
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      )}

      {/* Education Section */}
      {education && (
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
            Patient Education
          </Typography>
          
          {typeof education === 'string' ? (
            <Typography variant="body2">{education}</Typography>
          ) : (
            <List dense disablePadding>
              {education.map((item, index) => (
                <ListItem 
                  key={`education-${index}`}
                  sx={{ 
                    px: 0, 
                    py: 0.5,
                    alignItems: 'flex-start'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckIcon 
                      fontSize="small" 
                      sx={{ color: '#2563eb' }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={typeof item === 'string' ? item : item.topic}
                    secondary={typeof item === 'string' ? null : item.details}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      sx: { mt: 0.5 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Referrals Section */}
      {referrals && (
        <Paper sx={{ 
          p: 2,
          borderRadius: 2,
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#2563eb' }}>
            Referrals & Recommendations
          </Typography>
          
          {typeof referrals === 'string' ? (
            <Typography variant="body2">{referrals}</Typography>
          ) : (
            <List dense disablePadding>
              {referrals.map((item, index) => (
                <ListItem 
                  key={`referral-${index}`}
                  sx={{ 
                    px: 0, 
                    py: 0.5,
                    alignItems: 'flex-start'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckIcon 
                      fontSize="small" 
                      sx={{ color: '#2563eb' }} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={typeof item === 'string' ? item : item.provider}
                    secondary={typeof item === 'string' ? null : item.reason}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      sx: { mt: 0.5 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default StructuredPlanDisplay;
