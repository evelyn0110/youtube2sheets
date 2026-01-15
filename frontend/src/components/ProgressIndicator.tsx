import React from 'react';
import { Download, Music2, FileAudio, FileText, CheckCircle, XCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  status: string;
  progress: number;
  videoTitle?: string;
  error?: string;
}

const statusSteps = [
  { key: 'pending', label: 'Queued', icon: Music2 },
  { key: 'downloading', label: 'Downloading', icon: Download },
  { key: 'processing', label: 'Processing Audio', icon: FileAudio },
  { key: 'transcribing', label: 'Transcribing', icon: Music2 },
  { key: 'converting', label: 'Converting Formats', icon: FileText },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

export default function ProgressIndicator({ 
  status, 
  progress, 
  videoTitle,
  error 
}: ProgressIndicatorProps) {
  const currentStepIndex = statusSteps.findIndex(step => step.key === status);

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <XCircle className="w-8 h-8" />
            <h3 className="text-xl font-bold">Transcription Failed</h3>
          </div>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {videoTitle && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Processing: {videoTitle}
            </h3>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {statusSteps[currentStepIndex]?.label || 'Processing'}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Steps */}
        <div className="space-y-3">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isPending = index > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-primary-50' : ''
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isCurrent
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`font-medium ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
                {isCurrent && (
                  <div className="ml-auto">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
