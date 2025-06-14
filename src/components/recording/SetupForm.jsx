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
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { ArrowRightCircle } from 'lucide-react';

/**
 * Setup Form Component
 * Allows users to select body region, session type, and template before recording
 */
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Body Region Selection */}
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth 
              error={formErrors.bodyRegion}
              required
            >
              <InputLabel id="body-region-label">Body Region</InputLabel>
              <Select
                labelId="body-region-label"
                id="body-region"
                value={bodyRegion}
                label="Body Region"
                onChange={(e) => setBodyRegion(e.target.value)}
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
            >
              <InputLabel id="session-type-label">Session Type</InputLabel>
              <Select
                labelId="session-type-label"
                id="session-type"
                value={sessionType}
                label="Session Type"
                onChange={(e) => setSessionType(e.target.value)}
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
              <FormControl fullWidth disabled={filteredTemplates.length === 0}>
                <InputLabel id="template-label">Template</InputLabel>
                <Select
                  labelId="template-label"
                  id="template"
                  value={selectedTemplateId || ''}
                  label="Template"
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                >
                  {filteredTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
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
                p: 2, 
                bgcolor: 'rgba(37, 99, 235, 0.05)', 
                borderRadius: 1,
                border: '1px solid rgba(37, 99, 235, 0.1)'
              }}>
                <Typography variant="body2" mb={0.5}>
                  <strong>Selected Template:</strong> {filteredTemplates[0]?.name || 'None'}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontSize="0.875rem">
                  This template will be used based on your body region and session type selection.
                </Typography>
              </Box>
            )}
          </Grid>
          
          {/* Submit Button */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowRightCircle size={20} />}
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  px: 4,
                  py: 1
                }}
              >
                Start Recording
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </motion.div>
  );
};

export default SetupForm;
