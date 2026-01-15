import os
import logging
from pathlib import Path
from typing import Optional
import subprocess
import music21

logger = logging.getLogger(__name__)

class MusicConverter:
    """Convert between music formats (MIDI, MusicXML, PDF)."""
    
    def __init__(self):
        """Initialize the converter."""
        pass
    
    def midi_to_musicxml(self, midi_path: str, output_path: str) -> str:
        """
        Convert MIDI to MusicXML format.
        
        Args:
            midi_path: Path to input MIDI file
            output_path: Path for output MusicXML file
            
        Returns:
            Path to MusicXML file
        """
        try:
            # Parse MIDI with music21
            score = music21.converter.parse(midi_path)
            
            # Add metadata
            score.metadata = music21.metadata.Metadata()
            score.metadata.title = "Piano Transcription"
            score.metadata.composer = "Transcribed by YouTube2Sheets"
            
            # Analyze and add key signature
            try:
                key = score.analyze('key')
                score.insert(0, key)
            except:
                pass  # Skip if key analysis fails
            
            # Write MusicXML
            score.write('musicxml', fp=output_path)
            
            logger.info(f"Converted MIDI to MusicXML: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error converting MIDI to MusicXML: {e}")
            raise
    
    def musicxml_to_pdf(self, musicxml_path: str, output_path: str) -> Optional[str]:
        """
        Convert MusicXML to PDF using MuseScore.
        
        Args:
            musicxml_path: Path to input MusicXML file
            output_path: Path for output PDF file
            
        Returns:
            Path to PDF file, or None if MuseScore not available
        """
        try:
            # Check if MuseScore is available
            musescore_cmd = self._find_musescore()
            
            if not musescore_cmd:
                logger.warning("MuseScore not found, skipping PDF generation")
                return None
            
            # Convert using MuseScore CLI
            subprocess.run(
                [musescore_cmd, musicxml_path, '-o', output_path],
                check=True,
                capture_output=True,
                timeout=60
            )
            
            logger.info(f"Converted MusicXML to PDF: {output_path}")
            return output_path
            
        except subprocess.TimeoutExpired:
            logger.error("MuseScore conversion timed out")
            return None
        except subprocess.CalledProcessError as e:
            logger.error(f"MuseScore conversion failed: {e}")
            return None
        except Exception as e:
            logger.error(f"Error converting to PDF: {e}")
            return None
    
    def _find_musescore(self) -> Optional[str]:
        """Find MuseScore executable."""
        # Common MuseScore paths
        possible_paths = [
            'musescore',
            'mscore',
            '/usr/bin/musescore',
            '/usr/local/bin/musescore',
            'C:\\Program Files\\MuseScore 3\\bin\\MuseScore3.exe',
            'C:\\Program Files\\MuseScore 4\\bin\\MuseScore4.exe',
        ]
        
        for path in possible_paths:
            try:
                result = subprocess.run(
                    [path, '--version'],
                    capture_output=True,
                    timeout=5
                )
                if result.returncode == 0:
                    return path
            except:
                continue
        
        return None
    
    def create_piano_roll_data(self, midi_path: str) -> dict:
        """
        Extract piano roll data from MIDI for visualization.
        
        Args:
            midi_path: Path to MIDI file
            
        Returns:
            Dictionary with piano roll data
        """
        try:
            import mido
            
            midi = mido.MidiFile(midi_path)
            
            notes = []
            current_time = 0
            tempo = 500000  # Default tempo (120 BPM)
            
            for track in midi.tracks:
                track_time = 0
                active_notes = {}
                
                for msg in track:
                    track_time += msg.time
                    
                    if msg.type == 'set_tempo':
                        tempo = msg.tempo
                    elif msg.type == 'note_on' and msg.velocity > 0:
                        # Note starts
                        active_notes[msg.note] = {
                            'start': track_time,
                            'velocity': msg.velocity
                        }
                    elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                        # Note ends
                        if msg.note in active_notes:
                            note_info = active_notes.pop(msg.note)
                            notes.append({
                                'pitch': msg.note,
                                'start': note_info['start'],
                                'end': track_time,
                                'velocity': note_info['velocity']
                            })
            
            # Convert ticks to seconds
            ticks_per_beat = midi.ticks_per_beat
            seconds_per_tick = (tempo / 1000000) / ticks_per_beat
            
            for note in notes:
                note['start'] = note['start'] * seconds_per_tick
                note['end'] = note['end'] * seconds_per_tick
                note['duration'] = note['end'] - note['start']
            
            return {
                'notes': notes,
                'tempo': 60000000 / tempo,  # BPM
                'duration': max([n['end'] for n in notes]) if notes else 0
            }
            
        except Exception as e:
            logger.error(f"Error creating piano roll data: {e}")
            return {'notes': [], 'tempo': 120, 'duration': 0}
