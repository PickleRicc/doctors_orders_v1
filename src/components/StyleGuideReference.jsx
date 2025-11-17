import React from 'react';

/**
 * Style Guide Reference component
 * Shows the working color palette for the application using our arbitrary value approach
 * Based on Apple/Notion/Glassmorphism style guide
 */
const StyleGuideReference = () => {
  return (
    <div className="p-6 bg-[#fbfbfa] rounded-xl border border-[#f1f1ef] shadow-sm">
      <h2 className="text-xl font-semibold text-[#1f1f1f] mb-4">Style Guide Reference</h2>
      
      {/* Primary Colors */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-[#a8a29e] uppercase tracking-wider mb-3">Primary Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <div className="h-16 bg-blue-primary rounded-lg mb-2"></div>
            <span className="text-xs font-medium">Blue Primary</span>
            <span className="text-xs text-[#a8a29e]">Theme-aware</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-blue-primary/10 rounded-lg mb-2"></div>
            <span className="text-xs font-medium">Blue Light</span>
            <span className="text-xs text-[#a8a29e]">Theme-aware/10</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-gradient-to-r from-blue-primary to-[#5856D6] rounded-lg mb-2"></div>
            <span className="text-xs font-medium">Blue Gradient</span>
            <span className="text-xs text-[#a8a29e]">Theme gradient</span>
          </div>
        </div>
      </div>
      
      {/* Glassmorphism Palette */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-[#a8a29e] uppercase tracking-wider mb-3">Glassmorphism</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <div className="h-16 bg-[rgba(255,255,255,0.25)] backdrop-blur rounded-lg border border-[#f1f1ef] mb-2"></div>
            <span className="text-xs font-medium">Glass Light</span>
            <span className="text-xs text-[#a8a29e]">rgba(255,255,255,0.25)</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[rgba(255,255,255,0.18)] backdrop-blur rounded-lg border border-[#f1f1ef] mb-2"></div>
            <span className="text-xs font-medium">Glass Medium</span>
            <span className="text-xs text-[#a8a29e]">rgba(255,255,255,0.18)</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[rgba(0,0,0,0.05)] rounded-lg mb-2"></div>
            <span className="text-xs font-medium">Glass Dark</span>
            <span className="text-xs text-[#a8a29e]">rgba(0,0,0,0.05)</span>
          </div>
        </div>
        <div className="mt-4 p-4 bg-[rgba(255,255,255,0.25)] backdrop-blur rounded-lg border border-[#f1f1ef]">
          <span className="text-sm">Example glassmorphic container with backdrop-blur</span>
        </div>
      </div>
      
      {/* Neutral Palette */}
      <div>
        <h3 className="text-sm font-medium text-[#a8a29e] uppercase tracking-wider mb-3">Neutral Palette (Notion-Inspired)</h3>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          <div className="flex flex-col">
            <div className="h-16 bg-[#ffffff] rounded-lg border border-[#f1f1ef] mb-2"></div>
            <span className="text-xs font-medium">Pure White</span>
            <span className="text-xs text-[#a8a29e]">#ffffff</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[#fbfbfa] rounded-lg border border-[#f1f1ef] mb-2"></div>
            <span className="text-xs font-medium">Grey 50</span>
            <span className="text-xs text-[#a8a29e]">#fbfbfa</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[#f1f1ef] rounded-lg border border-[#e9e9e7] mb-2"></div>
            <span className="text-xs font-medium">Grey 100</span>
            <span className="text-xs text-[#a8a29e]">#f1f1ef</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[#e9e9e7] rounded-lg mb-2"></div>
            <span className="text-xs font-medium">Grey 300</span>
            <span className="text-xs text-[#a8a29e]">#e9e9e7</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[#a8a29e] rounded-lg mb-2"></div>
            <span className="text-xs font-medium">Grey 500</span>
            <span className="text-xs text-[#a8a29e]">#a8a29e</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[#454440] rounded-lg mb-2"></div>
            <span className="text-xs font-medium text-[#454440]">Grey 700</span>
            <span className="text-xs text-[#a8a29e]">#454440</span>
          </div>
          <div className="flex flex-col">
            <div className="h-16 bg-[#1f1f1f] rounded-lg mb-2"></div>
            <span className="text-xs font-medium text-[#1f1f1f]">Grey 900</span>
            <span className="text-xs text-[#a8a29e]">#1f1f1f</span>
          </div>
        </div>
      </div>
      
      {/* Text Example */}
      <div className="mt-8 p-5 bg-[#ffffff] rounded-lg border border-[#f1f1ef]">
        <h3 className="text-xl font-semibold text-[#1f1f1f] mb-3">Text Color Examples</h3>
        <p className="text-[#1f1f1f] mb-2">This is primary text using Grey 900 (#1f1f1f)</p>
        <p className="text-[#454440] mb-2">This is secondary text using Grey 700 (#454440)</p>
        <p className="text-[#a8a29e] mb-2">This is muted text using Grey 500 (#a8a29e)</p>
        <p className="text-blue-primary mb-2">This is accent text using Blue Primary (theme-aware)</p>
        <button className="bg-blue-primary hover:bg-blue-dark text-white px-4 py-2 rounded-lg transition-colors">
          Primary Button
        </button>
        <button className="ml-3 bg-[#ffffff] border border-[#f1f1ef] text-[#1f1f1f] hover:bg-[#fbfbfa] px-4 py-2 rounded-lg transition-colors">
          Secondary Button
        </button>
      </div>
    </div>
  );
};

export default StyleGuideReference;
