
Hippo Artz Gallery Assets
=========================

Files generated:
- gallery.json
- render-gallery.js
- lightbox.css
- lightbox.js

How to use:
1) Upload these four files to the same folder as your site (e.g., the root of your GitHub Pages repo or `/assets/` folder). If placed in `/assets/`, update the script and link paths accordingly.
2) In your HTML, include the CSS and JS:
   <link rel="stylesheet" href="lightbox.css?v=3">
   <section id="gallery"></section>
   <script src="lightbox.js?v=3" defer></script>
   <script src="render-gallery.js?v=3" defer></script>

3) Make sure the `src` and `thumb` values inside gallery.json point to valid image paths relative to the HTML file.
4) Sections are rendered in this order: Queens, Unheard Echos, Nightmares, Dreamscapes, In Memory of. Any items with other/blank section labels are grouped after these.

Notes:
- The lightbox is dependency-free and supports keyboard navigation (Esc to close, ← → to navigate).
- Thumbnails: For faster loads, provide smaller images in `thumb` and full-size images in `src`.
- If your Excel doesn't have a "section" column, I left it blank; you can add sections by editing `gallery.json` or by adding a "section" column to the sheet and regenerating.
- This was auto-built from sheet "Final".
