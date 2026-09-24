import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import {
  PlayCircle,
  ListMusic,
  Sliders,
  Settings2,
} from 'lucide-react';
import { MobileTab } from '../../types/player';

export const MobileNavBar: React.FC = () => {
  const { activeMobileTab, setActiveMobileTab, playlist, theme } = usePlayer();

  const tabs: Array<{ id: MobileTab; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      id: 'player',
      label: 'Player',
      icon: <PlayCircle className="w-5 h-5" />,
    },
    {
      id: 'library',
      label: 'Library',
      icon: <ListMusic className="w-5 h-5" />,
      badge: playlist.length > 0 ? playlist.length : undefined,
    },
    {
      id: 'equalizer',
      label: 'Audio & EQ',
      icon: <Sliders className="w-5 h-5" />,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: <Settings2 className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className={`shrink-0 w-full grid grid-cols-4 items-end h-16 border-t select-none z-30 transition-colors backdrop-blur-xl ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-400'
          : theme === 'dark-slate'
          ? 'bg-slate-900/95 border-slate-800 text-slate-400'
          : 'bg-zinc-950/95 border-zinc-800 text-zinc-400'
      }`}
    >
      {tabs.map((tab) => {
        const isActive = activeMobileTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveMobileTab(tab.id)}
            className={`flex flex-col items-center justify-end pb-2 min-h-[44px] h-full transition relative ${
              isActive ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {/* Icon slot with badge */}
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.id === 'library' && (
                <span className="absolute -top-1 -right-2 bg-amber-500 text-zinc-950 text-[9px] font-bold rounded-full px-1 min-w-[14px] h-[14px] flex items-center justify-center leading-none">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] tracking-tight mt-1 transition-font ${
                isActive ? 'font-bold text-amber-400' : 'font-medium'
              }`}
            >
              {tab.label}
            </span>

            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute bottom-0.5 w-4 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
