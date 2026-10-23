const CODE = '2171';

function unlock() {
  const input = document.getElementById('code').value;
  if (input === CODE) {
    sessionStorage.setItem('unlocked', '1');
    showApp();
  } else {
    document.getElementById('err').textContent = 'Неверный код';
    document.getElementById('code').value = '';
  }
}

function showApp() {
  document.getElementById('lock').style.display = 'none';
  document.getElementById('app').style.display = 'flex'; 
  
  if (window.db) {
    loadEvents();
    loadTasks();
    loadShop();

    // 1. Пытаемся использовать Realtime (мгновенные обновления)
    db.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadEvents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop' }, () => loadShop())
      .subscribe((status) => {
        console.log('Realtime статус:', status);
      });

    // 2. СТРАХОВКА: Принудительно проверяем базу каждые 3 секунды
    // Это сработает, даже если Realtime не поддерживается браузером
    setInterval(() => {
      // Обновляем только активную вкладку, чтобы не грузить телефон
      const activeTab = document.querySelector('.tab-content.active').id;
      if (activeTab === 'tab-byt') loadEvents();
      if (activeTab === 'tab-tasks') loadTasks();
      if (activeTab === 'tab-shop') loadShop();
    }, 3000);
  }
}

function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  
  // Мгновенно обновляем при клике
  if (id === 'byt') loadEvents();
  if (id === 'tasks') loadTasks();
  if (id === 'shop') loadShop();
}

if (sessionStorage.getItem('unlocked')) {
  showApp();
}