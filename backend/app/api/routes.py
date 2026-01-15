import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pathlib import Path
from app.models.schemas import (
    TranscriptionRequest, 
    TranscriptionResult,
    JobStatusResponse,
    TranscriptionStatus
)
from app.services.job_manager import JobManager
from app.services.worker import TranscriptionWorker
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()
job_manager = JobManager(settings.REDIS_URL)
worker = TranscriptionWorker()

@router.post("/transcribe", response_model=TranscriptionResult)
async def create_transcription(
    request: TranscriptionRequest,
    background_tasks: BackgroundTasks
):
    """
    Create a new transcription job.
    
    Args:
        request: Transcription request with YouTube URL
        background_tasks: FastAPI background tasks
        
    Returns:
        TranscriptionResult with job ID and status
    """
    try:
        # Create job
        job_id = job_manager.create_job(str(request.youtube_url))
        
        # Start processing in background
        background_tasks.add_task(
            worker.process_job,
            job_id,
            str(request.youtube_url),
            request.isolate_piano
        )
        
        # Return initial result
        result = job_manager.get_result(job_id)
        return result
        
    except Exception as e:
        logger.error(f"Error creating transcription: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get the status of a transcription job.
    
    Args:
        job_id: Job ID
        
    Returns:
        JobStatusResponse with current status and progress
    """
    result = job_manager.get_result(job_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return JobStatusResponse(
        job_id=job_id,
        status=result.status,
        progress=result.progress,
        result=result if result.status == TranscriptionStatus.COMPLETED else None
    )

@router.get("/result/{job_id}", response_model=TranscriptionResult)
async def get_transcription_result(job_id: str):
    """
    Get the complete result of a transcription job.
    
    Args:
        job_id: Job ID
        
    Returns:
        TranscriptionResult with all output URLs
    """
    result = job_manager.get_result(job_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return result

@router.get("/download/{job_id}/midi")
async def download_midi(job_id: str):
    """Download MIDI file for a job."""
    output_dir = Path(settings.OUTPUT_DIR) / job_id
    midi_path = output_dir / "transcription_processed.mid"
    
    if not midi_path.exists():
        raise HTTPException(status_code=404, detail="MIDI file not found")
    
    return FileResponse(
        path=midi_path,
        media_type="audio/midi",
        filename=f"transcription_{job_id}.mid"
    )

@router.get("/download/{job_id}/musicxml")
async def download_musicxml(job_id: str):
    """Download MusicXML file for a job."""
    output_dir = Path(settings.OUTPUT_DIR) / job_id
    xml_path = output_dir / "transcription.musicxml"
    
    if not xml_path.exists():
        raise HTTPException(status_code=404, detail="MusicXML file not found")
    
    return FileResponse(
        path=xml_path,
        media_type="application/vnd.recordare.musicxml+xml",
        filename=f"transcription_{job_id}.musicxml"
    )

@router.get("/download/{job_id}/pdf")
async def download_pdf(job_id: str):
    """Download PDF file for a job."""
    output_dir = Path(settings.OUTPUT_DIR) / job_id
    pdf_path = output_dir / "transcription.pdf"
    
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"transcription_{job_id}.pdf"
    )

@router.get("/piano-roll/{job_id}")
async def get_piano_roll_data(job_id: str):
    """Get piano roll data for visualization."""
    from app.services.converter import MusicConverter
    
    output_dir = Path(settings.OUTPUT_DIR) / job_id
    midi_path = output_dir / "transcription_processed.mid"
    
    if not midi_path.exists():
        raise HTTPException(status_code=404, detail="MIDI file not found")
    
    converter = MusicConverter()
    piano_roll_data = converter.create_piano_roll_data(str(midi_path))
    
    return piano_roll_data

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "youtube2sheets"}
