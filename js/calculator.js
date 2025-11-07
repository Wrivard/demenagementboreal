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
      
      // Initialize address autocomplete when step 4 is shown
      if (step === 4) {
        console.log('📍 Step 4 shown, initializing address autocomplete...');
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          initAddressAutocomplete();
        }, 100);
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
          console.warn('⚠️ Width still 100%, forcing again...');
          progressBar.style.setProperty('width', progress + '%', 'important');
          progressBar.style.setProperty('flex', 'none', 'important');
        }
        
        console.log(`Progress: ${progress}% (step ${step}/${totalSteps})`);
        console.log('Progress bar element:', progressBar);
        console.log('Progress bar computed width:', window.getComputedStyle(progressBar).width);
        console.log('Progress bar inline style width:', progressBar.style.width);
      } else {
        console.warn('Progress bar not found. Searching for:', [
          '#progress-indicator',
          '[data-form="progress-indicator"]',
          '.multi-form11_progress-bar[id="progress-indicator"]'
        ]);
        // Try to find progress wrapper
        const progressWrapper = form.querySelector('.multi-form11_progress');
        if (progressWrapper) {
          console.warn('Found progress wrapper:', progressWrapper);
          console.warn('Progress wrapper children:', progressWrapper.children);
        }
      }
      
      // Update step text
      const stepText = form.querySelector('.multi-form11_step-tag, #step-indicator');
      if (stepText) {
        // Show step 1-4 for form steps, hide for result step (step 5)
        if (step === 5) {
          stepText.textContent = 'Résultat';
        } else {
          stepText.textContent = `Étape ${step}/4`;
        }
      }
      
      currentStep = step;
      
      // Re-style radios after step change
      setTimeout(() => {
        styleRadios();
        setupButtons();
        if (step === 3 && selectedServiceType === 'residential') {
          setupComplexOtherField();
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
              background: #ffffff;
              border-color: #72adcb;
            `;
            // Add visible checkmark SVG - accent blue checkmark on white background
            icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 4L6 11L3 8" stroke="#72adcb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
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
        console.log('🔑 Fetching Google Maps API key from /api/get-maps-key...');
        // Get API key from serverless function
        const response = await fetch('/api/get-maps-key');
        
        if (!response.ok) {
          console.error('❌ API key endpoint returned error:', response.status, response.statusText);
          showDistanceMessage('Erreur de récupération de la clé API. Vous pouvez saisir la distance manuellement.', 'warning');
          return false;
        }
        
        const data = await response.json();
        console.log('📦 API key response:', { success: data.success, hasApiKey: !!data.apiKey });
        
        if (!data.success || !data.apiKey) {
          console.warn('⚠️ Google Maps API key not available in response:', data);
          showDistanceMessage('Clé API Google Maps non disponible. Vérifiez la configuration Vercel. Vous pouvez saisir la distance manuellement.', 'warning');
          return false;
        }
        
        const apiKey = data.apiKey;
        console.log('✅ API key received, length:', apiKey.length);
        
        // Check if Google Maps is already loaded (possibly without API key)
        const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
        if (existingScripts.length > 0) {
          console.warn('⚠️ Google Maps script already exists, removing old scripts...');
          existingScripts.forEach(script => {
            console.log('Removing script:', script.src);
            script.remove();
          });
          // Reset google object if it exists
          if (window.google && window.google.maps) {
            delete window.google;
            console.log('🔄 Reset window.google object');
          }
        }
        
        // Load Google Maps JavaScript API with API key
        return new Promise((resolve, reject) => {
          // Double check - if Google Maps is already loaded with API key, we're good
          if (window.google && window.google.maps && window.google.maps.places) {
            console.log('✅ Google Maps already loaded with Places library');
            googleMapsLoaded = true;
            resolve(true);
            return;
          }
          
          const script = document.createElement('script');
          const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr&callback=initGoogleMapsCallback`;
          
          // Verify API key is in URL
          console.log('📜 Loading Google Maps script with API key');
          console.log('🔑 API key in URL:', scriptUrl.includes('key=') ? 'YES' : 'NO');
          console.log('🔑 API key length:', apiKey.length);
          console.log('🔑 Script URL (first 100 chars):', scriptUrl.substring(0, 100));
          
          // Set callback for when Google Maps is loaded
          window.initGoogleMapsCallback = function() {
            googleMapsLoaded = true;
            console.log('✅ Google Maps API loaded successfully via callback');
            if (window.google && window.google.maps && window.google.maps.places) {
              console.log('✅ Google Places library confirmed loaded');
              resolve(true);
            } else {
              console.warn('⚠️ Google Maps loaded but Places library not available');
              reject(false);
            }
            delete window.initGoogleMapsCallback;
          };
          
          script.src = scriptUrl;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            console.log('✅ Google Maps script loaded');
            // Wait a bit for callback
            setTimeout(() => {
              if (window.google && window.google.maps && window.google.maps.places) {
                if (!googleMapsLoaded) {
                  googleMapsLoaded = true;
                  console.log('✅ Google Maps API loaded successfully (onload fallback)');
                  resolve(true);
                }
              }
            }, 500);
          };
          
          script.onerror = (error) => {
            console.error('❌ Failed to load Google Maps API script:', error);
            console.error('❌ Script URL was:', scriptUrl.substring(0, 100) + '...');
            console.error('❌ This might be due to an ad-blocker blocking Google Maps');
            if (window.initGoogleMapsCallback) {
              delete window.initGoogleMapsCallback;
            }
            showDistanceMessage('Erreur de chargement de Google Maps. Vérifiez votre ad-blocker. Vous pouvez saisir la distance manuellement.', 'warning');
            reject(false);
          };
          
          // Insert script at the beginning of head to ensure it loads first
          const firstScript = document.head.querySelector('script');
          if (firstScript) {
            document.head.insertBefore(script, firstScript);
          } else {
            document.head.appendChild(script);
          }
          
          console.log('📜 Google Maps script tag added to DOM');
        });
      } catch (error) {
        console.error('❌ Error loading Google Maps:', error);
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
          if (window.google && window.google.maps && window.google.maps.places && window.google.maps.places.Autocomplete) {
            try {
              // Verify API key is working
              console.log('🔑 Verifying Google Maps API key...');
              console.log('🔑 Google Maps object:', window.google ? 'exists' : 'missing');
              console.log('🔑 Google Maps.maps:', window.google.maps ? 'exists' : 'missing');
              console.log('🔑 Google Maps.places:', window.google.maps.places ? 'exists' : 'missing');
              console.log('🔑 Google Maps.places.Autocomplete:', window.google.maps.places.Autocomplete ? 'exists' : 'missing');
              
              // Re-check inputs exist at this point
              if (!fromInput || !toInput) {
                console.error('❌ Address inputs not found when initializing autocomplete');
                return;
              }
              
              // Initialize Google Places Autocomplete - following CALCULATOR_KM_CALCULATION_AND_STYLING.md
              const options = {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'geometry'],
                types: ['address']
              };
              
              // Clear any existing autocomplete instances
              if (fromAutocomplete) {
                google.maps.event.clearInstanceListeners(fromInput);
              }
              if (toAutocomplete) {
                google.maps.event.clearInstanceListeners(toInput);
              }
              
              fromAutocomplete = new google.maps.places.Autocomplete(fromInput, options);
              toAutocomplete = new google.maps.places.Autocomplete(toInput, options);
              
              // Initialize Distance Matrix Service
              distanceMatrixService = new google.maps.DistanceMatrixService();
              
              console.log('✅ Google Places Autocomplete initialized');
              console.log('✅ Distance Matrix Service initialized');
              console.log('✅ From input:', fromInput);
              console.log('✅ To input:', toInput);
              
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
        console.log('📊 Distance Matrix response:', { status, response });
        
        if (status === 'OK' && response && response.rows && response.rows[0] && response.rows[0].elements && response.rows[0].elements[0].status === 'OK') {
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
            errorMessage = 'Erreur d\'autorisation. La clé API Google Maps n\'est pas valide ou n\'a pas les permissions nécessaires. Vérifiez la configuration Vercel.';
            console.error('❌ REQUEST_DENIED - Vérifiez que:');
            console.error('  1. La clé API est configurée dans Vercel (GOOGLE_MAPS_API_KEY)');
            console.error('  2. Les APIs suivantes sont activées dans Google Cloud Console:');
            console.error('     - Maps JavaScript API');
            console.error('     - Places API');
            console.error('     - Distance Matrix API');
            console.error('  3. Les restrictions de la clé API permettent votre domaine');
          } else if (status === 'OVER_QUERY_LIMIT') {
            errorMessage = 'Limite de requêtes dépassée.';
          } else if (status === 'INVALID_REQUEST') {
            errorMessage = 'Requête invalide. Vérifiez les adresses.';
          } else {
            console.error('❌ Distance Matrix error:', status, response);
            if (response && response.error_message) {
              console.error('❌ Error message:', response.error_message);
              errorMessage += ' ' + response.error_message;
            }
          }
          
          showDistanceMessage(errorMessage, 'error');
          console.error('Distance Matrix error details:', { status, response });
        }
      });
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
        console.warn('⚠️ Flatpickr not loaded, date picker will not work');
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
        
        console.log('✅ Date picker initialized');
      } catch (error) {
        console.error('❌ Error initializing date picker:', error);
        // Re-enable input if Flatpickr fails
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
      const heavyWeightInput = form.querySelector('#heavy-weight');
      if (heavyWeightInput && heavyWeightInput.value) {
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
      
      resultContent.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px;">
              Estimation de votre déménagement
            </h3>
            <p style="font-size: 16px; color: #666; margin-bottom: 8px;">
              Prix de référence estimé
            </p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <div style="font-size: 48px; font-weight: 700; color: #72adcb; margin-bottom: 16px;">
              ${formatPrice(pricing.base)}
            </div>
            <div style="font-size: 14px; color: #666; margin-bottom: 24px;">
              Minimum 3 heures à payer (${formatPrice(PRICING.MIN_PRICE)})
            </div>
            
            <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; margin-top: 24px;">
              <div style="font-size: 14px; color: #666; margin-bottom: 12px;">
                Fourchette de prix estimée (±25%)
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px;">
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Minimum</div>
                  <div style="font-size: 20px; font-weight: 600; color: #72adcb;">
                    ${formatPrice(pricing.min)}
                  </div>
                </div>
                <div style="width: 1px; height: 40px; background: #e5e5e5;"></div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Maximum</div>
                  <div style="font-size: 20px; font-weight: 600; color: #72adcb;">
                    ${formatPrice(pricing.max)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: rgba(114, 173, 203, 0.1); border: 1px solid #72adcb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="font-size: 14px; color: #72adcb; margin: 0; line-height: 1.6;">
              <strong>Note:</strong> Cette estimation est indicative et peut varier selon les conditions réelles du déménagement. 
              Pour une estimation précise, contactez-nous directement.
            </p>
          </div>
          
          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <a href="tel:4506024832" class="button w-button" style="text-decoration: none; display: inline-block;">
              Nous appeler
            </a>
            <a href="mailto:dettboreal@gmail.com" class="button is-secondary w-button" style="text-decoration: none; display: inline-block;">
              Nous écrire
            </a>
          </div>
        </div>
      `;
      
      // Show result step
      showStep(5);
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
    
    // Show/hide "Autre" text field for complex items
    function setupComplexOtherField() {
      const complexOtherCheckbox = form.querySelector('#complex-other');
      const complexOtherField = form.querySelector('#complex-other-field');
      if (complexOtherCheckbox && complexOtherField) {
        // Remove existing listeners
        const newCheckbox = complexOtherCheckbox.cloneNode(true);
        complexOtherCheckbox.parentNode.replaceChild(newCheckbox, complexOtherCheckbox);
        
        newCheckbox.addEventListener('change', function() {
          if (this.checked) {
            complexOtherField.style.display = 'block';
          } else {
            complexOtherField.style.display = 'none';
          }
        });
      }
    }
    
    // Initialize
    styleRadios();
    styleCheckboxes();
    showStep(1);
    setupButtons();
    initDatePicker();
    setupComplexOtherField();
    
    // Load Google Maps API immediately on initialization (not just on step 4)
    // This ensures Google Maps is loaded with API key before any other script tries to use it
    console.log('🚀 Pre-loading Google Maps API...');
    loadGoogleMapsAPI().then(loaded => {
      if (loaded) {
        console.log('✅ Google Maps API pre-loaded successfully');
      } else {
        console.warn('⚠️ Google Maps API pre-load failed, will retry on step 4');
      }
    }).catch(error => {
      console.error('❌ Error pre-loading Google Maps API:', error);
    });
    
    // Re-setup on step change
    const originalShowStep = showStep;
    showStep = function(step) {
      originalShowStep(step);
      setTimeout(() => {
        setupButtons();
        styleRadios();
        styleCheckboxes();
        if (step === 3 && selectedServiceType === 'residential') {
          setupComplexOtherField();
        }
        if (step === 4) {
          initAddressAutocomplete();
          // Re-initialize date picker if needed
          initDatePicker();
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