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
  renderAll();
}

function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
}

function renderAll() {
  renderEvents();
  renderTasks();
  renderShop();
}

if (sessionStorage.getItem('unlocked')) {
  showApp();
}