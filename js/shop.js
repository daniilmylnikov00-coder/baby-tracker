let shopItems = [];

async function loadShop() {
  const { data, error } = await db.from('shop').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  shopItems = data;
  renderShop();
}

async function addShop() {
  const input = document.getElementById('shopInput');
  if (!input.value.trim()) return;
  const { error } = await db.from('shop').insert([{ text: input.value.trim() }]);
  if (error) { alert('Ошибка: ' + error.message); return; }
  input.value = '';
  loadShop();
}

async function toggleShop(id, currentStatus) {
  const { error } = await db.from('shop').update({ done: !currentStatus }).eq('id', id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  loadShop();
}

async function delShop(id) {
  const { error } = await db.from('shop').delete().eq('id', id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  loadShop();
}

function renderShop() {
  const list = document.getElementById('shopList');
  if (!list) return;
  if (shopItems.length === 0) {
    list.innerHTML = '<li style="justify-content:center;color:var(--text-light);">Список пуст</li>';
    return;
  }
  list.innerHTML = shopItems.map(s => `
    <li>
      <label class="item-check">
        <input type="checkbox" ${s.done ? 'checked' : ''} onchange="toggleShop('${s.id}', ${s.done})">
        <span class="${s.done ? 'done' : ''}" style="word-break: break-all;">${s.text}</span>
      </label>
      <button class="del" onclick="delShop('${s.id}')">✕</button>
    </li>`).join('');
}

db.channel('shop-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'shop' }, loadShop)
  .subscribe();