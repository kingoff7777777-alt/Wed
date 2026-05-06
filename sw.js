const CACHE = "iprights-v1";
const ASSETS = ["/", "/index.html", "/album.html", "/chat.html", "/profile.html", "/bot.js"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{})));
self.addEventListener("fetch", e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
