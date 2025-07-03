import React, { useState } from 'react';
import { 
  Card, 
  Box, 
  Typography, 
  IconButton, 
  Chip, 
  Collapse, 
  TextField, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ExpandMore as ExpandMoreIcon, 
  Delete as DeleteIcon, 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  FitnessCenter as FitnessCenterIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

/**
 * Displays a single SOAP note with editing capabilities
 */
export default function SOAPNoteCard({ session, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showMuscleTests, setShowMuscleTests] = useState(false);
  const [editedNote, setEditedNote] = useState({
    subjective: session.subjective || '',
    objective: session.objective || '',
    assessment: session.assessment || '',
    plan: session.plan || ''
  });
  
  // Mock data for development - would be fetched from API in production
  const billingData = session.billing_suggestions || [
    {
      code: "97161",
      description: "PT evaluation: low complexity",
      justification: "Initial evaluation with limited examination requirements"
    },
    {
      code: "97110",
      description: "Therapeutic exercise",
      justification: "Documented therapeutic exercises for strength training"
    }
  ];
  
  // Mock data for muscle test detection - would be fetched from API in production
  const muscleTestData = session.muscle_tests || {
    muscle_tests: [
      { muscle: "Shoulder Flexion", grade: "4/5", side: "right" },
      { muscle: "Elbow Extension", grade: "4+/5*", side: "left" }
    ],
    rom_values: [
      { movement: "Shoulder Flexion", arom: "160 degrees", prom: "170 degrees", side: "right" },
      { movement: "Shoulder External Rotation", arom: "WFL", prom: "WFL", side: "left" }
    ],
    confidence: "medium"
  };

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
            <Tooltip title="Edit note">
              <IconButton onClick={handleEditToggle} size="small" color={isEditing ? "error" : "primary"}>
                {isEditing ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Expand/collapse note">
              <IconButton onClick={() => setExpanded(!expanded)} size="small">
                <ExpandMoreIcon 
                  sx={{ 
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s'
                  }} 
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="View billing suggestions">
              <IconButton 
                onClick={() => setShowBilling(!showBilling)} 
                size="small" 
                color={showBilling ? "primary" : "default"}
              >
                <ReceiptIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View muscle test analysis">
              <IconButton 
                onClick={() => setShowMuscleTests(!showMuscleTests)} 
                size="small" 
                color={showMuscleTests ? "primary" : "default"}
              >
                <FitnessCenterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete note">
              <IconButton onClick={() => onDelete(session.id)} size="small" color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
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
            
            {/* Billing Suggestions */}
            {showBilling && (
              <Box mt={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <ReceiptIcon sx={{ color: '#2563eb', mr: 1 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#2563eb'
                    }}
                  >
                    Billing Suggestions
                  </Typography>
                  <Tooltip title="AI-generated suggestions based on note content">
                    <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
                
                <TableContainer component={Paper} sx={{ 
                  borderRadius: 2,
                  boxShadow: 'none',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Justification</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {billingData.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell><strong>{item.code}</strong></TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.justification}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {/* Muscle Test Analysis */}
            {showMuscleTests && (
              <Box mt={4}>
                <Box display="flex" alignItems="center" mb={1}>
                  <FitnessCenterIcon sx={{ color: '#2563eb', mr: 1 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#2563eb'
                    }}
                  >
                    Muscle Test & ROM Analysis
                  </Typography>
                  <Chip 
                    label={`Confidence: ${muscleTestData.confidence}`}
                    size="small"
                    sx={{ 
                      ml: 1,
                      backgroundColor: 
                        muscleTestData.confidence === 'high' ? 'rgba(16, 185, 129, 0.2)' :
                        muscleTestData.confidence === 'medium' ? 'rgba(245, 158, 11, 0.2)' :
                        'rgba(239, 68, 68, 0.2)',
                      color:
                        muscleTestData.confidence === 'high' ? 'rgb(16, 185, 129)' :
                        muscleTestData.confidence === 'medium' ? 'rgb(245, 158, 11)' :
                        'rgb(239, 68, 68)',
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  {/* MMT Results */}
                  <TableContainer component={Paper} sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    flex: 1
                  }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={3} sx={{ fontWeight: 600, backgroundColor: 'rgba(219, 234, 254, 0.5)' }}>Manual Muscle Tests</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Muscle</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Side</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Grade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {muscleTestData.muscle_tests.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.muscle}</TableCell>
                            <TableCell>{item.side}</TableCell>
                            <TableCell><strong>{item.grade}</strong></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* ROM Results */}
                  <TableContainer component={Paper} sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    flex: 1
                  }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell colSpan={4} sx={{ fontWeight: 600, backgroundColor: 'rgba(219, 234, 254, 0.5)' }}>Range of Motion</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Movement</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>Side</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>AROM</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>PROM</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {muscleTestData.rom_values.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.movement}</TableCell>
                            <TableCell>{item.side}</TableCell>
                            <TableCell>{item.arom}</TableCell>
                            <TableCell>{item.prom}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}
            
            {/* Save button when editing */}
            {isEditing && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ 
                  mt: 3,
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
