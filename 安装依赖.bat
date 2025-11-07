@echo off
chcp 65001 >nul
title 倒计时氛围感 - 依赖安装工具

echo.
echo ========================================
echo      倒计时氛围感 - 依赖安装
echo ========================================
echo.
echo 正在检查和安装项目所需的所有依赖...
echo.

REM ================================
REM 检查 Python 环境
REM ================================
echo [1/5] 检查 Python 环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Python
    echo.
    echo 请先安装 Python：
    echo    下载地址：https://www.python.org/downloads/
    echo    安装时务必勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python 已安装 (版本: %PYTHON_VERSION%)
echo.

REM ================================
REM 检查 Node.js 环境
REM ================================
echo [2/5] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未检测到 Node.js
    echo.
    echo Node.js 用于：
    echo   - 生成音乐列表 (generate-music-list.js)
    echo   - 本地服务器 (server.js)
    echo.
    echo 建议安装：https://nodejs.org/
    echo.
    set NODE_INSTALLED=false
) else (
    for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
    echo ✅ Node.js 已安装 (版本: %NODE_VERSION%)
    set NODE_INSTALLED=true
)
echo.

REM ================================
REM 安装 Python 核心依赖
REM ================================
echo [3/5] 安装 Python 核心依赖...
echo.

REM 检查 pip
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip 未安装，无法继续
    pause
    exit /b 1
)

REM 升级 pip
echo 📦 升级 pip...
python -m pip install --upgrade pip --quiet

REM 安装 Pillow（图标生成需要）
echo 📦 安装 Pillow (图标生成工具)...
python -c "import PIL" >nul 2>&1
if errorlevel 1 (
    pip install pillow --quiet
    if errorlevel 1 (
        echo ⚠️  Pillow 安装失败
    ) else (
        echo ✅ Pillow 安装成功
    )
) else (
    echo ✅ Pillow 已安装
)
echo.

REM ================================
REM 安装 B站下载器依赖
REM ================================
echo [4/5] 安装 B站下载器依赖...
echo.

if not exist "爬取B站原视频\requirements.txt" (
    echo ⚠️  找不到 requirements.txt
    echo.
) else (
    cd 爬取B站原视频
    echo 📦 安装 Flask, yt-dlp, requests...
    pip install -r requirements.txt --quiet
    if errorlevel 1 (
        echo ❌ B站下载器依赖安装失败
    ) else (
        echo ✅ B站下载器依赖安装成功
    )
    cd ..
)
echo.

REM ================================
REM 检查 FFmpeg
REM ================================
echo [5/5] 检查 FFmpeg...
echo.

if exist "爬取B站原视频\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" (
    echo ✅ FFmpeg 已存在
    echo.
) else (
    echo ⚠️  未检测到 FFmpeg
    echo.
    echo FFmpeg 是视频下载和处理的必需工具
    echo.
    set /p DOWNLOAD_FFMPEG="是否自动下载 FFmpeg？ (Y/N): "
    if /i "%DOWNLOAD_FFMPEG%"=="Y" (
        echo.
        echo 📥 正在下载 FFmpeg...
        echo 这可能需要几分钟，请耐心等待...
        cd 爬取B站原视频
        
        REM 下载 FFmpeg
        curl -L -o ffmpeg.zip "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
        
        if exist ffmpeg.zip (
            echo 📦 正在解压 FFmpeg...
            tar -xf ffmpeg.zip
            del ffmpeg.zip
            echo ✅ FFmpeg 下载并解压完成
        ) else (
            echo ❌ FFmpeg 下载失败
            echo.
            echo 请手动下载：
            echo    https://github.com/BtbN/FFmpeg-Builds/releases
            echo    下载 ffmpeg-master-latest-win64-gpl.zip
            echo    解压到 爬取B站原视频\ 目录
        )
        cd ..
    ) else (
        echo.
        echo ℹ️  跳过 FFmpeg 下载
        echo.
        echo 如需使用 B站下载器，请手动下载 FFmpeg：
        echo    1. 访问：https://github.com/BtbN/FFmpeg-Builds/releases
        echo    2. 下载：ffmpeg-master-latest-win64-gpl.zip
        echo    3. 解压到 爬取B站原视频\ 目录
    )
)
echo.

REM ================================
REM 安装完成
REM ================================
echo ========================================
echo.
echo 🎉 依赖安装完成！
echo.
echo ✅ 已安装的功能：
echo    - Python 核心环境
echo    - Pillow (图标生成)

if exist "爬取B站原视频\requirements.txt" (
    echo    - Flask/yt-dlp (B站下载器)
)

if exist "爬取B站原视频\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" (
    echo    - FFmpeg (视频处理)
)

if "%NODE_INSTALLED%"=="true" (
    echo    - Node.js (音乐列表生成)
)

echo.
echo 📋 现在你可以：
echo    1. 双击 "生成PWA图标.bat" - 生成应用图标
echo    2. 双击 "生成音乐列表.bat" - 扫描音乐文件
echo    3. 双击 "启动服务器.bat" - 启动B站下载器
echo    4. 双击 "完整启动.bat" - 启动完整应用
echo.
echo ========================================
echo.
pause

