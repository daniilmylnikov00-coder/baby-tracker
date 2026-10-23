const TYPES = { feed: '🍼 Кормление', sleep: '😴 Сон', diaper: '💩 Подгузник' };
let events = JSON.parse(localStorage.getItem('baby_events') || '[]');

function addEvent(type) {
  events.unshift({ id: Date.now() + Math.random(), type, at: new Date().toISOString() });
  localStorage.setItem('baby_events', JSON.stringify(events));
  renderEvents();
}

function delEvent(id) {
  events = events.filter(e => e.id !== id);
  localStorage.setItem('baby_events', JSON.stringify(events));
  renderEvents();
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
  if (box) box.textContent = lastFeed ? 'Последнее кормление: ' + ago(lastFeed.at) : 'Кормлений пока не было';

  const list = document.getElementById('eventsList');
  if (list) {
    list.innerHTML = events.slice(0, 20).map(e => `
      <li>
        <div>
          <div style="font-weight: 600;">${TYPES[e.type]}</div>
          <span class="time">${new Date(e.at).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})} · ${ago(e.at)}</span>
        </div>
        <button class="del" onclick="delEvent(${e.id})">✕</button>
      </li>`).join('');
  }
}