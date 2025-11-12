// ================================
// 倒计时氛围感 - 主应用逻辑
// ================================

class CountdownApp {
    constructor() {
        this.currentMode = 'focus'; // 'focus' | 'rest' | 'exam' | 'clock' | 'stats'
        this.currentTheme = 'dark'; // 'dark' | 'light' | 'romantic' | 'warm' | 'forest' | 'ocean'
        this.currentDigitStyle = 'tech'; // 'tech' | 'cute' | 'elegant' | 'playful'
        this.isCountdownActive = false;
        this.isRestCountdownActive = false;
        this.isPaused = false;
        this.isRestPaused = false;
        this.countdownInterval = null;
        this.restCountdownInterval = null;
        this.clockInterval = null;
        this.quoteInterval = null;
        this.audioEnabled = false;
        this.audioVolume = 0.5;
        
        // 倒计时相关
        this.countdownStartTime = null;
        this.countdownEndTime = null;
        this.countdownTotalDuration = 0;
        this.pausedRemainingTime = 0; // 暂停时的剩余时间
        
        // 休息倒计时相关
        this.restStartTime = null;
        this.restEndTime = null;
        this.restTotalDuration = 0;
        this.restTargetMinutes = 15;
        this.restPausedRemainingTime = 0; // 休息模式暂停时的剩余时间
        
        // 考研倒计时相关
        this.examCountdownInterval = null;
        this.examTargetTime = new Date('2025-12-21T08:30:00').getTime(); // 2025年12月21日 8:30
        this.examStartTime = new Date('2024-01-01T00:00:00').getTime(); // 假设开始准备时间
        
        // 音乐系统相关
        this.musicPlaylists = {
            study: [], // 学习音乐
            rest: []   // 休息音乐
        };
        this.currentPlaylist = [];
        this.currentMusicIndex = 0;
        this.isMusicPlaying = false;
        this.musicAudio = null;
        this.selectedStudyMusic = null;
        this.selectedRestMusic = null;
        
        // 北京时间同步
        this.timeOffset = 0; // 与服务器时间的偏移
        this.lastSyncTime = Date.now();
        this.syncInterval = null;
        
        // 名言系统
        this.quotes = [];
        this.currentQuoteIndex = 0;
        this.filteredQuotes = [];
        this.currentTag = 'all';
        this.favoriteQuotes = new Set();
        this.quoteAutoPlay = false;
        this.quotePlayInterval = 30000; // 30秒
        
        // DOM 元素缓存
        this.elements = {};
        
        // 音乐搜索状态
        this.musicSearchStates = {
            study: { searchTerm: '', filteredItems: [] },
            rest: { searchTerm: '', filteredItems: [] }
        };
        
        // 日期时间预览更新定时器
        this.datetimePreviewTimer = null;
        
        // 使用统计系统
        this.usageStats = this.loadUsageStats();
        this.currentSession = null;
        this.typeWriterTimer = null; // 打字机效果定时器
        
        // 音乐播放器显示状态
        this.isMusicPlayerVisible = false;
        
        // 视频播放器状态
        this.isVideoPlaying = false;
        this.currentVideoMusic = null;
        this.currentVideoPlaylist = null;
        this.currentVideoIndex = -1;
        this.currentVideoCategory = null;
        this.enableContinuousPlay = false; // 是否启用连续播放
        this.videoEventsSetup = false; // 标记视频事件是否已设置
        
        // 使用统计系统
        this.usageStats = this.loadUsageStats();
        this.currentSession = null;
        this.typeWriterTimer = null;
        
        // 设置
        this.settings = {
            theme: 'dark',
            showSeconds: true,
            quoteInterval: 30,
            audioEnabled: false,
            audioVolume: 50,
            heartbeatSound: false,
            tickSound: false,
            completionSound: true,
            reducedMotion: false
        };
        
        this.init();
    }
    
    // ================================
    // 初始化方法
    // ================================
    
    async init() {
        this.cacheElements();
        this.loadSettings();
        this.applyTheme();
        this.applyDigitStyle();
        this.bindEvents();
        this.setupMessageListener(); // 设置消息监听
        this.setupVideoPlayerEvents(); // 设置视频播放器事件（只调用一次）
        await this.loadQuotes();
        await this.initializeMusicSystem();
        this.initializeDateTime();
        this.startClock();
        this.startTimeSync();
        this.displayRandomQuote();
        this.updateMusicToggleVisibility(); // 初始化音乐控制显示状态
        this.updateDatetimePreview(); // 初始化日期时间预览
        
        // 如果默认是专注模式，启动时间预览更新
        if (this.currentMode === 'focus') {
            this.startDatetimePreviewUpdate();
        }
        
        console.log('倒计时氛围感应用初始化完成');
    }
    
    cacheElements() {
        // 模式切换
        this.elements.focusModeBtn = document.getElementById('focusModeBtn');
        this.elements.restModeBtn = document.getElementById('restModeBtn');
        this.elements.examModeBtn = document.getElementById('examModeBtn');
        this.elements.clockModeBtn = document.getElementById('clockModeBtn');
        this.elements.statsModeBtn = document.getElementById('statsModeBtn');
        this.elements.focusMode = document.getElementById('focus-mode');
        this.elements.restMode = document.getElementById('rest-mode');
        this.elements.examMode = document.getElementById('exam-mode');
        this.elements.clockMode = document.getElementById('clock-mode');
        this.elements.statsMode = document.getElementById('stats-mode');
        
        // 主题选择
        this.elements.themeBtn = document.getElementById('themeBtn');
        this.elements.themeDropdown = document.getElementById('themeDropdown');
        
        // 数字风格选择
        this.elements.digitStyleBtn = document.getElementById('digitStyleBtn');
        this.elements.digitStyleDropdown = document.getElementById('digitStyleDropdown');
        
        // 倒计时相关
        this.elements.countdownSetup = document.getElementById('countdownSetup');
        this.elements.countdownDisplay = document.getElementById('countdownDisplay');
        this.elements.targetDate = document.getElementById('targetDate');
        this.elements.targetTime = document.getElementById('targetTime');
        this.elements.datetimePreview = document.getElementById('datetimePreview');
        this.elements.startCountdown = document.getElementById('startCountdown');
        this.elements.pauseCountdown = document.getElementById('pauseCountdown');
        this.elements.stopCountdown = document.getElementById('stopCountdown');
        this.elements.progressFill = document.getElementById('progressFill');
        this.elements.progressText = document.getElementById('progressText');
        
        // 倒计时显示数字
        this.elements.days = document.getElementById('days');
        this.elements.hours = document.getElementById('hours');
        this.elements.minutes = document.getElementById('minutes');
        this.elements.seconds = document.getElementById('seconds');
        
        // 休息倒计时相关
        this.elements.restSetup = document.getElementById('restSetup');
        this.elements.restCountdownDisplay = document.getElementById('restCountdownDisplay');
        this.elements.restTargetTime = document.getElementById('restTargetTime');
        this.elements.startRestCountdown = document.getElementById('startRestCountdown');
        this.elements.pauseRestCountdown = document.getElementById('pauseRestCountdown');
        this.elements.stopRestCountdown = document.getElementById('stopRestCountdown');
        this.elements.restMinutes = document.getElementById('restMinutes');
        this.elements.restSeconds = document.getElementById('restSeconds');
        this.elements.restProgressFill = document.getElementById('restProgressFill');
        this.elements.restProgressText = document.getElementById('restProgressText');
        this.elements.currentRestMusic = document.getElementById('currentRestMusic');
        this.elements.restMusicList = document.getElementById('restMusicList');
        this.elements.studyMusicList = document.getElementById('studyMusicList');
        
        // 考研倒计时相关
        this.elements.examDays = document.getElementById('examDays');
        this.elements.examHours = document.getElementById('examHours');
        this.elements.examMinutes = document.getElementById('examMinutes');
        this.elements.examSeconds = document.getElementById('examSeconds');
        this.elements.examProgressCircle = document.getElementById('examProgressCircle');
        this.elements.examProgressPercentage = document.getElementById('examProgressPercentage');
        this.elements.examEncouragement = document.getElementById('examEncouragement');
        
        // 时钟相关
        this.elements.dateDisplay = document.getElementById('dateDisplay');
        this.elements.year = document.getElementById('year');
        this.elements.month = document.getElementById('month');
        this.elements.day = document.getElementById('day');
        this.elements.weekday = document.getElementById('weekday');
        this.elements.clockHours = document.getElementById('clockHours');
        this.elements.clockMinutes = document.getElementById('clockMinutes');
        this.elements.clockSeconds = document.getElementById('clockSeconds');
        this.elements.secondsUnit = document.getElementById('secondsUnit');
        this.elements.secondsSeparator = document.getElementById('secondsSeparator');
        this.elements.toggleSeconds = document.getElementById('toggleSeconds');
        this.elements.syncTime = document.getElementById('syncTime');
        this.elements.timeStatus = document.getElementById('timeStatus');
        this.elements.lastSync = document.getElementById('lastSync');
        
        // 名言相关
        this.elements.quoteText = document.getElementById('quoteText');
        this.elements.quoteAuthor = document.getElementById('quoteAuthor');
        this.elements.prevQuote = document.getElementById('prevQuote');
        this.elements.nextQuote = document.getElementById('nextQuote');
        this.elements.copyQuote = document.getElementById('copyQuote');
        this.elements.favoriteQuote = document.getElementById('favoriteQuote');
        this.elements.autoPlayQuote = document.getElementById('autoPlayQuote');
        this.elements.quoteTags = document.getElementById('quoteTags');
        
        // 音频控制
        this.elements.audioToggle = document.getElementById('audioToggle');
        this.elements.volumeSlider = document.getElementById('volumeSlider');
        this.elements.volumeValue = document.getElementById('volumeValue');
        this.elements.tickAudio = document.getElementById('tickAudio');
        this.elements.heartbeatAudio = document.getElementById('heartbeatAudio');
        this.elements.completionAudio = document.getElementById('completionAudio');
        
        // 音乐播放器
        this.elements.musicPlayer = document.getElementById('musicPlayer');
        this.elements.musicAudio = document.getElementById('musicAudio');
        this.elements.currentMusicTitle = document.getElementById('currentMusicTitle');
        this.elements.currentMusicCategory = document.getElementById('currentMusicCategory');
        this.elements.prevMusicBtn = document.getElementById('prevMusicBtn');
        this.elements.playPauseBtn = document.getElementById('playPauseBtn');
        this.elements.nextMusicBtn = document.getElementById('nextMusicBtn');
        this.elements.musicProgressFill = document.getElementById('musicProgressFill');
        this.elements.currentTime = document.getElementById('currentTime');
        this.elements.totalTime = document.getElementById('totalTime');
        
        // 设置面板
        this.elements.settingsBtn = document.getElementById('settingsBtn');
        this.elements.settingsPanel = document.getElementById('settingsPanel');
        this.elements.closeSettings = document.getElementById('closeSettings');
        
        // 弹窗
        this.elements.completionModal = document.getElementById('completionModal');
        this.elements.favoritesModal = document.getElementById('favoritesModal');
        this.elements.toast = document.getElementById('toast');
        this.elements.toastMessage = document.getElementById('toastMessage');
        
        // 快捷按钮
        this.elements.quickBtns = document.querySelectorAll('.quick-btn');
        this.elements.restQuickBtns = document.querySelectorAll('.rest-btn');
        
        // 刷新音乐按钮
        this.elements.refreshStudyMusic = document.getElementById('refreshStudyMusic');
        this.elements.refreshRestMusic = document.getElementById('refreshRestMusic');
        
        // 移除了添加音乐按钮（Web技术限制无法直接复制文件到本地文件夹）
        
        // 音乐搜索相关
        this.elements.studyMusicSearch = document.getElementById('studyMusicSearch');
        this.elements.studyMusicSearchClear = document.getElementById('studyMusicSearchClear');
        this.elements.studyMusicNoResults = document.getElementById('studyMusicNoResults');
        this.elements.restMusicSearch = document.getElementById('restMusicSearch');
        this.elements.restMusicSearchClear = document.getElementById('restMusicSearchClear');
        this.elements.restMusicNoResults = document.getElementById('restMusicNoResults');
        
        // 左侧音乐控制
        this.elements.musicToggleControl = document.getElementById('musicToggleControl');
        this.elements.musicToggleIcon = document.getElementById('musicToggleIcon');
        
        // 休息倒计时音乐选择器
        this.elements.restMusicSelectorToggle = document.getElementById('restMusicSelectorToggle');
        this.elements.restMusicSelectorContent = document.getElementById('restMusicSelectorContent');
        this.elements.restCountdownMusicSearch = document.getElementById('restCountdownMusicSearch');
        this.elements.restCountdownMusicSearchClear = document.getElementById('restCountdownMusicSearchClear');
        this.elements.restCountdownMusicList = document.getElementById('restCountdownMusicList');
        this.elements.restCountdownMusicNoResults = document.getElementById('restCountdownMusicNoResults');
        
        // 视频播放器
        this.elements.videoPlayerModal = document.getElementById('videoPlayerModal');
        this.elements.videoPlayer = document.getElementById('videoPlayer');
        this.elements.videoPlayerTitle = document.getElementById('videoPlayerTitle');
        this.elements.videoPlayerName = document.getElementById('videoPlayerName');
        this.elements.videoPlayerCategory = document.getElementById('videoPlayerCategory');
        this.elements.videoPlayerMinimize = document.getElementById('videoPlayerMinimize');
        this.elements.videoPlayerClose = document.getElementById('videoPlayerClose');
        
        // 确保video元素有controls属性
        if (this.elements.videoPlayer) {
            this.elements.videoPlayer.controls = true;
            this.elements.videoPlayer.controlsList = 'nodownload';
        }
        // 只保留上一首/下一首按钮，播放/暂停和全屏使用原生控制条
        this.elements.videoPrevBtn = document.getElementById('videoPrevBtn');
        this.elements.videoNextBtn = document.getElementById('videoNextBtn');
        
        // 最小化播放器元素
        this.elements.videoPlayerMinimized = document.getElementById('videoPlayerMinimized');
        this.elements.minimizedPlayerName = document.getElementById('minimizedPlayerName');
        this.elements.minimizedPlayerCategory = document.getElementById('minimizedPlayerCategory');
        this.elements.minimizedPlayPauseBtn = document.getElementById('minimizedPlayPauseBtn');
        this.elements.minimizedPrevBtn = document.getElementById('minimizedPrevBtn');
        this.elements.minimizedNextBtn = document.getElementById('minimizedNextBtn');
        this.elements.minimizedRestoreBtn = document.getElementById('minimizedRestoreBtn');
        this.elements.minimizedCloseBtn = document.getElementById('minimizedCloseBtn');
        
        // 视频播放器状态
        this.currentVideoPlaylist = null;
        this.currentVideoIndex = -1;
        this.currentVideoCategory = null;
    }
    
    // ================================
    // 设置管理
    // ================================
    
    loadSettings() {
        const saved = localStorage.getItem('countdown-app-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // 加载收藏的名言
        const favorites = localStorage.getItem('countdown-app-favorites');
        if (favorites) {
            this.favoriteQuotes = new Set(JSON.parse(favorites));
        }
        
        // 应用设置
        this.currentTheme = this.settings.theme;
        this.currentDigitStyle = this.settings.digitStyle || 'tech';
        this.audioEnabled = this.settings.audioEnabled;
        this.audioVolume = this.settings.audioVolume / 100;
        this.quotePlayInterval = this.settings.quoteInterval * 1000;
        this.restTargetMinutes = this.settings.restTargetMinutes || 15;
        
        // 更新UI
        this.updateSettingsUI();
    }
    
    saveSettings() {
        localStorage.setItem('countdown-app-settings', JSON.stringify(this.settings));
        localStorage.setItem('countdown-app-favorites', JSON.stringify([...this.favoriteQuotes]));
    }
    
    updateSettingsUI() {
        // 更新设置面板中的值
        const quoteIntervalInput = document.getElementById('quoteInterval');
        const heartbeatSoundCheck = document.getElementById('heartbeatSound');
        const tickSoundCheck = document.getElementById('tickSound');
        const completionSoundCheck = document.getElementById('completionSound');
        const reducedMotionCheck = document.getElementById('reducedMotion');
        
        if (quoteIntervalInput) quoteIntervalInput.value = this.settings.quoteInterval;
        if (heartbeatSoundCheck) heartbeatSoundCheck.checked = this.settings.heartbeatSound;
        if (tickSoundCheck) tickSoundCheck.checked = this.settings.tickSound;
        if (completionSoundCheck) completionSoundCheck.checked = this.settings.completionSound;
        if (reducedMotionCheck) reducedMotionCheck.checked = this.settings.reducedMotion;
        
        // 更新音量控制
        if (this.elements.volumeSlider) {
            this.elements.volumeSlider.value = this.settings.audioVolume;
            this.elements.volumeValue.textContent = this.settings.audioVolume + '%';
        }
        
        // 更新音频图标
        this.updateAudioIcon();
        
        // 更新显示秒数按钮
        if (this.elements.toggleSeconds) {
            this.elements.toggleSeconds.textContent = this.settings.showSeconds ? '🙈 隐藏秒数' : '👁️ 显示秒数';
        }
    }
    
    // ================================
    // 主题管理
    // ================================
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // 更新主题选择器的状态
        if (this.elements.themeDropdown) {
            const options = this.elements.themeDropdown.querySelectorAll('.theme-option');
            options.forEach(option => {
                option.classList.toggle('active', option.dataset.theme === this.currentTheme);
            });
        }
        
        this.settings.theme = this.currentTheme;
        this.saveSettings();
    }
    
    changeTheme(themeName) {
        const themeNames = {
            'dark': '深邃夜空',
            'light': '清新白昼',
            'romantic': '浪漫粉樱',
            'warm': '温暖日落',
            'forest': '森林绿意',
            'ocean': '海洋蓝调'
        };
        
        this.currentTheme = themeName;
        this.applyTheme();
        this.showToast(`已切换到${themeNames[themeName]}主题 ✨`);
    }
    
    // ================================
    // 数字风格管理
    // ================================
    
    applyDigitStyle() {
        // 移除所有数字的样式类
        const digits = document.querySelectorAll('.digit, .exam-digit');
        const separators = document.querySelectorAll('.time-separator, .exam-time-separator');
        
        digits.forEach(digit => {
            digit.classList.remove('tech-style', 'cute-style', 'elegant-style', 'playful-style');
            digit.classList.add(`${this.currentDigitStyle}-style`);
        });
        
        separators.forEach(separator => {
            separator.classList.remove('tech-style', 'cute-style', 'elegant-style', 'playful-style');
            separator.classList.add(`${this.currentDigitStyle}-style`);
        });
        
        // 更新数字风格选择器的状态
        if (this.elements.digitStyleDropdown) {
            const options = this.elements.digitStyleDropdown.querySelectorAll('.digit-style-option');
            options.forEach(option => {
                option.classList.toggle('active', option.dataset.style === this.currentDigitStyle);
            });
        }
        
        this.settings.digitStyle = this.currentDigitStyle;
        this.saveSettings();
    }
    
    changeDigitStyle(styleName) {
        const styleNames = {
            'tech': '科技感',
            'cute': '可爱圆润',
            'elegant': '优雅细线',
            'playful': '俏皮泡泡'
        };
        
        this.currentDigitStyle = styleName;
        this.applyDigitStyle();
        this.showToast(`已切换到${styleNames[styleName]}数字风格 💫`);
    }
    
    // ================================
    // 模式切换
    // ================================
    
    switchMode(mode) {
        if (this.currentMode === mode) return;
        
        this.currentMode = mode;
        
        // 更新按钮状态
        this.elements.focusModeBtn.classList.toggle('active', mode === 'focus');
        this.elements.restModeBtn.classList.toggle('active', mode === 'rest');
        this.elements.examModeBtn.classList.toggle('active', mode === 'exam');
        this.elements.clockModeBtn.classList.toggle('active', mode === 'clock');
        this.elements.statsModeBtn.classList.toggle('active', mode === 'stats');
        
        // 更新 ARIA 属性
        this.elements.focusModeBtn.setAttribute('aria-selected', mode === 'focus');
        this.elements.restModeBtn.setAttribute('aria-selected', mode === 'rest');
        this.elements.examModeBtn.setAttribute('aria-selected', mode === 'exam');
        this.elements.clockModeBtn.setAttribute('aria-selected', mode === 'clock');
        this.elements.statsModeBtn.setAttribute('aria-selected', mode === 'stats');
        
        // 切换显示内容
        this.elements.focusMode.classList.toggle('active', mode === 'focus');
        this.elements.restMode.classList.toggle('active', mode === 'rest');
        this.elements.examMode.classList.toggle('active', mode === 'exam');
        this.elements.clockMode.classList.toggle('active', mode === 'clock');
        this.elements.statsMode.classList.toggle('active', mode === 'stats');
        
        // 如果切换到统计页面，渲染统计内容
        if (mode === 'stats') {
            this.renderStatsPage();
        }
        
        // 如果切换回专注模式，且倒计时还在运行，显示倒计时界面
        if (mode === 'focus' && this.isCountdownActive) {
            this.elements.countdownSetup.classList.add('hidden');
            this.elements.countdownDisplay.classList.remove('hidden');
            // 立即更新一次倒计时显示，确保显示正确的时间
            this.updateCountdown();
        } else if (mode === 'focus' && !this.isCountdownActive) {
            // 如果倒计时未运行，显示设置界面
            this.elements.countdownSetup.classList.remove('hidden');
            this.elements.countdownDisplay.classList.add('hidden');
        }
        
        // 如果切换回休息模式，且倒计时还在运行，显示倒计时界面
        if (mode === 'rest' && this.isRestCountdownActive) {
            this.elements.restSetup.classList.add('hidden');
            this.elements.restCountdownDisplay.classList.remove('hidden');
            // 立即更新一次倒计时显示，确保显示正确的时间
            this.updateRestCountdown();
        } else if (mode === 'rest' && !this.isRestCountdownActive) {
            // 如果倒计时未运行，显示设置界面
            this.elements.restSetup.classList.remove('hidden');
            this.elements.restCountdownDisplay.classList.add('hidden');
        }
        
        // 注意：切换模式时不停止倒计时，让倒计时在后台继续运行
        // 用户可以随时切换回专注/休息模式查看倒计时状态
        
        // 启动考研倒计时
        if (mode === 'exam') {
            this.startExamCountdown();
        } else {
            this.stopExamCountdown();
        }
        
        // 更新音乐控制显示状态
        this.updateMusicToggleVisibility();
        
        // 控制时间预览更新
        if (mode === 'focus') {
            // 专注模式启动时间预览更新
            this.startDatetimePreviewUpdate();
            // 立即更新一次预览
            this.updateDatetimePreview();
        } else {
            // 其他模式停止时间预览更新
            this.stopDatetimePreviewUpdate();
        }
        
        const modeNames = {
            'focus': '专注模式',
            'rest': '休息模式',
            'exam': '考研倒计时',
            'clock': '日常时钟'
        };
        
        this.showToast(`已切换到${modeNames[mode]} 💖`);
    }
    
    // ================================
    // 考研倒计时管理
    // ================================
    
    startExamCountdown() {
        this.updateExamCountdown();
        this.examCountdownInterval = setInterval(() => {
            this.updateExamCountdown();
        }, 1000);
    }
    
    stopExamCountdown() {
        if (this.examCountdownInterval) {
            clearInterval(this.examCountdownInterval);
            this.examCountdownInterval = null;
        }
    }
    
    updateExamCountdown() {
        const now = new Date().getTime();
        const remaining = this.examTargetTime - now;
        
        if (remaining <= 0) {
            // 考试已开始
            this.handleExamStarted();
            return;
        }
        
        // 计算时间单位
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        // 更新显示
        this.updateDigitWithAnimation(this.elements.examDays, String(days).padStart(3, '0'));
        this.updateDigitWithAnimation(this.elements.examHours, String(hours).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.examMinutes, String(minutes).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.examSeconds, String(seconds).padStart(2, '0'));
        
        // 更新进度环
        this.updateExamProgress(remaining);
        
        // 更新鼓励语和里程碑
        this.updateExamEncouragement(days);
        this.updateExamMilestones(days);
    }
    
    updateExamProgress(remaining) {
        // 假设从开始准备到考试有一年时间
        const totalDuration = this.examTargetTime - this.examStartTime;
        const elapsed = totalDuration - remaining;
        const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        
        // 更新进度环
        if (this.elements.examProgressCircle) {
            const circumference = 2 * Math.PI * 90; // r=90
            const offset = circumference - (progress / 100) * circumference;
            this.elements.examProgressCircle.style.strokeDashoffset = offset;
        }
        
        // 更新百分比显示
        if (this.elements.examProgressPercentage) {
            this.elements.examProgressPercentage.textContent = Math.round(progress) + '%';
        }
    }
    
    updateExamEncouragement(days) {
        const encouragements = [
            '🌟 每一分努力都在为梦想积累能量',
            '💪 坚持就是胜利，你已经走了这么远',
            '🌈 美好的未来正在向你招手',
            '✨ 相信自己，你比想象中更强大',
            '🎯 专注当下，成功就在不远处',
            '🌸 每一天的进步都让你更接近梦想',
            '💖 为了更好的自己，加油',
            '🎨 用知识为人生涂上最美的色彩',
            '🚀 努力的你最美丽',
            '🌺 愿你的汗水浇灌出最美的花朵'
        ];
        
        let encouragement;
        if (days <= 7) {
            encouragement = '🔥 最后冲刺！相信自己，一定可以的！';
        } else if (days <= 30) {
            encouragement = '⚡ 冲刺阶段！每一天都很关键！';
        } else if (days <= 50) {
            encouragement = '🎯 进入冲刺期，保持节奏！';
        } else if (days <= 100) {
            encouragement = '💪 努力加速中，你做得很棒！';
        } else {
            encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        }
        
        if (this.elements.examEncouragement) {
            this.elements.examEncouragement.textContent = encouragement;
        }
    }
    
    updateExamMilestones(days) {
        const milestones = [
            { id: 'milestone100', threshold: 100, active: days <= 100 },
            { id: 'milestone50', threshold: 50, active: days <= 50 },
            { id: 'milestone30', threshold: 30, active: days <= 30 },
            { id: 'milestone7', threshold: 7, active: days <= 7 }
        ];
        
        milestones.forEach(milestone => {
            const element = document.getElementById(milestone.id);
            if (element) {
                element.classList.toggle('active', milestone.active);
            }
        });
    }
    
    handleExamStarted() {
        // 考试已开始
        if (this.elements.examDays) this.elements.examDays.textContent = '000';
        if (this.elements.examHours) this.elements.examHours.textContent = '00';
        if (this.elements.examMinutes) this.elements.examMinutes.textContent = '00';
        if (this.elements.examSeconds) this.elements.examSeconds.textContent = '00';
        
        if (this.elements.examEncouragement) {
            this.elements.examEncouragement.textContent = '🎉 考试已开始！发挥你的最佳水平！';
        }
        
        this.stopExamCountdown();
        this.showToast('🎊 考研已开始！祝你考试顺利！', 'success');
    }
    
    // ================================
    // 休息模式倒计时管理
    // ================================
    
    startRestCountdown() {
        const targetMinutes = parseInt(this.elements.restTargetTime.value) || this.restTargetMinutes;
        const now = new Date().getTime();
        
        this.restStartTime = now;
        this.restEndTime = now + (targetMinutes * 60 * 1000);
        this.restTotalDuration = targetMinutes * 60 * 1000;
        this.isRestCountdownActive = true;
        this.isRestPaused = false;
        this.restPausedRemainingTime = 0;
        
        // 记录会话开始
        const plannedDuration = targetMinutes * 60;
        this.startSession('rest', plannedDuration);
        
        // 切换界面
        this.elements.restSetup.classList.add('hidden');
        this.elements.restCountdownDisplay.classList.remove('hidden');
        
        // 开始倒计时
        this.updateRestCountdown();
        this.restCountdownInterval = setInterval(() => {
            this.updateRestCountdown();
        }, 1000);
        
        // 开始播放休息音乐
        if (this.selectedRestMusic) {
            this.playMusicAuto('rest');
        }
        
        this.showToast('🌸 休息时光开始！好好放松吧 💕');
    }
    
    updateRestCountdown() {
        if (!this.isRestCountdownActive || this.isRestPaused) return;
        
        const now = new Date().getTime();
        const remaining = this.restEndTime - now;
        
        if (remaining <= 0) {
            this.completeRestCountdown();
            return;
        }
        
        // 计算时间单位
        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        // 更新显示
        this.updateDigitWithAnimation(this.elements.restMinutes, String(minutes).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.restSeconds, String(seconds).padStart(2, '0'));
        
        // 更新进度条
        const progress = ((this.restTotalDuration - remaining) / this.restTotalDuration) * 100;
        this.elements.restProgressFill.style.width = progress + '%';
        this.elements.restProgressText.textContent = Math.round(progress) + '%';
    }
    
    pauseRestCountdown() {
        if (!this.isRestCountdownActive) return;
        
        this.isRestPaused = !this.isRestPaused;
        
        if (this.isRestPaused) {
            // 暂停：保存当前剩余时间并清除定时器
            const now = new Date().getTime();
            this.restPausedRemainingTime = this.restEndTime - now;
            clearInterval(this.restCountdownInterval);
            this.restCountdownInterval = null;
            this.elements.pauseRestCountdown.innerHTML = '<span class="btn-icon">▶️</span> 继续';
        this.showToast('休息倒计时已暂停');
        } else {
            // 继续：根据保存的剩余时间重新设置结束时间
            const now = new Date().getTime();
            this.restEndTime = now + this.restPausedRemainingTime;
            this.restCountdownInterval = setInterval(() => {
                this.updateRestCountdown();
            }, 1000);
            this.elements.pauseRestCountdown.innerHTML = '<span class="btn-icon">⏸️</span> 暂停';
            this.showToast('休息倒计时已继续');
        }
    }
    
    stopRestCountdown() {
        // 记录会话结束（提前结束）
        if (this.currentSession) {
            this.endSession(false);
        }
        
        this.isRestCountdownActive = false;
        this.isRestPaused = false;
        this.restPausedRemainingTime = 0;
        
        if (this.restCountdownInterval) {
            clearInterval(this.restCountdownInterval);
            this.restCountdownInterval = null;
        }
        
        // 停止音乐
        this.stopMusic();
        
        // 重置界面
        this.elements.restSetup.classList.remove('hidden');
        this.elements.restCountdownDisplay.classList.add('hidden');
        this.elements.pauseRestCountdown.innerHTML = '<span class="btn-icon">⏸️</span> 暂停';
        
        this.showToast('休息结束，准备开始新的专注！');
    }
    
    completeRestCountdown() {
        // 记录会话完成
        if (this.currentSession) {
            this.endSession(true);
        }
        
        this.isRestCountdownActive = false;
        this.isRestPaused = false;
        this.restPausedRemainingTime = 0;
        clearInterval(this.restCountdownInterval);
        
        // 停止音乐并关闭播放器
        this.stopMusic();
        this.closeVideoPlayer(); // 关闭视频/音频播放器
        
        // 重置显示
        this.updateDigitWithAnimation(this.elements.restMinutes, '00');
        this.updateDigitWithAnimation(this.elements.restSeconds, '00');
        
        this.elements.restProgressFill.style.width = '100%';
        this.elements.restProgressText.textContent = '100%';
        this.elements.pauseRestCountdown.innerHTML = '<span class="btn-icon">⏸️</span> 暂停';
        
        // 如果当前不在休息模式，自动切换回休息模式以显示完成提示
        if (this.currentMode !== 'rest') {
            this.switchMode('rest');
        } else {
            // 如果已经在休息模式，重置界面显示设置界面
            this.elements.restSetup.classList.remove('hidden');
            this.elements.restCountdownDisplay.classList.add('hidden');
        }
        
        this.showToast('🎊 休息时间结束！准备开始新的专注吧！', 'success');
        
        // 振动反馈（如果支持）
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    setRestQuickTime(minutes) {
        // 休息模式直接设置指定的时间，不累加
        this.restTargetMinutes = minutes;
        this.elements.restTargetTime.value = minutes;
        this.showToast(`已设置${minutes}分钟休息时间`);
    }
    
    // ================================
    // 音乐系统管理
    // ================================
    
    // 音乐列表持久化相关
    saveMusicListsToStorage() {
        try {
            // 生成音乐文件的哈希值用于检测变化
            const studyHash = this.generatePlaylistHash(this.musicPlaylists.study);
            const restHash = this.generatePlaylistHash(this.musicPlaylists.rest);
            
            // 尝试获取JSON文件的生成时间（如果从JSON加载）
            let jsonGeneratedAt = null;
            try {
                // 如果音乐列表是从JSON加载的，保存JSON的生成时间
                const cached = localStorage.getItem('countdown-app-music-lists');
                if (cached) {
                    const cachedData = JSON.parse(cached);
                    jsonGeneratedAt = cachedData.jsonGeneratedAt;
                }
            } catch (e) {
                // 忽略错误
            }
            
            // 如果this.jsonGeneratedAt存在（刚刚从JSON加载），使用它
            if (this.jsonGeneratedAt) {
                jsonGeneratedAt = this.jsonGeneratedAt;
                this.jsonGeneratedAt = null; // 清除临时标记
            }
            
            const musicData = {
                study: this.musicPlaylists.study,
                rest: this.musicPlaylists.rest,
                timestamp: Date.now(),
                version: '1.1',
                studyHash: studyHash,
                restHash: restHash,
                lastScanTime: Date.now(),
                jsonGeneratedAt: jsonGeneratedAt // 保存JSON文件的生成时间
            };
            localStorage.setItem('countdown-app-music-lists', JSON.stringify(musicData));
            console.log(`音乐列表已保存到本地存储 - 学习:${this.musicPlaylists.study.length}首(${studyHash}), 休息:${this.musicPlaylists.rest.length}首(${restHash})`);
        } catch (error) {
            console.warn('保存音乐列表失败:', error);
        }
    }
    
    async loadMusicListsFromStorage() {
        try {
            const saved = localStorage.getItem('countdown-app-music-lists');
            if (!saved) {
                console.log('没有找到本地存储的音乐数据');
                return false; // 没有保存的数据
            }
            
            const musicData = JSON.parse(saved);
            
            // 检查数据是否过期（7天过期）
            const isExpired = Date.now() - musicData.timestamp > 7 * 24 * 60 * 60 * 1000;
            if (isExpired) {
                console.log('音乐列表数据已过期，将重新扫描');
                localStorage.removeItem('countdown-app-music-lists');
                return false;
            }
            
            // 检查版本兼容性
            if (!musicData.version || musicData.version < '1.1') {
                console.log('音乐数据版本过旧，需要重新扫描');
                localStorage.removeItem('countdown-app-music-lists');
                return false;
            }
            
            // 加载音乐列表
            this.musicPlaylists.study = musicData.study || [];
            this.musicPlaylists.rest = musicData.rest || [];
            
            // 验证缓存的完整性 - 检查是否有新文件添加
            const shouldRefresh = await this.shouldRefreshCache(musicData);
            if (shouldRefresh) {
                console.log('检测到音乐文件变化，需要重新扫描');
                return false;
            }
            
            console.log(`从本地存储加载音乐列表：学习${this.musicPlaylists.study.length}首，休息${this.musicPlaylists.rest.length}首`);
            return true;
        } catch (error) {
            console.warn('加载本地存储的音乐列表失败:', error);
            localStorage.removeItem('countdown-app-music-lists');
            return false;
        }
    }
    
    clearMusicStorage() {
        localStorage.removeItem('countdown-app-music-lists');
        console.log('音乐列表本地存储已清除');
    }
    
    // 生成播放列表的哈希值，用于检测文件变化
    generatePlaylistHash(playlist) {
        if (!playlist || playlist.length === 0) {
            return 'empty';
        }
        
        // 基于文件名、路径和数量生成简单哈希
        const hashData = playlist.map(music => `${music.name}|${music.path}|${music.duration || 0}`).join('|');
        let hash = 0;
        for (let i = 0; i < hashData.length; i++) {
            const char = hashData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(16);
    }
    
    // 检查是否需要刷新缓存
    async shouldRefreshCache(cachedData) {
        try {
            // 如果缓存时间超过1小时，进行快速检查
            const cacheAge = Date.now() - (cachedData.lastScanTime || cachedData.timestamp);
            if (cacheAge < 60 * 60 * 1000) { // 1小时内不检查
                return false;
            }
            
            // 快速扫描检查是否有新文件
            const studyFiles = await this.quickScanForChanges('music/学习');
            const restFiles = await this.quickScanForChanges('music/休息');
            
            // 比较文件数量和哈希
            const currentStudyHash = this.generatePlaylistHash(studyFiles);
            const currentRestHash = this.generatePlaylistHash(restFiles);
            
            const hasChanges = (
                currentStudyHash !== cachedData.studyHash ||
                currentRestHash !== cachedData.restHash ||
                studyFiles.length !== (cachedData.study || []).length ||
                restFiles.length !== (cachedData.rest || []).length
            );
            
            if (hasChanges) {
                console.log(`检测到文件变化 - 学习: ${currentStudyHash} vs ${cachedData.studyHash}, 休息: ${currentRestHash} vs ${cachedData.restHash}`);
            }
            
            return hasChanges;
        } catch (error) {
            console.warn('检查缓存状态失败:', error);
            return false; // 出错时不强制刷新
        }
    }
    
    // 快速扫描文件夹变化（仅检查文件存在性，不加载完整元数据）
    async quickScanForChanges(folderPath) {
        try {
            const patterns = await this.generateMusicFilePatterns();
            const foundFiles = [];
            
            // 只检查前20个常见模式，快速检测
            const quickPatterns = patterns.slice(0, 20);
            
            for (const pattern of quickPatterns) {
                const filePath = `${folderPath}/${pattern}`;
                const exists = await this.quickCheckFile(filePath);
                if (exists) {
                    foundFiles.push({
                        name: pattern.replace(/\.[^/.]+$/, ''),
                        path: filePath,
                        duration: 0 // 快速扫描不获取时长
                    });
                }
            }
            
            return foundFiles;
        } catch (error) {
            console.warn(`快速扫描${folderPath}失败:`, error);
            return [];
        }
    }
    
    /**
     * 重新生成音乐列表（清除缓存并重新读取JSON文件）
     * 统一刷新逻辑：所有刷新按钮都使用这个逻辑
     */
    async regenerateMusicList() {
        const btn = document.getElementById('regenerateMusicList');
        const originalText = btn ? btn.innerHTML : '';
        
        try {
            // 显示加载状态
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="btn-icon">⏳</span> 正在刷新...';
            }
            
            this.showToast('正在刷新音乐列表...');
            
            // 清除缓存，强制重新读取JSON
            this.clearMusicStorage();
            
            // 清空当前音乐列表
            this.musicPlaylists.study = [];
            this.musicPlaylists.rest = [];
            
            // 清空UI
            if (this.elements.studyMusicList) {
                this.elements.studyMusicList.innerHTML = '';
            }
            if (this.elements.restMusicList) {
                this.elements.restMusicList.innerHTML = '';
            }
            
            // 重新加载音乐文件（会优先读取JSON）
            await this.loadMusicFiles();
            
            // 检查是否成功加载
            const totalCount = this.musicPlaylists.study.length + this.musicPlaylists.rest.length;
            
            if (totalCount === 0) {
                // 如果没有加载到音乐，提示用户运行脚本
                const message = `音乐列表为空！\n\n请先运行以下命令生成音乐列表：\n\nnode generate-music-list.js\n\n或者双击运行：生成音乐列表.bat\n\n脚本会扫描以下两个文件夹：\n• music/学习/\n• music/休息/\n\n运行完成后，再次点击此按钮刷新。`;
                alert(message);
                this.showToast('请先运行 node generate-music-list.js 生成音乐列表');
            } else {
                const studyCount = this.musicPlaylists.study.length;
                const restCount = this.musicPlaylists.rest.length;
                const studyVideos = this.musicPlaylists.study.filter(m => m.type === 'video' || m.format === 'mp4').length;
                const restVideos = this.musicPlaylists.rest.filter(m => m.type === 'video' || m.format === 'mp4').length;
                
                let message = `✅ 音乐列表已刷新！学习音乐${studyCount}首`;
                if (studyVideos > 0) {
                    message += `（含${studyVideos}个视频）`;
                }
                message += `，休息音乐${restCount}首`;
                if (restVideos > 0) {
                    message += `（含${restVideos}个视频）`;
                }
                message += ' 🎵';
                
                this.showToast(message);
            }
            
        } catch (error) {
            console.error('刷新音乐列表失败:', error);
            this.showToast('刷新失败，请重试');
        } finally {
            // 恢复按钮状态
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    }
    
    async clearMusicCacheAndRefresh() {
        if (confirm('确定要清除音乐缓存吗？\n\n这将删除本地保存的音乐列表，重新扫描音乐文件夹。')) {
            try {
                // 清除本地存储
                this.clearMusicStorage();
                
                // 清空当前音乐列表
                this.musicPlaylists.study = [];
                this.musicPlaylists.rest = [];
                
                // 清空UI
                if (this.elements.studyMusicList) {
                    this.elements.studyMusicList.innerHTML = '';
                }
                if (this.elements.restMusicList) {
                    this.elements.restMusicList.innerHTML = '';
                }
                
                this.showToast('音乐缓存已清除，正在重新扫描...');
                
                // 重新加载音乐文件
                await this.loadMusicFiles();
                
                this.showToast('✅ 音乐列表已重新加载完成！');
            } catch (error) {
                console.error('清除音乐缓存失败:', error);
                this.showToast('清除音乐缓存失败，请重试');
            }
        }
    }
    
    async initializeMusicSystem() {
        this.musicAudio = this.elements.musicAudio;
        
        if (this.musicAudio) {
            this.musicAudio.addEventListener('loadedmetadata', () => {
                this.updateMusicTime();
            });
            
            this.musicAudio.addEventListener('timeupdate', () => {
                this.updateMusicProgress();
            });
            
            this.musicAudio.addEventListener('ended', () => {
                this.nextMusic();
            });
            
            // 添加播放和暂停事件监听器，确保按钮状态同步
            this.musicAudio.addEventListener('play', () => {
                this.isMusicPlaying = true;
                this.updatePlayPauseButton();
            });
            
            this.musicAudio.addEventListener('pause', () => {
                this.isMusicPlaying = false;
                this.updatePlayPauseButton();
            });
        }
        
        await this.loadMusicFiles();
        this.populateMusicLists();
    }
    
    async loadMusicFiles() {
        try {
            console.log('🎵 开始加载音乐文件...');
            
            // 优先级1: 首先尝试从预生成的JSON文件加载（最快最准确）
            const loadedFromJSON = await this.loadMusicListFromJSON();
            
            if (loadedFromJSON) {
                // 如果成功从JSON加载，直接填充UI并保存到本地存储
                console.log(`📊 准备填充UI：学习${this.musicPlaylists.study.length}首，休息${this.musicPlaylists.rest.length}首`);
                this.populateMusicLists();
                this.saveMusicListsToStorage();
                
                const studyVideos = this.musicPlaylists.study.filter(m => m.type === 'video').length;
                const restVideos = this.musicPlaylists.rest.filter(m => m.type === 'video').length;
                
                let message = `✅ 从音乐列表加载成功！学习音乐${this.musicPlaylists.study.length}首`;
                if (studyVideos > 0) {
                    message += `（含${studyVideos}个视频）`;
                }
                message += `，休息音乐${this.musicPlaylists.rest.length}首`;
                if (restVideos > 0) {
                    message += `（含${restVideos}个视频）`;
                }
                message += ' 🎵';
                
                this.showToast(message);
                console.log('✅ 音乐列表加载完成');
                return;
            }
            
            console.log('⚠️ JSON文件加载失败，尝试从本地存储加载');
            
            // 优先级2: 尝试从本地存储加载（如果JSON不存在）
            const loadedFromStorage = await this.loadMusicListsFromStorage();
            
            if (loadedFromStorage) {
                // 如果成功从本地存储加载，直接填充UI
                console.log(`📊 从本地存储加载：学习${this.musicPlaylists.study.length}首，休息${this.musicPlaylists.rest.length}首`);
                this.populateMusicLists();
                this.showToast(`从本地缓存加载音乐！学习音乐${this.musicPlaylists.study.length}首，休息音乐${this.musicPlaylists.rest.length}首 🎵`);
                return;
            }
            
            console.log('⚠️ 本地存储加载失败，使用fallback扫描');
            
            // 优先级3: 如果前两种方式都失败，进行文件夹扫描（作为fallback）
            this.showToast('正在扫描音乐文件...（建议运行 node generate-music-list.js 生成音乐列表）');
            
            // 扫描音乐文件夹
            const studyFiles = await this.scanMusicFolder('music/学习');
            const restFiles = await this.scanMusicFolder('music/休息');
            
            this.musicPlaylists.study = studyFiles;
            this.musicPlaylists.rest = restFiles;
            
            // 保存到本地存储（包含新的哈希信息）
            this.saveMusicListsToStorage();
            
            // 填充UI
            this.populateMusicLists();
            
            console.log('音乐文件加载完成:', this.musicPlaylists);
            this.showToast(`音乐扫描完成！学习音乐${studyFiles.length}首，休息音乐${restFiles.length}首 🎵`);
        } catch (error) {
            console.error('❌ 音乐文件加载失败:', error);
            console.error('错误堆栈:', error.stack);
            this.showToast('音乐文件加载失败，请检查music文件夹或运行 node generate-music-list.js');
            this.musicPlaylists.study = [];
            this.musicPlaylists.rest = [];
            // 即使出错也要填充UI（显示空列表）
            this.populateMusicLists();
        }
    }
    
    /**
     * 从预生成的music-list.json文件加载音乐列表
     * @returns {Promise<boolean>} 是否成功加载
     */
    async loadMusicListFromJSON() {
        try {
            // 添加时间戳参数防止缓存，并添加随机数确保每次都重新请求
            const timestamp = new Date().getTime();
            const random = Math.random().toString(36).substring(7);
            const response = await fetch(`music-list.json?t=${timestamp}&r=${random}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                console.log(`music-list.json 文件不存在 (状态码: ${response.status})，将使用其他方式加载`);
                return false;
            }
            
            const musicData = await response.json();
            
            // 验证数据格式
            if (!musicData || typeof musicData !== 'object') {
                console.warn('music-list.json 格式不正确:', musicData);
                return false;
            }
            
            // 验证数据结构
            if (!Array.isArray(musicData.study) || !Array.isArray(musicData.rest)) {
                console.warn('music-list.json 数据结构不正确:', {
                    study: Array.isArray(musicData.study),
                    rest: Array.isArray(musicData.rest)
                });
                return false;
            }
            
            // 加载音乐列表
            const studyCount = musicData.study.length;
            const restCount = musicData.rest.length;
            
            console.log(`📥 从JSON文件读取到：学习${studyCount}首，休息${restCount}首`);
            
            this.musicPlaylists.study = musicData.study || [];
            this.musicPlaylists.rest = musicData.rest || [];
            
            // 确保每个文件都有type字段（兼容旧数据）
            this.musicPlaylists.study.forEach(music => {
                if (!music.type) {
                    // 如果没有type字段，根据format或文件扩展名判断
                    const isVideo = music.format === 'mp4' || 
                                   music.format === 'webm' ||
                                   music.file.toLowerCase().endsWith('.mp4') ||
                                   music.file.toLowerCase().endsWith('.webm');
                    music.type = isVideo ? 'video' : 'audio';
                }
            });
            
            this.musicPlaylists.rest.forEach(music => {
                if (!music.type) {
                    const isVideo = music.format === 'mp4' || 
                                   music.format === 'webm' ||
                                   music.file.toLowerCase().endsWith('.mp4') ||
                                   music.file.toLowerCase().endsWith('.webm');
                    music.type = isVideo ? 'video' : 'audio';
                }
            });
            
            // 验证文件是否真的存在（可选，但建议保留作为完整性检查）
            await this.validateMusicFilesExist();
            
            const studyVideos = this.musicPlaylists.study.filter(m => m.type === 'video').length;
            const restVideos = this.musicPlaylists.rest.filter(m => m.type === 'video').length;
            
            console.log(`✅ 从 music-list.json 加载音乐列表：学习${this.musicPlaylists.study.length}首（含${studyVideos}个视频），休息${this.musicPlaylists.rest.length}首（含${restVideos}个视频）`);
            
            if (musicData.generatedAt) {
                console.log(`📅 音乐列表生成时间: ${new Date(musicData.generatedAt).toLocaleString('zh-CN')}`);
                // 保存JSON的生成时间到缓存中
                if (this.saveMusicListsToStorage) {
                    // 临时标记，让saveMusicListsToStorage知道这是从JSON加载的
                    this.jsonGeneratedAt = musicData.generatedAt;
                }
            }
            
            return true;
        } catch (error) {
            // 如果文件不存在或其他错误，静默失败，不抛出错误
            console.error('❌ 无法加载 music-list.json:', error);
            console.error('错误详情:', error.message, error.stack);
            return false;
        }
    }
    
    /**
     * 验证音乐文件是否存在（可选验证，用于检测文件是否被删除）
     */
    async validateMusicFilesExist() {
        // 可选：快速验证几个文件是否存在
        // 这里不做强制验证，因为如果文件不存在，播放时会自动处理错误
        // 如果要做验证，可以抽样检查几个文件
    }
    
    async scanMusicFolder(folderPath) {
        const musicFiles = [];
        
        // 不再使用文件选择器API，因为会弹出文件夹选择对话框
        // 直接使用动态扫描（fallback模式）
        
        // 动态扫描音乐文件
        const fileList = await this.dynamicScanMusicFiles(folderPath);
        
        // 检测每个音乐文件是否存在并获取信息
        let foundCount = 0;
        for (const fileName of fileList) {
            try {
                const filePath = `${folderPath}/${fileName}`;
                const musicInfo = await this.checkMusicFile(filePath, fileName);
                if (musicInfo) {
                    musicFiles.push(musicInfo);
                    foundCount++;
                }
            } catch (error) {
                console.warn(`无法加载音乐文件: ${fileName}`, error);
            }
        }
        
        console.log(`${folderPath} 扫描完成，找到 ${foundCount}/${fileList.length} 个音乐文件`);
        return musicFiles;
    }
    
    async dynamicScanMusicFiles(folderPath) {
        // 动态扫描音乐文件，不依赖硬编码列表
        const musicFiles = [];
        
        // 首先尝试常见的音乐文件命名模式
        const commonPatterns = await this.generateMusicFilePatterns();
        
        // 批量检测文件是否存在
        for (const fileName of commonPatterns) {
            try {
                const filePath = `${folderPath}/${fileName}`;
                if (await this.quickCheckFile(filePath)) {
                    musicFiles.push(fileName);
                }
            } catch (error) {
                // 忽略错误，继续检测下一个
            }
        }
        
        // 如果找到的文件很少，尝试更广泛的扫描
        if (musicFiles.length < 5) {
            const additionalFiles = await this.extensiveMusicScan(folderPath);
            musicFiles.push(...additionalFiles);
        }
        
        // 去重
        return [...new Set(musicFiles)];
    }
    
    async generateMusicFilePatterns() {
        // 生成常见的音乐文件命名模式
        const patterns = [];
        
        // 数字命名模式
        for (let i = 1; i <= 20; i++) {
            patterns.push(`${i}.mp3`);
            patterns.push(`${i.toString().padStart(2, '0')}.mp3`);
        }
        
        // 常见的通用命名
        const genericNames = [
            'music', 'song', 'bgm', 'track', 'audio', '音乐', '歌曲'
        ];
        
        for (const name of genericNames) {
            for (let i = 1; i <= 10; i++) {
                patterns.push(`${name}${i}.mp3`);
                patterns.push(`${name}_${i}.mp3`);
                patterns.push(`${name}-${i}.mp3`);
            }
        }
        
        // 常见歌手和歌曲（保留一些常见的，但不作为主要依赖）
        const popularSongs = [
            '周杰伦 - 七里香.mp3', '周杰伦 - 青花瓷.mp3', '周杰伦 - 晴天.mp3',
            '周杰伦 - 夜曲.mp3', '周杰伦 - 稻香.mp3', '周杰伦 - 告白气球.mp3',
            '林俊杰 - 江南.mp3', '薛之谦 - 演员.mp3', '邓紫棋 - 泡沫.mp3'
        ];
        
        patterns.push(...popularSongs);
        
        return patterns;
    }
    
    async extensiveMusicScan(folderPath) {
        // 更广泛的音乐文件扫描，用于发现更多可能的文件
        const foundFiles = [];
        
        // 尝试更多的文件扩展名
        const extensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];
        
        // 尝试更多的命名模式
        const advancedPatterns = [];
        
        // 扩展数字命名
        for (let i = 1; i <= 50; i++) {
            for (const ext of extensions) {
                advancedPatterns.push(`${i}${ext}`);
                advancedPatterns.push(`${i.toString().padStart(2, '0')}${ext}`);
                advancedPatterns.push(`${i.toString().padStart(3, '0')}${ext}`);
            }
        }
        
        // 尝试字母命名
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        for (const letter of letters) {
            for (const ext of extensions) {
                advancedPatterns.push(`${letter}${ext}`);
                advancedPatterns.push(`${letter.toUpperCase()}${ext}`);
            }
        }
        
        // 尝试常见的中文和英文单词
        const commonWords = [
            '音乐', '歌曲', '背景音乐', '纯音乐', 'music', 'song', 'bgm', 'soundtrack',
            '学习', '休息', 'study', 'rest', 'relax', 'focus', 'chill', 'ambient'
        ];
        
        for (const word of commonWords) {
            for (let i = 1; i <= 10; i++) {
                for (const ext of extensions) {
                    advancedPatterns.push(`${word}${i}${ext}`);
                    advancedPatterns.push(`${word}_${i}${ext}`);
                    advancedPatterns.push(`${word}-${i}${ext}`);
                }
            }
        }
        
        // 批量检测（使用更短的超时时间以提高效率）
        const batchSize = 10; // 每批处理10个文件
        for (let i = 0; i < advancedPatterns.length; i += batchSize) {
            const batch = advancedPatterns.slice(i, i + batchSize);
            const promises = batch.map(async (fileName) => {
                try {
                    const filePath = `${folderPath}/${fileName}`;
                    if (await this.quickCheckFile(filePath)) {
                        return fileName;
                    }
                } catch (error) {
                    // 忽略错误
                }
                return null;
            });
            
            const results = await Promise.all(promises);
            foundFiles.push(...results.filter(file => file !== null));
            
            // 如果已经找到足够多的文件，可以提前结束
            if (foundFiles.length >= 20) {
                break;
            }
        }
        
        return foundFiles;
    }
    
    async quickCheckFile(filePath) {
        return new Promise((resolve) => {
            const audio = new Audio();
            let resolved = false;
            let timeoutId = null;
            
            const resolveOnce = (result) => {
                if (!resolved) {
                    resolved = true;
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    // 清理音频对象
                    try {
                        audio.src = '';
                        audio.load();
                    } catch (e) {
                        // 忽略清理错误
                    }
                    resolve(result);
                }
            };
            
            // 监听多个事件以提高检测准确性
            audio.addEventListener('loadstart', () => resolveOnce(true));
            audio.addEventListener('canplay', () => resolveOnce(true));
            audio.addEventListener('loadeddata', () => resolveOnce(true));
            
            // 错误处理
            audio.addEventListener('error', (e) => {
                console.debug(`文件检测失败: ${filePath}`, e.error || e);
                resolveOnce(false);
            });
            
            audio.addEventListener('abort', () => resolveOnce(false));
            audio.addEventListener('stalled', () => resolveOnce(false));
            
            // 设置超时（缩短到500ms以提高扫描速度）
            timeoutId = setTimeout(() => {
                console.debug(`文件检测超时: ${filePath}`);
                resolveOnce(false);
            }, 500);
            
            try {
                audio.src = filePath;
                audio.load();
            } catch (error) {
                console.debug(`设置音频源失败: ${filePath}`, error);
                resolveOnce(false);
            }
        });
    }
    
    async scanFolderWithAPI(folderPath) {
        // 现代浏览器的文件夹选择API
        try {
            const dirHandle = await window.showDirectoryPicker();
            const musicFiles = [];
            
            for await (const [name, handle] of dirHandle.entries()) {
                if (handle.kind === 'file' && name.toLowerCase().endsWith('.mp3')) {
                    const file = await handle.getFile();
                    const url = URL.createObjectURL(file);
                    
                    musicFiles.push({
                        name: name.replace('.mp3', ''),
                        file: url,
                        duration: '未知',
                        audioElement: null
                    });
                }
            }
            
            return musicFiles;
        } catch (error) {
            throw new Error('用户取消了文件夹选择');
        }
    }
    
    async checkMusicFile(filePath, fileName) {
        return new Promise((resolve) => {
            // 检查是否是视频文件
            const isVideo = fileName.toLowerCase().endsWith('.mp4') || 
                           fileName.toLowerCase().endsWith('.webm') ||
                           fileName.toLowerCase().endsWith('.ogg');
            
            if (isVideo) {
                // 视频文件：使用Video元素检测
                const video = document.createElement('video');
                let resolved = false;
                let timeoutId = null;
                
                const resolveOnce = (result) => {
                    if (!resolved) {
                        resolved = true;
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                        }
                        try {
                            video.src = '';
                            video.load();
                        } catch (e) {
                            // 忽略清理错误
                        }
                        resolve(result);
                    }
                };
                
                video.addEventListener('loadedmetadata', () => {
                    try {
                        const duration = isFinite(video.duration) ? this.formatTime(video.duration) : '未知';
                        const name = fileName.replace(/\.(mp4|webm|ogg)$/i, '');
                        
                        resolveOnce({
                            name: name,
                            file: filePath,
                            duration: duration,
                            audioElement: null,
                            fileSize: null,
                            format: fileName.split('.').pop()?.toLowerCase() || 'unknown',
                            type: 'video'
                        });
                    } catch (error) {
                        console.warn(`处理视频文件元数据失败: ${fileName}`, error);
                        resolveOnce(null);
                    }
                });
                
                video.addEventListener('canplay', () => {
                    if (!resolved) {
                        setTimeout(() => {
                            if (!resolved) {
                                const name = fileName.replace(/\.(mp4|webm|ogg)$/i, '');
                                resolveOnce({
                                    name: name,
                                    file: filePath,
                                    duration: '未知',
                                    audioElement: null,
                                    fileSize: null,
                                    format: fileName.split('.').pop()?.toLowerCase() || 'unknown',
                                    type: 'video'
                                });
                            }
                        }, 100);
                    }
                });
                
                video.addEventListener('error', () => {
                    console.warn(`视频文件加载失败: ${fileName}`);
                    resolveOnce(null);
                });
                
                timeoutId = setTimeout(() => {
                    console.warn(`视频文件加载超时: ${fileName}`);
                    resolveOnce(null);
                }, 5000);
                
                try {
                    video.preload = 'metadata';
                    video.src = filePath;
                    video.load();
                } catch (error) {
                    console.warn(`设置视频文件源失败: ${fileName}`, error);
                    resolveOnce(null);
                }
                
                return;
            }
            
            // 音频文件：使用原有的Audio检测逻辑
            const audio = new Audio();
            let resolved = false;
            let timeoutId = null;
            
            const resolveOnce = (result) => {
                if (!resolved) {
                    resolved = true;
                    if (timeoutId) {
                        clearTimeout(timeoutId);
                    }
                    // 清理音频对象
                    try {
                        audio.src = '';
                        audio.load();
                    } catch (e) {
                        // 忽略清理错误
                    }
                    resolve(result);
                }
            };
            
            // 成功加载元数据
            audio.addEventListener('loadedmetadata', () => {
                try {
                    const duration = isFinite(audio.duration) ? this.formatTime(audio.duration) : '未知';
                    const name = fileName.replace(/\.(mp3|wav|m4a|aac|ogg|flac)$/i, '');
                    
                    resolveOnce({
                        name: name,
                        file: filePath,
                        duration: duration,
                        audioElement: null, // 用于后续播放
                        fileSize: null, // 可以后续扩展
                        format: fileName.split('.').pop()?.toLowerCase() || 'unknown',
                        type: 'audio'
                    });
                } catch (error) {
                    console.warn(`处理音乐文件元数据失败: ${fileName}`, error);
                    resolveOnce(null);
                }
            });
            
            // 如果能播放但没有元数据，也认为是有效文件
            audio.addEventListener('canplay', () => {
                if (!resolved) {
                    setTimeout(() => {
                        if (!resolved) {
                            const name = fileName.replace(/\.(mp3|wav|m4a|aac|ogg|flac)$/i, '');
                            resolveOnce({
                                name: name,
                                file: filePath,
                                duration: '未知',
                                audioElement: null,
                                fileSize: null,
                                format: fileName.split('.').pop()?.toLowerCase() || 'unknown',
                                type: 'audio'
                            });
                        }
                    }, 100); // 给元数据加载一点时间
                }
            });
            
            // 错误处理
            audio.addEventListener('error', (e) => {
                const errorType = e.error?.code || 'unknown';
                const errorMessage = e.error?.message || '未知错误';
                console.warn(`音乐文件加载失败: ${fileName}, 错误类型: ${errorType}, 错误信息: ${errorMessage}`);
                resolveOnce(null);
            });
            
            audio.addEventListener('abort', () => {
                console.warn(`音乐文件加载被中止: ${fileName}`);
                resolveOnce(null);
            });
            
            // 设置超时（增加到5秒，给网络文件更多时间）
            timeoutId = setTimeout(() => {
                console.warn(`音乐文件加载超时: ${fileName} (5秒)`);
                resolveOnce(null);
            }, 5000);
            
            try {
                audio.preload = 'metadata'; // 只预加载元数据
                audio.src = filePath;
                audio.load();
            } catch (error) {
                console.warn(`设置音乐文件源失败: ${fileName}`, error);
                resolveOnce(null);
            }
        });
    }
    
    populateMusicLists() {
        const studyCount = this.musicPlaylists.study ? this.musicPlaylists.study.length : 0;
        const restCount = this.musicPlaylists.rest ? this.musicPlaylists.rest.length : 0;
        
        console.log(`🔄 开始填充音乐列表UI：学习${studyCount}首，休息${restCount}首`);
        
        // 填充学习音乐列表
        if (this.elements.studyMusicList) {
            this.elements.studyMusicList.innerHTML = '';
            if (this.musicPlaylists.study && this.musicPlaylists.study.length > 0) {
                this.musicPlaylists.study.forEach((music, index) => {
                    const item = this.createMusicItem(music, index, 'study');
                    this.elements.studyMusicList.appendChild(item);
                });
                console.log(`✅ 学习音乐列表已填充：${this.musicPlaylists.study.length}首`);
            } else {
                console.warn('⚠️ 学习音乐列表为空');
            }
        } else {
            console.warn('⚠️ studyMusicList 元素不存在');
        }
        
        // 填充休息音乐列表
        if (this.elements.restMusicList) {
            this.elements.restMusicList.innerHTML = '';
            if (this.musicPlaylists.rest && this.musicPlaylists.rest.length > 0) {
                this.musicPlaylists.rest.forEach((music, index) => {
                    const item = this.createMusicItem(music, index, 'rest');
                    this.elements.restMusicList.appendChild(item);
                });
                console.log(`✅ 休息音乐列表已填充：${this.musicPlaylists.rest.length}首`);
            } else {
                console.warn('⚠️ 休息音乐列表为空');
            }
        } else {
            console.warn('⚠️ restMusicList 元素不存在');
        }
    }
    
    createMusicItem(music, index, category) {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.dataset.index = index;
        item.dataset.category = category;
        
        // 根据文件类型显示不同的图标
        const isVideo = music.type === 'video' || music.format === 'mp4' || music.file.toLowerCase().endsWith('.mp4');
        const icon = isVideo ? '📹' : '🎵';
        const typeLabel = isVideo ? '视频' : '音频';
        
        item.innerHTML = `
            <span class="music-item-icon">${icon}</span>
            <div class="music-item-info">
                <div class="music-item-name">${music.name}</div>
                <div class="music-item-duration">${music.duration} <span style="font-size: 0.7em; opacity: 0.7;">${typeLabel}</span></div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectMusic(category, index);
        });
        
        return item;
    }
    
    selectMusic(category, index) {
        // 移除其他选中状态
        document.querySelectorAll('.music-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 选中当前音乐
        const selectedItem = document.querySelector(`[data-category="${category}"][data-index="${index}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // 保存选择
        if (category === 'study') {
            this.selectedStudyMusic = this.musicPlaylists.study[index];
        } else {
            this.selectedRestMusic = this.musicPlaylists.rest[index];
        }
        
        // 保存到 localStorage，用于音乐按钮记忆
        localStorage.setItem('lastMusicCategory', category);
        localStorage.setItem('lastMusicIndex', index);
        
        this.showToast(`已选择${category === 'study' ? '学习' : '休息'}音乐: ${this.musicPlaylists[category][index].name}`);
        
        // 智能播放逻辑：根据专注模式状态决定是否立即播放
        this.handleSmartMusicPlay(category);
    }
    
    // 智能音乐播放处理
    handleSmartMusicPlay(category) {
        const music = category === 'study' ? this.selectedStudyMusic : this.selectedRestMusic;
        
        if (!music) return;
        
        // 新逻辑：只在特定条件下自动播放
        const shouldPlayImmediately = this.shouldPlayMusicImmediately();
        
        if (shouldPlayImmediately) {
            // 判断连续播放模式
            let continuousPlay = false;
            if (category === 'study') {
                // 学习模式：倒计时已结束才会立即播放，启用连续播放
                continuousPlay = true;
                console.log('📚 学习模式：倒计时已结束，启用连续播放');
            }
            
            // 立即打开播放器并自动播放
            setTimeout(() => {
                this.openVideoPlayer(music, category, true, continuousPlay);
            }, 100); // 短暂延迟确保UI更新完成
        }
        // 否则只选择，不播放（用户需要手动点击播放按钮）
    }
    
    // 判断是否应该立即播放音乐
    shouldPlayMusicImmediately() {
        const now = new Date().getTime();
        
        // 休息模式：选择音乐时不立即播放，只在点击开始休息后播放
        if (this.currentMode === 'rest') {
            return false;
        }
        
        // 专注模式的逻辑
        if (this.currentMode === 'focus') {
            // 获取当前设置的目标时间
            const dateValue = this.elements.targetDate.value;
            const timeValue = this.elements.targetTime.value;
            
            if (dateValue && timeValue) {
                // 构建目标时间
                const targetDateTime = new Date(`${dateValue}T${timeValue}`);
                const targetTime = targetDateTime.getTime();
                
                // 只有当目标时间已经过去（剩余时间 <= 0）时才立即播放
                return now >= targetTime;
            }
            
            // 如果没有设置目标时间，不立即播放
            return false;
        }
        
        // 默认情况：不立即播放
        return false;
    }
    
    showMusicPlayer() {
        // 旧的音乐播放器已移除，此方法保留为空以避免错误
        console.log('showMusicPlayer: 旧方法，已废弃');
    }
    
    hideMusicPlayer() {
        // 旧的音乐播放器已移除，此方法保留为空以避免错误
        console.log('hideMusicPlayer: 旧方法，已废弃');
    }
    
    async playMusic(category) {
        const music = category === 'study' ? this.selectedStudyMusic : this.selectedRestMusic;
        
        if (!music) {
            this.showToast('请先选择音乐');
            return;
        }
        
        // 判断是否启用连续播放
        // 学习模式：如果未开始倒计时或剩余时间不为0，启用连续播放
        // 休息模式：不在这里播放（在startRestCountdown中播放）
        let continuousPlay = false;
        if (category === 'study') {
            // 学习模式：检查是否在倒计时中
            if (!this.isCountdownActive) {
                // 未开始倒计时，启用连续播放
                continuousPlay = true;
                console.log('📚 学习模式：未开始倒计时，启用连续播放');
            } else {
                // 已开始倒计时，不启用连续播放
                continuousPlay = false;
                console.log('📚 学习模式：倒计时中，不启用连续播放');
            }
        }
        
        // 所有音乐（包括音频和视频）都使用视频播放器界面
        this.openVideoPlayer(music, category, true, continuousPlay);
    }
    
    async playMusicAuto(category) {
        // 自动播放音乐（用于专注完成后或休息开始时）
        const music = category === 'study' ? this.selectedStudyMusic : this.selectedRestMusic;
        
        if (!music) {
            console.log(`没有选择${category === 'study' ? '学习' : '休息'}音乐，跳过自动播放`);
            return;
        }
        
        // 判断连续播放模式
        let continuousPlay = false;
        if (category === 'study') {
            // 学习倒计时结束：不启用连续播放（只播放一次）
            continuousPlay = false;
            console.log('📚 学习倒计时结束：单曲播放');
        } else if (category === 'rest') {
            // 休息模式：启用连续播放
            continuousPlay = true;
            console.log('🌸 休息模式：启用连续播放');
        }
        
        // 所有音乐（包括音频和视频）都使用视频播放器界面并自动播放
        this.openVideoPlayer(music, category, true, continuousPlay);
    }
    
    async playMusicWithRetry(music, category, isAuto = false, retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = 1000; // 1秒延迟
        
        try {
            // 验证音乐文件是否存在和可访问
            const isValid = await this.validateMusicFile(music);
            if (!isValid) {
                throw new Error('音乐文件无效或不可访问');
            }
            
            // 设置音乐源
            this.musicAudio.src = music.file;
            this.musicAudio.volume = this.audioVolume;
            
            // 等待音频加载
            await this.waitForAudioLoad();
            
            // 尝试播放
            await this.musicAudio.play();
            
            // 播放成功
            this.isMusicPlaying = true;
            this.updateMusicUI();
            this.updatePlayPauseButton();
            
            if (isAuto) {
                this.showMusicPlayer(); // 显示音乐播放器
                const categoryText = category === 'study' ? '奖励' : '休息';
                this.showToast(`🎵 ${categoryText}音乐开始播放: ${music.name}`);
                console.log('自动播放音乐成功:', music.name);
            } else {
                this.showToast(`🎵 正在播放: ${music.name}`);
                console.log('音乐播放成功:', music.name);
            }
            
        } catch (error) {
            console.error(`音乐播放失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, error);
            this.isMusicPlaying = false;
            this.updatePlayPauseButton();
            
            // 如果还有重试次数，则重试
            if (retryCount < maxRetries) {
                console.log(`${retryDelay}ms后重试播放...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return this.playMusicWithRetry(music, category, isAuto, retryCount + 1);
            }
            
            // 所有重试都失败，显示详细错误信息
            this.handlePlaybackError(error, music, isAuto, category);
        }
    }
    
    async validateMusicFile(music) {
        return new Promise((resolve) => {
            const testAudio = new Audio();
            const timeout = setTimeout(() => {
                testAudio.src = '';
                resolve(false);
            }, 3000);
            
            testAudio.addEventListener('canplay', () => {
                clearTimeout(timeout);
                testAudio.src = '';
                resolve(true);
            });
            
            testAudio.addEventListener('error', () => {
                clearTimeout(timeout);
                testAudio.src = '';
                resolve(false);
            });
            
            try {
                testAudio.src = music.file;
            } catch (e) {
                clearTimeout(timeout);
                resolve(false);
            }
        });
    }
    
    async waitForAudioLoad() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('音频加载超时'));
            }, 5000);
            
            const onCanPlay = () => {
                clearTimeout(timeout);
                this.musicAudio.removeEventListener('canplay', onCanPlay);
                this.musicAudio.removeEventListener('error', onError);
                resolve();
            };
            
            const onError = (e) => {
                clearTimeout(timeout);
                this.musicAudio.removeEventListener('canplay', onCanPlay);
                this.musicAudio.removeEventListener('error', onError);
                reject(new Error(`音频加载失败: ${e.message || '未知错误'}`));
            };
            
            this.musicAudio.addEventListener('canplay', onCanPlay);
            this.musicAudio.addEventListener('error', onError);
            
            // 如果音频已经可以播放，直接resolve
            if (this.musicAudio.readyState >= 3) {
                clearTimeout(timeout);
                resolve();
            }
        });
    }
    
    handlePlaybackError(error, music, isAuto, category) {
        let errorMessage = '';
        let toastType = 'warning';
        
        switch (error.name) {
            case 'NotAllowedError':
                if (isAuto) {
                    errorMessage = '浏览器阻止了自动播放，请手动点击播放按钮 🎵';
                    toastType = 'info';
                } else {
                    errorMessage = '音乐播放被阻止，请允许自动播放或检查浏览器设置';
                }
                break;
            case 'NotSupportedError':
                errorMessage = `音乐格式不支持: ${music.name}，请检查文件格式`;
                break;
            case 'AbortError':
                errorMessage = '音乐播放被中断，请重试';
                break;
            default:
                if (error.message.includes('无效') || error.message.includes('不可访问')) {
                    errorMessage = `音乐文件损坏或不存在: ${music.name}`;
                    // 尝试从播放列表中移除无效文件
                    this.removeInvalidMusic(music, category);
                } else if (error.message.includes('超时')) {
                    errorMessage = `音乐加载超时: ${music.name}，请检查网络连接`;
                } else {
                    errorMessage = `音乐播放失败: ${music.name} (${error.message || '未知错误'})`;
                }
                break;
        }
        
        this.showToast(errorMessage, toastType);
        console.error('播放错误详情:', {
            music: music.name,
            error: error.name,
            message: error.message,
            isAuto,
            category
        });
    }
    
    removeInvalidMusic(music, category) {
        try {
            const playlist = this.musicPlaylists[category];
            const index = playlist.findIndex(m => m.file === music.file);
            if (index !== -1) {
                playlist.splice(index, 1);
                console.log(`已从${category}播放列表中移除无效音乐:`, music.name);
                
                // 更新本地存储
                this.saveMusicListsToStorage();
                
                // 更新UI
                this.populateMusicList(category);
                
                // 如果移除的是当前选中的音乐，清除选择
                if ((category === 'study' && this.selectedStudyMusic === music) ||
                    (category === 'rest' && this.selectedRestMusic === music)) {
                    if (category === 'study') {
                        this.selectedStudyMusic = null;
                    } else {
                        this.selectedRestMusic = null;
                    }
                    this.updateMusicUI();
                }
                
                this.showToast(`已移除无效音乐文件: ${music.name}`, 'info');
            }
        } catch (e) {
            console.error('移除无效音乐时出错:', e);
        }
    }
    
    canPlayMusic(category, autoPlay = false) {
        // 如果是自动播放，跳过限制检查
        if (autoPlay) {
            return true;
        }
        
        if (this.currentMode === 'focus') {
            if (category === 'study' && this.isCountdownActive) {
                this.showToast('专注时间请不要听音乐！保持专注 🎯', 'warning');
                return false;
            }
            if (category === 'rest') {
                this.showToast('专注模式不要听休息音乐！保持专注 🎯', 'warning');
                return false;
            }
        }
        
        if (this.currentMode === 'rest') {
            if (category === 'study') {
                this.showToast('休息时间不要听学习音乐！好好放松 🌸', 'warning');
                return false;
            }
        }
        
        return true;
    }
    
    stopMusic() {
        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio.currentTime = 0;
            this.isMusicPlaying = false;
            this.updatePlayPauseButton();
        }
    }
    
    toggleMusic() {
        // 使用新的视频播放器控制
        this.toggleVideoPlayPause();
    }
    
    nextMusic() {
        // 使用新的视频播放器控制
        this.nextVideo();
    }
    
    prevMusic() {
        // 使用新的视频播放器控制
        this.prevVideo();
    }
    
    updateMusicUI() {
        if (this.currentPlaylist.length > 0 && this.currentMusicIndex >= 0) {
            const currentMusic = this.currentPlaylist[this.currentMusicIndex];
            this.elements.currentMusicTitle.textContent = currentMusic.name;
            
            // 确定音乐分类
            const category = this.musicPlaylists.study.includes(currentMusic) ? '学习音乐' : '休息音乐';
            this.elements.currentMusicCategory.textContent = category;
        }
    }
    
    updatePlayPauseButton() {
        // 同步旧的音乐播放器按钮状态
        if (this.elements.playPauseBtn) {
            const icon = this.elements.playPauseBtn.querySelector('.music-icon');
            if (icon) {
                icon.textContent = this.isVideoPlaying ? '⏸️' : '▶️';
            }
        }
    }
    
    updateMusicProgress() {
        if (!this.musicAudio) return;
        
        const progress = (this.musicAudio.currentTime / this.musicAudio.duration) * 100;
        this.elements.musicProgressFill.style.width = progress + '%';
    }
    
    updateMusicTime() {
        if (!this.musicAudio) return;
        
        this.elements.currentTime.textContent = this.formatTime(this.musicAudio.currentTime);
        this.elements.totalTime.textContent = this.formatTime(this.musicAudio.duration);
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // ================================
    // 视频播放器功能
    // ================================
    
    /**
     * 打开视频播放器
     * @param {Object} music - 视频文件信息
     * @param {string} category - 类别（study/rest）
     * @param {boolean} autoPlay - 是否自动播放
     * @param {boolean} continuousPlay - 是否启用连续播放
     */
    openVideoPlayer(music, category, autoPlay = false, continuousPlay = false) {
        if (!this.elements.videoPlayerModal || !this.elements.videoPlayer) {
            console.error('视频播放器元素未找到');
            return;
        }
        
        // 设置当前音乐信息
        this.currentVideoMusic = music;
        this.currentVideoCategory = category;
        this.currentVideoPlaylist = this.musicPlaylists[category];
        this.currentVideoIndex = this.currentVideoPlaylist.indexOf(music);
        
        // 设置连续播放标志
        this.enableContinuousPlay = continuousPlay;
        console.log(`🔄 连续播放模式: ${continuousPlay ? '开启' : '关闭'}`);
        
        // 判断是否为视频文件
        const isVideo = music.type === 'video' || music.format === 'mp4' || 
                       music.file.toLowerCase().endsWith('.mp4') ||
                       music.file.toLowerCase().endsWith('.webm');
        
        // 更新UI
        this.elements.videoPlayerName.textContent = music.name;
        this.elements.videoPlayerCategory.textContent = category === 'study' ? '学习音乐' : '休息音乐';
        this.elements.videoPlayerTitle.textContent = isVideo ? '视频播放' : '音频播放';
        
        // 设置媒体源
        this.elements.videoPlayer.src = music.file;
        
        // 如果是纯音频，添加特殊样式
        if (!isVideo) {
            this.elements.videoPlayer.style.height = '80px';
            this.elements.videoPlayer.style.backgroundColor = 'var(--bg-primary)';
        } else {
            this.elements.videoPlayer.style.height = '';
            this.elements.videoPlayer.style.backgroundColor = '';
        }
        
        // 显示播放器
        this.elements.videoPlayerModal.classList.remove('hidden');
        
        // 自动播放（如果设置）
        if (autoPlay) {
            this.elements.videoPlayer.play().then(() => {
                this.isVideoPlaying = true;
                this.updateVideoPlayPauseButton();
                this.updateMinimizedPlayPauseButton();
                this.updatePlayPauseButton(); // 同步旧的音乐播放器按钮
                console.log('✅ 自动播放成功');
            }).catch(error => {
                console.error('❌ 自动播放失败:', error);
                this.showToast('自动播放失败，请手动点击播放');
            });
        } else {
            // 等待用户点击播放
            this.isVideoPlaying = false;
            this.updateVideoPlayPauseButton();
            this.updateMinimizedPlayPauseButton();
            this.updatePlayPauseButton(); // 同步旧的音乐播放器按钮
        }
        
        const mediaType = isVideo ? '视频' : '音频';
        this.showToast(`🎵 ${mediaType}播放器已打开: ${music.name}`);
    }
    
    /**
     * 最小化视频播放器
     */
    minimizeVideoPlayer() {
        if (!this.elements.videoPlayerModal || !this.elements.videoPlayerMinimized) return;
        
        // 隐藏主播放器
        this.elements.videoPlayerModal.classList.add('hidden');
        
        // 显示最小化播放器
        this.elements.videoPlayerMinimized.classList.remove('hidden');
        
        // 同步信息
        if (this.currentVideoMusic) {
            this.elements.minimizedPlayerName.textContent = this.currentVideoMusic.name;
            this.elements.minimizedPlayerCategory.textContent = 
                this.currentVideoCategory === 'study' ? '学习音乐' : '休息音乐';
        }
        
        // 同步播放状态按钮
        this.updateMinimizedPlayPauseButton();
        
        this.showToast('📦 播放器已最小化');
    }
    
    /**
     * 还原视频播放器
     */
    restoreVideoPlayer() {
        if (!this.elements.videoPlayerModal || !this.elements.videoPlayerMinimized) return;
        
        // 隐藏最小化播放器
        this.elements.videoPlayerMinimized.classList.add('hidden');
        
        // 显示主播放器
        this.elements.videoPlayerModal.classList.remove('hidden');
        
        this.showToast('📺 播放器已还原');
    }
    
    /**
     * 关闭视频播放器（完全关闭）
     */
    closeVideoPlayer() {
        if (!this.elements.videoPlayerModal || !this.elements.videoPlayer) return;
        
        // 暂停视频
        this.elements.videoPlayer.pause();
        this.isVideoPlaying = false;
        
        // 隐藏所有播放器
        this.elements.videoPlayerModal.classList.add('hidden');
        if (this.elements.videoPlayerMinimized) {
            this.elements.videoPlayerMinimized.classList.add('hidden');
        }
        
        // 清除视频源（释放资源）
        this.elements.videoPlayer.src = '';
        
        // 清除状态
        this.currentVideoMusic = null;
        this.currentVideoPlaylist = null;
        this.currentVideoIndex = -1;
        this.currentVideoCategory = null;
        
        // 重置音乐按钮图标
        if (this.elements.musicToggleIcon) {
            this.elements.musicToggleIcon.textContent = '🎵';
        }
        
        this.showToast('⏹️ 播放器已关闭');
    }
    
    /**
     * 设置视频播放器事件监听（只在初始化时调用一次）
     */
    setupVideoPlayerEvents() {
        // 如果已经设置过事件监听，不再重复设置
        if (this.videoEventsSetup) {
            return;
        }
        
        const video = this.elements.videoPlayer;
        
        // 播放/暂停事件
        video.addEventListener('play', () => {
            this.isVideoPlaying = true;
            this.updateVideoPlayPauseButton();
            this.updateMinimizedPlayPauseButton();
            this.updatePlayPauseButton(); // 同步旧的音乐播放器按钮
            console.log('🎵 视频开始播放');
        });
        
        video.addEventListener('pause', () => {
            this.isVideoPlaying = false;
            this.updateVideoPlayPauseButton();
            this.updateMinimizedPlayPauseButton();
            this.updatePlayPauseButton(); // 同步旧的音乐播放器按钮
            console.log('⏸️ 视频已暂停');
        });
        
        video.addEventListener('ended', () => {
            console.log('✅ 视频播放完成');
            // 只有启用连续播放时才自动播放下一首
            if (this.enableContinuousPlay) {
                console.log('🔄 连续播放：自动播放下一首');
                this.nextVideo(true);
            } else {
                console.log('⏹️ 单曲播放：播放完成，不自动下一首');
                this.isVideoPlaying = false;
                this.updateVideoPlayPauseButton();
                this.updateMinimizedPlayPauseButton();
                this.updatePlayPauseButton();
            }
        });
        
        video.addEventListener('error', (e) => {
            console.error('❌ 视频播放错误:', e);
            this.showToast('视频播放失败，请检查文件是否存在');
        });
        
        // 标记事件已设置
        this.videoEventsSetup = true;
    }
    
    /**
     * 切换视频播放/暂停
     */
    toggleVideoPlayPause() {
        const video = this.elements.videoPlayer;
        
        if (!video || !video.src) {
            this.showToast('请先选择视频');
            return;
        }
        
        if (this.isVideoPlaying) {
            video.pause();
        } else {
            video.play().catch(error => {
                console.error('视频播放失败:', error);
                this.showToast('视频播放失败，请检查文件');
            });
        }
    }
    
    /**
     * 播放下一首媒体文件
     * @param {boolean} autoPlay - 是否自动播放（用于连续播放）
     */
    nextVideo(autoPlay = false) {
        if (!this.currentVideoPlaylist || this.currentVideoPlaylist.length === 0) return;
        
        // 找到下一个媒体文件
        let nextIndex = (this.currentVideoIndex + 1) % this.currentVideoPlaylist.length;
        const nextMusic = this.currentVideoPlaylist[nextIndex];
        
        if (!nextMusic) {
            this.showToast('没有更多音乐了');
            return;
        }
        
        // 判断是否为视频文件
        const isVideo = nextMusic.type === 'video' || nextMusic.format === 'mp4' || 
                       nextMusic.file.toLowerCase().endsWith('.mp4') ||
                       nextMusic.file.toLowerCase().endsWith('.webm');
        
        // 更新状态
        this.currentVideoIndex = nextIndex;
        this.currentVideoMusic = nextMusic;
        
        // 更新UI
        this.elements.videoPlayer.src = nextMusic.file;
        this.elements.videoPlayerName.textContent = nextMusic.name;
        this.elements.videoPlayerTitle.textContent = isVideo ? '视频播放' : '音频播放';
        
        // 更新最小化播放器信息
        if (this.elements.minimizedPlayerName) {
            this.elements.minimizedPlayerName.textContent = nextMusic.name;
        }
        
        // 调整样式
        if (!isVideo) {
            this.elements.videoPlayer.style.height = '80px';
            this.elements.videoPlayer.style.backgroundColor = 'var(--bg-primary)';
        } else {
            this.elements.videoPlayer.style.height = '';
            this.elements.videoPlayer.style.backgroundColor = '';
        }
        
        // 自动播放逻辑：如果是连续播放或者当前正在播放
        if (autoPlay || this.isVideoPlaying) {
            this.elements.videoPlayer.play().then(() => {
                this.isVideoPlaying = true;
                this.updateVideoPlayPauseButton();
                this.updateMinimizedPlayPauseButton();
                this.updatePlayPauseButton();
                console.log('🎵 自动播放下一首');
            }).catch(error => {
                console.error('自动播放失败:', error);
            });
        }
        
        const mediaType = isVideo ? '视频' : '音频';
        this.showToast(`⏭️ 下一首${mediaType}: ${nextMusic.name}`);
    }
    
    /**
     * 播放上一首媒体文件
     * @param {boolean} autoPlay - 是否自动播放
     */
    prevVideo(autoPlay = false) {
        if (!this.currentVideoPlaylist || this.currentVideoPlaylist.length === 0) return;
        
        // 找到上一个媒体文件
        let prevIndex = this.currentVideoIndex === 0 ? 
            this.currentVideoPlaylist.length - 1 : this.currentVideoIndex - 1;
        const prevMusic = this.currentVideoPlaylist[prevIndex];
        
        if (!prevMusic) {
            this.showToast('没有更多音乐了');
            return;
        }
        
        // 判断是否为视频文件
        const isVideo = prevMusic.type === 'video' || prevMusic.format === 'mp4' || 
                       prevMusic.file.toLowerCase().endsWith('.mp4') ||
                       prevMusic.file.toLowerCase().endsWith('.webm');
        
        // 更新状态
        this.currentVideoIndex = prevIndex;
        this.currentVideoMusic = prevMusic;
        
        // 更新UI
        this.elements.videoPlayer.src = prevMusic.file;
        this.elements.videoPlayerName.textContent = prevMusic.name;
        this.elements.videoPlayerTitle.textContent = isVideo ? '视频播放' : '音频播放';
        
        // 更新最小化播放器信息
        if (this.elements.minimizedPlayerName) {
            this.elements.minimizedPlayerName.textContent = prevMusic.name;
        }
        
        // 调整样式
        if (!isVideo) {
            this.elements.videoPlayer.style.height = '80px';
            this.elements.videoPlayer.style.backgroundColor = 'var(--bg-primary)';
        } else {
            this.elements.videoPlayer.style.height = '';
            this.elements.videoPlayer.style.backgroundColor = '';
        }
        
        // 自动播放逻辑：如果是连续播放或者当前正在播放
        if (autoPlay || this.isVideoPlaying) {
            this.elements.videoPlayer.play().then(() => {
                this.isVideoPlaying = true;
                this.updateVideoPlayPauseButton();
                this.updateMinimizedPlayPauseButton();
                this.updatePlayPauseButton();
                console.log('🎵 自动播放上一首');
            }).catch(error => {
                console.error('自动播放失败:', error);
            });
        }
        
        const mediaType = isVideo ? '视频' : '音频';
        this.showToast(`⏮️ 上一首${mediaType}: ${prevMusic.name}`);
    }
    
    /**
     * 切换全屏
     */
    toggleVideoFullscreen() {
        const video = this.elements.videoPlayer;
        
        if (!video) return;
        
        if (!document.fullscreenElement) {
            // 进入全屏
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        } else {
            // 退出全屏
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    /**
     * 更新视频播放/暂停按钮（已移除自定义按钮，使用原生控制条）
     */
    updateVideoPlayPauseButton() {
        // 不再需要更新自定义按钮，使用原生控制条
        return;
    }
    
    /**
     * 更新最小化播放器的播放/暂停按钮
     */
    updateMinimizedPlayPauseButton() {
        if (!this.elements.minimizedPlayPauseBtn) return;
        
        this.elements.minimizedPlayPauseBtn.textContent = this.isVideoPlaying ? '⏸️' : '▶️';
    }
    
    async refreshMusicList(category) {
        try {
            // 显示刷新动画
            const btnId = category === 'study' ? 'refreshStudyMusic' : 'refreshRestMusic';
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.style.transform = 'rotate(360deg)';
            }
            
            this.showToast(`正在刷新${category === 'study' ? '学习' : '休息'}音乐列表...`);
            
            // 统一逻辑：清除缓存，重新读取JSON（如果存在）
            this.clearMusicStorage();
            
            // 清空当前音乐列表
            this.musicPlaylists.study = [];
            this.musicPlaylists.rest = [];
            
            // 重新加载音乐文件（会优先读取JSON）
            await this.loadMusicFiles();
            
            // 重新填充对应的音乐列表UI
            if (category === 'study' && this.elements.studyMusicList) {
                this.elements.studyMusicList.innerHTML = '';
                this.musicPlaylists.study.forEach((music, index) => {
                    const item = this.createMusicItem(music, index, 'study');
                    this.elements.studyMusicList.appendChild(item);
                });
            } else if (category === 'rest' && this.elements.restMusicList) {
                this.elements.restMusicList.innerHTML = '';
                this.musicPlaylists.rest.forEach((music, index) => {
                    const item = this.createMusicItem(music, index, 'rest');
                    this.elements.restMusicList.appendChild(item);
                });
            }
            
            const count = this.musicPlaylists[category].length;
            const videoCount = this.musicPlaylists[category].filter(m => m.type === 'video' || m.format === 'mp4').length;
            
            let message = `✅ ${category === 'study' ? '学习' : '休息'}音乐列表已更新！共${count}首`;
            if (videoCount > 0) {
                message += `（含${videoCount}个视频）`;
            }
            message += ' 🎵';
            
            this.showToast(message);
            
            // 重置按钮动画
            if (btn) {
                setTimeout(() => {
                    btn.style.transform = '';
                }, 300);
            }
            
        } catch (error) {
            console.error('刷新音乐列表失败:', error);
            this.showToast('刷新失败，请检查music文件夹或运行 node generate-music-list.js');
        }
    }
    
    // 已移除addMusicFileManually方法 - 由于Web安全限制，无法直接复制文件到本地文件夹
    // 用户需要手动将音乐文件放入对应的music文件夹，然后点击刷新按钮
    
    // ================================
    // 音乐搜索功能
    // ================================
    
    searchMusic(category, searchTerm) {
        const musicList = this.musicPlaylists[category];
        const searchContainer = category === 'study' ? 
            this.elements.studyMusicList : this.elements.restMusicList;
        const noResultsElement = category === 'study' ? 
            this.elements.studyMusicNoResults : this.elements.restMusicNoResults;
        
        // 保存搜索状态
        this.musicSearchStates[category].searchTerm = searchTerm;
        
        // 获取所有音乐项
        const musicItems = searchContainer.querySelectorAll('.music-item');
        let visibleCount = 0;
        
        if (!searchTerm.trim()) {
            // 如果搜索词为空，显示所有项目
            musicItems.forEach(item => {
                item.classList.remove('hidden');
                visibleCount++;
            });
            noResultsElement.classList.remove('visible');
        } else {
            // 过滤音乐项
            musicItems.forEach((item, index) => {
                const music = musicList[index];
                if (music && music.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    item.classList.remove('hidden');
                    visibleCount++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // 显示或隐藏"无结果"提示
            if (visibleCount === 0) {
                noResultsElement.classList.add('visible');
            } else {
                noResultsElement.classList.remove('visible');
            }
        }
        
        // 更新清除按钮的显示状态
        const clearButton = category === 'study' ? 
            this.elements.studyMusicSearchClear : this.elements.restMusicSearchClear;
        if (searchTerm.trim()) {
            clearButton.classList.add('visible');
        } else {
            clearButton.classList.remove('visible');
        }
    }
    
    clearMusicSearch(category) {
        const searchInput = category === 'study' ? 
            this.elements.studyMusicSearch : this.elements.restMusicSearch;
        
        searchInput.value = '';
        this.searchMusic(category, '');
    }
    
    // ================================
    // 音乐播放器控制
    // ================================
    
    toggleMusicPlayerVisibility() {
        // 旧的音乐播放器已移除，此方法保留为空以避免错误
        console.log('toggleMusicPlayerVisibility: 旧方法，已废弃');
    }
    
    updateMusicToggleVisibility() {
        // 只在专注模式或休息模式时显示音乐控制图标
        if (this.currentMode === 'focus' || this.currentMode === 'rest') {
            this.elements.musicToggleControl.classList.add('visible');
        } else {
            this.elements.musicToggleControl.classList.remove('visible');
            this.isMusicPlayerVisible = false;
            this.hideMusicPlayer();
            this.elements.musicToggleIcon.textContent = '🎵';
        }
    }
    
    // ================================
    // 休息倒计时音乐选择器方法
    // ================================
    
    toggleRestMusicSelector() {
        if (!this.elements.restMusicSelectorContent) return;
        
        const isHidden = this.elements.restMusicSelectorContent.classList.contains('hidden');
        
        if (isHidden) {
            this.elements.restMusicSelectorContent.classList.remove('hidden');
            this.elements.restMusicSelectorContent.classList.add('expanded');
            this.populateRestCountdownMusicList();
        } else {
            this.elements.restMusicSelectorContent.classList.add('hidden');
            this.elements.restMusicSelectorContent.classList.remove('expanded');
        }
    }
    
    populateRestCountdownMusicList() {
        if (!this.elements.restCountdownMusicList) return;
        
        const restMusic = this.musicPlaylists.rest || [];
        this.elements.restCountdownMusicList.innerHTML = '';
        
        if (restMusic.length === 0) {
            this.elements.restCountdownMusicList.innerHTML = '<div class="music-hint">🎵 暂无休息音乐，请先添加音乐文件</div>';
            return;
        }
        
        restMusic.forEach((music, index) => {
            const musicItem = this.createRestCountdownMusicItem(music, index);
            this.elements.restCountdownMusicList.appendChild(musicItem);
        });
    }
    
    createRestCountdownMusicItem(music, index) {
        const item = document.createElement('div');
        item.className = 'music-item';
        item.dataset.index = index;
        
        // 检查是否为当前播放的音乐
        const isCurrentMusic = this.selectedRestMusic && 
                              this.selectedRestMusic.name === music.name &&
                              this.isMusicPlaying;
        
        // 检查是否是视频文件
        const isVideo = music.type === 'video' || music.format === 'mp4' || music.file.toLowerCase().endsWith('.mp4');
        const icon = isVideo ? '📹' : (isCurrentMusic ? '🎵' : '🎶');
        
        if (isCurrentMusic) {
            item.classList.add('selected');
        }
        
        item.innerHTML = `
            <span class="music-item-icon">${icon}</span>
            <div class="music-item-info">
                <div class="music-item-name">${music.name}</div>
                <div class="music-item-duration">${music.duration || '未知时长'} <span style="font-size: 0.7em; opacity: 0.7;">${isVideo ? '视频' : '音频'}</span></div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.selectRestCountdownMusic(index);
        });
        
        return item;
    }
    
    async selectRestCountdownMusic(index) {
        const restMusic = this.musicPlaylists.rest || [];
        if (index < 0 || index >= restMusic.length) return;
        
        const selectedMusic = restMusic[index];
        
        // 检查是否是视频文件
        const isVideo = selectedMusic.type === 'video' || selectedMusic.format === 'mp4' || selectedMusic.file.toLowerCase().endsWith('.mp4');
        
        if (isVideo) {
            // 视频文件：打开视频播放器
            this.openVideoPlayer(selectedMusic, 'rest', false);
            this.showToast(`📹 打开视频: ${selectedMusic.name}`);
            return;
        }
        
        // 音频文件：使用原有逻辑
        // 更新选中状态
        this.selectedRestMusic = selectedMusic;
        
        // 设置当前播放列表和索引，以便updateMusicUI正确工作
        this.currentPlaylist = restMusic;
        this.currentMusicIndex = index;
        
        // 立即播放音乐（休息倒计时中点击音乐直接播放）
        try {
            await this.playMusicWithRetry(selectedMusic, 'rest', false);
            this.showToast(`🎵 正在播放: ${selectedMusic.name}`);
            
            // 更新UI
            this.updateRestCountdownMusicUI();
            this.updateMusicUI(); // 更新主音乐播放器的歌曲名称显示
            this.updateMusicToggleVisibility();
        } catch (error) {
            console.error('播放音乐失败:', error);
            this.showToast('播放失败，请检查音乐文件', 'error');
        }
    }
    
    updateRestCountdownMusicUI() {
        // 更新当前播放音乐显示
        if (this.elements.currentRestMusic && this.selectedRestMusic) {
            const musicName = this.elements.currentRestMusic.querySelector('.music-name');
            if (musicName) {
                musicName.textContent = this.selectedRestMusic.name;
            }
        }
        
        // 更新音乐列表中的选中状态
        if (this.elements.restCountdownMusicList) {
            const items = this.elements.restCountdownMusicList.querySelectorAll('.music-item');
            items.forEach((item, index) => {
                const isSelected = this.selectedRestMusic && 
                                 this.musicPlaylists.rest[index] && 
                                 this.musicPlaylists.rest[index].name === this.selectedRestMusic.name &&
                                 this.isMusicPlaying;
                
                if (isSelected) {
                    item.classList.add('selected');
                    const icon = item.querySelector('.music-item-icon');
                    if (icon) icon.textContent = '🎵';
                } else {
                    item.classList.remove('selected');
                    const icon = item.querySelector('.music-item-icon');
                    if (icon) icon.textContent = '🎶';
                }
            });
        }
    }
    
    searchRestCountdownMusic(searchTerm) {
        if (!this.elements.restCountdownMusicList) return;
        
        const items = this.elements.restCountdownMusicList.querySelectorAll('.music-item');
        let hasVisibleItems = false;
        
        items.forEach(item => {
            const musicName = item.querySelector('.music-item-name');
            if (musicName) {
                const name = musicName.textContent.toLowerCase();
                const matches = name.includes(searchTerm.toLowerCase());
                
                if (matches || searchTerm === '') {
                    item.classList.remove('hidden');
                    hasVisibleItems = true;
                } else {
                    item.classList.add('hidden');
                }
            }
        });
        
        // 显示/隐藏搜索清除按钮
        if (this.elements.restCountdownMusicSearchClear) {
            if (searchTerm) {
                this.elements.restCountdownMusicSearchClear.classList.add('visible');
            } else {
                this.elements.restCountdownMusicSearchClear.classList.remove('visible');
            }
        }
        
        // 显示/隐藏无结果提示
        if (this.elements.restCountdownMusicNoResults) {
            if (!hasVisibleItems && searchTerm) {
                this.elements.restCountdownMusicNoResults.style.display = 'block';
            } else {
                this.elements.restCountdownMusicNoResults.style.display = 'none';
            }
        }
    }
    
    clearRestCountdownMusicSearch() {
        if (this.elements.restCountdownMusicSearch) {
            this.elements.restCountdownMusicSearch.value = '';
            this.searchRestCountdownMusic('');
        }
    }

    // ================================
    // 北京时间管理
    // ================================
    
    async syncBeijingTime() {
        try {
            // 尝试从多个时间API获取准确时间
            const apis = [
                'https://worldtimeapi.org/api/timezone/Asia/Shanghai',
                'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Shanghai',
                'https://api.time.is/time?lang=zh&format=%25Y-%25m-%25d%2520%25H:%25M:%25S'
            ];
            
            for (const api of apis) {
                try {
                    const response = await fetch(api, { 
                        mode: 'cors',
                        timeout: 5000 
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        let serverTime;
                        
                        // 解析不同API的时间格式
                        if (data.datetime) {
                            serverTime = new Date(data.datetime);
                        } else if (data.dateTime) {
                            serverTime = new Date(data.dateTime);
                        } else if (data.time) {
                            serverTime = new Date(data.time);
                        }
                        
                        if (serverTime && !isNaN(serverTime.getTime())) {
                            const localTime = new Date();
                            this.timeOffset = serverTime.getTime() - localTime.getTime();
                            this.lastSyncTime = Date.now();
                            
                            this.updateTimeStatus('已同步', 'success');
                            console.log(`时间同步成功，偏移: ${this.timeOffset}ms`);
                            return true;
                        }
                    }
                } catch (error) {
                    console.warn(`时间API ${api} 失败:`, error);
                    continue;
                }
            }
            
            // 所有API都失败，使用本地时间
            this.fallbackToLocalTime();
            return false;
            
        } catch (error) {
            console.error('时间同步失败:', error);
            this.fallbackToLocalTime();
            return false;
        }
    }
    
    fallbackToLocalTime() {
        this.timeOffset = 0;
        this.updateTimeStatus('本地时间', 'warning');
        console.log('回退到本地时间');
    }
    
    getBeijingTime() {
        const now = new Date(Date.now() + this.timeOffset);
        // 确保时区为北京时间 (UTC+8)
        const beijingTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
        return beijingTime;
    }
    
    updateTimeStatus(status, type = 'success') {
        const statusElement = this.elements.timeStatus.querySelector('.status-indicator');
        const dotElement = statusElement.querySelector('.status-dot');
        
        statusElement.childNodes[1].textContent = status;
        
        // 更新状态颜色
        if (type === 'success') {
            dotElement.style.background = 'var(--accent-success)';
        } else if (type === 'warning') {
            dotElement.style.background = 'var(--accent-warning)';
        } else {
            dotElement.style.background = 'var(--accent-danger)';
        }
        
        // 更新最后同步时间
        this.elements.lastSync.textContent = this.formatLastSync();
    }
    
    formatLastSync() {
        const now = Date.now();
        const diff = now - this.lastSyncTime;
        
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        return `${Math.floor(diff / 86400000)}天前`;
    }
    
    startTimeSync() {
        // 立即同步一次
        this.syncBeijingTime();
        
        // 每5分钟同步一次
        this.syncInterval = setInterval(() => {
            this.syncBeijingTime();
        }, 5 * 60 * 1000);
        
        // 每分钟更新"最后同步"显示
        setInterval(() => {
            this.elements.lastSync.textContent = this.formatLastSync();
        }, 60000);
    }
    
    // ================================
    // 时钟显示
    // ================================
    
    startClock() {
        this.updateClock();
        
        this.clockInterval = setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    updateClock() {
        const beijingTime = this.getBeijingTime();
        
        // 更新日期
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        
        this.updateDigitWithAnimation(this.elements.year, beijingTime.getFullYear().toString());
        this.updateDigitWithAnimation(this.elements.month, String(beijingTime.getMonth() + 1).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.day, String(beijingTime.getDate()).padStart(2, '0'));
        this.elements.weekday.textContent = weekdays[beijingTime.getDay()];
        
        // 更新时间
        this.updateDigitWithAnimation(this.elements.clockHours, String(beijingTime.getHours()).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.clockMinutes, String(beijingTime.getMinutes()).padStart(2, '0'));
        
        if (this.settings.showSeconds) {
            this.updateDigitWithAnimation(this.elements.clockSeconds, String(beijingTime.getSeconds()).padStart(2, '0'));
            this.elements.secondsUnit.style.display = 'flex';
            this.elements.secondsSeparator.style.display = 'block';
        } else {
            this.elements.secondsUnit.style.display = 'none';
            this.elements.secondsSeparator.style.display = 'none';
        }
    }
    
    updateDigitWithAnimation(element, newValue) {
        if (element.textContent !== newValue) {
            element.classList.add('flip');
            element.classList.add('updating');
            
            setTimeout(() => {
                element.textContent = newValue;
            }, 150);
            
            setTimeout(() => {
                element.classList.remove('flip');
                element.classList.remove('updating');
            }, 300);
        }
    }
    
    toggleSecondsDisplay() {
        this.settings.showSeconds = !this.settings.showSeconds;
        this.elements.toggleSeconds.innerHTML = this.settings.showSeconds ? 
            '<span class="btn-icon">🙈</span> 隐藏秒数' : 
            '<span class="btn-icon">👁️</span> 显示秒数';
        this.saveSettings();
        this.showToast(`已${this.settings.showSeconds ? '显示' : '隐藏'}秒数`);
    }
    
    // ================================
    // 倒计时管理
    // ================================
    
    initializeDateTime() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // 设置默认目标时间为明天的这个时候
        this.elements.targetDate.value = tomorrow.toISOString().split('T')[0];
        this.elements.targetTime.value = now.toTimeString().split(' ')[0];
        
        // 加载上次保存的设置
        const savedTarget = localStorage.getItem('countdown-app-target');
        if (savedTarget) {
            const target = JSON.parse(savedTarget);
            this.elements.targetDate.value = target.date;
            this.elements.targetTime.value = target.time;
        }
    }
    
    setQuickCountdown(minutes) {
        // 始终基于当前时间设置目标时间
        const now = new Date();
        const target = new Date(now.getTime() + minutes * 60 * 1000);
        
        this.elements.targetDate.value = target.toISOString().split('T')[0];
        this.elements.targetTime.value = target.toTimeString().split(' ')[0].substring(0, 8);
        
        this.showToast(`已设置${minutes}分钟专注倒计时`);
    }
    
    startCountdown() {
        const dateValue = this.elements.targetDate.value;
        const timeValue = this.elements.targetTime.value;
        
        if (!dateValue || !timeValue) {
            this.showToast('请设置目标日期和时间', 'error');
            return;
        }
        
        const targetDateTime = new Date(`${dateValue}T${timeValue}`);
        const now = new Date();
        
        if (targetDateTime <= now) {
            this.showToast('目标时间不能早于当前时间', 'error');
            return;
        }
        
        // 开始专注时立即停止所有正在播放的音乐
        if (this.isMusicPlaying) {
            this.stopMusic();
        }
        
        this.countdownEndTime = targetDateTime.getTime();
        this.countdownStartTime = now.getTime();
        this.countdownTotalDuration = this.countdownEndTime - this.countdownStartTime;
        this.isCountdownActive = true;
        
        // 记录会话开始
        const plannedDuration = Math.floor((targetDateTime - now) / 1000);
        this.startSession('focus', plannedDuration);
        this.isPaused = false;
        this.pausedRemainingTime = 0;
        
        // 保存设置
        localStorage.setItem('countdown-app-target', JSON.stringify({
            date: dateValue,
            time: timeValue
        }));
        
        // 切换界面
        this.elements.countdownSetup.classList.add('hidden');
        this.elements.countdownDisplay.classList.remove('hidden');
        
        // 开始倒计时
        this.updateCountdown();
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
        
        // 播放开始音效
        this.playSound('heartbeat');
        
        this.showToast('倒计时已开始！');
    }
    
    updateCountdown() {
        if (!this.isCountdownActive || this.isPaused) return;
        
        const now = new Date().getTime();
        const remaining = this.countdownEndTime - now;
        
        if (remaining <= 0) {
            this.completeCountdown();
            return;
        }
        
        // 计算时间单位
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        // 更新显示
        this.updateDigitWithAnimation(this.elements.days, String(days).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.hours, String(hours).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.minutes, String(minutes).padStart(2, '0'));
        this.updateDigitWithAnimation(this.elements.seconds, String(seconds).padStart(2, '0'));
        
        // 更新进度条
        const progress = ((this.countdownTotalDuration - remaining) / this.countdownTotalDuration) * 100;
        this.elements.progressFill.style.width = progress + '%';
        this.elements.progressText.textContent = Math.round(progress) + '%';
        
        // 播放心跳音效（最后一分钟）
        if (remaining <= 60000 && this.settings.heartbeatSound) {
            this.playSound('heartbeat');
        }
        
        // 播放滴答音效
        if (this.settings.tickSound) {
            this.playSound('tick');
        }
    }
    
    pauseCountdown() {
        if (!this.isCountdownActive) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // 暂停：保存当前剩余时间并清除定时器
            const now = new Date().getTime();
            this.pausedRemainingTime = this.countdownEndTime - now;
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
            this.elements.pauseCountdown.innerHTML = '<span class="btn-icon">▶️</span> 继续';
            this.showToast('倒计时已暂停');
        } else {
            // 继续：根据保存的剩余时间重新设置结束时间
            const now = new Date().getTime();
            this.countdownEndTime = now + this.pausedRemainingTime;
            this.countdownInterval = setInterval(() => {
                this.updateCountdown();
            }, 1000);
            this.elements.pauseCountdown.innerHTML = '<span class="btn-icon">⏸️</span> 暂停';
            this.showToast('倒计时已继续');
        }
    }
    
    stopCountdown() {
        // 记录会话结束（提前结束）
        if (this.currentSession) {
            this.endSession(false);
        }
        
        this.isCountdownActive = false;
        this.isPaused = false;
        this.pausedRemainingTime = 0;
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        // 重置界面
        this.elements.countdownSetup.classList.remove('hidden');
        this.elements.countdownDisplay.classList.add('hidden');
        this.elements.pauseCountdown.innerHTML = '<span class="btn-icon">⏸️</span> 暂停';
        
        this.showToast('倒计时已停止');
    }
    
    completeCountdown() {
        // 记录会话完成
        if (this.currentSession) {
            this.endSession(true);
        }
        
        this.isCountdownActive = false;
        this.isPaused = false;
        this.pausedRemainingTime = 0;
        clearInterval(this.countdownInterval);
        
        // 如果当前不在专注模式，自动切换回专注模式以显示完成提示
        if (this.currentMode !== 'focus') {
            this.switchMode('focus');
        }
        
        // 播放完成音效
        this.playSound('completion');
        
        // 显示完成弹窗
        this.showCompletionModal();
        
        // 重置显示
        this.updateDigitWithAnimation(this.elements.days, '00');
        this.updateDigitWithAnimation(this.elements.hours, '00');
        this.updateDigitWithAnimation(this.elements.minutes, '00');
        this.updateDigitWithAnimation(this.elements.seconds, '00');
        
        this.elements.progressFill.style.width = '100%';
        this.elements.progressText.textContent = '100%';
        this.elements.pauseCountdown.innerHTML = '<span class="btn-icon">⏸️</span> 暂停';
        
        // 振动反馈（如果支持）
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        // 专注模式结束后播放学习音乐
        if (this.selectedStudyMusic) {
            setTimeout(() => {
                this.playMusicAuto('study');
            }, 1000); // 延迟1秒播放，让完成音效先播放
        }
    }
    
    showCompletionModal() {
        this.elements.completionModal.classList.remove('hidden');
        
        // 绑定快捷继续按钮
        document.getElementById('continueSession').onclick = () => {
            this.elements.completionModal.classList.add('hidden');
            // 停止音乐并隐藏音乐播放器
            this.stopMusic();
            this.hideMusicPlayer();
            // 设置15分钟继续专注
            this.setQuickCountdown(15);
            this.startCountdown();
        };
        
        document.getElementById('takeBreak').onclick = () => {
            this.elements.completionModal.classList.add('hidden');
            this.stopCountdown();
        };
        
        document.getElementById('closeCompletion').onclick = () => {
            this.elements.completionModal.classList.add('hidden');
            this.stopCountdown();
        };
    }
    
    // ================================
    // 名言系统
    // ================================
    
    async loadQuotes() {
        try {
            const response = await fetch('quotes.json');
            if (response.ok) {
                this.quotes = await response.json();
            } else {
                // 使用内置的名言数据作为备选
                this.quotes = this.getBuiltinQuotes();
            }
        } catch (error) {
            console.warn('加载名言文件失败，使用内置数据:', error);
            this.quotes = this.getBuiltinQuotes();
        }
        
        this.shuffleQuotes();
        // 标签过滤功能已隐藏
        // this.updateQuoteTagsFilter();
        this.filteredQuotes = [...this.quotes];
        this.currentTag = 'all';
        
        console.log(`加载了 ${this.quotes.length} 条名言`);
    }
    
    getBuiltinQuotes() {
        // 内置部分名言作为备选（完整的500+条名言在quotes.json中）
        return [
            { text: "时间是一切财富中最宝贵的财富。", author: "德奥弗拉斯多", tags: ["时间", "财富"] },
            { text: "专注是成功的基石。", author: "比尔·盖茨", tags: ["专注", "成功"] },
            { text: "时间不等人。", author: "古希腊谚语", tags: ["时间"] },
            { text: "努力工作，享受生活。", author: "现代格言", tags: ["努力", "人生"] },
            { text: "今天的努力是明天的收获。", author: "励志格言", tags: ["努力", "成功"] }
        ];
    }
    
    shuffleQuotes() {
        for (let i = this.quotes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.quotes[i], this.quotes[j]] = [this.quotes[j], this.quotes[i]];
        }
    }
    
    updateQuoteTagsFilter() {
        const allTags = new Set();
        this.quotes.forEach(quote => {
            quote.tags.forEach(tag => allTags.add(tag));
        });
        
        const tagsContainer = this.elements.quoteTags;
        tagsContainer.innerHTML = '<button class="tag-btn active" data-tag="all">全部</button>';
        
        [...allTags].sort().forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn';
            btn.dataset.tag = tag;
            btn.textContent = tag;
            btn.onclick = () => this.filterQuotesByTag(tag);
            tagsContainer.appendChild(btn);
        });
    }
    
    filterQuotesByTag(tag) {
        this.currentTag = tag;
        
        // 更新标签按钮状态
        this.elements.quoteTags.querySelectorAll('.tag-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tag === tag);
        });
        
        // 过滤名言
        if (tag === 'all') {
            this.filteredQuotes = [...this.quotes];
        } else {
            this.filteredQuotes = this.quotes.filter(quote => quote.tags.includes(tag));
        }
        
        this.currentQuoteIndex = 0;
        this.displayCurrentQuote();
        
        this.showToast(`已筛选到 ${this.filteredQuotes.length} 条${tag === 'all' ? '' : tag}名言`);
    }
    
    displayRandomQuote() {
        if (this.filteredQuotes.length === 0) {
            this.filteredQuotes = [...this.quotes];
        }
        
        this.currentQuoteIndex = Math.floor(Math.random() * this.filteredQuotes.length);
        this.displayCurrentQuote();
    }
    
    displayCurrentQuote() {
        if (this.filteredQuotes.length === 0) return;
        
        const quote = this.filteredQuotes[this.currentQuoteIndex];
        if (!quote) return;
        
        // 打字机效果
        this.typeWriterEffect(this.elements.quoteText, quote.text);
        
        // 显示标签
        const tagsInline = document.getElementById('quoteTagsInline');
        if (tagsInline && quote.tags) {
            tagsInline.textContent = quote.tags.join(' · ');
        }
        
        setTimeout(() => {
            this.elements.quoteAuthor.textContent = `— ${quote.author}`;
            this.updateFavoriteButton();
        }, quote.text.length * 30);
    }
    
    typeWriterEffect(element, text) {
        // 清除之前的定时器，防止重复
        if (this.typeWriterTimer) {
            clearInterval(this.typeWriterTimer);
            this.typeWriterTimer = null;
        }
        
        element.textContent = '';
        let i = 0;
        
        this.typeWriterTimer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(this.typeWriterTimer);
                this.typeWriterTimer = null;
            }
        }, 30);
    }
    
    nextQuote() {
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.filteredQuotes.length;
        this.displayCurrentQuote();
    }
    
    prevQuote() {
        this.currentQuoteIndex = this.currentQuoteIndex === 0 ? 
            this.filteredQuotes.length - 1 : this.currentQuoteIndex - 1;
        this.displayCurrentQuote();
    }
    
    copyQuote() {
        const quote = this.filteredQuotes[this.currentQuoteIndex];
        if (!quote) return;
        
        const text = `${quote.text} — ${quote.author}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('名言已复制到剪贴板');
            });
        } else {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('名言已复制到剪贴板');
        }
    }
    
    toggleFavorite() {
        const quote = this.filteredQuotes[this.currentQuoteIndex];
        if (!quote) return;
        
        const quoteId = `${quote.text}_${quote.author}`;
        
        if (this.favoriteQuotes.has(quoteId)) {
            this.favoriteQuotes.delete(quoteId);
            this.showToast('已从收藏中移除');
        } else {
            this.favoriteQuotes.add(quoteId);
            this.showToast('已添加到收藏');
        }
        
        this.updateFavoriteButton();
        this.saveSettings();
    }
    
    updateFavoriteButton() {
        const quote = this.filteredQuotes[this.currentQuoteIndex];
        if (!quote) return;
        
        const quoteId = `${quote.text}_${quote.author}`;
        const isFavorited = this.favoriteQuotes.has(quoteId);
        
        this.elements.favoriteQuote.classList.toggle('active', isFavorited);
        this.elements.favoriteQuote.querySelector('.btn-icon').textContent = isFavorited ? '❤️' : '🤍';
    }
    
    toggleQuoteAutoPlay() {
        this.quoteAutoPlay = !this.quoteAutoPlay;
        
        this.elements.autoPlayQuote.classList.toggle('active', this.quoteAutoPlay);
        this.elements.autoPlayQuote.querySelector('.btn-icon').textContent = this.quoteAutoPlay ? '⏸️' : '▶️';
        
        if (this.quoteAutoPlay) {
            this.startQuoteAutoPlay();
            this.showToast('名言自动播放已开启');
        } else {
            this.stopQuoteAutoPlay();
            this.showToast('名言自动播放已关闭');
        }
    }
    
    startQuoteAutoPlay() {
        this.stopQuoteAutoPlay(); // 清除现有定时器
        
        this.quoteInterval = setInterval(() => {
            this.nextQuote();
        }, this.quotePlayInterval);
    }
    
    stopQuoteAutoPlay() {
        if (this.quoteInterval) {
            clearInterval(this.quoteInterval);
            this.quoteInterval = null;
        }
    }
    
    // ================================
    // 音效控制
    // ================================
    
    updateAudioIcon() {
        const icon = this.elements.audioToggle.querySelector('.audio-icon');
        icon.textContent = this.audioEnabled ? '🔊' : '🔇';
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        this.settings.audioEnabled = this.audioEnabled;
        this.updateAudioIcon();
        this.saveSettings();
        
        this.showToast(`音效已${this.audioEnabled ? '开启' : '关闭'}`);
    }
    
    updateVolume() {
        this.audioVolume = this.elements.volumeSlider.value / 100;
        this.settings.audioVolume = this.elements.volumeSlider.value;
        this.elements.volumeValue.textContent = this.elements.volumeSlider.value + '%';
        
        // 更新所有音频元素的音量
        [this.elements.tickAudio, this.elements.heartbeatAudio, this.elements.completionAudio].forEach(audio => {
            if (audio) audio.volume = this.audioVolume;
        });
        
        this.saveSettings();
    }
    
    playSound(type) {
        if (!this.audioEnabled) return;
        
        let audio;
        switch (type) {
            case 'tick':
                if (!this.settings.tickSound) return;
                audio = this.elements.tickAudio;
                break;
            case 'heartbeat':
                if (!this.settings.heartbeatSound) return;
                audio = this.elements.heartbeatAudio;
                break;
            case 'completion':
                if (!this.settings.completionSound) return;
                audio = this.elements.completionAudio;
                break;
            default:
                return;
        }
        
        if (audio) {
            audio.volume = this.audioVolume;
            audio.currentTime = 0;
            audio.play().catch(e => console.warn('音频播放失败:', e));
        }
    }
    
    // ================================
    // 设置面板
    // ================================
    
    openSettings() {
        this.elements.settingsPanel.classList.remove('hidden');
        this.updateSettingsUI();
    }
    
    closeSettings() {
        this.elements.settingsPanel.classList.add('hidden');
    }
    
    resetSettings() {
        if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
            localStorage.removeItem('countdown-app-settings');
            localStorage.removeItem('countdown-app-favorites');
            localStorage.removeItem('countdown-app-target');
            
            this.favoriteQuotes.clear();
            this.settings = {
                theme: 'dark',
                showSeconds: true,
                quoteInterval: 30,
                audioEnabled: false,
                audioVolume: 50,
                heartbeatSound: false,
                tickSound: false,
                completionSound: true,
                reducedMotion: false
            };
            
            this.loadSettings();
            this.applyTheme();
            this.showToast('设置已重置');
            this.closeSettings();
        }
    }
    
    // ================================
    // 收藏管理
    // ================================
    
    showFavorites() {
        const favoritesModal = this.elements.favoritesModal;
        const favoritesList = document.getElementById('favoritesList');
        
        favoritesList.innerHTML = '';
        
        if (this.favoriteQuotes.size === 0) {
            favoritesList.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 2rem;">暂无收藏的名言</p>';
        } else {
            this.favoriteQuotes.forEach(quoteId => {
                const [text, author] = quoteId.split('_');
                const quote = this.quotes.find(q => q.text === text && q.author === author);
                
                if (quote) {
                    const item = document.createElement('div');
                    item.className = 'favorite-item';
                    item.innerHTML = `
                        <div class="favorite-text">${quote.text}</div>
                        <div class="favorite-author">— ${quote.author}</div>
                        <div class="favorite-actions">
                            <button onclick="app.copyQuoteById('${quoteId}')">复制</button>
                            <button onclick="app.removeFavorite('${quoteId}')">移除</button>
                        </div>
                    `;
                    favoritesList.appendChild(item);
                }
            });
        }
        
        favoritesModal.classList.remove('hidden');
    }
    
    copyQuoteById(quoteId) {
        const [text, author] = quoteId.split('_');
        const fullText = `${text} — ${author}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(fullText).then(() => {
                this.showToast('名言已复制到剪贴板');
            });
        }
    }
    
    removeFavorite(quoteId) {
        this.favoriteQuotes.delete(quoteId);
        this.saveSettings();
        this.showFavorites(); // 刷新列表
        this.updateFavoriteButton();
        this.showToast('已从收藏中移除');
    }
    
    exportFavorites() {
        if (this.favoriteQuotes.size === 0) {
            this.showToast('暂无收藏的名言可导出');
            return;
        }
        
        const favorites = [];
        this.favoriteQuotes.forEach(quoteId => {
            const [text, author] = quoteId.split('_');
            favorites.push({ text, author });
        });
        
        const dataStr = JSON.stringify(favorites, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = '收藏的名言.json';
        link.click();
        
        this.showToast('收藏已导出');
    }
    
    // ================================
    // 工具方法
    // ================================
    
    showToast(message, type = 'info') {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.remove('hidden');
        
        // 设置样式
        const toast = this.elements.toast;
        toast.style.borderColor = type === 'error' ? 'var(--accent-danger)' : 
                                  type === 'warning' ? 'var(--accent-warning)' : 
                                  'var(--accent-primary)';
        
        // 自动隐藏
        setTimeout(() => {
            this.elements.toast.classList.add('hidden');
        }, 3000);
    }
    
    // ================================
    // 日期时间预览
    // ================================
    
    updateDatetimePreview() {
        if (!this.elements.datetimePreview) return;
        
        const dateValue = this.elements.targetDate.value;
        const timeValue = this.elements.targetTime.value;
        
        if (!dateValue || !timeValue) {
            this.elements.datetimePreview.innerHTML = `
                <span class="preview-icon">🎯</span>
                <span class="preview-text">请选择目标时间</span>
            `;
            return;
        }
        
        try {
            // 创建目标时间对象
            const targetDateTime = new Date(`${dateValue}T${timeValue}`);
            
            // 检查日期是否有效
            if (isNaN(targetDateTime.getTime())) {
                throw new Error('无效的日期时间');
            }
            
            // 获取当前时间
            const now = new Date();
            const timeDiff = targetDateTime.getTime() - now.getTime();
            
            // 调试信息（仅在开发模式下显示）
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('目标时间:', targetDateTime.toISOString());
                console.log('当前时间:', now.toISOString());
                console.log('时间差(毫秒):', timeDiff);
            }
            
            if (timeDiff <= 0) {
                this.elements.datetimePreview.innerHTML = `
                    <span class="preview-icon">⏰</span>
                    <span class="preview-text" style="color: var(--accent-warning);">目标时间已过去</span>
                `;
                return;
            }
            
            // 计算剩余时间
            const totalSeconds = Math.floor(timeDiff / 1000);
            const days = Math.floor(totalSeconds / (24 * 60 * 60));
            const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;
            
            // 格式化剩余时间显示
            let timeText = '';
            let timeColor = 'var(--accent-primary)';
            
            if (days > 0) {
                timeText = `${days}天${hours}小时${minutes}分钟`;
                timeColor = 'var(--accent-success)';
            } else if (hours > 0) {
                timeText = `${hours}小时${minutes}分钟`;
                if (hours < 2) timeColor = 'var(--accent-warning)';
            } else if (minutes > 0) {
                timeText = `${minutes}分钟${seconds}秒`;
                if (minutes < 10) timeColor = 'var(--accent-warning)';
                if (minutes < 5) timeColor = 'var(--accent-error)';
            } else {
                timeText = `${seconds}秒`;
                timeColor = 'var(--accent-error)';
            }
            
            // 格式化目标时间显示
            const formatDateTime = targetDateTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            this.elements.datetimePreview.innerHTML = `
                <span class="preview-icon">🎯</span>
                <span class="preview-text">
                    目标：${formatDateTime}<br>
                    <small style="color: ${timeColor}; font-weight: 600;">剩余：${timeText}</small>
                </span>
            `;
        } catch (error) {
            console.error('时间预览更新失败:', error);
            this.elements.datetimePreview.innerHTML = `
                <span class="preview-icon">❌</span>
                <span class="preview-text" style="color: var(--accent-error);">时间格式错误</span>
            `;
        }
    }
    
    // 启动日期时间预览的实时更新
    startDatetimePreviewUpdate() {
        // 清除现有定时器
        if (this.datetimePreviewTimer) {
            clearInterval(this.datetimePreviewTimer);
        }
        
        // 每秒更新一次预览
        this.datetimePreviewTimer = setInterval(() => {
            // 只在专注模式下且有日期时间输入时更新
            if (this.currentMode === 'focus' && 
                this.elements.targetDate.value && 
                this.elements.targetTime.value) {
                this.updateDatetimePreview();
            }
        }, 1000);
    }
    
    // 停止日期时间预览更新
    stopDatetimePreviewUpdate() {
        if (this.datetimePreviewTimer) {
            clearInterval(this.datetimePreviewTimer);
            this.datetimePreviewTimer = null;
        }
    }
    
    // ================================
    // 事件绑定
    // ================================
    
    bindEvents() {
        // 模式切换
        this.elements.focusModeBtn.addEventListener('click', () => this.switchMode('focus'));
        this.elements.restModeBtn.addEventListener('click', () => this.switchMode('rest'));
        this.elements.examModeBtn.addEventListener('click', () => this.switchMode('exam'));
        this.elements.clockModeBtn.addEventListener('click', () => this.switchMode('clock'));
        this.elements.statsModeBtn.addEventListener('click', () => this.switchMode('stats'));
        
        // 统计页面按钮
        document.getElementById('importStatsBtn')?.addEventListener('click', () => this.importStats());
        document.getElementById('exportStatsBtn')?.addEventListener('click', () => this.exportStats());
        document.getElementById('clearStatsBtn')?.addEventListener('click', () => this.clearStats());
        
        // 主题选择
        if (this.elements.themeDropdown) {
            const themeOptions = this.elements.themeDropdown.querySelectorAll('.theme-option');
            themeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const theme = option.dataset.theme;
                    if (theme) {
                        this.changeTheme(theme);
                    }
                });
            });
        }
        
        // 数字风格选择
        if (this.elements.digitStyleDropdown) {
            const styleOptions = this.elements.digitStyleDropdown.querySelectorAll('.digit-style-option');
            styleOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const style = option.dataset.style;
                    if (style) {
                        this.changeDigitStyle(style);
                    }
                });
            });
        }
        
        // 倒计时控制
        this.elements.startCountdown.addEventListener('click', () => this.startCountdown());
        this.elements.pauseCountdown.addEventListener('click', () => this.pauseCountdown());
        this.elements.stopCountdown.addEventListener('click', () => this.stopCountdown());
        
        // 休息倒计时控制
        if (this.elements.startRestCountdown) {
            this.elements.startRestCountdown.addEventListener('click', () => this.startRestCountdown());
        }
        if (this.elements.pauseRestCountdown) {
            this.elements.pauseRestCountdown.addEventListener('click', () => this.pauseRestCountdown());
        }
        if (this.elements.stopRestCountdown) {
            this.elements.stopRestCountdown.addEventListener('click', () => this.stopRestCountdown());
        }
        
        // 快捷设置按钮
        this.elements.quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.minutes);
                this.setQuickCountdown(minutes);
            });
        });
        
        // 休息快捷设置按钮
        this.elements.restQuickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.minutes);
                if (minutes) {
                    this.setRestQuickTime(minutes);
                }
            });
        });
        
        // 音乐播放器控制
        if (this.elements.playPauseBtn) {
            this.elements.playPauseBtn.addEventListener('click', () => this.toggleMusic());
        }
        if (this.elements.prevMusicBtn) {
            this.elements.prevMusicBtn.addEventListener('click', () => this.prevMusic());
        }
        if (this.elements.nextMusicBtn) {
            this.elements.nextMusicBtn.addEventListener('click', () => this.nextMusic());
        }
        
        // 刷新音乐列表
        if (this.elements.refreshStudyMusic) {
            this.elements.refreshStudyMusic.addEventListener('click', () => this.refreshMusicList('study'));
        }
        if (this.elements.refreshRestMusic) {
            this.elements.refreshRestMusic.addEventListener('click', () => this.refreshMusicList('rest'));
        }
        
        // 移除了添加音乐文件功能（Web技术限制）
        
        // 音乐搜索事件
        if (this.elements.studyMusicSearch) {
            this.elements.studyMusicSearch.addEventListener('input', (e) => {
                this.searchMusic('study', e.target.value);
            });
        }
        if (this.elements.studyMusicSearchClear) {
            this.elements.studyMusicSearchClear.addEventListener('click', () => {
                this.clearMusicSearch('study');
            });
        }
        if (this.elements.restMusicSearch) {
            this.elements.restMusicSearch.addEventListener('input', (e) => {
                this.searchMusic('rest', e.target.value);
            });
        }
        if (this.elements.restMusicSearchClear) {
            this.elements.restMusicSearchClear.addEventListener('click', () => {
                this.clearMusicSearch('rest');
            });
        }
        
        // 左侧音乐控制图标
        if (this.elements.musicToggleControl) {
            this.elements.musicToggleControl.addEventListener('click', () => {
                // 音乐按钮：切换右下角最小化窗口的显示/隐藏
                if (this.elements.videoPlayerMinimized) {
                    if (this.elements.videoPlayerMinimized.classList.contains('hidden')) {
                        // 最小化窗口已隐藏 → 显示最小化窗口
                        
                        // 如果没有音乐，先加载默认音乐
                        if (!this.currentVideoMusic) {
                            // 尝试加载上次播放的音乐，或默认第一首
                            const lastCategory = localStorage.getItem('lastMusicCategory') || 'study';
                            const lastIndex = parseInt(localStorage.getItem('lastMusicIndex')) || 0;
                            const playlist = this.musicPlaylists[lastCategory];
                            
                            if (playlist && playlist.length > 0) {
                                const music = playlist[lastIndex] || playlist[0];
                                this.currentVideoMusic = music;
                                this.currentVideoCategory = lastCategory;
                                this.currentVideoPlaylist = playlist;
                                this.currentVideoIndex = playlist.indexOf(music);
                                
                                // 设置视频源但不自动播放
                                this.elements.videoPlayer.src = music.file;
                                
                                // 更新最小化窗口信息
                                this.elements.minimizedPlayerName.textContent = music.name;
                                this.elements.minimizedPlayerCategory.textContent = 
                                    lastCategory === 'study' ? '学习音乐' : '休息音乐';
                            }
                        }
                        
                        // 显示最小化窗口
                        this.elements.videoPlayerMinimized.classList.remove('hidden');
                        this.elements.musicToggleIcon.textContent = '🎶';
                    } else {
                        // 最小化窗口已显示 → 隐藏最小化窗口
                        this.elements.videoPlayerMinimized.classList.add('hidden');
                        this.elements.musicToggleIcon.textContent = '🎵';
                    }
                }
            });
        }
        
        // 休息倒计时音乐选择器事件
        if (this.elements.restMusicSelectorToggle) {
            this.elements.restMusicSelectorToggle.addEventListener('click', () => {
                this.toggleRestMusicSelector();
            });
        }
        if (this.elements.restCountdownMusicSearch) {
            this.elements.restCountdownMusicSearch.addEventListener('input', (e) => {
                this.searchRestCountdownMusic(e.target.value);
            });
        }
        if (this.elements.restCountdownMusicSearchClear) {
            this.elements.restCountdownMusicSearchClear.addEventListener('click', () => {
                this.clearRestCountdownMusicSearch();
            });
        }
        
        // 日期时间输入变化
        this.elements.targetDate.addEventListener('change', () => {
            this.updateProgressbar();
            this.updateDatetimePreview();
        });
        this.elements.targetTime.addEventListener('change', () => {
            this.updateProgressbar();
            this.updateDatetimePreview();
        });
        this.elements.targetDate.addEventListener('input', () => this.updateDatetimePreview());
        this.elements.targetTime.addEventListener('input', () => this.updateDatetimePreview());
        
        // 时钟控制
        this.elements.toggleSeconds.addEventListener('click', () => this.toggleSecondsDisplay());
        this.elements.syncTime.addEventListener('click', () => {
            this.syncBeijingTime().then(() => {
                this.showToast('时间同步完成');
            });
        });
        
        // 名言控制
        this.elements.prevQuote.addEventListener('click', () => this.prevQuote());
        this.elements.nextQuote.addEventListener('click', () => this.nextQuote());
        this.elements.copyQuote.addEventListener('click', () => this.copyQuote());
        this.elements.favoriteQuote.addEventListener('click', () => this.toggleFavorite());
        this.elements.autoPlayQuote.addEventListener('click', () => this.toggleQuoteAutoPlay());
        
        // 音频控制
        this.elements.audioToggle.addEventListener('click', () => this.toggleAudio());
        this.elements.volumeSlider.addEventListener('input', () => this.updateVolume());
        
        // 设置面板
        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());
        this.elements.closeSettings.addEventListener('click', () => this.closeSettings());
        
        // 设置项目
        document.getElementById('quoteInterval').addEventListener('change', (e) => {
            this.settings.quoteInterval = parseInt(e.target.value);
            this.quotePlayInterval = this.settings.quoteInterval * 1000;
            this.saveSettings();
            
            if (this.quoteAutoPlay) {
                this.startQuoteAutoPlay(); // 重启自动播放以应用新间隔
            }
        });
        
        ['heartbeatSound', 'tickSound', 'completionSound', 'reducedMotion'].forEach(setting => {
            const element = document.getElementById(setting);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.checked;
                    this.saveSettings();
                    
                    // 应用减少动画设置
                    if (setting === 'reducedMotion') {
                        document.body.style.setProperty('--animation-fast', e.target.checked ? '0.01ms' : '0.15s');
                        document.body.style.setProperty('--animation-normal', e.target.checked ? '0.01ms' : '0.3s');
                        document.body.style.setProperty('--animation-slow', e.target.checked ? '0.01ms' : '0.6s');
                    }
                });
            }
        });
        
        // 收藏相关
        document.getElementById('viewFavorites').addEventListener('click', () => this.showFavorites());
        document.getElementById('exportFavorites').addEventListener('click', () => this.exportFavorites());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
        
        // 音乐设置
        document.getElementById('clearMusicCache').addEventListener('click', () => this.clearMusicCacheAndRefresh());
        
        // 重新生成音乐列表按钮
        const regenerateBtn = document.getElementById('regenerateMusicList');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateMusicList());
        }
        
        // B站下载器按钮
        const bilibiliDownloaderBtn = document.getElementById('openBilibiliDownloader');
        if (bilibiliDownloaderBtn) {
            bilibiliDownloaderBtn.addEventListener('click', () => this.openBilibiliDownloader());
        }
        
        // B站下载器弹窗关闭
        const closeBilibiliDownloaderBtn = document.getElementById('closeBilibiliDownloader');
        if (closeBilibiliDownloaderBtn) {
            closeBilibiliDownloaderBtn.addEventListener('click', () => this.closeBilibiliDownloader());
        }
        
        // B站下载器遮罩层点击关闭
        const downloaderOverlay = document.getElementById('downloaderModalOverlay');
        if (downloaderOverlay) {
            downloaderOverlay.addEventListener('click', () => this.closeBilibiliDownloader());
        }
        
        // B站下载器重试按钮
        const retryDownloaderBtn = document.getElementById('retryDownloader');
        if (retryDownloaderBtn) {
            retryDownloaderBtn.addEventListener('click', () => this.retryDownloaderConnection());
        }
        
        // 视频播放器控制
        if (this.elements.videoPlayerMinimize) {
            this.elements.videoPlayerMinimize.addEventListener('click', () => this.minimizeVideoPlayer());
        }
        if (this.elements.videoPlayerClose) {
            this.elements.videoPlayerClose.addEventListener('click', () => this.closeVideoPlayer());
        }
        // 播放/暂停和全屏使用原生控制条，只保留上一首/下一首
        if (this.elements.videoPrevBtn) {
            this.elements.videoPrevBtn.addEventListener('click', () => this.prevVideo());
        }
        if (this.elements.videoNextBtn) {
            this.elements.videoNextBtn.addEventListener('click', () => this.nextVideo());
        }
        
        // 最小化播放器控制
        if (this.elements.minimizedPlayPauseBtn) {
            this.elements.minimizedPlayPauseBtn.addEventListener('click', () => this.toggleVideoPlayPause());
        }
        if (this.elements.minimizedPrevBtn) {
            this.elements.minimizedPrevBtn.addEventListener('click', () => this.prevVideo());
        }
        if (this.elements.minimizedNextBtn) {
            this.elements.minimizedNextBtn.addEventListener('click', () => this.nextVideo());
        }
        if (this.elements.minimizedRestoreBtn) {
            this.elements.minimizedRestoreBtn.addEventListener('click', () => this.restoreVideoPlayer());
        }
        if (this.elements.minimizedCloseBtn) {
            this.elements.minimizedCloseBtn.addEventListener('click', () => this.closeVideoPlayer());
        }
        
        // 点击视频播放器外部最小化（而不是关闭）
        if (this.elements.videoPlayerModal) {
            this.elements.videoPlayerModal.addEventListener('click', (e) => {
                if (e.target === this.elements.videoPlayerModal) {
                    this.minimizeVideoPlayer();
                }
            });
        }
        
        // ESC键最小化视频播放器（而不是关闭）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.videoPlayerModal && 
                !this.elements.videoPlayerModal.classList.contains('hidden')) {
                this.minimizeVideoPlayer();
            }
        });
        
        // 关闭弹窗
        document.getElementById('closeFavorites').addEventListener('click', () => {
            this.elements.favoritesModal.classList.add('hidden');
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchMode('focus');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchMode('rest');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchMode('exam');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchMode('clock');
                        break;
                    case 't':
                        e.preventDefault();
                        // 循环切换主题
                        const themes = ['dark', 'light', 'romantic', 'warm', 'forest', 'ocean'];
                        const currentIndex = themes.indexOf(this.currentTheme);
                        const nextIndex = (currentIndex + 1) % themes.length;
                        this.changeTheme(themes[nextIndex]);
                        break;
                    case 'd':
                        e.preventDefault();
                        // 循环切换数字风格
                        const styles = ['tech', 'cute', 'elegant', 'playful'];
                        const currentStyleIndex = styles.indexOf(this.currentDigitStyle);
                        const nextStyleIndex = (currentStyleIndex + 1) % styles.length;
                        this.changeDigitStyle(styles[nextStyleIndex]);
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.isCountdownActive) {
                            this.pauseCountdown();
                        } else if (this.isRestCountdownActive) {
                            this.pauseRestCountdown();
                        } else if (this.musicAudio && this.musicAudio.src) {
                            // 当没有倒计时活动时，空格键控制音乐播放暂停
                            this.toggleMusic();
                        }
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextQuote();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.prevQuote();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                // 关闭所有打开的弹窗
                this.elements.settingsPanel.classList.add('hidden');
                this.elements.completionModal.classList.add('hidden');
                this.elements.favoritesModal.classList.add('hidden');
            }
        });
        
        // 页面可见性变化处理
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // 页面重新可见时，重新同步时间
                this.syncBeijingTime();
                // 如果是专注模式，重新启动时间预览更新
                if (this.currentMode === 'focus') {
                    this.startDatetimePreviewUpdate();
                }
            } else {
                // 页面隐藏时，停止时间预览更新以节省资源
                this.stopDatetimePreviewUpdate();
            }
        });
        
        // 页面卸载时清理定时器
        window.addEventListener('beforeunload', () => {
            this.stopDatetimePreviewUpdate();
        });
        
        // 点击弹窗外部关闭
        [this.elements.settingsPanel, this.elements.completionModal, this.elements.favoritesModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
    
    // ================================
    // B站下载器集成
    // ================================
    
    /**
     * 设置消息监听器 - 监听来自B站下载器的消息
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // 安全检查：只接受来自本地的消息
            if (event.origin !== 'http://localhost:5000') {
                return;
            }
            
            // 处理音乐更新消息
            if (event.data && event.data.type === 'music_updated') {
                console.log('🎵 收到音乐更新通知:', event.data);
                
                const categoryName = event.data.category === 'study' ? '学习' : '休息';
                const filename = event.data.filename || '新音乐';
                
                // 显示提示
                this.showToast(`✅ ${filename} 已添加到${categoryName}音乐！正在刷新列表...`);
                
                // 延迟刷新，给用户看到提示的时间
                setTimeout(() => {
                    this.regenerateMusicList();
                }, 1000);
            }
        });
        
        console.log('✅ 消息监听器已设置');
    }
    
    /**
     * 打开B站下载器弹窗
     */
    openBilibiliDownloader() {
        const modal = document.getElementById('bilibiliDownloaderModal');
        const iframe = document.getElementById('bilibiliDownloaderFrame');
        const loading = document.getElementById('downloaderLoading');
        const error = document.getElementById('downloaderError');
        
        if (!modal) return;
        
        // 显示弹窗
        modal.classList.remove('hidden');
        
        // 显示加载状态
        if (loading) loading.style.display = 'flex';
        if (error) error.classList.add('hidden');
        
        // 检查iframe是否已加载
        if (iframe) {
            // 设置iframe加载完成事件
            iframe.onload = () => {
                if (loading) {
                    setTimeout(() => {
                        loading.style.display = 'none';
                    }, 500);
                }
            };
            
            // 设置iframe加载错误事件
            iframe.onerror = () => {
                if (loading) loading.style.display = 'none';
                if (error) error.classList.remove('hidden');
            };
            
            // 检查服务器是否可用
            this.checkDownloaderService();
        }
        
        console.log('✅ B站下载器弹窗已打开');
    }
    
    /**
     * 关闭B站下载器弹窗
     */
    closeBilibiliDownloader() {
        const modal = document.getElementById('bilibiliDownloaderModal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('✅ B站下载器弹窗已关闭');
        }
    }
    
    /**
     * 检查下载器服务是否可用
     */
    async checkDownloaderService() {
        const loading = document.getElementById('downloaderLoading');
        const error = document.getElementById('downloaderError');
        const iframe = document.getElementById('bilibiliDownloaderFrame');
        
        try {
            // 尝试连接到Flask服务器
            const response = await fetch('http://localhost:5000', {
                method: 'HEAD',
                mode: 'no-cors', // 避免CORS问题
                cache: 'no-cache'
            });
            
            // 如果能连接，隐藏加载状态
            if (loading) {
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 1000);
            }
            
            console.log('✅ B站下载器服务已连接');
        } catch (err) {
            // 连接失败，显示错误信息
            console.warn('⚠️ 无法连接到B站下载器服务:', err);
            
            // 延迟显示错误，给iframe一些加载时间
            setTimeout(() => {
                if (loading) loading.style.display = 'none';
                if (error) error.classList.remove('hidden');
            }, 3000);
        }
    }
    
    /**
     * 重试连接下载器服务
     */
    retryDownloaderConnection() {
        const loading = document.getElementById('downloaderLoading');
        const error = document.getElementById('downloaderError');
        const iframe = document.getElementById('bilibiliDownloaderFrame');
        
        // 显示加载状态
        if (loading) loading.style.display = 'flex';
        if (error) error.classList.add('hidden');
        
        // 重新加载iframe
        if (iframe) {
            iframe.src = iframe.src; // 刷新iframe
        }
        
        // 重新检查服务
        this.checkDownloaderService();
        
        console.log('🔄 正在重试连接B站下载器服务...');
    }
    
    // ================================
    // 使用统计系统
    // ================================
    
    loadUsageStats() {
        const stored = localStorage.getItem('countdown_usage_stats');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('加载统计数据失败:', e);
            }
        }
        return {
            sessions: [],
            statistics: {
                totalFocusTime: 0,
                totalRestTime: 0,
                totalSessions: 0,
                completedSessions: 0,
                completionRate: 0,
                streakDays: 0,
                lastUsedDate: null
            }
        };
    }
    
    saveUsageStats() {
        try {
            localStorage.setItem('countdown_usage_stats', JSON.stringify(this.usageStats));
        } catch (e) {
            console.error('保存统计数据失败:', e);
        }
    }
    
    startSession(type, plannedDuration) {
        this.currentSession = {
            id: Date.now().toString(),
            type: type, // 'focus' or 'rest'
            startTime: new Date().toISOString(),
            plannedDuration: plannedDuration, // 秒
            music: this.currentMusic || null
        };
        console.log('会话开始:', this.currentSession);
    }
    
    endSession(completed = true) {
        if (!this.currentSession) return;
        
        const endTime = new Date();
        const startTime = new Date(this.currentSession.startTime);
        const actualDuration = Math.floor((endTime - startTime) / 1000);
        
        const session = {
            ...this.currentSession,
            endTime: endTime.toISOString(),
            actualDuration: actualDuration,
            completed: completed,
            earlyStop: !completed
        };
        
        // 保存会话记录
        this.usageStats.sessions.push(session);
        
        // 更新统计数据
        if (session.type === 'focus') {
            this.usageStats.statistics.totalFocusTime += actualDuration;
        } else {
            this.usageStats.statistics.totalRestTime += actualDuration;
        }
        
        this.usageStats.statistics.totalSessions++;
        if (completed) {
            this.usageStats.statistics.completedSessions++;
        }
        
        this.usageStats.statistics.completionRate = 
            (this.usageStats.statistics.completedSessions / this.usageStats.statistics.totalSessions * 100).toFixed(1);
        
        // 更新连续使用天数
        this.updateStreakDays();
        
        // 保存到 localStorage
        this.saveUsageStats();
        
        this.currentSession = null;
        
        console.log('会话已记录:', session);
    }
    
    updateStreakDays() {
        const today = new Date().toDateString();
        const lastUsed = this.usageStats.statistics.lastUsedDate;
        
        if (!lastUsed) {
            this.usageStats.statistics.streakDays = 1;
        } else {
            const lastDate = new Date(lastUsed);
            const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                // 同一天，不变
            } else if (diffDays === 1) {
                // 连续，+1
                this.usageStats.statistics.streakDays++;
            } else {
                // 中断，重置为1
                this.usageStats.statistics.streakDays = 1;
            }
        }
        
        this.usageStats.statistics.lastUsedDate = today;
    }
    
    // 渲染统计页面
    renderStatsPage() {
        this.updateStatsCards();
        this.renderCharts();
        this.renderSessionHistory();
    }
    
    updateStatsCards() {
        const stats = this.usageStats.statistics;
        
        // 转换时间为小时
        const focusHours = (stats.totalFocusTime / 3600).toFixed(1);
        const restHours = (stats.totalRestTime / 3600).toFixed(1);
        
        document.getElementById('totalFocusTime').textContent = `${focusHours}小时`;
        document.getElementById('totalRestTime').textContent = `${restHours}小时`;
        document.getElementById('completionRate').textContent = `${stats.completionRate}%`;
        document.getElementById('streakDays').textContent = `${stats.streakDays}天`;
    }
    
    renderCharts() {
        this.renderDailyTrendChart();
        this.renderFocusRestPieChart();
        this.renderWeeklyBarChart();
        this.renderHourDistributionChart();
    }
    
    renderDailyTrendChart() {
        const chartDom = document.getElementById('dailyTrendChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        
        // 获取最近7天的数据
        const last7Days = this.getLast7DaysData();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            xAxis: {
                type: 'category',
                data: last7Days.dates,
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' }
            },
            yAxis: {
                type: 'value',
                name: '分钟',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: last7Days.focusMinutes,
                type: 'line',
                smooth: true,
                lineStyle: { color: '#00d4ff', width: 3 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(0, 212, 255, 0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(0, 212, 255, 0.05)'
                    }])
                },
                itemStyle: { color: '#00d4ff' }
            }],
            grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
        };
        
        chart.setOption(option);
        
        // 响应式
        window.addEventListener('resize', () => chart.resize());
    }
    
    renderFocusRestPieChart() {
        const chartDom = document.getElementById('focusRestPieChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        
        const stats = this.usageStats.statistics;
        
        const option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    color: '#b0b0b0',
                    formatter: '{b}: {d}%'
                },
                data: [
                    { 
                        value: Math.floor(stats.totalFocusTime / 60), 
                        name: '专注时间',
                        itemStyle: { color: '#00d4ff' }
                    },
                    { 
                        value: Math.floor(stats.totalRestTime / 60), 
                        name: '休息时间',
                        itemStyle: { color: '#ff6b35' }
                    }
                ]
            }]
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => chart.resize());
    }
    
    renderWeeklyBarChart() {
        const chartDom = document.getElementById('weeklyBarChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        
        const weekData = this.getWeeklyData();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' }
            },
            yAxis: {
                type: 'value',
                name: '分钟',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: weekData,
                type: 'bar',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: '#00d4ff'
                    }, {
                        offset: 1,
                        color: '#7b68ee'
                    }])
                },
                barWidth: '60%'
            }],
            grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => chart.resize());
    }
    
    renderHourDistributionChart() {
        const chartDom = document.getElementById('hourDistributionChart');
        if (!chartDom) return;
        
        const chart = echarts.init(chartDom);
        
        const hourData = this.getHourDistribution();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            xAxis: {
                type: 'category',
                data: hourData.hours,
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0', interval: 2 }
            },
            yAxis: {
                type: 'value',
                name: '次数',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: hourData.counts,
                type: 'bar',
                itemStyle: { color: '#ff6b35' },
                barWidth: '50%'
            }],
            grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
        };
        
        chart.setOption(option);
        
        window.addEventListener('resize', () => chart.resize());
    }
    
    // 数据处理方法
    getLast7DaysData() {
        const dates = [];
        const focusMinutes = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
            
            // 计算当天的专注时长
            const dayTotal = this.usageStats.sessions
                .filter(s => new Date(s.startTime).toDateString() === dateStr && s.type === 'focus')
                .reduce((sum, s) => sum + s.actualDuration, 0);
            
            focusMinutes.push(Math.floor(dayTotal / 60));
        }
        
        return { dates, focusMinutes };
    }
    
    getWeeklyData() {
        const weekData = [0, 0, 0, 0, 0, 0, 0]; // 周一到周日
        
        this.usageStats.sessions.forEach(session => {
            if (session.type === 'focus') {
                const day = new Date(session.startTime).getDay();
                const dayIndex = day === 0 ? 6 : day - 1; // 转换为周一=0
                weekData[dayIndex] += Math.floor(session.actualDuration / 60);
            }
        });
        
        return weekData;
    }
    
    getHourDistribution() {
        const hours = [];
        const counts = Array(24).fill(0);
        
        this.usageStats.sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            counts[hour]++;
        });
        
        // 显示所有24小时
        for (let i = 0; i < 24; i++) {
            hours.push(`${i}:00`);
        }
        
        return { hours, counts };
    }
    
    renderSessionHistory() {
        const listEl = document.getElementById('sessionHistoryList');
        if (!listEl) return;
        
        const recentSessions = this.usageStats.sessions.slice(-20).reverse();
        
        if (recentSessions.length === 0) {
            listEl.innerHTML = '<div class="no-history">暂无使用记录</div>';
            return;
        }
        
        listEl.innerHTML = recentSessions.map(session => {
            const startTime = new Date(session.startTime);
            const duration = Math.floor(session.actualDuration / 60);
            const typeIcon = session.type === 'focus' ? '🎯' : '🌸';
            const typeName = session.type === 'focus' ? '专注' : '休息';
            const statusIcon = session.completed ? '✅' : '⏹️';
            const statusText = session.completed ? '完成' : '提前结束';
            
            return `
                <div class="history-item">
                    <div class="history-icon">${typeIcon}</div>
                    <div class="history-info">
                        <div class="history-main">
                            <span class="history-type">${typeName}</span>
                            <span class="history-duration">${duration}分钟</span>
                            <span class="history-status ${session.completed ? 'completed' : 'stopped'}">${statusIcon} ${statusText}</span>
                        </div>
                        <div class="history-time">${startTime.toLocaleString('zh-CN')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    exportStats() {
        const dataStr = JSON.stringify(this.usageStats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `countdown-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('数据已导出');
    }
    
    // ================================
    // 使用统计系统
    // ================================
    
    loadUsageStats() {
        const stored = localStorage.getItem('countdown_usage_stats');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('统计数据解析失败，使用默认值:', e);
            }
        }
        return {
            sessions: [],
            statistics: {
                totalFocusTime: 0,
                totalRestTime: 0,
                totalSessions: 0,
                completedSessions: 0,
                completionRate: 0,
                streakDays: 0,
                lastUsedDate: null
            }
        };
    }
    
    saveUsageStats() {
        localStorage.setItem('countdown_usage_stats', JSON.stringify(this.usageStats));
    }
    
    startSession(type, plannedDuration) {
        this.currentSession = {
            id: Date.now().toString(),
            type: type, // 'focus' or 'rest'
            startTime: new Date().toISOString(),
            plannedDuration: plannedDuration, // 秒
            music: this.selectedStudyMusic || this.selectedRestMusic || null
        };
    }
    
    endSession(completed = true) {
        if (!this.currentSession) return;
        
        const endTime = new Date();
        const startTime = new Date(this.currentSession.startTime);
        const actualDuration = Math.floor((endTime - startTime) / 1000);
        
        const session = {
            ...this.currentSession,
            endTime: endTime.toISOString(),
            actualDuration: actualDuration,
            completed: completed,
            earlyStop: !completed
        };
        
        // 保存会话记录
        this.usageStats.sessions.push(session);
        
        // 更新统计数据
        if (session.type === 'focus') {
            this.usageStats.statistics.totalFocusTime += actualDuration;
        } else {
            this.usageStats.statistics.totalRestTime += actualDuration;
        }
        
        this.usageStats.statistics.totalSessions++;
        if (completed) {
            this.usageStats.statistics.completedSessions++;
        }
        
        this.usageStats.statistics.completionRate = 
            this.usageStats.statistics.totalSessions > 0 
                ? parseFloat((this.usageStats.statistics.completedSessions / this.usageStats.statistics.totalSessions * 100).toFixed(1))
                : 0;
        
        // 更新连续使用天数
        this.updateStreakDays();
        
        // 保存到 localStorage
        this.saveUsageStats();
        
        this.currentSession = null;
        
        console.log('会话已记录:', session);
    }
    
    updateStreakDays() {
        const today = new Date().toDateString();
        const lastUsed = this.usageStats.statistics.lastUsedDate;
        
        if (!lastUsed) {
            this.usageStats.statistics.streakDays = 1;
        } else {
            const lastDate = new Date(lastUsed);
            const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                // 同一天，不变
            } else if (diffDays === 1) {
                // 连续，+1
                this.usageStats.statistics.streakDays++;
            } else {
                // 中断，重置为1
                this.usageStats.statistics.streakDays = 1;
            }
        }
        
        this.usageStats.statistics.lastUsedDate = today;
    }
    
    renderStatsPage() {
        if (!window.echarts) {
            console.error('ECharts未加载');
            return;
        }
        this.updateStatsCards();
        this.renderCharts();
        this.renderSessionHistory();
    }
    
    updateStatsCards() {
        const stats = this.usageStats.statistics;
        
        // 转换时间为小时
        const focusHours = (stats.totalFocusTime / 3600).toFixed(1);
        const restHours = (stats.totalRestTime / 3600).toFixed(1);
        
        const totalFocusEl = document.getElementById('totalFocusTime');
        const totalRestEl = document.getElementById('totalRestTime');
        const completionRateEl = document.getElementById('completionRate');
        const streakDaysEl = document.getElementById('streakDays');
        
        if (totalFocusEl) totalFocusEl.textContent = `${focusHours}小时`;
        if (totalRestEl) totalRestEl.textContent = `${restHours}小时`;
        if (completionRateEl) completionRateEl.textContent = `${stats.completionRate}%`;
        if (streakDaysEl) streakDaysEl.textContent = `${stats.streakDays}天`;
    }
    
    renderCharts() {
        this.renderDailyTrendChart();
        this.renderFocusRestPieChart();
        this.renderWeeklyBarChart();
        this.renderHourDistributionChart();
    }
    
    renderDailyTrendChart() {
        const chartEl = document.getElementById('dailyTrendChart');
        if (!chartEl) return;
        
        const chart = echarts.init(chartEl);
        const last7Days = this.getLast7DaysData();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            xAxis: {
                type: 'category',
                data: last7Days.dates,
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' }
            },
            yAxis: {
                type: 'value',
                name: '分钟',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: last7Days.focusMinutes,
                type: 'line',
                smooth: true,
                lineStyle: { color: '#00d4ff', width: 3 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: 'rgba(0, 212, 255, 0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(0, 212, 255, 0.05)'
                    }])
                },
                itemStyle: { color: '#00d4ff' }
            }],
            grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
        };
        
        chart.setOption(option);
        window.addEventListener('resize', () => chart.resize());
    }
    
    renderFocusRestPieChart() {
        const chartEl = document.getElementById('focusRestPieChart');
        if (!chartEl) return;
        
        const chart = echarts.init(chartEl);
        const stats = this.usageStats.statistics;
        
        const option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: true,
                    color: '#b0b0b0',
                    formatter: '{b}: {d}%'
                },
                data: [
                    { 
                        value: Math.floor(stats.totalFocusTime / 60), 
                        name: '专注时间',
                        itemStyle: { color: '#00d4ff' }
                    },
                    { 
                        value: Math.floor(stats.totalRestTime / 60), 
                        name: '休息时间',
                        itemStyle: { color: '#ff6b35' }
                    }
                ]
            }]
        };
        
        chart.setOption(option);
        window.addEventListener('resize', () => chart.resize());
    }
    
    renderWeeklyBarChart() {
        const chartEl = document.getElementById('weeklyBarChart');
        if (!chartEl) return;
        
        const chart = echarts.init(chartEl);
        const weekData = this.getWeeklyData();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' }
            },
            yAxis: {
                type: 'value',
                name: '分钟',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: weekData,
                type: 'bar',
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: '#00d4ff'
                    }, {
                        offset: 1,
                        color: '#7b68ee'
                    }])
                },
                barWidth: '60%'
            }],
            grid: { left: '10%', right: '5%', bottom: '15%', top: '10%' }
        };
        
        chart.setOption(option);
        window.addEventListener('resize', () => chart.resize());
    }
    
    renderHourDistributionChart() {
        const chartEl = document.getElementById('hourDistributionChart');
        if (!chartEl) return;
        
        const chart = echarts.init(chartEl);
        const hourData = this.getHourDistribution();
        
        const option = {
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(26, 26, 26, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            xAxis: {
                type: 'category',
                data: hourData.hours,
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0', rotate: 45 }
            },
            yAxis: {
                type: 'value',
                name: '次数',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#b0b0b0' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: [{
                data: hourData.counts,
                type: 'bar',
                itemStyle: { color: '#ff6b35' },
                barWidth: '50%'
            }],
            grid: { left: '10%', right: '5%', bottom: '20%', top: '10%' }
        };
        
        chart.setOption(option);
        window.addEventListener('resize', () => chart.resize());
    }
    
    getLast7DaysData() {
        const dates = [];
        const focusMinutes = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
            
            // 计算当天的专注时长
            const dayTotal = this.usageStats.sessions
                .filter(s => new Date(s.startTime).toDateString() === dateStr && s.type === 'focus')
                .reduce((sum, s) => sum + s.actualDuration, 0);
            
            focusMinutes.push(Math.floor(dayTotal / 60));
        }
        
        return { dates, focusMinutes };
    }
    
    getWeeklyData() {
        const weekData = [0, 0, 0, 0, 0, 0, 0]; // 周一到周日
        
        this.usageStats.sessions.forEach(session => {
            if (session.type === 'focus') {
                const day = new Date(session.startTime).getDay();
                const dayIndex = day === 0 ? 6 : day - 1; // 转换为周一=0
                weekData[dayIndex] += Math.floor(session.actualDuration / 60);
            }
        });
        
        return weekData;
    }
    
    getHourDistribution() {
        const hours = [];
        const counts = Array(24).fill(0);
        
        this.usageStats.sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            counts[hour]++;
        });
        
        // 只显示有数据的时段
        for (let i = 0; i < 24; i++) {
            hours.push(`${i}:00`);
        }
        
        return { hours, counts };
    }
    
    renderSessionHistory() {
        const listEl = document.getElementById('sessionHistoryList');
        if (!listEl) return;
        
        const recentSessions = this.usageStats.sessions.slice(-20).reverse();
        
        if (recentSessions.length === 0) {
            listEl.innerHTML = '<div class="no-history">暂无使用记录</div>';
            return;
        }
        
        listEl.innerHTML = recentSessions.map(session => {
            const startTime = new Date(session.startTime);
            const duration = Math.floor(session.actualDuration / 60);
            const typeIcon = session.type === 'focus' ? '🎯' : '🌸';
            const typeName = session.type === 'focus' ? '专注' : '休息';
            const statusIcon = session.completed ? '✅' : '⏹️';
            const statusText = session.completed ? '完成' : '提前结束';
            
            return `
                <div class="history-item">
                    <div class="history-icon">${typeIcon}</div>
                    <div class="history-info">
                        <div class="history-main">
                            <span class="history-type">${typeName}</span>
                            <span class="history-duration">${duration}分钟</span>
                            <span class="history-status ${session.completed ? 'completed' : 'stopped'}">${statusIcon} ${statusText}</span>
                        </div>
                        <div class="history-time">${startTime.toLocaleString('zh-CN')}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    exportStats() {
        const dataStr = JSON.stringify(this.usageStats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `countdown-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('数据已导出');
    }
    
    importStats() {
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // 验证数据格式
                    if (!this.validateStatsData(importedData)) {
                        this.showToast('数据格式不正确，请检查文件', 'error');
                        return;
                    }
                    
                    // 询问用户如何处理
                    const action = confirm(
                        '导入数据选项：\n\n' +
                        '点击"确定"：覆盖现有数据（将替换所有当前数据）\n' +
                        '点击"取消"：合并数据（保留现有数据，添加新数据）\n\n' +
                        '请选择处理方式：'
                    );
                    
                    if (action) {
                        // 覆盖模式
                        this.usageStats = importedData;
                        this.showToast('数据已覆盖导入');
                    } else {
                        // 合并模式
                        const mergedCount = this.mergeStatsData(importedData);
                        this.showToast(`数据已合并导入，新增 ${mergedCount} 条记录`);
                    }
                    
                    // 重新计算统计数据
                    this.recalculateStatistics();
                    
                    // 保存并刷新页面
                    this.saveUsageStats();
                    this.renderStatsPage();
                    
                } catch (error) {
                    console.error('导入失败:', error);
                    this.showToast('文件解析失败，请检查文件格式', 'error');
                }
            };
            
            reader.onerror = () => {
                this.showToast('文件读取失败', 'error');
            };
            
            reader.readAsText(file);
        };
        
        // 触发文件选择
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
    
    validateStatsData(data) {
        // 验证数据格式
        if (!data || typeof data !== 'object') {
            console.warn('数据格式错误：不是对象');
            return false;
        }
        
        if (!Array.isArray(data.sessions)) {
            console.warn('数据格式错误：sessions不是数组');
            return false;
        }
        
        if (!data.statistics || typeof data.statistics !== 'object') {
            console.warn('数据格式错误：statistics不是对象');
            return false;
        }
        
        // 验证必需字段
        const requiredStatsFields = [
            'totalFocusTime', 'totalRestTime', 'totalSessions',
            'completedSessions', 'completionRate', 'streakDays'
        ];
        
        for (const field of requiredStatsFields) {
            if (!(field in data.statistics)) {
                console.warn(`数据格式错误：缺少字段 ${field}`);
                return false;
            }
        }
        
        // 验证会话记录格式
        for (const session of data.sessions) {
            if (!session.id || !session.type || !session.startTime) {
                console.warn('数据格式错误：会话记录缺少必需字段');
                return false;
            }
        }
        
        return true;
    }
    
    mergeStatsData(importedData) {
        // 合并会话记录（避免重复）
        const existingIds = new Set(this.usageStats.sessions.map(s => s.id));
        const newSessions = importedData.sessions.filter(s => !existingIds.has(s.id));
        
        // 合并会话记录
        this.usageStats.sessions = [
            ...this.usageStats.sessions,
            ...newSessions
        ].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)); // 按时间倒序
        
        return newSessions.length;
    }
    
    recalculateStatistics() {
        // 重新计算所有统计数据
        const stats = {
            totalFocusTime: 0,
            totalRestTime: 0,
            totalSessions: this.usageStats.sessions.length,
            completedSessions: 0,
            completionRate: 0,
            streakDays: 0,
            lastUsedDate: null
        };
        
        // 计算总时长和完成数
        this.usageStats.sessions.forEach(session => {
            const duration = session.actualDuration || 0;
            
            if (session.type === 'focus') {
                stats.totalFocusTime += duration;
            } else if (session.type === 'rest') {
                stats.totalRestTime += duration;
            }
            
            if (session.completed) {
                stats.completedSessions++;
            }
        });
        
        // 计算完成率
        stats.completionRate = stats.totalSessions > 0
            ? parseFloat((stats.completedSessions / stats.totalSessions * 100).toFixed(1))
            : 0;
        
        // 重新计算连续天数
        if (this.usageStats.sessions.length > 0) {
            // 找到最早和最晚的使用日期
            const dates = this.usageStats.sessions
                .map(s => new Date(s.startTime).toDateString())
                .sort();
            
            const uniqueDates = [...new Set(dates)];
            let maxStreak = 0;
            let currentStreak = 0;
            let lastDate = null;
            
            for (const dateStr of uniqueDates) {
                const date = new Date(dateStr);
                
                if (!lastDate) {
                    currentStreak = 1;
                } else {
                    const diffDays = Math.floor((date - lastDate) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        maxStreak = Math.max(maxStreak, currentStreak);
                        currentStreak = 1;
                    }
                }
                
                lastDate = date;
            }
            
            stats.streakDays = Math.max(maxStreak, currentStreak);
            
            // 更新最后使用日期
            if (uniqueDates.length > 0) {
                stats.lastUsedDate = uniqueDates[uniqueDates.length - 1];
            }
        }
        
        // 更新统计数据
        this.usageStats.statistics = stats;
    }
    
    clearStats() {
        if (confirm('确定要清除所有使用数据吗？此操作不可恢复！')) {
            this.usageStats = {
                sessions: [],
                statistics: {
                    totalFocusTime: 0,
                    totalRestTime: 0,
                    totalSessions: 0,
                    completedSessions: 0,
                    completionRate: 0,
                    streakDays: 0,
                    lastUsedDate: null
                }
            };
            this.saveUsageStats();
            this.renderStatsPage();
            this.showToast('数据已清除');
        }
    }
}

// ================================
// 应用启动
// ================================

// 确保DOM加载完成后再初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new CountdownApp();
    });
} else {
    window.app = new CountdownApp();
}

// 导出类供其他脚本使用
window.CountdownApp = CountdownApp;
