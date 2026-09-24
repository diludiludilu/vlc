export interface SubtitleTrack {
  id: string;
  label: string;
  src?: string;
  cues?: Array<{ start: number; end: number; text: string }>;
  lang: string;
}

export interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number; // in seconds
  src: string;
  type: 'video' | 'audio';
  poster?: string;
  isFavorite?: boolean;
  subtitles?: SubtitleTrack[];
  // Metadata / Codec details
  resolution?: string;
  aspectRatio?: string;
  videoCodec?: string;
  audioCodec?: string;
  sampleRate?: string;
  channels?: string;
  bitrate?: string;
  filesize?: string;
}

export interface EqualizerSettings {
  enabled: boolean;
  preamp: number; // in dB (-20 to +20)
  bands: number[]; // 10 bands in dB (-20 to +20)
  preset: string;
}

export interface AudioEnhancements {
  bassBoost: boolean;
  bassBoostGain: number; // 0 to 12 dB
  vocalClarity: boolean;
  spatialAudio: boolean;
}

export interface VideoSettings {
  brightness: number; // 0 to 200, default 100
  contrast: number; // 0 to 200, default 100
  saturation: number; // 0 to 200, default 100
  hue: number; // 0 to 360, default 0
  gamma: number; // 0.5 to 2.5, default 1.0
  invert: boolean;
  sepia: number; // 0 to 100
  blur: number; // 0 to 20
  aspectRatio: 'auto' | '16:9' | '4:3' | '21:9' | '1:1' | 'fill';
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
}

export interface SyncSettings {
  audioDelayMs: number; // -5000 to +5000
  subtitleDelayMs: number; // -5000 to +5000
  subtitleSize: 'small' | 'medium' | 'large' | 'extra-large';
  subtitleColor: string;
  subtitleBg: 'black' | 'semi-transparent' | 'none';
}

export interface Bookmark {
  id: string;
  mediaId: string;
  time: number;
  label: string;
  createdAt: number;
}

export interface SnapshotItem {
  id: string;
  mediaTitle: string;
  time: number;
  dataUrl: string;
  timestamp: number;
}

export interface AmbientSettings {
  enabled: boolean;
  blur: number; // 10 to 60px
  opacity: number; // 0.1 to 1.0
}

export type VisualizerMode = 'bars' | 'waveform' | 'radial' | 'vu-meter';

export type ActiveModal =
  | 'effects'
  | 'media-info'
  | 'network'
  | 'shortcuts'
  | 'about'
  | 'bookmarks'
  | 'snapshots'
  | 'sleep-timer'
  | 'install'
  | null;

export type ThemeMode = 'vlc-classic' | 'dark-slate' | 'cinema-black';

export type MobileTab = 'player' | 'library' | 'equalizer' | 'tools';
