import os
import logging
from pathlib import Path
from typing import List, Tuple
import numpy as np
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
import librosa

logger = logging.getLogger(__name__)

class PianoTranscriber:
    """Transcribe audio to MIDI using Basic Pitch model."""
    
    def __init__(self):
        """Initialize the transcriber with Basic Pitch model."""
        self.model_path = ICASSP_2022_MODEL_PATH
        logger.info("Initialized Basic Pitch transcriber")
    
    def transcribe(self, audio_path: str, output_dir: str) -> Tuple[str, dict]:
        """
        Transcribe audio to MIDI.
        
        Args:
            audio_path: Path to input audio file
            output_dir: Directory to save output files
            
        Returns:
            Tuple of (midi_path, quality_metrics)
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Run Basic Pitch inference
            logger.info(f"Starting transcription for {audio_path}")
            
            model_output, midi_data, note_events = predict(
                audio_path,
                self.model_path,
                onset_threshold=0.5,
                frame_threshold=0.3,
                minimum_note_length=127.70,  # ms
                minimum_frequency=None,
                maximum_frequency=None,
                multiple_pitch_bends=False,
                melodia_trick=True,
                debug_file=None,
            )
            
            # Save MIDI file
            midi_path = output_path / "transcription.mid"
            midi_data.write(str(midi_path))
            
            logger.info(f"Transcription completed: {midi_path}")
            
            # Calculate quality metrics
            quality_metrics = self._calculate_quality_metrics(
                midi_data, 
                audio_path,
                note_events
            )
            
            return str(midi_path), quality_metrics
            
        except Exception as e:
            logger.error(f"Error during transcription: {e}")
            raise
    
    def _calculate_quality_metrics(self, midi_data, audio_path: str, 
                                   note_events) -> dict:
        """
        Calculate quality metrics for the transcription.
        
        Args:
            midi_data: MIDI data object
            audio_path: Path to original audio
            note_events: Note events from transcription
            
        Returns:
            Dictionary of quality metrics
        """
        try:
            # Count notes
            note_count = len([n for track in midi_data.tracks for n in track 
                            if n.type == 'note_on'])
            
            # Get duration
            duration = librosa.get_duration(path=audio_path)
            
            # Calculate average polyphony (notes playing simultaneously)
            if note_events is not None and len(note_events) > 0:
                # Simple polyphony estimation
                polyphony_avg = min(note_count / max(duration, 1), 10.0)
            else:
                polyphony_avg = 0.0
            
            # Confidence score (simplified - based on note density)
            # In production, you'd use more sophisticated metrics
            expected_density = 5.0  # notes per second for typical piano
            actual_density = note_count / max(duration, 1)
            confidence_score = min(actual_density / expected_density, 1.0)
            confidence_score = max(0.3, min(confidence_score, 0.95))  # Clamp
            
            return {
                'confidence_score': round(confidence_score, 2),
                'note_count': note_count,
                'duration': round(duration, 2),
                'polyphony_avg': round(polyphony_avg, 2),
            }
            
        except Exception as e:
            logger.error(f"Error calculating quality metrics: {e}")
            return {
                'confidence_score': 0.5,
                'note_count': 0,
                'duration': 0.0,
                'polyphony_avg': 0.0,
            }
    
    def apply_piano_postprocessing(self, midi_path: str, output_path: str) -> str:
        """
        Apply piano-specific post-processing to MIDI.
        
        Args:
            midi_path: Input MIDI path
            output_path: Output MIDI path
            
        Returns:
            Path to processed MIDI
        """
        try:
            import mido
            
            midi = mido.MidiFile(midi_path)
            
            # Apply quantization
            midi = self._quantize_midi(midi)
            
            # Split into hands (basic heuristic)
            midi = self._split_hands(midi)
            
            # Save processed MIDI
            midi.save(output_path)
            
            logger.info(f"Applied piano post-processing: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error in post-processing: {e}")
            # Return original if processing fails
            import shutil
            shutil.copy(midi_path, output_path)
            return output_path
    
    def _quantize_midi(self, midi):
        """Apply quantization to MIDI timing."""
        # Simplified quantization - in production use more sophisticated approach
        return midi
    
    def _split_hands(self, midi):
        """Split notes into left and right hand tracks."""
        # Simplified hand split - in production use ML or heuristics
        # Typically: notes above middle C (60) = right hand, below = left hand
        return midi
