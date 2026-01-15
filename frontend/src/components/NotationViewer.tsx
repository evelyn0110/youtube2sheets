import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface NotationViewerProps {
  jobId: string;
  onClose: () => void;
}

export default function NotationViewer({ jobId, onClose }: NotationViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a full implementation, you would use VexFlow to render notation
    // For now, we'll show a placeholder
    renderNotation();
  }, [jobId]);

  const renderNotation = () => {
    if (!containerRef.current) return;

    // Placeholder implementation
    // In production, you would:
    // 1. Fetch the MusicXML
    // 2. Parse it with music21 or similar
    // 3. Render with VexFlow
    
    containerRef.current.innerHTML = `
      <div class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <p class="text-lg mb-4">Musical notation rendering</p>
          <p class="text-sm">In production, this would display the sheet music using VexFlow</p>
          <p class="text-sm mt-2">Download the PDF or MusicXML to view the full score</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Musical Notation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notation Display */}
        <div 
          ref={containerRef}
          className="flex-1 p-6 overflow-auto bg-white"
          style={{ minHeight: '500px' }}
        />

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Download the PDF or MusicXML file for the complete score
          </p>
        </div>
      </div>
    </div>
  );
}
