// Clean Multi-Step Calculator - No Google Maps, no alerts, clean design
console.log('🚀 Calculator script loaded');

(function() {
  'use strict';
  
  function init() {
    const form = document.getElementById('estimation-form');
    if (!form) {
      console.error('Form not found');
      return;
    }
    
    console.log('✅ Form found, initializing calculator');
    
    let currentStep = 1;
    const totalSteps = 5;
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
      console.log(`Showing step ${step}`);
      
      // Hide all steps
      Object.values(steps).forEach(stepEl => {
        if (stepEl) {
          stepEl.style.display = 'none';
          stepEl.classList.remove('active');
        }
      });
      
      // Show current step
      if (steps[step]) {
        steps[step].style.display = 'block';
        steps[step].classList.add('active');
      }
      
      // Handle conditional step 3
      if (step === 3) {
        const residential = form.querySelector('.residential-questions');
        const commercial = form.querySelector('.commercial-questions');
        
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
      
      // Update progress bar - scale with current step
      const progressBar = form.querySelector('[data-form="progress-indicator"], #progress-indicator');
      if (progressBar) {
        // Calculate progress: step 1 = 20%, step 2 = 40%, step 3 = 60%, step 4 = 80%, step 5 = 100%
        const progress = (step / totalSteps) * 100;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('data-progress', progress);
        console.log(`Progress: ${progress}% (step ${step}/${totalSteps})`);
      } else {
        console.warn('Progress bar not found');
      }
      
      // Update step text
      const stepText = form.querySelector('.multi-form11_step-tag, #step-indicator');
      if (stepText) {
        stepText.textContent = `Étape ${step}/${totalSteps}`;
      }
      
      currentStep = step;
      
      // Re-style radios after step change
      setTimeout(() => {
        styleRadios();
        setupButtons();
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
          background: rgba(114, 173, 203, 0.1);
          border: 1px solid #72adcb;
          border-radius: 8px;
          color: #72adcb;
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
          console.log('Service type:', selectedServiceType);
        }
      }
      
      if (currentStep < totalSteps) {
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
      const nextButtons = form.querySelectorAll('.form-next-btn, button[type="button"]:not(.is-back)');
      nextButtons.forEach(btn => {
        // Remove old listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          nextStep();
        });
      });
      
      // Find all back buttons
      const backButtons = form.querySelectorAll('.form-back-btn, .button.is-secondary');
      backButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
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
        
        // Ensure checkbox has good contrast with white background
        checkbox.style.cssText += `
          background: #ffffff;
          border: 2px solid rgba(0, 0, 0, 0.15);
          padding: 18px 20px;
          margin: 10px 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
        `;
        
        icon.style.cssText = `
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
        `;
        
        // Update checkbox state
        function updateCheckbox() {
          if (input.checked) {
            icon.style.cssText += `
              background: #72adcb;
              border-color: #72adcb;
            `;
            // Add visible checkmark SVG - white checkmark on blue background
            icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 4L6 11L3 8" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          } else {
            icon.style.cssText += `
              background: #f5f5f5;
              border-color: rgba(0, 0, 0, 0.2);
            `;
            icon.innerHTML = '';
          }
        }
        
        input.addEventListener('change', updateCheckbox);
        updateCheckbox();
      });
    }
    
    // Google Maps Autocomplete and Distance Calculation
    let googleMapsLoaded = false;
    let fromAutocomplete = null;
    let toAutocomplete = null;
    let distanceMatrixService = null;
    
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
      if (googleMapsLoaded) return true;
      
      try {
        // Get API key from serverless function
        const response = await fetch('/api/get-maps-key');
        const data = await response.json();
        
        if (!data.success || !data.apiKey) {
          console.warn('Google Maps API key not available');
          showDistanceMessage('Google Maps non disponible. Vous pouvez saisir la distance manuellement.', 'warning');
          return false;
        }
        
        const apiKey = data.apiKey;
        
        // Load Google Maps JavaScript API
        return new Promise((resolve, reject) => {
          if (window.google && window.google.maps) {
            googleMapsLoaded = true;
            resolve(true);
            return;
          }
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            googleMapsLoaded = true;
            console.log('✅ Google Maps API loaded');
            resolve(true);
          };
          
          script.onerror = () => {
            console.error('❌ Failed to load Google Maps API');
            showDistanceMessage('Erreur de chargement de Google Maps. Vous pouvez saisir la distance manuellement.', 'warning');
            reject(false);
          };
          
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        showDistanceMessage('Erreur de chargement de Google Maps. Vous pouvez saisir la distance manuellement.', 'warning');
        return false;
      }
    }
    
    function initAddressAutocomplete() {
      const fromInput = form.querySelector('#form-address-departure');
      const toInput = form.querySelector('#form-address-destination');
      const distanceInput = form.querySelector('#form-distance');
      
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
        const initPlaces = () => {
          if (window.google && window.google.maps && window.google.maps.places) {
            try {
              // Initialize Google Places Autocomplete - following CALCULATOR_KM_CALCULATION_AND_STYLING.md
              const options = {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'geometry'],
                types: ['address']
              };
              
              fromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
              toAutocomplete = new google.maps.places.Autocomplete(toInput, options);
              
              // Initialize Distance Matrix Service
              distanceMatrixService = new google.maps.DistanceMatrixService();
              
              console.log('✅ Google Places Autocomplete initialized');
              
              // Listen for place selection on "from" address - following guide
              fromAutocomplete.addListener('place_changed', () => {
                const place = fromAutocomplete.getPlace();
                if (place.formatted_address) {
                  fromInput.value = place.formatted_address;
                  calculateDistance();
                }
              });
              
              // Listen for place selection on "to" address - following guide
              toAutocomplete.addListener('place_changed', () => {
                const place = toAutocomplete.getPlace();
                if (place.formatted_address) {
                  toInput.value = place.formatted_address;
                  calculateDistance();
                }
              });
              
              // Also calculate on blur events - following guide
              fromInput.addEventListener('blur', () => {
                calculateDistance();
              });
              
              toInput.addEventListener('blur', () => {
                calculateDistance();
              });
            } catch (error) {
              console.error('Error initializing Google Places Autocomplete:', error);
              distanceInput.removeAttribute('readonly');
              distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
              showDistanceMessage('Erreur d\'initialisation de Google Places. Vous pouvez saisir la distance manuellement.', 'warning');
            }
          } else {
            // Retry after a short delay if places library not loaded yet
            setTimeout(initPlaces, 100);
          }
        };
        
        initPlaces();
      }).catch(error => {
        console.error('Error loading Google Maps API:', error);
        distanceInput.removeAttribute('readonly');
        distanceInput.placeholder = 'Saisissez la distance manuellement (km)';
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
      
      distanceMatrixService.getDistanceMatrix(request, (response, status) => {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const element = response.rows[0].elements[0];
          const distanceKm = Math.round(element.distance.value / 1000);
          
          // Update distance input
          distanceInput.value = distanceKm;
          distanceInput.disabled = false;
          distanceInput.placeholder = 'Calcul automatique...';
          
          // Show success message
          showDistanceMessage(`Distance calculée: ${element.distance.text}`, 'success');
        } else {
          // Handle errors
          distanceInput.placeholder = 'Erreur de calcul';
          distanceInput.disabled = false;
          
          let errorMessage = 'Impossible de calculer la distance.';
          if (status === 'ZERO_RESULTS') {
            errorMessage = 'Aucun résultat trouvé pour ces adresses.';
          } else if (status === 'REQUEST_DENIED') {
            errorMessage = 'Erreur d\'autorisation. Vérifiez la clé API.';
          } else if (status === 'OVER_QUERY_LIMIT') {
            errorMessage = 'Limite de requêtes dépassée.';
          }
          
          showDistanceMessage(errorMessage, 'error');
          console.error('Distance Matrix error:', status, response);
        }
      });
    }
    
    // Initialize
    styleRadios();
    styleCheckboxes();
    showStep(1);
    setupButtons();
    
    // Re-setup on step change
    const originalShowStep = showStep;
    showStep = function(step) {
      originalShowStep(step);
      setTimeout(() => {
        setupButtons();
        styleRadios();
        styleCheckboxes();
        if (step === 4) {
          initAddressAutocomplete();
        }
      }, 100);
    };
    
    console.log('✅ Calculator initialized');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();