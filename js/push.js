const VAPID_PUBLIC_KEY = 'BIc8yCU3y6xlroZ6TE-gTmqdjJWQ_220R3JQ2YbzFGX4c-Z4Tm4fRJLT1CVzJ2YmTE1MjwrbRFWNGMpiCoSg4A4';

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

async function enablePush() {
  const btn = document.getElementById('pushBtn');
  
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Ваш браузер не поддерживает уведомления. На iPhone добавьте приложение на экран "Домой" и откройте его оттуда.');
    return;
  }

  try {
    // 1. Сначала регистрируем Service Worker
    btn.textContent = 'Регистрация...';
    await navigator.serviceWorker.register('sw.js');
    
    // 2. Ждем, пока он станет активным (это самое важное!)
    btn.textContent = 'Ожидание...';
    const registration = await navigator.serviceWorker.ready;
    
    // 3. Запрашиваем разрешение
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Вы отклонили запрос на уведомления. Разрешите их в настройках Safari.');
      btn.textContent = '🔔 Включить уведомления';
      return;
    }
    
    // 4. Подписываемся
    btn.textContent = 'Загрузка...';
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    const sub = subscription.toJSON();
    
    await db.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth
    }, { onConflict: 'endpoint' });

    btn.textContent = '🔔 Уведомления включены!';
    btn.style.background = '#a3c9a8';
    btn.disabled = true;
    alert('Отлично! Теперь вы будете получать уведомления.');
    
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Ошибка: ' + err.message);
    btn.textContent = '🔔 Включить уведомления';
  }
}