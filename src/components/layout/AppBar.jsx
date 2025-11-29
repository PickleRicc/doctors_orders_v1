import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProfession, PROFESSIONS } from '../../hooks/useProfession';
import { Menu, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Glassmorphic AppBar component for main navigation
 * Supports both Physical Therapy and Chiropractic users with dynamic terminology
 * Follows the style guide with glassmorphic effect and responsive design
 */
function AppBar({ onMenuClick, sidebarOpen }) {
  const { user, signOut } = useAuth();
  const { profession, getProfessionShortName } = useProfession();
  const router = useRouter();

  // Use router path for active tab state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Set active tab based on current route
  useEffect(() => {
    const path = router.pathname;
    if (path.includes('/dashboard')) {
      setActiveTab('dashboard');
    } else if (path.includes('/templates')) {
      setActiveTab('templates');
    } else if (path.includes('/sessions')) {
      setActiveTab('sessions');
    } else if (path.includes('/settings')) {
      setActiveTab('settings');
    }
  }, [router.pathname]);

  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="transition-all duration-300 ease-in-out rounded-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
      <div className="w-full px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side with logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className={`p-2 mr-2 rounded-lg text-[#4b5563] hover:bg-[rgba(255,255,255,0.3)] hover:text-[#1f1f1f] transition-colors ${sidebarOpen ? 'bg-[rgba(255,255,255,0.3)]' : ''}`}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            {/* App Logo */}
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] flex items-center justify-center text-white font-medium shadow-sm">
                <span className="text-sm font-semibold">DO</span>
              </div>
              <span className="text-base sm:text-lg font-semibold text-[#111827] hidden sm:block">
                Doctors Orders
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* Notification Bell */}
            <button className="p-2 rounded-lg text-[#4b5563] hover:bg-[rgba(255,255,255,0.3)] transition-colors relative mr-1">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#2563eb] rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center space-x-2 rounded-lg hover:bg-[rgba(255,255,255,0.3)] p-1.5 pr-1 sm:pr-2.5 transition-colors">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-[#2563eb]/20 to-[#2563eb]/40 backdrop-blur-sm border border-white/30 flex items-center justify-center text-[#2563eb] font-medium shadow-sm">
                  {user?.user_metadata?.first_name?.[0] || 'T'}
                </div>
                <span className="text-sm font-medium text-[#111827] hidden md:block truncate max-w-[100px] lg:max-w-[150px]">
                  {user?.user_metadata?.full_name || getProfessionShortName()}
                </span>
                <ChevronDown size={16} className="text-[#4b5563] hidden md:block" />
              </button>

              {/* User dropdown menu would be implemented here with state */}
            </div>

            {/* Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className="ml-1 sm:ml-2 flex items-center space-x-1 text-sm text-[#4b5563] hover:text-[#ef4444] transition-colors p-2 rounded-lg hover:bg-[rgba(239,68,68,0.05)]"
                aria-label="Log out"
              >
                <LogOut size={18} />
                <span className="hidden md:inline-block">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppBar;
