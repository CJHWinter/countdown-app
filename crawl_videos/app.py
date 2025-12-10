from flask import Flask, render_template, request, jsonify, send_file, session
from flask_cors import CORS
import os
import json
import threading
import time
from datetime import datetime
import requests
import yt_dlp
from urllib.parse import urlparse, parse_qs
import re
import shutil
import subprocess

app = Flask(__name__)
app.secret_key = 'bilibili_downloader_secret_key_2024'
CORS(app)

# 创建必要的目录
os.makedirs('downloads', exist_ok=True)
os.makedirs('static/css', exist_ok=True)
os.makedirs('static/js', exist_ok=True)
os.makedirs('templates', exist_ok=True)

# 全局变量存储下载状态
download_status = {}
download_counter = 0

class BilibiliDownloader:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com/',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'
        }
        self.session.headers.update(self.headers)
    
    def set_cookies(self, cookies_str):
        """设置B站登录cookies"""
        if cookies_str:
            cookie_dict = {}
            for item in cookies_str.split(';'):
                if '=' in item:
                    key, value = item.strip().split('=', 1)
                    cookie_dict[key] = value
            
            print(f"🍪 解析到 {len(cookie_dict)} 个Cookie")
            
            # 检查关键Cookie
            key_cookies = ['SESSDATA', 'bili_jct', 'buvid3']
            for key in key_cookies:
                if key in cookie_dict:
                    value_preview = cookie_dict[key][:20] + '...' if len(cookie_dict[key]) > 20 else cookie_dict[key]
                    print(f"   ✅ {key}: {value_preview}")
                else:
                    print(f"   ❌ {key}: 缺失")
            
            self.session.cookies.update(cookie_dict)
            print(f"🍪 Cookie已更新到session")
    
    def _build_format_selector(self, quality, audio_quality):
        """构建通用的格式选择策略"""
        format_selector = None

        # 视频质量选择
        if quality == "best":
            video_selector = "bestvideo"
        elif quality == "worst":
            video_selector = "worstvideo"
        elif quality in ["240p", "360p", "480p", "720p", "1080p", "1440p", "2160p"]:
            # 使用yt-dlp的分辨率选择语法
            video_selector = f"bestvideo[height<={quality[:-1]}]"
        else:
            video_selector = "bestvideo"

        # 音频质量选择
        if audio_quality == "best":
            audio_selector = "bestaudio"
        elif audio_quality == "worst":
            audio_selector = "worstaudio"
        elif audio_quality in ["64k", "128k", "192k", "256k", "320k"]:
            # 使用yt-dlp的音频比特率选择语法
            audio_selector = f"bestaudio[abr<={audio_quality[:-1]}]"
        else:
            audio_selector = "bestaudio"

        # 组合视频和音频选择器
        format_selector = f"{video_selector}+{audio_selector}"

        return format_selector
    
    def get_video_info(self, url):
        """获取视频信息"""
        cookie_file_path = None
        try:
            # 使用yt-dlp获取视频信息
            ydl_opts = {
                'quiet': True,  # 安静模式
                'no_warnings': True,
                'extract_flat': False,
                'proxy': '',  # 禁用代理
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Referer': 'https://www.bilibili.com/',
                },
                'sleep_interval': 2,
                'max_sleep_interval': 5,
                'extractor_args': {
                    'bilibili': {
                        'getcomments': False,
                        'getdanmaku': False
                    }
                }
            }
            
            print(f"🔧 已禁用代理，直接连接B站")
            
            # 如果有cookies，创建临时cookie文件
            if hasattr(self.session, 'cookies') and self.session.cookies:
                import tempfile
                cookie_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt', encoding='utf-8')
                cookie_file_path = cookie_file.name
                
                # 写入Netscape格式的Cookie
                cookie_file.write("# Netscape HTTP Cookie File\n")
                cookie_file.write("# This is a generated file! Do not edit.\n\n")
                
                # 转换cookies为Netscape格式
                for cookie in self.session.cookies:
                    domain = cookie.domain if hasattr(cookie, 'domain') and cookie.domain else '.bilibili.com'
                    if not domain.startswith('.'):
                        domain = '.' + domain
                    flag = 'TRUE'
                    path = cookie.path if hasattr(cookie, 'path') and cookie.path else '/'
                    secure = 'FALSE'
                    expires = str(int(cookie.expires)) if hasattr(cookie, 'expires') and cookie.expires else '2147483647'
                    name = cookie.name
                    value = cookie.value
                    
                    cookie_file.write(f"{domain}\t{flag}\t{path}\t{secure}\t{expires}\t{name}\t{value}\n")
                    print(f"   🍪 写入Cookie: {name}={value[:20]}...")
                
                cookie_file.close()
                ydl_opts['cookiefile'] = cookie_file_path
                print(f"✅ Cookie文件已创建: {cookie_file_path}")
                print(f"📝 尝试使用Cookie文件方式获取视频信息...")
            else:
                print(f"⚠️  警告：没有Cookie，可能无法获取视频信息")
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)

                # 提取可用的视频和音频格式信息
                available_formats = info.get('formats', [])
                video_formats = []
                audio_formats = []

                # 分离视频和音频格式
                for fmt in available_formats:
                    if fmt.get('vcodec') != 'none' and fmt.get('height'):
                        # 视频格式
                        video_formats.append({
                            'format_id': fmt.get('format_id'),
                            'height': fmt.get('height'),
                            'ext': fmt.get('ext'),
                            'filesize': fmt.get('filesize')
                        })
                    elif fmt.get('acodec') != 'none' and fmt.get('abr'):
                        # 音频格式
                        audio_formats.append({
                            'format_id': fmt.get('format_id'),
                            'abr': fmt.get('abr'),
                            'ext': fmt.get('ext'),
                            'filesize': fmt.get('filesize')
                        })

                # 去重并排序
                video_formats = sorted(list({v['height']: v for v in video_formats}.values()), key=lambda x: x['height'] or 0)
                audio_formats = sorted(list({v['abr']: v for v in audio_formats}.values()), key=lambda x: x['abr'] or 0)

                return {
                    'title': info.get('title', '未知标题'),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', '未知UP主'),
                    'view_count': info.get('view_count', 0),
                    'video_formats': video_formats,
                    'audio_formats': audio_formats
                }
        except Exception as e:
            print(f"❌ 获取视频信息失败: {str(e)}")
            return {'error': str(e)}
        finally:
            # 清理临时Cookie文件
            if cookie_file_path and os.path.exists(cookie_file_path):
                try:
                    os.unlink(cookie_file_path)
                    print(f"🗑️  已清理临时Cookie文件")
                except Exception as e:
                    print(f"⚠️  清理Cookie文件失败: {str(e)}")
    
    def _check_file_conflict(self, title, ext):
        """检查文件冲突并返回合适的文件名"""
        downloads_dir = 'downloads'
        base_filename = f"{title}.{ext}"
        file_path = os.path.join(downloads_dir, base_filename)

        # 如果文件不存在，直接返回基础文件名
        if not os.path.exists(file_path):
            return base_filename

        # 文件已存在，添加时间戳和序号以确保唯一性
        import time
        timestamp = int(time.time())
        counter = 1
        while True:
            # 格式：标题_时间戳_序号.扩展名
            new_filename = f"{title}_{timestamp}_{counter}.{ext}"
            new_file_path = os.path.join(downloads_dir, new_filename)
            if not os.path.exists(new_file_path):
                return new_filename
            counter += 1

    def download_video(self, url, quality='best', audio_quality='best', download_id=None):
        """下载视频"""
        global download_status

        if download_id is None:
            download_id = f"download_{int(time.time())}"

        download_status[download_id] = {
            'status': 'starting',
            'progress': '0%',
            'speed': '',
            'eta': '',
            'filename': '',
            'error': None
        }

        print(f"开始下载: {download_id} - URL: {url}")
        print(f"质量设置: 视频={quality}, 音频={audio_quality}")
        
        def progress_hook(d):
            if d['status'] == 'downloading':
                # 计算进度百分比
                progress_percent = 0
                if 'downloaded_bytes' in d and 'total_bytes' in d and d['total_bytes']:
                    progress_percent = (d['downloaded_bytes'] / d['total_bytes']) * 100
                elif 'downloaded_bytes' in d and 'total_bytes_estimate' in d and d['total_bytes_estimate']:
                    progress_percent = (d['downloaded_bytes'] / d['total_bytes_estimate']) * 100
                elif '_percent_str' in d:
                    # 从百分比字符串中提取数值
                    percent_str = d['_percent_str'].replace('%', '').strip()
                    try:
                        progress_percent = float(percent_str)
                    except (ValueError, TypeError):
                        progress_percent = 0
                
                download_status[download_id].update({
                    'status': 'downloading',
                    'progress': f'{progress_percent:.1f}%',
                    'speed': d.get('_speed_str', ''),
                    'eta': d.get('_eta_str', ''),
                    'filename': d.get('filename', '')
                })
                
                # 调试输出
                print(f"下载进度更新: {download_id} - {progress_percent:.1f}%")
                
            elif d['status'] == 'finished':
                # 获取原始文件名
                original_filename = d.get('filename', '')
                
                # 检查是否是分离的格式文件（包含.f数字）
                if '.f' in original_filename and ('.mp4' in original_filename or '.m4a' in original_filename):
                    # 这是分离的音频或视频文件，不更新状态，等待合并完成
                    print(f"分离文件下载完成: {original_filename}")
                    return
                
                # 这是最终合并的文件或单一文件
                download_status[download_id].update({
                    'status': 'completed',
                    'progress': '100%',
                    'filename': os.path.basename(original_filename)
                })
                print(f"下载完成: {download_id}, 最终文件: {os.path.basename(original_filename)}")
        
        cookie_file_path = None
        try:
            # 构建灵活的格式选择策略
            format_selector = self._build_format_selector(quality, audio_quality)
            print(f"格式选择器: {format_selector}")
            
            # 设置ffmpeg路径
            ffmpeg_path = os.path.join(os.getcwd(), 'ffmpeg-master-latest-win64-gpl', 'bin', 'ffmpeg.exe')
            
            # 获取视频标题用于文件名冲突检测
            video_title = "download"  # 默认标题
            try:
                # 先获取视频信息来确定标题
                with yt_dlp.YoutubeDL({'quiet': True, 'proxy': ''}) as temp_ydl:
                    info = temp_ydl.extract_info(url, download=False)
                    video_title = info.get('title', video_title)
                    # 只清理Windows不允许的文件名字符
                    invalid_chars = '<>:"/\\|?*'
                    video_title = ''.join(c for c in video_title if c not in invalid_chars)
                    # 限制文件名长度(Windows限制255字符)
                    if len(video_title) > 200:
                        video_title = video_title[:200]
            except:
                pass

            # 检查文件冲突并获取合适的文件名
            safe_title = video_title or "download"
            file_ext = "mp4"  # 默认扩展名
            final_filename = self._check_file_conflict(safe_title, file_ext)

            ydl_opts = {
                'outtmpl': f'downloads/{final_filename}',
                'progress_hooks': [progress_hook],
                'merge_output_format': 'mp4',
                'proxy': '',  # 禁用代理
            }
            
            # 只有当format_selector不为None时才设置format参数
            if format_selector is not None:
                ydl_opts['format'] = format_selector
            
            ydl_opts.update({
                'writesubtitles': True,
                'writeautomaticsub': True,
                'ffmpeg_location': ffmpeg_path,
                'subtitleslangs': ['zh-Hans', 'zh-Hant', 'en'],
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'Referer': 'https://www.bilibili.com/',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"'
                },
                'sleep_interval': 1,
                'max_sleep_interval': 3,
                'socket_timeout': 30,
                'retries': 3
            })
            
            print(f"🔧 下载功能已禁用代理")
            
            # 如果有cookies，创建临时cookie文件
            if hasattr(self.session, 'cookies') and self.session.cookies:
                import tempfile
                cookie_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
                cookie_file_path = cookie_file.name
                
                # 写入cookie文件头
                cookie_file.write("# Netscape HTTP Cookie File\n")
                
                # 转换cookies为Netscape格式
                for cookie in self.session.cookies:
                    domain = cookie.domain if cookie.domain else '.bilibili.com'
                    flag = 'TRUE' if domain.startswith('.') else 'FALSE'
                    path = cookie.path if cookie.path else '/'
                    secure = 'TRUE' if cookie.secure else 'FALSE'
                    expires = str(int(cookie.expires)) if cookie.expires else '0'
                    
                    cookie_line = f"{domain}\t{flag}\t{path}\t{secure}\t{expires}\t{cookie.name}\t{cookie.value}\n"
                    cookie_file.write(cookie_line)
                
                cookie_file.close()
                ydl_opts['cookiefile'] = cookie_file_path
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
                
        except Exception as e:
            error_msg = str(e)
            print(f"下载错误: {download_id} - {error_msg}")
            download_status[download_id]['error'] = error_msg
            download_status[download_id]['status'] = 'error'
            download_status[download_id]['progress'] = '0%'
        finally:
            # 清理临时cookie文件
            if cookie_file_path and os.path.exists(cookie_file_path):
                try:
                    os.unlink(cookie_file_path)
                except:
                    pass

downloader = BilibiliDownloader()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/video_info', methods=['POST'])
def get_video_info():
    data = request.get_json()
    url = data.get('url')
    cookies = data.get('cookies', '')
    
    if not url:
        return jsonify({'error': '请提供视频URL'}), 400
    
    # 设置cookies
    if cookies:
        print(f"📝 收到Cookie (长度: {len(cookies)})")
        print(f"📝 Cookie前100字符: {cookies[:100]}...")
        downloader.set_cookies(cookies)
        print(f"📝 Cookie已设置到downloader，当前session.cookies数量: {len(downloader.session.cookies)}")
    else:
        print("⚠️  警告：未收到Cookie！")
    
    print(f"🔍 正在获取视频信息: {url}")
    info = downloader.get_video_info(url)
    
    if 'error' in info:
        print(f"❌ 获取失败: {info['error']}")
    else:
        print(f"✅ 获取成功: {info.get('title', '未知标题')}")
    
    return jsonify(info)

@app.route('/download', methods=['POST'])
def download_video():
    try:
        data = request.get_json()
        url = data.get('url')
        quality = data.get('quality', 'best')
        cookie = data.get('cookie', '')
        
        if not url:
            return jsonify({'success': False, 'error': '请提供视频URL'})
        
        # 创建下载目录
        download_dir = os.path.join(os.getcwd(), 'downloads')
        os.makedirs(download_dir, exist_ok=True)
        
        # 配置yt-dlp选项
        ydl_opts = {
            'outtmpl': os.path.join(download_dir, '%(title)s.%(ext)s'),
            'format': 'best[height<=1080]/best' if quality == 'best' else quality,
            'writesubtitles': False,  # 暂时关闭字幕下载以减少请求
            'writeautomaticsub': False,
            # 添加更多请求头来避免412错误
            'http_headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.bilibili.com/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
            },
            # 添加延迟以避免被检测
            'sleep_interval': 1,
            'max_sleep_interval': 3,
            # 重试设置
            'retries': 3,
            'fragment_retries': 3,
            # 忽略错误继续下载
            'ignoreerrors': False,
        }
        
        # 如果提供了cookie，添加到选项中
        if cookie:
            # 创建临时cookie文件
            import tempfile
            cookie_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False)
            
            # 解析cookie字符串并写入文件
            cookie_file.write("# Netscape HTTP Cookie File\n")
            cookie_file.write("# This is a generated file! Do not edit.\n\n")
            
            for item in cookie.split(';'):
                if '=' in item:
                    name, value = item.strip().split('=', 1)
                    # Netscape cookie format: domain, flag, path, secure, expiration, name, value
                    cookie_file.write(f".bilibili.com\tTRUE\t/\tFALSE\t0\t{name}\t{value}\n")
            
            cookie_file.close()
            ydl_opts['cookiefile'] = cookie_file.name
            
            # 同时在请求头中添加Cookie
            ydl_opts['http_headers']['Cookie'] = cookie
        
        # 下载视频
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        # 清理临时cookie文件
        if cookie and 'cookiefile' in ydl_opts:
            try:
                os.unlink(ydl_opts['cookiefile'])
            except:
                pass
        
        return jsonify({'success': True, 'message': '下载完成'})
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/download', methods=['POST'])
def start_download():
    global download_counter
    
    data = request.get_json()
    url = data.get('url')
    quality = data.get('quality', 'best')
    audio_quality = data.get('audio_quality', 'best')
    cookies = data.get('cookies', '')
    
    if not url:
        return jsonify({'error': '请提供视频URL'}), 400
    
    download_counter += 1
    download_id = f"download_{download_counter}"
    
    # 设置cookies
    if cookies:
        downloader.set_cookies(cookies)
    
    # 在新线程中开始下载
    thread = threading.Thread(
        target=downloader.download_video,
        args=(url, quality, audio_quality, download_id)
    )
    thread.daemon = True
    thread.start()
    
    return jsonify({'download_id': download_id})

@app.route('/api/download_status/<download_id>')
def get_download_status(download_id):
    status = download_status.get(download_id, {'status': 'not_found'})
    return jsonify(status)

@app.route('/api/downloads')
def list_downloads():
    downloads_dir = 'downloads'
    files = []
    
    if os.path.exists(downloads_dir):
        for filename in os.listdir(downloads_dir):
            filepath = os.path.join(downloads_dir, filename)
            if os.path.isfile(filepath):
                stat = os.stat(filepath)
                files.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
    
    return jsonify(files)

@app.route('/api/download_file/<filename>')
def download_file(filename):
    filepath = os.path.join('downloads', filename)
    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True)
    return jsonify({'error': '文件不存在'}), 404

@app.route('/api/move_file', methods=['POST'])
def move_file():
    """移动文件到指定的音乐文件夹"""
    try:
        data = request.json
        filename = data.get('filename')
        category = data.get('category')  # 'study' 或 'rest'
        
        if not filename or not category:
            return jsonify({'success': False, 'error': '缺少参数'})
        
        # 源文件路径
        source_path = os.path.join('downloads', filename)
        
        # 目标文件夹映射
        category_map = {
            'study': os.path.join('..', 'music', '学习'),
            'rest': os.path.join('..', 'music', '休息')
        }
        
        if category not in category_map:
            return jsonify({'success': False, 'error': '无效的分类'})
        
        # 目标路径
        target_dir = category_map[category]
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, filename)
        
        # 检查源文件是否存在
        if not os.path.exists(source_path):
            return jsonify({'success': False, 'error': '源文件不存在'})
        
        # 检查目标文件是否已存在
        if os.path.exists(target_path):
            # 自动添加序号
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(target_path):
                new_filename = f"{base}({counter}){ext}"
                target_path = os.path.join(target_dir, new_filename)
                counter += 1
            filename = os.path.basename(target_path)
        
        # 移动文件
        shutil.move(source_path, target_path)
        
        category_name = '学习' if category == 'study' else '休息'
        print(f"✅ 文件已移动: {filename} -> {category_name}音乐")
        
        return jsonify({
            'success': True, 
            'message': f'文件已移动到{category_name}音乐文件夹',
            'target_path': target_path,
            'filename': filename
        })
        
    except Exception as e:
        print(f"❌ 移动文件失败: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})


@app.route('/api/delete_file', methods=['POST'])
def delete_file():
    """删除下载的文件"""
    try:
        data = request.json
        filename = data.get('filename')

        if not filename:
            return jsonify({'success': False, 'error': '缺少文件名参数'})

        # 构建文件路径
        file_path = os.path.join('downloads', filename)

        # 安全检查：确保文件在downloads目录下
        downloads_dir = os.path.abspath('downloads')
        file_path_abs = os.path.abspath(file_path)

        if not file_path_abs.startswith(downloads_dir):
            return jsonify({'success': False, 'error': '无效的文件路径'})

        # 检查文件是否存在
        if not os.path.exists(file_path):
            return jsonify({'success': False, 'error': '文件不存在'})

        # 删除文件
        os.remove(file_path)
        print(f"✅ 文件已删除: {filename}")

        return jsonify({
            'success': True,
            'message': f'文件 "{filename}" 已成功删除'
        })

    except PermissionError:
        error_msg = '没有权限删除文件'
        print(f"❌ 删除文件失败: {error_msg}")
        return jsonify({'success': False, 'error': error_msg})
    except Exception as e:
        error_msg = str(e)
        print(f"❌ 删除文件失败: {error_msg}")
        return jsonify({'success': False, 'error': error_msg})


@app.route('/api/trigger_music_list_generation', methods=['POST'])
def trigger_music_list_generation():
    """触发音乐列表生成脚本"""
    try:
        # 获取项目根目录
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        script_path = os.path.join(root_dir, 'generate-music-list.js')

        # 检查脚本是否存在
        if not os.path.exists(script_path):
            return jsonify({'success': False, 'error': '脚本文件不存在'})

        print(f"🔄 正在运行音乐列表生成脚本...")

        # 运行 Node.js 脚本
        result = subprocess.run(
            ['node', script_path],
            cwd=root_dir,
            capture_output=True,
            text=True,
            timeout=30,
            encoding='utf-8'
        )

        if result.returncode == 0:
            print(f"✅ 音乐列表生成成功")
            return jsonify({
                'success': True,
                'message': '音乐列表已更新',
                'output': result.stdout
            })
        else:
            print(f"❌ 脚本执行失败: {result.stderr}")
            return jsonify({
                'success': False,
                'error': '脚本执行失败',
                'details': result.stderr
            })

    except subprocess.TimeoutExpired:
        print(f"❌ 脚本执行超时")
        return jsonify({'success': False, 'error': '脚本执行超时（30秒）'})
    except FileNotFoundError:
        return jsonify({'success': False, 'error': 'Node.js 未安装或不在PATH中'})
    except Exception as e:
        print(f"❌ 执行脚本时出错: {str(e)}")
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    print("B站视频下载器启动中...")
    print("请访问: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)