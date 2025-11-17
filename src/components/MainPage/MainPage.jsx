/**
 * MainPage - Single page application container
 * Manages all states: idle, template selection, recording, editing, viewing
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppState, APP_STATES } from './StateManager';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import TemplateSelector from './TemplateSelector';
import RecordingInterface from './RecordingInterface';
import SOAPEditor from '../soap/SOAPEditor';
import TutorialModule from '../tutorial/TutorialModule';
import { ArrowLeft, LogOut, HelpCircle, Settings } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from '../ui/ThemeToggle';
import { authenticatedFetch } from '../../lib/authHeaders';

export default function MainPage() {
  const { appState, createNewNote, currentNote, sessionName, setSessionName, triggerRefresh, updateCurrentNote } = useAppState();
  const { signOut, user } = useAuth();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [greeting, setGreeting] = useState('Good Morning');
  
  // Get user's last name for personalized greeting
  const userLastName = user?.user_metadata?.last_name || '';
  const doctorName = userLastName ? `Dr. ${userLastName}` : 'Doctor';

  // Update greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Escape key closes modals
      if (e.key === 'Escape') {
        if (isTutorialOpen) {
          setIsTutorialOpen(false);
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        }
      }

      // '?' key opens help/tutorial
      if (e.key === '?' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        setIsTutorialOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTutorialOpen, isSettingsOpen]);

  const showBlob = [
    APP_STATES.IDLE,
    APP_STATES.TEMPLATE_SELECTED,
    APP_STATES.RECORDING,
    APP_STATES.PROCESSING
  ].includes(appState);

  const showSOAPEditor = [
    APP_STATES.EDITING,
    APP_STATES.VIEWING
  ].includes(appState);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] transition-colors">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        {/* Top Navbar */}
        <nav className="sticky top-0 z-30 bg-white/80 dark:bg-[#1a1a1a]/95 backdrop-blur-lg border-b border-black/5 dark:border-white/10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Left side - Back button with space for hamburger menu on mobile */}
            <div className="flex items-center gap-2">
              {showSOAPEditor && (
                <button
                  onClick={createNewNote}
                  className="flex items-center gap-2 px-3 py-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800 rounded-lg transition-colors lg:ml-0 ml-14"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <ThemeToggle />
              <button 
                onClick={() => setIsTutorialOpen(true)}
                className="p-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800 rounded-lg transition-colors"
                title="Help & Tutorial"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={async () => {
                  await signOut();
                }}
                className="flex items-center gap-2 px-3 py-2 text-grey-600 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 hover:bg-grey-50 dark:hover:bg-grey-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto px-8 py-12 relative">
          {/* Decorative gradient blob - BeeBot style */}
          <div 
            className="absolute top-20 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(var(--blue-primary-rgb), 0.15), transparent)'
            }}
          />
          
          <AnimatePresence mode="wait">
            {/* Blob + Template Selection + Recording */}
            {showBlob && (
              <motion.div
                key="blob-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-12 relative z-10"
              >
                {/* BeeBot-style Greeting with Sphere */}
                <div className="text-center space-y-6 mb-16 relative">
                  {/* Decorative Sphere with Logo */}
                  <div className="relative inline-block mb-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.6, 0.8, 0.6]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-32 h-32 mx-auto rounded-full blur-2xl"
                      style={{ 
                        background: 'radial-gradient(circle at 30% 30%, rgba(var(--blue-primary-rgb), 0.4), rgba(var(--blue-primary-rgb), 0.2))'
                      }}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 w-24 h-24 mx-auto my-auto rounded-full shadow-lg"
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, rgb(var(--blue-primary-rgb)), rgb(var(--blue-dark-rgb)))',
                        boxShadow: `0 0 60px rgba(var(--blue-primary-rgb), 0.5), 0 0 120px rgba(var(--blue-primary-rgb), 0.3)`
                      }}
                    />
                    {/* Logo on top of blob - synced animation */}
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Image 
                        src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                        alt="Doctors Orders Logo"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-contain drop-shadow-lg"
                      />
                    </motion.div>
                  </div>

                  <h1 className="text-4xl font-semibold text-grey-900 dark:text-grey-100">
                    {greeting}, {doctorName}
                  </h1>
                  <p className="text-xl text-blue-primary font-medium">
                    Ready to <span className="text-blue-primary">Document Your Session?</span>
                  </p>
                </div>

                {/* Template Selector */}
                <TemplateSelector />

                {/* Recording Interface */}
                <RecordingInterface />
              </motion.div>
            )}

            {/* SOAP Editor */}
            {showSOAPEditor && currentNote && (
              <motion.div
                key="soap-editor"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative z-10"
              >
                <SOAPEditor
                  soapData={currentNote.soap || {}}
                  onSoapChange={(updatedSoap) => {
                    console.log('🔄 SOAP changed in MainPage:', updatedSoap);
                    // Update the note object properly using state setter
                    const updatedNote = {
                      ...currentNote,
                      soap: updatedSoap
                    };
                    updateCurrentNote(updatedNote);
                  }}
                  sessionName={sessionName}
                  onSessionNameChange={setSessionName}
                  onSave={async (data) => {
                    console.log('💾 Saving SOAP note to Azure:', data);
                    try {
                      // Save to Azure PostgreSQL via API
                      const response = await authenticatedFetch('/api/phi/encounters', {
                        method: 'PUT',
                        body: JSON.stringify({ 
                          id: currentNote.id,
                          soap: data,
                          session_title: data.sessionName || sessionName || currentNote.session_title || 'Untitled Session',
                          status: 'draft'
                        })
                      });
                      
                      if (!response.ok) {
                        throw new Error('Save failed');
                      }
                      
                      const savedNote = await response.json();
                      
                      // Update current note reference with server response
                      Object.assign(currentNote, savedNote);
                      
                      // Update session name state if it was changed
                      if (data.sessionName && data.sessionName !== sessionName) {
                        setSessionName(data.sessionName);
                      }
                      
                      // Trigger sidebar refresh to show updated note
                      triggerRefresh();
                      
                      console.log('✅ Save successful - Note saved to Azure PostgreSQL');
                    } catch (error) {
                      console.error('❌ Error saving:', error);
                      throw error;
                    }
                  }}
                  onExport={async (data, format) => {
                    console.log(`📄 Exporting as ${format}:`, data);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Tutorial Modal */}
      <TutorialModule 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] dark:border dark:border-white/10 rounded-xl shadow-xl max-w-md w-full p-6 transition-colors"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100 flex items-center gap-2">
                  <Settings className="w-6 h-6" />
                  Settings
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 text-grey-500 dark:text-grey-400 hover:text-grey-900 dark:hover:text-grey-100 hover:bg-grey-50 dark:hover:bg-[#1f1f1f] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-grey-50 dark:bg-[#1f1f1f] rounded-lg transition-colors">
                  <h3 className="font-medium text-grey-900 dark:text-grey-100 mb-2">Theme</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-grey-600 dark:text-grey-300">
                      Switch between light and dark mode
                    </p>
                    <ThemeToggle />
                  </div>
                </div>

                <div className="p-4 bg-grey-50 dark:bg-[#1f1f1f] rounded-lg transition-colors">
                  <h3 className="font-medium text-grey-900 dark:text-grey-100 mb-2">Audio Settings</h3>
                  <p className="text-sm text-grey-600 dark:text-grey-300">
                    Microphone permissions are managed by your browser. Check your browser settings if you're experiencing recording issues.
                  </p>
                </div>
                
                <div className="p-4 bg-grey-50 dark:bg-[#1f1f1f] rounded-lg transition-colors">
                  <h3 className="font-medium text-grey-900 dark:text-grey-100 mb-2">Privacy</h3>
                  <p className="text-sm text-grey-600 dark:text-grey-300">
                    We never store patient identifiable information. All sessions are automatically deleted after 12 hours.
                  </p>
                </div>

                <div className="p-4 bg-grey-50 dark:bg-[#1f1f1f] rounded-lg transition-colors">
                  <h3 className="font-medium text-grey-900 dark:text-grey-100 mb-2">Keyboard Shortcuts</h3>
                  <div className="text-sm text-grey-600 dark:text-grey-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Submit form:</span>
                      <kbd className="px-2 py-1 bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/15 rounded text-xs">Enter</kbd>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancel:</span>
                      <kbd className="px-2 py-1 bg-white dark:bg-grey-800 border border-grey-200 dark:border-grey-600 rounded text-xs">Esc</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-grey-200 dark:border-white/10">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full px-4 py-2 text-white rounded-lg transition-colors bg-blue-primary dark:bg-blue-primary hover:bg-blue-dark dark:hover:bg-blue-dark"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
