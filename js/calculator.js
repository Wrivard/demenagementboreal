// Clean Multi-Step Calculator - Google Maps only for address autocomplete
// Note: Contact section uses Google My Map (iframe embed), not Google Maps API
// Production-ready version with error handling and best practices

// Production mode flag - set to false for development logging
const PRODUCTION_MODE = true;

// Safe console logging (disabled in production)
const safeLog = {
  warn: PRODUCTION_MODE ? () => {} : console.warn.bind(console),
  error: PRODUCTION_MODE ? () => {} : console.error.bind(console),
  log: PRODUCTION_MODE ? () => {} : console.log.bind(console)
};

// IMMEDIATE: Suppress Google Maps console warnings BEFORE they appear
(function() {
  'use strict';
  
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Filter out Google Maps warnings
  console.warn = function(...args) {
    const message = args.join(' ');
    // Suppress Google Maps warnings
    if (
      message.includes('Google Maps JavaScript API') ||
      message.includes('You have included the Google Maps') ||
      message.includes('NoApiKeys') ||
      message.includes('Element with name \'gmp-internal') ||
      message.includes('has been loaded directly without loading async') ||
      message.includes('google.maps.Marker is deprecated') ||
      message.includes('google.maps.places.Autocomplete is not available')
    ) {
      return; // Suppress these warnings
    }
    originalWarn.apply(console, args);
  };
  
  // Filter out Google Maps errors (but keep real errors)
  console.error = function(...args) {
    const message = args.join(' ');
    // Suppress Google Maps specific errors that are not critical
    if (
      message.includes('gmp-internal') ||
      (message.includes('Google Maps') && message.includes('warning'))
    ) {
      return; // Suppress these
    }
    originalError.apply(console, args);
  };
})();

// IMMEDIATE: Disable Webflow map widgets to prevent Google Maps loading
(function() {
  'use strict';
  
  // Track if we've already loaded Google Maps with our API key
  window._googleMapsAPILoaded = false;
  window._googleMapsAPIKey = null;
  
  // Disable all Webflow map widgets immediately
  function disableWebflowMapWidgets() {
    try {
      const mapWidgets = document.querySelectorAll('.w-widget-map, [class*="w-widget-map"]');
      mapWidgets.forEach(widget => {
        if (widget && widget.nodeType === Node.ELEMENT_NODE) {
          widget.style.display = 'none';
          widget.style.visibility = 'hidden';
          widget.removeAttribute('data-widget-latlng');
          widget.removeAttribute('data-widget-address');
          widget.removeAttribute('data-widget-style');
          widget.removeAttribute('data-widget-zoom');
          // Prevent any event listeners
          widget.onclick = null;
          widget.onload = null;
        }
      });
    } catch (error) {
      safeLog.error('Error disabling Webflow map widgets:', error);
    }
  }
  
  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', disableWebflowMapWidgets);
  } else {
    disableWebflowMapWidgets();
  }
  
  // Also monitor for new map widgets with proper error handling
  let widgetObserver = null;
  try {
    widgetObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Validate node is an Element before processing
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            disableWebflowMapWidgets();
          }
        });
      });
    });
    
    if (document.body) {
      widgetObserver.observe(document.body, { childList: true, subtree: true });
    }
  } catch (error) {
    safeLog.error('Error setting up widget observer:', error);
  }
  
  // Remove any Google Maps scripts without API key immediately
  // This runs BEFORE scripts can load
  function removeUnauthorizedScripts() {
    try {
      // Get ALL scripts that reference Google Maps
      const allScripts = document.querySelectorAll('script[src]');
      allScripts.forEach(script => {
        if (script && script.nodeType === Node.ELEMENT_NODE && script.src) {
          const src = script.src;
          
          // Check if it's a Google Maps script
          if (src.includes('maps.googleapis.com') || src.includes('maps-api-v3')) {
            // Keep ONLY our script with API key
            if (script.hasAttribute('data-our-script')) {
              return; // Keep our script
            }
            
            // Remove if:
            // 1. No API key
            // 2. Has Webflow callback
            // 3. Is maps-api-v3 (Webflow's version)
            // 4. Already loaded Google Maps with our key
            if (
              !src.includes('key=') || 
              src.includes('callback=_wf_maps_loaded') || 
              src.includes('maps-api-v3') ||
              (window._googleMapsAPILoaded && !script.hasAttribute('data-our-script'))
            ) {
              try {
                // Prevent script from loading by removing it
                script.remove();
              } catch (e) {
                safeLog.error('Error removing script:', e);
              }
            }
          }
        }
      });
    } catch (error) {
      safeLog.error('Error removing unauthorized scripts:', error);
    }
  }
  
  // Run immediately and aggressively
  removeUnauthorizedScripts();
  
  // Run more frequently to catch scripts before they load
  setInterval(removeUnauthorizedScripts, 50);
  
  // Monitor for new scripts with proper error handling
  let scriptObserver = null;
  try {
    scriptObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Validate node is an Element before processing
          if (node && node.nodeType === Node.ELEMENT_NODE) {
            // Immediately remove unauthorized scripts
            if (node.tagName === 'SCRIPT' && node.src) {
              const src = node.src;
              if ((src.includes('maps.googleapis.com') || src.includes('maps-api-v3')) && !node.hasAttribute('data-our-script')) {
                if (!src.includes('key=') || src.includes('callback=_wf_maps_loaded') || src.includes('maps-api-v3')) {
                  try {
                    node.remove();
                  } catch (e) {
                    // Ignore
                  }
                }
              }
            }
            removeUnauthorizedScripts();
          }
        });
      });
    });
    
    if (document.head) {
      scriptObserver.observe(document.head, { childList: true, subtree: true });
    }
    if (document.body) {
      scriptObserver.observe(document.body, { childList: true, subtree: true });
    }
  } catch (error) {
    safeLog.error('Error setting up script observer:', error);
  }
})();

(function() {
  'use strict';
  
  function init() {
    const form = document.getElementById('estimation-form');
    if (!form) {
      return;
    }
    
    let currentStep = 1;
    const totalSteps = 5; // Step 1: 20%, Step 2: 40%, Step 3: 60%, Step 4: 80%, Step 5: 100% (result)
    let selectedServiceType = null;
    
    // Find all step elements
    const steps = {};
    for (let i = 1; i <= totalSteps; i++) {
      const stepEl = form.querySelector(`[data-step="${i}"]`);
      if (stepEl) {
        steps[i] = stepEl;
      }
    }
    
    // Show specific step
    function showStep(step) {
      
      // Hide all steps - use querySelectorAll to get ALL elements with each data-step
      // This ensures we hide both residential-questions and commercial-questions when they both have data-step="3"
      for (let i = 1; i <= totalSteps; i++) {
        const stepElements = form.querySelectorAll(`[data-step="${i}"]`);
        stepElements.forEach(stepEl => {
          if (stepEl) {
            stepEl.style.display = 'none';
            stepEl.classList.remove('active');
          }
        });
      }
      
      // ALWAYS hide residential and commercial questions when not on step 3
      // This prevents them from showing when moving to step 4
      const residential = form.querySelector('.residential-questions');
      const commercial = form.querySelector('.commercial-questions');
      
      if (step !== 3) {
        if (residential) {
          residential.style.display = 'none';
          residential.classList.remove('active');
        }
        if (commercial) {
          commercial.style.display = 'none';
          commercial.classList.remove('active');
        }
      }
      
      // Show current step
      if (steps[step]) {
        steps[step].style.display = 'block';
        steps[step].classList.add('active');
      }
      
      // Handle conditional step 3
      if (step === 3) {
        if (residential) {
          residential.style.display = 'none';
          residential.classList.remove('active');
        }
        if (commercial) {
          commercial.style.display = 'none';
          commercial.classList.remove('active');
        }
        
        if (selectedServiceType === 'residential' && residential) {
          residential.style.display = 'block';
          residential.classList.add('active');
        } else if (selectedServiceType === 'commercial' && commercial) {
          commercial.style.display = 'block';
          commercial.classList.add('active');
        }
      }
      
      // Initialize address autocomplete when step 3 or 4 is shown
      // (for dropoff address in step 3 and route addresses in step 4)
      if (step === 3 || step === 4) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          initAddressAutocomplete();
          // Also check if dropoff field is already visible and initialize it
          if (step === 3) {
            const dropoffCheckbox = form.querySelector('#service-dropoff');
            const dropoffAddressField = form.querySelector('#dropoff-address-field');
            if (dropoffCheckbox && dropoffCheckbox.checked && dropoffAddressField && dropoffAddressField.style.display !== 'none') {
              initDropoffAutocomplete();
            }
          }
        }, 100);
        
        // Scroll to top of form when showing step 4 (it's shorter than step 3)
        setTimeout(() => {
          // Try multiple selectors to find the form container
          let scrollTarget = form.closest('.multi-form11_component');
          if (!scrollTarget) {
            scrollTarget = form.closest('.multi-form11_block');
          }
          if (!scrollTarget) {
            scrollTarget = form.closest('section');
          }
          if (!scrollTarget) {
            scrollTarget = form;
          }
          
          if (scrollTarget) {
            try {
              scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Also try scrolling window to top of form
              const rect = scrollTarget.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const targetY = scrollTop + rect.top - 20; // 20px offset from top
              window.scrollTo({ top: targetY, behavior: 'smooth' });
            } catch (error) {
              safeLog.error('Error scrolling to form:', error);
            }
          }
        }, 150);
      }
      
      // Update progress bar - scale with current step
      // Try multiple selectors to find the progress bar
      let progressBar = form.querySelector('#progress-indicator');
      if (!progressBar) {
        progressBar = form.querySelector('[data-form="progress-indicator"]');
      }
      if (!progressBar) {
        progressBar = form.querySelector('.multi-form11_progress-bar[id="progress-indicator"]');
      }
      if (!progressBar) {
        // Try finding by class and data attribute
        const progressContainer = form.querySelector('.multi-form11_progress');
        if (progressContainer) {
          progressBar = progressContainer.querySelector('.multi-form11_progress-bar:not(.current)');
        }
      }
      
      if (progressBar) {
        // Calculate progress: step 1 = 20%, step 2 = 40%, step 3 = 60%, step 4 = 80%, step 5 = 100%
        // Use 5 as denominator to get 20%, 40%, 60%, 80%, 100% for steps 1-5
        const progress = step === 5 ? 100 : (step / 5) * 100;
        
        // Force update with !important to override any conflicting styles
        // Set width both as inline style and CSS variable
        // Disable flex properties that override width
        progressBar.style.setProperty('flex', 'none', 'important');
        progressBar.style.setProperty('flex-grow', '0', 'important');
        progressBar.style.setProperty('flex-shrink', '0', 'important');
        progressBar.style.setProperty('flex-basis', 'auto', 'important');
        progressBar.style.setProperty('width', progress + '%', 'important');
        progressBar.style.setProperty('--progress-width', progress + '%', 'important');
        progressBar.style.setProperty('display', 'block', 'important');
        progressBar.style.setProperty('background-color', '#72adcb', 'important');
        progressBar.style.setProperty('height', '100%', 'important');
        progressBar.style.setProperty('border-radius', '4px', 'important');
        progressBar.setAttribute('data-progress', progress);
        
        // Force a reflow to ensure the width is applied
        void progressBar.offsetWidth;
        
        // Double-check and force width again after reflow
        const computedWidth = window.getComputedStyle(progressBar).width;
        if (computedWidth === '100%' || computedWidth === progressBar.parentElement.offsetWidth + 'px') {
          progressBar.style.setProperty('width', progress + '%', 'important');
          progressBar.style.setProperty('flex', 'none', 'important');
        }
      }
      
      // Update step text
      const stepText = form.querySelector('.multi-form11_step-tag, #step-indicator');
      if (stepText) {
        // Show step 1-4 for form steps, "Résultats" for step 5
        if (step === 5) {
          stepText.textContent = 'Résultats';
        } else {
          stepText.textContent = `Étape ${step}/5`;
        }
      }
      
      currentStep = step;
      
      // Re-style radios after step change
      setTimeout(() => {
        styleRadios();
        setupButtons();
        if (step === 3) {
          // Setup conditional fields for step 3 (residential/commercial)
          // Additional delay to ensure section is fully visible
          setTimeout(() => {
            setupHeavyWeightField();
            setupDropoffAddressField();
          }, 150);
        }
      }, 100);
    }
    
    // Validate step - return error messages instead of alerting
    function validateStep(step) {
      let stepElement = steps[step];
      
      // For step 3, use conditional element
      if (step === 3) {
        if (selectedServiceType === 'residential') {
          stepElement = form.querySelector('.residential-questions');
        } else if (selectedServiceType === 'commercial') {
          stepElement = form.querySelector('.commercial-questions');
        }
      }
      
      if (!stepElement) return { isValid: true, errors: [] };
      
      const requiredFields = stepElement.querySelectorAll('[required]');
      const errors = [];
      
      requiredFields.forEach(field => {
        field.classList.remove('error');
        
        if (field.type === 'radio' || field.type === 'checkbox') {
          const name = field.name;
          const hasChecked = stepElement.querySelector(`input[name="${name}"]:checked`);
          if (!hasChecked && field.required) {
            errors.push(`Veuillez sélectionner ${field.closest('.multi-form11_field-wrapper')?.querySelector('.form_field-label')?.textContent || 'une option'}`);
            field.classList.add('error');
          }
        } else {
          if (!field.value || field.value.trim() === '') {
            const label = field.closest('.multi-form11_field-wrapper')?.querySelector('.form_field-label')?.textContent || field.name;
            errors.push(`${label} est requis`);
            field.classList.add('error');
          }
        }
      });
      
      // Special validation for step 2
      if (step === 2) {
        const serviceType = form.querySelector('input[name="service-type"]:checked');
        if (!serviceType) {
          errors.push('Veuillez sélectionner un type de déménagement');
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors: errors
      };
    }
    
    // Show error message inline (no alert)
    function showErrors(errors) {
      // Remove existing error messages
      const existingErrors = form.querySelectorAll('.inline-error-message');
      existingErrors.forEach(el => el.remove());
      
      if (errors.length === 0) return;
      
      // Show first error inline
      const currentStepEl = steps[currentStep] || form.querySelector('.active[data-step]');
      if (currentStepEl) {
        const errorEl = document.createElement('div');
        errorEl.className = 'inline-error-message';
        errorEl.style.cssText = `
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid #dc2626;
          border-radius: 8px;
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
        `;
        errorEl.textContent = errors[0];
        
        const content = currentStepEl.querySelector('.multi-form11_form-content');
        if (content) {
          content.insertBefore(errorEl, content.firstChild);
        }
      }
    }
    
    // Navigation
    function nextStep() {
      const validation = validateStep(currentStep);
      
      if (!validation.isValid) {
        showErrors(validation.errors);
        return;
      }
      
      // Clear errors
      showErrors([]);
      
      // Handle service type selection
      if (currentStep === 2) {
        const serviceType = form.querySelector('input[name="service-type"]:checked');
        if (serviceType) {
          selectedServiceType = serviceType.value;
        }
      }
      
      // Don't go to step 5 automatically - it's shown via form submission
      if (currentStep < 4) {
        showStep(currentStep + 1);
      }
    }
    
    function prevStep() {
      showErrors([]); // Clear errors
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    }
    
    // Style radio buttons with good contrast
    function styleRadios() {
      const radios = form.querySelectorAll('.custom-radio-option');
      
      radios.forEach(radio => {
        const input = radio.querySelector('input[type="radio"]');
        const badge = radio.querySelector('.custom-radio-badge');
        const label = radio.querySelector('.custom-radio-label');
        
        if (!input || !badge || !label) return;
        
        // Base styles with white background and excellent contrast
        radio.style.cssText = `
          display: flex;
          align-items: center;
          padding: 20px;
          margin: 0 0 16px 0;
          background: #ffffff;
          border: 2px solid rgba(0, 0, 0, 0.15);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-sizing: border-box;
        `;
        
        badge.style.cssText = `
          width: 36px;
          height: 36px;
          margin-right: 16px;
          background: #f5f5f5;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333333;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        `;
        
        label.style.cssText = `
          flex: 1;
          color: #1a1a1a;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.5;
        `;
        
        // Selection handler
        input.addEventListener('change', function() {
          updateRadioStyles();
        });
        
        // Click handler
        radio.addEventListener('click', function(e) {
          if (e.target !== input) {
            input.checked = true;
            input.dispatchEvent(new Event('change'));
          }
        });
      });
      
      updateRadioStyles();
    }
    
    function updateRadioStyles() {
      const radios = form.querySelectorAll('.custom-radio-option');
      
      radios.forEach(radio => {
        const input = radio.querySelector('input[type="radio"]');
        const badge = radio.querySelector('.custom-radio-badge');
        const label = radio.querySelector('.custom-radio-label');
        
        if (!input || !badge || !label) return;
        
        if (input.checked) {
          // Selected state - accent blue color on white
          radio.style.cssText += `
            background: #ffffff;
            border-color: #72adcb;
            box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.2);
          `;
          badge.style.cssText += `
            background: #72adcb;
            border-color: #72adcb;
            color: #ffffff;
          `;
          label.style.cssText += `
            color: #1a1a1a;
            font-weight: 600;
          `;
        } else {
          // Unselected state - white background with good contrast
          radio.style.cssText += `
            background: #ffffff;
            border-color: rgba(0, 0, 0, 0.15);
            box-shadow: none;
          `;
          badge.style.cssText += `
            background: #f5f5f5;
            border-color: rgba(0, 0, 0, 0.2);
            color: #333333;
          `;
          label.style.cssText += `
            color: #1a1a1a;
            font-weight: 500;
          `;
        }
      });
    }
    
    // Setup button listeners
    function setupButtons() {
      // Remove existing listeners by cloning buttons
      const nextButtons = form.querySelectorAll('.form-next-btn');
      nextButtons.forEach(btn => {
        // Skip if already has our listener (check by data attribute)
        if (btn.dataset.listenerAttached === 'true') return;
        
        // Remove old listeners by cloning
        const newBtn = btn.cloneNode(true);
        newBtn.dataset.listenerAttached = 'true';
        if (btn.parentNode) {
          btn.parentNode.replaceChild(newBtn, btn);
        }
        
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          nextStep();
        });
      });
      
      // Find all back buttons
      const backButtons = form.querySelectorAll('.form-back-btn');
      backButtons.forEach(btn => {
        // Skip if already has our listener
        if (btn.dataset.listenerAttached === 'true') return;
        
        const newBtn = btn.cloneNode(true);
        newBtn.dataset.listenerAttached = 'true';
        if (btn.parentNode) {
          btn.parentNode.replaceChild(newBtn, btn);
        }
        
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          prevStep();
        });
      });
    }
    
    // Style checkboxes with visible checkmarks
    function styleCheckboxes() {
      const checkboxes = form.querySelectorAll('.form_checkbox-btn, .w-checkbox');
      
      checkboxes.forEach(checkbox => {
        const input = checkbox.querySelector('input[type="checkbox"]');
        const icon = checkbox.querySelector('.w-checkbox-input, .form_checkbox-icon');
        
        if (!input || !icon) return;
        
        // Remove existing event listeners by cloning
        const newCheckbox = checkbox.cloneNode(true);
        const newInput = newCheckbox.querySelector('input[type="checkbox"]');
        const newIcon = newCheckbox.querySelector('.w-checkbox-input, .form_checkbox-icon');
        if (checkbox.parentNode) {
          checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        }
        
        // Ensure checkbox has good contrast with white background
        newCheckbox.style.cssText = `
          background: #ffffff;
          border: 2px solid rgba(0, 0, 0, 0.15);
          padding: 18px 20px;
          margin: 10px 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
        `;
        
        newIcon.style.cssText = `
          width: 24px;
          height: 24px;
          margin-right: 12px;
          background: #f5f5f5;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          transition: all 0.3s ease;
        `;
        
        // Update checkbox state
        function updateCheckbox() {
          if (newInput.checked) {
            newCheckbox.style.cssText = `
              background: #ffffff;
              border: 2px solid #72adcb;
              padding: 18px 20px;
              margin: 10px 0;
              border-radius: 12px;
              display: flex;
              align-items: center;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.2);
            `;
            newIcon.style.cssText = `
              width: 24px;
              height: 24px;
              margin-right: 12px;
              background: #ffffff;
              border: 2px solid #72adcb;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              position: relative;
              transition: all 0.3s ease;
            `;
            // Remove any ::after pseudo-element content
            newIcon.setAttribute('data-no-after', 'true');
            // Add visible checkmark SVG - accent blue checkmark on white background, perfectly centered
            newIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 16px; height: 16px; margin: 0 auto;"><path d="M13 4L6 11L3 8" stroke="#72adcb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          } else {
            newCheckbox.style.cssText = `
              background: #ffffff;
              border: 2px solid rgba(0, 0, 0, 0.15);
              padding: 18px 20px;
              margin: 10px 0;
              border-radius: 12px;
              display: flex;
              align-items: center;
              cursor: pointer;
              transition: all 0.3s ease;
            `;
            newIcon.style.cssText = `
              width: 24px;
              height: 24px;
              margin-right: 12px;
              background: #f5f5f5;
              border: 2px solid rgba(0, 0, 0, 0.2);
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              position: relative;
              transition: all 0.3s ease;
            `;
            newIcon.innerHTML = '';
          }
        }
        
        // Handle checkbox change
        newInput.addEventListener('change', updateCheckbox);
        
        // Handle click on label/checkbox container
        newCheckbox.addEventListener('click', function(e) {
          if (e.target !== newInput) {
            e.preventDefault();
            newInput.checked = !newInput.checked;
            newInput.dispatchEvent(new Event('change'));
          }
        });
        
        // Initial state
        updateCheckbox();
      });
    }
    
    // Google Maps Autocomplete and Distance Calculation
    let googleMapsLoaded = false;
    let fromAutocomplete = null;
    let toAutocomplete = null;
    let dropoffAutocomplete = null;
    let distanceMatrixService = null;
    let mapsAPILoadPromise = null;
    let cleanupInterval = null;
    let mapsObserver = null;
    
    function showDistanceMessage(message, type) {
      removeDistanceMessage();
      
      const distanceInput = form.querySelector('#form-distance');
      if (!distanceInput) return;
      
      const wrapper = distanceInput.closest('.multi-form11_field-wrapper');
      if (!wrapper) return;
      
      const messageEl = document.createElement('div');
      messageEl.className = `distance-message distance-message-${type}`;
      messageEl.textContent = message;
      
      wrapper.appendChild(messageEl);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 5000);
    }
    
    function removeDistanceMessage() {
      const existing = form.querySelector('.distance-message');
      if (existing) {
        existing.remove();
      }
    }
    
    async function loadGoogleMapsAPI() {
      // Prevent multiple loads - check global flag first
      if (window._googleMapsAPILoaded && window.google && window.google.maps && window.google.maps.places) {
        googleMapsLoaded = true;
        return true;
      }
      
      if (googleMapsLoaded) return true;
      
      // Check if Google Maps is already loaded (even by Webflow) - if so, use it
      if (window.google && window.google.maps) {
        // Check if places library is available
        if (window.google.maps.places) {
          googleMapsLoaded = true;
          window._googleMapsAPILoaded = true;
          // Mark as loaded even if Webflow loaded it, to prevent our script from loading again
          return true;
        }
        // If maps is loaded but places is not, we still need to load with places library
        // But first check if there's a script loading it
        const existingMapsScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingMapsScript && !existingMapsScript.src.includes('libraries=places')) {
          // Remove the existing script and load our own with places library
          try {
            existingMapsScript.remove();
          } catch (e) {
            safeLog.error('Error removing existing maps script:', e);
          }
        }
      }
      
      // If already loading, return the existing promise
      if (mapsAPILoadPromise) {
        return mapsAPILoadPromise;
      }
      
      // Check if we're already loading
      if (window._googleMapsLoading) {
        mapsAPILoadPromise = new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (googleMapsLoaded || (window.google && window.google.maps && window.google.maps.places)) {
              clearInterval(checkInterval);
              googleMapsLoaded = true;
              window._googleMapsAPILoaded = true;
              resolve(true);
            }
          }, 100);
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkInterval);
            if (window.google && window.google.maps && window.google.maps.places) {
              googleMapsLoaded = true;
              window._googleMapsAPILoaded = true;
              resolve(true);
            } else {
              resolve(false);
            }
          }, 10000);
        });
        return mapsAPILoadPromise;
      }
      
      window._googleMapsLoading = true;
      
      mapsAPILoadPromise = (async () => {
        try {
          // Remove any existing Google Maps scripts that don't have our marker
          // Remove ALL scripts without API key (Webflow's scripts)
          // But keep scripts that have our API key
          const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"], script[src*="maps-api-v3"]');
          existingScripts.forEach(script => {
            // Keep our script with API key
            if (script.hasAttribute('data-our-script')) {
              return;
            }
            // Remove scripts without API key or with Webflow callbacks
            if (!script.src.includes('key=') || script.src.includes('callback=_wf_maps_loaded') || script.src.includes('maps-api-v3')) {
              try {
                script.remove();
              } catch (e) {
                safeLog.error('Error removing script:', e);
              }
            }
          });
          
          // Also disable all Webflow map widgets
          const mapWidgets = document.querySelectorAll('.w-widget-map, [class*="w-widget-map"]');
          mapWidgets.forEach(widget => {
            if (widget && widget.nodeType === Node.ELEMENT_NODE) {
              widget.style.display = 'none';
              widget.style.visibility = 'hidden';
              widget.removeAttribute('data-widget-latlng');
              widget.removeAttribute('data-widget-address');
              widget.removeAttribute('data-widget-style');
              widget.removeAttribute('data-widget-zoom');
            }
          });
          
          // Wait a bit to ensure old scripts are fully removed
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Get API key from serverless function
          const response = await fetch('/api/get-maps-key');
          
          if (!response.ok) {
            window._googleMapsLoading = false;
            mapsAPILoadPromise = null;
            showDistanceMessage('Erreur de récupération de la clé API. Vous pouvez saisir la distance manuellement.', 'warning');
            return false;
          }
          
          const data = await response.json();
          
          if (!data.success || !data.apiKey) {
            window._googleMapsLoading = false;
            mapsAPILoadPromise = null;
            showDistanceMessage('Clé API Google Maps non disponible. Vérifiez la configuration Vercel. Vous pouvez saisir la distance manuellement.', 'warning');
            return false;
          }
          
          const apiKey = data.apiKey;
          
          // Check if script with this API key already exists
          const existingScript = document.querySelector(`script[src*="maps.googleapis.com"][src*="key=${apiKey}"]`);
          if (existingScript && existingScript.hasAttribute('data-our-script')) {
            // Script already exists with our API key, just wait for it to load
            return new Promise((resolve) => {
              let retries = 0;
              const maxRetries = 50; // 5 seconds max
              const checkLoaded = setInterval(() => {
                retries++;
                if (window.google && window.google.maps && window.google.maps.places) {
                  clearInterval(checkLoaded);
                  googleMapsLoaded = true;
                  window._googleMapsAPILoaded = true;
                  window._googleMapsAPIKey = apiKey;
                  window._googleMapsLoading = false;
                  mapsAPILoadPromise = null;
                  resolve(true);
                } else if (retries >= maxRetries) {
                  clearInterval(checkLoaded);
                  window._googleMapsLoading = false;
                  mapsAPILoadPromise = null;
                  resolve(false);
                }
              }, 100);
            });
          }
          
          // Load Google Maps JavaScript API with API key
          return new Promise((resolve, reject) => {
            // Double check - if Google Maps is already loaded with API key, we're good
            if (window.google && window.google.maps && window.google.maps.places) {
              googleMapsLoaded = true;
              window._googleMapsAPILoaded = true;
              window._googleMapsAPIKey = apiKey;
              window._googleMapsLoading = false;
              mapsAPILoadPromise = null;
              resolve(true);
              return;
            }
            
            // Check if script with this exact API key already exists in DOM
            const existingWithKey = document.querySelector(`script[src*="maps.googleapis.com"][src*="key=${apiKey}"]`);
            if (existingWithKey && existingWithKey.hasAttribute('data-our-script')) {
              // Script already exists, just wait for it
              googleMapsLoaded = true;
              window._googleMapsAPILoaded = true;
              window._googleMapsAPIKey = apiKey;
              window._googleMapsLoading = false;
              mapsAPILoadPromise = null;
              resolve(true);
              return;
            }
            
            const script = document.createElement('script');
            const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr&callback=initGoogleMapsCallback&loading=async`;
            
            // Set callback for when Google Maps is loaded
            window.initGoogleMapsCallback = function() {
              googleMapsLoaded = true;
              window._googleMapsAPILoaded = true;
              window._googleMapsAPIKey = apiKey;
              window._googleMapsLoading = false;
              mapsAPILoadPromise = null;
              if (window.google && window.google.maps && window.google.maps.places) {
                resolve(true);
              } else {
                reject(new Error('Google Maps API loaded but places library not available'));
              }
              // Clean up callback after a delay to ensure it's called
              setTimeout(() => {
                if (window.initGoogleMapsCallback) {
                  delete window.initGoogleMapsCallback;
                }
              }, 1000);
            };
            
            script.src = scriptUrl;
            script.async = true;
            script.defer = true;
            script.setAttribute('data-our-script', 'true'); // Mark as our script
            script.setAttribute('data-api-key', apiKey); // Store API key for reference
            
          script.onload = () => {
            // Wait a bit for callback
            setTimeout(() => {
              if (window.google && window.google.maps && window.google.maps.places) {
                if (!googleMapsLoaded) {
                  googleMapsLoaded = true;
                  window._googleMapsAPILoaded = true;
                  window._googleMapsAPIKey = apiKey;
                  window._googleMapsLoading = false;
                  mapsAPILoadPromise = null;
                  resolve(true);
                }
              }
            }, 500);
          };
            
            script.onerror = (error) => {
              window._googleMapsLoading = false;
              mapsAPILoadPromise = null;
              if (window.initGoogleMapsCallback) {
                delete window.initGoogleMapsCallback;
              }
              showDistanceMessage('Erreur de chargement de Google Maps. Vérifiez votre ad-blocker. Vous pouvez saisir la distance manuellement.', 'warning');
              reject(error);
            };
            
            // Insert script at the beginning of head to ensure it loads first
            try {
              const firstScript = document.head.querySelector('script');
              if (firstScript && firstScript.parentNode) {
                document.head.insertBefore(script, firstScript);
              } else {
                document.head.appendChild(script);
              }
            } catch (error) {
              safeLog.error('Error inserting Google Maps script:', error);
              reject(error);
            }
          });
        } catch (error) {
          window._googleMapsLoading = false;
          mapsAPILoadPromise = null;
          showDistanceMessage('Erreur de chargement de Google Maps. Vous pouvez saisir la distance manuellement.', 'warning');
          return false;
        }
      })();
      
      return mapsAPILoadPromise;
    }
    
    function initAddressAutocomplete() {
      const fromInput = form.querySelector('#form-address-departure');
      const toInput = form.querySelector('#form-address-destination');
      const distanceInput = form.querySelector('#form-distance');
      const dropoffInput = form.querySelector('#dropoff-address');
      
      if (!fromInput || !toInput || !distanceInput) return;
      
      // Load Google Maps API first
      loadGoogleMapsAPI().then(loaded => {
        if (!loaded) {
          // Fallback: allow manual distance entry
          distanceInput.removeAttribute('readonly');
          distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
          return;
        }
        
        // Wait for Google Maps to be fully loaded - check for places library
        let retries = 0;
        const maxRetries = 50; // 5 seconds max
        const initPlaces = () => {
          retries++;
          if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
            try {
              // Re-check inputs exist at this point
              if (!fromInput || !toInput) {
                return;
              }
              
              // Initialize Google Places Autocomplete
              // Note: Removed bounds object to avoid setBounds errors - using componentRestrictions instead
              const options = {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'geometry'],
                types: ['address']
              };
              
              // Clear any existing autocomplete instances
              if (fromAutocomplete) {
                try {
                  google.maps.event.clearInstanceListeners(fromInput);
                } catch (e) {
                  // Ignore errors when clearing listeners
                }
              }
              if (dropoffAutocomplete && dropoffInput) {
                try {
                  google.maps.event.clearInstanceListeners(dropoffInput);
                } catch (e) {
                  // Ignore errors when clearing listeners
                }
              }
              if (toAutocomplete) {
                try {
                  google.maps.event.clearInstanceListeners(toInput);
                } catch (e) {
                  // Ignore errors when clearing listeners
                }
              }
              
              try {
                // Validate that Autocomplete is available (not deprecated for existing customers)
                if (typeof google.maps.places.Autocomplete === 'function') {
                  fromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
                  toAutocomplete = new google.maps.places.Autocomplete(toInput, options);
                  if (dropoffInput) {
                    dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, options);
                  }
                } else {
                  // Fallback if Autocomplete is not available
                  safeLog.warn('Google Places Autocomplete not available');
                  distanceInput.removeAttribute('readonly');
                  distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
                  return;
                }
              } catch (error) {
                // If autocomplete fails, allow manual entry
                safeLog.error('Error initializing Autocomplete:', error);
                distanceInput.removeAttribute('readonly');
                distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
                return;
              }
              
              // Initialize Distance Matrix Service
              try {
                distanceMatrixService = new google.maps.DistanceMatrixService();
              } catch (error) {
                // If Distance Matrix Service fails, allow manual entry
                distanceInput.removeAttribute('readonly');
                distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
                return;
              }
              
              // Listen for place selection on "from" address
              fromAutocomplete.addListener('place_changed', () => {
                try {
                  const place = fromAutocomplete.getPlace();
                  if (place && place.formatted_address) {
                    // Validate geometry before using
                    if (place.geometry && place.geometry.location) {
                      const lat = place.geometry.location.lat();
                      const lng = place.geometry.location.lng();
                      // Check if coordinates are valid numbers
                      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                        // Invalid coordinates, skip
                        return;
                      }
                    }
                    fromInput.value = place.formatted_address;
                    calculateDistance();
                  }
                } catch (error) {
                  safeLog.error('Error in fromAutocomplete place_changed:', error);
                }
              });
              
              // Listen for place selection on "to" address
              toAutocomplete.addListener('place_changed', () => {
                try {
                  const place = toAutocomplete.getPlace();
                  if (place && place.formatted_address) {
                    // Validate geometry before using
                    if (place.geometry && place.geometry.location) {
                      const lat = place.geometry.location.lat();
                      const lng = place.geometry.location.lng();
                      // Check if coordinates are valid numbers
                      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                        // Invalid coordinates, skip
                        return;
                      }
                    }
                    toInput.value = place.formatted_address;
                    calculateDistance();
                  }
                } catch (error) {
                  safeLog.error('Error in toAutocomplete place_changed:', error);
                }
              });
              
              // Optional: format dropoff address nicely when a place is selected
              if (dropoffAutocomplete && dropoffInput) {
                dropoffAutocomplete.addListener('place_changed', () => {
                  try {
                    const place = dropoffAutocomplete.getPlace();
                    if (place && place.formatted_address) {
                      dropoffInput.value = place.formatted_address;
                    }
                  } catch (error) {
                    safeLog.error('Error in dropoffAutocomplete place_changed:', error);
                  }
                });
              }
              
              // Also calculate on blur events
              fromInput.addEventListener('blur', () => {
                try {
                  calculateDistance();
                } catch (error) {
                  safeLog.error('Error calculating distance on blur:', error);
                }
              });
              
              toInput.addEventListener('blur', () => {
                try {
                  calculateDistance();
                } catch (error) {
                  safeLog.error('Error calculating distance on blur:', error);
                }
              });
            } catch (error) {
              // Handle errors gracefully
              safeLog.error('Error in initPlaces:', error);
              distanceInput.removeAttribute('readonly');
              distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
            }
          } else if (retries < maxRetries) {
            // Retry after a short delay if places library not loaded yet
            setTimeout(initPlaces, 100);
          } else {
            // Max retries reached, allow manual entry
            distanceInput.removeAttribute('readonly');
            distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
          }
        };
        
        initPlaces();
      }).catch(error => {
        safeLog.error('Error loading Google Maps API:', error);
        const distanceInput = form.querySelector('#form-distance');
        if (distanceInput) {
          distanceInput.removeAttribute('readonly');
          distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
        }
      });
    }
    
    function calculateDistance() {
      const fromInput = form.querySelector('#form-address-departure');
      const toInput = form.querySelector('#form-address-destination');
      const distanceInput = form.querySelector('#form-distance');
      
      if (!fromInput || !toInput || !distanceInput) return;
      
      const fromAddress = fromInput.value.trim();
      const toAddress = toInput.value.trim();
      
      // Validate both addresses are filled
      if (!fromAddress || !toAddress) {
        return;
      }
      
      // Show loading state
      distanceInput.placeholder = 'Calcul en cours...';
      distanceInput.disabled = true;
      distanceInput.value = '';
      
      // Remove existing messages
      removeDistanceMessage();
      
      // Check if Google Maps is available
      if (!distanceMatrixService || !window.google || !window.google.maps) {
        distanceInput.placeholder = 'Distance non disponible';
        distanceInput.disabled = false;
        showDistanceMessage('Google Maps non disponible. Vous pouvez saisir la distance manuellement.', 'warning');
        return;
      }
      
      // Calculate distance using Distance Matrix API
      const request = {
        origins: [fromAddress],
        destinations: [toAddress],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      };
      
      try {
        distanceMatrixService.getDistanceMatrix(request, (response, status) => {
          try {
            if (status === 'OK' && response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0].status === 'OK') {
              const element = response.rows[0].elements[0];
              const distanceValue = element.distance && element.distance.value ? element.distance.value : 0;
              const distanceKm = Math.round(distanceValue / 1000);
              
              // Validate distance is a valid number
              if (isNaN(distanceKm) || !isFinite(distanceKm) || distanceKm <= 0) {
                distanceInput.placeholder = 'Erreur de calcul';
                distanceInput.disabled = false;
                return;
              }
              
              // Update distance input
              distanceInput.value = distanceKm;
              distanceInput.disabled = false;
              distanceInput.placeholder = 'Calcul automatique...';
              
              // Show success message
              if (element.distance && element.distance.text) {
                showDistanceMessage(`Distance calculée: ${element.distance.text}`, 'success');
              }
            } else {
              // Handle errors
              distanceInput.placeholder = 'Erreur de calcul';
              distanceInput.disabled = false;
              
              let errorMessage = 'Impossible de calculer la distance.';
              if (status === 'ZERO_RESULTS') {
                errorMessage = 'Aucun résultat trouvé pour ces adresses.';
              } else if (status === 'REQUEST_DENIED') {
                errorMessage = 'Erreur d\'autorisation. La clé API Google Maps n\'est pas valide ou n\'a pas les permissions nécessaires. Vérifiez la configuration Vercel.';
              } else if (status === 'OVER_QUERY_LIMIT') {
                errorMessage = 'Limite de requêtes dépassée.';
              } else if (status === 'INVALID_REQUEST') {
                errorMessage = 'Requête invalide. Vérifiez les adresses.';
              } else {
                if (response && response.error_message) {
                  errorMessage += ' ' + response.error_message;
                }
              }
              
              showDistanceMessage(errorMessage, 'error');
            }
          } catch (error) {
            // Handle errors gracefully
            safeLog.error('Error processing distance matrix response:', error);
            distanceInput.placeholder = 'Erreur de calcul';
            distanceInput.disabled = false;
          }
        });
      } catch (error) {
        // Handle errors gracefully
        safeLog.error('Error calling distance matrix service:', error);
        distanceInput.placeholder = 'Erreur de calcul';
        distanceInput.disabled = false;
      }
    }
    
    // Initialize Flatpickr date picker
    function initDatePicker() {
      const dateInput = form.querySelector('#form-date');
      if (!dateInput) return;
      
      // Disable browser autocomplete completely for date picker
      dateInput.setAttribute('autocomplete', 'new-password'); // Use 'new-password' to trick browser
      dateInput.setAttribute('data-lpignore', 'true');
      dateInput.setAttribute('data-form-type', 'other');
      dateInput.setAttribute('spellcheck', 'false');
      dateInput.setAttribute('readonly', 'readonly'); // Prevent browser autocomplete
      
      // Prevent browser autocomplete by intercepting input events
      dateInput.addEventListener('focus', function(e) {
        e.preventDefault();
        this.blur();
        // Open Flatpickr manually
        if (window.flatpickr && this._flatpickr) {
          this._flatpickr.open();
        }
      }, { capture: true });
        
      // Check if Flatpickr is available
      if (typeof flatpickr === 'undefined') {
        return;
      }
      
      try {
        // Initialize Flatpickr with French locale
        const datePicker = flatpickr(dateInput, {
          locale: 'fr',
          dateFormat: 'd/m/Y',
          minDate: 'today',
          allowInput: false, // Disable manual input to prevent browser autocomplete
          clickOpens: true,
          placeholder: 'Sélectionner une date',
          monthSelectorType: 'static',
          altInput: false,
          disableMobile: false // Keep mobile calendar
        });
        
        // Remove readonly after Flatpickr initialization (it will handle input)
        setTimeout(() => {
          dateInput.removeAttribute('readonly');
        }, 100);
        
        // Prevent browser autocomplete on change
        dateInput.addEventListener('input', function(e) {
          e.stopPropagation();
        }, { capture: true });
      } catch (error) {
        // Re-enable input if Flatpickr fails
        safeLog.error('Error initializing Flatpickr:', error);
        dateInput.removeAttribute('readonly');
      }
    }
    
    // Pricing calculation
    const PRICING = {
      MIN_HOURS: 3,
      HOUR_RATE: 140,
      MIN_PRICE: 3 * 140, // 420$
      DISTANCE_PER_KM: 0.90,
      HEAVY_WEIGHT_THRESHOLD: 250,
      HEAVY_WEIGHT_RATE: 0.60, // per lb over threshold
      RESIDENCE: {
        'studio': 420,
        'apartment-1': 420,
        'apartment-2': 510,
        'apartment-3': 850,
        'apartment-4': 1020,
        'house-small': 1020,
        'house-large': 1530
      }
    };
    
    function calculatePrice() {
      let total = 0;
      
      // Only calculate for residential moves
      if (selectedServiceType !== 'residential') {
        return { base: 0, total: 0, min: 0, max: 0 };
      }
      
      // Base price: Type of residence
      const residenceSelect = form.querySelector('#res-residence');
      if (residenceSelect && residenceSelect.value) {
        const residencePrice = PRICING.RESIDENCE[residenceSelect.value] || 0;
        total += residencePrice;
      }
      
      // Distance cost: 0.90$ per km
      const distanceInput = form.querySelector('#form-distance');
      if (distanceInput && distanceInput.value) {
        const distance = parseFloat(distanceInput.value) || 0;
        total += distance * PRICING.DISTANCE_PER_KM;
      }
      
      // Heavy objects: 0.60$ per lb over 250 lb
      const heavyWeightCheckbox = form.querySelector('#heavy-weight');
      const heavyWeightInput = form.querySelector('#heavy-weight-input');
      if (heavyWeightCheckbox && heavyWeightCheckbox.checked && heavyWeightInput && heavyWeightInput.value) {
        const weight = parseFloat(heavyWeightInput.value) || 0;
        if (weight > PRICING.HEAVY_WEIGHT_THRESHOLD) {
          const excessWeight = weight - PRICING.HEAVY_WEIGHT_THRESHOLD;
          total += excessWeight * PRICING.HEAVY_WEIGHT_RATE;
        }
      }
      
      // Ensure minimum 3 hours (420$)
      const basePrice = Math.max(total, PRICING.MIN_PRICE);
      
      // Calculate price range: 25% under and 25% over
      const minPrice = Math.round(basePrice * 0.75);
      const maxPrice = Math.round(basePrice * 1.25);
      
      return {
        base: basePrice,
        total: basePrice,
        min: minPrice,
        max: maxPrice
      };
    }
    
    function displayPriceResult() {
      const resultStep = form.querySelector('#result-step');
      const resultContent = form.querySelector('#quote-result');
      
      if (!resultStep || !resultContent) return;
      
      const pricing = calculatePrice();
      
      // Format prices
      const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-CA', {
          style: 'currency',
          currency: 'CAD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(price);
      };
      
      // Collect user choices for display
      // Use document.querySelector to find elements even if they're hidden
      const choices = [];
      
      // Informations personnelles (Step 1)
      const nameInput = document.querySelector('#form-name');
      if (nameInput && nameInput.value && nameInput.value.trim()) {
        choices.push(`Nom: ${nameInput.value.trim()}`);
      }
      
      const emailInput = document.querySelector('#form-email');
      if (emailInput && emailInput.value && emailInput.value.trim()) {
        choices.push(`Email: ${emailInput.value.trim()}`);
      }
      
      const phoneInput = document.querySelector('#form-phone');
      if (phoneInput && phoneInput.value && phoneInput.value.trim()) {
        choices.push(`Téléphone: ${phoneInput.value.trim()}`);
      }
      
      // Type de service (Step 2)
      const serviceType = document.querySelector('input[name="service-type"]:checked');
      if (serviceType) {
        const serviceLabel = document.querySelector(`label[for="${serviceType.id}"] .custom-radio-label`);
        if (serviceLabel) {
          choices.push(`Type de service: ${serviceLabel.textContent.trim()}`);
        }
      }
      
      // Détails du déménagement (Step 3)
      if (selectedServiceType === 'residential') {
        // Type de résidence
        const residenceSelect = document.querySelector('#res-residence');
        if (residenceSelect && residenceSelect.value) {
          const selectedOption = residenceSelect.options[residenceSelect.selectedIndex];
          const residenceText = selectedOption.text.split('(')[0].trim();
          choices.push(`Type de résidence: ${residenceText}`);
        }
        
        // Étages (sans ascenseur)
        const floorsRadio = document.querySelector('input[name="floors"]:checked');
        if (floorsRadio) {
          const floorsLabel = document.querySelector(`label[for="${floorsRadio.id}"] .custom-radio-label`);
          if (floorsLabel) {
            const floorsText = floorsLabel.textContent.split('-')[0].trim();
            choices.push(`Étages: ${floorsText}`);
          }
        }
        
        // Extras
        const extras = document.querySelectorAll('input[name="extras[]"]:checked');
        if (extras.length > 0) {
          const extraLabels = Array.from(extras).map(cb => {
            const label = document.querySelector(`label[for="${cb.id}"] .form_checkbox-label`);
            if (label) {
              return label.textContent.split('(')[0].trim();
            }
            // Fallback: try to get text from parent label
            const parentLabel = cb.closest('label');
            if (parentLabel) {
              const labelText = parentLabel.querySelector('.form_checkbox-label');
              return labelText ? labelText.textContent.split('(')[0].trim() : '';
            }
            return '';
          }).filter(Boolean);
          if (extraLabels.length > 0) {
            choices.push(`Extras: ${extraLabels.join(', ')}`);
          }
        }
        
        // Services supplémentaires
        const services = document.querySelectorAll('input[name="services[]"]:checked');
        if (services.length > 0) {
          const serviceLabels = Array.from(services).map(cb => {
            const label = document.querySelector(`label[for="${cb.id}"] .form_checkbox-label`);
            if (label) {
              return label.textContent.split('(')[0].trim();
            }
            // Fallback: try to get text from parent label
            const parentLabel = cb.closest('label');
            if (parentLabel) {
              const labelText = parentLabel.querySelector('.form_checkbox-label');
              return labelText ? labelText.textContent.split('(')[0].trim() : '';
            }
            return '';
          }).filter(Boolean);

          // Ajouter l'adresse de drop off / pick up si fournie
          const dropoffAddressInput = document.getElementById('dropoff-address');
          if (dropoffAddressInput && dropoffAddressInput.value.trim() !== '') {
            serviceLabels.push(`Drop off / pick up à: ${dropoffAddressInput.value.trim()}`);
          }

          if (serviceLabels.length > 0) {
            choices.push(`Services supplémentaires: ${serviceLabels.join(', ')}`);
          }
        }
        
        // Articles complexes
        const complexItems = document.querySelectorAll('input[name="complex[]"]:checked');
        const complexLabels = [];
        if (complexItems.length > 0) {
          const labels = Array.from(complexItems).map(cb => {
            const label = document.querySelector(`label[for="${cb.id}"] .form_checkbox-label`);
            if (label) {
              return label.textContent.trim();
            }
            // Fallback: try to get text from parent label
            const parentLabel = cb.closest('label');
            if (parentLabel) {
              const labelText = parentLabel.querySelector('.form_checkbox-label');
              return labelText ? labelText.textContent.trim() : '';
            }
            return '';
          }).filter(Boolean);
          complexLabels.push(...labels);
        }
        
        // Autre article complexe (texte) - always check, independent of checkboxes
        const complexOtherText = document.querySelector('#complex-other-text');
        if (complexOtherText && complexOtherText.value && complexOtherText.value.trim()) {
          complexLabels.push(complexOtherText.value.trim());
        }
        
        // Heavy weight - include in Articles complexes section (simple Yes/No)
        const heavyWeightCheckbox = document.querySelector('#heavy-weight');
        if (heavyWeightCheckbox) {
          if (heavyWeightCheckbox.checked) {
            complexLabels.push('Objets lourds: Oui');
          } else {
            complexLabels.push('Objets lourds: Non');
          }
        }
        
        // Add to choices if there are any complex items, text, or heavy objects
        if (complexLabels.length > 0) {
          choices.push(`Articles complexes: ${complexLabels.join(', ')}`);
        }
      } else if (selectedServiceType === 'commercial') {
        // Nom de l'entreprise
        const companyInput = document.querySelector('#com-company');
        if (companyInput && companyInput.value && companyInput.value.trim()) {
          choices.push(`Nom de l'entreprise: ${companyInput.value.trim()}`);
        }
        
        // Type d'établissement
        const establishmentSelect = document.querySelector('#com-type');
        if (establishmentSelect && establishmentSelect.value) {
          const selectedOption = establishmentSelect.options[establishmentSelect.selectedIndex];
          choices.push(`Type d'établissement: ${selectedOption.text}`);
        }
        
        // Taille
        const sizeSelect = document.querySelector('#com-size');
        if (sizeSelect && sizeSelect.value) {
          const selectedOption = sizeSelect.options[sizeSelect.selectedIndex];
          choices.push(`Taille: ${selectedOption.text}`);
        }
        
        // Services supplémentaires (commercial)
        const comServices = document.querySelectorAll('input[name="com-services[]"]:checked');
        if (comServices.length > 0) {
          const comServiceLabels = Array.from(comServices).map(cb => {
            const label = document.querySelector(`label[for="${cb.id}"] .form_checkbox-label`);
            if (label) {
              return label.textContent.trim();
            }
            // Fallback: try to get text from parent label
            const parentLabel = cb.closest('label');
            if (parentLabel) {
              const labelText = parentLabel.querySelector('.form_checkbox-label');
              return labelText ? labelText.textContent.trim() : '';
            }
            return '';
          }).filter(Boolean);
          if (comServiceLabels.length > 0) {
            choices.push(`Services supplémentaires: ${comServiceLabels.join(', ')}`);
          }
        }
      }
      
      // Adresses et distance (Step 4)
      const addressDeparture = document.querySelector('#form-address-departure');
      if (addressDeparture && addressDeparture.value && addressDeparture.value.trim()) {
        choices.push(`Adresse de départ: ${addressDeparture.value.trim()}`);
      }
      
      const addressDestination = document.querySelector('#form-address-destination');
      if (addressDestination && addressDestination.value && addressDestination.value.trim()) {
        choices.push(`Adresse de destination: ${addressDestination.value.trim()}`);
      }
      
      const distanceInput = document.querySelector('#form-distance');
      if (distanceInput && distanceInput.value) {
        const distance = parseFloat(distanceInput.value) || 0;
        if (distance > 0) {
          choices.push(`Distance: ${distance} km`);
        }
      }
      
      // Date de déménagement
      const dateInput = document.querySelector('#form-date');
      if (dateInput && dateInput.value && dateInput.value.trim()) {
        choices.push(`Date préférée: ${dateInput.value.trim()}`);
      }
      
      // Message/Commentaires
      const messageInput = document.querySelector('#form-message');
      if (messageInput && messageInput.value && messageInput.value.trim()) {
        choices.push(`Commentaires: ${messageInput.value.trim()}`);
      }
      
      resultContent.innerHTML = `
        <div style="padding: 24px 20px; max-width: 800px; margin: 0 auto;">
          <!-- Price at the top - Most important -->
          <div style="background: linear-gradient(135deg, #72adcb 0%, #5a9bb8 100%); border-radius: 16px; padding: 32px 24px; margin-bottom: 24px; text-align: center; box-shadow: 0 4px 12px rgba(114, 173, 203, 0.2);">
            <div style="font-size: 13px; color: rgba(255, 255, 255, 0.9); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
              Estimation de prix
            </div>
            <div style="display: flex; justify-content: center; align-items: baseline; gap: 12px; flex-wrap: wrap;">
              <div style="font-size: 42px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                ${formatPrice(pricing.min)}
              </div>
              <div style="font-size: 20px; color: rgba(255, 255, 255, 0.8); font-weight: 500;">
                à
              </div>
              <div style="font-size: 42px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                ${formatPrice(pricing.max)}
              </div>
            </div>
          </div>
          
          ${choices.length > 0 ? `
          <!-- Summary - Compact and organized -->
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; text-align: left;">
              Récapitulatif de votre demande
            </div>
            <div class="summary-grid">
              ${choices.map(choice => {
                const parts = choice.split(':');
                const label = parts[0];
                const value = parts.slice(1).join(':').trim();
                // Escape HTML to prevent XSS
                const safeLabel = label.replace(/[&<>"']/g, (m) => {
                  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                  return map[m];
                });
                const safeValue = value.replace(/[&<>"']/g, (m) => {
                  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                  return map[m];
                });
                return `
                <div style="font-size: 13px; color: #666; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                  <span style="font-weight: 600; color: #1a1a1a;">${safeLabel}:</span>
                  <span style="margin-left: 4px;">${safeValue}</span>
                </div>
              `;
              }).join('')}
            </div>
          </div>
          ` : ''}
          
          <!-- Disclaimer - Compact -->
          <div style="background: rgba(114, 173, 203, 0.08); border-left: 3px solid #72adcb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="font-size: 12px; color: #72adcb; margin: 0; line-height: 1.5; text-align: left;">
              <strong>Note importante:</strong> Ces prix sont sujets à changement lors de la soumission et ne constituent qu'une estimation rapide. 
              Pour une estimation précise et personnalisée, contactez-nous directement.
            </p>
          </div>
          
          <!-- Action buttons -->
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="tel:4506024832" class="button w-button" style="text-decoration: none; display: inline-block; flex: 1; min-width: 150px; max-width: 200px;">
              Nous appeler
            </a>
            <a href="mailto:dettboreal@gmail.com" class="button is-secondary w-button" style="text-decoration: none; display: inline-block; flex: 1; min-width: 150px; max-width: 200px;">
              Nous écrire
            </a>
          </div>
        </div>
      `;
      
      // Show result step
      showStep(5);
      
      // Scroll to top of result
      setTimeout(() => {
        const formElement = form.closest('.multi-form11_component') || form;
        if (formElement) {
          try {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (error) {
            safeLog.error('Error scrolling to result:', error);
          }
        }
      }, 100);
      
      // Send emails via Resend
      sendEstimationEmails(choices, pricing);
    }
    
    // Send estimation emails to user and owner
    async function sendEstimationEmails(choices, pricing) {
      try {
        // Get user email and name
        const emailInput = document.querySelector('#form-email');
        const nameInput = document.querySelector('#form-name');
        
        if (!emailInput || !emailInput.value || !nameInput || !nameInput.value) {
          return;
        }
        
        const email = emailInput.value.trim();
        const name = nameInput.value.trim();
        
        const response = await fetch('/api/send-estimation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            choices,
            pricing,
          }),
        });
        
        let result;
        try {
          const text = await response.text();
          result = JSON.parse(text);
        } catch (parseError) {
          // Silently fail - don't interrupt user experience
          safeLog.error('Error parsing email response:', parseError);
          return;
        }
        
        if (!result.success) {
          // Silently fail - don't interrupt user experience
          safeLog.warn('Email sending failed:', result);
          return;
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        safeLog.error('Error sending emails:', error);
      }
    }
    
    // Handle form submission - show price result instead of submitting
    const submitButton = form.querySelector('#submit-estimation');
    if (submitButton) {
      submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Validate step 4
        const validation = validateStep(4);
        if (!validation.isValid) {
          showErrors(validation.errors);
          return;
        }
        
        // Clear errors and show price result
        showErrors([]);
        displayPriceResult();
      });
    }
    
    // Show/hide heavy weight input field
    function setupHeavyWeightField() {
      const heavyWeightCheckbox = form.querySelector('#heavy-weight');
      const heavyWeightField = form.querySelector('#heavy-weight-field');
      if (heavyWeightCheckbox && heavyWeightField) {
        // Remove existing listeners
        const newCheckbox = heavyWeightCheckbox.cloneNode(true);
        if (heavyWeightCheckbox.parentNode) {
          heavyWeightCheckbox.parentNode.replaceChild(newCheckbox, heavyWeightCheckbox);
        }
        
        newCheckbox.addEventListener('change', function() {
          if (this.checked) {
            heavyWeightField.style.display = 'block';
          } else {
            heavyWeightField.style.display = 'none';
          }
        });
      }
    }

    // Initialize dropoff address autocomplete
    function initDropoffAutocomplete() {
      const dropoffInput = form.querySelector('#dropoff-address');
      if (!dropoffInput) return;
      
      // Check if already initialized
      if (dropoffAutocomplete) {
        return;
      }
      
      // Load Google Maps API first
      loadGoogleMapsAPI().then(loaded => {
        if (!loaded) {
          return;
        }
        
        // Wait for Google Maps to be fully loaded
        let retries = 0;
        const maxRetries = 50;
        const initPlaces = () => {
          retries++;
          if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
            try {
              const options = {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'geometry'],
                types: ['address']
              };
              
              // Clear any existing autocomplete instance
              if (dropoffAutocomplete) {
                try {
                  google.maps.event.clearInstanceListeners(dropoffInput);
                } catch (e) {
                  // Ignore errors
                }
              }
              
              dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInput, options);
              
              // Listen for place selection
              dropoffAutocomplete.addListener('place_changed', () => {
                try {
                  const place = dropoffAutocomplete.getPlace();
                  if (place && place.formatted_address) {
                    dropoffInput.value = place.formatted_address;
                  }
                } catch (error) {
                  safeLog.error('Error in dropoffAutocomplete place_changed:', error);
                }
              });
            } catch (error) {
              safeLog.error('Error initializing dropoff Autocomplete:', error);
            }
          } else if (retries < maxRetries) {
            setTimeout(initPlaces, 100);
          }
        };
        
        initPlaces();
      });
    }
    
    // Show/hide dropoff address field when service is selected
    function setupDropoffAddressField() {
      const dropoffCheckbox = form.querySelector('#service-dropoff');
      const dropoffAddressField = form.querySelector('#dropoff-address-field');
      if (dropoffCheckbox && dropoffAddressField) {
        const toggle = () => {
          const isVisible = dropoffCheckbox.checked;
          dropoffAddressField.style.display = isVisible ? 'block' : 'none';
          
          // Initialize autocomplete when field becomes visible
          if (isVisible) {
            // Small delay to ensure field is visible in DOM
            setTimeout(() => {
              initDropoffAutocomplete();
            }, 100);
          }
        };
        dropoffCheckbox.addEventListener('change', toggle);
        // Initial state
        toggle();
      }
    }
    
    // Initialize
    styleRadios();
    styleCheckboxes();
    showStep(1);
    setupButtons();
    initDatePicker();
    setupHeavyWeightField();
    setupDropoffAddressField();
    
    // Load Google Maps API immediately on initialization (not just on step 4)
    // This ensures Google Maps is loaded with API key before any other script tries to use it
    loadGoogleMapsAPI().then(loaded => {
      if (loaded) {
        // Monitor and prevent Webflow from loading Google Maps without API key
        try {
          mapsObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                // Validate node is an Element before processing
                if (node && node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'SCRIPT' && node.src && (node.src.includes('maps.googleapis.com') || node.src.includes('maps-api-v3'))) {
                  // Only remove scripts without API key or with Webflow callbacks
                  if (!node.hasAttribute('data-our-script')) {
                    if (!node.src.includes('key=') || node.src.includes('callback=_wf_maps_loaded') || node.src.includes('maps-api-v3')) {
                      try {
                        node.remove();
                      } catch (e) {
                        safeLog.error('Error removing unauthorized script:', e);
                      }
                    }
                  }
                }
              });
            });
          });
          
          // Observe for new script tags
          if (document.head) {
            mapsObserver.observe(document.head, { childList: true, subtree: true });
          }
          if (document.body) {
            mapsObserver.observe(document.body, { childList: true, subtree: true });
          }
        } catch (error) {
          safeLog.error('Error setting up maps observer:', error);
        }
        
        // Also periodically check and remove unauthorized scripts (with cleanup)
        cleanupInterval = setInterval(() => {
          if (!googleMapsLoaded) {
            if (cleanupInterval) {
              clearInterval(cleanupInterval);
              cleanupInterval = null;
            }
            return;
          }
          
          try {
            // Remove scripts without API key (Webflow's scripts)
            const unauthorizedScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]:not([data-our-script]), script[src*="maps-api-v3"]');
            unauthorizedScripts.forEach(script => {
              if (script && script.nodeType === Node.ELEMENT_NODE) {
                if (!script.src.includes('key=') || script.src.includes('callback=_wf_maps_loaded') || script.src.includes('maps-api-v3')) {
                  try {
                    script.remove();
                  } catch (e) {
                    safeLog.error('Error removing unauthorized script:', e);
                  }
                }
              }
            });
            
            // Also disable all Webflow map widgets
            const mapWidgets = document.querySelectorAll('.w-widget-map, [class*="w-widget-map"]');
            mapWidgets.forEach(widget => {
              if (widget && widget.nodeType === Node.ELEMENT_NODE) {
                widget.style.display = 'none';
                widget.style.visibility = 'hidden';
                widget.removeAttribute('data-widget-latlng');
                widget.removeAttribute('data-widget-address');
                widget.removeAttribute('data-widget-style');
                widget.removeAttribute('data-widget-zoom');
              }
            });
          } catch (error) {
            safeLog.error('Error in cleanup interval:', error);
          }
        }, 300);
      }
    }).catch((error) => {
      safeLog.error('Error loading Google Maps API on init:', error);
      // Silently fail - will retry on step 4
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
        cleanupInterval = null;
      }
      if (mapsObserver) {
        mapsObserver.disconnect();
        mapsObserver = null;
      }
    });
    
    // Re-setup on step change
    const originalShowStep = showStep;
    showStep = function(step) {
      originalShowStep(step);
      setTimeout(() => {
        setupButtons();
        styleRadios();
        styleCheckboxes();
        if (step === 3) {
          // Setup heavy weight field for both residential and commercial
          // Additional delay to ensure section is fully visible
          setTimeout(() => {
            setupHeavyWeightField();
          }, 150);
        }
        if (step === 4) {
          initAddressAutocomplete();
          // Re-initialize date picker if needed
          initDatePicker();
        }
      }, 100);
    };
    
  }

  // Afficher/masquer le champ d'adresse pour le drop off / pick up
  function setupDropoffAddressField() {
    const dropoffCheckbox = document.getElementById('service-dropoff');
    const dropoffAddressField = document.getElementById('dropoff-address-field');

    if (!dropoffCheckbox || !dropoffAddressField) return;

    const toggleField = () => {
      dropoffAddressField.style.display = dropoffCheckbox.checked ? 'block' : 'none';
    };

    dropoffCheckbox.addEventListener('change', toggleField);
    // Initial state
    toggleField();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
