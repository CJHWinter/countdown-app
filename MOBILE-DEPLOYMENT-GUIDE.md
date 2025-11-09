# 📱 移动端部署指南

## 目录
- [PWA 部署方案](#pwa-部署方案)
- [GitHub Pages 详细步骤](#github-pages-详细步骤)
- [其他部署方案对比](#其他部署方案对比)
- [常见问题解答](#常见问题解答)

---

## 🌟 PWA 部署方案（推荐）

### 什么是 PWA？
**Progressive Web App（渐进式Web应用）**：本质是网页，但可以像原生应用一样安装到手机桌面。

### 优势
- ✅ **一次开发，全平台使用**（Android + iOS + 电脑）
- ✅ **无需应用商店审核**
- ✅ **自动更新**（刷新网页即可）
- ✅ **零成本**（只需一个域名或使用 GitHub Pages）
- ✅ **支持离线使用**
- ✅ **可以添加到主屏幕**，像真正的 APP

---

## 📚 GitHub Pages 详细步骤

### 步骤 1：创建 GitHub 仓库

1. 登录 GitHub：https://github.com
2. 点击右上角 **"+"** → **"New repository"**
3. 填写信息：
   ```
   Repository name: countdown-app
   Description: 倒计时氛围感应用
   Public: ✅ 必须选择公开
   ```
4. 点击 **"Create repository"**

### 步骤 2：上传项目文件

#### 方式一：网页上传（推荐新手）
1. 在仓库页面点击 **"uploading an existing file"**
2. 拖拽以下文件到浏览器：
   ```
   index.html
   styles.css
   app.js
   quotes.json
   music-list.json
   manifest.json
   sw.js
   assets/ (整个文件夹)
   ```
3. 填写提交信息：`初始提交`
4. 点击 **"Commit changes"**

#### 方式二：使用 Git 命令行
```bash
# 进入项目目录
cd "E:\Lover\小礼物\倒计时氛围感-升级版"

# 初始化 Git
git init

# 添加核心文件（注意：不包含大型音乐文件）
git add index.html styles.css app.js quotes.json music-list.json manifest.json sw.js
git add assets/icon-192.png assets/icon-512.png
git add assets/audio/ assets/fonts/

# 提交
git commit -m "初始提交：PWA倒计时应用"

# 连接到 GitHub（替换你的用户名）
git remote add origin https://github.com/你的用户名/countdown-app.git

# 推送
git branch -M main
git push -u origin main
```

**⚠️ 重要提示：**
- `music/` 文件夹内容太大（约几GB），**不要上传到 GitHub**
- GitHub 有仓库大小限制（推荐 < 1GB）
- 音乐文件建议：
  1. 只上传几首示例音乐（< 10MB）
  2. 或使用云存储（阿里云OSS/七牛云）
  3. 或让用户自己添加音乐

### 步骤 3：启用 GitHub Pages

1. 进入仓库，点击 **"Settings"** 标签
2. 左侧菜单找到 **"Pages"**
3. 配置：
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)
4. 点击 **"Save"**
5. 等待 1-2 分钟，刷新页面
6. 会显示：`Your site is live at https://你的用户名.github.io/countdown-app/`

### 步骤 4：生成 PWA 图标

**重要：在上传前，需要先生成应用图标！**

#### 方式一：使用自动脚本（推荐）✨

```bash
# Windows 用户：双击运行
生成PWA图标.bat

# macOS/Linux 用户
python generate-icons.py
```

脚本会自动：
- 读取 `assets/2.jpg`（疯狂动物城图标）
- 生成 `assets/icon-192.png`（192x192）
- 生成 `assets/icon-512.png`（512x512）

#### 方式二：手动制作

如果不想用脚本，可以使用在线工具：
1. 访问 https://squoosh.app/
2. 上传 `assets/2.jpg`
3. 调整尺寸为 512x512，导出为 PNG
4. 重命名为 `icon-512.png`，放入 `assets/` 文件夹
5. 重复步骤创建 192x192 版本

详细说明见：`assets/图标准备指南.md`

### 步骤 5：验证 PWA 配置文件

项目已包含以下 PWA 文件：
- ✅ `manifest.json` - 应用配置
- ✅ `sw.js` - Service Worker（离线支持）
- ✅ `index.html` - 已引用上述文件
- ⚠️ `assets/icon-192.png` - 应用图标（需要生成）
- ⚠️ `assets/icon-512.png` - 应用图标（需要生成）

### 步骤 6：在手机上安装

#### Android（Chrome）
1. 打开 Chrome 浏览器
2. 访问：`https://你的用户名.github.io/countdown-app/`
3. 点击地址栏的 **"安装"** 图标
4. 或点击 **⋮** → **"添加到主屏幕"**
5. 确认安装

#### iOS（Safari）
1. 打开 Safari 浏览器
2. 访问你的网站
3. 点击底部 **分享按钮** 📤
4. 选择 **"添加到主屏幕"**
5. 点击 **"添加"**

---

## 📊 其他部署方案对比

| 方案 | Android | iOS | 难度 | 成本 | 推荐度 |
|------|---------|-----|------|------|--------|
| **PWA（GitHub Pages）** | ✅ | ✅ | ⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| **Vercel/Netlify** | ✅ | ✅ | ⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| **Cordova** | ✅ | ✅ | ⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| **云服务器** | ✅ | ✅ | ⭐⭐ | ¥150/年 | ⭐⭐⭐⭐ |
| **React Native** | ✅ | ✅ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐ |

### Vercel 部署（替代方案）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 按提示操作，完成后获得 https://your-app.vercel.app 地址
```

### Netlify 部署（替代方案）

1. 访问：https://netlify.com
2. 注册账号
3. 点击 **"Add new site"** → **"Import an existing project"**
4. 连接 GitHub 仓库
5. 点击 **"Deploy"**
6. 完成！获得 `https://your-app.netlify.app` 地址

---

## 🔧 Cordova 打包（原生应用）

### 适用场景
- 需要上架应用商店（Google Play / App Store）
- 需要使用手机硬件功能（摄像头、GPS等）
- 需要更好的性能

### 安装步骤

```bash
# 1. 安装 Cordova
npm install -g cordova

# 2. 创建项目
cordova create CountdownApp com.yourname.countdown 倒计时氛围感
cd CountdownApp

# 3. 添加平台
cordova platform add android  # Android
cordova platform add ios      # iOS（需要 Mac）

# 4. 复制代码
cp -r ../倒计时氛围感-升级版/* www/

# 5. 构建
cordova build android --release  # 生成 APK
cordova build ios --release      # 生成 iOS 应用（需要 Mac）
```

### Android 和 iOS 的区别

| 特性 | Android | iOS |
|------|---------|-----|
| **开发环境** | Windows/Mac/Linux | 仅 Mac |
| **开发工具** | Android Studio | Xcode |
| **测试** | 模拟器或真机 | 需要真机或 Mac |
| **发布** | Google Play（$25 一次性） | App Store（$99/年） |
| **审核** | 较宽松（几小时） | 严格（1-2周） |
| **安装方式** | 可直接安装 APK | 必须通过 App Store |
| **侧载** | ✅ 支持 | ❌ 需要越狱 |

---

## 🖥️ Electron 桌面应用

虽然不是手机应用，但可以打包成 Windows/Mac/Linux 桌面应用。

```bash
# 1. 安装依赖
npm install electron electron-builder --save-dev

# 2. 创建 main.js（已包含在项目中）

# 3. 打包
npm run build -- --win   # Windows
npm run build -- --mac   # macOS
npm run build -- --linux # Linux
```

---

## ⚠️ 常见问题解答

### Q1: 音乐文件太大，无法上传到 GitHub
**A**: 
- GitHub 单个文件限制 100MB
- 解决方案：
  1. 只上传几首示例音乐
  2. 使用 Git LFS（Large File Storage）
  3. 音乐文件放到云存储（阿里云 OSS/七牛云）

### Q2: B站下载器无法使用
**A**: 
- GitHub Pages 只支持静态网站，不支持 Python/Flask 后端
- 解决方案：
  1. B站下载器单独部署到 Heroku/Railway（免费）
  2. 使用第三方 B站解析 API
  3. 保留本地版本，只在电脑上使用下载功能

### Q3: 手机上没有"安装"按钮
**A**: 检查清单：
- ✅ `manifest.json` 是否正确
- ✅ 图标文件是否存在
- ✅ Service Worker 是否注册成功
- ✅ 网站是否使用 HTTPS

### Q4: iOS Safari 无法播放音频
**A**: 
- iOS Safari 限制：需要用户手势触发音频播放
- 解决方案已在 `app.js` 中实现：
  ```javascript
  document.addEventListener('click', () => {
    if (!audioInitialized) {
      audio.play().then(() => audio.pause());
      audioInitialized = true;
    }
  }, { once: true });
  ```

### Q5: 如何更新应用？
**A**: 
- PWA 会自动更新
- 用户刷新页面即可获取最新版本
- Service Worker 会自动检测并更新缓存

### Q6: 如何查看 PWA 是否正常工作？
**A**: 
1. 打开浏览器开发者工具（F12）
2. 切换到 "Application" 标签
3. 查看：
   - Manifest: 检查应用配置
   - Service Workers: 检查是否注册成功
   - Cache Storage: 查看缓存的文件

---

## 🎯 推荐部署路径

### 阶段一：PWA（立即可用）
```
成本：免费（使用 GitHub Pages）
时间：1-2小时
效果：手机可安装，体验接近原生
```

### 阶段二：云服务器（长期使用）
```
成本：¥150/年
时间：2-3小时
效果：随时随地访问，数据云端同步
```

### 阶段三：Cordova（如需上架）
```
成本：Android $25，iOS $99/年
时间：1-2天
效果：真正的原生应用，可上架商店
```

---

## 📝 部署清单

### 必需文件（必须上传）
- ✅ `index.html` - 主页面
- ✅ `styles.css` - 样式表
- ✅ `app.js` - 核心逻辑
- ✅ `quotes.json` - 名言数据（500+条）
- ✅ `music-list.json` - 音乐列表
- ✅ `manifest.json` - PWA配置
- ✅ `sw.js` - Service Worker
- ✅ `assets/icon-192.png` - 应用图标
- ✅ `assets/icon-512.png` - 应用图标
- ✅ `assets/audio/README.md` - 音效说明
- ✅ `assets/fonts/README.md` - 字体说明

### 可选文件（根据需要上传）
- ⚠️ `music/学习/` - 学习音乐（文件太大，建议不上传）
- ⚠️ `music/休息/` - 休息音乐（文件太大，建议不上传）
- ⚠️ `assets/audio/*.mp3` - 音效文件（tick、heartbeat、completion）
- ⚠️ `assets/fonts/` - 自定义字体文件

### 不需要上传的文件
- ❌ `crawl_videos/` - 本地工具，不需要上传
- ❌ `node_modules/` - 依赖包，不需要上传
- ❌ `*.bat` - Windows批处理文件
- ❌ `*.sh` - Shell脚本
- ❌ `server.js` - 本地服务器文件
- ❌ `generate-icons.py` - 图标生成工具
- ❌ `generate-music-list.js` - 音乐列表生成工具

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/countdown-app.git

# 2. 访问网站
https://你的用户名.github.io/countdown-app/

# 3. 手机安装
打开浏览器 → 访问网址 → 添加到主屏幕

# 完成！🎉
```

---

## 📞 技术支持

如果遇到问题：
1. 检查浏览器控制台（F12）的错误信息
2. 确认所有文件都已正确上传
3. 验证 HTTPS 是否启用
4. 清除浏览器缓存后重试

---

**最后更新**: 2025-11-07
**版本**: 1.0.0

