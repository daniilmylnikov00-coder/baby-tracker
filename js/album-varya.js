let varyaPhotos = [];
let familyPhotos = [];

async function loadPhotos(type) {
  // Сортируем по возрастанию (старые сверху, новые снизу)
  const { data, error } = await db.from('photos').select('*').eq('album_type', type).order('created_at', { ascending: true });
  if (error) { console.error("Ошибка чтения фото:", error); return; }
  
  if (type === 'varya') {
    varyaPhotos = data;
    renderGallery('varyaGallery', varyaPhotos);
  } else {
    familyPhotos = data;
    renderGallery('familyGallery', familyPhotos);
  }
}

async function uploadPhoto(input, albumType) {
  const file = input.files[0];
  if (!file) return;

  const captionInput = document.getElementById(albumType + 'PhotoCaption');
  const caption = captionInput.value;
  
  const btnId = albumType + 'UploadBtn';
  const btn = document.getElementById(btnId);

  try {
    if (btn) btn.textContent = '1. Загрузка файла...';
    
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error: uploadError } = await db.storage.from('photos').upload(fileName, file);
    
    if (uploadError) {
      alert('ОШИБКА STORAGE: ' + uploadError.message);
      if (btn) btn.textContent = '📸 Добавить фото';
      return;
    }

    if (btn) btn.textContent = '2. Получение ссылки...';
    const { data: { publicUrl } } = db.storage.from('photos').getPublicUrl(fileName);

    if (btn) btn.textContent = '3. Сохранение в базу...';
    const { error: dbError } = await db.from('photos').insert([
      { album_type: albumType, url: publicUrl, caption: caption }
    ]);
    
    if (dbError) {
      alert('ОШИБКА БАЗЫ: ' + dbError.message);
      if (btn) btn.textContent = '📸 Добавить фото';
      return;
    }

    if (btn) btn.textContent = 'Успех!';
    captionInput.value = '';
    input.value = '';
    setTimeout(() => { if (btn) btn.textContent = '📸 Добавить фото'; }, 2000);
    loadPhotos(albumType);

  } catch (err) {
    alert('НЕИЗВЕСТНАЯ ОШИБКА: ' + err.message);
    if (btn) btn.textContent = '📸 Добавить фото';
  }
}

async function deletePhoto(id, albumType, fileUrl) {
  if (!confirm('Удалить это фото?')) return;
  
  const fileName = fileUrl.split('/').pop();
  await db.storage.from('photos').remove([fileName]);
  await db.from('photos').delete().eq('id', id);
  
  loadPhotos(albumType);
}

function renderGallery(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (photos.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-light); width:100%;">Пока нет фотографий. Добавьте первую!</p>';
    return;
  }

  // Генерируем HTML для фото
  container.innerHTML = photos.map((p) => {
    // Берем уникальный ID фото и превращаем его в число
    // Это нужно, чтобы для каждой конкретной фотографии размер и наклон всегда были одинаковыми при перезагрузке
    let hash = 0;
    for (let i = 0; i < p.id.length; i++) {
        hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Определяем размер: если число четное - большая, если нечетное - маленькая
    const sizeClass = (Math.abs(hash) % 2 === 0) ? 'polaroid-large' : 'polaroid-small';
    
    // Определяем наклон: от -6 до +6 градусов
    const randomRotate = (Math.abs(hash) % 13) - 6;

    return `
      <div class="polaroid ${sizeClass}" style="transform: rotate(${randomRotate}deg);">
        <img src="${p.url}" alt="Фото" loading="lazy">
        <div class="caption">${p.caption || ''}</div>
        <button class="delete-photo" onclick="deletePhoto('${p.id}', '${p.album_type}', '${p.url}')">✕</button>
      </div>
    `;
  }).join('');
}