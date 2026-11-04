const CACHE = "fingerfox-shell-v1";
const SHELL = ["/", "/games", "/daily", "/typing-test", "/manifest.webmanifest", "/icons/fingerfox.svg", "/icons/fingerfox-192.png", "/icons/fingerfox-512.png", "/icons/fingerfox-512-maskable.png"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("message", (event) => { if (event.data === "CLEAR_LOCAL_DATA") event.waitUntil(caches.delete(CACHE)); });
self.addEventListener("fetch", (event) => { if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return; event.respondWith(fetch(event.request).then((response) => { if (response.ok) { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put(event.request, copy)); } return response; }).catch(async () => (await caches.match(event.request)) || (await caches.match("/")))); });
