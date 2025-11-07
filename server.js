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
    
    // 解码 URL（处理中文路径）
    try {
        pathname = decodeURIComponent(pathname);
    } catch (e) {
        console.error('URL decode error:', e);
    }
    
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
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
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
        
        const fileSize = stats.size;
        const range = req.headers.range;
        
        // 处理 Range 请求（用于视频拖动）
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            
            // 创建读取流
            const file = fs.createReadStream(filePath, { start, end });
            
            // 发送 206 Partial Content
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Range'
            };
            
            res.writeHead(206, headers);
            file.pipe(res);
        } else {
            // 正常请求，返回完整文件
            const headers = {
                'Content-Length': fileSize,
                'Content-Type': contentType + (contentType.includes('text') || contentType.includes('json') ? '; charset=utf-8' : ''),
                'Accept-Ranges': 'bytes',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': 'Range'
            };
            
            res.writeHead(200, headers);
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('🚀 倒计时氛围感应用服务器已启动');
    console.log('========================================');
    console.log('');
    console.log(`📝 请在浏览器访问：`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://127.0.0.1:${PORT}`);
    console.log('');
    console.log('✅ 支持视频拖动（HTTP Range 请求）');
    console.log('✅ 支持所有浏览器（Chrome、Firefox、Edge等）');
    console.log('');
    console.log('💡 提示：按 Ctrl+C 停止服务器');
    console.log('');
});

