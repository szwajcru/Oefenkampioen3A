importScripts('version/version.js'); // importeer centrale versie

const CACHE_NAME = 'site-cache-' + SITE_VERSION;
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/index/style.css',
  '/index/script.js',
  '/index/resultaatGrafiek.js',
  '/changelog/changelog.css',
  '/changelog/changelog.js',
  '/herkansjes/herkansjes.js',
  '/herkansjes/herkansjes.css',
  '/index/feedback.js',
  '/index/feedback.css',
];

/**
 * Installatie — cache vooraf gedefinieerde bestanden
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // activeer direct na installatie
});

/**
 * Activatie — oude caches verwijderen
 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // neem direct controle over alle clients
});

/**
 * Fetch — netwerkverkeer afhandelen en cachen
 */
self.addEventListener('fetch', event => {
  const request = event.request;

  // ❌ Irrelevante requests overslaan
  if (
    request.method !== 'GET' ||
    request.url.startsWith('chrome-extension://') ||
    request.url.startsWith('chrome://') ||
    request.url.startsWith('data:') ||
    request.url.startsWith('blob:')
  ) {
    return;
  }

  // 🧠 Detecteer crawlers (zoals Googlebot, Bingbot, etc.)
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const isBot =
    userAgent.includes('googlebot') ||
    userAgent.includes('bingbot') ||
    userAgent.includes('duckduckbot') ||
    userAgent.includes('yandexbot');

  if (request.mode === 'navigate') {
    if (isBot) {
      // 🔹 Crawlers krijgen directe netwerkrespons (geen offline fallback)
      event.respondWith(fetch(request));
      return;
    }

    // Voor normale gebruikers: netwerk eerst, dan fallback op index.html
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('/', copy));
          return response;
        })
        .catch(() => caches.match('/'))
    );
  } else {
    // Overige bestanden: netwerk eerst, cache fallback
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});

/**
 * Bericht vanuit de client (bijv. voor skipWaiting)
 */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
