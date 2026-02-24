importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
const CACHE_NAME = 'sportmeet-v4';
const ASSETS_CACHE_NAME = 'sportmeet-assets-v3';
const IMAGES_CACHE_NAME = 'sportmeet-images-v3';
const CDN_CACHE_NAME = 'sportmeet-cdn-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install - Critical path only0
const PRECACHE_ASSETS = [
  './',
  'index2.html',
  'offline.html',
  'style.css',
  'app.js',
  'pwa-install.js',
  'pwa-features.js'
];

// Install event - Fast minimal precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - Cleanup
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [IMAGES_CACHE_NAME, ASSETS_CACHE_NAME]; // Keep ASSETS for core files
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheAllowlist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Request deduplication map
const pendingRequests = new Map();

// Enhanced Fetch Strategy for Maximum Speed
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation Requests - Network First with Preload
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;
          return await fetch(event.request);
        } catch (error) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          const cache = await caches.open(ASSETS_CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // 2. Images - Cache First (Instant Load)
  const isImage = event.request.destination === 'image' ||
    /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname);

  if (isImage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        // Deduplicate concurrent image requests
        const requestKey = event.request.url;
        if (pendingRequests.has(requestKey)) {
          return pendingRequests.get(requestKey);
        }

        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(IMAGES_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          pendingRequests.delete(requestKey);
          return networkResponse;
        }).catch(() => {
          pendingRequests.delete(requestKey);
        });

        pendingRequests.set(requestKey, fetchPromise);
        return fetchPromise;
      })
    );
    return;
  }

  // 3. Data (JSON) - Network Only
  const isData = url.pathname.endsWith('.json') || url.pathname.includes('/api/');

  if (isData) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 4. CDN Resources - Network Only
  const isCDN = url.origin !== location.origin;

  if (isCDN) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 5. Everything else - Network Only
  event.respondWith(fetch(event.request));
});

// Background Sync removed to avoid data caching
self.addEventListener('periodicsync', (event) => {
  // Disabled as per request to only cache images
});
