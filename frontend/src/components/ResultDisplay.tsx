import React from 'react';
import { Download, FileMusic, FileText, FileImage, Star } from 'lucide-react';
import { TranscriptionResult } from '@/lib/api';

interface ResultDisplayProps {
  result: TranscriptionResult;
  onViewPianoRoll: () => void;
  onViewNotation: () => void;
  onPracticeMode: () => void;
}

export default function ResultDisplay({ 
  result, 
  onViewPianoRoll,
  onViewNotation,
  onPracticeMode
}: ResultDisplayProps) {
  const downloadUrl = (format: string) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/download/${result.job_id}/${format}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Transcription Complete!
          </h2>
          {result.video_title && (
            <p className="text-gray-600">{result.video_title}</p>
          )}
        </div>

        {/* Quality Score */}
        {result.quality && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-gray-900">Quality Score</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="text-2xl font-bold text-primary-600">
                  {(result.quality.confidence_score * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Notes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.quality.note_count}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.quality.duration.toFixed(1)}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Polyphony</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result.quality.polyphony_avg.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={onViewPianoRoll}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <FileMusic className="w-5 h-5" />
            View Piano Roll
          </button>
          <button
            onClick={onViewNotation}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            View Notation
          </button>
          <button
            onClick={onPracticeMode}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Star className="w-5 h-5" />
            Practice Mode
          </button>
        </div>

        {/* Download Links */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Files
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a
              href={downloadUrl('midi')}
              download
              className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <FileMusic className="w-5 h-5" />
              MIDI File
            </a>
            <a
              href={downloadUrl('musicxml')}
              download
              className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              MusicXML
            </a>
            {result.pdf_url && (
              <a
                href={downloadUrl('pdf')}
                download
                className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50 text-gray-700 hover:text-primary-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FileImage className="w-5 h-5" />
                PDF Score
              </a>
            )}
          </div>
        </div>

        {/* New Transcription Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Start New Transcription
          </button>
        </div>
      </div>
    </div>
  );
}
