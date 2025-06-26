const CACHE_NAME = 'fermivo-v2'; // Nume al cache version
const urlsToCache = [ // Lista de URL-uri de cache
  '/',
  '/index.html', // Pagina principală
  '/manifest.json', // Manifestul aplicației web
  '/icons/icon-192x192.png', 
  '/icons/icon-512x512.png',
  '/assets/login.jpg', // Imaginea pentru autentificare
  '/assets/register.jpg', // Imaginea pentru înregistrare
  '/offline.html', // Pagina de rezervă pentru offline
];
self.addEventListener('install', (event) => { // Evenimentul de instalare a service worker-ului
    self.skipWaiting();
  event.waitUntil( // Așteaptă până când cache-ul este creat
    caches.open(CACHE_NAME).then((cache) => { // Deschide cache-ul specificat
      return cache.addAll(urlsToCache); // Adaugă URL-urile specificate în cache
    })
  );
});


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Clonează răspunsul și cache-uiește-l
          cache.put(event.request, response.clone());
          return response;
        });
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim()) // ✅ Ia controlul imediat
  );
});
