// Simple Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Notifikasi Tambang',
    body: 'Ada update baru',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: { url: '/home' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.notification) {
        notificationData = {
          ...notificationData,
          ...payload.notification
        };
      }
    } catch (e) {
      console.log('Could not parse push payload:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data
    }
  );

  event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/home';
  
  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function(windowClients) {
    let matchingClient = null;
    
    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url.includes(self.location.origin)) {
        matchingClient = windowClient;
        break;
      }
    }
    
    if (matchingClient) {
      return matchingClient.focus().then(function() {
        return matchingClient.navigate(urlToOpen);
      });
    } else {
      return clients.openWindow(urlToOpen);
    }
  });
  
  event.waitUntil(promiseChain);
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating');
  event.waitUntil(self.clients.claim());
});