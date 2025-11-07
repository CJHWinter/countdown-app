@echo off
chcp 65001 >nul
title PWA图标生成工具

echo.
echo ========================================
echo      PWA 图标生成工具
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Python
    echo.
    echo 请先安装 Python：
    echo    下载地址：https://www.python.org/downloads/
    echo    安装时勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo ✅ Python 已安装
echo.

REM 检查 Pillow 是否安装
echo 📦 检查依赖包...
python -c "import PIL" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未检测到 Pillow 库，正在自动安装...
    echo.
    pip install pillow --quiet
    echo.
    if errorlevel 1 (
        echo ❌ 安装失败
        echo    请手动运行：pip install pillow
        echo    或先运行"安装依赖.bat"
        pause
        exit /b 1
    )
    echo ✅ Pillow 安装成功
    echo.
) else (
    echo ✅ Pillow 已安装
    echo.
)

REM 运行图标生成脚本
echo 🚀 开始生成图标...
echo.
python generate-icons.py

echo.
echo ========================================
pause

