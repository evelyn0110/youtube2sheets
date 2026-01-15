import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import UrlInput from '@/components/UrlInput';
import ProgressIndicator from '@/components/ProgressIndicator';
import ResultDisplay from '@/components/ResultDisplay';
import PianoRollViewer from '@/components/PianoRollViewer';
import NotationViewer from '@/components/NotationViewer';
import PracticeMode from '@/components/PracticeMode';
import { transcriptionAPI, TranscriptionResult, PianoRollData } from '@/lib/api';
import { Music } from 'lucide-react';

type ViewMode = 'input' | 'processing' | 'result' | 'piano-roll' | 'notation' | 'practice';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [jobId, setJobId] = useState<string>('');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [pianoRollData, setPianoRollData] = useState<PianoRollData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (jobId && viewMode === 'processing') {
      pollInterval = setInterval(async () => {
        try {
          const status = await transcriptionAPI.getJobStatus(jobId);
          
          if (status.result) {
            setResult(status.result);
          }

          if (status.status === 'completed') {
            setViewMode('result');
            clearInterval(pollInterval);
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [jobId, viewMode]);

  const handleSubmit = async (url: string, isolatePiano: boolean) => {
    setIsLoading(true);
    try {
      const result = await transcriptionAPI.createTranscription({
        youtube_url: url,
        isolate_piano: isolatePiano,
      });
      
      setJobId(result.job_id);
      setResult(result);
      setViewMode('processing');
    } catch (error) {
      console.error('Error creating transcription:', error);
      alert('Failed to start transcription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPianoRoll = async () => {
    if (!jobId) return;
    
    try {
      const data = await transcriptionAPI.getPianoRollData(jobId);
      setPianoRollData(data);
      setViewMode('piano-roll');
    } catch (error) {
      console.error('Error loading piano roll data:', error);
      alert('Failed to load piano roll data');
    }
  };

  const handleViewNotation = () => {
    setViewMode('notation');
  };

  const handlePracticeMode = async () => {
    if (!jobId) return;
    
    try {
      const data = await transcriptionAPI.getPianoRollData(jobId);
      setPianoRollData(data);
      setViewMode('practice');
    } catch (error) {
      console.error('Error loading practice mode:', error);
      alert('Failed to load practice mode');
    }
  };

  return (
    <>
      <Head>
        <title>YouTube to Sheet Music - Piano Transcription</title>
        <meta name="description" content="Convert YouTube piano performances to sheet music" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  YouTube to Sheet Music
                </h1>
                <p className="text-gray-600">
                  AI-powered piano transcription
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {viewMode === 'input' && (
            <UrlInput onSubmit={handleSubmit} isLoading={isLoading} />
          )}

          {viewMode === 'processing' && result && (
            <ProgressIndicator
              status={result.status}
              progress={result.progress}
              videoTitle={result.video_title}
              error={result.error}
            />
          )}

          {viewMode === 'result' && result && (
            <ResultDisplay
              result={result}
              onViewPianoRoll={handleViewPianoRoll}
              onViewNotation={handleViewNotation}
              onPracticeMode={handlePracticeMode}
            />
          )}

          {viewMode === 'piano-roll' && pianoRollData && (
            <PianoRollViewer
              data={pianoRollData}
              onClose={() => setViewMode('result')}
            />
          )}

          {viewMode === 'notation' && jobId && (
            <NotationViewer
              jobId={jobId}
              onClose={() => setViewMode('result')}
            />
          )}

          {viewMode === 'practice' && pianoRollData && (
            <PracticeMode
              data={pianoRollData}
              onClose={() => setViewMode('result')}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600">
            <p>Built with FastAPI, Next.js, and Basic Pitch AI</p>
          </div>
        </footer>
      </main>
    </>
  );
}
