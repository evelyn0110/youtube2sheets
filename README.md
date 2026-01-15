# YouTube to Sheet Music 🎹

Convert YouTube piano performances into downloadable sheet music using AI-powered transcription.

## Features

- 🎵 **YouTube Integration** - Paste any YouTube piano video URL
- 🤖 **AI Transcription** - Powered by Spotify's Basic Pitch model
- 📄 **Multiple Formats** - Download as MIDI, MusicXML, or PDF
- 🎹 **Piano Roll Viewer** - Interactive visualization
- 🎼 **Notation Display** - View sheet music in browser
- 🎓 **Practice Mode** - Tempo control and loop sections
- 📊 **Quality Scoring** - Automatic confidence assessment

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis
- FFmpeg

### Installation

**1. Install system dependencies:**

```bash
# macOS
brew install redis ffmpeg
brew services start redis

# Linux
sudo apt install redis-server ffmpeg
sudo systemctl start redis

# Windows
choco install redis ffmpeg
```

**2. Start Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**3. Start Frontend (new terminal):**

```bash
cd frontend
npm install
npm run dev
```

**4. Open:** http://localhost:3000

### Docker (Alternative)

```bash
docker-compose up
```

## Usage

1. Open http://localhost:3000
2. Paste a YouTube URL of a piano performance
3. Click "Transcribe to Sheet Music"
4. Wait 1-3 minutes for processing
5. Download MIDI, MusicXML, or PDF files

## API Endpoints

- `POST /api/v1/transcribe` - Create transcription job
- `GET /api/v1/status/{job_id}` - Check job status
- `GET /api/v1/result/{job_id}` - Get complete result
- `GET /api/v1/download/{job_id}/{format}` - Download files
- `GET /api/v1/piano-roll/{job_id}` - Get visualization data

Full API docs: http://localhost:8000/docs

## Tech Stack

**Backend:** FastAPI, Basic Pitch (TensorFlow), yt-dlp, librosa, music21, Redis  
**Frontend:** Next.js, React, TypeScript, Tailwind CSS  
**DevOps:** Docker, Docker Compose

## Project Structure

```
youtube2sheets/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── core/     # Configuration
│   │   ├── models/   # Data models
│   │   └── services/ # Business logic
│   └── requirements.txt
├── frontend/          # Next.js frontend
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
├── docker-compose.yml
└── README.md
```

## Configuration

**Backend (.env):**
```env
REDIS_URL=redis://localhost:6379/0
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
MAX_VIDEO_LENGTH=600
ALLOWED_ORIGINS=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Troubleshooting

**Redis not running:**
```bash
redis-cli ping  # Should return: PONG
```

**Port already in use:**
```bash
# Linux/Mac
lsof -ti:8000 | xargs kill
lsof -ti:3000 | xargs kill

# Windows
netstat -ano | findstr :8000
```

**Module not found:**
```bash
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules && npm install
```

## Tips for Best Results

- Use videos with clear, solo piano audio
- Avoid videos with background noise
- Start with shorter videos (2-3 minutes)
- Check quality score (80%+ is excellent)

## Development

**Backend with hot reload:**
```bash
cd backend
uvicorn app.main:app --reload
```

**Frontend with hot reload:**
```bash
cd frontend
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file

## Acknowledgments

- [Basic Pitch](https://github.com/spotify/basic-pitch) by Spotify
- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [music21](https://web.mit.edu/music21/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)

## Support

- 📖 Check [QUICK_START.md](QUICK_START.md) for setup help
- 🐛 Open an issue for bugs
- 💡 Submit feature requests
- ⭐ Star the repo if you find it useful!

---

Built with ❤️ for pianists and music enthusiasts
