self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Мыльниковы Family';
  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});