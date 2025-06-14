import React, { useState, useEffect } from 'react';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useRouter } from 'next/router';

/**
 * Dashboard layout with sidebar and app bar
 * Controls page layout and navigation structure
 */
function DashboardLayout({ children }) {
  // Sidebar collapsed state (only for desktop)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Clear states on route change for mobile
  useEffect(() => {
    function handleRouteChange() {
      // No need to handle route changes now that sidebar is always visible on desktop
    }
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
  
  return (
    <div className="flex flex-col h-screen bg-[#fbfbfa] overflow-hidden">
      {/* Top navigation - always full width */}
      <div className="z-30 sticky top-0 w-full">
        <AppBar />
      </div>
      
      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - hidden on mobile, always visible on desktop */}
        <div className="hidden sm:block h-full">
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        </div>
        
        {/* Main content */}
        <main 
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'sm:ml-[72px]' : 'sm:ml-[260px]'}`}
        >
          <div className="mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation - only shown on mobile */}
      <div className="block sm:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

export default DashboardLayout;
