import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { MobileHeader } from './MobileHeader';
import { MobilePlayerView } from './MobilePlayerView';
import { MobileControls } from './MobileControls';
import { MobileLibrary } from './MobileLibrary';
import { MobileEqualizer } from './MobileEqualizer';
import { MobileTools } from './MobileTools';
import { MobileNavBar } from './MobileNavBar';

export const MobileView: React.FC = () => {
  const { activeMobileTab, theme } = usePlayer();

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden relative ${
        theme === 'vlc-classic'
          ? 'bg-zinc-950 text-zinc-100'
          : theme === 'dark-slate'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-black text-white'
      }`}
    >
      {/* 1. Mobile Top Header */}
      <MobileHeader />

      {/* 2. Main Tab View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative justify-end">
        {activeMobileTab === 'player' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden justify-end">
            <MobilePlayerView />
            <MobileControls />
          </div>
        )}

        {activeMobileTab === 'library' && <MobileLibrary />}

        {activeMobileTab === 'equalizer' && <MobileEqualizer />}

        {activeMobileTab === 'tools' && <MobileTools />}
      </main>

      {/* 3. Bottom Tab Navigation Bar */}
      <MobileNavBar />
    </div>
  );
};
