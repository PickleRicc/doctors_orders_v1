import React from 'react';
import { ToggleButtonGroup, ToggleButton, Box, Tooltip } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import TextFormatIcon from '@mui/icons-material/TextFormat';

/**
 * ViewToggle component for switching between structured and raw text views
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected view mode ('structured' or 'raw')
 * @param {function} props.onChange - Callback when view mode changes
 * @param {boolean} props.hasStructuredData - Whether structured data is available
 * @param {string} props.size - Size of the toggle buttons (small, medium, large)
 * @param {Object} props.sx - Additional styling for the container
 * @returns {JSX.Element} The ViewToggle component
 */
const ViewToggle = ({ 
  value = 'structured', 
  onChange, 
  hasStructuredData = true,
  size = 'small',
  sx = {}
}) => {
  // If no structured data is available, don't render the toggle
  if (!hasStructuredData) return null;

  const handleChange = (event, newValue) => {
    // Only update if a valid option is selected (prevents deselection)
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', ...sx }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        size={size}
        color="primary"
        aria-label="view mode"
      >
        <Tooltip title="Structured View">
          <ToggleButton value="structured" aria-label="structured view">
            <ViewListIcon />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Raw Text View">
          <ToggleButton value="raw" aria-label="raw text view">
            <TextFormatIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
};

export default ViewToggle;
