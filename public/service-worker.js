// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

self.__WB_MANIFEST;

const CACHE = "pwabuilder-page";


const offlineFallbackPage = "offline.html ";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-anunturi') {
    event.waitUntil(syncAnunturiOffline());
  }
});

async function syncAnunturiOffline() {
  const db = await openDB('fermi-db', 1, {
    upgrade(db) {
      db.createObjectStore('anunturiOffline', { keyPath: 'id', autoIncrement: true });
    },
  });

  const allAnunturi = await db.getAll('anunturiOffline');

  for (const anunt of allAnunturi) {
    try {
      await fetch('https://fermivo-backend.onrender.com/api/anunturi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anunt.token}`
        },
        body: JSON.stringify(anunt.data)
      });
      await db.delete('anunturiOffline', anunt.id);
    } catch (e) {
      console.error("Eroare la sync:", e);
      return; // ieșim dacă a eșuat ceva
    }
  }
}
