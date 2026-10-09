import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GrowlyHeader } from '../components/layout/GrowlyHeader.js';
import { GrowlySlimDock } from '../components/layout/GrowlySlimDock.js';
import { CommandPalette } from '../components/common/CommandPalette.js';
import { GrowlyProfilePhoneCard } from '../features/dashboard/components/GrowlyProfilePhoneCard.js';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isPhoneCardOpen, setIsPhoneCardOpen] = useState(false);

  // Smooth scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Keyboard shortcut Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isPhoneCardOpen) {
        setIsPhoneCardOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPhoneCardOpen]);

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#17202A] flex font-sans selection:bg-[#0F8F87] selection:text-white antialiased">
      {/* Phenomenon Studio Growly Left Slim Dock */}
      <GrowlySlimDock
        onToggleProfileCard={() => setIsPhoneCardOpen(!isPhoneCardOpen)}
        isProfileCardOpen={isPhoneCardOpen}
      />

      {/* Main App Workspace Canvas */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Unified Growly Top Header */}
        <GrowlyHeader
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleProfileCard={() => setIsPhoneCardOpen(!isPhoneCardOpen)}
          isProfileCardOpen={isPhoneCardOpen}
        />

        {/* Dynamic Canvas Container with Smooth Page Transitions */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Oliver Cranston Phone Card Modal (Toggled from Dock or Dashboard) */}
      {isPhoneCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <GrowlyProfilePhoneCard
            isFloatingModal={true}
            onClose={() => setIsPhoneCardOpen(false)}
          />
        </div>
      )}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};
