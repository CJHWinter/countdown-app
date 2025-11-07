@echo off
chcp 65001 >nul
title 倒计时氛围感应用
echo ========================================
echo 🚀 启动倒计时氛围感应用（完整版）
echo ========================================
echo.

REM 保存项目目录
set "PROJECT_DIR=%~dp0"

REM 检查 Python 是否可用
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Python
    echo.
    echo 请先安装 Python 3: https://www.python.org/downloads/
    echo 安装时请务必勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo ✅ 检测到 Python
echo.

REM 检查并安装依赖
echo 📦 检查依赖...
cd /d "%PROJECT_DIR%爬取B站原视频"
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Flask 未安装，正在自动安装依赖...
    echo.
    if exist requirements.txt (
        pip install -q -r requirements.txt
    ) else (
        pip install -q flask flask-cors yt-dlp requests
    )
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        echo.
        echo 请尝试以下方法：
        echo    1. 运行"安装依赖.bat"
        echo    2. 或手动执行：
        echo       cd 爬取B站原视频
        echo       pip install -r requirements.txt
        echo.
        cd /d "%PROJECT_DIR%"
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ Flask 已就绪
)
cd /d "%PROJECT_DIR%"
echo.

echo 📝 正在启动服务...
echo.

REM 启动 Flask 后端（B站下载器）- 在新窗口中
echo [1/2] 启动 B站下载器后端 (端口 5000)...
start "Bilibili-Downloader-Backend" cmd /k "title Bilibili-Downloader && cd /d "%PROJECT_DIR%爬取B站原视频" && python app.py"

REM 等待 Flask 启动
timeout /t 3 /nobreak >nul

REM 启动前端服务器
echo [2/2] 启动前端服务器 (端口 8000)...
echo.
echo ========================================
echo ✅ 服务器已启动！
echo ========================================
echo.
echo 📱 主应用访问地址：
echo    http://localhost:8000
echo.
echo 🎬 B站下载器访问地址：
echo    http://localhost:5000
echo.
echo 💡 提示：
echo    - 在浏览器中打开 http://localhost:8000
echo    - 按 Ctrl+C 停止前端服务器
echo    - 关闭后端窗口可停止后端服务
echo.
echo ========================================
echo.
python -m http.server 8000

REM 如果前端服务器停止
echo.
echo ⚠️  前端服务器已停止
pause
goto :end

REM 检查 Node.js 是否可用
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 检测到 Node.js，使用 Node.js 启动服务器...
    echo.
    echo 📝 正在安装 serve（如果未安装）...
    npx --yes serve . -p 8000
    goto :end
)

REM 如果都没有，提示用户
echo ❌ 未检测到 Python 或 Node.js
echo.
echo 请安装以下任一工具：
echo.
echo 1. Python 3（推荐）:
echo    https://www.python.org/downloads/
echo    安装后运行: python -m http.server 8000
echo.
echo 2. Node.js:
echo    https://nodejs.org/
echo    安装后运行: npx serve . -p 8000
echo.
echo 3. VS Code Live Server 扩展:
echo    安装扩展后，右键 index.html 选择 "Open with Live Server"
echo.
pause

:end

