// render-gallery.js — flat-array JSON build: filename + theme + price + descriptions
(async function () {
  // ---- Section display copy (headings + descriptions) ----
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

  // ---- Canonical names for variants/typos so headings + buttons match ----
  const CANON = {
    "dreamscapes": "Dreamscapes and Nightmares",
    "nightmares": "Dreamscapes and Nightmares",
    "nighmares": "Dreamscapes and Nightmares",
    "dreamscapes & nightmares": "Dreamscapes and Nightmares",
    "unheard echos": "Unheard Echoes",
    "in living memory": "In Memory of"
  };

  function toCanon(label) {
    const k = String(label || "").trim().toLowerCase();
    return CANON[k] || label;
  }

  function slugify(txt) {
    return String(txt).toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Always fetch from the site ROOT (gallery.json is next to index.html)
  async function loadRootJSON(file) {
    const url = `/${file}?ts=${Date.now()}`; // cache-bust
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  // Lightbox binder — uses HippoLightbox v2 if present
  function bindLightbox(root, group) {
    const nodes = root.querySelectorAll("a[data-lb-src]");
    if (window.HippoLightbox && typeof window.HippoLightbox.bind === "function") {
      window.HippoLightbox.bind(nodes, group);
    }
  }

  // ---- Hero feature: "Their Expectations" crown jewel ----
  function renderExpectationsFeature(rows, container) {
    const hero = rows.find(it =>
      (it.title || "").toLowerCase().includes("their expectations")
    );
    if (!hero) return;

    const src = `Resize1/${hero.file}`;

    const wrap = document.createElement("section");
    wrap.className = "injected expectations-hero";
    wrap.style.marginBottom = "2.5rem";
    wrap.style.padding = "1.25rem";
    wrap.style.borderRadius = "18px";
    wrap.style.border = "1px solid var(--border, #e5e7eb)";
    wrap.style.boxShadow = "0 14px 35px rgba(0,0,0,0.12)";
    wrap.style.background = "var(--card, #fff)";
    wrap.style.maxWidth = "960px";
    wrap.style.marginInline = "auto";
    container.appendChild(wrap);

    const title = document.createElement("h2");
    title.textContent = "Crown Jewel: Their Expectations";
    title.id = "sec-their-expectations";
    title.style.fontSize = "1.5rem";
    title.style.marginBottom = ".5rem";
    wrap.appendChild(title);

    const intro = document.createElement("p");
    intro.textContent =
      "The anchor piece of this body of work — a confrontation with roles, mirrors, and the weight of being watched.";
    intro.style.fontSize = ".95rem";
    intro.style.opacity = ".85";
    intro.style.marginBottom = "1rem";
    wrap.appendChild(intro);

    const layout = document.createElement("div");
    layout.style.display = "flex";
    layout.style.flexDirection = "column";
    layout.style.gap = "1rem";
    wrap.appendChild(layout);

    // Image block
    const imgLink = document.createElement("a");
    imgLink.href = src;
    imgLink.dataset.lbSrc = src;
    imgLink.dataset.lbTitle = hero.title || "Their Expectations";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = src;
    img.alt = hero.alt || hero.title || "";
    img.style.width = "100%";
    img.style.maxHeight = "420px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "14px";

    imgLink.appendChild(img);
    layout.appendChild(imgLink);

    // Text block
    const text = document.createElement("div");
    text.style.fontSize = ".95rem";
    text.style.lineHeight = "1.5";
    layout.appendChild(text);

    const metaTop = document.createElement("p");
    metaTop.style.fontWeight = "600";
    metaTop.textContent = hero.title || "Their Expectations";
    text.appendChild(metaTop);

    const metaLine = document.createElement("p");
    metaLine.style.opacity = ".8";
    metaLine.textContent = [
      hero.medium,
      hero.size
    ].filter(Boolean).join(" • ");
    text.appendChild(metaLine);

    if (hero.blurb || hero.alt) {
      const blurb = document.createElement("p");
      blurb.style.marginTop = ".5rem";
      blurb.textContent = hero.blurb || hero.alt;
      text.appendChild(blurb);
    }

    const price = document.createElement("p");
    price.style.marginTop = ".5rem";
    price.style.fontWeight = "600";
    price.textContent =
      (hero.price || "").toString().trim() || "Price available on request";
    text.appendChild(price);

    // Lightbox for the hero
    bindLightbox(wrap, [hero]);
  }

  try {
    // Your gallery.json is a FLAT ARRAY, not { items: [...] }
    const rows = await loadRootJSON("gallery.json");
    if (!Array.isArray(rows)) {
      throw new Error("gallery.json must be an array of items");
    }

    const container = document.querySelector("#gallery");
    if (!container) throw new Error("No #gallery section found.");

    // Clear previous injected content
    container.querySelectorAll(".injected").forEach(n => n.remove());

    // Hero crown jewel section
    renderExpectationsFeature(rows, container);

    // Group items by THEME
    const byTheme = {};
    rows.forEach(it => {
      const rawTheme = it.theme || "Unsorted";
      const canon = toCanon(rawTheme);
      (byTheme[canon] ||= []).push(it);
    });

    // Render order: your main four, then any extras
    const baseOrder = [
      "Queens",
      "Dreamscapes and Nightmares",
      "Unheard Echoes",
      "In Memory of"
    ];
    const extra = Object.keys(byTheme).filter(t => !baseOrder.includes(t));
    const order = [...baseOrder, ...extra];

    // Render each theme section
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
        const holder = document.createElement("div");
        holder.innerHTML = display.descHtml.trim();
        wrap.appendChild(holder.firstElementChild || holder);
      }

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
      grid.style.gap = "16px";
      wrap.appendChild(grid);

      group.forEach(it => {
        const src = `Resize1/${it.file}`;

        const card = document.createElement("a");
        card.href = src;
        card.className = "art-card";
        card.dataset.lbSrc   = src;
        card.dataset.lbTitle = it.title || "Untitled";

        card.style.display = "block";
        card.style.background = "var(--card, #fff)";
        card.style.border = "1px solid var(--border, #e5e7eb)";
        card.style.borderRadius = "16px";
        card.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)";
        card.style.overflow = "hidden";
        card.style.textDecoration = "none";
        card.style.color = "inherit";

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
            ${(it.price || "").toString().trim() || "Price available on request"}
          </div>
        `;
        card.appendChild(meta);

        grid.appendChild(card);
      });

      bindLightbox(wrap, group);
    });

    // Theme jump buttons
    document.querySelectorAll('.theme-bar button, .theme-shortcuts button, #projects .jump').forEach(btn => {
      btn.addEventListener('click', () => {
        const raw = btn.getAttribute('data-goto') || btn.textContent;
        const id  = 'sec-' + slugify(toCanon(raw));
        const el  = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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
