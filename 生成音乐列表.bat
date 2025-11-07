@echo off
chcp 65001 >nul
title 音乐列表生成工具

echo.
echo ========================================
echo      音乐列表生成工具
echo ========================================
echo.

REM 检查 Node.js 是否安装
echo 📦 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未检测到 Node.js
    echo.
    echo Node.js 用于扫描音乐文件夹并生成 music-list.json
    echo.
    echo 请先安装 Node.js：
    echo    下载地址：https://nodejs.org/
    echo    推荐下载 LTS 版本
    echo.
    echo 或者运行"安装依赖.bat"检查所有依赖
    echo.
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version 2^>^&1') do set NODE_VERSION=%%i
echo ✅ Node.js 已安装 (版本: %NODE_VERSION%)
echo.

REM 检查脚本文件
if not exist "generate-music-list.js" (
    echo ❌ 错误：找不到 generate-music-list.js
    echo.
    pause
    exit /b 1
)

REM 运行脚本
echo 🔍 正在扫描音乐文件夹...
echo.
echo 扫描目录：
echo   - music/学习/
echo   - music/休息/
echo.

node generate-music-list.js

if errorlevel 1 (
    echo.
    echo ❌ 生成失败
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 音乐列表生成成功！
echo.
echo 📄 生成的文件：music-list.json
echo.
echo 💡 提示：
echo    - 添加新音乐后，再次运行此脚本更新列表
echo    - 音乐文件支持格式：.mp3, .mp4, .wav, .ogg, .m4a
echo.
echo ========================================
echo.
pause
