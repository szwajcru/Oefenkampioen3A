// -----------------------------------------------------
// iPad-PROOF SERVICE WORKER
// Versie + cachebundel
// -----------------------------------------------------
const SITE_VERSION = '2025.1124.2315';
const CACHE_NAME = 'site-cache-' + SITE_VERSION;

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

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function isBotUA(ua) {
  ua = (ua || '').toLowerCase();
  return ua.includes('googlebot') ||
    ua.includes('bingbot') ||
    ua.includes('duckduckbot') ||
    ua.includes('yandexbot') ||
    ua.includes('baiduspider');
}

async function fetchFreshAndPut(cache, path) {
  const bust = path + (path.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(SITE_VERSION);
  const res = await fetch(new Request(bust, { cache: 'reload' }));
  if (!res.ok) throw new Error(`Precache faalde: ${path} (${res.status})`);
  await cache.put(path, res.clone());
}

// -----------------------------------------------------
// INSTALL
// -----------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(FILES.map(p => fetchFreshAndPut(cache, p)));
  })());

  // SW onmiddelijk actief
  self.skipWaiting();
});

// -----------------------------------------------------
// ACTIVATE — éénmalige versiepush + cache cleanup
// -----------------------------------------------------
self.addEventListener('activate', event => {
  event.waitUntil((async () => {

    // oude caches verwijderen
    const keys = await caches.keys();
    await Promise.all(keys.map(k =>
      (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())
    ));

    await self.clients.claim();

    // -----------------------------------------------------
    // 🔥 iPad FIX: Forceer altijd een versie-update-signaal
    // -----------------------------------------------------
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const c of clients) {
      c.postMessage({
        type: 'NEW_VERSION',
        version: SITE_VERSION
      });
    }
  })());
});

// -----------------------------------------------------
// FETCH
// -----------------------------------------------------
self.addEventListener('fetch', event => {
  const req = event.request;

  // compleet negeren van bepaalde requests
  if (
    req.method !== 'GET' ||
    req.url.startsWith('chrome-extension://') ||
    req.url.startsWith('chrome://') ||
    req.url.startsWith('data:') ||
    req.url.startsWith('blob:')
  ) return;

  // bots → geen service worker
  const ua = req.headers.get('user-agent') || '';
  if (isBotUA(ua)) {
    event.respondWith(fetch(req));
    return;
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/+/, '');
  const isPrecached = FILES.includes(path);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    // precached
    if (isPrecached) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;

      // herstel precache indien nodig
      await fetchFreshAndPut(cache, path);
      return cache.match(req, { ignoreSearch: true });
    }

    // network-first
    try {
      const netRes = await fetch(
        new Request(req.url, {
          cache: 'reload',
          mode: req.mode,
          credentials: req.credentials
        })
      );
      if (netRes && netRes.ok) cache.put(req, netRes.clone());
      return netRes;
    } catch {
      const fallback = await cache.match(req);
      if (fallback) return fallback;

      if (req.mode === 'navigate') {
        const index = await cache.match('index.html');
        if (index) return index;
      }
      return Response.error();
    }
  })());
});

// -----------------------------------------------------
// MESSAGES
// -----------------------------------------------------
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
