/**
 * Sidebar - Collapsible sidebar with note list
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, FileText, Calendar, Folder } from 'lucide-react';
import { useAppState } from './StateManager';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import Image from 'next/image';

// Using CSS variable for blue-primary instead of hardcoded value

// All templates use the same note icon, just color-coded

export default function Sidebar({ onOpenTemplates }) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false); // Start as false, will be set to true when fetching
  const { viewNote, appState, refreshTrigger } = useAppState();
  const { user } = useAuth();
  const isFetchingRef = useRef(false);
  const tokenCacheRef = useRef({ token: null, expiresAt: 0 });

  // Fast token getter with caching
  const getAccessToken = useCallback(async () => {
    // Check cache first (valid for 5 minutes)
    const now = Date.now();
    if (tokenCacheRef.current.token && tokenCacheRef.current.expiresAt > now) {
      return tokenCacheRef.current.token;
    }

    // Get fresh token from Supabase (reads from localStorage, very fast)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (token) {
        // Cache token for 5 minutes
        tokenCacheRef.current = {
          token,
          expiresAt: now + (5 * 60 * 1000)
        };
        return token;
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }

    return null;
  }, []);

  // Memoized fetch function to prevent infinite loops
  const fetchNotes = useCallback(async () => {
    // Prevent multiple concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      // Only fetch if we're in the browser
      if (typeof window === 'undefined') return;
      if (!user) {
        setLoading(false);
        return;
      }

      isFetchingRef.current = true;
      setLoading(true);

      // Get access token (cached for performance)
      const accessToken = await getAccessToken();

      if (!accessToken) {
        console.error('No access token available');
        setNotes([]);
        setLoading(false);
        return;
      }

      // Fetch from Azure PostgreSQL API with auth token
      const response = await fetch('/api/phi/encounters?limit=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.encounters || []);
      } else if (response.status === 401) {
        // Token expired, clear cache and retry once
        tokenCacheRef.current = { token: null, expiresAt: 0 };
        console.error('Unauthorized - token may have expired');
        setNotes([]);
      } else {
        console.error('Failed to fetch encounters:', response.statusText);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user, getAccessToken]);

  // Fetch notes from Azure API on mount and when refreshTrigger changes
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [refreshTrigger, user, fetchNotes]);

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.session_title?.toLowerCase().includes(query) ||
      note.template_type?.toLowerCase().includes(query) ||
      note.custom_template_name?.toLowerCase().includes(query)
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

  // Format template type for display - use custom template name if available
  const formatTemplateType = (note) => {
    // If it's a custom template and we have the name, use it
    if (note.custom_template_id && note.custom_template_name) {
      return note.custom_template_name;
    }

    // Otherwise, format the template_type nicely
    const templateType = note.template_type || 'Unknown';

    // Remove 'custom-' prefix if present (fallback)
    const cleanType = templateType.replace(/^custom-[a-f0-9-]+$/, 'Custom Template');

    // Capitalize and format nicely
    return cleanType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {/* Mobile Toggle Button - Only show when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-xl shadow-lg border border-black/5 dark:border-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-grey-900 dark:text-grey-100" />
          </motion.button>
        )}
      </AnimatePresence>

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
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-4 top-4 bottom-4 w-[calc(100vw-2rem)] max-w-[20rem] lg:w-80 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-2xl z-50 flex flex-col border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl transition-colors"
            >
              {/* Header */}
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between w-full">
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

                  {/* Mobile Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6 text-grey-500 dark:text-grey-400" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-500 dark:text-grey-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-black/20 border border-grey-200 dark:border-white/10 rounded-xl text-sm text-grey-900 dark:text-grey-100 placeholder-grey-500 dark:placeholder-grey-400 focus:outline-none transition-all"
                    style={{
                      '--tw-ring-color': 'rgba(var(--blue-primary-rgb), 0.2)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgb(var(--blue-primary-rgb))';
                      e.target.style.boxShadow = `0 0 0 3px rgba(var(--blue-primary-rgb), 0.1)`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.boxShadow = '';
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="px-6 py-2">
                <div className="h-px bg-grey-200 dark:bg-white/10" />
              </div>

              {/* My Templates Navigation */}
              <div className="px-4 py-2">
                <button
                  onClick={() => {
                    if (onOpenTemplates) {
                      onOpenTemplates();
                    }
                    // Close sidebar on mobile
                    if (window.innerWidth < 1024) {
                      setIsOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-grey-700 dark:text-grey-300 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                >
                  <Folder className="w-5 h-5 text-grey-500 dark:text-grey-400 group-hover:text-blue-primary" />
                  <span className="font-medium">My Templates</span>
                </button>
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
                    <div
                      className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-2"
                      style={{
                        borderColor: 'rgb(var(--blue-primary-rgb))',
                        borderTopColor: 'transparent'
                      }}
                    />
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
                      className="w-full p-3 text-left transition-all group border-b border-grey-200/50 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl mb-1"
                    >
                      <div className="flex items-start gap-3">
                        {/* Template Icon */}
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: 'rgba(var(--blue-primary-rgb), 0.15)',
                            color: 'rgb(var(--blue-primary-rgb))'
                          }}
                        >
                          <FileText className="w-5 h-5" />
                        </div>

                        {/* Note Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-grey-900 dark:text-grey-100 truncate transition-colors group-hover:text-blue-primary">
                            {note.session_title || `${formatTemplateType(note)} Evaluation`}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-grey-500 dark:text-grey-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(note.created_at)}</span>
                          </div>
                          <div className="mt-1">
                            <span
                              className="inline-block px-2 py-0.5 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: 'rgba(var(--blue-primary-rgb), 0.15)',
                                color: 'rgb(var(--blue-primary-rgb))'
                              }}
                            >
                              {formatTemplateType(note)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-transparent border-t border-grey-200/50 dark:border-white/10">
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
