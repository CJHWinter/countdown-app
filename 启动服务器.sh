#!/bin/bash

echo "========================================"
echo "🚀 启动倒计时氛围感应用服务器"
echo "========================================"
echo ""

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    echo "✅ 检测到 Python3，使用 Python 启动服务器..."
    echo ""
    echo "📝 服务器启动后，请在浏览器访问："
    echo "   http://localhost:8000"
    echo ""
    echo "💡 提示：按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
    exit 0
fi

# 检查 Python 2 是否可用
if command -v python &> /dev/null; then
    echo "✅ 检测到 Python，使用 Python 启动服务器..."
    echo ""
    echo "📝 服务器启动后，请在浏览器访问："
    echo "   http://localhost:8000"
    echo ""
    echo "💡 提示：按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8000
    exit 0
fi

# 检查 Node.js 是否可用
if command -v node &> /dev/null; then
    echo "✅ 检测到 Node.js，使用 Node.js 启动服务器..."
    echo ""
    echo "📝 正在启动服务器..."
    npx --yes serve . -p 8000
    exit 0
fi

# 如果都没有，提示用户
echo "❌ 未检测到 Python 或 Node.js"
echo ""
echo "请安装以下任一工具："
echo ""
echo "1. Python 3（推荐）:"
echo "   macOS: brew install python3"
echo "   Ubuntu: sudo apt-get install python3"
echo "   安装后运行: python3 -m http.server 8000"
echo ""
echo "2. Node.js:"
echo "   https://nodejs.org/"
echo "   安装后运行: npx serve . -p 8000"
echo ""
echo "3. VS Code Live Server 扩展:"
echo "   安装扩展后，右键 index.html 选择 'Open with Live Server'"
echo ""

