// 全局变量
let currentDownloadId = null;
let progressInterval = null;

// DOM元素
const elements = {
    cookies: document.getElementById('cookies'),
    sessdata: document.getElementById('sessdata'),
    biliJct: document.getElementById('bili_jct'),
    buvid3: document.getElementById('buvid3'),
    videoUrl: document.getElementById('video-url'),
    getInfoBtn: document.getElementById('get-info-btn'),
    videoInfo: document.getElementById('video-info'),
    videoTitle: document.getElementById('video-title'),
    videoUploader: document.getElementById('video-uploader'),
    videoDuration: document.getElementById('video-duration'),
    videoViews: document.getElementById('video-views'),
    qualitySection: document.querySelector('.quality-section'),
    videoQuality: document.getElementById('video-quality'),
    audioQuality: document.getElementById('audio-quality'),
    downloadBtn: document.getElementById('download-btn'),
    downloadProgress: document.getElementById('download-progress'),
    progressFilename: document.getElementById('progress-filename'),
    progressPercent: document.getElementById('progress-percent'),
    progressFill: document.getElementById('progress-fill'),
    progressSpeed: document.getElementById('progress-speed'),
    progressEta: document.getElementById('progress-eta'),
    filesList: document.getElementById('files-list'),
    refreshFilesBtn: document.getElementById('refresh-files-btn'),
    loading: document.getElementById('loading'),
    message: document.getElementById('message')
};

// 工具函数
function showLoading() {
    elements.loading.style.display = 'flex';
}

function hideLoading() {
    elements.loading.style.display = 'none';
}

function showMessage(text, type = 'info') {
    elements.message.textContent = text;
    elements.message.className = `message ${type}`;
    elements.message.style.display = 'block';
    
    setTimeout(() => {
        elements.message.style.display = 'none';
    }, 5000);
}

function formatDuration(seconds) {
    if (!seconds) return '未知';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
}

// API调用函数
async function apiCall(url, data = null, method = 'GET') {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || '请求失败');
        }
        
        return result;
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 获取Cookie值的函数
function getCookieValue() {
    const activeMode = document.querySelector('.cookie-input-mode.active');
    
    if (activeMode.id === 'simple-mode') {
        // 简单模式：组合三个关键Cookie
        const sessdata = elements.sessdata.value.trim();
        const biliJct = elements.biliJct.value.trim();
        const buvid3 = elements.buvid3.value.trim();
        
        if (!sessdata || !biliJct || !buvid3) {
            return '';
        }
        
        return `SESSDATA=${sessdata}; bili_jct=${biliJct}; buvid3=${buvid3}`;
    } else {
        // 高级模式：直接使用完整Cookie字符串
        return elements.cookies.value.trim();
    }
}

// Cookie输入标签切换功能
function initCookieTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const inputModes = document.querySelectorAll('.cookie-input-mode');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetMode = this.dataset.method;
            
            // 移除所有活动状态
            tabBtns.forEach(b => b.classList.remove('active'));
            inputModes.forEach(m => m.classList.remove('active'));
            
            // 激活当前选中的标签和模式
            this.classList.add('active');
            document.getElementById(targetMode + '-mode').classList.add('active');
        });
    });
}

// 获取视频信息
async function getVideoInfo() {
    const url = elements.videoUrl.value.trim();
    const cookies = getCookieValue();
    
    if (!url) {
        showMessage('请输入视频URL', 'error');
        return;
    }
    
    // 验证URL格式
    if (!url.includes('bilibili.com')) {
        showMessage('请输入有效的B站视频链接', 'error');
        return;
    }
    
    showLoading();
    elements.getInfoBtn.disabled = true;
    
    try {
        const data = await apiCall('/api/video_info', {
            url: url,
            cookies: cookies
        }, 'POST');
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 显示视频信息
        elements.videoTitle.textContent = data.title;
        elements.videoUploader.innerHTML = `<i class="fas fa-user"></i> ${data.uploader}`;
        elements.videoDuration.innerHTML = `<i class="fas fa-clock"></i> ${formatDuration(data.duration)}`;
        elements.videoViews.innerHTML = `<i class="fas fa-eye"></i> ${formatNumber(data.view_count)} 播放`;
        
        elements.videoInfo.style.display = 'block';
        elements.qualitySection.style.display = 'block';
        
        showMessage('视频信息获取成功', 'success');
        
    } catch (error) {
        showMessage(`获取视频信息失败: ${error.message}`, 'error');
        elements.videoInfo.style.display = 'none';
        elements.qualitySection.style.display = 'none';
    } finally {
        hideLoading();
        elements.getInfoBtn.disabled = false;
    }
}

// 开始下载
async function startDownload() {
    const url = elements.videoUrl.value.trim();
    const cookies = getCookieValue();
    const videoQuality = elements.videoQuality.value;
    const audioQuality = elements.audioQuality.value;
    
    if (!url) {
        showMessage('请输入视频URL', 'error');
        return;
    }
    
    elements.downloadBtn.disabled = true;
    
    try {
        const data = await apiCall('/api/download', {
            url: url,
            cookies: cookies,
            quality: videoQuality,
            audio_quality: audioQuality
        }, 'POST');
        
        currentDownloadId = data.download_id;
        elements.downloadProgress.style.display = 'block';
        
        // 开始监控下载进度
        startProgressMonitoring();
        
        showMessage('下载已开始', 'success');
        
    } catch (error) {
        showMessage(`下载启动失败: ${error.message}`, 'error');
        elements.downloadBtn.disabled = false;
    }
}

// 监控下载进度
function startProgressMonitoring() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    progressInterval = setInterval(async () => {
        if (!currentDownloadId) return;
        
        try {
            const status = await apiCall(`/api/download_status/${currentDownloadId}`);
            
            updateProgressDisplay(status);
            
            if (status.status === 'completed' || status.status === 'error') {
                clearInterval(progressInterval);
                progressInterval = null;
                
                if (status.status === 'completed') {
                    showMessage('下载完成！', 'success');
                    refreshFilesList();
                    
                    // 自动显示分类选择模态框
                    if (status.filename && typeof window.onDownloadComplete === 'function') {
                        // 获取文件大小
                        const fileSize = status.total_size || 0;
                        window.onDownloadComplete(status.filename, fileSize);
                    }
                } else if (status.error) {
                    showMessage(`下载失败: ${status.error}`, 'error');
                }
                
                elements.downloadBtn.disabled = false;
                currentDownloadId = null;
            }
            
        } catch (error) {
            console.error('获取下载状态失败:', error);
        }
    }, 1000);
}

// 更新进度显示
function updateProgressDisplay(status) {
    const filename = status.filename ? status.filename.split('/').pop() : '准备中...';
    const progress = status.progress || '0%';
    const speed = status.speed || '';
    const eta = status.eta || '';
    
    elements.progressFilename.textContent = filename;
    elements.progressPercent.textContent = progress;
    elements.progressSpeed.textContent = speed;
    elements.progressEta.textContent = eta;
    
    // 更新进度条
    const progressValue = parseFloat(progress.replace('%', '')) || 0;
    elements.progressFill.style.width = `${progressValue}%`;
    
    // 根据状态更新颜色和显示错误信息
    if (status.status === 'error') {
        elements.progressFill.style.background = '#dc3545';
        elements.downloadBtn.disabled = false;
        
        // 显示详细错误信息和解决建议
        let errorMsg = status.error || '下载失败';
        let suggestion = '';
        
        if (errorMsg.includes('HTTP Error 412') || errorMsg.includes('Precondition Failed')) {
            suggestion = '建议：1) 检查Cookie是否有效 2) 稍后重试 3) 确认视频链接正确';
        } else if (errorMsg.includes('Unable to download JSON metadata')) {
            suggestion = '建议：1) 更新Cookie信息 2) 检查网络连接 3) 确认视频可访问';
        } else if (errorMsg.includes('Video unavailable')) {
            suggestion = '建议：1) 检查视频是否存在 2) 确认是否需要登录 3) 检查地区限制';
        }
        
        const fullErrorMsg = suggestion ? `${errorMsg}\n\n${suggestion}` : errorMsg;
        showMessage(fullErrorMsg, 'error');
        
    } else if (status.status === 'completed') {
        elements.progressFill.style.background = '#28a745';
        elements.downloadBtn.disabled = false;
        showMessage('下载完成！', 'success');
        refreshFilesList(); // 刷新文件列表
        
    } else {
        elements.progressFill.style.background = 'linear-gradient(90deg, #00a1d6, #0078a3)';
    }
}

// 刷新文件列表
async function refreshFilesList() {
    try {
        const files = await apiCall('/api/downloads');
        
        // 更新全局文件数组
        allFiles = files.map(file => ({
            name: file.filename,
            size: formatFileSize(file.size),
            modified: new Date(file.modified).toLocaleString()
        }));
        filteredFiles = [...allFiles];
        currentPage = 1;
        
        // 更新显示
        updateFileDisplay();
        updateStats();
        
    } catch (error) {
        console.error('获取文件列表失败:', error);
        showMessage('获取文件列表失败', 'error');
        
        // 清空数据
        allFiles = [];
        filteredFiles = [];
        updateStats();
    }
}

// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Cookie标签切换
    initCookieTabs();
    
    // 初始化Cookie解析功能
    initCookieParser();
    
    // 获取视频信息按钮
    elements.getInfoBtn.addEventListener('click', getVideoInfo);
    
    // 下载按钮
    elements.downloadBtn.addEventListener('click', startDownload);
    
    // 刷新文件列表按钮
    elements.refreshFilesBtn.addEventListener('click', refreshFilesList);
    
    // URL输入框回车事件
    elements.videoUrl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            getVideoInfo();
        }
    });
    
    // 初始化搜索和分页功能
    initFileListEnhancements();
    
    // 页面加载时刷新文件列表
    refreshFilesList();
});

// Cookie智能解析功能
function initCookieParser() {
    const parseBtn = document.getElementById('parse-cookies-btn');
    const cookiesTextarea = document.getElementById('cookies');
    const previewDiv = document.getElementById('cookie-preview');
    const confirmBtn = document.getElementById('confirm-cookies-btn');
    const cancelBtn = document.getElementById('cancel-cookies-btn');
    
    if (!parseBtn || !cookiesTextarea || !previewDiv || !confirmBtn || !cancelBtn) {
        return;
    }
    
    parseBtn.addEventListener('click', function() {
        const rawText = cookiesTextarea.value.trim();
        if (!rawText) {
            showMessage('请先粘贴Cookie数据', 'error');
            return;
        }
        
        const parsedData = parseCookieText(rawText);
        if (parsedData.cookies.length === 0) {
            showMessage('未能识别到有效的Cookie数据，请检查格式', 'error');
            return;
        }
        
        displayCookiePreview(parsedData);
        previewDiv.style.display = 'block';
    });
    
    confirmBtn.addEventListener('click', function() {
        const generatedString = document.getElementById('generated-cookie-string').textContent;
        cookiesTextarea.value = generatedString;
        previewDiv.style.display = 'none';
        showMessage('Cookie已成功导入', 'success');
    });
    
    cancelBtn.addEventListener('click', function() {
        previewDiv.style.display = 'none';
    });
}

// 解析Cookie文本
function parseCookieText(text) {
    const cookies = [];
    const lines = text.split('\n');
    
    // 尝试解析开发者工具格式 (name\tvalue\tdomain\tpath...)
    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        // 检查是否为tab分隔的格式（开发者工具表格复制）
        if (line.includes('\t')) {
            const parts = line.split('\t');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const value = parts[1].trim();
                
                // 过滤掉无效的Cookie（空值、域名、路径等）
                if (name && value && 
                    value !== '/' && 
                    value !== 'Session' && 
                    value !== '会话' &&
                    !value.includes('.bilibili.com') &&
                    !value.includes('www.bilibili.com') &&
                    !value.match(/^\d{4}-\d{2}-\d{2}/) && // 过滤日期
                    !value.match(/^(Low|Medium|High)$/i) && // 过滤优先级
                    !value.match(/^[✓✗]$/) && // 过滤勾选标记
                    !value.match(/^(None|Lax|Strict)$/i)) { // 过滤SameSite值
                    
                    cookies.push({ name, value });
                }
            }
        }
        // 检查是否为标准Cookie格式 (name=value; name=value)
        else if (line.includes('=') && (line.includes(';') || !line.includes('\t'))) {
            // 分割多个Cookie
            const cookiePairs = line.split(';');
            for (let pair of cookiePairs) {
                pair = pair.trim();
                const equalIndex = pair.indexOf('=');
                if (equalIndex > 0) {
                    const name = pair.substring(0, equalIndex).trim();
                    const value = pair.substring(equalIndex + 1).trim();
                    if (name && value) {
                        cookies.push({ name, value });
                    }
                }
            }
        }
        // 检查是否为JSON格式
        else if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const cookieObj = JSON.parse(line);
                if (cookieObj.name && cookieObj.value) {
                    cookies.push({ name: cookieObj.name, value: cookieObj.value });
                }
            } catch (e) {
                // 忽略JSON解析错误
            }
        }
    }
    
    // 去重（保留第一次出现的）
    const uniqueCookies = [];
    const seenNames = new Set();
    for (const cookie of cookies) {
        if (!seenNames.has(cookie.name)) {
            seenNames.add(cookie.name);
            uniqueCookies.push(cookie);
        }
    }
    
    // 生成Cookie字符串
    const cookieString = uniqueCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
    
    return {
        cookies: uniqueCookies,
        cookieString: cookieString
    };
}

// 显示Cookie预览
function displayCookiePreview(parsedData) {
    const parsedCookiesDiv = document.getElementById('parsed-cookies-display');
    const generatedStringDiv = document.getElementById('generated-cookie-string');
    
    // 显示解析到的Cookie
    parsedCookiesDiv.innerHTML = '';
    parsedData.cookies.forEach(cookie => {
        const cookieItem = document.createElement('div');
        cookieItem.className = 'cookie-item';
        cookieItem.innerHTML = `
            <span class="cookie-name">${escapeHtml(cookie.name)}</span>
            <span class="cookie-value">${escapeHtml(cookie.value.substring(0, 50))}${cookie.value.length > 50 ? '...' : ''}</span>
        `;
        parsedCookiesDiv.appendChild(cookieItem);
    });
    
    // 显示生成的Cookie字符串
    generatedStringDiv.textContent = parsedData.cookieString;
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面卸载时清理定时器
window.addEventListener('beforeunload', function() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
});

// 文件列表搜索和分页功能
let allFiles = []; // 存储所有文件
let filteredFiles = []; // 存储过滤后的文件
let currentPage = 1;
let pageSize = 10;

// 初始化搜索和分页功能
function initFileListEnhancements() {
    const searchInput = document.getElementById('file-search');
    const clearBtn = document.getElementById('clear-search');
    const pageSizeSelect = document.getElementById('page-size');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearSearch);
    }
    
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', handlePageSizeChange);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    }
}

// 处理搜索
function handleSearch() {
    const searchInput = document.getElementById('file-search');
    const clearBtn = document.getElementById('clear-search');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // 显示/隐藏清除按钮
    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'block' : 'none';
    }
    
    // 过滤文件
    if (searchTerm) {
        filteredFiles = allFiles.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
    } else {
        filteredFiles = [...allFiles];
    }
    
    // 重置到第一页
    currentPage = 1;
    
    // 更新显示
    updateFileDisplay();
    updateStats();
}

// 清除搜索
function clearSearch() {
    const searchInput = document.getElementById('file-search');
    const clearBtn = document.getElementById('clear-search');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }
    
    filteredFiles = [...allFiles];
    currentPage = 1;
    updateFileDisplay();
    updateStats();
}

// 处理每页显示数量变化
function handlePageSizeChange() {
    const pageSizeSelect = document.getElementById('page-size');
    pageSize = parseInt(pageSizeSelect.value);
    currentPage = 1;
    updateFileDisplay();
    updatePagination();
}

// 切换页面
function changePage(newPage) {
    const totalPages = Math.ceil(filteredFiles.length / pageSize);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateFileDisplay();
        updatePagination();
    }
}

// 更新文件显示
function updateFileDisplay() {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageFiles = filteredFiles.slice(startIndex, endIndex);
    
    const searchTerm = document.getElementById('file-search')?.value.toLowerCase().trim() || '';
    
    let html = '';
    if (pageFiles.length === 0) {
        if (allFiles.length === 0) {
            html = '<div class="no-files"><i class="fas fa-folder-open"></i><p>暂无下载文件</p></div>';
        } else {
            html = '<div class="no-files"><i class="fas fa-search"></i><p>没有找到匹配的文件</p></div>';
        }
    } else {
        pageFiles.forEach(file => {
            let displayName = escapeHtml(file.name);
            
            // 搜索高亮
            if (searchTerm) {
                const regex = new RegExp(`(${escapeHtml(searchTerm)})`, 'gi');
                displayName = displayName.replace(regex, '<span class="search-highlight">$1</span>');
            }
            
            html += `
                <div class="file-item">
                    <div class="file-info">
                        <div class="file-name">${displayName}</div>
                        <div class="file-meta">
                            <span><i class="fas fa-hdd"></i> ${file.size}</span>
                            <span><i class="fas fa-calendar"></i> ${file.modified}</span>
                        </div>
                    </div>
                    <div class="file-actions">
                         <a href="/api/download_file/${encodeURIComponent(file.name)}" class="btn btn-primary" download>
                             <i class="fas fa-download"></i> 下载
                         </a>
                     </div>
                </div>
            `;
        });
    }
    
    elements.filesList.innerHTML = html;
    updatePagination();
}

// 更新统计信息
function updateStats() {
    const filesCount = document.getElementById('files-count');
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('file-search');
    
    if (filesCount) {
        filesCount.textContent = `共 ${allFiles.length} 个文件`;
    }
    
    if (searchResults && searchInput) {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            searchResults.textContent = `找到 ${filteredFiles.length} 个匹配结果`;
            searchResults.style.display = 'inline';
        } else {
            searchResults.style.display = 'none';
        }
    }
}

// 更新分页控件
function updatePagination() {
    const totalPages = Math.ceil(filteredFiles.length / pageSize);
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pagination = document.querySelector('.pagination');
    
    if (totalPages <= 1) {
        if (pagination) {
            pagination.style.display = 'none';
        }
        return;
    }
    
    if (pagination) {
        pagination.style.display = 'flex';
    }
    
    if (pageNumbers) {
        pageNumbers.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

// 高亮搜索词的辅助函数
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}