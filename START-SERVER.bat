@echo off
chcp 65001 >nul 2>&1
title Countdown App Server
cls

echo ========================================
echo  Countdown App - Server Launcher
echo ========================================
echo.

REM Save project directory
set "PROJECT_DIR=%~dp0"

REM Check Python
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found
    echo.
    echo Please install Python 3: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)
echo [OK] Python is ready
echo.

REM Check Flask
echo [2/4] Checking Flask dependencies...
cd /d "%PROJECT_DIR%爬取B站原视频"
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing Flask...
    pip install -q flask flask-cors yt-dlp requests
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        echo.
        echo Please run manually:
        echo    cd 爬取B站原视频
        echo    pip install -r requirements.txt
        echo.
        cd /d "%PROJECT_DIR%"
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Flask is ready
)
cd /d "%PROJECT_DIR%"
echo.

REM Start Flask backend
echo [3/4] Starting Bilibili Downloader Backend (Port 5000)...
start "Bilibili-Backend" cmd /k "cd /d "%PROJECT_DIR%爬取B站原视频" && python app.py"
timeout /t 3 /nobreak >nul
echo [OK] Backend started
echo.

REM Start frontend server
echo [4/4] Starting Frontend Server (Port 8000)...
echo.
echo ========================================
echo  All Services Started Successfully!
echo ========================================
echo.
echo Main App:
echo    http://localhost:8000
echo.
echo Bilibili Downloader:
echo    http://localhost:5000
echo.
echo Tips:
echo    - Open http://localhost:8000 in your browser
echo    - Press Ctrl+C to stop frontend server
echo    - Close backend window to stop backend
echo.
echo ========================================
echo.
echo [RUNNING] Frontend server is running...
echo.

python -m http.server 8000

echo.
echo [INFO] Frontend server stopped
pause

