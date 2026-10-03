// Het Thuisfront: eerst het netwerk (altijd de nieuwste versie), de cache alleen als je offline bent.
const CACHE = "thuisfront-v1";
const SCHIL = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SCHIL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // alleen de eigen bestanden; Firebase regelt zijn eigen verkeer
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then(res => {
        if (res.ok) {
          const kopie = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, kopie));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
