// render-gallery.js — section descriptions + anchors + price
(async function () {
  // ---- Display labels & descriptions (shown on page) ----
  const DISPLAY = {
    "Queens": {
      label: "Queens",
      desc: "Kinky crowns, rich curves, and rhythm. Beauty, visibility, identity, representation, belonging."
    },
    "Dreamscapes and Nightmares": {
      label: "Dreamscapes and Nightmares",
      desc: "Without darkness, how would we know the light? Monsters and myth step from the shadows—eerie, surreal, and close to the veil."
    },
    "Unheard Echoes": {
      label: "Unheard Echoes",
      desc: "Chains, crowns, tears—the weight and endurance of Black women. A hand extended to those who stumble; a tribute to those who keep pushing through treachery."
    },
    "In Memory of": {
      label: "In Memory of",
      desc: "Tender reckonings, grief-work, remembrance, and the quiet power of holding on."
    }
  };

  // ---- Figure out the folder this script is in; load JSON from same folder ----
  const thisScript = document.currentScript || [...document.scripts].slice(-1)[0];
  const baseURL = thisScript
    ? (new URL(thisScript.src, location.href)).href.replace(/[^/]+$/, "")
    : (location.origin + location.pathname.replace(/[^/]+$/, ""));

  async function loadJSON(file) {
    const res = await fetch(new URL(file + "?v=" + Date.now(), baseURL));
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  function slugify(txt){ return String(txt).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }

  function bindLightbox(grid, group) {
    const nodes = grid.querySelectorAll("a.art-card");
    window.HippoLightbox && window.HippoLightbox.bind(nodes, group);
  }

  try {
    const data = await loadJSON("gallery.json");
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

    // Build full order (your declared order first, then anything extra)
    const order = [...allowedOrder];
    Object.keys(bySection).forEach(s => { if (!order.includes(s)) order.push(s); });

    // Render sections
    container.querySelectorAll(".injected").forEach(n => n.remove()); // clear previous if any

    order.forEach(sectionKey => {
      const group = bySection[sectionKey];
      if (!group || !group.length) return;

      const wrap = document.createElement("div");
      wrap.className = "injected";
      container.appendChild(wrap);

      // Heading + anchor id (so jump buttons work)
      const display = DISPLAY[sectionKey] || { label: sectionKey, desc: "" };
      const h3 = document.createElement("h3");
      h3.textContent = display.label;
      h3.id = "sec-" + slugify(display.label);
      wrap.appendChild(h3);

      // Description under the heading
      if (display.desc) {
        const p = document.createElement("p");
        p.style.cssText = "margin:.25rem 0 1rem; opacity:.8; max-width:70ch;";
        p.textContent = display.desc;
        wrap.appendChild(p);
      }

      // Grid of items
      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
      grid.style.gap = "16px";
      wrap.appendChild(grid);

      group.forEach(it => {
        const card = document.createElement("a");
        card.href = it.src || it.thumb || "#";
        card.className = "art-card";
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
            ${it.price || "Available on request"}
          </div>
        `;
        card.appendChild(meta);

        grid.appendChild(card);
      });

      bindLightbox(grid, group);
    });

    // Hook up jump buttons from the Projects section
    document.querySelectorAll("#projects .jump").forEach(btn => {
      btn.addEventListener("click", () => {
        const label = btn.getAttribute("data-goto");
        const id = "sec-" + slugify(label);
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
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
