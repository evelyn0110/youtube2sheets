import logging
import json
import uuid
from datetime import datetime
from typing import Optional, Dict
from redis import Redis
from app.models.schemas import TranscriptionStatus, TranscriptionResult

logger = logging.getLogger(__name__)

class JobManager:
    """Manage transcription jobs using Redis."""
    
    def __init__(self, redis_url: str):
        """Initialize job manager with Redis connection."""
        self.redis = Redis.from_url(redis_url, decode_responses=True)
        logger.info(f"Initialized JobManager with Redis at {redis_url}")
    
    def create_job(self, youtube_url: str) -> str:
        """
        Create a new transcription job.
        
        Args:
            youtube_url: YouTube video URL
            
        Returns:
            Job ID
        """
        job_id = str(uuid.uuid4())
        
        job_data = {
            'job_id': job_id,
            'youtube_url': youtube_url,
            'status': TranscriptionStatus.PENDING,
            'progress': 0,
            'created_at': datetime.utcnow().isoformat(),
        }
        
        # Store in Redis with 24 hour expiry
        self.redis.setex(
            f"job:{job_id}",
            86400,  # 24 hours
            json.dumps(job_data)
        )
        
        logger.info(f"Created job {job_id} for URL: {youtube_url}")
        return job_id
    
    def get_job(self, job_id: str) -> Optional[Dict]:
        """
        Get job data.
        
        Args:
            job_id: Job ID
            
        Returns:
            Job data dictionary or None if not found
        """
        data = self.redis.get(f"job:{job_id}")
        if data:
            return json.loads(data)
        return None
    
    def update_job(self, job_id: str, **kwargs):
        """
        Update job data.
        
        Args:
            job_id: Job ID
            **kwargs: Fields to update
        """
        job_data = self.get_job(job_id)
        if not job_data:
            logger.error(f"Job {job_id} not found")
            return
        
        job_data.update(kwargs)
        
        # Update in Redis
        self.redis.setex(
            f"job:{job_id}",
            86400,
            json.dumps(job_data)
        )
        
        logger.info(f"Updated job {job_id}: {kwargs}")
    
    def update_status(self, job_id: str, status: TranscriptionStatus, 
                     progress: int = None):
        """
        Update job status and progress.
        
        Args:
            job_id: Job ID
            status: New status
            progress: Progress percentage (0-100)
        """
        updates = {'status': status}
        if progress is not None:
            updates['progress'] = progress
        
        if status == TranscriptionStatus.COMPLETED:
            updates['completed_at'] = datetime.utcnow().isoformat()
        
        self.update_job(job_id, **updates)
    
    def set_error(self, job_id: str, error: str):
        """
        Set job as failed with error message.
        
        Args:
            job_id: Job ID
            error: Error message
        """
        self.update_job(
            job_id,
            status=TranscriptionStatus.FAILED,
            error=error,
            completed_at=datetime.utcnow().isoformat()
        )
    
    def get_result(self, job_id: str) -> Optional[TranscriptionResult]:
        """
        Get transcription result.
        
        Args:
            job_id: Job ID
            
        Returns:
            TranscriptionResult or None
        """
        job_data = self.get_job(job_id)
        if not job_data:
            return None
        
        try:
            return TranscriptionResult(**job_data)
        except Exception as e:
            logger.error(f"Error creating TranscriptionResult: {e}")
            return None
