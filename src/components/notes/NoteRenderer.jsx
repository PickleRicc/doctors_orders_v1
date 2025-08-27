import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Recursive Note Renderer Component
 * Renders any structured JSON data dynamically based on its structure
 * Follows the generation guide approach for universal template rendering
 */
const NoteRenderer = ({ data, title, level = 0 }) => {
  // Handle null or undefined data
  if (!data) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No data available
      </Typography>
    );
  }

  // Handle string values
  if (typeof data === 'string') {
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          whiteSpace: 'pre-wrap',
          color: data === 'Not assessed' ? 'text.secondary' : 'text.primary',
          fontStyle: data === 'Not assessed' ? 'italic' : 'normal'
        }}
      >
        {data}
      </Typography>
    );
  }

  // Handle arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No items
        </Typography>
      );
    }

    // If array contains objects, render as table
    if (typeof data[0] === 'object') {
      const keys = Object.keys(data[0]);
      return (
        <TableContainer component={Paper} sx={{ mt: 1, boxShadow: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {keys.map(key => (
                  <TableCell key={key} sx={{ fontWeight: 600 }}>
                    {formatKey(key)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  {keys.map(key => (
                    <TableCell key={key}>
                      <NoteRenderer data={item[key]} level={level + 1} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // If array contains strings, render as chips or list
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {data.map((item, index) => (
          <Chip 
            key={index} 
            label={item} 
            size="small" 
            variant="outlined"
            sx={{ 
              bgcolor: item === 'Not assessed' ? 'grey.100' : 'primary.50',
              color: item === 'Not assessed' ? 'text.secondary' : 'primary.main'
            }}
          />
        ))}
      </Box>
    );
  }

  // Handle objects
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    
    if (entries.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No data
        </Typography>
      );
    }

    // Special handling for ROM and MMT data (common PT structures)
    if (isROMData(data)) {
      return renderROMTable(data);
    }

    if (isMMTData(data)) {
      return renderMMTTable(data);
    }

    // For top-level sections, use accordions
    if (level === 0) {
      return (
        <Box>
          {entries.map(([key, value]) => (
            <Accordion key={key} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {formatKey(key)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <NoteRenderer data={value} level={level + 1} />
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      );
    }

    // For nested objects, use simple sections
    return (
      <Box>
        {entries.map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.main',
                mb: 1
              }}
            >
              {formatKey(key)}
            </Typography>
            <Box sx={{ ml: 2 }}>
              <NoteRenderer data={value} level={level + 1} />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Handle other primitive types
  return (
    <Typography variant="body2">
      {String(data)}
    </Typography>
  );
};

/**
 * Helper function to format keys for display
 */
function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Check if data represents ROM (Range of Motion) structure
 */
function isROMData(data) {
  const keys = Object.keys(data);
  return keys.some(key => 
    key.includes('flexion') || 
    key.includes('extension') || 
    key.includes('abduction') ||
    (data[key] && typeof data[key] === 'object' && 
     ('value' in data[key] || 'r_value' in data[key] || 'normal' in data[key]))
  );
}

/**
 * Check if data represents MMT (Manual Muscle Testing) structure
 */
function isMMTData(data) {
  const keys = Object.keys(data);
  return keys.some(key => 
    key.includes('flexor') || 
    key.includes('extensor') ||
    (data[key] && typeof data[key] === 'object' && 
     ('grade' in data[key] || 'r_grade' in data[key]))
  );
}

/**
 * Render ROM data as a specialized table
 */
function renderROMTable(data) {
  const movements = Object.entries(data);
  
  return (
    <TableContainer component={Paper} sx={{ mt: 1, boxShadow: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Movement</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Right</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Left</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Normal</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Symptoms</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.map(([movement, values]) => (
            <TableRow key={movement}>
              <TableCell sx={{ fontWeight: 500 }}>
                {formatKey(movement)}
              </TableCell>
              <TableCell>{values.r_value || values.value || 'Not assessed'}</TableCell>
              <TableCell>{values.l_value || values.value || 'Not assessed'}</TableCell>
              <TableCell>{values.normal || 'N/A'}</TableCell>
              <TableCell>{values.r_symptoms || values.l_symptoms || values.symptoms || 'None'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/**
 * Render MMT data as a specialized table
 */
function renderMMTTable(data) {
  const muscles = Object.entries(data);
  
  return (
    <TableContainer component={Paper} sx={{ mt: 1, boxShadow: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Muscle Group</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Right Grade</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Left Grade</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Pain</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {muscles.map(([muscle, values]) => (
            <TableRow key={muscle}>
              <TableCell sx={{ fontWeight: 500 }}>
                {formatKey(muscle)}
              </TableCell>
              <TableCell>{values.r_grade || values.grade || 'Not assessed'}</TableCell>
              <TableCell>{values.l_grade || values.grade || 'Not assessed'}</TableCell>
              <TableCell>
                {values.r_pain || values.l_pain || values.pain ? 
                  <Chip label="Pain" size="small" color="warning" /> : 
                  <Chip label="No Pain" size="small" color="success" />
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default NoteRenderer;
