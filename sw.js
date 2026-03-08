// Service Worker for basic PWA caching
const CACHE_NAME = 'skyfall-cache-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/bg-clouds.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
});

self.addEventListener('fetch', (event) => {
    // Bypass API requests and non-GET requests entirely
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    // Network-First strategy to ensure latest files during development
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache the latest version
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
