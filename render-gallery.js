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
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status} ${res.statusText}`
