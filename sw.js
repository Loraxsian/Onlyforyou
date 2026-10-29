// Service Worker for Jessica's Birthday Surprise Web Push
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Pesan Baru', body: event.data.text() };
    }
  }

  const title = data.title || 'Ada Cerita Baru untukmu! ✨';
  const options = {
    body: data.body || 'Buka website untuk melihat kenangan baru yang ditambahkan.',
    icon: data.icon || 'assets/gallery/Pic1.jpeg',
    badge: data.icon || 'assets/gallery/Pic1.jpeg',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || 'https://onlyforjessica.my.id'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || 'https://onlyforjessica.my.id';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('onlyforjessica.my.id') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
