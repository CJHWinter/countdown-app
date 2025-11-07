// ================================
// 音乐列表生成脚本
// 功能：扫描 music/学习 和 music/休息 文件夹，生成 music-list.json
// ================================

const fs = require('fs');
const path = require('path');

// 支持的音频和视频文件扩展名
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.MP3', '.WAV', '.OGG', '.M4A'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.MP4', '.WEBM', '.OGG'];
const ALL_MEDIA_EXTENSIONS = [...AUDIO_EXTENSIONS, ...VIDEO_EXTENSIONS];

/**
 * 扫描文件夹中的所有音频文件
 * @param {string} folderPath - 文件夹路径
 * @returns {Array} 音频文件列表
 */
function scanMusicFolder(folderPath) {
    const musicFiles = [];
    
    try {
        // 检查文件夹是否存在
        if (!fs.existsSync(folderPath)) {
            console.warn(`⚠️  文件夹不存在: ${folderPath}`);
            return musicFiles;
        }
        
        // 读取文件夹中的所有文件
        const files = fs.readdirSync(folderPath);
        
        // 过滤出音频文件
        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            
            // 只处理文件（不包括子文件夹）
            if (stats.isFile()) {
                const ext = path.extname(file);
                if (ALL_MEDIA_EXTENSIONS.includes(ext)) {
                    // 获取文件名（不含扩展名）
                    const name = path.basename(file, ext);
                    
                    // 判断是音频还是视频
                    const isVideo = VIDEO_EXTENSIONS.includes(ext);
                    
                    musicFiles.push({
                        name: name,
                        file: `music/${path.basename(folderPath)}/${file}`,
                        duration: '未知', // 前端会自动获取时长
                        format: ext.toLowerCase().replace('.', ''),
                        fileSize: stats.size,
                        type: isVideo ? 'video' : 'audio' // 添加类型标识
                    });
                }
            }
        });
        
        // 按文件名排序
        musicFiles.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        
        console.log(`✅ ${folderPath}: 找到 ${musicFiles.length} 首音乐`);
        
    } catch (error) {
        console.error(`❌ 扫描文件夹失败: ${folderPath}`, error);
    }
    
    return musicFiles;
}

/**
 * 生成音乐列表JSON文件
 */
function generateMusicList() {
    console.log('🎵 开始扫描音乐文件夹...\n');
    
    // 扫描学习音乐文件夹
    const studyPath = path.join(__dirname, 'music', '学习');
    const studyFiles = scanMusicFolder(studyPath);
    
    // 扫描休息音乐文件夹
    const restPath = path.join(__dirname, 'music', '休息');
    const restFiles = scanMusicFolder(restPath);
    
    // 生成JSON数据
    const musicData = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        generatedBy: 'generate-music-list.js',
        study: studyFiles,
        rest: restFiles,
        summary: {
            studyCount: studyFiles.length,
            restCount: restFiles.length,
            totalCount: studyFiles.length + restFiles.length
        }
    };
    
    // 保存到文件
    const outputPath = path.join(__dirname, 'music-list.json');
    try {
        fs.writeFileSync(outputPath, JSON.stringify(musicData, null, 2), 'utf8');
        
        console.log('\n📊 扫描结果汇总:');
        console.log(`   学习音乐: ${studyFiles.length} 首`);
        console.log(`   休息音乐: ${restFiles.length} 首`);
        console.log(`   总计: ${studyFiles.length + restFiles.length} 首`);
        console.log(`\n✅ 音乐列表已生成: ${outputPath}`);
        console.log('\n💡 提示: 现在可以刷新浏览器页面，音乐列表会自动加载！');
        
    } catch (error) {
        console.error('❌ 保存文件失败:', error);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    generateMusicList();
}

module.exports = { generateMusicList, scanMusicFolder };

