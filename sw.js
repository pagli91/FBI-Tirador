const CACHE_NAME = 'fbi-app-v01';
const FILES_TO_CACHE = [
  './',
  './index.html'
];

// Instalación: guarda los archivos en caché
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('SW: guardando archivos en caché');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          console.log('SW: eliminando caché viejo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch: sirve desde caché, con fallback a red
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response; // sirve desde caché
      }
      // no está en caché → intenta la red
      return fetch(event.request).then(function(networkResponse) {
        // guarda la respuesta nueva en caché
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // sin red y sin caché → devuelve el index como fallback
        return caches.match('./index.html');
      });
    })
  );
});
