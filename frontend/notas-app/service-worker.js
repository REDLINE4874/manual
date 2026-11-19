const CACHE_NAME = "notas-app-shell-v28";
const CACHE_PREFIX = "notas-app-shell-";
const APP_SHELL = new URL("./", self.location.href).toString();
const SHELL_FILES = [
  APP_SHELL,
  new URL("./app.css?v=4", self.location.href).toString(),
  new URL("./app.js?v=5", self.location.href).toString(),
  new URL("./supabase-config.js", self.location.href).toString(),
  new URL("./manifest.webmanifest", self.location.href).toString(),
  new URL("./logoapp.svg", self.location.href).toString(),
  new URL("./apple-touch-icon.png", self.location.href).toString(),
  new URL("./icon-192.png", self.location.href).toString(),
  new URL("./icon-512.png", self.location.href).toString(),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(APP_SHELL)) || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
