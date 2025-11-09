# Webflow Troubleshooting Guide - When Things Don't Work

## Quick Diagnostic Checklist

When something isn't working because of Webflow logic, follow this checklist:

### Step 1: Identify the Problem
- [ ] Element not aligning properly?
- [ ] Unexpected spacing/margins?
- [ ] Float-based layout issues?
- [ ] Pseudo-elements causing problems?
- [ ] Styles not applying despite CSS?

### Step 2: Check Webflow's Default Behavior
- [ ] Inspect element in DevTools
- [ ] Look for `padding-left`, `float`, or negative margins
- [ ] Check for `::before` and `::after` pseudo-elements
- [ ] Verify wrapper classes match other elements
- [ ] Check for inline styles added by JavaScript

### Step 3: Apply Fixes (in order)
1. **Match HTML structure** (if different from other elements)
2. **Override padding/margins** with `!important`
3. **Disable pseudo-elements** (`::before`, `::after`)
4. **Remove float** and use flexbox
5. **Force position** with `left: 0` and `transform: translateX(0)`

---

## Common Webflow Issues & Quick Fixes

### Issue 1: Element Not Aligning Left

**Symptoms**: Element is indented/offset to the right, doesn't align with other elements

**Quick Fix**:
```css
.your-selector {
  padding-left: 0 !important;
  margin-left: 0 !important;
  left: 0 !important;
  transform: translateX(0) !important;
}
```

**Full Fix** (if quick fix doesn't work):
1. Check if wrapper class matches other elements
2. Disable pseudo-elements (see Issue 3)
3. Remove float (see Issue 4)
4. Force position (see Issue 5)

---

### Issue 2: Unexpected Spacing/Margins

**Symptoms**: Extra space around element, margins that shouldn't be there

**Quick Fix**:
```css
.your-selector {
  margin: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
```

**Common Webflow Classes to Override**:
- `.margin-bottom`, `.margin-xsmall`, `.margin-small`, etc.
- `.padding-bottom`, `.padding-xsmall`, etc.

---

### Issue 3: Pseudo-Elements Causing Layout Issues

**Symptoms**: Element has unexpected spacing, float layout problems, grid issues

**Quick Fix**:
```css
.your-selector::before,
.your-selector::after {
  display: none !important;
  content: none !important;
  clear: none !important;
  grid-area: unset !important;
}
```

**When to Use**: When Webflow uses `::before` and `::after` to create float layouts (common with `.w-checkbox`, `.w-radio`)

---

### Issue 4: Float-Based Layout Problems

**Symptoms**: Element floats unexpectedly, negative margins, alignment issues

**Quick Fix**:
```css
.your-selector {
  float: none !important;
  clear: both !important;
  display: flex !important; /* Use flexbox instead */
  justify-content: flex-start; /* Align to left */
}
```

**Common Webflow Patterns**:
- `.w-checkbox-input` has `float: left` and `margin: 4px 0 0 -20px`
- `.w-radio-input` has similar float behavior

---

### Issue 5: Styles Not Applying

**Symptoms**: CSS rules don't work, styles are overridden

**Quick Fix**:
```css
/* Increase specificity */
.parent-class .your-selector {
  property: value !important;
}

/* Or use :has() for more specificity */
.parent-class:has(.your-selector) .your-selector {
  property: value !important;
}
```

**Why**: Webflow styles are often very specific, so you need:
- More specific selectors
- `!important` flag
- Higher CSS specificity

---

## Complete Fix Template

When you need to completely override Webflow's default behavior:

```css
/* 1. Match wrapper structure */
.your-form .form_field-wrapper:has(.your-element) {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  display: block;
  text-align: left;
  position: relative;
  box-sizing: border-box;
  left: 0 !important;
  transform: translateX(0) !important;
}

/* 2. Override element styles */
.your-form .your-element {
  margin: 0 !important;
  padding: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  width: 100%;
  display: flex !important;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  position: relative;
  box-sizing: border-box;
  clear: both;
  left: 0 !important;
  transform: translateX(0) !important;
  margin-left: 0 !important;
}

/* 3. Disable pseudo-elements */
.your-form .your-element::before,
.your-form .your-element::after {
  display: none !important;
  content: none !important;
  clear: none !important;
  grid-area: unset !important;
}

/* 4. Override child elements */
.your-form .your-element .child-element {
  float: none !important;
  margin: 0 12px 0 0 !important;
  margin-left: 0 !important;
  margin-right: 12px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  position: relative !important;
  left: 0 !important;
  transform: translateX(0) !important;
}
```

---

## Webflow Classes Reference

### Classes That Often Cause Problems

| Class | Default Behavior | Common Issue |
|-------|-----------------|--------------|
| `.w-checkbox` | `padding-left: 20px`, float layout | Not aligning left |
| `.w-checkbox-input` | `float: left`, `margin: 4px 0 0 -20px` | Negative margin offset |
| `.w-checkbox::before` | Creates float layout | Unexpected spacing |
| `.w-checkbox::after` | Clears float | Layout issues |
| `.margin-bottom` | Adds bottom margin | Extra spacing |
| `.margin-xsmall` | Adds `1rem` margin | Unwanted margins |
| `.form_field-wrapper` | `position: relative` | Usually fine, but check |

### Classes That Are Usually Safe

- `.form_field-label` - Usually fine
- `.form_input` - Usually fine
- `.w-input` - Usually fine

---

## Real-World Example: Checkbox Alignment Fix

**Problem**: Checkbox not aligning left with other form fields

**Solution Applied**:

1. **Changed HTML structure**:
```html
<!-- Before -->
<div class="margin-bottom margin-xsmall">
  <label class="w-checkbox form_checkbox">...</label>
</div>

<!-- After -->
<div class="form_field-wrapper">
  <label class="w-checkbox form_checkbox">...</label>
</div>
```

2. **Applied CSS fixes**:
```css
/* Override padding-left */
.contact5_form .w-checkbox.form_checkbox {
  padding-left: 0 !important;
}

/* Disable pseudo-elements */
.contact5_form .w-checkbox.form_checkbox::before,
.contact5_form .w-checkbox.form_checkbox::after {
  display: none !important;
  content: none !important;
}

/* Remove float */
.contact5_form .w-checkbox-input {
  float: none !important;
  margin: 0 12px 0 0 !important;
}

/* Force left alignment */
.contact5_form .form_field-wrapper .w-checkbox.form_checkbox {
  left: 0 !important;
  transform: translateX(0) !important;
  margin-left: 0 !important;
}
```

**Result**: Checkbox now aligns perfectly with other form fields

---

## Debugging Workflow

### Step 1: Inspect in DevTools
1. Right-click element → Inspect
2. Check computed styles
3. Look for:
   - `padding-left` values
   - `float` properties
   - `margin` with negative values
   - `::before` and `::after` pseudo-elements
   - Inline styles

### Step 2: Compare with Working Elements
1. Inspect a working element (e.g., another form field)
2. Compare wrapper classes
3. Compare computed styles
4. Identify differences

### Step 3: Apply Fixes
1. Start with HTML structure (match working elements)
2. Override padding/margins
3. Disable pseudo-elements
4. Remove float
5. Force position

### Step 4: Test
1. Refresh page
2. Check alignment
3. Test at different screen sizes
4. Verify in different browsers

---

## When to Use This Guide

✅ **Use this guide when**:
- Webflow element not aligning properly
- Unexpected spacing/margins
- Float-based layout issues
- Styles not applying despite CSS
- Pseudo-elements causing problems

❌ **Don't use this guide when**:
- You can modify the Webflow design directly (preferred)
- The issue is not related to Webflow's default styles
- You want to keep Webflow's default behavior

---

## Key Principles

1. **Match HTML Structure**: Use same wrapper classes as working elements
2. **Override Everything**: Use `!important` and override all padding/margins
3. **Disable Pseudo-Elements**: Hide `::before` and `::after` that create float layouts
4. **Remove Float**: Use flexbox instead of float-based layouts
5. **Force Position**: Use `left: 0` and `transform: translateX(0)` to force alignment
6. **Use !important**: Webflow styles are very specific, `!important` is often needed
7. **Increase Specificity**: Use more specific selectors to override Webflow styles

---

## Related Files

- `css/custom-styles.css` - Contains Webflow override fixes
- `calculateur.html` - Example: Contact form with checkbox fix

---

## Quick Reference Card

**When element won't align left:**
```css
.element {
  padding-left: 0 !important;
  margin-left: 0 !important;
  left: 0 !important;
  transform: translateX(0) !important;
}
```

**When pseudo-elements cause issues:**
```css
.element::before,
.element::after {
  display: none !important;
  content: none !important;
}
```

**When float causes problems:**
```css
.element {
  float: none !important;
  display: flex !important;
  justify-content: flex-start !important;
}
```

---

**Last Updated**: 2024 - Optimized for troubleshooting Webflow issues
