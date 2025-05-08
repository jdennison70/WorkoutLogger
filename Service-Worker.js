const CACHE_NAME = "workout-cache-v1.0.1.2"; // bump this for every update

const urlsToCache = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "sw.js",
  "pr.html",
  "all-workouts.html",
  "icon-192.png",
  "icon-512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting(); // <- Forces update immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim(); // <- Controls already open clients
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
