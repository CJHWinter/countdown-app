@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Dependency Installer

echo ========================================
echo  Dependency Installation
echo ========================================
echo.

echo [1] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH"
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo OK: Python %PYTHON_VERSION%
echo.

echo [2] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: Node.js not found
    echo Node.js is used for music list generation
    echo Download: https://nodejs.org/
    set NODE_INSTALLED=false
) else (
    for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo OK: Node.js %NODE_VERSION%
    set NODE_INSTALLED=true
)
echo.

echo [3] Installing Python dependencies...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pip not found
    pause
    exit /b 1
)

echo Upgrading pip...
python -m pip install --upgrade pip --quiet

echo Installing Pillow...
python -c "import PIL" >nul 2>&1
if errorlevel 1 (
    pip install pillow --quiet
    if errorlevel 1 (
        echo WARNING: Pillow installation failed
    ) else (
        echo OK: Pillow installed
    )
) else (
    echo OK: Pillow already installed
)
echo.

echo [4] Installing Bilibili downloader dependencies...
if not exist "crawl_videos\requirements.txt" (
    echo WARNING: requirements.txt not found
) else (
    cd crawl_videos
    echo Installing Flask, yt-dlp, requests...
    pip install -r requirements.txt --quiet
    if errorlevel 1 (
        echo ERROR: Installation failed
    ) else (
        echo OK: Dependencies installed
    )
    cd ..
)
echo.

echo [5] Checking FFmpeg...
if exist "crawl_videos\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" (
    echo OK: FFmpeg already exists
) else (
    echo FFmpeg not found
    set /p DOWNLOAD_FFMPEG="Download FFmpeg? (Y/N): "
    if /i "!DOWNLOAD_FFMPEG!"=="Y" (
        echo Downloading FFmpeg...
        echo This may take a few minutes...
        cd crawl_videos
        curl -L -o ffmpeg.zip "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
        if exist ffmpeg.zip (
            echo Extracting FFmpeg...
            tar -xf ffmpeg.zip
            del ffmpeg.zip
            echo OK: FFmpeg downloaded
        ) else (
            echo ERROR: Download failed
            echo Please download manually from:
            echo https://github.com/BtbN/FFmpeg-Builds/releases
        )
        cd ..
    ) else (
        echo Skipping FFmpeg download
    )
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Installed:
echo - Python
echo - Pillow
if exist "crawl_videos\requirements.txt" echo - Flask/yt-dlp
if exist "crawl_videos\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" echo - FFmpeg
if "!NODE_INSTALLED!"=="true" echo - Node.js
echo.
echo Next steps:
echo 1. Run generate-icons.bat
echo 2. Run generate-music-list.bat
echo 3. Run start-server.bat or quickstart.bat
echo.
pause