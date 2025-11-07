// ================================
// Service Worker - 离线支持和缓存管理
// ================================

const CACHE_NAME = 'countdown-app-v1.2.2';
const RUNTIME_CACHE = 'countdown-runtime-v1.2.2';

// 需要缓存的核心文件（立即缓存）
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './quotes.json',
  './music-list.json',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// 可选缓存的资源（按需缓存）
const OPTIONAL_ASSETS = [
  './assets/audio/tick.mp3',
  './assets/audio/tick.ogg',
  './assets/audio/heartbeat.mp3',
  './assets/audio/heartbeat.ogg',
  './assets/audio/completion.mp3',
  './assets/audio/completion.ogg'
];

// ================================
// 安装事件 - 缓存核心资源
// ================================
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 缓存核心资源');
        // 缓存核心文件
        return cache.addAll(CORE_ASSETS)
          .then(() => {
            // 尝试缓存可选资源（不阻塞安装）
            return Promise.allSettled(
              OPTIONAL_ASSETS.map(url => 
                cache.add(url).catch(err => {
                  console.warn(`[SW] 可选资源缓存失败: ${url}`, err);
                })
              )
            );
          });
      })
      .then(() => {
        console.log('[SW] 安装完成');
        // 立即激活新的 Service Worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] 安装失败:', error);
      })
  );
});

// ================================
// 激活事件 - 清理旧缓存
// ================================
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 删除旧版本的缓存
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[SW] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] 激活完成');
        // 立即控制所有页面
        return self.clients.claim();
      })
  );
});

// ================================
// 获取事件 - 缓存策略
// ================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }

  // 跳过外部请求（如字体、API等）
  if (url.origin !== self.location.origin) {
    return;
  }

  // 跳过 B站下载器的请求（localhost:5000）
  if (url.hostname === 'localhost' && url.port === '5000') {
    return;
  }

  // ================================
  // 缓存策略选择
  // ================================
  
  // 对于音乐和视频文件：直接从网络获取，不缓存
  if (url.pathname.includes('/music/')) {
    event.respondWith(
      fetch(request).catch(error => {
        console.error('[SW] 音乐文件加载失败:', request.url, error);
        return new Response('音乐文件加载失败', { status: 404 });
      })
    );
    return;
  }

  // 对于核心资源：缓存优先，失败时尝试网络
  if (CORE_ASSETS.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // 对于音效文件：缓存优先
  if (url.pathname.includes('/assets/audio/')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // 对于其他资源：网络优先
  event.respondWith(networkFirstStrategy(request));
});

// ================================
// 缓存策略：缓存优先
// ================================
async function cacheFirstStrategy(request) {
  try {
    // 先从缓存中查找
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 从缓存返回:', request.url);
      return cachedResponse;
    }

    // 缓存中没有，从网络获取
    console.log('[SW] 从网络获取:', request.url);
    const networkResponse = await fetch(request);
    
    // 如果是成功的响应，存入缓存
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] 缓存优先策略失败:', error);
    
    // 如果是导航请求，返回离线页面
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }
    
    // 其他资源返回错误
    return new Response('离线状态下无法访问', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// ================================
// 缓存策略：网络优先
// ================================
async function networkFirstStrategy(request) {
  try {
    // 先尝试从网络获取
    console.log('[SW] 尝试从网络获取:', request.url);
    const networkResponse = await fetch(request);
    
    // 如果成功，存入缓存
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] 网络请求失败，尝试使用缓存:', error);
    
    // 网络失败，尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] 从缓存返回:', request.url);
      return cachedResponse;
    }
    
    // 如果是导航请求，返回主页
    if (request.destination === 'document') {
      return caches.match('./index.html');
    }
    
    // 其他资源返回错误
    return new Response('资源不可用', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// ================================
// 消息处理 - 支持手动缓存清理
// ================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] 清除缓存:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ================================
// 后台同步（可选功能）
// ================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncQuotes());
  }
});

async function syncQuotes() {
  try {
    const response = await fetch('./quotes.json');
    const data = await response.json();
    const cache = await caches.open(CACHE_NAME);
    cache.put('./quotes.json', new Response(JSON.stringify(data)));
    console.log('[SW] 名言数据已同步');
  } catch (error) {
    console.error('[SW] 名言同步失败:', error);
  }
}

// ================================
// 推送通知（可选功能）
// ================================
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '专注时间到了！',
    icon: './assets/icon-192.png',
    badge: './assets/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'countdown-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('倒计时提醒', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('./')
  );
});

console.log('[SW] Service Worker 已加载');

