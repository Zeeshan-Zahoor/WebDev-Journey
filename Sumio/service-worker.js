const CACHE_NAME = "sumio-dev-v5.2.5";

/* ================= STATIC ASSETS ================= */
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
  "./initial_messages.css",
  "./theme-dark.css",
  "./theme-ivory.css",

  // JS
  "./script.js",

  // Assets
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./small_sigma.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  // ❗ DO NOT skipWaiting (user controls update)
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // 👈 REQUIRED for navigation control
});

/* ================= FETCH ================= */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  /* 🧠 CRITICAL: Handle navigation requests FIRST */
  if (request.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match("./index.html").then(cached => {
          return cached || fetch(request);
        })
      )
    );
    return;
  }

  /* Static assets: Cache-first + background update */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request)
        .then(networkResponse => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache =>
              cache.put(request, clone)
            );
          }
          return networkResponse;
        })
        .catch(() => {
          // Optional: silent fail for assets
          return cached;
        });
    })
  );
});

/* ================= UPDATE APPROVAL ================= */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    console.log("[SW] Skip waiting approved");
    self.skipWaiting();
  }
});
