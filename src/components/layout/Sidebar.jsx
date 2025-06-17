import React, { useEffect, useState } from 'react';
import { Home, FileText, Settings, Plus, Calendar, Clock, ChevronRight, Clipboard, X, ChevronsLeft, ChevronsRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSessions from '@/hooks/useSessions';
import { format } from 'date-fns';
import { ShimmerButton } from '@/components/magicui/shimmer-button';

/**
 * Sidebar navigation component 
 * Follows Notion-inspired style with collapsible design
 * Always visible on desktop, collapsible for more space
 */
function Sidebar({ collapsed = false, onToggleCollapse }) {
  const router = useRouter();
  const currentPath = router.pathname;
  const { sessions, isLoading, error, fetchSessionsByDate } = useSessions();
  const [todaySessions, setTodaySessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  
  // Check if the current route matches a given path
  const isActive = (path) => currentPath === path;
  
  // Load sessions when component mounts
  useEffect(() => {
    const loadSessions = async () => {
      // Fetch today's sessions
      const today = new Date();
      const sessionsData = await fetchSessionsByDate(today);
      
      if (sessionsData && sessionsData.length) {
        // Get today's sessions
        setTodaySessions(sessionsData.slice(0, 3)); // Show max 3 sessions for today
        
        // Get recent sessions (last 5)
        setRecentSessions(sessionsData.slice(0, 5));
      }
    };
    
    loadSessions();
  }, [fetchSessionsByDate]);
  
  // Format session time from ISO string
  const formatSessionTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Time unavailable';
    }
  };
  
  // Get friendly display name for body region
  const getBodyRegionDisplay = (bodyRegion) => {
    const regionMap = {
      'ankle_foot': 'Ankle/Foot',
      'knee': 'Knee',
      'hip': 'Hip',
      'lumbar': 'Low Back',
      'cervical': 'Neck',
      'shoulder': 'Shoulder',
      'elbow': 'Elbow',
      'wrist_hand': 'Wrist/Hand',
      'general': 'General'
    };
    return regionMap[bodyRegion] || bodyRegion;
  };
  
  // Handle new session button click
  const handleNewSession = () => {
    router.push('/record');
  };
  
  // Sidebar classes based on collapsed state
  const sidebarClasses = collapsed
    ? 'fixed mt-16 left-0 top-0 bottom-0 w-[72px] bg-[rgba(219,234,254,0.7)] backdrop-blur-lg border-r border-[#e9e9e7] transition-all duration-300 ease-in-out z-20 overflow-hidden'
    : 'fixed mt-16 left-0 top-0 bottom-0 w-[260px] bg-[rgba(219,234,254,0.7)] backdrop-blur-lg border-r border-[#e9e9e7] transition-all duration-300 ease-in-out z-20 overflow-y-auto';
  
  return (
    <aside className={sidebarClasses}>
      <div className={`p-4 h-full flex flex-col ${collapsed ? 'items-center' : ''}`}>
        {/* Collapse/Expand button */}
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'justify-end'} mb-3`}>
          <button 
            onClick={onToggleCollapse}
            className="p-1.5 hover:bg-[rgba(219,234,254,0.5)] rounded-md text-[#2563eb] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          </button>
        </div>
          {/* Quick Action Button */}
          {collapsed ? (
            <button 
              onClick={handleNewSession} 
              className="w-10 h-10 p-0 flex items-center justify-center bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:shadow-md hover:translate-y-[-2px] text-white rounded-lg transition-all duration-200 mb-6"
            >
              <Plus size={20} />
            </button>
          ) : (
            <ShimmerButton 
              onClick={handleNewSession}
              shimmerColor="rgba(255, 255, 255, 0.5)" /* Increased opacity for more visibility */
              shimmerDuration="1.5s" /* Faster animation */
              shimmerSize="0.2em" /* Larger shimmer size */
              borderRadius="0.75rem"
              background="linear-gradient(to right, #2563eb, #1d4ed8)"
              className="w-full flex items-center justify-between mb-6 py-2.5"
            >
              <div className="flex items-center">
                <Plus size={18} className="mr-2" />
                <span className="font-medium">New Session</span>
              </div>
              <ChevronRight size={18} />
            </ShimmerButton>
          )}
          
          {/* Navigation Sections */}
          <nav className="w-full">
            {/* Main Navigation */}
            <div className="mb-6">
              {!collapsed && (
                <h3 className="px-3 text-xs font-medium text-[#4b5563] uppercase tracking-wider mb-2">
                  Main
                </h3>
              )}
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/dashboard"
                    className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-lg ${isActive('/dashboard') 
                      ? 'text-[#111827] bg-[rgba(37,99,235,0.1)]' 
                      : 'text-[#4b5563] hover:text-[#111827] hover:bg-[rgba(219,234,254,0.3)]'} transition-colors`}
                  >
                    <Home size={collapsed ? 22 : 18} className={collapsed ? '' : `mr-3 ${isActive('/dashboard') ? 'text-[#2563eb]' : ''}`} />
                    {!collapsed && <span className="font-medium">Dashboard</span>}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/sessions"
                    className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-lg ${isActive('/sessions') 
                      ? 'text-[#111827] bg-[rgba(37,99,235,0.1)]' 
                      : 'text-[#4b5563] hover:text-[#111827] hover:bg-[rgba(219,234,254,0.3)]'} transition-colors`}
                  >
                    <Clipboard size={collapsed ? 22 : 18} className={collapsed ? '' : `mr-3 ${isActive('/sessions') ? 'text-[#2563eb]' : ''}`} />
                    {!collapsed && <span className="font-medium">Sessions</span>}
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/templates"
                    className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-lg ${isActive('/templates') 
                      ? 'text-[#111827] bg-[rgba(37,99,235,0.1)]' 
                      : 'text-[#4b5563] hover:text-[#111827] hover:bg-[rgba(219,234,254,0.3)]'} transition-colors`}
                  >
                    <FileText size={collapsed ? 22 : 18} className={collapsed ? '' : `mr-3 ${isActive('/templates') ? 'text-[#2563eb]' : ''}`} />
                    {!collapsed && <span className="font-medium">Templates</span>}
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Today's Sessions - Only show when not collapsed */}
            {!collapsed && (
              <div className="mb-6">
                <h3 className="px-3 text-xs font-medium text-[#4b5563] uppercase tracking-wider mb-2">
                  Today
                </h3>
                <ul className="space-y-1">
                  {isLoading ? (
                    <li>
                      <div className="flex justify-between items-center text-[#9ca3af] px-3 py-1">
                        <span className="text-sm">Loading sessions...</span>
                      </div>
                    </li>
                  ) : error ? (
                    <li>
                      <div className="flex items-center text-red-500 px-3 py-1">
                        <AlertCircle size={14} className="mr-2" />
                        <span className="text-sm">Error loading sessions</span>
                      </div>
                    </li>
                  ) : todaySessions.length === 0 ? (
                    <li>
                      <div className="flex justify-between items-center text-[#9ca3af] px-3 py-1">
                        <span className="text-sm">No sessions today</span>
                      </div>
                    </li>
                  ) : (
                    todaySessions.map(session => (
                      <li key={session.id}>
                        <Link
                          href={`/sessions/${session.id}`}
                          className="flex items-center justify-between text-[#4b5563] hover:text-[#111827] hover:bg-[rgba(219,234,254,0.3)] px-3 py-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center">
                            <Clock size={16} className="mr-3" />
                            <span className="truncate">{getBodyRegionDisplay(session.body_region)}</span>
                          </div>
                          <span className="text-xs text-[#9ca3af]">{formatSessionTime(session.created_at)}</span>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            
            {/* Recent Sessions - Only show when not collapsed */}
            {!collapsed && (
              <div className="mb-6">
                <h3 className="px-3 text-xs font-medium text-[#4b5563] uppercase tracking-wider mb-2 flex justify-between">
                  <span>Recent</span>
                  <Link href="/sessions" className="text-[#2563eb] hover:text-[#1d4ed8] cursor-pointer">See all</Link>
                </h3>
                <ul className="space-y-1">
                  {isLoading ? (
                    <li>
                      <div className="flex justify-between items-center text-[#9ca3af] px-3 py-1">
                        <span className="text-sm">Loading sessions...</span>
                      </div>
                    </li>
                  ) : error ? (
                    <li>
                      <div className="flex items-center text-red-500 px-3 py-1">
                        <AlertCircle size={14} className="mr-2" />
                        <span className="text-sm">Error loading sessions</span>
                      </div>
                    </li>
                  ) : recentSessions.length === 0 ? (
                    <li>
                      <div className="flex justify-between items-center text-[#9ca3af] px-3 py-1">
                        <span className="text-sm">No recent sessions</span>
                      </div>
                    </li>
                  ) : (
                    recentSessions.map(session => (
                      <li key={session.id}>
                        <Link
                          href={`/sessions/${session.id}`}
                          className="flex items-center justify-between text-[#4b5563] hover:text-[#111827] hover:bg-[rgba(219,234,254,0.3)] px-3 py-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center">
                            <Clock size={16} className="mr-3" />
                            <span className="truncate">
                              {getBodyRegionDisplay(session.body_region)} - {session.session_type && session.session_type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
            
            {/* Settings */}
            <div>
              {!collapsed && (
                <h3 className="px-3 text-xs font-medium text-[#4b5563] uppercase tracking-wider mb-2">
                  Other
                </h3>
              )}
              <ul className="space-y-1">
                <li>
                  <Link 
                    href="/settings"
                    className={`flex items-center ${collapsed ? 'justify-center' : ''} px-3 py-3 rounded-lg ${isActive('/settings') 
                      ? 'text-[#111827] bg-[rgba(37,99,235,0.1)]' 
                      : 'text-[#4b5563] hover:text-[#111827] hover:bg-[rgba(219,234,254,0.3)]'} transition-colors`}
                  >
                    <Settings size={collapsed ? 22 : 16} className={collapsed ? '' : `mr-3 ${isActive('/settings') ? 'text-[#2563eb]' : ''}`} />
                    {!collapsed && <span>Settings</span>}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>
  );
}

export default Sidebar;
