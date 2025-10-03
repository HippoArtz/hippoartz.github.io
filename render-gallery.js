
// Render gallery by sections and hook up lightbox
(async function(){
  const res = await fetch('gallery.json?v=' + Date.now());
  const data = await res.json();
  const container = document.querySelector('#gallery');
  if(!container) return;

  const sections = data.sections || [];
  const items = data.items || [];

  // Group items by section (preserve order in sheet)
  const bySection = {};
  items.forEach(it => {
    const sec = it.section && it.section.trim() ? it.section.trim() : 'Unsorted';
    if(!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(it);
  });

  // Order: use provided sections first, then any extras
  const sectionOrder = [...sections];
  Object.keys(bySection).forEach(s => { if(!sectionOrder.includes(s)) sectionOrder.push(s); });

  container.innerHTML = '';
  sectionOrder.forEach(section => {
    const group = bySection[section];
    if(!group || !group.length) return;

    const h2 = document.createElement('h3');
    h2.textContent = section;
    container.appendChild(h2);

    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(220px, 1fr))';
    grid.style.gap = '16px';

    group.forEach(it => {
      const card = document.createElement('a');
      card.href = it.src || it.thumb || '#';
      card.className = 'art-card';
      card.style.display = 'block';
      card.style.background = 'var(--card, #fff)';
      card.style.border = '1px solid var(--border, #e5e7eb)';
      card.style.borderRadius = '16px';
      card.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)';
      card.style.overflow = 'hidden';
      card.style.textDecoration = 'none';
      card.style.color = 'inherit';
      card.setAttribute('data-id', it.id);

      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = it.alt || it.title || '';
      img.src = it.thumb || it.src || '';
      img.style.width = '100%';
      img.style.height = '220px';
      img.style.objectFit = 'cover';
      card.appendChild(img);

      const meta = document.createElement('div');
      meta.style.padding = '12px 14px';
   meta.innerHTML = `
  <div style="font-weight:600">${it.title || 'Untitled'}</div>
  <div style="opacity:.7; font-size:.9rem">
    ${[it.medium, it.size, it.year].filter(Boolean).join(' • ')}
  </div>
  <div style="margin-top:4px; font-size:.9rem; color:#374151;">
    ${it.price || 'Available on request'}
  </div>
`;

      card.appendChild(meta);

      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Bind lightbox to links in this grid
    const nodes = grid.querySelectorAll('a.art-card');
    window.HippoLightbox && window.HippoLightbox.bind(nodes, group);
  });
})();
