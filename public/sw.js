// Service Worker for Aztec Citizens Revival PWA
const CACHE_NAME = 'aztec-revival-v1';

// Get the base path from the current location
const getBasePath = () => {
  const pathname = self.location.pathname;
  return pathname.includes('/launch-site/') ? '/launch-site/' : '/';
};

const basePath = getBasePath();
const urlsToCache = [
  basePath,
  basePath + 'index.html',
  basePath + 'assets/',
  basePath + 'images/purple_logo_splash.png',
  basePath + 'images/aztec-nm-main-street.jpg',
  basePath + 'images/aztec-nm-riverside-park.jpg',
  basePath + 'images/aztec-nm-community-center.jpg',
  basePath + 'favicon.ico',
  basePath + 'manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
