// sw.js - Service Worker for Nepali Patro PWA

const CACHE_NAME = 'nepali-patro-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/nepalsambat.html',
  '/unicode.html',
  '/dateconverter.html',
  '/date-difference.html',
  '/age-calculator.html',
  '/festivals.html',
  '/holidays.html',
  '/rashifal.html',
  '/weather.html',
  '/goldsilver.html',
  '/kundali-generator.html',
  '/exchange-rate.html',
  '/nepali_fuel_rates.html',
  '/manifest.json',
  '/offline.html',
  '/event-remainder.html',
  '/quiz-scheduler.html'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching assets');
        // Cache each asset individually instead of addAll(), so one
        // missing/renamed file in the future can't silently break
        // caching for every other page.
        return Promise.allSettled(
          ASSETS_TO_CACHE.map(url =>
            cache.add(url).catch(err => {
              console.warn('[SW] Failed to cache', url, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const request = event.request;

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {
            // Cache successful responses for HTML and CSS/JS
            if (networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, clone);
                });
            }
            return networkResponse;
          })
          .catch(async () => {
            // Guard against a missing/null Accept header, which would
            // otherwise throw here and crash the whole fetch handler.
            const acceptHeader = request.headers.get('Accept') || '';
            const wantsHtml = request.mode === 'navigate' || acceptHeader.includes('text/html');

            if (wantsHtml) {
              const offlinePage = await caches.match('/offline.html');
              if (offlinePage) {
                return offlinePage;
              }
              // Fallback if offline.html itself somehow isn't cached,
              // so we NEVER resolve to undefined (that causes ERR_FAILED).
              return new Response(
                '<h1>You are offline</h1><p>Please reconnect to the internet.</p>',
                { status: 503, headers: { 'Content-Type': 'text/html' } }
              );
            }

            // For other resources, return a simple error response
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
