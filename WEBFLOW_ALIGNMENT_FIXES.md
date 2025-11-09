# Webflow Alignment Fixes - Best Practices

## Problem: Webflow Elements Not Aligning Properly

When working with Webflow-generated HTML, elements often don't align as expected due to Webflow's default styles that use:
- `padding-left` on containers
- `float: left` with negative margins
- Pseudo-elements (`::before` and `::after`) that create float layouts
- Specific margin classes that add unwanted spacing

## Solution: Multi-Layer CSS Override Strategy

### 1. **Match HTML Structure to Other Elements**

**Problem**: Using different wrapper classes (e.g., `margin-bottom margin-xsmall`) instead of the same structure as other form elements.

**Solution**: Use the same wrapper class as other elements:
```html
<!-- ❌ BAD: Different wrapper -->
<div class="margin-bottom margin-xsmall">
  <label class="w-checkbox form_checkbox">...</label>
</div>

<!-- ✅ GOOD: Same wrapper as other fields -->
<div class="form_field-wrapper">
  <label class="w-checkbox form_checkbox">...</label>
</div>
```

### 2. **Override Webflow's Padding-Left**

**Problem**: Webflow applies `padding-left: 20px` to `.w-checkbox` elements.

**Solution**: Force remove all padding:
```css
.contact5_form .w-checkbox.form_checkbox {
  padding: 0 !important;
  padding-left: 0 !important; /* Override Webflow's padding-left: 20px */
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
```

### 3. **Disable Webflow's Float Layout Pseudo-Elements**

**Problem**: Webflow uses `::before` and `::after` pseudo-elements to create float layouts:
```css
.w-checkbox:before {
  content: " ";
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}
.w-checkbox:after {
  content: " ";
  clear: both;
  grid-area: 1 / 1 / 2 / 2;
  display: table;
}
```

**Solution**: Completely disable these pseudo-elements:
```css
.contact5_form .w-checkbox.form_checkbox::before,
.contact5_form .w-checkbox.form_checkbox::after {
  display: none !important;
  content: none !important;
  clear: none !important;
  grid-area: unset !important;
}
```

### 4. **Override Float and Negative Margins**

**Problem**: Webflow uses `float: left` with negative margins:
```css
.w-checkbox-input {
  float: left;
  margin: 4px 0 0 -20px; /* Negative margin to compensate for padding */
}
```

**Solution**: Remove float and use normal margins:
```css
.contact5_form .w-checkbox-input,
.contact5_form .w-checkbox-input--inputType-custom {
  float: none !important;
  margin: 0 12px 0 0 !important; /* Normal spacing instead of negative */
  margin-left: 0 !important;
  margin-right: 12px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  position: relative !important;
}
```

### 5. **Force Left Alignment with Multiple Properties**

**Problem**: Even after removing padding and float, elements may still be offset.

**Solution**: Use multiple CSS properties to force left alignment:
```css
.contact5_form .form_field-wrapper:has(.w-checkbox.form_checkbox) {
  left: 0 !important;
  transform: translateX(0) !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
}

.contact5_form .form_field-wrapper .w-checkbox.form_checkbox {
  left: 0 !important;
  transform: translateX(0) !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
  position: relative !important;
}
```

### 6. **Use Flexbox Instead of Float**

**Problem**: Float-based layouts are harder to control.

**Solution**: Use flexbox for better control:
```css
.contact5_form .w-checkbox.form_checkbox {
  display: flex !important;
  align-items: center;
  justify-content: flex-start; /* Align to left */
  text-align: left;
  clear: both;
}
```

## Complete Example: Checkbox Alignment Fix

```css
/* ============================================
   Contact Form Checkbox Styling
   Clean, aligned, with blue checked state and animation
   ============================================ */

/* Contact form checkbox container - align with other fields - left aligned, override Webflow's padding-left and pseudo-elements */
.contact5_form .w-checkbox.form_checkbox {
  display: flex !important;
  align-items: center;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
  padding-left: 0 !important; /* Override Webflow's padding-left: 20px */
  cursor: pointer;
  position: relative;
  align-self: flex-start;
  justify-content: flex-start;
  text-align: left;
  clear: both;
}

/* Override Webflow's ::before and ::after pseudo-elements that create float layout */
.contact5_form .w-checkbox.form_checkbox::before,
.contact5_form .w-checkbox.form_checkbox::after {
  display: none !important;
  content: none !important;
  clear: none !important;
  grid-area: unset !important;
}

/* Ensure checkbox wrapper aligns with form fields - using form_field-wrapper like other fields */
.contact5_form .form_field-wrapper:has(.w-checkbox.form_checkbox) {
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

/* Align checkbox container with form field wrappers - left aligned, override Webflow's padding-left */
.contact5_form .form_field-wrapper .w-checkbox.form_checkbox {
  margin: 0 !important;
  padding: 0 !important;
  padding-left: 0 !important; /* Override Webflow's padding-left: 20px */
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

/* Override Webflow's checkbox input float and negative margin - align to left */
.contact5_form .w-checkbox-input,
.contact5_form .w-checkbox-input--inputType-custom,
.contact5_form .form_field-wrapper .w-checkbox-input,
.contact5_form .form_field-wrapper .w-checkbox-input--inputType-custom {
  float: none !important;
  margin: 0 12px 0 0 !important; /* Remove Webflow's negative margin (-20px), use normal spacing */
  margin-left: 0 !important;
  margin-right: 12px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  line-height: normal;
  position: relative !important;
  left: 0 !important;
  transform: translateX(0) !important;
}

/* Force checkbox to align with form inputs - match the exact left position */
.contact5_form .form_field-wrapper:has(.w-checkbox.form_checkbox) .w-checkbox.form_checkbox {
  margin-left: 0 !important;
  padding-left: 0 !important;
  left: 0 !important;
  transform: translateX(0) !important;
  position: relative !important;
}
```

## Key Principles for Webflow Alignment Fixes

1. **Match HTML Structure**: Use the same wrapper classes as other elements
2. **Override All Padding**: Set all padding values to `0 !important`
3. **Disable Pseudo-Elements**: Hide `::before` and `::after` that create float layouts
4. **Remove Float**: Use `float: none !important` and replace with flexbox
5. **Force Position**: Use `left: 0 !important` and `transform: translateX(0) !important`
6. **Use !important**: Webflow styles are often very specific, so `!important` is necessary
7. **Multiple Selectors**: Use specific selectors to increase CSS specificity
8. **Box-Sizing**: Set `box-sizing: border-box` to prevent unexpected sizing

## Common Webflow Classes to Watch For

- `.w-checkbox` - Has `padding-left: 20px` and float layout
- `.w-checkbox-input` - Has `float: left` and negative margins
- `.margin-bottom`, `.margin-xsmall` - Add unwanted margins
- `.w-checkbox::before`, `.w-checkbox::after` - Create float layouts

## Debugging Tips

1. **Inspect Element**: Check computed styles in DevTools
2. **Look for Inline Styles**: Webflow may add inline styles via JavaScript
3. **Check Pseudo-Elements**: Use DevTools to see `::before` and `::after`
4. **Test Specificity**: Make sure your selectors are specific enough
5. **Use !important**: When Webflow styles are very specific, `!important` is often needed

## When to Use This Approach

- ✅ Aligning Webflow form elements (checkboxes, radio buttons)
- ✅ Fixing spacing issues with Webflow components
- ✅ Overriding Webflow's default float-based layouts
- ✅ Creating consistent alignment across form fields

## When NOT to Use This Approach

- ❌ If you can modify the Webflow design directly (preferred)
- ❌ For elements that don't need precise alignment
- ❌ If the Webflow styles are intentional and desired

## Related Files

- `css/custom-styles.css` - Contains the checkbox alignment fixes
- `calculateur.html` - Contact form with checkbox

## Last Updated

2024 - Checkbox alignment fix for contact form

