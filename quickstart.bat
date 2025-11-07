@echo off
title Countdown App - Quick Start

cd /d "%~dp0"

echo.
echo ========================================
echo      Countdown App - Starting
echo ========================================
echo.

REM Check Node.js first (better compatibility)
node --version >nul 2>&1
if %errorlevel%==0 (
    echo Node.js detected - will use Node.js server
    goto check_port
)

REM Check Python as fallback
python --version >nul 2>&1
if not %errorlevel%==0 (
    echo Neither Node.js nor Python found
    echo.
    echo Please install one of:
    echo   Node.js: https://nodejs.org/ (Recommended)
    echo   Python: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo Python detected - will use Python server
echo Note: For better browser compatibility, install Node.js
echo.

:check_port

REM Check port 8000 (skip if already checked)
:check_port_start
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel%==0 (
    echo Port 8000 is in use, closing...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
)

echo Starting server...
echo.

REM Open browser
timeout /t 1 /nobreak >nul
start http://localhost:8000

REM Check Node.js
node --version >nul 2>&1
if %errorlevel%==0 (
    if exist "%~dp0server.js" (
        echo Using Node.js server (supports video seeking)
        echo.
        echo ========================================
        echo Server started successfully
        echo ========================================
        echo.
        echo URL: http://localhost:8000
        echo.
        echo Press Ctrl+C to stop
        echo.
        echo ========================================
        echo.
        node server.js
        goto end
    )
)

REM Use Python server
echo Using Python server
echo.
echo ========================================
echo Server started successfully
echo ========================================
echo.
echo URL: http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.
echo Note: Python server does not support video seeking
echo       Install Node.js for full features
echo.
echo ========================================
echo.
python -m http.server 8000

:end
echo.
echo Server stopped
pause
