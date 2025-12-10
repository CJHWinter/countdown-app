@echo off
cd /d "%~dp0"

echo Checking Python...
python --version
if errorlevel 1 goto no_python

echo Upgrading pip...
python -m pip install --upgrade pip --quiet

echo Installing Pillow...
pip install pillow --quiet

echo Installing downloader dependencies...
if exist crawl_videos\requirements.txt (
    cd crawl_videos
    pip install -r requirements.txt --quiet
    cd ..
)

echo Done!
echo.
echo Next: Run generate-music-list.bat or quickstart.bat
echo.
pause
goto end

:no_python
echo ERROR: Python not found
echo Please install Python from: https://www.python.org/downloads/
pause

:end