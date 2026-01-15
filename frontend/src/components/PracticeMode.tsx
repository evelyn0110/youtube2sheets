import React, { useState } from 'react';
import { X, Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { PianoRollData } from '@/lib/api';

interface PracticeModeProps {
  data: PianoRollData;
  onClose: () => void;
}

export default function PracticeMode({ data, onClose }: PracticeModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(data.duration);
  const [showSettings, setShowSettings] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a full implementation, integrate with Tone.js for playback
  };

  const handleReset = () => {
    setCurrentTime(loopStart);
    setIsPlaying(false);
  };

  const tempoPercentage = (tempo / data.tempo) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Practice Mode</h2>
            <p className="text-sm text-gray-600">
              Play along and adjust tempo for practice
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Virtual Piano Keyboard Placeholder */}
          <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-8 mb-6">
            <div className="text-center text-gray-600">
              <p className="text-lg font-semibold mb-2">Virtual Piano Keyboard</p>
              <p className="text-sm">
                In production, this would show an interactive piano keyboard
                with highlighted notes as they play
              </p>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Practice Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loop Start (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={data.duration}
                    step="0.1"
                    value={loopStart}
                    onChange={(e) => setLoopStart(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loop End (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={data.duration}
                    step="0.1"
                    value={loopEnd}
                    onChange={(e) => setLoopEnd(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{currentTime.toFixed(1)}s</span>
              <span>{data.duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max={data.duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tempo Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo: {tempo} BPM ({tempoPercentage.toFixed(0)}%)
              </label>
              <input
                type="range"
                min={Math.floor(data.tempo * 0.5)}
                max={Math.floor(data.tempo * 1.5)}
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50%</span>
                <span>100%</span>
                <span>150%</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                title="Reset to loop start"
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
            </div>

            {/* Stats */}
            <div className="flex items-center justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Notes: {data.notes.length}</p>
                <p className="text-sm text-gray-600">
                  Original: {data.tempo.toFixed(0)} BPM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
