import logging
import os
from pathlib import Path
from app.services.audio_processor import AudioProcessor
from app.services.transcriber import PianoTranscriber
from app.services.converter import MusicConverter
from app.services.job_manager import JobManager
from app.models.schemas import TranscriptionStatus
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TranscriptionWorker:
    """Worker to process transcription jobs."""
    
    def __init__(self):
        """Initialize worker with all services."""
        self.audio_processor = AudioProcessor(settings.UPLOAD_DIR)
        self.transcriber = PianoTranscriber()
        self.converter = MusicConverter()
        self.job_manager = JobManager(settings.REDIS_URL)
        logger.info("Initialized TranscriptionWorker")
    
    def process_job(self, job_id: str, youtube_url: str, isolate_piano: bool = False):
        """
        Process a transcription job.
        
        Args:
            job_id: Job ID
            youtube_url: YouTube video URL
            isolate_piano: Whether to isolate piano from mix
        """
        try:
            logger.info(f"Starting job {job_id}")
            
            # Step 1: Download audio
            self.job_manager.update_status(
                job_id, 
                TranscriptionStatus.DOWNLOADING, 
                progress=10
            )
            
            audio_path, video_info = self.audio_processor.download_youtube_audio(
                youtube_url, 
                job_id
            )
            
            self.job_manager.update_job(
                job_id,
                video_title=video_info['title'],
                video_duration=video_info['duration']
            )
            
            # Step 2: Process audio
            self.job_manager.update_status(
                job_id,
                TranscriptionStatus.PROCESSING,
                progress=30
            )
            
            # Convert to mono and normalize
            processed_path = str(Path(audio_path).parent / "processed.wav")
            self.audio_processor.convert_to_mono_wav(audio_path, processed_path)
            self.audio_processor.normalize_audio(processed_path)
            
            # Optionally isolate piano
            if isolate_piano:
                isolated_path = str(Path(audio_path).parent / "isolated.wav")
                processed_path = self.audio_processor.isolate_piano(
                    processed_path, 
                    isolated_path
                )
            
            # Step 3: Transcribe
            self.job_manager.update_status(
                job_id,
                TranscriptionStatus.TRANSCRIBING,
                progress=50
            )
            
            output_dir = Path(settings.OUTPUT_DIR) / job_id
            output_dir.mkdir(parents=True, exist_ok=True)
            
            midi_path, quality_metrics = self.transcriber.transcribe(
                processed_path,
                str(output_dir)
            )
            
            # Apply piano post-processing
            processed_midi = str(output_dir / "transcription_processed.mid")
            self.transcriber.apply_piano_postprocessing(midi_path, processed_midi)
            
            # Step 4: Convert to other formats
            self.job_manager.update_status(
                job_id,
                TranscriptionStatus.CONVERTING,
                progress=80
            )
            
            # Convert to MusicXML
            musicxml_path = str(output_dir / "transcription.musicxml")
            self.converter.midi_to_musicxml(processed_midi, musicxml_path)
            
            # Convert to PDF (optional, may fail if MuseScore not available)
            pdf_path = str(output_dir / "transcription.pdf")
            pdf_result = self.converter.musicxml_to_pdf(musicxml_path, pdf_path)
            
            # Create piano roll data
            piano_roll_data = self.converter.create_piano_roll_data(processed_midi)
            
            # Step 5: Complete
            self.job_manager.update_job(
                job_id,
                status=TranscriptionStatus.COMPLETED,
                progress=100,
                quality=quality_metrics,
                midi_url=f"/api/v1/download/{job_id}/midi",
                musicxml_url=f"/api/v1/download/{job_id}/musicxml",
                pdf_url=f"/api/v1/download/{job_id}/pdf" if pdf_result else None,
            )
            
            logger.info(f"Completed job {job_id}")
            
        except Exception as e:
            logger.error(f"Error processing job {job_id}: {e}", exc_info=True)
            self.job_manager.set_error(job_id, str(e))
