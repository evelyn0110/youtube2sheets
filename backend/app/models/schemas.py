from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List
from enum import Enum

class TranscriptionStatus(str, Enum):
    """Status of a transcription job."""
    PENDING = "pending"
    DOWNLOADING = "downloading"
    PROCESSING = "processing"
    TRANSCRIBING = "transcribing"
    CONVERTING = "converting"
    COMPLETED = "completed"
    FAILED = "failed"

class TranscriptionRequest(BaseModel):
    """Request to transcribe a YouTube video."""
    youtube_url: HttpUrl
    isolate_piano: bool = Field(default=False, description="Attempt to isolate piano from mix")

class NoteEvent(BaseModel):
    """A single note event."""
    pitch: int
    velocity: int
    start_time: float
    end_time: float
    
class TranscriptionQuality(BaseModel):
    """Quality metrics for transcription."""
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    note_count: int
    duration: float
    polyphony_avg: float
    
class TranscriptionResult(BaseModel):
    """Result of a transcription job."""
    job_id: str
    status: TranscriptionStatus
    progress: int = Field(default=0, ge=0, le=100)
    video_title: Optional[str] = None
    video_duration: Optional[float] = None
    quality: Optional[TranscriptionQuality] = None
    midi_url: Optional[str] = None
    musicxml_url: Optional[str] = None
    pdf_url: Optional[str] = None
    error: Optional[str] = None
    created_at: str
    completed_at: Optional[str] = None

class JobStatusResponse(BaseModel):
    """Response for job status check."""
    job_id: str
    status: TranscriptionStatus
    progress: int
    result: Optional[TranscriptionResult] = None
