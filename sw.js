// sw.js — versie-consistente precache + bot-vriendelijk
// Geen importScripts nodig, versie staat nu hier:
const SITE_VERSION = '2025-11-24-1500';
const CACHE_NAME = 'site-cache-' + SITE_VERSION;



// Alle sourcer per release die consistent moeten zijn
const FILES = [
  'index.html',
  'index/style.css',
  'index/script.js',
  'contact/contact.js',
  'contact/contact.css',
  'changelog/changelog.css',
  'changelog/changelog.js',
  'herkansjes/herkansjes.css',
  'herkansjes/herkansjes.js',
  'database/ankers.js',
  'database/klanken.js',
  'database/lezen.js',
  'index/achtergrond.png',
  'index/ExtraWoordjesAnker.png',
  'index/instructies.html',
  'ankers/ankerwoordjesPopup.css',
  'ankers/ankerwoordjesPopup.js',
  'index/hamburger.js',
  'index/hamburger.css',
  'index/oefenSessions.js'
];

// Helper: vers ophalen met cache-bust, opslaan onder SCHONE URL
async function fetchFreshAndPut(cache, path) {
  const bust = path + (path.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(SITE_VERSION);
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
  self.skipWaiting(); // direct activeren
});

// Activate: oude caches weg — bots NIET re-directen
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()))
    );

    await self.clients.claim();

    // Informeer alleen normale clients (geen bots!)
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const c of clients) {
      c.postMessage({ type: 'NEW_VERSION', version: SITE_VERSION });
    }
  })());
});

// Fetch-logica (met bot-bypass)
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

  const ua = req.headers.get('user-agent') || '';

  // Bots → geen SW gedrag (SEO!)
  if (isBotUA(ua)) {
    event.respondWith(fetch(req));
    return;
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/+/, '');
  const isPrecached = FILES.includes(path);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // Precached file → serve from cache
    if (isPrecached) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;

      // Niet gevonden → probeer opnieuw te precachen
      await fetchFreshAndPut(cache, path);
      return cache.match(req, { ignoreSearch: true });
    }

    // Niet-precached: network first → cache fallback
    try {
      const fresh = await fetch(
        new Request(req.url, { cache: 'reload', mode: req.mode, credentials: req.credentials })
      );
      if (fresh && fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch {
      const fallback = await cache.match(req);
      if (fallback) return fallback;

      // Navigatie fallback naar index.html
      if (req.mode === 'navigate') {
        const index = await cache.match('index.html');
        if (index) return index;
      }
      return Response.error();
    }
  })());
});

// Messages van clients
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

// -----------------------------------------------
// Nieuwe versie melden aan alle open clients
// -----------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window"
    });

    for (const client of clients) {
      client.postMessage({
        type: "SET_SITE_VERSION",
        version: SITE_VERSION
      });
    }
  })());
});
