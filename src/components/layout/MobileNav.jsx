import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Home, FileText, Plus, Clipboard } from 'lucide-react';

/**
 * Mobile navigation dock that appears at bottom of screen on mobile devices
 * Provides quick access to main app sections and recording button
 */
export default function MobileNav() {
  const router = useRouter();
  const currentPath = router.pathname;
  
  // Check if the current route matches a given path
  const isActive = (path) => currentPath.includes(path);
  
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#f1f1ef] px-2 py-2 backdrop-blur-md bg-opacity-95 shadow-lg">
      <div className="flex items-center justify-around">
        <Link href="/dashboard" className="flex flex-col items-center">
          <div className={`p-2 rounded-lg ${isActive('/dashboard') 
            ? 'bg-[#dbeafe] text-[#2563eb]' 
            : 'text-[#4b5563]'}`}>
            <Home size={22} />
          </div>
          <span className="text-xs mt-0.5 font-medium">Home</span>
        </Link>
        
        <Link href="/templates" className="flex flex-col items-center">
          <div className={`p-2 rounded-lg ${isActive('/templates') 
            ? 'bg-[#dbeafe] text-[#2563eb]' 
            : 'text-[#4b5563]'}`}>
            <FileText size={22} />
          </div>
          <span className="text-xs mt-0.5 font-medium">Templates</span>
        </Link>
        
        {/* Recording button (center, floating) */}
        <Link href="/recording" className="flex flex-col items-center relative">
          <div className="p-3 rounded-full bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] shadow-lg -mt-6 text-white">
            <Plus size={26} />
          </div>
          <span className="text-xs mt-1 font-medium">Record</span>
        </Link>
        
        <Link href="/sessions" className="flex flex-col items-center">
          <div className={`p-2 rounded-lg ${isActive('/sessions') 
            ? 'bg-[#dbeafe] text-[#2563eb]' 
            : 'text-[#4b5563]'}`}>
            <Clipboard size={22} />
          </div>
          <span className="text-xs mt-0.5 font-medium">Sessions</span>
        </Link>
      </div>
      
      {/* Safe area for bottom navigation (especially on iOS) */}
      <div className="h-safe-bottom bg-white bg-opacity-95"></div>
    </div>
  );
}
