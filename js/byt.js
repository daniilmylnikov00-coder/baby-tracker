const TYPES = { feed: '🍼 Кормление', sleep: '😴 Сон', diaper: '💩 Подгузник' };
let events = [];

// Загрузка событий из базы
async function loadEvents() {
  const { data, error } = await db.from('events').select('*').order('started_at', { ascending: false }).limit(20);
  if (error) { console.error(error); return; }
  events = data;
  renderEvents();
}

// Добавление события в базу
async function addEvent(type) {
  const { error } = await db.from('events').insert([{ type: type }]);
  if (error) { alert('Ошибка: ' + error.message); return; }
  loadEvents(); // Обновляем список
}

// Удаление события
async function delEvent(id) {
  const { error } = await db.from('events').delete().eq('id', id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  loadEvents();
}

function ago(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return s + ' сек назад';
  if (s < 3600) return Math.floor(s / 60) + ' мин назад';
  return Math.floor(s / 3600) + ' ч ' + Math.floor((s % 3600) / 60) + ' мин назад';
}

function renderEvents() {
  const lastFeed = events.find(e => e.type === 'feed');
  const box = document.getElementById('lastFeedBox');
  if (box) box.textContent = lastFeed ? 'Последнее кормление: ' + ago(lastFeed.started_at) : 'Кормлений пока не было';

  const list = document.getElementById('eventsList');
  if (list) {
    list.innerHTML = events.map(e => `
      <li>
        <div>
          <div style="font-weight: 600;">${TYPES[e.type]}</div>
          <span class="time">${new Date(e.started_at).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})} · ${ago(e.started_at)}</span>
        </div>
        <button class="del" onclick="delEvent('${e.id}')">✕</button>
      </li>`).join('');
  }
}

