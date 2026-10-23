function renderGallery(containerId, photos) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (photos.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-light); width:100%;">Пока нет фотографий. Добавьте первую!</p>';
    return;
  }

  container.innerHTML = photos.map((p) => {
    let hash = 0;
    for (let i = 0; i < p.id.length; i++) {
        hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Делаем расчет на 3 варианта, чтобы было больше хаоса
    const type = Math.abs(hash) % 3; 
    let sizeClass = '';
    let randomRotate = 0;

    if (type === 0) {
      // Большая фотография на всю ширину
      sizeClass = 'polaroid-large';
      randomRotate = (Math.abs(hash) % 5) - 2; // Наклон от -2 до +2
    } else if (type === 1) {
      // Маленькая фотография (левая колонка)
      sizeClass = 'polaroid-small';
      randomRotate = (Math.abs(hash) % 9) - 4; // Наклон от -4 до +4
    } else {
      // Маленькая фотография (правая колонка)
      sizeClass = 'polaroid-small';
      randomRotate = (Math.abs(hash) % 11) - 5; // Наклон от -5 до +5
    }

    return `
      <div class="polaroid ${sizeClass}" style="transform: rotate(${randomRotate}deg);">
        <img src="${p.url}" alt="Фото" loading="lazy">
        <div class="caption">${p.caption || ''}</div>
        <button class="delete-photo" onclick="deletePhoto('${p.id}', '${p.album_type}', '${p.url}')">✕</button>
      </div>
    `;
  }).join('');
}