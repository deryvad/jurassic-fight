/*
 * The game, kept, so that it loads and plays with no connection at all, from
 * a home screen or a browser.
 *
 * Every publish makes a new one of these: the build is stamped into the
 * cache's name below and the list of the game's files is written in under it
 * (tools/publish.sh). A new one fetches every file on its list into a cache
 * of its own before it takes over, and only then is the last build's cache
 * thrown away. So whoever has the game has a whole one at every moment — the
 * old build until the new one has all arrived, the new one from then on —
 * and never a page with nothing behind it, which with no connection is a
 * black screen. Should the fetching be cut short, nothing changes, and it is
 * tried again the next time the game is opened.
 *
 * The page itself is fetched afresh whenever there is a connection, so a new
 * build is played on the very next visit; without one, the kept page is used.
 */
const CACHE = 'jurassic-fight-20261008182126';
const FILES = 'apple-touch-icon.png assets/index-DnGjV03Z.css assets/index-ljFiK21-.js icon-192.png icon-512.png index.html manifest.webmanifest models/brood.glb models/bulwark.glb models/dome.glb models/gale.glb models/havoc.glb models/scythe.glb models/trike.glb models/tyrant.glb models/venom.glb models/verdant.glb sounds/CREDITS.md sounds/bellow.mp3 sounds/hiss.mp3 sounds/manifest.json sounds/roar.mp3 sounds/screech.mp3';
/**
 * The files of this build — or nothing, in a build that was never published
 * and so was never given its list: that one keeps what it is asked for, as it
 * is asked.
 */
const LISTED = FILES.startsWith('__') ? null : FILES.split(' ');

self.addEventListener('install', (event) => {
  // Asked of the server, each of them, and not of the browser's own store: a
  // model or a sound keeps its name from build to build, and the store may
  // still be holding the last build's.
  const wanted = ['./'].concat(LISTED || ['index.html', 'manifest.webmanifest'])
    .map((file) => new Request(file, { cache: 'no-cache' }));
  event.waitUntil(
    caches.open(CACHE)
      // All of them or none: one that will not come leaves the cache empty.
      .then((cache) => cache.addAll(wanted).then(() => ofOneBuild(cache)))
      .then(() => self.skipWaiting()),
  );
});

/**
 * The page and the files have to be of one build. Just after a publish a
 * server may still hand out the page of the build before, which asks for code
 * that is not on this list and so has not been kept: better no new cache than
 * that one.
 */
function ofOneBuild(cache) {
  if (!LISTED) return undefined;
  return cache.match('index.html')
    .then((page) => page.text())
    .then((text) => {
      const asked = text.match(/assets\/[^"'\s]+/g) || [];
      if (asked.every((file) => LISTED.includes(file))) return undefined;
      return caches.delete(CACHE).then(() => {
        throw new Error('the page is of another build than its files');
      });
    });
}

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
          // A published build's page was kept along with its files, and stays:
          // a newer page put in its place would ask for code that has not
          // been kept yet. Only a build with no list keeps its page here.
          if (!LISTED) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          }
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
