import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Globe, Play, Film, Radio } from 'lucide-react';

const PRESET_STREAMS = [
  {
    name: 'Big Buck Bunny (HTTP MP4 720p)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'video' as const,
  },
  {
    name: 'Tears of Steel (Open Sci-Fi VFX Trailer)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    type: 'video' as const,
  },
  {
    name: 'For Bigger Blazes (Google Chromecast Demo)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video' as const,
  },
  {
    name: 'Vivaldi - Four Seasons: Autumn',
    url: 'https://ia800501.us.archive.org/21/items/VivaldiTheFourSeasons1-4Harrison/07_Vivaldi_Autumn_mvt_1_Allegro_-_John_Harrison_violin.mp3',
    type: 'audio' as const,
  },
  {
    name: 'Lofi Chill Study Beats (Audio Stream)',
    url: 'https://ia801503.us.archive.org/15/items/chill-lofi-song/Chill%20Lofi%20Song.mp3',
    type: 'audio' as const,
  },
];

export const NetworkStreamModal: React.FC = () => {
  const { activeModal, setActiveModal, addNetworkStream } = usePlayer();
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamTitle, setStreamTitle] = useState<string>('');
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');

  if (activeModal !== 'network') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;
    addNetworkStream(streamUrl, streamTitle || undefined, mediaType);
    setActiveModal(null);
    setStreamUrl('');
    setStreamTitle('');
  };

  const handleSelectPreset = (preset: typeof PRESET_STREAMS[0]) => {
    setStreamUrl(preset.url);
    setStreamTitle(preset.name);
    setMediaType(preset.type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 backdrop-blur-xs select-none">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-xs text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <h2 className="font-semibold text-sm text-white">Open Network Stream</h2>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">Please enter a network URL:</label>
            <input
              type="url"
              required
              placeholder="https://example.com/stream.mp4 or direct audio URL"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-400">Stream Title (Optional):</label>
              <input
                type="text"
                placeholder="My Stream"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400">Media Type:</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'video' | 'audio')}
                className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-orange-500"
              >
                <option value="video">Video Stream</option>
                <option value="audio">Audio / Radio Stream</option>
              </select>
            </div>
          </div>

          {/* Quick preset list */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800">
            <span className="text-zinc-400 font-medium text-[11px]">Or select a verified public stream:</span>
            <div className="space-y-1">
              {PRESET_STREAMS.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleSelectPreset(p)}
                  className="w-full p-2 rounded bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between transition group"
                >
                  <span className="flex items-center gap-2 truncate text-zinc-300 group-hover:text-white">
                    {p.type === 'video' ? (
                      <Film className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="truncate">{p.name}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase shrink-0">{p.type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white font-medium flex items-center gap-1.5 shadow transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Stream
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
