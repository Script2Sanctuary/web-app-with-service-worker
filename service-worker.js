const CACHE_NAME = 'offline-cache-v1';
const urlsToCache = [
    '/offline-web-app/',
    '/offline-web-app/index.html',
    '/offline-web-app/styles.css',
    '/offline-web-app/script.js',
    '/offline-web-app/service-worker.js'
];

self.addEventListener('install', event => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache)
                    .then(() => console.log('All resources have been cached successfully'))
                    .catch(error => console.error('Failed to cache resources:', error));
            })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Returning from cache:', event.request.url);
                    return response;
                }
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request).then(
                    (networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                );
            }).catch(error => {
                console.error('Fetch failed; returning offline page instead.', error);
                return caches.match('/offline-web-app/index.html');
            })
    );
});
