// HippoLightbox v2 — per-section safe binding (no deps)
(function(){
  // Overlay markup
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

  const imgEl   = overlay.querySelector('img');
  const btnClose= overlay.querySelector('.hlbx-close');
  const btnPrev = overlay.querySelector('.hlbx-prev');
  const btnNext = overlay.querySelector('.hlbx-next');

  // Current "session" (the section you clicked in)
  let sources = [];   // array of full image URLs for THIS section
  let titles  = [];   // matching titles/alts
  let idx     = 0;

  function show(i){
    idx = i;
    const src = sources[idx] || '';
    const alt = titles[idx]  || 'Untitled';
    imgEl.src = src;
    imgEl.alt = alt;
    overlay.classList.add('open');
  }
  function close(){ overlay.classList.remove('open'); imgEl.src = ''; }
  function prev(){ if (sources.length) show((idx - 1 + sources.length) % sources.length); }
  function next(){ if (sources.length) show((idx + 1) % sources.length); }

  btnClose.addEventListener('click', close);
  btnPrev .addEventListener('click', prev);
  btnNext .addEventListener('click', next);
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) close(); });
  document.addEventListener('keydown', (e)=>{
    if(!overlay.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') prev();
    if(e.key === 'ArrowRight') next();
  });

  // Helpers to read the URL/title from a card
  function nodeSrc(node){
    return node.dataset.lbSrc
        || node.getAttribute('href')
        || (node.querySelector('img') && node.querySelector('img').src)
        || '';
  }
  function nodeTitle(node){
    return node.dataset.lbTitle
        || node.getAttribute('data-title')
        || (node.querySelector('img') && node.querySelector('img').alt)
        || 'Untitled';
  }

  // Public API — binds PER SECTION and keeps a local list for those nodes
  window.HippoLightbox = {
    bind(nodeList /*, dataIgnored */) {
      const nodes = Array.from(nodeList);
      const localSources = nodes.map(nodeSrc);
      const localTitles  = nodes.map(nodeTitle);

      nodes.forEach((node, i) => {
        node.addEventListener('click', (e) => {
          e.preventDefault();
          // Switch the "session" to THIS section’s images
          sources = localSources;
          titles  = localTitles;
          show(i);
        });
      });
    }
  };
})();
