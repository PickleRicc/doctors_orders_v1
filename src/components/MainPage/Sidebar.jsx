/**
 * Sidebar - Collapsible sidebar with note list
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, FileText, Calendar } from 'lucide-react';
import { useAppState } from './StateManager';
import Image from 'next/image';

// Using CSS variable for blue-primary instead of hardcoded value

// All templates use the same note icon, just color-coded

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { viewNote, appState, refreshTrigger } = useAppState();

  // Fetch notes from Azure API on mount and when refreshTrigger changes
  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger]);

  const fetchNotes = async () => {
    try {
      // Only fetch if we're in the browser
      if (typeof window === 'undefined') return;
      
      setLoading(true);
      
      // Fetch from Azure PostgreSQL API
      const response = await fetch('/api/phi/encounters?limit=50');
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.encounters || []);
      } else {
        console.error('Failed to fetch encounters:', response.statusText);
        setNotes([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.session_title?.toLowerCase().includes(query) ||
      note.template_type?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white/90 dark:bg-grey-800/90 backdrop-blur-12 rounded-lg shadow-sm border border-black/5 dark:border-white/10 transition-colors"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6 text-grey-900 dark:text-grey-100" /> : <Menu className="w-6 h-6 text-grey-900 dark:text-grey-100" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar Content */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-grey-50 dark:bg-[#1a1a1a] z-40 flex flex-col border-r border-grey-200 dark:border-white/10 transition-colors"
            >
              {/* Header */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex-shrink-0">
                    <Image 
                      src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                      alt="Doctors Orders Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-xl font-semibold text-grey-900 dark:text-grey-100">Doctors Orders</h1>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-500 dark:text-grey-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1f1f1f] border border-grey-200 dark:border-white/15 rounded-lg text-sm text-grey-900 dark:text-grey-100 placeholder-grey-500 dark:placeholder-grey-400 focus:outline-none focus:ring-2 focus:ring-blue-primary/20 dark:focus:ring-blue-primary/30 focus:border-blue-primary transition-all"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="px-6 py-2">
                <div className="h-px bg-grey-200 dark:bg-white/10" />
              </div>

              {/* Recent Notes Header */}
              <div className="px-6 py-2">
                <h3 className="text-xs font-semibold text-grey-500 dark:text-grey-400 uppercase tracking-wide">Recent Notes</h3>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {loading ? (
                  <div className="text-center py-8 text-grey-500 dark:text-grey-400">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-primary dark:border-blue-primary border-t-transparent rounded-full mx-auto mb-2" />
                    Loading notes...
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="text-center py-8 text-grey-500 dark:text-grey-400">
                    {searchQuery ? (
                      <>
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium mb-1">No notes match your search</p>
                        <p className="text-xs">Try a different search term</p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium mb-1">No notes yet</p>
                        <p className="text-xs">Start by selecting a template and recording a session</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <motion.button
                      key={note.id}
                      onClick={() => {
                        viewNote(note);
                        // Only close on mobile (screens smaller than lg breakpoint)
                        if (window.innerWidth < 1024) {
                          setIsOpen(false);
                        }
                      }}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full p-3 text-left transition-all group border-b border-grey-200 dark:border-white/10 dark:hover:bg-[#1f1f1f]"
                    >
                      <div className="flex items-start gap-3">
                        {/* Template Icon */}
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-primary/15 dark:bg-blue-primary/20 text-blue-primary dark:text-blue-primary"
                        >
                          <FileText className="w-5 h-5" />
                        </div>

                        {/* Note Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-grey-900 dark:text-grey-100 truncate transition-colors group-hover:text-blue-primary dark:group-hover:text-blue-primary">
                            {note.session_title || `${note.template_type} Evaluation`}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-grey-500 dark:text-grey-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(note.created_at)}</span>
                          </div>
                          <div className="mt-1">
                            <span 
                              className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-primary/15 dark:bg-blue-primary/20 text-blue-primary dark:text-blue-primary"
                            >
                              {note.template_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-grey-50/50 dark:bg-[#1a1a1a] border-t border-grey-200 dark:border-white/10">
                <p className="text-xs text-grey-500 dark:text-grey-400 text-center">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
