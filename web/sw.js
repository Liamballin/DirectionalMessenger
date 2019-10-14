self.addEventListener('install', function(e) {
    e.waitUntil(
      caches.open('offline').then(function(cache) {
        return cache.addAll([
          '/offline.html',

        ]);
      })
    );
   });



// self.addEventListener('fetch', function(event) {
//         console.log(event.request.url);
//         event.respondWith(
//             caches.match(event.request).then(function(response) {
//                 console.log("Returning cached page from sw.js")
//             return response || fetch(event.request);
//         })
//     );
// });

const offlineUrl = "/offline.html"
this.addEventListener('fetch', event => {
    // request.mode = navigate isn't supported in all browsers
    // so include a check for Accept: text/html header.
    if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
          event.respondWith(
            fetch(event.request.url).catch(error => {
                // Return the offline page
                return caches.match(offlineUrl);
            })
      );
    }
    else{
          // Respond with everything else if we can
          event.respondWith(caches.match(event.request)
                          .then(function (response) {
                          return response || fetch(event.request);
                      })
              );
        }
  });
  