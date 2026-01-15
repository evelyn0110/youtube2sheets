import os
import subprocess
import logging
from pathlib import Path
from typing import Tuple, Optional
import yt_dlp
from pydub import AudioSegment
import librosa
import soundfile as sf

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Handle audio download and processing."""
    
    def __init__(self, output_dir: str):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def download_youtube_audio(self, url: str, job_id: str) -> Tuple[str, dict]:
        """
        Download audio from YouTube video.
        
        Args:
            url: YouTube video URL
            job_id: Unique job identifier
            
        Returns:
            Tuple of (audio_path, video_info)
        """
        output_path = self.output_dir / job_id
        output_path.mkdir(exist_ok=True)
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': str(output_path / 'audio.%(ext)s'),
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'wav',
            }],
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                audio_file = output_path / 'audio.wav'
                
                video_info = {
                    'title': info.get('title', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', 'Unknown'),
                }
                
                logger.info(f"Downloaded audio for job {job_id}: {video_info['title']}")
                return str(audio_file), video_info
                
        except Exception as e:
            logger.error(f"Error downloading audio: {e}")
            raise
    
    def convert_to_mono_wav(self, input_path: str, output_path: str, 
                           sample_rate: int = 16000) -> str:
        """
        Convert audio to mono WAV at specified sample rate.
        
        Args:
            input_path: Input audio file path
            output_path: Output WAV file path
            sample_rate: Target sample rate (Hz)
            
        Returns:
            Path to converted audio file
        """
        try:
            # Load audio with librosa
            y, sr = librosa.load(input_path, sr=sample_rate, mono=True)
            
            # Save as WAV
            sf.write(output_path, y, sr)
            
            logger.info(f"Converted audio to mono WAV: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error converting audio: {e}")
            raise
    
    def normalize_audio(self, audio_path: str) -> str:
        """
        Normalize audio levels.
        
        Args:
            audio_path: Path to audio file
            
        Returns:
            Path to normalized audio file
        """
        try:
            audio = AudioSegment.from_wav(audio_path)
            
            # Normalize to -20 dBFS
            change_in_dBFS = -20.0 - audio.dBFS
            normalized_audio = audio.apply_gain(change_in_dBFS)
            
            # Overwrite original
            normalized_audio.export(audio_path, format="wav")
            
            logger.info(f"Normalized audio: {audio_path}")
            return audio_path
            
        except Exception as e:
            logger.error(f"Error normalizing audio: {e}")
            raise
    
    def isolate_piano(self, audio_path: str, output_path: str) -> str:
        """
        Attempt to isolate piano from mix using source separation.
        This is a placeholder - you would integrate a model like Demucs or Spleeter.
        
        Args:
            audio_path: Input audio path
            output_path: Output path for isolated piano
            
        Returns:
            Path to isolated piano audio
        """
        # For now, just copy the file
        # In production, you'd use a source separation model
        logger.warning("Piano isolation not yet implemented, using original audio")
        
        import shutil
        shutil.copy(audio_path, output_path)
        return output_path
    
    def get_audio_duration(self, audio_path: str) -> float:
        """Get duration of audio file in seconds."""
        try:
            y, sr = librosa.load(audio_path, sr=None, duration=1)
            duration = librosa.get_duration(path=audio_path)
            return duration
        except Exception as e:
            logger.error(f"Error getting audio duration: {e}")
            return 0.0
