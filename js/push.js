// Публичный ключ для уведомлений
const VAPID_PUBLIC_KEY = 'BK8qFk6jH5N9mXz8qL3wR2tY7vB4cX1zA9sD5fG6hJ7kL8mN9pQ0rS1tU2vW3xY4zA5bC6dE7fG8hJ9kL0mN1pQ2rS3tU4vW5x';

// Вспомогательная функция для конвертации ключа
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Функция подписки
async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push-уведомления не поддерживаются этим браузером');
    return;
  }

  try {
    // Регистрируем Service Worker
    const registration = await navigator.serviceWorker.register('sw.js');
    
    // Подписываемся на пуши
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Сохраняем подписку в базу данных Supabase
    const sub = subscription.toJSON();
    await db.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth
    }, { onConflict: 'endpoint' });

    console.log('Успешно подписались на уведомления!');
  } catch (err) {
    console.error('Ошибка подписки на уведомления:', err);
  }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Если разрешение уже дано - подписываемся тихо
  if (Notification.permission === 'granted') {
    subscribeToPush();
  } 
  // Если еще не спрашивали - показываем запрос
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        subscribeToPush();
      }
    });
  }
});