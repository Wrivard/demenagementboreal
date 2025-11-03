## Section Content 28 – Cookie Policy (Drop‑in Template)

Purpose: replicate the exact layout and styling of `section_content28` from `politique-cookies.html` in any new project. Only change the accent color to match the project brand.

### 1) CSS (copy to your global CSS or page head)

Set your project accent once using the CSS variable `--accent`.

```css
/* Accent color (replace with the project's brand color) */
:root {
  --accent: #db9b2d; /* project accent */
}

/* Section content 28 - container + typography */
.section_content28 { background: #fafbfc; padding: 120px 0; min-height: 100vh; }
.content28_component { max-width: 900px; margin: 0 auto; padding: 0 40px; }
.content28_content { background: transparent; }

/* Hide sidebar (not used in this layout) */
.content28_sidebar { display: none !important; }

/* Hero header card */
.content28_header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px; padding: 80px 60px; margin-bottom: 80px; text-align: center;
  border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.content28_header h1 { color:#0f172a; font-size:3.5rem; font-weight:800; margin:0 0 24px; letter-spacing:-0.04em; line-height:1.1; }
.content28_header p { color:#64748b; font-size:1.1rem; margin:0; }

/* Section cards */
.content28_card { background:#fff; border-radius:20px; padding:48px; margin-bottom:28px; box-shadow:0 10px 30px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.06); }
.content28_card h2 { color:#1f2937; font-size:1.8rem; font-weight:700; margin:0 0 16px; border-bottom:3px solid var(--accent); display:inline-block; padding-bottom:8px; }
.content28_card p { color:#374151; font-size:1rem; line-height:1.7; margin:0 0 16px; }

/* Info grid (used for cookie types) */
.content28_info-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:16px; margin:20px 0; }
.content28_info {
  background: color-mix(in srgb, var(--accent) 10%, #fff 90%);
  border:2px solid color-mix(in srgb, var(--accent) 60%, #fff 40%);
  border-radius:12px; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,0.06);
}
.content28_info h3 { color:#312b22; margin:0 0 12px; font-size:1.2rem; font-weight:600; }
.content28_info p { margin:0; font-size:0.95rem; line-height:1.5; color:#666; }

/* Callout banner (top) */
.content28_banner { text-align:center; padding:40px 20px; background: linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #000 30%) 100%); color:#fff; border-radius:12px; margin-bottom:40px; box-shadow:0 4px 20px rgba(0,0,0,0.12); }
.content28_banner h1 { font-size:2.5rem; margin:0 0 12px; font-weight:700; text-shadow:0 2px 4px rgba(0,0,0,0.3); }
.content28_banner p { font-size:1rem; margin:0; opacity:.95; font-weight:500; }

/* Contact block */
.content28_contact { background:linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #000 30%) 100%); padding:56px; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.12); text-align:center; }
.content28_contact h3 { color:#fff; font-size:1.8rem; font-weight:700; margin:0 0 24px; }
.content28_contact p { color:#cbd5e1; font-size:1.1rem; line-height:1.7; margin:0; opacity:0.9; }

/* Responsive */
@media (max-width: 768px) {
  .section_content28{ padding:80px 0; } .content28_component{ padding:0 24px; }
  .content28_header{ padding:60px 40px; } .content28_header h1{ font-size:2.5rem; }
  .content28_card{ padding:40px; } .content28_contact{ padding:40px; }
}
@media (max-width: 480px) {
  .content28_component{ padding:0 16px; } .content28_header{ padding:40px 24px; }
  .content28_header h1{ font-size:2rem; } .content28_card{ padding:32px; }
}
```

Notes:
- Keep the class names as-is to reuse the exact layout.
- Only change `--accent`. All accent borders, banners and cards will follow the project color automatically.

### 2) HTML (copy into your page)

```html
<section class="section_content28">
  <div class="padding-global">
    <div class="container-large">
      <div class="padding-section-large">
        <div class="content28_component">
          <div class="max-width-large content28_content">

            <!-- Banner header -->
            <div class="content28_banner">
              <h1>Politique de Cookies</h1>
              <p><strong>Dernière mise à jour : JJ mois AAAA</strong></p>
            </div>

            <!-- Section: Introduction -->
            <div class="content28_card" id="introduction">
              <h2>Introduction</h2>
              <p>Brève explication de la politique et du domaine concerné.</p>
            </div>

            <!-- Section: Que sont les cookies ? + grid -->
            <div class="content28_card" id="que-sont-les-cookies">
              <h2>Que sont les cookies ?</h2>
              <p>Description générale.</p>
              <div class="content28_info-grid">
                <div class="content28_info">
                  <h3>Cookies essentiels</h3>
                  <p>Nécessaires au fonctionnement du site.</p>
                </div>
                <div class="content28_info">
                  <h3>Cookies de performance</h3>
                  <p>Mesurent l'utilisation et les performances.</p>
                </div>
                <div class="content28_info">
                  <h3>Cookies fonctionnels</h3>
                  <p>Améliorent l'expérience utilisateur.</p>
                </div>
              </div>
            </div>

            <!-- Section: Contact / assistance -->
            <div class="content28_contact">
              <h3>Besoin d'aide ?</h3>
              <p>Ajoutez ici un email ou un numéro de téléphone.</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 3) Usage guidelines
- Replace the banner text and the date.
- Keep the structure; add more `.content28_card` blocks as needed.
- Ensure your project’s global font matches your brand (this template is font-agnostic).
- Accent color: set once via `--accent` to the project’s brand accent.

This template mirrors the current production layout/spacing/shadows from `politique-cookies.html` and can be dropped into any static site or CMS export.


