/*
 * The game, kept: everything it fetches — its code, its models, its sounds —
 * is put in a cache the first time it is seen, and served from there after,
 * so that once it has loaded fully once it loads and plays with no
 * connection at all, from a home screen or a browser. The page itself is
 * fetched afresh whenever there is a connection, so a new build is picked up
 * on the next visit; without one, the kept page is used. The models and the
 * sounds keep their names from build to build, so they would be kept for
 * ever: publishing stamps the build into the name below (tools/publish.sh),
 * and a new name means a new cache, filled afresh, and the old one thrown
 * away — once per publish, and never between.
 */
const CACHE = 'jurassic-fight-20261008083629';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(['./', './index.html', './manifest.webmanifest']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Asked of the server every time, not the browser's own store, which a
    // site may have been told to keep a page in for a while: a new build is
    // then had by the next reload, not ten minutes after.
    event.respondWith(
      fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }
  event.respondWith(
    caches.match(request).then((kept) => kept || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
