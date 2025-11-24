// render-gallery.js — fixed build for flat array JSON (filename/title/size/alt/blurb/price/medium/theme)
(async function () {

  // ---- Theme display block stays exactly as you have it ----
  const DISPLAY = {
    "Queens": {
      label: "Queens",
      descHtml: `
        <blockquote class="theme-desc">
          Kinky crowns, rich curves, and rhythm. Beauty, visibility, identity, representation, belonging.
        </blockquote>
      `
    },
    "Dreamscapes and Nightmares": {
      label: "Dreamscapes and Nightmares",
      descHtml: `
        <blockquote class="theme-desc">
          Without darkness, how would we know the light? Monsters and myth step from the shadows—eerie, surreal, and close to the veil.
        </blockquote>
      `
    },
    "Unheard Echoes": {
      label: "Unheard Echoes",
      descHtml: `
        <blockquote class="theme-desc">
          Chains, crowns, tears—the weight and endurance of Black women. A hand extended to those who stumble; a tribute to those who keep pushing through treachery.
        </blockquote>
      `
    },
    "In Memory of": {
      label: "In Memory of",
      descHtml: `
        <blockquote class="theme-desc">
          Tender reckonings, grief-work, remembrance, and the quiet power of holding on.
        </blockquote>
      `
    }
  };

  // ---- Canonical theme names ----
  const CANON = {
    "dreamscapes": "Dreamscapes and Nightmares",
    "nightmares": "Dreamscapes and Nightmares",
    "nighmares": "Dreamscapes and Nightmares",
    "unheard echos": "Unheard Echoes",
    "in living memory": "In Memory of"
  };
  function toCanon(label) {
    const k = String(label || "").trim().toLowerCase();
    return CANON[k] || label;
  }

  function slugify(txt){
    return String(txt).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  async function loadRootJSON(file) {
    const res = await fetch(`/${file}?ts=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
    return res.json();
  }

  function bindLightbox(grid, group) {
    const nodes = grid.querySelectorAll("a.art-card");
    if (window.HippoLightbox && window.HippoLightbox.bind) {
      window.HippoLightbox.bind(nodes, group);
    }
  }

  try {
    // ⭐ EXPECT A FLAT ARRAY NOW
    const rows = await loadRootJSON("gallery.json");

    if (!Array.isArray(rows)) throw new Error("gallery.json must be an array");

    const container = document.querySelector("#gallery");
    if (!container) throw new Error("No #gallery section found.");

    // ⭐ Group by THEME (not 'section', not 'items')
    const byTheme = {};
    rows.forEach(it => {
      const rawTheme = it.theme || "Unsorted";
      const canon = toCanon(rawTheme);
      (byTheme[canon] ||= []).push(it);
    });

    // ⭐ Known order + any extra categories
    const order = [
      "Queens",
      "Dreamscapes and Nightmares",
      "Unheard Echoes",
      "In Memory of",
      ...Object.keys(byTheme).filter(x =>
        !["Queens","Dreamscapes and Nightmares","Unheard Echoes","In Memory of"].includes(x)
      )
    ];

    // Clear current
    container.querySelectorAll(".injected").forEach(n => n.remove());

    // ---- Render each theme ----
    order.forEach(theme => {
      const group = byTheme[theme];
      if (!group || !group.length) return;

      const wrap = document.createElement("div");
      wrap.className = "injected";
      container.appendChild(wrap);

      const display = DISPLAY[theme] || { label: theme };

      const h3 = document.createElement("h3");
      h3.textContent = display.label;
      h3.id = "sec-" + slugify(theme);
      wrap.appendChild(h3);

      if (display.descHtml) {
        const d = document.createElement("div");
        d.innerHTML = display.descHtml.trim();
        wrap.appendChild(d.firstElementChild);
      }

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
      grid.style.gap = "16px";
      wrap.appendChild(grid);

      group.forEach(it => {
        // Build the full image path
        const src = `Resize1/${it.file}`;

        const card = document.createElement("a");
        card.className = "art-card";
        card.href = src;
        card.dataset.lbSrc = src;
        card.dataset.lbTitle = it.title || "Untitled";

        const img = document.createElement("img");
        img.loading = "lazy";
        img.alt = it.alt || it.title || "";
        img.src = src;
        img.style.width = "100%";
        img.style.height = "220px";
        img.style.objectFit = "cover";
        card.appendChild(img);

        const meta = document.createElement("div");
        meta.style.padding = "12px 14px";
        meta.innerHTML = `
          <div style="font-weight:600">${it.title || "Untitled"}</div>
          <div style="opacity:.7; font-size:.9rem">
            ${[it.medium, it.size].filter(Boolean).join(" • ")}
          </div>
          <div style="margin-top:4px; font-size:.9rem; color:#374151;">
            ${it.price || "Price available on request"}
          </div>
        `;
        card.appendChild(meta);

        grid.appendChild(card);
      });

      bindLightbox(grid, group);
    });

  } catch (err) {
    console.error("[Gallery]", err);
    const container = document.querySelector("#gallery");
    if (container) {
      container.insertAdjacentHTML("beforeend",
        `<div class="injected" style="padding:1rem; border:1px solid #fca5a5; background:#fee2e2; border-radius:12px; margin-top:1rem;">
           <strong>Gallery failed to load.</strong><br>
           <code>${String(err.message || err)}</code>
         </div>`);
    }
  }

})();
