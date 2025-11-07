@echo off
chcp 65001
echo ========================================
echo 测试启动脚本
echo ========================================
echo.

echo [1] 检查 Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python 未安装或不在PATH中
    pause
    exit /b 1
)
echo.

echo [2] 检查 Flask 依赖...
cd 爬取B站原视频
python -c "import flask; print('Flask 版本:', flask.__version__)"
if %errorlevel% neq 0 (
    echo ❌ Flask 未安装
    echo 正在安装 Flask...
    pip install flask flask-cors yt-dlp requests
    if %errorlevel% neq 0 (
        echo ❌ 安装失败
        pause
        exit /b 1
    )
)
echo.

echo [3] 尝试启动 Flask 后端...
python app.py
pause

