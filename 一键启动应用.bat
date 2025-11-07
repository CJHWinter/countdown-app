@echo off
chcp 65001 >nul
title 倒计时氛围感 - 一键启动

REM 获取脚本所在目录（项目根目录）
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo.
echo ========================================
echo      倒计时氛围感 - 一键启动
echo ========================================
echo.
echo 📂 项目目录：%PROJECT_DIR%
echo.

REM 检查 Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未检测到 Python
    echo.
    echo 请先安装 Python：https://www.python.org/downloads/
    echo 或者使用 Node.js 版本（需要安装 Node.js）
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已就绪
echo.

REM 检查端口 8000 是否被占用
netstat -ano | findstr ":8000" >nul 2>&1
if not errorlevel 1 (
    echo ⚠️  端口 8000 已被占用
    echo.
    set /p KILL_PORT="是否关闭占用端口的程序？(Y/N): "
    if /i "%KILL_PORT%"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        echo ✅ 已关闭占用端口的程序
        timeout /t 2 /nobreak >nul
    )
)

echo 🚀 正在启动服务器...
echo.
echo ========================================
echo ✅ 服务器启动成功！
echo ========================================
echo.
echo 📱 访问地址：http://localhost:8000
echo.
echo 💡 提示：
echo    - 浏览器会自动打开应用
echo    - 关闭此窗口将停止服务器
echo    - 按 Ctrl+C 可以停止服务器
echo.
echo ========================================
echo.

REM 等待1秒后打开浏览器
timeout /t 1 /nobreak >nul
start http://localhost:8000

REM 启动服务器
python -m http.server 8000

REM 服务器停止后的提示
echo.
echo ⚠️  服务器已停止
pause

