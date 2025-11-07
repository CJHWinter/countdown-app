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

REM 创建VBS脚本来生成快捷方式（处理中文路径）
set "VBS_FILE=%TEMP%\CreateShortcut.vbs"

REM 使用更安全的方式写入VBS文件
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%DESKTOP%\倒计时氛围感.lnk"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%BAT_FILE%"
echo oLink.WorkingDirectory = "%PROJECT_DIR%"
echo oLink.Description = "倒计时氛围感应用"
echo oLink.Save
) > "%VBS_FILE%"

REM 执行VBS脚本
echo 🔧 正在创建快捷方式...
cscript //nologo "%VBS_FILE%" 2>nul
if errorlevel 1 (
    echo ❌ VBScript 执行失败，尝试备用方法...
    echo.
    
    REM 备用方法：使用 PowerShell
    powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\倒计时氛围感.lnk'); $Shortcut.TargetPath = '%BAT_FILE%'; $Shortcut.WorkingDirectory = '%PROJECT_DIR%'; $Shortcut.Description = '倒计时氛围感应用'; $Shortcut.Save()"
    
    if errorlevel 1 (
        echo ❌ 快捷方式创建失败
        echo.
        echo 请手动创建快捷方式：
        echo 1. 右键桌面 → 新建 → 快捷方式
        echo 2. 位置输入：%BAT_FILE%
        echo 3. 名称输入：倒计时氛围感
        pause
        exit /b 1
    )
)

REM 删除临时VBS文件
del "%VBS_FILE%" 2>nul

echo.
echo ========================================
echo ✅ 快捷方式创建成功！
echo ========================================
echo.
echo 📍 快捷方式位置：
echo    桌面\倒计时氛围感.lnk
echo.
echo 💡 使用方法：
echo    1. 双击桌面快捷方式
echo    2. 服务器自动启动
echo    3. 浏览器自动打开
echo    4. 开始使用
echo.
echo 📝 注意事项：
echo    - 不要移动项目文件夹
echo    - 关闭窗口会停止服务器
echo    - 需要后台运行请使用完整启动
echo.
echo ========================================
pause

