@echo off
REM YouTube to Sheet Music - Startup Script for Windows
REM This script starts all services for local development

echo 🎹 Starting YouTube to Sheet Music...
echo.

REM Check if Redis is running
echo Checking Redis...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ❌ Redis is not running. Please start Redis first.
    echo    You can download Redis from: https://github.com/microsoftarchive/redis/releases
    exit /b 1
)
echo ✅ Redis is running
echo.

REM Start backend
echo Starting backend server...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -q -r requirements.txt
start "Backend Server" cmd /k python run.py
cd ..
echo ✅ Backend started
echo.

REM Wait for backend to be ready
echo Waiting for backend to be ready...
timeout /t 5 /nobreak >nul

REM Start frontend
echo Starting frontend server...
cd frontend
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
)
start "Frontend Server" cmd /k npm run dev
cd ..
echo ✅ Frontend started
echo.

echo 🎉 All services started!
echo.
echo 📍 Access the application:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul
