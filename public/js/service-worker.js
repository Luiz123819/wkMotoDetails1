// service-worker.js

// ======= CONFIG =======
const CACHE_NAME = "simulador-cache-v6"; // ⬅️ incremente a versão ao mudar assets
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
  // Se você baixar Chart.js local, adicione: "./chart.umd.min.js"
];

// ======= INSTALL: pré-cache dos assets essenciais =======
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ======= ACTIVATE: limpa caches antigos e assume controle =======
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ======= FETCH: estratégias por tipo =======
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Só GET
  if (req.method !== "GET") return;

  // HTML → network-first
  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // CSS/JS do mesmo domínio → stale-while-revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith(".css") || url.pathname.endsWith(".js"))
  ) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Chart.js via CDN → stale-while-revalidate (offline após 1º uso)
  if (/^https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js@/.test(url.href)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Imagens → cache-first
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg") ||
      url.pathname.endsWith(".svg"))
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Default → cache-first
  event.respondWith(cacheFirst(req));
});

// ===== Helpers =====
async function networkFirst(req) {
  try {
    const fresh = await fetch(req, { cache: "no-store" });
    const cache = await caches.open(CACHE_NAME);
    cache.put(req, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await caches.match(req);
    return (
      cached ||
      new Response("Offline", { status: 503, statusText: "Offline" })
    );
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);

  return cached || fetchPromise || fetch(req);
}

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  const cache = await caches.open(CACHE_NAME);
  cache.put(req, res.clone());
  return res;
}