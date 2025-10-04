// render-gallery.js — stable build: root JSON fetch + aliases + descriptions + price + safe bind
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
    "unheard echos": "Unheard Echoes",
    "in living memory": "In Memory of"
  };
  function toCanon(label) {
    const k = String(label || "").trim().toLowerCase();
    return CANON[k] || label;
  }

  // ---- Utils ----
  function slugify(txt){ return String(txt).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }

  // Always fetch from the site ROOT (since gallery.json is next to index.html)
  async function loadRootJSON(file) {
    const url = `/${file}?ts=${Date.now()}`; // cache-bust
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  // Lightbox binder — uses HippoLightbox v2 if present; no-op otherwise
  function bindLightbox(grid, group) {
    const nodes = grid.querySelectorAll("a.art-card");
    if (window.HippoLightbox && typeof window.HippoLightbox.bind === "function") {
      window.HippoLightbox.bind(nodes, group);
    }
  }

  try {
    const data = await loadRootJSON("gallery.json");
    const container = document.querySelector("#gallery");
    if (!container) throw new Error("No #gallery section found.");

    const allowedOrder = data.sections || Object.keys(DISPLAY);
    const items = Array.isArray(data.items) ? data.items : [];

    // Group items by section
    const bySection = {};
    items.forEach(it => {
      const sec = (it.section || "").trim() || "Unsorted";
      (bySection[sec] ||= []).push(it);
    });

    // Build render order (declared sections first, then any extras)
    const order = [...allowedOrder];
    Object.keys(bySection).forEach(s => { if (!order.includes(s)) order.push(s); });

    // Clear previous injected content
    container.querySelectorAll(".injected").forEach(n => n.remove());

    // Render
    order.forEach(sectionKey => {
      const group = bySection[sectionKey];
      if (!group || !group.length) return;

      const wrap = document.createElement("div");
      wrap.className = "injected";
      container.appendChild(wrap);

      // Heading + anchors (canonical + shadow for raw label)
      const rawLabel = sectionKey;
      const canonicalLabel = toCanon(rawLabel);
      const display = DISPLAY[canonicalLabel] || DISPLAY[rawLabel] || { label: canonicalLabel, desc: "" };

      const h3 = document.createElement("h3");
      h3.textContent = display.label || canonicalLabel;
      h3.id = "sec-" + slugify(canonicalLabel);
      wrap.appendChild(h3);

      if (canonicalLabel !== rawLabel) {
        const ghost = document.createElement("span");
        ghost.id = "sec-" + slugify(rawLabel);
        ghost.style.position = "relative";
        ghost.style.top = "-1px";
        ghost.setAttribute("aria-hidden", "true");
        wrap.appendChild(ghost);
      }

      // Description (HTML or plain text)
      if (display.descHtml) {
        const holder = document.createElement('div');
        holder.innerHTML = display.descHtml.trim();
        wrap.appendChild(holder.firstElementChild || holder);
      } else if (display.desc) {
        const p = document.createElement('blockquote');
        p.className = 'theme-desc';
        p.textContent = display.desc;
        wrap.appendChild(p);
      }

      // Grid
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
      grid.style.gap = "16px";
      wrap.appendChild(grid);

      group.forEach(it => {
        const card = document.createElement("a");
        card.href = it.src || it.thumb || "#";
        card.className = "art-card";
        // for lightbox v2
        card.dataset.lbSrc   = it.src || it.thumb || "";
        card.dataset.lbTitle = it.title || "Untitled";

        // styles
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
        img.src = it.thumb || it.src || "";
        img.style.width = "100%";
        img.style.height = "220px";
        img.style.objectFit = "cover";
        card.appendChild(img);

        const meta = document.createElement("div");
        meta.style.padding = "12px 14px";
        meta.innerHTML = `
          <div style="font-weight:600">${it.title || "Untitled"}</div>
          <div style="opacity:.7; font-size:.9rem">
            ${[it.medium, it.size, it.year].filter(Boolean).join(" • ")}
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

    // Optional: wire theme jumps if you have buttons elsewhere
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
