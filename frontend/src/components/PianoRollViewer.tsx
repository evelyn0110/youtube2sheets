import React, { useEffect, useRef, useState } from 'react';
import { PianoRollData } from '@/lib/api';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

interface PianoRollViewerProps {
  data: PianoRollData;
  onClose: () => void;
}

export default function PianoRollViewer({ data, onClose }: PianoRollViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    drawPianoRoll();
  }, [data, currentTime]);

  const drawPianoRoll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Calculate dimensions
    const minPitch = Math.min(...data.notes.map(n => n.pitch));
    const maxPitch = Math.max(...data.notes.map(n => n.pitch));
    const pitchRange = maxPitch - minPitch + 1;
    const noteHeight = height / pitchRange;
    const timeScale = width / data.duration;

    // Draw piano keys background (alternating for white/black keys)
    for (let pitch = minPitch; pitch <= maxPitch; pitch++) {
      const y = height - ((pitch - minPitch + 1) * noteHeight);
      const isBlackKey = [1, 3, 6, 8, 10].includes(pitch % 12);
      ctx.fillStyle = isBlackKey ? '#374151' : '#4b5563';
      ctx.fillRect(0, y, width, noteHeight);
    }

    // Draw grid lines
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= data.duration; i++) {
      const x = i * timeScale;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw notes
    data.notes.forEach(note => {
      const x = note.start * timeScale;
      const y = height - ((note.pitch - minPitch + 1) * noteHeight);
      const w = note.duration * timeScale;
      const h = noteHeight - 2;

      // Note color based on velocity
      const intensity = note.velocity / 127;
      ctx.fillStyle = `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`;
      ctx.fillRect(x, y + 1, w, h);

      // Note border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y + 1, w, h);
    });

    // Draw playback cursor
    if (currentTime > 0) {
      const x = currentTime * timeScale;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a full implementation, you would integrate with Tone.js here
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Piano Roll View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-6 overflow-auto">
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            className="w-full border border-gray-300 rounded-lg"
          />
        </div>

        {/* Controls */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <div className="flex-1 max-w-md">
              <input
                type="range"
                min="0"
                max={data.duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="text-sm font-mono text-gray-600">
              {currentTime.toFixed(1)}s / {data.duration.toFixed(1)}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
