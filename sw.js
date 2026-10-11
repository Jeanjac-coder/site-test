/* Service worker Aube Café : mise en cache des fichiers du site pour un chargement rapide et une consultation hors ligne. */
const VERSION = "aube-v3";
const CORE = [
  "./", "index.html", "styles.css", "config.js", "i18n.js", "script.js", "effects.js", "cafe-3d.js", "vendor/three.module.min.js",
  "fonts/open-sauce-sans-latin-400-normal.woff2", "fonts/open-sauce-sans-latin-500-normal.woff2",
  "fonts/open-sauce-sans-latin-600-normal.woff2", "fonts/open-sauce-sans-latin-700-normal.woff2",
  "images/logo.svg", "images/logo-blanc.svg", "images/favicon.svg", "images/hero/hero-1.webp", "images/hero/hero-1-sm.webp",
  "livraison.html", "confidentialite.html", "cgu.html", "mentions-legales.html", "legal.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Pages et scripts : réseau d'abord (contenu toujours à jour), cache en secours
  if (req.mode === "navigate" || /\.(html|js|css)$/.test(new URL(req.url).pathname)) {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((r) => r || caches.match("index.html")))
    );
    return;
  }
  // Images et polices : cache d'abord
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; }))
  );
});
