import React, { useState, useEffect } from 'react';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useRouter } from 'next/router';
import DashboardBackground from './DashboardBackground';
import TutorialModule from '@/components/tutorial/TutorialModule';
import TutorialPrompt from '@/components/tutorial/TutorialPrompt';
import useTutorial from '@/hooks/useTutorial';
import { AnimatePresence } from 'framer-motion';

/**
 * Dashboard layout with sidebar and app bar
 * Controls page layout and navigation structure
 */
function DashboardLayout({ children }) {
  // Sidebar collapsed state (only for desktop)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const {
    isTutorialOpen,
    shouldShowTutorialPrompt,
    openTutorial,
    closeTutorial,
    dismissTutorialPrompt
  } = useTutorial();

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
    <div className="flex flex-col h-screen overflow-hidden relative">
      <DashboardBackground />

      {/* Top navigation - Floating Glass */}
      <div className="z-30 sticky top-4 px-4 w-full">
        <AppBar />
      </div>

      {/* Tutorial Module */}
      <TutorialModule
        isOpen={isTutorialOpen}
        onClose={() => closeTutorial(true)}
      />

      {/* Tutorial Prompt for new users */}
      <AnimatePresence>
        {shouldShowTutorialPrompt && (
          <TutorialPrompt
            onStart={openTutorial}
            onDismiss={dismissTutorialPrompt}
          />
        )}
      </AnimatePresence>

      {/* Main content with sidebar layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Floating Glass on Desktop */}
        <div className="hidden sm:block h-full pt-4 pb-4 pl-4">
          <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
        </div>

        {/* Main content */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'sm:ml-[88px]' : 'sm:ml-[276px]'}`}
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
