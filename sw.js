// sw.js — versie-consistente precache + bot-vriendelijk (geen fallback/redirect voor crawlers)
importScripts('version/version.js'); // levert (globaal) self.SITE_VERSION

const CACHE_NAME = 'site-cache-' + 'v2025-11-07-04';

// Alle sourcer per release die consistent moeten zijn
const FILES = [
  'index.html',
  'index/style.css',
  'index/script.js',
  'index/resultaatGrafiek.js',
  'index/feedback.js',
  'index/feedback.css',
  'changelog/changelog.css',
  'changelog/changelog.js',
  'herkansjes/herkansjes.css',
  'herkansjes/herkansjes.js',
  'index/ankers.js',
  'index/klanken.js',
  'index/lezen.js',
  'index/achtergrond.png',
  'index/instructies.html',
];

// Helper: vers ophalen met cache-bust, opslaan onder SCHONE URL
async function fetchFreshAndPut(cache, path) {
  const bust = path + (path.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(self.SITE_VERSION);
  const res = await fetch(new Request(bust, { cache: 'reload' }));
  if (!res.ok) throw new Error(`Precache faalde: ${path} (${res.status})`);
  await cache.put(path, res.clone());
}

// Eenvoudige botdetectie (genoeg voor SEO-doeleinden)
function isBotUA(ua) {
  ua = (ua || '').toLowerCase();
  return ua.includes('googlebot') || ua.includes('bingbot') ||
    ua.includes('duckduckbot') || ua.includes('yandexbot') ||
    ua.includes('baiduspider');
}

// Install: volledige bundel vers binnenhalen
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(FILES.map(p => fetchFreshAndPut(cache, p)));
  })());
  self.skipWaiting();
});

// Activate: oude caches weg; geen client-redirect voor bots
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : Promise.resolve()));
    await self.clients.claim();

    // Informeer alleen normale clients (niet de bots) dat er een nieuwe versie is
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of clients) c.postMessage({ type: 'NEW_VERSION', version: self.SITE_VERSION });
  })());
});

// Fetch: 
// - BOTS: ALTIJD direct netwerk, geen cache, geen fallback => geen soft-404/redirect
// - Precached: cache-first (consistente bundel per versie)
// - Overig: network-first met cache: 'reload', fallback op cache, en voor navigations op index.html (alleen voor mensen)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Requests die we sowieso negeren
  if (
    req.method !== 'GET' ||
    req.url.startsWith('chrome-extension://') ||
    req.url.startsWith('chrome://') ||
    req.url.startsWith('data:') ||
    req.url.startsWith('blob:')
  ) return;

  // BOTS: volledig bypassen (belangrijk voor SEO)
  const ua = req.headers.get('user-agent') || '';
  if (isBotUA(ua)) {
    event.respondWith(fetch(req)); // geen caching/rewrites/fallbacks
    return;
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/+/, '');
  const isPrecached = FILES.includes(path);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    if (isPrecached) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      // herstel precache indien leeg
      await fetchFreshAndPut(cache, path);
      return cache.match(req, { ignoreSearch: true });
    }

    try {
      const fresh = new Request(req.url, { cache: 'reload', mode: req.mode, credentials: req.credentials });
      const net = await fetch(fresh);
      if (net && net.ok) cache.put(req, net.clone());
      return net;
    } catch {
      const fallback = await cache.match(req);
      if (fallback) return fallback;

      // Navigatie fallback ALLEEN voor mensen (bots vallen hierboven al buiten)
      if (req.mode === 'navigate') {
        const index = await cache.match('index.html');
        if (index) return index;
      }
      return Response.error();
    }
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
