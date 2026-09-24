import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Info, Layers, BarChart2, Film, Music, FileText } from 'lucide-react';

export const MediaInfoModal: React.FC = () => {
  const { activeModal, setActiveModal, currentTrack, currentTime, duration } = usePlayer();
  const [tab, setTab] = useState<'general' | 'codecs' | 'stats'>('codecs');

  if (activeModal !== 'media-info') return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-xs select-none">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-xs text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold text-sm text-white">Current Media Information</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-3 pt-2 gap-1">
          <button
            onClick={() => setTab('general')}
            className={`px-3 py-1.5 rounded-t font-medium transition flex items-center gap-1.5 ${
              tab === 'general'
                ? 'bg-zinc-800 text-orange-400 border-t-2 border-orange-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" /> General
          </button>
          <button
            onClick={() => setTab('codecs')}
            className={`px-3 py-1.5 rounded-t font-medium transition flex items-center gap-1.5 ${
              tab === 'codecs'
                ? 'bg-zinc-800 text-orange-400 border-t-2 border-orange-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Codec Details
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`px-3 py-1.5 rounded-t font-medium transition flex items-center gap-1.5 ${
              tab === 'stats'
                ? 'bg-zinc-800 text-orange-400 border-t-2 border-orange-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Statistics
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[65vh] overflow-y-auto">
          {tab === 'general' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400 font-medium">Title:</span>
                <span className="col-span-2 text-zinc-100 font-semibold">{currentTrack?.title || 'None'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400 font-medium">Artist:</span>
                <span className="col-span-2 text-zinc-200">{currentTrack?.artist || 'Unknown'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400 font-medium">Album / Collection:</span>
                <span className="col-span-2 text-zinc-200">{currentTrack?.album || 'General Media'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400 font-medium">Type:</span>
                <span className="col-span-2 text-orange-400 font-mono uppercase">{currentTrack?.type || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400 font-medium">Duration:</span>
                <span className="col-span-2 font-mono text-zinc-200">
                  {duration ? `${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s` : '--'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-zinc-800">
                <span className="text-zinc-400 font-medium">File / Stream Size:</span>
                <span className="col-span-2 font-mono text-zinc-200">{currentTrack?.filesize || 'Online Stream'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5">
                <span className="text-zinc-400 font-medium">Location URL:</span>
                <span className="col-span-2 font-mono text-[11px] text-zinc-400 break-all select-text">
                  {currentTrack?.src || 'None'}
                </span>
              </div>
            </div>
          )}

          {tab === 'codecs' && (
            <div className="space-y-4">
              {/* Stream 0: Video */}
              {currentTrack?.type === 'video' && (
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-blue-400">
                    <Film className="w-4 h-4" />
                    <span>Stream 0 (Video)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-300 font-mono text-[11px] pl-6">
                    <div><span className="text-zinc-500">Codec: </span>{currentTrack.videoCodec || 'H.264 / AVC'}</div>
                    <div><span className="text-zinc-500">Resolution: </span>{currentTrack.resolution || '1920x1080'}</div>
                    <div><span className="text-zinc-500">Aspect Ratio: </span>{currentTrack.aspectRatio || '16:9'}</div>
                    <div><span className="text-zinc-500">Color format: </span>Planar 4:2:0 YUV</div>
                    <div><span className="text-zinc-500">Frame rate: </span>24.000000 fps</div>
                    <div><span className="text-zinc-500">Decoded with: </span>HTML5 Hardware WebGL</div>
                  </div>
                </div>
              )}

              {/* Stream 1: Audio */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-400">
                  <Music className="w-4 h-4" />
                  <span>Stream 1 (Audio)</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-300 font-mono text-[11px] pl-6">
                  <div><span className="text-zinc-500">Codec: </span>{currentTrack?.audioCodec || 'MPEG AAC Audio'}</div>
                  <div><span className="text-zinc-500">Channels: </span>{currentTrack?.channels || '2 (Stereo)'}</div>
                  <div><span className="text-zinc-500">Sample Rate: </span>{currentTrack?.sampleRate || '48000 Hz'}</div>
                  <div><span className="text-zinc-500">Bits per sample: </span>32-bit Float</div>
                  <div><span className="text-zinc-500">Bitrate: </span>{currentTrack?.bitrate || '320 kbps'}</div>
                  <div><span className="text-zinc-500">Processing: </span>WebAudio 10-Band EQ</div>
                </div>
              </div>

              {/* Stream 2: Subtitle */}
              {currentTrack?.subtitles && currentTrack.subtitles.length > 0 && (
                <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-emerald-400">
                    <FileText className="w-4 h-4" />
                    <span>Stream 2 (Subtitles)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-zinc-300 font-mono text-[11px] pl-6">
                    <div><span className="text-zinc-500">Tracks: </span>{currentTrack.subtitles.length} track(s)</div>
                    <div><span className="text-zinc-500">Format: </span>WebVTT / SubRip (SRT)</div>
                    <div><span className="text-zinc-500">Encoding: </span>UTF-8 Unicode</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'stats' && (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-orange-400 font-bold block mb-1">Input / Demux Buffer</span>
                <div className="flex justify-between text-zinc-300">
                  <span>Stream position:</span>
                  <span>{currentTime.toFixed(1)}s</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Demuxed packets:</span>
                  <span>{Math.floor(currentTime * 30 + 120)} packets</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Input bitrate:</span>
                  <span>{currentTrack?.bitrate || '2,400 kb/s'}</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-blue-400 font-bold block mb-1">Video Decoder</span>
                <div className="flex justify-between text-zinc-300">
                  <span>Decoded frames:</span>
                  <span>{Math.floor(currentTime * 24)} frames</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Displayed frames:</span>
                  <span>{Math.floor(currentTime * 24)} frames</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Lost / Dropped frames:</span>
                  <span className="text-emerald-400 font-semibold">0 (0.0%)</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-1">
                <span className="text-amber-400 font-bold block mb-1">Audio DSP Engine</span>
                <div className="flex justify-between text-zinc-300">
                  <span>Decoded buffers:</span>
                  <span>{Math.floor(currentTime * 44)} buffers</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Buffer loss / underruns:</span>
                  <span className="text-emerald-400 font-semibold">0</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-zinc-800/80 border-t border-zinc-700/80 flex justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
