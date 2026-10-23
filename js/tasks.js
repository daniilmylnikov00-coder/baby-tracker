let tasks = [];

async function loadTasks() {
  const { data, error } = await db.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  tasks = data;
  renderTasks();
}

async function addTask() {
  const input = document.getElementById('taskInput');
  if (!input.value.trim()) return;
  const { error } = await db.from('tasks').insert([{ text: input.value.trim() }]);
  if (error) { alert('Ошибка: ' + error.message); return; }
  input.value = '';
  loadTasks();
}

async function toggleTask(id, currentStatus) {
  const { error } = await db.from('tasks').update({ done: !currentStatus }).eq('id', id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  loadTasks();
}

async function delTask(id) {
  const { error } = await db.from('tasks').delete().eq('id', id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  loadTasks();
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
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask('${t.id}', ${t.done})">
        <span class="${t.done ? 'done' : ''}">${t.text}</span>
      </label>
      <button class="del" onclick="delTask('${t.id}')">✕</button>
    </li>`).join('');
}

db.channel('tasks-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadTasks)
  .subscribe();