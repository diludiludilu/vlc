import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { VisualizerMode } from '../types/player';

interface AudioVisualizerProps {
  mode?: VisualizerMode;
  className?: string;
  showModeSelector?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  mode: propMode,
  className = 'w-full h-full',
  showModeSelector = false,
}) => {
  const { analyserNode, isPlaying, visualizerMode, setVisualizerMode } = usePlayer();
  const activeMode = propMode || visualizerMode;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peaksRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Handle devicePixelRatio for crisp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
          canvas.width = Math.floor(rect.width * dpr);
          canvas.height = Math.floor(rect.height * dpr);
        }
      }

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (!analyserNode || !isPlaying) {
        // Idle animation
        const time = Date.now() * 0.002;
        if (activeMode === 'radial') {
          const cx = width / 2;
          const cy = height / 2;
          const baseRadius = Math.min(width, height) * 0.22;
          ctx.beginPath();
          ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 136, 0, 0.25)';
          ctx.lineWidth = 2 * dpr;
          ctx.stroke();
        } else if (activeMode === 'waveform') {
          ctx.strokeStyle = 'rgba(255, 136, 0, 0.2)';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          for (let x = 0; x < width; x += 4 * dpr) {
            const y = height / 2 + Math.sin(x * 0.02 + time) * 8 * dpr;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        } else {
          // Idle bars
          const barCount = 36;
          const gap = 3 * dpr;
          const barWidth = (width - gap * (barCount - 1)) / barCount;
          ctx.fillStyle = 'rgba(255, 136, 0, 0.18)';
          for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + gap);
            const idleH = (Math.sin(i * 0.35 + time) * 6 + 12) * dpr;
            ctx.fillRect(x, height - idleH, barWidth, idleH);
          }
        }
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (activeMode === 'waveform') {
        const bufferLength = analyserNode.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(dataArray);

        // Center line glow
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.15)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Waveform stroke with neon bloom
        ctx.save();
        ctx.shadowBlur = 12 * dpr;
        ctx.shadowColor = '#FF8800';
        ctx.lineWidth = 2.5 * dpr;
        ctx.strokeStyle = '#FF9E2C';
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.restore();
      } else if (activeMode === 'radial') {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = Math.min(width, height) * 0.24;
        const points = 64;
        const angleStep = (Math.PI * 2) / points;

        // Inner core circle
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius - 8 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(24, 25, 30, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 136, 0, 0.4)';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();

        ctx.save();
        ctx.shadowBlur = 10 * dpr;
        ctx.shadowColor = '#FF8800';

        // Radial spiked bars
        for (let i = 0; i < points; i++) {
          const angle = i * angleStep;
          const dataIdx = Math.floor(Math.pow(i / points, 1.2) * (bufferLength / 3));
          const val = dataArray[dataIdx] || 0;
          const barLen = (val / 255) * (Math.min(width, height) * 0.22);

          const x1 = cx + Math.cos(angle) * baseRadius;
          const y1 = cy + Math.sin(angle) * baseRadius;
          const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
          const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

          ctx.strokeStyle = `hsl(${25 + (val / 255) * 35}, 100%, 55%)`;
          ctx.lineWidth = 3 * dpr;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      } else if (activeMode === 'vu-meter') {
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        // Approximate Left / Right from low/mid and high bins
        let sumL = 0;
        let sumR = 0;
        const half = Math.floor(bufferLength / 2);
        for (let i = 0; i < half; i++) sumL += dataArray[i];
        for (let i = half; i < bufferLength; i++) sumR += dataArray[i];

        const avgL = sumL / (half * 255);
        const avgR = (sumR / (half * 255)) * 1.3;

        const meterHeight = height * 0.65;
        const meterWidth = Math.min(220 * dpr, width * 0.4);
        const startX = (width - meterWidth) / 2;
        const startY = (height - meterHeight) / 2;

        const segments = 24;
        const segGap = 3 * dpr;
        const segH = (meterHeight - segGap * (segments - 1)) / segments;
        const chanW = (meterWidth - 24 * dpr) / 2;

        const drawChannel = (val: number, xOffset: number, label: string) => {
          // Label
          ctx.fillStyle = '#A1A1AA';
          ctx.font = `600 ${10 * dpr}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.fillText(label, xOffset + chanW / 2, startY - 8 * dpr);

          const activeCount = Math.floor(val * segments);
          for (let s = 0; s < segments; s++) {
            const segY = startY + meterHeight - (s + 1) * (segH + segGap);
            const isActive = s <= activeCount;

            let col = '#10B981'; // Green
            if (s > segments * 0.65) col = '#F59E0B'; // Amber
            if (s > segments * 0.88) col = '#EF4444'; // Red

            ctx.fillStyle = isActive ? col : 'rgba(255, 255, 255, 0.06)';
            ctx.fillRect(xOffset, segY, chanW, segH);
          }
        };

        drawChannel(avgL, startX, 'L CH');
        drawChannel(avgR, startX + chanW + 24 * dpr, 'R CH');
      } else {
        // High-tech frequency bars (default)
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = Math.min(48, Math.floor(width / (8 * dpr)));
        const gap = 3 * dpr;
        const barWidth = Math.max(3 * dpr, (width - gap * (barCount - 1)) / barCount);

        // Ensure peaks array is initialized
        if (peaksRef.current.length !== barCount) {
          peaksRef.current = new Array(barCount).fill(0);
        }

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#E65100');
        gradient.addColorStop(0.5, '#FF8800');
        gradient.addColorStop(0.9, '#FFA726');
        gradient.addColorStop(1, '#FFE082');

        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor(Math.pow(i / barCount, 1.35) * (bufferLength / 2));
          const val = dataArray[dataIdx] || 0;
          const percent = val / 255;
          const barHeight = Math.max(4 * dpr, percent * (height - 16 * dpr));

          const x = i * (barWidth + gap);
          const y = height - barHeight;

          // Main Bar with rounded top
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Peak falloff logic
          if (barHeight >= peaksRef.current[i]) {
            peaksRef.current[i] = barHeight;
          } else {
            peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.2 * dpr);
          }

          const peakY = height - peaksRef.current[i] - 3 * dpr;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x, Math.max(0, peakY), barWidth, 2 * dpr);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isPlaying, activeMode]);

  return (
    <div className={`relative ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />

      {showModeSelector && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 z-10">
          {(['bars', 'waveform', 'radial', 'vu-meter'] as VisualizerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setVisualizerMode(m)}
              className={`px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase transition-colors rounded ${
                activeMode === m
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {m === 'vu-meter' ? 'VU' : m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
