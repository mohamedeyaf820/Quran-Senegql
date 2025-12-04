
const CACHE_NAME = 'quran-sn-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // External CDNs used in index.html
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.1/',
  'https://aistudiocdn.com/react@^19.2.1',
  'https://aistudiocdn.com/lucide-react@^0.555.0',
  'https://aistudiocdn.com/react-dom@^19.2.1/'
];

// Install Event: Cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests that aren't in our cache list logic (like API calls)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Hit Cache
      }
      return fetch(event.request).then((response) => {
        // Optional: Dynamic caching could go here, but we'll stick to static for safety
        return response;
      });
    })
  );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
