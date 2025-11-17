import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  FormControlLabel, 
  InputLabel, 
  MenuItem, 
  Select, 
  Button, 
  Typography, 
  Box, 
  Switch,
  FormHelperText,
  Grid,
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowRightCircle, CheckCircle } from 'lucide-react';

/**
 * Setup Form Component
 * Allows users to select body region, session type, and template before recording
 */
// Create a custom theme that matches our blue and white dashboard design
const theme = createTheme({
  palette: {
    primary: {
      main: 'var(--blue-primary)', // Theme-aware blue using CSS variable
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 122, 255, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.9rem',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minWidth: '180px', // Ensure enough width for content
        },
        select: {
          padding: '12px 14px',
          whiteSpace: 'normal', // Allow text to wrap if needed
          width: '100%', // Ensure full width
          overflow: 'visible',
        },
        outlined: {
          width: '100%',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          whiteSpace: 'normal', // Allow text to wrap in menu items
          lineHeight: '1.4', // Improve text readability
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const SetupForm = ({
  bodyRegion,
  setBodyRegion,
  sessionType,
  setSessionType,
  autoSelectTemplate,
  setAutoSelectTemplate,
  selectedTemplateId,
  setSelectedTemplateId,
  templates,
  onComplete
}) => {
  const [formErrors, setFormErrors] = useState({
    bodyRegion: false,
    sessionType: false
  });
  
  // Filter templates based on selected body region and session type
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  
  // Update filtered templates when body region or session type changes
  useEffect(() => {
    if (!bodyRegion && !sessionType) return;
    
    // Filter templates based on selections
    let filtered = templates.templates || [];
    
    if (bodyRegion) {
      filtered = filtered.filter(t => 
        t.bodyRegion === bodyRegion || 
        t.bodyRegion === 'general'
      );
    }
    
    if (sessionType) {
      filtered = filtered.filter(t => 
        t.sessionType === sessionType ||
        t.sessionType === 'general'
      );
    }
    
    setFilteredTemplates(filtered);
    
    // Auto-select first matching template if auto-select is enabled
    if (autoSelectTemplate && filtered.length > 0) {
      setSelectedTemplateId(filtered[0].id);
    }
  }, [bodyRegion, sessionType, templates.templates, autoSelectTemplate]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = {
      bodyRegion: !bodyRegion,
      sessionType: !sessionType
    };
    
    setFormErrors(errors);
    
    if (errors.bodyRegion || errors.sessionType) {
      return;
    }
    
    onComplete();
  };
  
  return (
    <ThemeProvider theme={theme}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Paper elevation={0} sx={{ p: 4, border: '1px solid #f0f0f0', position: 'relative', overflow: 'hidden' }}>
          {/* Blue accent top border */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', bgcolor: 'primary.main' }} />
          
          <Typography variant="h5" fontWeight={600} mb={3} color="text.primary">
            Session Setup
          </Typography>
          
          <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          {/* Body Region Selection */}
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={formErrors.bodyRegion}
              required
              sx={{ minWidth: '100%' }}
            >
              <InputLabel id="body-region-label">Body Region</InputLabel>
              <Select
                labelId="body-region-label"
                id="body-region"
                value={bodyRegion}
                label="Body Region"
                onChange={(e) => setBodyRegion(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 'auto',
                      minWidth: '200px',
                    },
                  },
                }}
                sx={{
                  '& .MuiSelect-select': {
                    minHeight: '24px',
                    paddingY: 1.5,
                    overflow: 'visible',
                    textOverflow: 'ellipsis'
                  }
                }}
              >
                {templates.bodyRegions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region.charAt(0).toUpperCase() + region.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.bodyRegion && (
                <FormHelperText>Body region is required</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Session Type Selection */}
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={formErrors.sessionType}
              required
              sx={{ minWidth: '100%' }}
            >
              <InputLabel id="session-type-label">Session Type</InputLabel>
              <Select
                labelId="session-type-label"
                id="session-type"
                value={sessionType}
                label="Session Type"
                onChange={(e) => setSessionType(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 'auto',
                      minWidth: '200px',
                    },
                  },
                }}
                sx={{
                  '& .MuiSelect-select': {
                    minHeight: '24px',
                    paddingY: 1.5,
                    overflow: 'visible',
                    textOverflow: 'ellipsis'
                  }
                }}
              >
                {templates.sessionTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.sessionType && (
                <FormHelperText>Session type is required</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {/* Template Selection */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 2
            }}>
              <Typography variant="subtitle1" fontWeight={500}>
                Template Selection
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSelectTemplate}
                    onChange={(e) => setAutoSelectTemplate(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    Auto-select best template
                  </Typography>
                }
                sx={{ ml: 2 }}
              />
            </Box>
            
            {!autoSelectTemplate && (
              <FormControl 
                fullWidth 
                disabled={filteredTemplates.length === 0}
                sx={{ minWidth: '100%', mb: 1 }}
              >
                <InputLabel id="template-label">Template</InputLabel>
                <Select
                  labelId="template-label"
                  id="template"
                  value={selectedTemplateId || ''}
                  label="Template"
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        width: 'auto',
                        minWidth: '250px',
                      },
                    },
                  }}
                  sx={{
                    '& .MuiSelect-select': {
                      overflow: 'visible',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      lineHeight: '1.4em',
                      display: 'block',
                      paddingRight: '32px' // Space for the dropdown icon
                    }
                  }}
                >
                  {filteredTemplates.map((template) => (
                    <MenuItem 
                      key={template.id} 
                      value={template.id}
                      sx={{ 
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        paddingY: 1.5 // More vertical padding for readability
                      }}
                    >
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {filteredTemplates.length === 0 
                    ? 'Select body region and session type first' 
                    : 'Choose a template for this recording'}
                </FormHelperText>
              </FormControl>
            )}
            
            {autoSelectTemplate && filteredTemplates.length > 0 && (
              <Box sx={{ 
                p: 2.5, 
                bgcolor: '#F0F7FF',  
                borderRadius: 2,
                border: '1px solid #E0EDFF',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1
              }}>
                <CheckCircle size={18} color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={0.5} color="text.primary">
                    {filteredTemplates[0]?.name || 'None'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                    This template will be used based on your body region and session type selection.
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowRightCircle size={20} />}
                sx={{
                  px: 4,
                  py: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
              >
                Start Recording
              </Button>
            </Box>
          </Grid>
        </Grid>
          </form>
        </Paper>
      </motion.div>
    </ThemeProvider>
  );
};

export default SetupForm;
