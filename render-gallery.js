
async function renderGallery(jsonPath = 'gallery.json') {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  const res = await fetch(jsonPath);
  const items = await res.json();
  grid.innerHTML = items.map(it => `
    <figure class="card">
      <a href="${it.image}" class="zoom" data-title="${escapeHtml(it.title || '')}">
        <img src="${it.image}" alt="${escapeHtml(it.alt || '')}" loading="lazy">
      </a>
      <figcaption>
        <strong class="title">${escapeHtml(it.title || '')}</strong>
        <div class="meta">
          ${it.size ? `<span class="size">${escapeHtml(it.size)}</span>` : ''}
          ${it.medium ? `<span class="sep">•</span><span class="medium">${escapeHtml(it.medium)}</span>` : ''}
          ${it.price ? `<span class="sep">•</span><span class="price">${escapeHtml(it.price)}</span>` : ''}
        </div>
        ${it.blurb ? `<p class="desc">${escapeHtml(it.blurb)}</p>` : ''}
      </figcaption>
    </figure>
  `).join('');

  // Wire up lightbox
  setupLightbox();
}

function setupLightbox() {
  const overlay = document.getElementById('lightbox');
  const overlayImg = overlay.querySelector('img');
  const overlayTitle = overlay.querySelector('.lb-title');
  const closeBtn = overlay.querySelector('.close');

  function open(src, title="") {
    overlayImg.src = src;
    overlayTitle.textContent = title || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    overlayImg.src = '';
    document.body.style.overflow = '';
  }

  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a.zoom');
    if (a) {
      e.preventDefault();
      open(a.href, a.getAttribute('data-title') || '');
    }
    if (e.target.classList.contains('close') || e.target.id === 'lightbox') {
      close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) close();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

document.addEventListener('DOMContentLoaded', () => renderGallery());
