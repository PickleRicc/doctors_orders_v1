import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, CircularProgress, Button } from '@mui/material';
import { Add as AddIcon, NoteAlt as NoteAltIcon } from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SOAPNoteCard from '@/components/sessions/SOAPNoteCard';
import SessionsFilter from '@/components/sessions/SessionsFilter';
import useSessions from '@/hooks/useSessions';
import RecordingModal from '@/components/ui/RecordingModal';
import { motion } from 'framer-motion';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export default function SessionsPage() {
  const { 
    sessions, 
    isLoading, 
    error, 
    sortOption, 
    fetchSessionsByDate, 
    updateSession, 
    deleteSession, 
    updateSortOption 
  } = useSessions();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  
  // Apply search filter whenever sessions, searchQuery change
  useEffect(() => {
    if (!sessions) return setFilteredSessions([]);
    
    if (!searchQuery) {
      setFilteredSessions(sessions);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = sessions.filter(session => 
      session.body_region.toLowerCase().includes(query) ||
      session.session_type.toLowerCase().includes(query)
    );
    
    setFilteredSessions(filtered);
  }, [sessions, searchQuery]);
  
  // Fetch sessions when date changes
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchSessionsByDate(newDate);
  };
  
  // Handle session deletion with confirmation
  const handleDeleteClick = (sessionId) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 4, 
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: '#1f1f1f',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}
          >
            <NoteAltIcon 
              sx={{ 
                mr: 1, 
                verticalAlign: 'bottom', 
                color: '#2563eb'
              }} 
            />
            Session Notes
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setRecordingModalOpen(true)}
            sx={{ 
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              borderRadius: '8px',
              px: 3,
              '&:hover': {
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
              }
            }}
          >
            New Session
          </Button>
        </Box>
        
        {/* Filter and sort controls */}
        <SessionsFilter
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          sortOption={sortOption}
          onSortChange={updateSortOption}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Error message if any */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
          >
            {error}
          </Alert>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8
            }}
          >
            <CircularProgress />
          </Box>
        )}
        
        {/* No results message */}
        {!isLoading && filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 8, 
                px: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px dashed rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No sessions found for this date
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a new session to get started or try changing the date
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setRecordingModalOpen(true)}
                sx={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                }}
              >
                Record New Session
              </Button>
            </Box>
          </motion.div>
        )}
        
        {/* Sessions list */}
        {!isLoading && filteredSessions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {filteredSessions.map((session) => (
              <SOAPNoteCard
                key={session.id}
                session={session}
                onUpdate={updateSession}
                onDelete={handleDeleteClick}
              />
            ))}
          </Box>
        )}
        
        {/* Recording modal */}
        <RecordingModal
          open={recordingModalOpen}
          onClose={() => setRecordingModalOpen(false)}
        />
        
        {/* Confirm delete dialog */}
        <ConfirmationDialog
          isOpen={deleteDialogOpen}
          title="Delete Session"
          message="Are you sure you want to delete this session? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteDialogOpen(false)}
        />
      </Container>
    </DashboardLayout>
  );
}
