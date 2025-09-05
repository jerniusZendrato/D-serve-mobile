self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Pesanan Baru';
  const options = {
    body: data.body || 'Ada pesanan baru untuk tambang',
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    data: data.data || { url: '/' },
    actions: [
      { action: 'view', title: 'Lihat Pesanan' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
