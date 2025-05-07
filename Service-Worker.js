const CACHE_NAME = "workout-cache-v1.1.1";
const urlsToCache = [
  "index.html",
  "styles.css",
  "app.js",
  "sw.js",
  "manifest.json",
  "pr.html",
  "all-workouts.html",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // Activate new version immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // Control all pages right away
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
