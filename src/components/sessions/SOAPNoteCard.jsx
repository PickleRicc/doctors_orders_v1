import React, { useState } from 'react';
import { Card, Box, Typography, IconButton, Chip, Collapse, TextField, Button } from '@mui/material';
import { Edit as EditIcon, ExpandMore as ExpandMoreIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

/**
 * Displays a single SOAP note with editing capabilities
 */
export default function SOAPNoteCard({ session, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState({
    subjective: session.subjective || '',
    objective: session.objective || '',
    assessment: session.assessment || '',
    plan: session.plan || ''
  });

  // Format time relative to now
  const timeAgo = formatDistanceToNow(new Date(session.created_at), { addSuffix: true });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original
      setEditedNote({
        subjective: session.subjective || '',
        objective: session.objective || '',
        assessment: session.assessment || '',
        plan: session.plan || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    onUpdate(session.id, {
      subjective: editedNote.subjective,
      objective: editedNote.objective,
      assessment: editedNote.assessment,
      plan: editedNote.plan
    });
    setIsEditing(false);
  };

  const handleChange = (section, value) => {
    setEditedNote({
      ...editedNote,
      [section]: value
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
          }
        }}
      >
        {/* Header section */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: expanded ? '1px solid rgba(0,0,0,0.08)' : 'none'
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Chip 
                label={session.body_region} 
                size="small" 
                sx={{ 
                  mr: 1, 
                  background: 'rgba(37, 99, 235, 0.1)', 
                  color: '#2563eb',
                  fontWeight: 500 
                }} 
              />
              <Chip 
                label={session.session_type} 
                size="small"
                sx={{ 
                  background: 'rgba(37, 99, 235, 0.05)', 
                  color: 'rgba(37, 99, 235, 0.8)',
                  fontWeight: 500  
                }} 
              />
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {timeAgo}
            </Typography>
          </Box>
          
          <Box>
            <IconButton onClick={handleEditToggle} size="small" color={isEditing ? "error" : "primary"}>
              {isEditing ? <CancelIcon /> : <EditIcon />}
            </IconButton>
            <IconButton onClick={() => setExpanded(!expanded)} size="small">
              <ExpandMoreIcon 
                sx={{ 
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s'
                }} 
              />
            </IconButton>
            <IconButton onClick={() => onDelete(session.id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Expandable content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2 }}>
            {/* SOAP sections */}
            {['subjective', 'objective', 'assessment', 'plan'].map((section) => (
              <Box key={section} sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 1, 
                    textTransform: 'capitalize',
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#2563eb'
                  }}
                >
                  {section}
                </Typography>
                
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={8}
                    variant="outlined"
                    value={editedNote[section]}
                    onChange={(e) => handleChange(section, e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      }
                    }}
                  />
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      color: 'text.primary',
                      fontFamily: 'Roboto, sans-serif',
                      lineHeight: 1.6
                    }}
                  >
                    {session[section] || 'No information provided'}
                  </Typography>
                )}
              </Box>
            ))}
            
            {/* Save button when editing */}
            {isEditing && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ 
                  mt: 1,
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.3)',
                  }
                }}
              >
                Save Changes
              </Button>
            )}
          </Box>
        </Collapse>

        {/* Summary preview when collapsed */}
        {!expanded && (
          <Box sx={{ p: 2, pt: 0 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                fontSize: '0.875rem',
                opacity: 0.85
              }}
            >
              {session.subjective?.substring(0, 100) || 'No subjective information'}...
            </Typography>
          </Box>
        )}
      </Card>
    </motion.div>
  );
}
