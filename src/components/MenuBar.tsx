import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  FolderOpen,
  Globe,
  Camera,
  Trash2,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Maximize,
  Info,
  Keyboard,
  HelpCircle,
  ListMusic,
  Tv,
  FileText,
  RotateCw,
  Palette,
  Bookmark,
  Moon,
  Sun,
  Zap,
  Smartphone,
} from 'lucide-react';
import { ThemeMode } from '../types/player';

interface MenuItem {
  type?: 'separator';
  label?: string;
  shortcut?: string;
  action?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  checked?: boolean;
}

interface MenuGroup {
  name: string;
  items: MenuItem[];
}

export const MenuBar: React.FC = () => {
  const {
    isPlaying,
    togglePlay,
    stop,
    nextTrack,
    prevTrack,
    seekRelative,
    setPlaybackRate,
    playbackRate,
    setVolume,
    volume,
    toggleMute,
    isMuted,
    addLocalFiles,
    clearPlaylist,
    captureSnapshot,
    snapshots,
    bookmarks,
    sleepTimerRemaining,
    toggleFullscreen,
    togglePiP,
    setActiveModal,
    theme,
    setTheme,
    togglePlaylist,
    isPlaylistOpen,
    videoSettings,
    updateVideoSetting,
    ambientSettings,
    updateAmbientSettings,
    isTheaterMode,
    toggleTheaterMode,
    audioEnhancements,
    updateAudioEnhancement,
    visualizerMode,
    setVisualizerMode,
    currentTrack,
    currentSubtitleTrackId,
    setSubtitleTrackId,
    loadSubtitleFile,
    setAbPointA,
    setAbPointB,
    clearAbRepeat,
    setIsMobileView,
  } = usePlayer();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addLocalFiles(e.target.files);
      e.target.value = '';
    }
    setOpenMenu(null);
  };

  const handleSubtitleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      loadSubtitleFile(e.target.files[0]);
      e.target.value = '';
    }
    setOpenMenu(null);
  };

  const menuItems: MenuGroup[] = [
    {
      name: 'Media',
      items: [
        {
          label: 'Open Media Files...',
          shortcut: 'Ctrl+O',
          action: () => fileInputRef.current?.click(),
          icon: <FolderOpen className="w-3.5 h-3.5" />,
        },
        {
          label: 'Open Network Stream...',
          shortcut: 'Ctrl+N',
          action: () => setActiveModal('network'),
          icon: <Globe className="w-3.5 h-3.5" />,
        },
        { type: 'separator' },
        {
          label: 'Capture Frame Snapshot',
          shortcut: 'Shift+S',
          action: () => captureSnapshot(),
          icon: <Camera className="w-3.5 h-3.5" />,
          disabled: currentTrack?.type !== 'video',
        },
        {
          label: 'Snapshot Gallery...',
          shortcut: '',
          action: () => setActiveModal('snapshots'),
          icon: <Camera className="w-3.5 h-3.5" />,
        },
        {
          label: 'Bookmarks & Chapters...',
          shortcut: 'B',
          action: () => setActiveModal('bookmarks'),
          icon: <Bookmark className="w-3.5 h-3.5" />,
        },
        { type: 'separator' },
        {
          label: 'Clear Playlist',
          action: () => clearPlaylist(),
          icon: <Trash2 className="w-3.5 h-3.5" />,
        },
      ],
    },
    {
      name: 'Playback',
      items: [
        {
          label: isPlaying ? 'Pause' : 'Play',
          shortcut: 'Space',
          action: () => togglePlay(),
          icon: isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />,
        },
        {
          label: 'Stop',
          shortcut: 'S',
          action: () => stop(),
          icon: <Square className="w-3.5 h-3.5" />,
        },
        {
          label: 'Previous',
          shortcut: 'P',
          action: () => prevTrack(),
          icon: <SkipBack className="w-3.5 h-3.5" />,
        },
        {
          label: 'Next',
          shortcut: 'N',
          action: () => nextTrack(),
          icon: <SkipForward className="w-3.5 h-3.5" />,
        },
        { type: 'separator' },
        {
          label: 'Jump Forward 10s',
          shortcut: '→',
          action: () => seekRelative(10),
        },
        {
          label: 'Jump Backward 10s',
          shortcut: '←',
          action: () => seekRelative(-10),
        },
        {
          label: 'Jump Forward 1m',
          shortcut: 'Ctrl+→',
          action: () => seekRelative(60),
        },
        {
          label: 'Jump Backward 1m',
          shortcut: 'Ctrl+←',
          action: () => seekRelative(-60),
        },
        { type: 'separator' },
        {
          label: 'Speed: Faster (+0.25x)',
          shortcut: ']',
          action: () => setPlaybackRate(Math.min(3.0, playbackRate + 0.25)),
        },
        {
          label: 'Speed: Slower (-0.25x)',
          shortcut: '[',
          action: () => setPlaybackRate(Math.max(0.25, playbackRate - 0.25)),
        },
        {
          label: 'Speed: Normal (1.0x)',
          shortcut: '=',
          action: () => setPlaybackRate(1.0),
        },
        { type: 'separator' },
        {
          label: 'Set A-B Loop: Point A',
          shortcut: 'Shift+A',
          action: () => setAbPointA(),
        },
        {
          label: 'Set A-B Loop: Point B',
          shortcut: 'Shift+B',
          action: () => setAbPointB(),
        },
        {
          label: 'Clear A-B Loop',
          action: () => clearAbRepeat(),
        },
      ],
    },
    {
      name: 'Audio',
      items: [
        {
          label: isMuted ? 'Unmute' : 'Mute',
          shortcut: 'M',
          action: () => toggleMute(),
          icon: isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />,
        },
        {
          label: 'Increase Volume (+5%)',
          shortcut: 'Ctrl+↑',
          action: () => setVolume(Math.min(2.0, volume + 0.05)),
        },
        {
          label: 'Decrease Volume (-5%)',
          shortcut: 'Ctrl+↓',
          action: () => setVolume(Math.max(0, volume - 0.05)),
        },
        { type: 'separator' },
        {
          label: `Bass Boost: ${audioEnhancements.bassBoost ? 'Enabled' : 'Disabled'}`,
          action: () => updateAudioEnhancement('bassBoost', !audioEnhancements.bassBoost),
          icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
        },
        {
          label: `Vocal Clarity: ${audioEnhancements.vocalClarity ? 'Enabled' : 'Disabled'}`,
          action: () => updateAudioEnhancement('vocalClarity', !audioEnhancements.vocalClarity),
        },
        { type: 'separator' },
        {
          label: `Visualizer: Frequency Bars`,
          action: () => setVisualizerMode('bars'),
          checked: visualizerMode === 'bars',
        },
        {
          label: `Visualizer: Oscilloscope Wave`,
          action: () => setVisualizerMode('waveform'),
          checked: visualizerMode === 'waveform',
        },
        {
          label: `Visualizer: Radial Pulse`,
          action: () => setVisualizerMode('radial'),
          checked: visualizerMode === 'radial',
        },
        {
          label: `Visualizer: Stereo VU Meter`,
          action: () => setVisualizerMode('vu-meter'),
          checked: visualizerMode === 'vu-meter',
        },
      ],
    },
    {
      name: 'Video',
      items: [
        {
          label: 'Fullscreen',
          shortcut: 'F',
          action: () => toggleFullscreen(),
          icon: <Maximize className="w-3.5 h-3.5" />,
        },
        {
          label: 'Theater Mode',
          shortcut: 'T',
          action: () => toggleTheaterMode(),
          icon: <Tv className="w-3.5 h-3.5" />,
          checked: isTheaterMode,
        },
        {
          label: 'Picture in Picture',
          action: () => togglePiP(),
          icon: <Tv className="w-3.5 h-3.5" />,
        },
        {
          label: `Ambient Glow (Ambilight): ${ambientSettings.enabled ? 'On' : 'Off'}`,
          action: () => updateAmbientSettings('enabled', !ambientSettings.enabled),
          icon: <Sun className="w-3.5 h-3.5 text-amber-400" />,
          checked: ambientSettings.enabled,
        },
        { type: 'separator' },
        {
          label: 'Aspect Ratio: Default (Auto)',
          action: () => updateVideoSetting('aspectRatio', 'auto'),
          checked: videoSettings.aspectRatio === 'auto',
        },
        {
          label: 'Aspect Ratio: 16:9 Widescreen',
          action: () => updateVideoSetting('aspectRatio', '16:9'),
          checked: videoSettings.aspectRatio === '16:9',
        },
        {
          label: 'Aspect Ratio: 4:3 Standard',
          action: () => updateVideoSetting('aspectRatio', '4:3'),
          checked: videoSettings.aspectRatio === '4:3',
        },
        {
          label: 'Aspect Ratio: 21:9 Ultrawide',
          action: () => updateVideoSetting('aspectRatio', '21:9'),
          checked: videoSettings.aspectRatio === '21:9',
        },
        {
          label: 'Aspect Ratio: Fill Window',
          action: () => updateVideoSetting('aspectRatio', 'fill'),
          checked: videoSettings.aspectRatio === 'fill',
        },
        { type: 'separator' },
        {
          label: 'Rotate 90° Clockwise',
          action: () => updateVideoSetting('rotation', ((videoSettings.rotation + 90) % 360) as any),
          icon: <RotateCw className="w-3.5 h-3.5" />,
        },
      ],
    },
    {
      name: 'Subtitle',
      items: [
        {
          label: 'Add Subtitle File (.srt, .vtt)...',
          action: () => subtitleInputRef.current?.click(),
          icon: <FileText className="w-3.5 h-3.5" />,
        },
        { type: 'separator' },
        {
          label: 'Disable Subtitles',
          action: () => setSubtitleTrackId(null),
          checked: currentSubtitleTrackId === null,
        },
        ...(currentTrack?.subtitles || []).map((sub) => ({
          label: `${sub.label} (${sub.lang})`,
          action: () => setSubtitleTrackId(sub.id),
          checked: currentSubtitleTrackId === sub.id,
        })),
      ],
    },
    {
      name: 'Tools',
      items: [
        {
          label: 'Effects and Filters (Equalizer)...',
          shortcut: 'Ctrl+E',
          action: () => setActiveModal('effects'),
          icon: <Sliders className="w-3.5 h-3.5" />,
        },
        {
          label: 'Sleep Timer...',
          shortcut: '',
          action: () => setActiveModal('sleep-timer'),
          icon: <Moon className="w-3.5 h-3.5" />,
        },
        {
          label: 'Media Information...',
          shortcut: 'Ctrl+I',
          action: () => setActiveModal('media-info'),
          icon: <Info className="w-3.5 h-3.5" />,
        },
        {
          label: 'Keyboard Shortcuts...',
          shortcut: '?',
          action: () => setActiveModal('shortcuts'),
          icon: <Keyboard className="w-3.5 h-3.5" />,
        },
      ],
    },
    {
      name: 'View',
      items: [
        {
          label: isPlaylistOpen ? 'Hide Playlist' : 'Show Playlist',
          shortcut: 'Ctrl+L',
          action: () => togglePlaylist(),
          icon: <ListMusic className="w-3.5 h-3.5" />,
          checked: isPlaylistOpen,
        },
        { type: 'separator' },
        {
          label: 'Theme: VLC Classic Orange',
          action: () => setTheme('vlc-classic'),
          checked: theme === 'vlc-classic',
        },
        {
          label: 'Theme: Dark Slate Modern',
          action: () => setTheme('dark-slate'),
          checked: theme === 'dark-slate',
        },
        {
          label: 'Theme: Cinema Pure Black (OLED)',
          action: () => setTheme('cinema-black'),
          checked: theme === 'cinema-black',
        },
        { type: 'separator' },
        {
          label: 'Switch to Mobile UI',
          action: () => setIsMobileView(true),
          icon: <Smartphone className="w-3.5 h-3.5 text-amber-400" />,
        },
      ],
    },
    {
      name: 'Help',
      items: [
        {
          label: 'Keyboard Shortcuts Reference',
          action: () => setActiveModal('shortcuts'),
          icon: <Keyboard className="w-3.5 h-3.5" />,
        },
        {
          label: 'About VLC Web Media Player',
          action: () => setActiveModal('about'),
          icon: <HelpCircle className="w-3.5 h-3.5" />,
        },
      ],
    },
  ];

  return (
    <div
      ref={menuBarRef}
      className={`border-b select-none flex items-center justify-between px-3 py-1 text-xs z-40 transition-colors ${
        theme === 'vlc-classic'
          ? 'bg-zinc-900 border-zinc-700/80 text-zinc-200'
          : theme === 'dark-slate'
          ? 'bg-slate-900 border-slate-800 text-slate-200'
          : 'bg-zinc-950 border-zinc-800 text-zinc-100'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,audio/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".srt,.vtt"
        className="hidden"
        onChange={handleSubtitleSelect}
      />

      {/* Left: Brand Icon + Desktop Menu Items */}
      <div className="flex items-center space-x-0.5">
        {/* VLC Cone Logo */}
        <div
          onClick={() => setActiveModal('about')}
          className="flex items-center gap-1.5 px-2 py-1 mr-1 rounded-md hover:bg-white/10 cursor-pointer transition"
          title="About VLC Web Media Player"
        >
          <svg className="w-5 h-5 filter drop-shadow" viewBox="0 0 100 100">
            <polygon points="50,8 15,92 85,92" fill="#ff7700" />
            <polygon points="40,32 30,52 70,52 60,32" fill="#ffffff" />
            <polygon points="26,62 18,80 82,80 74,62" fill="#ffffff" />
            <ellipse cx="50" cy="92" rx="38" ry="6" fill="#d95e00" />
          </svg>
          <span className="font-bold text-xs tracking-tight text-white hidden sm:inline">VLC</span>
        </div>

        {/* Dropdown Menu Triggers */}
        {menuItems.map((menu) => (
          <div key={menu.name} className="relative">
            <button
              onClick={() => handleMenuClick(menu.name)}
              onMouseEnter={() => {
                if (openMenu !== null) setOpenMenu(menu.name);
              }}
              className={`px-2 py-1 rounded transition text-xs font-medium ${
                openMenu === menu.name
                  ? 'bg-amber-500/20 text-amber-400 font-semibold'
                  : 'hover:bg-white/10 text-zinc-300 hover:text-white'
              }`}
            >
              {menu.name}
            </button>

            {/* Dropdown Menu Container */}
            {openMenu === menu.name && (
              <div
                className={`absolute top-full left-0 mt-1 w-64 rounded-xl border shadow-2xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-100 ${
                  theme === 'vlc-classic'
                    ? 'bg-zinc-900 border-zinc-700/80 text-zinc-200'
                    : theme === 'dark-slate'
                    ? 'bg-slate-900 border-slate-800 text-slate-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-100'
                }`}
              >
                {menu.items.map((item, idx) => {
                  if (item.type === 'separator') {
                    return <div key={idx} className="my-1 border-t border-white/10" />;
                  }

                  return (
                    <button
                      key={idx}
                      disabled={item.disabled}
                      onClick={() => {
                        item.action?.();
                        setOpenMenu(null);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs transition ${
                        item.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-amber-500/20 hover:text-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {item.checked !== undefined ? (
                          <span
                            className={`w-3.5 text-center text-xs ${
                              item.checked ? 'text-amber-400 font-bold' : 'opacity-0'
                            }`}
                          >
                            ✓
                          </span>
                        ) : (
                          <span className="w-3.5 flex justify-center text-zinc-400">
                            {item.icon}
                          </span>
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <span className="text-[10px] font-mono text-zinc-400 pl-3">
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right: Quick Action Shortcuts */}
      <div className="flex items-center space-x-1.5">
        {/* Equalizer & Audio effects shortcut */}
        <button
          onClick={() => setActiveModal('effects')}
          title="Studio Effects & Equalizer (Ctrl+E)"
          className="px-2 py-1 rounded-md hover:bg-white/10 text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 transition text-xs font-medium"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Effects</span>
        </button>

        {/* Bookmarks shortcut */}
        <button
          onClick={() => setActiveModal('bookmarks')}
          title="Bookmarks (B)"
          className="px-2 py-1 rounded-md hover:bg-white/10 text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 transition text-xs font-medium relative"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Bookmarks</span>
          {bookmarks.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-bold text-[9px]">
              {bookmarks.length}
            </span>
          )}
        </button>

        {/* Snapshots shortcut */}
        <button
          onClick={() => setActiveModal('snapshots')}
          title="Snapshot Gallery (Shift+S)"
          className="px-2 py-1 rounded-md hover:bg-white/10 text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 transition text-xs font-medium relative"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Snapshots</span>
          {snapshots.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 font-bold text-[9px]">
              {snapshots.length}
            </span>
          )}
        </button>

        {/* Sleep Timer button */}
        <button
          onClick={() => setActiveModal('sleep-timer')}
          title="Sleep Timer"
          className={`px-2 py-1 rounded-md transition text-xs font-medium flex items-center gap-1.5 ${
            sleepTimerRemaining !== null
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'hover:bg-white/10 text-zinc-300 hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline font-mono">
            {sleepTimerRemaining !== null
              ? `${Math.floor(sleepTimerRemaining / 60)}m`
              : 'Timer'}
          </span>
        </button>

        {/* Theme Selector */}
        <button
          onClick={() => {
            const themes: ThemeMode[] = [
              'vlc-classic',
              'dark-slate',
              'cinema-black',
            ];
            const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
            setTheme(themes[nextIdx]);
          }}
          title={`Theme: ${theme}. Click to switch theme.`}
          className="p-1.5 rounded-md hover:bg-white/10 text-zinc-300 hover:text-amber-400 transition"
        >
          <Palette className="w-3.5 h-3.5" />
        </button>

        {/* Mobile View Switcher */}
        <button
          onClick={() => setIsMobileView(true)}
          title="Switch to Mobile UI"
          className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 transition text-xs font-medium"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Mobile UI</span>
        </button>
      </div>
    </div>
  );
};
