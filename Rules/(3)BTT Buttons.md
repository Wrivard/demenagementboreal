# Floating Buttons (Back to Top + Messenger)

This guide explains how to implement, style, and maintain the two floating buttons used across the site, identical to the homepage implementation. It also documents pitfalls we hit and how to avoid them.

## What you get
- Back to Top (smooth scroll to top)
- Messenger (link to `https://m.me/inforenovationlc`)
- Class-based show/hide animation on scroll (> 300px)
- Centralized logic (one shared script for all pages)

## Files involved
- CSS: `css/custom-styles.css` (contains the styles for `.st_wrapper`, `.st_button`, `.messenger-button` and animations)
- Script: `js/fab-buttons.js` (injects homepage markup and handles show/hide + scroll behavior)

## Design and accent color
- The buttons use the project accent color. In this project, it’s the gold gradient `#d3af37 → #b8941f` (see `custom-styles.css`).
- If the project accent color changes, update the gradient in `.messenger-button` and any related styles in `css/custom-styles.css`.

## How to add the buttons to a page
1) Ensure styles are included (already global for this site):
   - `css/custom-styles.css`

2) Add (or keep) a placeholder wrapper near the end of the `<body>` (optional but recommended):

```html
<div class="st_wrapper"></div>
```

3) Include the scripts at the bottom of the page, just before `</body>` (order matters):
   - jQuery (Webflow runtime requires it)
   - `js/webflow.js`
   - `js/mobile-menu-fix.js`
   - `js/fab-buttons.js`  ← this is the centralized FAB initializer

Example (root-level pages):

```html
<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68d2edced2cadc03fe13c1c8"></script>
<script src="js/webflow.js"></script>
<script src="js/mobile-menu-fix.js"></script>
<script src="js/fab-buttons.js"></script>
```

Example (nested pages like `/services/...`):

```html
<script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=68d2edced2cadc03fe13c1c8"></script>
<script src="../js/webflow.js"></script>
<script src="../js/mobile-menu-fix.js"></script>
<script src="../js/fab-buttons.js"></script>
```

4) That’s it. `js/fab-buttons.js` will:
   - Look for `.st_wrapper`. If none found, create one and inject the exact homepage markup.
   - If a wrapper exists but is empty or missing the two buttons, it will inject the homepage markup.
   - Bind the scroll handler and click handler (smooth scroll to top).
   - Work even if multiple button instances exist (multi-instance safe).

## Behavior details (matching homepage)
- Markup injected (icon path is absolute so subfolders work):
  - Messenger icon: `/images/Messenger_Icon_Secondary_White.png`
- Show/hide on scroll:
  - threshold: 300px
  - toggles classes: `is-visible` and `appear` for css transitions
- Click behavior:
  - `window.scrollTo({ top: 0, behavior: 'smooth' });`

## Common pitfalls we encountered (and fixes)
1) Duplicate/Conflicting FAB blocks on a page
   - Symptom: Buttons don’t appear or animate; click sometimes does nothing.
   - Fix: Remove old/duplicate embedded FAB blocks and let `js/fab-buttons.js` inject or normalize the single, correct block.

2) Mixed implementations (style-based vs class-based)
   - Symptom: Some pages manually set `style.opacity/visibility/transform`, others used class toggles. These fight each other.
   - Fix: Use only the class-based toggling (the homepage implementation). The shared script enforces this.

3) Missing Webflow runtime (affects navbar, not the FAB directly)
   - Symptom: Navbar “Services” dropdown didn’t open on certain pages (e.g., Chambly) because `js/webflow.js` wasn’t included.
   - Fix: Always include jQuery + `js/webflow.js` + `js/mobile-menu-fix.js` before `js/fab-buttons.js`.

4) Wrong asset paths in subfolders
   - Symptom: Icons/images fail in `/services/*` pages if relative paths assume project root.
   - Fix: Use absolute path for Messenger icon (`/images/...`) inside the shared script; it works from any subfolder.

5) Empty wrapper present (`<div class="st_wrapper"></div>`) but no children
   - Symptom: You see the wrapper in markup but no buttons on the page.
   - Fix: The shared script detects this and injects the homepage buttons into the existing wrapper.

6) Multiple instances of buttons on the same page
   - Symptom: One button may work while another doesn’t, or visibility toggles inconsistently.
   - Fix: Script now queries **all** instances and binds handlers to each (NodeList safe).

7) Broken image srcset (unrelated to FABs but observed)
   - Symptom: Images didn’t load on some pages due to malformed `srcset` (e.g., repeated filename tokens).
   - Fix: Correct the `srcset` entries; ensure each `srcset` item points to a valid URL variant.

## Testing checklist (per page)
- [ ] Check that jQuery + `js/webflow.js` + `js/mobile-menu-fix.js` load before `js/fab-buttons.js`.
- [ ] Confirm one of these exists: empty `.st_wrapper` or no wrapper (both are fine; script will handle it).
- [ ] Hard refresh the page, scroll > 300px: both buttons appear and animate.
- [ ] Click Back to Top: smooth scroll to page top.
- [ ] Messenger opens `https://m.me/inforenovationlc` in new tab.
- [ ] Navbar dropdown still works (verifies Webflow runtime is present).

## Implementation policy
- Always use the homepage buttons (markup/behavior) via `js/fab-buttons.js`.
- Do not embed per-page FAB logic. It reintroduces drift and conflicts.
- Always keep the buttons styled with the project’s accent color.


