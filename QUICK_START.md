# Quick Start Guide 🚀

Get up and running in 5 minutes!

## Prerequisites

- Python 3.10+
- Node.js 18+
- Redis
- FFmpeg

## Installation

### 1. Install Redis and FFmpeg

**Windows:**
```bash
choco install redis ffmpeg
```

**macOS:**
```bash
brew install redis ffmpeg
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server ffmpeg
sudo systemctl start redis
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Paste a YouTube URL of a piano performance
3. Click "Transcribe to Sheet Music"
4. Wait 1-3 minutes for processing
5. Download MIDI, MusicXML, or PDF files!

## Example URLs to Try

- https://www.youtube.com/watch?v=nlUD2MFwBXk (Piano performance)
- Any YouTube video with clear piano audio

## Troubleshooting

**Redis not running?**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

**Backend won't start?**
- Make sure virtual environment is activated
- Check if port 8000 is available

**Frontend won't start?**
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is available

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup
- Visit http://localhost:8000/docs for API documentation

Enjoy! 🎹
