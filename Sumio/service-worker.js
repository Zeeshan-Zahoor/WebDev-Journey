const CACHE_NAME = "sumio-dev-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  // CSS
  "./style.css",
  "./details.css",
  "./partition_card.css",
  "./expense_container.css",
  "./progress_circle.css",
  "./helpers.css",

  // Icons
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./small_sigma.png"
];

// Install
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});


// - JS/CSS → Network first (always fresh)
// - Others → Cache first
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Ignore non-GET
  if (request.method !== "GET") return;

  // Always get fresh JS & CSS
  if (
    request.url.endsWith(".js") ||
    request.url.endsWith(".css")
  ) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default: cache first
  event.respondWith(
    caches.match(request).then(response =>
      response || fetch(request)
    )
  );
});
