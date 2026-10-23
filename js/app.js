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
    // Первичная загрузка данных
    loadEvents();
    loadTasks();
    loadShop();

    // Единая подписка на все изменения в базе (Realtime)
    db.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        loadTasks();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop' }, () => {
        loadShop();
      })
      .subscribe((status) => {
        console.log('Статус Realtime:', status); // Если что-то не так, мы увидим это в консоли
      });
  }
}

function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  
  // Принудительно обновляем данные при переключении вкладки (на случай, если Realtime затупит)
  if (id === 'byt') loadEvents();
  if (id === 'tasks') loadTasks();
  if (id === 'shop') loadShop();
}

if (sessionStorage.getItem('unlocked')) {
  showApp();
}