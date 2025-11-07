// ================================
// 简单的 HTTP 服务器
// 用于运行倒计时氛围感应用
// ================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.webm': 'video/webm',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 解析请求路径
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // 默认首页
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // 构建文件路径
    const filePath = path.join(__dirname, pathname);
    
    // 获取文件扩展名
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // 检查文件是否存在
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // 文件不存在，返回 404
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>404 - 文件未找到</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        h1 { color: #ff6b35; }
                    </style>
                </head>
                <body>
                    <h1>404 - 文件未找到</h1>
                    <p>请求的文件不存在: ${pathname}</p>
                    <p><a href="/">返回首页</a></p>
                </body>
                </html>
            `);
            return;
        }
        
        // 读取文件
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('服务器错误');
                return;
            }
            
            // 设置 CORS 头，允许跨域请求
            res.writeHead(200, {
                'Content-Type': contentType + (contentType.includes('text') || contentType.includes('json') ? '; charset=utf-8' : ''),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            });
            
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 倒计时氛围感应用服务器已启动');
    console.log('========================================');
    console.log('');
    console.log(`📝 请在浏览器访问：`);
    console.log(`   http://localhost:${PORT}`);
    console.log('');
    console.log('💡 提示：按 Ctrl+C 停止服务器');
    console.log('');
});

