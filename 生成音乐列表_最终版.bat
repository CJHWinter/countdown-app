@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Music List Generator

echo.
echo ========================================
echo      Music List Generator
echo ========================================
echo.

echo [P] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo X Error: Node.js not found
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
echo [OK] Node.js installed: %NODE_VERSION%
echo.

echo [S] Scanning music folders...
echo.
echo Scanning directories:
echo   - music/learning/
echo   - music/rest/
echo.

if not exist "generate-music-list.js" (
    echo X Error: generate-music-list.js not found
    echo.
    pause
    exit /b 1
)

node generate-music-list.js

if errorlevel 1 (
    echo.
    echo X Generation failed
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Music list generated successfully!
echo.
echo [F] Generated file: music-list.json
echo.
echo [Tips]:
echo   - Run this script again after adding new music
echo   - Supported formats: .mp3, .mp4, .wav, .ogg, .m4a
echo.
echo ========================================
echo.
pause