@echo off
chcp 65001 >nul
title 创建桌面快捷方式

echo.
echo ========================================
echo      创建桌面快捷方式
echo ========================================
echo.

REM 获取当前目录
set "PROJECT_DIR=%~dp0"
set "BAT_FILE=%PROJECT_DIR%一键启动应用.bat"

REM 获取桌面路径
for /f "tokens=3*" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop') do set DESKTOP=%%b
call set DESKTOP=%DESKTOP%

REM 检查一键启动文件是否存在
if not exist "%BAT_FILE%" (
    echo ❌ 错误：找不到"一键启动应用.bat"
    echo.
    echo 请确保此脚本在项目根目录运行
    pause
    exit /b 1
)

echo 📂 项目目录：%PROJECT_DIR%
echo 🖥️  桌面路径：%DESKTOP%
echo.

REM 创建VBS脚本来生成快捷方式
set "VBS_FILE=%TEMP%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_FILE%"
echo sLinkFile = "%DESKTOP%\倒计时氛围感.lnk" >> "%VBS_FILE%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_FILE%"
echo oLink.TargetPath = "%BAT_FILE%" >> "%VBS_FILE%"
echo oLink.WorkingDirectory = "%PROJECT_DIR%" >> "%VBS_FILE%"
echo oLink.Description = "倒计时氛围感应用 - 一键启动" >> "%VBS_FILE%"
echo oLink.IconLocation = "%PROJECT_DIR%assets\icon-192.png,0" >> "%VBS_FILE%"
echo oLink.Save >> "%VBS_FILE%"

REM 执行VBS脚本
cscript //nologo "%VBS_FILE%"

REM 删除临时VBS文件
del "%VBS_FILE%"

echo.
echo ========================================
echo ✅ 快捷方式创建成功！
echo ========================================
echo.
echo 📍 快捷方式位置：
echo    %DESKTOP%\倒计时氛围感.lnk
echo.
echo 💡 使用方法：
echo    1. 双击桌面上的"倒计时氛围感"快捷方式
echo    2. 服务器自动启动
echo    3. 浏览器自动打开应用
echo    4. 开始使用！
echo.
echo 📝 注意事项：
echo    - 不要移动或删除项目文件夹
echo    - 关闭命令行窗口会停止服务器
echo    - 如需后台运行，请使用"完整启动.bat"
echo.
echo ========================================
pause

