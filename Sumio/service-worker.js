const CACHE_NAME = "sumio-dev-v5.0.5";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",

  "./style.css",
  "./details.css",
  "./partition_card.css",
  "./expense_container.css",
  "./progress_circle.css",
  "./helpers.css",
  "./initial_messages.css",

  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./small_sigma.png"
];

// Install — dont skip waiting
self.addEventListener("install", (event) => {
  console.log("[SW] Installed, waiting...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Activate, happens only after user accepts update
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

// Listen for user approval
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
