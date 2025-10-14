/**
 * MainPage - Single page application container
 * Manages all states: idle, template selection, recording, editing, viewing
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppState, APP_STATES } from './StateManager';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import TemplateSelector from './TemplateSelector';
import RecordingInterface from './RecordingInterface';
import SOAPEditor from '../soap/SOAPEditor';
import { ArrowLeft, LogOut, HelpCircle, Settings } from 'lucide-react';
import Image from 'next/image';

export default function MainPage() {
  const { appState, createNewNote, currentNote, sessionName, setSessionName, triggerRefresh, updateCurrentNote } = useAppState();
  const { signOut } = useAuth();

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
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-80 min-h-screen">
        {/* Top Navbar */}
        <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-black/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {showSOAPEditor && (
                <button
                  onClick={createNewNote}
                  className="flex items-center gap-2 px-3 py-2 text-grey-600 hover:text-grey-900 hover:bg-grey-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-50 rounded-lg transition-colors"
                title="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button 
                className="p-2 text-grey-600 hover:text-grey-900 hover:bg-grey-50 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={async () => {
                  await signOut();
                }}
                className="flex items-center gap-2 px-3 py-2 text-grey-600 hover:text-grey-900 hover:bg-grey-50 rounded-lg transition-colors"
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
          <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-blue-primary/20 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
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
                        background: 'radial-gradient(circle at 30% 30%, rgba(0, 122, 255, 0.4), rgba(88, 86, 214, 0.3))'
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
                        background: 'radial-gradient(circle at 30% 30%, #5AC8FA, #007AFF)',
                        boxShadow: '0 0 60px rgba(0, 122, 255, 0.5), 0 0 120px rgba(0, 122, 255, 0.3)'
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

                  <h1 className="text-4xl font-semibold text-grey-900">
                    Good Morning, Doctor
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
                      const response = await fetch('/api/phi/encounters', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          id: currentNote.id,
                          soap: data,
                          session_title: sessionName || 'Untitled Session',
                          status: 'draft'
                        })
                      });
                      
                      if (!response.ok) {
                        throw new Error('Save failed');
                      }
                      
                      const savedNote = await response.json();
                      
                      // Update current note reference with server response
                      Object.assign(currentNote, savedNote);
                      
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
    </div>
  );
}
