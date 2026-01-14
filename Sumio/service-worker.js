const CACHE_NAME = "sumio-dev-v5.2.3";

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
  if (event.request.method !== "GET") return;

  const request = event.request;

  // 🧠 Handle app navigation (VERY IMPORTANT)
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html").then((cached) => {
        return cached || fetch(request);
      })
    );
    return;
  }

  // Assets (JS, CSS, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((networkResponse) => {
          // Cache new assets
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, clone)
            );
          }
          return networkResponse;
        })
      );
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
