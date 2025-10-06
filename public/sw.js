// Service Worker for Aztec Citizens Revival PWA
const CACHE_NAME = 'aztec-revival-v2';

const urlsToCache = [
  '/images/purple_logo_splash.png',
  '/images/aztec-nm-main-street.jpg',
  '/images/aztec-nm-riverside-park.jpg',
  '/images/aztec-nm-community-center.jpg',
  '/favicon.ico',
  '/manifest.json'
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
  // Don't cache JavaScript, CSS, or HTML files to avoid blank screen issues
  if (event.request.url.includes('.js') || 
      event.request.url.includes('.css') || 
      event.request.url.endsWith('.html') ||
      event.request.url.endsWith('/')) {
    return;
  }
  
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
