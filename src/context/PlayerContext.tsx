import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  MediaItem,
  EqualizerSettings,
  VideoSettings,
  SyncSettings,
  ActiveModal,
  ThemeMode,
  SubtitleTrack,
  Bookmark,
  SnapshotItem,
  AudioEnhancements,
  AmbientSettings,
  VisualizerMode,
  MobileTab,
} from '../types/player';
import {
  DEFAULT_PLAYLIST,
  EQUALIZER_FREQUENCIES,
  EQUALIZER_PRESETS,
} from '../data/defaultTracks';

interface PlayerContextType {
  // Playlist & Current Track
  playlist: MediaItem[];
  currentIndex: number;
  currentTrack: MediaItem | null;
  playTrack: (index: number) => void;
  addTrack: (track: MediaItem, playNow?: boolean) => void;
  addTracks: (tracks: MediaItem[]) => void;
  addLocalFiles: (files: FileList | File[]) => void;
  addNetworkStream: (url: string, title?: string, type?: 'video' | 'audio') => void;
  removeTrack: (id: string) => void;
  clearPlaylist: () => void;
  reorderPlaylist: (startIndex: number, endIndex: number) => void;
  toggleFavorite: (id: string) => void;

  // Playback state & controls
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number; // 0 to 2.0 (0% to 200%)
  isMuted: boolean;
  playbackRate: number;
  loopMode: 'off' | 'track' | 'all';
  isShuffle: boolean;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  seekRelative: (deltaSeconds: number) => void;
  stepFrame: (forward?: boolean) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleLoopMode: () => void;
  toggleShuffle: () => void;

  // A-B Repeat
  abPointA: number | null;
  abPointB: number | null;
  isAbActive: boolean;
  setAbPointA: () => void;
  setAbPointB: () => void;
  clearAbRepeat: () => void;

  // Equalizer & Audio Enhancements
  equalizerSettings: EqualizerSettings;
  setEqualizerBand: (index: number, valDb: number) => void;
  setEqualizerPreamp: (valDb: number) => void;
  setEqualizerPreset: (presetName: string) => void;
  toggleEqualizer: (enabled?: boolean) => void;
  resetEqualizer: () => void;
  audioEnhancements: AudioEnhancements;
  updateAudioEnhancement: <K extends keyof AudioEnhancements>(key: K, value: AudioEnhancements[K]) => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
  analyserNode: AnalyserNode | null;

  // Video Settings & Geometry
  videoSettings: VideoSettings;
  setVideoSettings: React.Dispatch<React.SetStateAction<VideoSettings>>;
  updateVideoSetting: <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => void;
  resetVideoSettings: () => void;

  // Ambient Glow (Ambilight) & Theater Mode
  ambientSettings: AmbientSettings;
  updateAmbientSettings: <K extends keyof AmbientSettings>(key: K, value: AmbientSettings[K]) => void;
  isTheaterMode: boolean;
  toggleTheaterMode: () => void;

  // Subtitles & Sync
  syncSettings: SyncSettings;
  updateSyncSetting: <K extends keyof SyncSettings>(key: K, value: SyncSettings[K]) => void;
  currentSubtitleTrackId: string | null;
  setSubtitleTrackId: (id: string | null) => void;
  activeSubtitleText: string;
  loadSubtitleFile: (file: File) => void;

  // Snapshots & Bookmarks
  videoRef: React.RefObject<HTMLVideoElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  captureSnapshot: () => string | null;
  snapshots: SnapshotItem[];
  removeSnapshot: (id: string) => void;
  clearSnapshots: () => void;

  bookmarks: Bookmark[];
  addBookmark: (label?: string) => void;
  removeBookmark: (id: string) => void;
  jumpToBookmark: (time: number) => void;

  // Sleep Timer
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  setSleepTimer: (minutes: number | null) => void;

  // Fullscreen, PiP, Navigation & Views
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  togglePiP: () => void;
  activeView: 'player' | 'library' | 'effects';
  setActiveView: (view: 'player' | 'library' | 'effects') => void;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isPlaylistOpen: boolean;
  togglePlaylist: (open?: boolean) => void;

  // On-Screen Display (OSD) feedback
  osdMessage: string | null;
  showOsd: (msg: string) => void;

  // Mobile Support
  isMobileView: boolean;
  setIsMobileView: React.Dispatch<React.SetStateAction<boolean>>;
  activeMobileTab: MobileTab;
  setActiveMobileTab: (tab: MobileTab) => void;
  isScreenLocked: boolean;
  setIsScreenLocked: React.Dispatch<React.SetStateAction<boolean>>;
  toggleScreenLock: () => void;
}

const defaultVideoSettings: VideoSettings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  gamma: 1.0,
  invert: false,
  sepia: 0,
  blur: 0,
  aspectRatio: 'auto',
  rotation: 0,
  flipH: false,
  flipV: false,
};

const defaultEqualizerSettings: EqualizerSettings = {
  enabled: true,
  preamp: 0,
  bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  preset: 'Flat',
};

const defaultSyncSettings: SyncSettings = {
  audioDelayMs: 0,
  subtitleDelayMs: 0,
  subtitleSize: 'medium',
  subtitleColor: '#FFFFFF',
  subtitleBg: 'semi-transparent',
};

const defaultAudioEnhancements: AudioEnhancements = {
  bassBoost: false,
  bassBoostGain: 6,
  vocalClarity: false,
  spatialAudio: false,
};

const defaultAmbientSettings: AmbientSettings = {
  enabled: true,
  blur: 35,
  opacity: 0.65,
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlist, setPlaylist] = useState<MediaItem[]>(DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentTrack = playlist[currentIndex] || null;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [buffered, setBuffered] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(1.0); // 1.0 = 100%
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);
  const [loopMode, setLoopMode] = useState<'off' | 'track' | 'all'>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  // A-B Repeat
  const [abPointA, setAbPointAState] = useState<number | null>(null);
  const [abPointB, setAbPointBState] = useState<number | null>(null);
  const [isAbActive, setIsAbActive] = useState<boolean>(false);

  // Video and Audio Settings
  const [videoSettings, setVideoSettings] = useState<VideoSettings>(defaultVideoSettings);
  const [equalizerSettings, setEqualizerSettings] =
    useState<EqualizerSettings>(defaultEqualizerSettings);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(defaultSyncSettings);
  const [audioEnhancements, setAudioEnhancements] =
    useState<AudioEnhancements>(defaultAudioEnhancements);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');

  // Ambient & View State
  const [ambientSettings, setAmbientSettings] = useState<AmbientSettings>(defaultAmbientSettings);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'player' | 'library' | 'effects'>('player');

  // Bookmarks & Snapshots
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('vlc_web_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([]);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Subtitles
  const [currentSubtitleTrackId, setSubtitleTrackId] = useState<string | null>('sub-en');
  const [activeSubtitleText, setActiveSubtitleText] = useState<string>('');

  // UI state
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [theme, setTheme] = useState<ThemeMode>('vlc-classic');
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [osdMessage, setOsdMessage] = useState<string | null>(null);

  // Mobile State
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('player');
  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      // Auto-detect mobile size if user hasn't explicitly set a preference
      if (window.innerWidth < 768 && !isMobileView) {
        setIsMobileView(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileView]);

  const osdTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const bassBoostRef = useRef<BiquadFilterNode | null>(null);
  const vocalFilterRef = useRef<BiquadFilterNode | null>(null);
  const preampGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

  const showOsd = useCallback((msg: string) => {
    setOsdMessage(msg);
    if (osdTimerRef.current) {
      window.clearTimeout(osdTimerRef.current);
    }
    osdTimerRef.current = window.setTimeout(() => {
      setOsdMessage(null);
    }, 1800);
  }, []);

  const toggleScreenLock = useCallback(() => {
    setIsScreenLocked((prev) => {
      const next = !prev;
      showOsd(next ? 'Screen Locked' : 'Screen Unlocked');
      return next;
    });
  }, [showOsd]);

  // Initialize Web Audio API on first user interaction or mount
  const initWebAudio = useCallback(() => {
    if (audioContextRef.current || !videoRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(videoRef.current);
      sourceNodeRef.current = source;

      // Preamp gain node
      const preamp = ctx.createGain();
      preampGainRef.current = preamp;

      // 10 BiquadFilterNodes
      const filters = EQUALIZER_FREQUENCIES.map((freq) => {
        const filter = ctx.createBiquadFilter();
        if (freq <= 60) {
          filter.type = 'lowshelf';
        } else if (freq >= 14000) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.414;
        }
        filter.frequency.value = freq;
        filter.gain.value = 0;
        return filter;
      });
      filtersRef.current = filters;

      // Dedicated Bass Boost node (low shelf @ 90Hz)
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 90;
      bassBoost.gain.value = audioEnhancements.bassBoost ? audioEnhancements.bassBoostGain : 0;
      bassBoostRef.current = bassBoost;

      // Dedicated Vocal Clarity node (peaking @ 2.5kHz)
      const vocalFilter = ctx.createBiquadFilter();
      vocalFilter.type = 'peaking';
      vocalFilter.frequency.value = 2500;
      vocalFilter.Q.value = 1.0;
      vocalFilter.gain.value = audioEnhancements.vocalClarity ? 6.0 : 0;
      vocalFilterRef.current = vocalFilter;

      // Delay node for audio sync
      const delayNode = ctx.createDelay(5.0);
      delayNode.delayTime.value = 0;
      delayNodeRef.current = delayNode;

      // Master Gain Node (support up to 200% volume boost)
      const masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGainRef.current = masterGain;

      // Dynamics Compressor (prevents harsh distortion above 100% volume)
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -3.0; // dB
      compressor.knee.value = 8.0;
      compressor.ratio.value = 6.0;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      compressorRef.current = compressor;

      // Analyser Node for visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      setAnalyserNode(analyser);

      // Connect graph:
      // Source -> Preamp -> Filter[0] -> Filter[1] -> ... -> Filter[9] -> BassBoost -> VocalFilter -> Delay -> MasterGain -> Compressor -> Analyser -> Destination
      let lastNode: AudioNode = source;
      lastNode.connect(preamp);
      lastNode = preamp;

      filters.forEach((filter) => {
        lastNode.connect(filter);
        lastNode = filter;
      });

      lastNode.connect(bassBoost);
      bassBoost.connect(vocalFilter);
      vocalFilter.connect(delayNode);
      delayNode.connect(masterGain);
      masterGain.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.warn('Web Audio API not supported or already connected:', err);
    }
  }, [volume, audioEnhancements]);

  // Audio Delay update
  useEffect(() => {
    if (delayNodeRef.current && audioContextRef.current) {
      const delaySeconds = Math.max(0, syncSettings.audioDelayMs / 1000);
      delayNodeRef.current.delayTime.setValueAtTime(
        delaySeconds,
        audioContextRef.current.currentTime
      );
    }
  }, [syncSettings.audioDelayMs]);

  // Equalizer update
  useEffect(() => {
    if (!audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;

    if (preampGainRef.current) {
      // dB to linear gain
      const preampVal = equalizerSettings.enabled ? equalizerSettings.preamp : 0;
      const linearPreamp = Math.pow(10, preampVal / 20);
      preampGainRef.current.gain.setValueAtTime(linearPreamp, now);
    }

    filtersRef.current.forEach((filter, idx) => {
      const db = equalizerSettings.enabled ? equalizerSettings.bands[idx] || 0 : 0;
      filter.gain.setValueAtTime(db, now);
    });
  }, [equalizerSettings]);

  // Volume & Mute update
  const setVolume = useCallback(
    (val: number) => {
      const clamped = Math.max(0, Math.min(2.0, val));
      setVolumeState(clamped);

      if (videoRef.current) {
        // HTMLVideoElement standard volume is 0.0 to 1.0
        // We set HTML5 volume to Math.min(1.0, clamped) and use WebAudio gain for overdrive boost!
        videoRef.current.volume = Math.min(1.0, clamped);
      }

      if (masterGainRef.current && audioContextRef.current) {
        // When Web Audio is connected, HTML element volume controls the source,
        // but if volume > 1.0, masterGain boosts the rest
        const boost = clamped > 1.0 ? clamped : 1.0;
        masterGainRef.current.gain.setValueAtTime(boost, audioContextRef.current.currentTime);
      }

      if (isMuted && clamped > 0) {
        setIsMuted(false);
      }

      showOsd(`Volume: ${Math.round(clamped * 100)}%`);
    },
    [isMuted, showOsd]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      showOsd(next ? 'Muted' : `Volume: ${Math.round(volume * 100)}%`);
      return next;
    });
  }, [volume, showOsd]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      const clamped = Math.max(0.25, Math.min(4.0, rate));
      setPlaybackRateState(clamped);
      if (videoRef.current) {
        videoRef.current.playbackRate = clamped;
      }
      showOsd(`Speed: ${clamped.toFixed(2)}x`);
    },
    [showOsd]
  );

  // Playback control functions
  const play = useCallback(() => {
    initWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Playback play request interrupted:', err);
      });
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [initWebAudio]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const stop = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
      showOsd('Stopped');
    }
  }, [showOsd]);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, time));
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const seekRelative = useCallback(
    (deltaSeconds: number) => {
      if (videoRef.current) {
        const target = Math.max(
          0,
          Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + deltaSeconds)
        );
        videoRef.current.currentTime = target;
        setCurrentTime(target);
        const sign = deltaSeconds > 0 ? '+' : '';
        showOsd(`${sign}${deltaSeconds}s`);
      }
    },
    [showOsd]
  );

  const stepFrame = useCallback(
    (forward = true) => {
      if (videoRef.current) {
        pause();
        const frameTime = 1 / 30; // 30 fps
        const target = Math.max(
          0,
          Math.min(
            videoRef.current.duration || 0,
            videoRef.current.currentTime + (forward ? frameTime : -frameTime)
          )
        );
        videoRef.current.currentTime = target;
        setCurrentTime(target);
        showOsd(forward ? 'Next Frame' : 'Previous Frame');
      }
    },
    [pause, showOsd]
  );

  const playTrack = useCallback(
    (index: number) => {
      if (index >= 0 && index < playlist.length) {
        setCurrentIndex(index);
        setIsPlaying(true);
        setIsPaused(false);
        setAbPointAState(null);
        setAbPointBState(null);
        setIsAbActive(false);
        // Default to first subtitle track if available
        const track = playlist[index];
        if (track.subtitles && track.subtitles.length > 0) {
          setSubtitleTrackId(track.subtitles[0].id);
        } else {
          setSubtitleTrackId(null);
        }
        showOsd(track.title);
      }
    },
    [playlist, showOsd]
  );

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playTrack(randomIndex);
    } else {
      const nextIndex = (currentIndex + 1) % playlist.length;
      playTrack(nextIndex);
    }
  }, [playlist.length, isShuffle, currentIndex, playTrack]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIndex);
  }, [playlist.length, currentTime, seekTo, currentIndex, playTrack]);

  const toggleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      const next = prev === 'off' ? 'track' : prev === 'track' ? 'all' : 'off';
      showOsd(
        next === 'track'
          ? 'Loop Track (1)'
          : next === 'all'
          ? 'Loop All Playlist'
          : 'Loop Off'
      );
      return next;
    });
  }, [showOsd]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      showOsd(next ? 'Shuffle: On' : 'Shuffle: Off');
      return next;
    });
  }, [showOsd]);

  // A-B Repeat methods
  const setAbPointA = useCallback(() => {
    const cur = videoRef.current ? videoRef.current.currentTime : currentTime;
    setAbPointAState(cur);
    setIsAbActive(false);
    showOsd(`A-B Repeat: Point A set (${Math.floor(cur)}s)`);
  }, [currentTime, showOsd]);

  const setAbPointB = useCallback(() => {
    const cur = videoRef.current ? videoRef.current.currentTime : currentTime;
    if (abPointA === null || cur <= abPointA) {
      showOsd('Point B must be after Point A');
      return;
    }
    setAbPointBState(cur);
    setIsAbActive(true);
    showOsd(`A-B Repeat: Loop Active (${Math.floor(abPointA)}s - ${Math.floor(cur)}s)`);
  }, [abPointA, currentTime, showOsd]);

  const clearAbRepeat = useCallback(() => {
    setAbPointAState(null);
    setAbPointBState(null);
    setIsAbActive(false);
    showOsd('A-B Repeat Cleared');
  }, [showOsd]);

  // Playlist management
  const addLocalFiles = useCallback(
    (files: FileList | File[]) => {
      const newItems: MediaItem[] = [];
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video') || /\.(mp4|webm|mkv|mov|avi)$/i.test(file.name);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

        newItems.push({
          id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          title: nameWithoutExt,
          artist: 'Local File',
          album: 'Imported Media',
          src: url,
          type: isVideo ? 'video' : 'audio',
          filesize: sizeMb,
          resolution: isVideo ? 'Auto / Native' : 'N/A (Audio)',
          aspectRatio: isVideo ? 'Auto' : 'None',
          videoCodec: isVideo ? 'Native Browser Decoder' : 'None',
          audioCodec: isVideo ? 'Stereo Audio' : 'MPEG / AAC / WAV',
        });
      });

      if (newItems.length > 0) {
        setPlaylist((prev) => [...prev, ...newItems]);
        showOsd(`Added ${newItems.length} file(s)`);
        // If nothing was playing or at end, start playing first added item
        if (playlist.length === 0) {
          setCurrentIndex(0);
          setIsPlaying(true);
        }
      }
    },
    [playlist.length, showOsd]
  );

  const addNetworkStream = useCallback(
    (url: string, title?: string, type?: 'video' | 'audio') => {
      if (!url.trim()) return;
      const detectedType: 'video' | 'audio' =
        type || (/\.(mp3|wav|ogg|aac|flac)$/i.test(url) ? 'audio' : 'video');
      const itemTitle = title?.trim() || url.split('/').pop()?.split('?')[0] || 'Network Stream';

      const newItem: MediaItem = {
        id: 'stream-' + Date.now(),
        title: itemTitle,
        artist: 'Network Stream',
        album: 'Online Broadcast',
        src: url.trim(),
        type: detectedType,
        resolution: detectedType === 'video' ? 'Stream Adaptive' : 'N/A',
        videoCodec: detectedType === 'video' ? 'HTTP Stream / MP4' : 'None',
        audioCodec: 'AAC / MP3 Stream',
      };

      setPlaylist((prev) => {
        const nextList = [...prev, newItem];
        setCurrentIndex(nextList.length - 1);
        setIsPlaying(true);
        return nextList;
      });
      showOsd(`Streaming: ${itemTitle}`);
    },
    [showOsd]
  );

  const addTrack = useCallback(
    (track: MediaItem, playNow = false) => {
      setPlaylist((prev) => {
        const next = [...prev, track];
        if (playNow || prev.length === 0) {
          setCurrentIndex(next.length - 1);
          setIsPlaying(true);
        }
        return next;
      });
      showOsd(`Added: ${track.title}`);
    },
    [showOsd]
  );

  const addTracks = useCallback(
    (tracks: MediaItem[]) => {
      if (tracks.length === 0) return;
      setPlaylist((prev) => {
        const next = [...prev, ...tracks];
        if (prev.length === 0) {
          setCurrentIndex(0);
        }
        return next;
      });
      showOsd(`Loaded ${tracks.length} tracks`);
    },
    [showOsd]
  );

  const removeTrack = useCallback(
    (id: string) => {
      setPlaylist((prev) => {
        const indexToRemove = prev.findIndex((item) => item.id === id);
        if (indexToRemove === -1) return prev;
        const next = prev.filter((item) => item.id !== id);
        if (currentIndex === indexToRemove) {
          if (next.length === 0) {
            stop();
          } else {
            setCurrentIndex(Math.min(indexToRemove, next.length - 1));
          }
        } else if (currentIndex > indexToRemove) {
          setCurrentIndex((c) => c - 1);
        }
        return next;
      });
    },
    [currentIndex, stop]
  );

  const clearPlaylist = useCallback(() => {
    stop();
    setPlaylist([]);
    setCurrentIndex(0);
    showOsd('Playlist cleared');
  }, [stop, showOsd]);

  const reorderPlaylist = useCallback((startIndex: number, endIndex: number) => {
    setPlaylist((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Equalizer helpers
  const setEqualizerBand = useCallback((index: number, valDb: number) => {
    setEqualizerSettings((prev) => {
      const nextBands = [...prev.bands];
      nextBands[index] = valDb;
      return { ...prev, bands: nextBands, preset: 'Custom' };
    });
  }, []);

  const setEqualizerPreamp = useCallback((valDb: number) => {
    setEqualizerSettings((prev) => ({ ...prev, preamp: valDb }));
  }, []);

  const setEqualizerPreset = useCallback(
    (presetName: string) => {
      const presetValues = EQUALIZER_PRESETS[presetName];
      if (presetValues) {
        setEqualizerSettings((prev) => ({
          ...prev,
          preset: presetName,
          bands: [...presetValues],
        }));
        showOsd(`EQ: ${presetName}`);
      }
    },
    [showOsd]
  );

  const toggleEqualizer = useCallback((enabled?: boolean) => {
    setEqualizerSettings((prev) => ({
      ...prev,
      enabled: enabled !== undefined ? enabled : !prev.enabled,
    }));
  }, []);

  const resetEqualizer = useCallback(() => {
    setEqualizerSettings(defaultEqualizerSettings);
    showOsd('Equalizer reset to Flat');
  }, [showOsd]);

  // Video settings helpers
  const updateVideoSetting = useCallback(
    <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => {
      setVideoSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetVideoSettings = useCallback(() => {
    setVideoSettings(defaultVideoSettings);
    showOsd('Video filters reset');
  }, [showOsd]);

  // Sync settings helpers
  const updateSyncSetting = useCallback(
    <K extends keyof SyncSettings>(key: K, value: SyncSettings[K]) => {
      setSyncSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Subtitle parser for external .srt or .vtt files
  const loadSubtitleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) return;

        // Simple parser for WebVTT and SRT cues
        const cues: Array<{ start: number; end: number; text: string }> = [];
        const blocks = text.replace(/\r\n/g, '\n').split('\n\n');

        const parseTime = (tStr: string) => {
          const parts = tStr.trim().replace(',', '.').split(':');
          if (parts.length === 3) {
            return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
          } else if (parts.length === 2) {
            return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
          }
          return 0;
        };

        blocks.forEach((block) => {
          const lines = block.trim().split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
              const [startStr, endStr] = lines[i].split('-->');
              const start = parseTime(startStr);
              const end = parseTime(endStr);
              const cueText = lines.slice(i + 1).join('\n').replace(/<[^>]*>/g, '');
              if (end > start && cueText) {
                cues.push({ start, end, text: cueText });
              }
              break;
            }
          }
        });

        const newTrackId = 'sub-custom-' + Date.now();
        const newTrack: SubtitleTrack = {
          id: newTrackId,
          label: file.name.replace(/\.[^/.]+$/, ''),
          lang: 'user',
          cues,
        };

        if (currentTrack) {
          const updatedTrack: MediaItem = {
            ...currentTrack,
            subtitles: [...(currentTrack.subtitles || []), newTrack],
          };
          setPlaylist((prev) =>
            prev.map((item, idx) => (idx === currentIndex ? updatedTrack : item))
          );
          setSubtitleTrackId(newTrackId);
          showOsd(`Subtitles loaded: ${newTrack.label}`);
        }
      };
      reader.readAsText(file);
    },
    [currentTrack, currentIndex, showOsd]
  );

  // Subtitle cue matching on current time
  useEffect(() => {
    if (!currentSubtitleTrackId || !currentTrack?.subtitles) {
      setActiveSubtitleText('');
      return;
    }

    const track = currentTrack.subtitles.find((s) => s.id === currentSubtitleTrackId);
    if (!track || !track.cues) {
      setActiveSubtitleText('');
      return;
    }

    // Apply subtitle delay offset
    const adjustedTime = currentTime - syncSettings.subtitleDelayMs / 1000;
    const activeCue = track.cues.find(
      (cue) => adjustedTime >= cue.start && adjustedTime <= cue.end
    );

    setActiveSubtitleText(activeCue ? activeCue.text : '');
  }, [currentTime, currentSubtitleTrackId, currentTrack, syncSettings.subtitleDelayMs]);

  // Snapshot capture from video element
  const captureSnapshot = useCallback((): string | null => {
    if (!videoRef.current) return null;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      showOsd('Snapshot failed: no video track');
      return null;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Apply video filters to canvas snapshot if desired
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      // Trigger automatic file download
      const a = document.createElement('a');
      a.href = dataUrl;
      const timestamp = Math.floor(video.currentTime);
      const filename = `vlc_snapshot_${currentTrack?.title || 'media'}_${timestamp}s.png`
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Save to in-app snapshots gallery
      const newSnapshot: SnapshotItem = {
        id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        mediaTitle: currentTrack?.title || 'Video Snapshot',
        time: timestamp,
        dataUrl,
        timestamp: Date.now(),
      };
      setSnapshots((prev) => [newSnapshot, ...prev]);

      showOsd('Snapshot saved to Gallery & Downloads');
      return dataUrl;
    } catch (err) {
      console.error('Failed to capture snapshot:', err);
      showOsd('Snapshot blocked by CORS/security');
      return null;
    }
  }, [currentTrack?.title, showOsd]);

  const removeSnapshot = useCallback((id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clearSnapshots = useCallback(() => {
    setSnapshots([]);
    showOsd('Snapshot gallery cleared');
  }, [showOsd]);

  // Bookmarks management
  const addBookmark = useCallback((customLabel?: string) => {
    if (!currentTrack) return;
    const time = currentTime;
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const label = customLabel || `Marker at ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    const newBm: Bookmark = {
      id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      mediaId: currentTrack.id,
      time,
      label,
      createdAt: Date.now(),
    };
    setBookmarks((prev) => {
      const next = [...prev, newBm].sort((a, b) => a.time - b.time);
      try {
        localStorage.setItem('vlc_web_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
    showOsd(`Bookmark added: ${label}`);
  }, [currentTrack, currentTime, showOsd]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      try {
        localStorage.setItem('vlc_web_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
    showOsd('Bookmark removed');
  }, [showOsd]);

  const jumpToBookmark = useCallback((time: number) => {
    seekTo(time);
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    showOsd(`Jumped to ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
  }, [seekTo, showOsd]);

  // Audio Enhancements updater
  const updateAudioEnhancement = useCallback(<K extends keyof AudioEnhancements>(
    key: K,
    value: AudioEnhancements[K]
  ) => {
    setAudioEnhancements((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Ambient settings updater
  const updateAmbientSettings = useCallback(<K extends keyof AmbientSettings>(
    key: K,
    value: AmbientSettings[K]
  ) => {
    setAmbientSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Sleep Timer
  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerRemaining(null);
      showOsd('Sleep timer cancelled');
    } else {
      setSleepTimerRemaining(minutes * 60);
      showOsd(`Sleep timer set: ${minutes} min`);
    }
  }, [showOsd]);

  useEffect(() => {
    if (sleepTimerRemaining === null) return;
    if (sleepTimerRemaining <= 0) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
      setIsPaused(true);
      setSleepTimerRemaining(null);
      setSleepTimerMinutes(null);
      showOsd('Sleep timer elapsed. Playback stopped.');
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerRemaining((prev) => (prev && prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerRemaining, showOsd]);

  // Favorite toggle
  const toggleFavorite = useCallback((id: string) => {
    setPlaylist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  }, []);

  // Theater mode toggle
  const toggleTheaterMode = useCallback(() => {
    setIsTheaterMode((prev) => !prev);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Picture-in-Picture toggle
  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showOsd('Exited Picture-in-Picture');
      } else {
        await videoRef.current.requestPictureInPicture();
        showOsd('Picture-in-Picture active');
      }
    } catch (err) {
      console.warn('PiP error:', err);
      showOsd('PiP not supported on this stream');
    }
  }, [showOsd]);

  const togglePlaylist = useCallback((open?: boolean) => {
    setIsPlaylistOpen((prev) => (open !== undefined ? open : !prev));
  }, []);

  // Video element event listeners
  const onTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // A-B Repeat check
      if (isAbActive && abPointA !== null && abPointB !== null) {
        if (cur >= abPointB || cur < abPointA) {
          videoRef.current.currentTime = abPointA;
        }
      }

      // Buffered range
      if (videoRef.current.buffered.length > 0 && videoRef.current.duration) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.volume = Math.min(1.0, volume);
      videoRef.current.muted = isMuted;
    }
  };

  const onEnded = () => {
    if (loopMode === 'track') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else if (loopMode === 'all') {
      nextTrack();
    } else {
      // If last item in playlist, stop
      if (currentIndex < playlist.length - 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  };

  const onWaiting = () => setIsBuffering(true);
  const onPlayingEvent = () => {
    setIsBuffering(false);
    setIsPlaying(true);
    setIsPaused(false);
  };
  const onPauseEvent = () => {
    setIsPlaying(false);
    setIsPaused(true);
  };

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          stop();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(volume - 0.05);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            seekRelative(60);
          } else if (e.shiftKey) {
            seekRelative(3);
          } else {
            seekRelative(10);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            seekRelative(-60);
          } else if (e.shiftKey) {
            seekRelative(-3);
          } else {
            seekRelative(-10);
          }
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          nextTrack();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          prevTrack();
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          stepFrame(true);
          break;
        case '[':
          e.preventDefault();
          setPlaybackRate(Math.max(0.25, playbackRate - 0.1));
          break;
        case ']':
          e.preventDefault();
          setPlaybackRate(Math.min(4.0, playbackRate + 0.1));
          break;
        case '=':
          e.preventDefault();
          setPlaybackRate(1.0);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    stop,
    toggleFullscreen,
    toggleMute,
    volume,
    setVolume,
    seekRelative,
    nextTrack,
    prevTrack,
    stepFrame,
    playbackRate,
    setPlaybackRate,
  ]);

  // Attach event listeners to videoRef
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('ended', onEnded);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('playing', onPlayingEvent);
    el.addEventListener('pause', onPauseEvent);

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('playing', onPlayingEvent);
      el.removeEventListener('pause', onPauseEvent);
    };
  }, [currentIndex, loopMode, isAbActive, abPointA, abPointB, volume, isMuted, playbackRate]);

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        currentIndex,
        currentTrack,
        playTrack,
        addTrack,
        addTracks,
        addLocalFiles,
        addNetworkStream,
        removeTrack,
        clearPlaylist,
        reorderPlaylist,
        toggleFavorite,

        isPlaying,
        isPaused,
        isBuffering,
        currentTime,
        duration,
        buffered,
        volume,
        isMuted,
        playbackRate,
        loopMode,
        isShuffle,

        play,
        pause,
        togglePlay,
        stop,
        nextTrack,
        prevTrack,
        seekTo,
        seekRelative,
        stepFrame,
        setVolume,
        toggleMute,
        setPlaybackRate,
        toggleLoopMode,
        toggleShuffle,

        abPointA,
        abPointB,
        isAbActive,
        setAbPointA,
        setAbPointB,
        clearAbRepeat,

        equalizerSettings,
        setEqualizerBand,
        setEqualizerPreamp,
        setEqualizerPreset,
        toggleEqualizer,
        resetEqualizer,
        audioEnhancements,
        updateAudioEnhancement,
        visualizerMode,
        setVisualizerMode,
        analyserNode,

        videoSettings,
        setVideoSettings,
        updateVideoSetting,
        resetVideoSettings,

        ambientSettings,
        updateAmbientSettings,
        isTheaterMode,
        toggleTheaterMode,

        syncSettings,
        updateSyncSetting,
        currentSubtitleTrackId,
        setSubtitleTrackId,
        activeSubtitleText,
        loadSubtitleFile,

        videoRef,
        containerRef,
        captureSnapshot,
        snapshots,
        removeSnapshot,
        clearSnapshots,

        bookmarks,
        addBookmark,
        removeBookmark,
        jumpToBookmark,

        sleepTimerMinutes,
        sleepTimerRemaining,
        setSleepTimer,

        toggleFullscreen,
        isFullscreen,
        togglePiP,
        activeView,
        setActiveView,

        activeModal,
        setActiveModal,
        theme,
        setTheme,
        isPlaylistOpen,
        togglePlaylist,

        osdMessage,
        showOsd,

        isMobileView,
        setIsMobileView,
        activeMobileTab,
        setActiveMobileTab,
        isScreenLocked,
        setIsScreenLocked,
        toggleScreenLock,
      }}
    >
      <div
        ref={containerRef}
        className={`w-full h-full min-h-screen flex flex-col font-sans transition-colors duration-200 select-none ${
          theme === 'vlc-classic'
            ? 'bg-zinc-900 text-zinc-100'
            : theme === 'dark-slate'
            ? 'bg-slate-950 text-slate-100'
            : 'bg-black text-white'
        }`}
      >
        {children}
      </div>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
