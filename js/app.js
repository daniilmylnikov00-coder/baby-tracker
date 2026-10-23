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
    loadPhotos('varya');
    loadPhotos('family');

    db.channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadEvents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop' }, () => loadShop())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, (payload) => {
         if (payload.new && payload.new.album_type) loadPhotos(payload.new.album_type);
         else if (payload.old) { loadPhotos('varya'); loadPhotos('family'); }
      })
      .subscribe();

    setInterval(() => {
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
  
  if (id === 'byt') loadEvents();
  if (id === 'tasks') loadTasks();
  if (id === 'shop') loadShop();
  if (id === 'varya') loadPhotos('varya');
  if (id === 'family') loadPhotos('family');
}

if (sessionStorage.getItem('unlocked')) {
  showApp();
}