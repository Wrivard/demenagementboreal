## Mobile Adjustments – Banner, Logo, and FAB Spacing

This document captures the mobile-specific improvements we just implemented so they’re easy to reuse and adjust in future projects.

### 1) Keep phone, RBQ and Facebook icon on one line (banner)

Goal: Prevent wrapping on small screens and make the social icon align horizontally with the phone and RBQ text.

Key selectors used by the banner:
- `.banner9_content-wrapper`
- `.banner9_content`
- `.banner9_social-icons`

Changes applied (in `css/ceramiquejlepage.webflow.css` under mobile rules):

```css
/* Keep the top banner items (phone, RBQ, Facebook) on one line on mobile */
.banner9_content-wrapper {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.banner9_content {
  align-items: center;
  margin-bottom: 0;
}
```

How to tweak:
- If items still wrap on very small devices, reduce internal paddings or font-sizes, or set `gap` on `.banner9_content` to a smaller value.
- If space allows, you can add `gap: .5rem;` to `.banner9_content` for better separation.

### 2) Increase logo size on mobile

Goal: Use available left space to make the brand more prominent without breaking layout.

Changes applied (in `css/ceramiquejlepage.webflow.css`, mobile breakpoint):

```css
.navbar3_logo {
  width: 7rem; /* was 5rem */
  height: auto;
}

.navbar3_logo.menu {
  width: 15rem; /* menu logo remains larger for overlay/menu state */
}
```

How to tweak:
- Make it larger: increase to `8rem` or `9rem` if there’s still horizontal room.
- If it pushes other items, try reducing horizontal padding on the navbar or banner.

### 3) Increase spacing between Messenger and Back-to-top FABs (mobile)

Goal: Improve touch target separation for accessibility (WCAG <pointer target> comfort).

Changes applied (in `css/fab-buttons.css`):

```css
@media screen and (max-width: 768px) {
  .button_bottom {
    gap: 1rem !important; /* larger spacing on mobile */
  }
}

@media screen and (max-width: 480px) {
  .button_bottom {
    gap: 1rem !important; /* keep spacing on small phones */
  }
}
```

How to tweak:
- Increase to `1.25rem` or `1.5rem` for extra spacing.
- If vertical space becomes tight, slightly reduce button sizes (`.messenger_button`, `.st_button`).

### Verification Checklist
- Banner shows phone, RBQ, and Facebook icon on a single row on common mobile widths (≤ 768px).
- Logo is visually larger but does not collide with the menu button.
- There is clear vertical spacing between the two FABs on mobile and small mobile.

### Files Touched
- `css/ceramiquejlepage.webflow.css`
- `css/fab-buttons.css`

These adjustments are safe to reuse. If you port them to another Webflow export, ensure the class names match or map them to your project’s classes.


