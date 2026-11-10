// sw.js — E-Rapot Madrasah (update otomatis)
const CACHE_PREFIX = 'erapot-madrasah-';
const CACHE_NAME = CACHE_PREFIX + 'v2'; // naikkan (v3, v4, ...) HANYA bila menambah/mengganti file di urlsToCache
const urlsToCache = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Hanya hapus cache lama milik aplikasi ini; cache aplikasi lain dibiarkan
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k.indexOf(CACHE_PREFIX) === 0 && k !== CACHE_NAME)
        .map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Internet dulu supaya update otomatis terambil; bila offline pakai cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request).then((m) => m || caches.match('./index.html')))
  );
});
