importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
const CACHE_NAME = 'sportmeet-v4';
const ASSETS_CACHE_NAME = 'sportmeet-assets-v3';
const IMAGES_CACHE_NAME = 'sportmeet-images-v3';
const CDN_CACHE_NAME = 'sportmeet-cdn-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on install - Critical path only0
const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/style.css',
  '/pwa-install.js'
];

// Install event - Fast minimal precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(ASSETS_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - Cleanup and enable navigation preload
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME, ASSETS_CACHE_NAME, IMAGES_CACHE_NAME, CDN_CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // Enable navigation preload for instant page loads
      'navigationPreload' in self.registration ?
        self.registration.navigationPreload.enable() : Promise.resolve(),
      // Cleanup old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheAllowlist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ]).then(() => self.clients.claim())
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

  // 3. Data (JSON) - Network First with instant cache fallback
  const isData = url.pathname.endsWith('.json') || url.pathname.includes('/api/');

  if (isData) {
    event.respondWith(
      Promise.race([
        // Try network first but with timeout
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }),
        // Fallback to cache after 3 seconds
        new Promise((resolve) => {
          setTimeout(() => {
            caches.match(event.request).then((cached) => {
              if (cached) resolve(cached);
            });
          }, 3000);
        })
      ]).catch(() => caches.match(event.request))
    );
    return;
  }

  // 4. CDN Resources (Fonts, Icons) - Cache First with long expiry
  const isCDN = url.origin !== location.origin;

  if (isCDN) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CDN_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 5. Everything else - Stale-While-Revalidate for instant loads
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(ASSETS_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });

      // Return cached immediately, update in background
      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(updateScoresInBackground());
  }
});

async function updateScoresInBackground() {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch('/data/2026.json');
    if (response.ok) {
      await cache.put('/data/2026.json', response);
    }
  } catch (e) {
    console.error('Background sync failed', e);
  }
}
