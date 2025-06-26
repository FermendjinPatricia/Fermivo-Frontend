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
  event.waitUntil( // Așteaptă până când cache-ul este creat
    caches.open(CACHE_NAME).then((cache) => { // Deschide cache-ul specificat
      return cache.addAll(urlsToCache); // Adaugă URL-urile specificate în cache
    })
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() => {
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline.html');
          }
        })
      );
    })
  );
});


self.addEventListener('activate', (event) => { // Evenimentul de activare a service worker-ului
  event.waitUntil( // Așteaptă până când cache-ul este curățat
    caches.keys().then((cacheNames) => 
      Promise.all( // Obține toate numele de cache-uri existente
        cacheNames.map((cacheName) => { // Iterează prin fiecare nume de cache
          if (cacheName !== CACHE_NAME) { // Dacă numele cache-ului nu este cel curent
            return caches.delete(cacheName); // Șterge cache-urile vechi care nu mai sunt necesare
          }
        })
      )
    )
  );
});
