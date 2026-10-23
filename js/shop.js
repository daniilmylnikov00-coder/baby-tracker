let shopItems = JSON.parse(localStorage.getItem('family_shop') || '[]');

function addShop() {
  const input = document.getElementById('shopInput');
  if (!input.value.trim()) return;
  shopItems.unshift({ id: Date.now(), text: input.value.trim(), done: false });
  input.value = '';
  localStorage.setItem('family_shop', JSON.stringify(shopItems));
  renderShop();
}

function toggleShop(id) {
  shopItems = shopItems.map(s => s.id === id ? { ...s, done: !s.done } : s);
  localStorage.setItem('family_shop', JSON.stringify(shopItems));
  renderShop();
}

function delShop(id) {
  shopItems = shopItems.filter(s => s.id !== id);
  localStorage.setItem('family_shop', JSON.stringify(shopItems));
  renderShop();
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
        <input type="checkbox" ${s.done ? 'checked' : ''} onchange="toggleShop(${s.id})">
        <span class="${s.done ? 'done' : ''}" style="word-break: break-all;">${s.text}</span>
      </label>
      <button class="del" onclick="delShop(${s.id})">✕</button>
    </li>`).join('');
}