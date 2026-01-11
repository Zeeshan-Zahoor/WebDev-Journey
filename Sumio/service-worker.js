const CACHE_NAME = "sumio-dev-v5.2.0";

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
  console.log("[SW] Installing…");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  // ⚠️ DO NOT skipWaiting here (user controls update)
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating…");
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
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // 1️⃣ Serve from cache immediately if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2️⃣ Try network
      return fetch(request)
        .then((networkResponse) => {
          // Cache successful network responses
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
          // 3️⃣ Fallback for offline / weak network
          if (request.destination === "document") {
            return caches.match("./index.html");
          }
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
