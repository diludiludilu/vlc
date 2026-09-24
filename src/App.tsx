import React from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { MenuBar } from './components/MenuBar';
import { VideoPlayer } from './components/VideoPlayer';
import { Controls } from './components/Controls';
import { Playlist } from './components/Playlist';
import { MobileView } from './components/mobile/MobileView';
import { EffectsModal } from './components/EffectsModal';
import { MediaInfoModal } from './components/MediaInfoModal';
import { NetworkStreamModal } from './components/NetworkStreamModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { AboutModal } from './components/AboutModal';
import { BookmarksModal } from './components/BookmarksModal';
import { SnapshotsModal } from './components/SnapshotsModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { InstallModal } from './components/InstallModal';

const AppContent: React.FC = () => {
  const { isTheaterMode, theme, isMobileView } = usePlayer();

  if (isMobileView) {
    return (
      <div
        className={`flex-1 flex flex-col h-[100dvh] w-full overflow-hidden ${
          theme === 'vlc-classic'
            ? 'bg-zinc-950 text-zinc-100 font-sans'
            : theme === 'dark-slate'
            ? 'bg-slate-950 text-slate-100 font-sans'
            : 'bg-black text-white font-sans'
        }`}
      >
        <MobileView />

        {/* Global Modals (accessible on both Mobile & Desktop) */}
        <EffectsModal />
        <MediaInfoModal />
        <NetworkStreamModal />
        <ShortcutsModal />
        <AboutModal />
        <BookmarksModal />
        <SnapshotsModal />
        <SleepTimerModal />
        <InstallModal />
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col h-screen overflow-hidden ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900 text-zinc-100 font-sans'
          : theme === 'dark-slate'
          ? 'bg-slate-950 text-slate-100 font-sans'
          : 'bg-black text-white font-sans'
      }`}
    >
      {/* 1. VLC Top Application Menu */}
      <MenuBar />

      {/* 2. Middle Content Area: Media Viewport + Playlist Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <VideoPlayer />
        {!isTheaterMode && <Playlist />}
      </div>

      {/* 3. VLC Bottom Control Toolbar */}
      <Controls />

      {/* 4. Dialogs / Modals */}
      <EffectsModal />
      <MediaInfoModal />
      <NetworkStreamModal />
      <ShortcutsModal />
      <AboutModal />
      <BookmarksModal />
      <SnapshotsModal />
      <SleepTimerModal />
      <InstallModal />
    </div>
  );
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
