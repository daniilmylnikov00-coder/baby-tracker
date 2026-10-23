let tasks = JSON.parse(localStorage.getItem('family_tasks') || '[]');

function addTask() {
  const input = document.getElementById('taskInput');
  if (!input.value.trim()) return;
  tasks.unshift({ id: Date.now(), text: input.value.trim(), done: false });
  input.value = '';
  localStorage.setItem('family_tasks', JSON.stringify(tasks));
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  localStorage.setItem('family_tasks', JSON.stringify(tasks));
  renderTasks();
}

function delTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('family_tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('tasksList');
  if (!list) return;
  if (tasks.length === 0) {
    list.innerHTML = '<li style="justify-content:center;color:var(--text-light);">Нет задач</li>';
    return;
  }
  list.innerHTML = tasks.map(t => `
    <li>
      <label class="item-check">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${t.id})">
        <span class="${t.done ? 'done' : ''}">${t.text}</span>
      </label>
      <button class="del" onclick="delTask(${t.id})">✕</button>
    </li>`).join('');
}