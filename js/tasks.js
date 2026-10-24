let tasks = [];

async function loadTasks() {
  const { data, error } = await db.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  tasks = data;
  renderTasks();
}

async function addTask() {
  const input = document.getElementById('taskInput');
  const timeInput = document.getElementById('taskTime');
  
  if (!input.value.trim()) return;

  // Берем время, если оно указано
  const remindAt = timeInput.value ? new Date(timeInput.value).toISOString() : null;

  const { error } = await db.from('tasks').insert([{ 
    text: input.value.trim(),
    remind_at: remindAt 
  }]);
  
  if (error) { alert('Ошибка: ' + error.message); return; }
  
  input.value = '';
  timeInput.value = '';
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

function formatDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString('ru-RU', { 
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
  });
}

function renderTasks() {
  const list = document.getElementById('tasksList');
  if (!list) return;
  if (tasks.length === 0) {
    list.innerHTML = '<li style="justify-content:center;color:var(--text-light);">Нет задач</li>';
    return;
  }
  
  list.innerHTML = tasks.map(t => {
    // Проверяем, не просрочена ли задача с напоминанием
    const isOverdue = t.remind_at && new Date(t.remind_at) < new Date() && !t.done;
    
    return `
    <li>
      <label class="item-check">
        <input type="checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask('${t.id}', ${t.done})">
        <div style="display:flex; flex-direction:column;">
          <span class="${t.done ? 'done' : ''}">${t.text}</span>
          ${t.remind_at ? `<span class="time" style="color: ${isOverdue ? '#d9534f' : 'var(--pink-dark)'}">⏰ ${formatDate(t.remind_at)}</span>` : ''}
        </div>
      </label>
      <button class="del" onclick="delTask('${t.id}')">✕</button>
    </li>`;
  }).join('');
}

// Подписка на изменения
db.channel('tasks-channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadTasks)
  .subscribe();
