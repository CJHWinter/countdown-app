@echo off
chcp 65001 >nul
title 倒计时氛围感应用 - 主控制台
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          🚀 倒计时氛围感应用 - 完整启动脚本                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 保存当前目录
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo [步骤 1/4] 检查 Python 环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo ❌ 错误：未检测到 Python
    echo.
    echo 请先安装 Python 3: https://www.python.org/downloads/
    echo 安装时请务必勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo    ✅ %PYTHON_VERSION%
echo.

echo [步骤 2/4] 检查 Flask 依赖...
cd "%PROJECT_DIR%爬取B站原视频"
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo    ⚠️  Flask 未安装，正在自动安装...
    echo.
    pip install -q flask flask-cors yt-dlp requests
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ❌ 依赖安装失败
        echo.
        echo 请手动执行：
        echo    cd 爬取B站原视频
        echo    pip install -r requirements.txt
        echo.
        cd "%PROJECT_DIR%"
        pause
        exit /b 1
    )
    echo    ✅ 依赖安装完成
) else (
    echo    ✅ Flask 已安装
)
cd "%PROJECT_DIR%"
echo.

echo [步骤 3/4] 启动 B站下载器后端服务...
echo    📡 端口: 5000
echo    🔗 地址: http://localhost:5000
echo.
start "🎬 B站下载器后端 (端口5000)" cmd /k "title B站下载器后端 && color 0B && cd /d "%PROJECT_DIR%爬取B站原视频" && python app.py"

REM 等待后端启动
echo    ⏳ 等待后端启动（3秒）...
timeout /t 3 /nobreak >nul
echo    ✅ 后端服务已启动
echo.

echo [步骤 4/4] 启动前端服务器...
echo    📡 端口: 8000
echo    🔗 地址: http://localhost:8000
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║                    ✅ 所有服务已启动！                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📱 主应用地址:
echo    👉 http://localhost:8000
echo.
echo 🎬 B站下载器地址:
echo    👉 http://localhost:5000
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  💡 使用提示                                                ║
echo ║                                                            ║
echo ║  1. 在浏览器中打开 http://localhost:8000                   ║
echo ║  2. 点击设置 → "从B站添加音乐/视频" 使用下载器              ║
echo ║  3. 按 Ctrl+C 停止前端服务器                               ║
echo ║  4. 关闭 "B站下载器后端" 窗口可停止后端服务                ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🟢 前端服务器运行中...
echo.

python -m http.server 8000

REM 如果前端服务器停止，提示用户
echo.
echo.
echo ⚠️  前端服务器已停止
echo.
pause

