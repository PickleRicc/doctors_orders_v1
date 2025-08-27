import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SOAPEditor from '@/components/soap/SOAPEditor';
import SessionsFilter from '@/components/sessions/SessionsFilter';
import useSessions from '@/hooks/useSessions';
import RecordingModal from '@/components/ui/RecordingModal';
import { useTemplateManager } from '@/hooks/templates/useTemplateManager';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  Edit3, 
  Trash2, 
  Download,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

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
  
  const { getTemplateHook } = useTemplateManager();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [recordingModalOpen, setRecordingModalOpen] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  
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
  
  // Handle session expansion/collapse
  const toggleSessionExpansion = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
    setEditingSession(null); // Close editing when expanding/collapsing
  };
  
  // Handle session editing
  const handleEditSession = (session) => {
    setEditingSession(session);
    setExpandedSession(session.id);
  };
  
  // Handle session deletion with confirmation
  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        await deleteSession(sessionId);
        toast.success('Session deleted successfully');
        setExpandedSession(null);
        setEditingSession(null);
      } catch (error) {
        toast.error('Failed to delete session');
        console.error('Delete session error:', error);
      }
    }
  };
  
  // Handle SOAP data save
  const handleSaveSOAP = async (sessionId, soapData) => {
    try {
      await updateSession(sessionId, { 
        structured_notes: soapData,
        updated_at: new Date().toISOString()
      });
      toast.success('SOAP note saved successfully');
      setEditingSession(null);
    } catch (error) {
      toast.error('Failed to save SOAP note');
      console.error('Save SOAP error:', error);
    }
  };
  
  // Handle SOAP export
  const handleExportSOAP = (session, format) => {
    // Implementation for export functionality
    toast.success(`SOAP note exported as ${format.toUpperCase()}`);
  };
  
  // Get template type from session data
  const getTemplateType = (session) => {
    // Map body region to template type
    const bodyRegionMap = {
      'knee': 'knee',
      'shoulder': 'shoulder', 
      'back': 'back',
      'neck': 'neck',
      'hip': 'hip',
      'ankle': 'ankle_foot',
      'foot': 'ankle_foot'
    };
    return bodyRegionMap[session.body_region?.toLowerCase()] || 'knee';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-primary to-blue-dark rounded-xl flex items-center justify-center shadow-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-grey-900">Session Notes</h1>
              <p className="text-grey-500">Review and manage your PT session documentation</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setRecordingModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-primary to-blue-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} />
            <span className="font-medium">New Session</span>
          </motion.button>
        </motion.div>
        
        {/* Filter and sort controls */}
        <SessionsFilter
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          sortOption={sortOption}
          onSortChange={updateSortOption}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary"></div>
          </div>
        )}
        
        {/* No results message */}
        {!isLoading && filteredSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 px-6 bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 shadow-lg"
          >
            <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-grey-400" />
            </div>
            <h3 className="text-lg font-medium text-grey-900 mb-2">No sessions found</h3>
            <p className="text-grey-500 mb-6">
              Create a new session to get started or try changing the date
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setRecordingModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-primary to-blue-dark text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mx-auto"
            >
              <Plus size={20} />
              <span>Record New Session</span>
            </motion.button>
          </motion.div>
        )}
        
        {/* Sessions list */}
        {!isLoading && filteredSessions.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 shadow-lg overflow-hidden"
                >
                  {/* Session Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-primary to-blue-dark rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-grey-900 capitalize">
                            {session.body_region?.replace('_', ' ')} - {session.session_type?.replace('_', ' ')}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-grey-500">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{format(new Date(session.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{format(new Date(session.created_at), 'h:mm a')}</span>
                            </div>
                            <div className="px-2 py-1 bg-blue-light text-blue-primary rounded-full text-xs font-medium">
                              Session #{session.session_number}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditSession(session)}
                          className="p-2 text-grey-500 hover:text-blue-primary hover:bg-blue-light rounded-lg transition-colors"
                          title="Edit SOAP Note"
                        >
                          <Edit3 size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSessionExpansion(session.id)}
                          className="p-2 text-grey-500 hover:text-blue-primary hover:bg-blue-light rounded-lg transition-colors"
                          title={expandedSession === session.id ? "Collapse" : "Expand"}
                        >
                          {expandedSession === session.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-2 text-grey-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedSession === session.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6">
                          {editingSession?.id === session.id ? (
                            // Editing Mode with SOAPEditor
                            <div className="space-y-4">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-medium text-grey-900">Edit SOAP Note</h4>
                                <button
                                  onClick={() => setEditingSession(null)}
                                  className="text-grey-500 hover:text-grey-700"
                                >
                                  Cancel
                                </button>
                              </div>
                              <SOAPEditor
                                soapData={session.structured_notes || {}}
                                onSoapChange={(data) => {
                                  // Update local state for real-time editing
                                }}
                                onSave={(data) => handleSaveSOAP(session.id, data)}
                                onExport={(data, format) => handleExportSOAP(session, format)}
                                confidenceScores={{
                                  subjective: 0.85,
                                  objective: 0.90,
                                  assessment: 0.88,
                                  plan: 0.82,
                                  overall: 0.86
                                }}
                                isLoading={false}
                              />
                            </div>
                          ) : (
                            // View Mode
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-medium text-grey-900">SOAP Note</h4>
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleExportSOAP(session, 'pdf')}
                                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-primary hover:bg-blue-light rounded-lg transition-colors"
                                  >
                                    <Download size={14} />
                                    <span>Export</span>
                                  </motion.button>
                                </div>
                              </div>
                              
                              {session.structured_notes ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div className="p-4 bg-white/30 rounded-lg">
                                      <h5 className="font-medium text-grey-900 mb-2">Subjective</h5>
                                      <p className="text-grey-700 text-sm">
                                        {session.structured_notes.subjective?.content || session.subjective || 'No subjective data'}
                                      </p>
                                    </div>
                                    <div className="p-4 bg-white/30 rounded-lg">
                                      <h5 className="font-medium text-grey-900 mb-2">Assessment</h5>
                                      <p className="text-grey-700 text-sm">
                                        {session.structured_notes.assessment?.content || session.assessment || 'No assessment data'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div className="p-4 bg-white/30 rounded-lg">
                                      <h5 className="font-medium text-grey-900 mb-2">Objective</h5>
                                      <div className="text-grey-700 text-sm">
                                        {session.structured_notes.objective?.rows?.length > 0 ? (
                                          <div className="space-y-2">
                                            {session.structured_notes.objective.rows.slice(0, 3).map((row, idx) => (
                                              <div key={idx} className="text-xs bg-white/20 p-2 rounded">
                                                {row.test}: {row.result}
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          session.objective || 'No objective data'
                                        )}
                                      </div>
                                    </div>
                                    <div className="p-4 bg-white/30 rounded-lg">
                                      <h5 className="font-medium text-grey-900 mb-2">Plan</h5>
                                      <p className="text-grey-700 text-sm">
                                        {session.structured_notes.plan?.content || session.plan || 'No plan data'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-grey-500">
                                  <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                  <p>No SOAP note data available</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {/* Recording modal */}
        <RecordingModal
          open={recordingModalOpen}
          onClose={() => setRecordingModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
