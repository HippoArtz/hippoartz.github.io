
// Minimalist Lightbox (no dependencies)
(function(){
  const overlay = document.createElement('div');
  overlay.className = 'hlbx-overlay';
  overlay.innerHTML = `
    <div class="hlbx-content">
      <button class="hlbx-close" aria-label="Close">&times;</button>
      <button class="hlbx-prev" aria-label="Previous">&#10094;</button>
      <img alt="Artwork"/>
      <button class="hlbx-next" aria-label="Next">&#10095;</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('img');
  const btnClose = overlay.querySelector('.hlbx-close');
  const btnPrev = overlay.querySelector('.hlbx-prev');
  const btnNext = overlay.querySelector('.hlbx-next');

  let items = [];
  let idx = 0;

  function open(i) {
    idx = i;
    const it = items[idx];
    imgEl.src = it.src || it.thumb || '';
    imgEl.alt = it.alt || it.title || '';
    overlay.classList.add('open');
  }
  function close(){ overlay.classList.remove('open'); }
  function prev(){ if (items.length) open((idx - 1 + items.length) % items.length); }
  function next(){ if (items.length) open((idx + 1) % items.length); }

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  document.addEventListener('keydown', (e)=>{
    if(!overlay.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') prev();
    if(e.key === 'ArrowRight') next();
  });

  // Public API
  window.HippoLightbox = {
    bind: function(nodeList, data) {
      items = data;
      Array.from(nodeList).forEach((node, i)=>{
        node.addEventListener('click', (e)=>{
          e.preventDefault();
          open(i);
        });
      });
    }
  };
})();
