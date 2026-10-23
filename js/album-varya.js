let varyaPhotos = [];
let familyPhotos = [];

// Загрузка фото из базы
async function loadPhotos(type) {
  const { data, error } = await db.from('photos').select('*').eq('album_type', type).order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  
  if (type === 'varya') {
    varyaPhotos = data;
    renderGallery('varyaGallery', varyaPhotos);
  } else {
    familyPhotos = data;
    renderGallery('familyGallery', familyPhotos);
  }
}

// Загрузка файла
async function uploadPhoto(input, albumType) {
  const file = input.files[0];
  if (!file) return;

  const captionInput = document.getElementById(albumType + 'PhotoCaption');
  const caption = captionInput.value;

  // Меняем текст кнопки, показываем загрузку
  const btn = input.previousElementSibling;
  const oldText = btn.textContent;
  btn.textContent = 'Загрузка...';
  btn.disabled = true;

  try {
    // 1. Загружаем файл в Storage
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { error: uploadError } = await db.storage.from('photos').upload(fileName, file);
    if (uploadError) throw uploadError;

    // 2. Получаем публичную ссылку
    const { data: { publicUrl } } = db.storage.from('photos').getPublicUrl(fileName);

    // 3. Сохраняем запись в таблицу базы
    const { error: dbError } = await db.from('photos').insert([
      { album_type: albumType, url: publicUrl, caption: caption }
    ]);
    if (dbError) throw dbError;

    // Сброс полей и обновление
    captionInput.value = '';
    input.value = '';
    loadPhotos(albumType);
  } catch (error) {
    alert('Ошибка загрузки: ' + error.message);
  } finally {
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

// Удаление фото
async function deletePhoto(id, albumType, fileUrl) {
  if (!confirm('Удалить это фото?')) return;
  
  // Достаем имя файла из ссылки
  const fileName = fileUrl.split('/').pop();
  
  // Удаляем из Storage
  await db.storage.from('photos').remove([fileName]);
  
  // Удаляем из базы
  await db.from('photos').delete().eq('id', id);
  
  loadPhotos(albumType);
}

// Отрисовка галереи
function renderGallery(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (photos.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-light); width:100%;">Пока нет фотографий. Добавьте первую!</p>';
    return;
  }

  container.innerHTML = photos.map(p => `
    <div class="polaroid">
      <img src="${p.url}" alt="Фото" loading="lazy">
      <div class="caption">${p.caption || ''}</div>
      <button class="delete-photo" onclick="deletePhoto('${p.id}', '${p.album_type}', '${p.url}')">✕</button>
    </div>
  `).join('');
}