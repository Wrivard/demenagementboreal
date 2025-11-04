# Moving Calculator: Automatic KM Calculation & Form Styling

## Table of Contents
1. [Automatic KM Calculation](#automatic-km-calculation)
2. [Form Variable Styling](#form-variable-styling)

---

## Automatic KM Calculation

### Overview
The moving calculator automatically calculates the distance in kilometers between two addresses using Google Maps Distance Matrix API. This feature provides a seamless user experience by eliminating manual distance entry.

### How It Works

#### 1. **Trigger Events**
The distance calculation is triggered automatically in the following scenarios:

- **Blur Events**: When the user leaves either the "from" address field (`address-from`) or the "to" address field (`address-to`)
  ```javascript
  fromInput.addEventListener('blur', () => this.calculateDistance());
  toInput.addEventListener('blur', () => this.calculateDistance());
  ```

- **Google Places Autocomplete**: When a user selects an address from the Google Places autocomplete dropdown
  ```javascript
  fromAutocomplete.addListener('place_changed', () => {
    const place = fromAutocomplete.getPlace();
    if (place.formatted_address) {
      fromInput.value = place.formatted_address;
      this.calculateDistance();
    }
  });
  ```

#### 2. **Calculation Process**

The calculation follows these steps:

1. **Validation**: Checks that both addresses are filled
   ```javascript
   const fromAddress = fromInput.value.trim();
   const toAddress = toInput.value.trim();
   if (!fromAddress || !toAddress) return;
   ```

2. **UI Feedback**: Shows loading state while calculating
   ```javascript
   distanceInput.placeholder = this.config.texts.calculating; // "Calcul automatique..."
   distanceInput.disabled = true;
   ```

3. **API Call**: Uses Google Maps Distance Matrix Service
   ```javascript
   const service = new google.maps.DistanceMatrixService();
   const request = {
     origins: [fromAddress],
     destinations: [toAddress],
     travelMode: google.maps.TravelMode.DRIVING,
     unitSystem: google.maps.UnitSystem.METRIC,
     avoidHighways: false,
     avoidTolls: false
   };
   ```

4. **Distance Conversion**: Converts meters to kilometers
   ```javascript
   const distanceKm = Math.round(element.distance.value / 1000);
   ```

5. **Result Display**: Updates the distance input field
   ```javascript
   distanceInput.value = distanceKm;
   distanceInput.disabled = false;
   ```

#### 3. **Implementation Details**

**Location**: `moving-calculator.js`

**Key Methods**:
- `calculateDistance()` - Main calculation method (lines 226-256)
- `calculateDistanceWithGoogleMaps()` - Google Maps API integration (lines 258-291)
- `showDistanceMessage()` - User feedback messages (lines 293-314)

**Configuration**:
```javascript
{
  enableDistanceCalculation: true,  // Enable/disable automatic calculation
  enableGoogleMaps: true,           // Enable Google Maps integration
  mapsApiEndpoint: '/api/get-maps-key'  // API endpoint for Maps key
}
```

#### 4. **Error Handling**

The system handles various error scenarios:

- **Google Maps Not Available**: Shows warning and allows manual entry
  ```javascript
  distanceInput.placeholder = 'Distance non disponible';
  distanceInput.disabled = false;
  ```

- **API Errors**: Catches and displays error messages
  ```javascript
  catch (error) {
    console.error('Distance calculation failed:', error);
    distanceInput.placeholder = 'Erreur de calcul';
    distanceInput.disabled = false;
  }
  ```

- **Invalid Addresses**: Distance Matrix API returns status codes that are handled gracefully

#### 5. **User Feedback Messages**

The system provides visual feedback through styled messages:

- **Success**: Green background with success message
  ```javascript
  showDistanceMessage(`Distance calculée: ${element.distance.text}`, 'success');
  ```

- **Warning**: Yellow background when Maps API is unavailable
- **Error**: Red background for calculation errors

Messages auto-remove after 5 seconds:
```javascript
setTimeout(() => {
  if (messageEl.parentNode) {
    messageEl.remove();
  }
}, 5000);
```

#### 6. **Distance Field Behavior**

The distance input field (`#distance`) has the following characteristics:

- **Initial State**: Read-only, shows placeholder "Calcul automatique..."
- **During Calculation**: Disabled, shows "Calculating..." placeholder
- **After Calculation**: Enabled with calculated value, shows success message
- **On Error**: Enabled, allows manual entry, shows error/warning message

#### 7. **Price Calculation Integration**

The calculated distance is used in quote calculations:

```javascript
const distance = parseInt(formData.distance) || 0;
const effectiveDistance = distance > 0 ? distance : 5; // Default 5km if no distance

// Distance costs apply only for distances over 50km
if (effectiveDistance > 50) {
  const distanceCost = Math.round((effectiveDistance - 50) * 2);
  totalPrice += distanceCost;
  maxPrice += distanceCost;
}
```

---

## Form Variable Styling

### Overview
The calculator uses a comprehensive CSS styling system with consistent design tokens, responsive layouts, and custom-styled third-party components.

### Design System

#### 1. **Color Palette**

The form uses a carefully chosen color scheme:

**Primary Colors**:
- Primary Blue: `#3b82f6` (buttons, focus states, progress bar)
- Primary Blue Dark: `#2563eb` (button hover)
- Primary Blue Darker: `#1d4ed8` (progress bar gradient end)

**Text Colors**:
- Primary Text: `#1e293b` (headings, important text)
- Secondary Text: `#374151` (labels, regular text)
- Tertiary Text: `#64748b` (subtitles, helper text)
- Placeholder: `#9ca3af` (input placeholders)

**Background Colors**:
- White: `#ffffff` (form container, inputs)
- Light Gray: `#f8fafc` (sections, backgrounds)
- Lighter Gray: `#f1f5f9` (hover states, alternating rows)
- Border Gray: `#e2e8f0` (borders, dividers)

**Status Colors**:
- Success: `#d1fae5` background, `#065f46` text
- Warning: `#fef3c7` background, `#92400e` text
- Error: `#fee2e2` background, `#991b1b` text

#### 2. **Typography**

**Font Sizes**:
```css
.moving-calculator-title { font-size: 36px; }      /* Main title */
.step-title { font-size: 24px; }                    /* Step headings */
.form-label { font-size: 14px; }                    /* Form labels */
.form-input { font-size: 16px; }                     /* Input text */
.breakdown-label { font-size: 14px; }               /* Breakdown text */
```

**Font Weights**:
- `700` - Headings, price amounts
- `600` - Labels, buttons, important elements
- `500` - Regular text, selected options
- `400` - Default weight

**Line Heights**:
- `1.2` - Headings
- `1.4` - Subtitles, labels
- `1.5` - Body text, inputs

#### 3. **Spacing System**

**Padding**:
- Form Container: `40px` (desktop), `24px` (mobile)
- Form Inputs: `12px 16px`
- Buttons: `12px 24px`
- Form Groups: `24px` bottom margin

**Margins**:
- Section spacing: `40px` vertical
- Element spacing: `24px` between form groups
- Button spacing: `32px` navigation padding

**Border Radius**:
- Large: `16px` (form container)
- Medium: `12px` (date picker, quote display)
- Small: `8px` (inputs, buttons, checkboxes)
- Round: `50%` (radio buttons)

### Form Components Styling

#### 1. **Form Inputs**

**Base Input Styles** (`.form-input`, `.form-select`, `.form-textarea`):
```css
.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  line-height: 1.5;
  color: #1f2937;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s ease;
  height: 48px;
}
```

**Focus State**:
```css
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

**Placeholder**:
```css
.form-input::placeholder {
  color: #9ca3af;
}
```

#### 2. **Radio Buttons**

**Custom Radio Styling**:
```css
.radio-option {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
```

**Custom Radio Indicator**:
```css
.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  margin-right: 12px;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #3b82f6;
  background: #3b82f6;
}
```

**Hover State**:
```css
.radio-option:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}
```

#### 3. **Checkboxes**

**Custom Checkbox Styling**:
```css
.checkbox-option {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}
```

**Checkmark Indicator**:
```css
.checkbox-option input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
}
```

#### 4. **Buttons**

**Primary Button**:
```css
.btn-primary {
  background: #3b82f6;
  color: #ffffff;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  min-width: 120px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
```

**Secondary Button**:
```css
.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}
```

#### 5. **Progress Bar**

**Progress Container**:
```css
.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}
```

**Progress Fill**:
```css
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 4px;
  transition: width 0.3s ease;
}
```

### Third-Party Component Styling

#### 1. **Google Places Autocomplete**

**Dropdown Container**:
```css
.pac-container {
  background-color: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  z-index: 1000 !important;
}
```

**Dropdown Items**:
```css
.pac-item {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #374151 !important;
}

.pac-item:hover {
  background-color: #f8fafc !important;
}

.pac-matched {
  font-weight: 600 !important;
  color: #3b82f6 !important;
}
```

#### 2. **Flatpickr Date Picker**

**Calendar Container**:
```css
.flatpickr-calendar {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
}
```

**Selected Date**:
```css
.flatpickr-day.selected {
  background: #3b82f6 !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3) !important;
}
```

**Today's Date**:
```css
.flatpickr-day.today {
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  background: #eff6ff !important;
}
```

#### 3. **Distance Calculation Messages**

**Message Container**:
```css
.distance-message {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  animation: fadeIn 0.3s ease-in;
}
```

**Success Message**:
```css
.distance-message.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
```

**Warning Message**:
```css
.distance-message.warning {
  background-color: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
```

**Error Message**:
```css
.distance-message.error {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}
```

### Quote Display Styling

#### 1. **Price Display**

```css
.price-amount {
  font-size: 48px;
  font-weight: 700;
  color: #3b82f6;
}

.price-range {
  font-size: 24px;
  font-weight: 600;
  color: #64748b;
}
```

#### 2. **Price Breakdown**

```css
.price-breakdown {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.breakdown-item:hover {
  background: #f8fafc;
  margin: 0 -12px;
  padding: 12px;
  border-radius: 6px;
}

.breakdown-item:last-child {
  border-top: 2px solid #e2e8f0;
  background: #f8fafc;
  font-weight: 700;
}
```

### Responsive Design

#### Mobile Breakpoint (768px)

**Container Adjustments**:
```css
@media (max-width: 768px) {
  .moving-calculator-wrapper {
    padding: 0 16px;
  }
  
  .form-container {
    padding: 24px;
  }
  
  .moving-calculator-title {
    font-size: 28px;
  }
  
  .form-navigation {
    flex-direction: column;
    gap: 16px;
  }
  
  .btn {
    width: 100%;
  }
}
```

**Typography Scaling**:
- Title: `36px` → `28px`
- Subtitle: `18px` → `16px`
- Step Title: `24px` → `20px`
- Price Amount: `48px` → `36px`

### CSS Variables & Customization

While the current implementation uses fixed color values, the styling system is designed to be easily customizable. To implement CSS variables, you could add:

```css
:root {
  --color-primary: #3b82f6;
  --color-primary-dark: #2563eb;
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-background: #ffffff;
  --color-background-light: #f8fafc;
  --color-border: #e2e8f0;
  --radius-small: 8px;
  --radius-medium: 12px;
  --radius-large: 16px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 40px;
}
```

### Animation & Transitions

**Smooth Transitions**:
```css
transition: all 0.2s ease;  /* Inputs, buttons, options */
transition: width 0.3s ease; /* Progress bar */
```

**Fade In Animation** (Distance Messages):
```css
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(-5px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
```

**Hover Effects**:
- Buttons: `translateY(-1px)` with shadow
- Form Options: Background color change
- Date Picker Days: `scale(1.05)`

---

## Summary

### Automatic KM Calculation
- ✅ Triggered on address field blur and autocomplete selection
- ✅ Uses Google Maps Distance Matrix API
- ✅ Converts meters to kilometers automatically
- ✅ Provides user feedback with styled messages
- ✅ Handles errors gracefully with fallback to manual entry
- ✅ Integrates seamlessly with price calculation

### Form Styling
- ✅ Consistent design system with color palette
- ✅ Responsive layout for all screen sizes
- ✅ Custom-styled form components (radio, checkbox, inputs)
- ✅ Third-party component styling (Google Places, Flatpickr)
- ✅ Smooth animations and transitions
- ✅ Accessible and user-friendly interface

---

## Files Reference

- **JavaScript**: `moving-calculator.js` (lines 226-314 for distance calculation)
- **CSS**: `moving-calculator-styles.css` (complete styling system)
- **HTML**: `moving-calculator-component.html` (form structure)
- **Config**: `moving-calculator-config.js` (configuration options)

