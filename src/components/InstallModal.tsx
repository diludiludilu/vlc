import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Download,
  X,
  Check,
  Copy,
  Terminal,
  Layers,
  Smartphone,
  Laptop,
  Monitor,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallModal: React.FC = () => {
  const { activeModal, setActiveModal, theme } = usePlayer();
  const [activeTab, setActiveTab] = useState<'pwa' | 'windows' | 'mac-linux' | 'docker'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already in standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (activeModal !== 'install') return null;

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // In modern browsers without cached prompt, instruct the user
      alert(
        'To install in your browser:\n\n' +
        '• Chrome / Edge: Click the "Install VLC Web" icon in your address bar or menu (⋮) -> "Install VLC Web Media Player".\n' +
        '• Safari (iOS/macOS): Click Share -> "Add to Home Screen" or File -> "Add to Dock".\n' +
        '• Android: Tap menu (⋮) -> "Install App" or "Add to Home Screen".'
      );
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          theme === 'vlc-classic'
            ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
            : theme === 'dark-slate'
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-zinc-950 border-zinc-800 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                Install VLC Web Media Player
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                  v1.0
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Choose the easiest installation method for your device
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/20 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap border-b-2 ${
              activeTab === 'pwa'
                ? 'border-amber-500 text-amber-400 bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            1-Click App (PWA)
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap border-b-2 ${
              activeTab === 'windows'
                ? 'border-amber-500 text-amber-400 bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Windows Installer
          </button>
          <button
            onClick={() => setActiveTab('mac-linux')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap border-b-2 ${
              activeTab === 'mac-linux'
                ? 'border-amber-500 text-amber-400 bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            macOS & Linux
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`flex items-center gap-2 px-3 py-2 rounded-t-lg font-medium transition whitespace-nowrap border-b-2 ${
              activeTab === 'docker'
                ? 'border-amber-500 text-amber-400 bg-white/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Docker (Zero Setup)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* TAB 1: PWA Instant Install */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      Install as Standalone Desktop / Mobile App
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      Easiest Method
                    </span>
                  </div>
                  <p className="text-zinc-300">
                    Runs offline in its own window with zero browser bars, high performance, and Start Menu / Home Screen icon.
                  </p>
                </div>
                {isInstalled ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold whitespace-nowrap">
                    <Check className="w-4 h-4" /> Installed
                  </div>
                ) : (
                  <button
                    onClick={handlePwaInstall}
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20 whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Install VLC Web Now
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5">
                  <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-amber-400" /> Desktop (Chrome, Edge, Brave)
                  </span>
                  <p className="text-zinc-400">
                    Look for the <span className="text-amber-400 font-semibold">Install icon</span> in the right side of the address bar, or click browser menu (⋮) → <span className="text-zinc-200">"Install VLC Web Media Player"</span>.
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5">
                  <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" /> Mobile (iOS Safari & Android)
                  </span>
                  <p className="text-zinc-400">
                    On iOS Safari tap <span className="text-amber-400 font-semibold">Share</span> → <span className="text-zinc-200">"Add to Home Screen"</span>. On Android tap <span className="text-amber-400 font-semibold">⋮</span> → <span className="text-zinc-200">"Install App"</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Windows Installer Scripts */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <p className="text-zinc-300">
                You can run VLC Media Player as a native desktop executable or using the automated setup scripts:
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Option 1: vlc.exe (Standalone Software Executable)
                    </span>
                    <button
                      onClick={() => copyToClipboard('vlc.exe', 'exe')}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition flex items-center gap-1"
                    >
                      {copiedKey === 'exe' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Name</span>
                    </button>
                  </div>
                  <p className="text-zinc-300">
                    A standalone Windows executable with embedded application assets. Double-click <code className="text-amber-400 font-mono bg-white/5 px-1.5 py-0.5 rounded font-bold">vlc.exe</code> in the project directory to launch the desktop application window immediately with <strong>zero dependencies</strong> (no Node.js required)!
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Run <code className="text-amber-400 font-mono">vlc.exe --install</code> to automatically create a Desktop shortcut with the VLC icon.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Option 2: 1-Click Batch Installer & Launcher
                    </span>
                    <button
                      onClick={() => copyToClipboard('start.bat', 'bat')}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-300 transition flex items-center gap-1"
                    >
                      {copiedKey === 'bat' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-zinc-400">
                    Double-click <code className="text-amber-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">start.bat</code> or <code className="text-amber-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">install.bat</code>. It verifies prerequisites, sets up environment, and opens the player automatically.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      Option B: PowerShell Script (With Desktop Shortcut)
                    </span>
                    <button
                      onClick={() => copyToClipboard('.\\setup.ps1', 'ps1')}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-300 transition flex items-center gap-1"
                    >
                      {copiedKey === 'ps1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="font-mono bg-zinc-950 p-2.5 rounded border border-white/5 text-zinc-300 flex items-center justify-between">
                    <span>.\setup.ps1</span>
                  </div>
                  <p className="text-zinc-400">
                    Runs setup and optionally creates a <span className="text-amber-400">"VLC Web Media Player"</span> shortcut right on your Windows Desktop.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: macOS & Linux Shell Scripts */}
          {activeTab === 'mac-linux' && (
            <div className="space-y-4">
              <p className="text-zinc-300">
                Run the automated POSIX shell script in your terminal to set up dependencies and launch the player:
              </p>

              <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Automated Setup Command
                  </span>
                  <button
                    onClick={() => copyToClipboard('chmod +x install.sh start.sh && ./install.sh', 'sh')}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-300 transition flex items-center gap-1"
                  >
                    {copiedKey === 'sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="font-mono bg-zinc-950 p-3 rounded border border-white/5 text-amber-300 overflow-x-auto text-[11px]">
                  chmod +x install.sh start.sh &amp;&amp; ./install.sh
                </pre>
                <p className="text-zinc-400">
                  After installation, start the player anytime with <code className="text-amber-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">./start.sh</code>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Docker Zero-Setup */}
          {activeTab === 'docker' && (
            <div className="space-y-4">
              <p className="text-zinc-300">
                Don't have Node.js or want an isolated container deployment? Run with Docker Compose:
              </p>

              <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Docker Compose Command
                  </span>
                  <button
                    onClick={() => copyToClipboard('docker compose up -d', 'docker')}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-300 transition flex items-center gap-1"
                  >
                    {copiedKey === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="font-mono bg-zinc-950 p-3 rounded border border-white/5 text-cyan-300 overflow-x-auto text-[11px]">
                  docker compose up -d
                </pre>
                <p className="text-zinc-400">
                  Access the app immediately at <span className="text-white font-mono">http://localhost:3000</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-black/30">
          <span className="text-zinc-400 text-[11px]">
            Check <code className="text-amber-400 font-mono">INSTALL.md</code> for complete details.
          </span>
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
