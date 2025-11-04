// Multi-step form with conditional branching logic
// IMMEDIATE LOG - This should appear as soon as script loads
try {
  console.log('🔵🔵🔵 calculator-form.js FILE LOADED - IMMEDIATE LOG 🔵🔵🔵');
  console.log('Script execution started at:', new Date().toISOString());
  console.log('Document ready state:', document.readyState);
  console.log('Window loaded:', typeof window !== 'undefined');
} catch(e) {
  console.error('Error in initial logs:', e);
}

(function() {
  'use strict';
  
  try {
    console.log('=== calculator-form.js IIFE executing ===');
    console.log('DOM ready state:', document.readyState);
    
    // Wait for DOM if needed
    if (document.readyState === 'loading') {
      console.log('DOM still loading, waiting...');
      document.addEventListener('DOMContentLoaded', function() {
        try {
          console.log('DOMContentLoaded fired');
          initializeCalculator();
        } catch(e) {
          console.error('Error in DOMContentLoaded handler:', e);
        }
      });
    } else {
      console.log('DOM already ready, initializing immediately');
      try {
        initializeCalculator();
      } catch(e) {
        console.error('Error initializing calculator:', e);
      }
    }
  } catch(e) {
    console.error('Error in IIFE:', e);
  }
  
  function initializeCalculator() {
    console.log('=== initializeCalculator called ===');
    console.log('Form element exists:', document.getElementById('estimation-form') !== null);

  const form = document.getElementById('estimation-form');
  if (!form) {
    console.error('=== ERROR: Form #estimation-form not found! ===');
    console.log('Available forms:', document.querySelectorAll('form'));
    console.log('All elements with id:', document.querySelectorAll('[id]'));
    return;
  }
  
  console.log('=== Form found, initializing ===');
  console.log('Form classes:', form.className);

  let currentStep = 1;
  const totalSteps = 5;
  let selectedServiceType = null;

  // Initialize Flatpickr for date picker
  let datePicker = null;
  function initDatePicker() {
    const dateInput = document.getElementById('form-date');
    if (dateInput && typeof flatpickr !== 'undefined') {
      try {
        // Get French locale if available
        const frenchLocale = typeof flatpickr !== 'undefined' && flatpickr.l10ns && flatpickr.l10ns.fr 
          ? flatpickr.l10ns.fr 
          : null;
        
        const config = {
          dateFormat: "d/m/Y",
          allowInput: false,
          clickOpens: true,
          minDate: "today",
          placeholder: "Sélectionner une date"
        };
        
        if (frenchLocale) {
          config.locale = frenchLocale;
        }
        
        datePicker = flatpickr("#form-date", config);
      } catch (e) {
        console.warn('Flatpickr initialization error:', e);
      }
    }
  }

  // Initialize date picker when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDatePicker);
  } else {
    // Wait a bit for flatpickr to load
    setTimeout(initDatePicker, 100);
  }

  // Google Maps Autocomplete and Distance Calculation
  let fromAutocomplete = null;
  let toAutocomplete = null;
  let distanceMatrixService = null;

  // Initialize Google Maps Distance Matrix Service
  function initGoogleMapsServices() {
    try {
      if (typeof google === 'undefined' || !google.maps || !google.maps.DistanceMatrixService) {
        console.warn('Google Maps API not loaded');
        return false;
      }

      distanceMatrixService = new google.maps.DistanceMatrixService();
      return true;
    } catch (error) {
      console.error('Error initializing Google Maps services:', error);
      return false;
    }
  }

  // Initialize Google Places Autocomplete
  function initGooglePlacesAutocomplete() {
    try {
      if (typeof google === 'undefined' || !google.maps || !google.maps.places || !google.maps.places.Autocomplete) {
        console.warn('Google Places API not loaded');
        return;
      }

      const fromInput = document.getElementById('form-address-departure');
      const toInput = document.getElementById('form-address-destination');

      if (!fromInput || !toInput) return;

      // Initialize autocomplete for departure address
      fromAutocomplete = new google.maps.places.Autocomplete(fromInput, {
        componentRestrictions: { country: 'ca' },
        fields: ['formatted_address', 'geometry']
      });

      // Initialize autocomplete for destination address
      toAutocomplete = new google.maps.places.Autocomplete(toInput, {
        componentRestrictions: { country: 'ca' },
        fields: ['formatted_address', 'geometry']
      });

      // Listen for place selection on departure address
      fromAutocomplete.addListener('place_changed', () => {
        const place = fromAutocomplete.getPlace();
        if (place.formatted_address) {
          fromInput.value = place.formatted_address;
          calculateDistance();
        }
      });

      // Listen for place selection on destination address
      toAutocomplete.addListener('place_changed', () => {
        const place = toAutocomplete.getPlace();
        if (place.formatted_address) {
          toInput.value = place.formatted_address;
          calculateDistance();
        }
      });

      // Listen for blur events (when user leaves the field)
      fromInput.addEventListener('blur', () => {
        calculateDistance();
      });

      toInput.addEventListener('blur', () => {
        calculateDistance();
      });
    } catch(error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }

  // Calculate distance using Google Maps Distance Matrix Service
  function calculateDistance() {
    const fromInput = document.getElementById('form-address-departure');
    const toInput = document.getElementById('form-address-destination');
    const distanceInput = document.getElementById('form-distance');

    if (!fromInput || !toInput || !distanceInput) return;

    const fromAddress = fromInput.value.trim();
    const toAddress = toInput.value.trim();

    // Only calculate if both addresses are filled
    if (!fromAddress || !toAddress) {
      distanceInput.value = '';
      distanceInput.placeholder = 'Calcul automatique...';
      distanceInput.setAttribute('readonly', 'readonly');
      distanceInput.disabled = false;
      // Remove any existing messages
      const existingMessage = document.querySelector('.distance-message');
      if (existingMessage) {
        existingMessage.remove();
      }
      return;
    }

    // Check if Google Maps is available
    if (!distanceMatrixService) {
      if (!initGoogleMapsServices()) {
        showDistanceMessage('Google Maps non disponible. Veuillez saisir la distance manuellement.', 'warning');
        distanceInput.placeholder = 'Distance non disponible';
        distanceInput.disabled = false;
        distanceInput.removeAttribute('readonly');
        return;
      }
    }

    // Show loading state
    distanceInput.placeholder = 'Calcul automatique...';
    distanceInput.disabled = true;
    distanceInput.setAttribute('readonly', 'readonly');
    distanceInput.value = '';

    // Calculate distance using Google Maps Distance Matrix Service
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
          if (!response || !response.rows || !response.rows[0] || !response.rows[0].elements || !response.rows[0].elements[0]) {
            throw new Error('Invalid response from Distance Matrix API');
          }
          
          if (status === google.maps.DistanceMatrixStatus.OK) {
            const element = response.rows[0].elements[0];
            
            if (element.status === google.maps.DistanceMatrixElementStatus.OK) {
              // Distance is in meters, convert to kilometers
              const distanceKm = Math.round(element.distance.value / 1000);
              
              distanceInput.value = distanceKm;
              distanceInput.disabled = false;
              distanceInput.setAttribute('readonly', 'readonly'); // Keep readonly after successful calculation
              distanceInput.placeholder = 'Calculé automatiquement';
              
              showDistanceMessage(`Distance calculée: ${element.distance.text}`, 'success');
            } else {
              // Handle invalid addresses
              distanceInput.placeholder = 'Distance non disponible';
              distanceInput.disabled = false;
              distanceInput.removeAttribute('readonly');
              
              let errorMessage = 'Impossible de calculer la distance entre ces adresses.';
              if (element.status === google.maps.DistanceMatrixElementStatus.NOT_FOUND) {
                errorMessage = 'Une ou plusieurs adresses introuvables.';
              } else if (element.status === google.maps.DistanceMatrixElementStatus.ZERO_RESULTS) {
                errorMessage = 'Aucun itinéraire trouvé entre ces adresses.';
              }
              
              showDistanceMessage(errorMessage, 'error');
            }
          } else {
            // Handle API errors
            distanceInput.placeholder = 'Erreur de calcul';
            distanceInput.disabled = false;
            distanceInput.removeAttribute('readonly');
            
            showDistanceMessage('Erreur lors du calcul de la distance. Veuillez saisir manuellement.', 'error');
          }
        } catch(e) {
          console.error('Error in distance matrix callback:', e);
          distanceInput.placeholder = 'Erreur de calcul';
          distanceInput.disabled = false;
          distanceInput.removeAttribute('readonly');
          showDistanceMessage('Erreur lors du calcul. Veuillez saisir manuellement.', 'error');
        }
      });
    } catch(e) {
      console.error('Error calling distance matrix service:', e);
      distanceInput.placeholder = 'Erreur de calcul';
      distanceInput.disabled = false;
      distanceInput.removeAttribute('readonly');
      showDistanceMessage('Erreur lors du calcul. Veuillez saisir manuellement.', 'error');
    }
  }

  // Show distance calculation message
  function showDistanceMessage(message, type = 'success') {
    const distanceInput = document.getElementById('form-distance');
    if (!distanceInput) return;

    // Remove existing message
    const existingMessage = document.querySelector('.distance-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `distance-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
      margin-top: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      animation: fadeIn 0.3s ease-in;
    `;

    // Add type-specific styles
    if (type === 'success') {
      messageEl.style.cssText += `
        background-color: #d1fae5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      `;
    } else if (type === 'warning') {
      messageEl.style.cssText += `
        background-color: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
      `;
    } else if (type === 'error') {
      messageEl.style.cssText += `
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      `;
    }

    // Insert message after the distance input field container
    const fieldWrapper = distanceInput.closest('.multi-form11_field-wrapper');
    if (fieldWrapper) {
      fieldWrapper.appendChild(messageEl);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 5000);
    }
  }

  // Initialize Google Maps when step 4 is shown
  function initGoogleMapsForStep4() {
    // Wait for Google Maps API to load
    if (typeof google === 'undefined' || !google.maps) {
      // Check every 500ms if Google Maps is loaded
      const checkInterval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          clearInterval(checkInterval);
          initGoogleMapsServices();
          initGooglePlacesAutocomplete();
        }
      }, 500);

      // Stop checking after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 10000);
    } else {
      initGoogleMapsServices();
      initGooglePlacesAutocomplete();
    }
  }

  // Show specific step
  function showStep(step) {
    // Hide all steps
    const allSteps = form.querySelectorAll('[data-form="step"]');
    allSteps.forEach(s => {
      s.classList.remove('active');
    });

    // Special handling for step 3 - show appropriate version based on service type
    if (step === 3) {
      const residentialStep = form.querySelector('.residential-questions');
      const commercialStep = form.querySelector('.commercial-questions');
      
      if (selectedServiceType === 'residential' && residentialStep) {
        residentialStep.classList.add('active');
      } else if (selectedServiceType === 'commercial' && commercialStep) {
        commercialStep.classList.add('active');
      }
    } else {
      // Show regular step
      const stepElement = form.querySelector(`[data-step="${step}"]`);
      if (stepElement) {
        stepElement.classList.add('active');
      }
    }

    // Update progress bar
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    const progressIndicator = document.getElementById('progress-indicator');
    if (progressIndicator) {
      progressIndicator.style.width = progress + '%';
    }

    // Update step indicator
    const stepIndicator = document.getElementById('step-indicator');
    if (stepIndicator) {
      stepIndicator.textContent = `Étape ${step}/${totalSteps}`;
    }

    // Initialize Google Maps when step 4 is shown
    if (step === 4) {
      setTimeout(initGoogleMapsForStep4, 100);
    }
  }

  // Validate current step
  function validateStep(step) {
    let stepElement = null;
    
    // Special handling for step 3
    if (step === 3) {
      if (selectedServiceType === 'residential') {
        stepElement = form.querySelector('.residential-questions');
      } else if (selectedServiceType === 'commercial') {
        stepElement = form.querySelector('.commercial-questions');
      }
    } else {
      stepElement = form.querySelector(`[data-step="${step}"]`);
    }
    
    if (!stepElement) return false;

    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      // Skip validation for hidden fields
      if (field.closest('.multi-form11_step') && !field.closest('.multi-form11_step').classList.contains('active')) {
        return;
      }
      
      if (field.type === 'checkbox' || field.type === 'radio') {
        // For checkboxes and radios, check if at least one is checked
        const name = field.name;
        const group = form.querySelectorAll(`[name="${name}"]`);
        const hasChecked = Array.from(group).some(f => f.checked);
        if (!hasChecked && field.required) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      } else {
        if (!field.value || field.value.trim() === '') {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      }
    });

    // Special validation for step 2 (service type)
    if (step === 2) {
      const serviceType = form.querySelector('input[name="service-type"]:checked');
      if (!serviceType) {
        isValid = false;
        alert('Veuillez sélectionner un type de déménagement');
      } else {
        selectedServiceType = serviceType.value;
      }
    }

    if (!isValid) {
      alert('Veuillez remplir tous les champs requis');
    }

    return isValid;
  }

  // Handle service type selection and show appropriate step 3
  function handleServiceTypeSelection() {
    const serviceType = form.querySelector('input[name="service-type"]:checked');
    if (!serviceType) return;

    selectedServiceType = serviceType.value;
  }

  // Next button handler
  function handleNext() {
    if (!validateStep(currentStep)) {
      return;
    }

    // Special handling for step 2 - determine which step 3 to show
    if (currentStep === 2) {
      handleServiceTypeSelection();
      if (!selectedServiceType) {
        alert('Veuillez sélectionner un type de déménagement');
        return;
      }
      currentStep = 3;
      showStep(currentStep);
      return;
    }

    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
    }
  }

  // Back button handler
  function handleBack() {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  }

  // Collect form data
  function collectFormData() {
    const formData = new FormData(form);
    const data = {};

    // Get all form fields
    for (let [key, value] of formData.entries()) {
      if (key.endsWith('[]')) {
        // Handle arrays (checkboxes)
        const arrayKey = key.slice(0, -2);
        if (!data[arrayKey]) {
          data[arrayKey] = [];
        }
        if (!data[arrayKey].includes(value)) {
          data[arrayKey].push(value);
        }
      } else {
        // For regular fields, only keep the first value (or combine if needed)
        if (!data[key]) {
          data[key] = value;
        }
      }
    }

    // Get checkboxes manually (they might not be in FormData if unchecked)
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      const name = checkbox.name;
      if (name.endsWith('[]')) {
        const arrayKey = name.slice(0, -2);
        if (!data[arrayKey]) {
          data[arrayKey] = [];
        }
        if (!data[arrayKey].includes(checkbox.value)) {
          data[arrayKey].push(checkbox.value);
        }
      } else {
        // For non-array checkboxes, store value
        if (!data[name]) {
          data[name] = checkbox.value;
        }
      }
    });

    // Get radio buttons
    const radioButtons = form.querySelectorAll('input[type="radio"]:checked');
    radioButtons.forEach(radio => {
      data[radio.name] = radio.value;
    });

    // Add service type
    data['service-type'] = selectedServiceType;

    // Normalize service arrays based on service type
    if (selectedServiceType === 'residential') {
      // Use residential services
      if (data['services[]']) {
        data['services[]'] = data['services[]'];
      }
      // Keep commercial fields but they won't be used by API
    } else if (selectedServiceType === 'commercial') {
      // Merge services from commercial form to services[]
      if (data['com-services[]']) {
        data['services[]'] = data['com-services[]'];
      }
      // Keep residential fields but they won't be used by API
    }

    return data;
  }

  // Display quote result
  function displayQuote(quote) {
    const resultContainer = document.getElementById('quote-result');
    if (!resultContainer) return;

    resultContainer.innerHTML = `
      <div class="form_message-success">
        <div class="margin-bottom margin-medium">
          <h3 class="heading-style-h4">Votre estimation de prix</h3>
        </div>
        <div class="margin-bottom margin-small">
          <div class="text-size-large text-weight-semibold">
            Prix estimé: ${quote.total ? quote.total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) : 'À confirmer'}
          </div>
        </div>
        ${quote.breakdown ? `
          <div class="margin-bottom margin-medium">
            <h4 class="heading-style-h6">Détail de l'estimation:</h4>
            <ul style="list-style: none; padding: 0;">
              ${Object.entries(quote.breakdown).map(([key, value]) => `
                <li style="padding: 8px 0; border-bottom: 1px solid var(--color-scheme-1--border);">
                  <span>${key}:</span>
                  <span style="float: right; font-weight: 500;">${typeof value === 'number' ? value.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' }) : value}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="margin-top margin-medium">
          <p class="text-size-medium">Cette estimation est indicative et peut varier selon les circonstances réelles. Un membre de notre équipe vous contactera sous peu pour confirmer les détails.</p>
        </div>
        <div class="button-group is-right margin-top margin-medium">
          <button type="button" class="button is-secondary w-button" onclick="window.location.reload()">Nouvelle estimation</button>
          <a href="#contact" class="button w-button">Nous contacter</a>
        </div>
      </div>
    `;

    currentStep = 5;
    showStep(currentStep);
  }

  // Submit form
  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep(currentStep)) {
      return;
    }

    const submitButton = document.getElementById('submit-estimation');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Calcul en cours...';
    }

    try {
      const formData = collectFormData();
      
      const response = await fetch('/api/calculate-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors du calcul');
      }

      const result = await response.json();
      displayQuote(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Obtenir l\'estimation';
      }
    }
  }

  // Event listeners
  document.querySelectorAll('.form-next-btn').forEach(btn => {
    btn.addEventListener('click', handleNext);
  });

  document.querySelectorAll('.form-back-btn').forEach(btn => {
    btn.addEventListener('click', handleBack);
  });

  // Helper function to update radio button visual state
  function updateRadioButtonState(radio) {
    if (!radio || !radio.name) return;
    
    const name = radio.name;
    // Remove is-checked from all radio buttons in the same group
    form.querySelectorAll(`input[name="${name}"]`).forEach(r => {
      const radioBtn = r.closest('.form_radio-btn') || r.closest('.w-radio');
      if (radioBtn) {
        radioBtn.classList.remove('is-checked');
        // Remove inline styles - use !important via setProperty
        radioBtn.style.setProperty('background-color', '', 'important');
        radioBtn.style.setProperty('border-color', '', 'important');
        radioBtn.style.setProperty('color', '', 'important');
        // Update label text color
        const label = radioBtn.querySelector('.form_radio-btn-label, .w-form-label, span');
        if (label) {
          label.style.setProperty('color', '', 'important');
          label.style.setProperty('font-weight', '', 'important');
        }
        // Update badge
        const badge = radioBtn.querySelector('.form_radio-btn-letter');
        if (badge) {
          badge.style.setProperty('background-color', '', 'important');
          badge.style.setProperty('border-color', '', 'important');
          badge.style.setProperty('color', '', 'important');
          const badgeText = badge.querySelector('div');
          if (badgeText) {
            badgeText.style.setProperty('color', '', 'important');
          }
        }
      }
    });
    
    // Add is-checked to the selected radio button and apply styles directly
    if (radio.checked) {
      const radioBtn = radio.closest('.form_radio-btn') || radio.closest('.w-radio');
      if (radioBtn) {
        radioBtn.classList.add('is-checked');
        // Apply styles directly via inline styles with !important to override Webflow
        radioBtn.style.setProperty('background-color', '#72adcb', 'important');
        radioBtn.style.setProperty('border-color', '#72adcb', 'important');
        radioBtn.style.setProperty('color', '#ffffff', 'important');
        
        // Update label text color
        const label = radioBtn.querySelector('.form_radio-btn-label, .w-form-label, span');
        if (label) {
          label.style.setProperty('color', '#ffffff', 'important');
          label.style.setProperty('font-weight', '600', 'important');
        }
        
        // Update badge to white background with blue text
        const badge = radioBtn.querySelector('.form_radio-btn-letter');
        if (badge) {
          badge.style.setProperty('background-color', '#ffffff', 'important');
          badge.style.setProperty('border-color', '#ffffff', 'important');
          const badgeText = badge.querySelector('div');
          if (badgeText) {
            badgeText.style.setProperty('color', '#72adcb', 'important');
          }
        }
      }
    }
  }

  // Simple handler for custom radio buttons
  function handleCustomRadioChange(radio) {
    // CSS :has() selector handles the visual state automatically
    // Just trigger service type selection if needed
    if (radio.name === 'service-type') {
      handleServiceTypeSelection();
    }
    
    // Force apply subtle selected styles via JavaScript for better browser support
    updateCustomRadioStyles();
  }
  
  // Force apply subtle selected styles to custom radio buttons
  function updateCustomRadioStyles() {
    console.log('=== updateCustomRadioStyles called ===');
    const radios = form.querySelectorAll('.custom-radio-option input[type="radio"]');
    console.log('Found', radios.length, 'custom radio buttons');
    
    radios.forEach((radio, index) => {
      const option = radio.closest('.custom-radio-option');
      if (!option) {
        console.warn('Radio', index, '- no .custom-radio-option parent found');
        return;
      }
      
      // Check computed styles
      const computedStyles = window.getComputedStyle(option);
      console.log('Radio', index, '- checked:', radio.checked, '- padding:', computedStyles.padding, '- background:', computedStyles.backgroundColor);
      
      if (radio.checked) {
        // Apply subtle background
        option.style.setProperty('background-color', 'rgba(114, 173, 203, 0.12)', 'important');
        option.style.setProperty('border-color', '#72adcb', 'important');
        option.style.setProperty('box-shadow', '0 0 0 3px rgba(114, 173, 203, 0.15)', 'important');
        
        // Badge: blue background with white text
        const badge = option.querySelector('.custom-radio-badge');
        if (badge) {
          badge.style.setProperty('background-color', '#72adcb', 'important');
          badge.style.setProperty('border-color', '#72adcb', 'important');
          badge.style.setProperty('color', '#ffffff', 'important');
        } else {
          console.warn('Radio', index, '- no badge found');
        }
        
        // Label: keep text color normal, just bold
        const label = option.querySelector('.custom-radio-label');
        if (label) {
          label.style.setProperty('font-weight', '600', 'important');
          // Don't force color, let CSS variable handle it
        } else {
          console.warn('Radio', index, '- no label found');
        }
      } else {
        // Reset styles
        option.style.setProperty('background-color', '', 'important');
        option.style.setProperty('border-color', '', 'important');
        option.style.setProperty('box-shadow', '', 'important');
        
        const badge = option.querySelector('.custom-radio-badge');
        if (badge) {
          badge.style.setProperty('background-color', '', 'important');
          badge.style.setProperty('border-color', '', 'important');
          badge.style.setProperty('color', '', 'important');
        }
        
        const label = option.querySelector('.custom-radio-label');
        if (label) {
          label.style.setProperty('font-weight', '', 'important');
        }
      }
    });
    
    // Also check checkboxes
    const checkboxes = form.querySelectorAll('.form_checkbox-btn');
    console.log('Found', checkboxes.length, 'checkboxes');
    checkboxes.forEach((checkbox, index) => {
      const computedStyles = window.getComputedStyle(checkbox);
      const icon = checkbox.querySelector('.form_checkbox-icon, .w-checkbox-input');
      const iconStyles = icon ? window.getComputedStyle(icon) : null;
      
      console.log('Checkbox', index, '- padding:', computedStyles.padding, '- paddingLeft:', computedStyles.paddingLeft, '- background:', computedStyles.backgroundColor);
      if (iconStyles) {
        console.log('Checkbox', index, 'icon - marginLeft:', iconStyles.marginLeft, '- float:', iconStyles.float);
      } else {
        console.warn('Checkbox', index, '- no icon found');
      }
    });
  }

  // Service type selection handler - simple and fast
  form.querySelectorAll('input[name="service-type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      handleCustomRadioChange(this);
    });
  });

  // All other radio buttons (floors, etc.)
  form.querySelectorAll('input[type="radio"]').forEach(radio => {
    if (radio.name !== 'service-type') {
      radio.addEventListener('change', function() {
        handleCustomRadioChange(this);
      });
    }
  });
  
  // Debug: Check CSS loading and styles
  console.log('=== CSS Debug Info ===');
  console.log('Custom styles CSS loaded:', document.querySelector('link[href*="custom-styles.css"]') !== null);
  console.log('Webflow CSS loaded:', document.querySelector('link[href*="demenagement-boreal.webflow.css"]') !== null);
  
  // Check if custom radio buttons exist
  const customRadios = form.querySelectorAll('.custom-radio-option');
  console.log('Custom radio options found:', customRadios.length);
  
  // Check if old radio buttons exist
  const oldRadios = form.querySelectorAll('.form_radio-btn');
  console.log('Old radio buttons found:', oldRadios.length);
  
  // Check checkbox styles
  const checkboxes = form.querySelectorAll('.form_checkbox-btn');
  console.log('Checkboxes found:', checkboxes.length);
  checkboxes.forEach((cb, i) => {
    const styles = window.getComputedStyle(cb);
    console.log(`Checkbox ${i} - padding:`, styles.padding, '- classes:', cb.className);
  });
  
  // Initialize styles on page load
  updateCustomRadioStyles();
  
  // Also update on step change to ensure styles are applied
  const originalShowStepFunc1 = showStep;
  showStep = function(step) {
    console.log('=== showStep called with step:', step, '===');
    originalShowStepFunc1(step);
    setTimeout(() => {
      console.log('=== Updating styles after step change ===');
      updateCustomRadioStyles();
    }, 100);
  };

  // Checkbox visual feedback
  form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        if (this.closest('.form_checkbox-btn')) {
          this.closest('.form_checkbox-btn').classList.add('is-checked');
        }
      } else {
        if (this.closest('.form_checkbox-btn')) {
          this.closest('.form_checkbox-btn').classList.remove('is-checked');
        }
      }
    });
    
    // Initialize checked state on page load
    if (checkbox.checked && checkbox.closest('.form_checkbox-btn')) {
      checkbox.closest('.form_checkbox-btn').classList.add('is-checked');
    }
  });

  // Form submit handler
  form.addEventListener('submit', handleSubmit);

  // Apply styles directly via JavaScript to ensure they work
  function applyCustomStyles() {
    console.log('🎨 Applying custom styles via JavaScript');
    
    // Get all custom radio options
    const customRadios = form.querySelectorAll('.custom-radio-option');
    console.log('Custom radios found:', customRadios.length);
    
    customRadios.forEach(function(radio) {
      const input = radio.querySelector('input[type="radio"]');
      const badge = radio.querySelector('.custom-radio-badge');
      const label = radio.querySelector('.custom-radio-label');
      
      if (!input || !badge || !label) return;
      
      // Apply base styles
      radio.style.setProperty('display', 'flex', 'important');
      radio.style.setProperty('align-items', 'center', 'important');
      radio.style.setProperty('padding', '18px 20px', 'important');
      radio.style.setProperty('min-height', '60px', 'important');
      radio.style.setProperty('border-radius', '12px', 'important');
      radio.style.setProperty('cursor', 'pointer', 'important');
      radio.style.setProperty('box-sizing', 'border-box', 'important');
      radio.style.setProperty('margin', '0 0 14px 0', 'important');
      
      // Check if selected
      function updateRadioState() {
        if (input.checked) {
          radio.style.setProperty('background-color', 'rgba(114, 173, 203, 0.12)', 'important');
          radio.style.setProperty('border-color', '#72adcb', 'important');
          radio.style.setProperty('border-width', '2px', 'important');
          radio.style.setProperty('box-shadow', '0 0 0 3px rgba(114, 173, 203, 0.15)', 'important');
          badge.style.setProperty('background-color', '#72adcb', 'important');
          badge.style.setProperty('border-color', '#72adcb', 'important');
          badge.style.setProperty('color', '#ffffff', 'important');
          label.style.setProperty('font-weight', '600', 'important');
        } else {
          radio.style.setProperty('background-color', '', 'important');
          radio.style.setProperty('border-color', '', 'important');
          radio.style.setProperty('box-shadow', '', 'important');
          badge.style.setProperty('background-color', '', 'important');
          badge.style.setProperty('border-color', '', 'important');
          badge.style.setProperty('color', '', 'important');
          label.style.setProperty('font-weight', '', 'important');
        }
      }
      
      // Apply initial state
      updateRadioState();
      
      // Listen for changes
      input.addEventListener('change', function() {
        // Update all radios in the same group
        const groupName = input.name;
        form.querySelectorAll(`input[name="${groupName}"]`).forEach(function(otherInput) {
          const otherRadio = otherInput.closest('.custom-radio-option');
          if (otherRadio) {
            const otherBadge = otherRadio.querySelector('.custom-radio-badge');
            const otherLabel = otherRadio.querySelector('.custom-radio-label');
            if (otherInput.checked) {
              otherRadio.style.setProperty('background-color', 'rgba(114, 173, 203, 0.12)', 'important');
              otherRadio.style.setProperty('border-color', '#72adcb', 'important');
              otherRadio.style.setProperty('box-shadow', '0 0 0 3px rgba(114, 173, 203, 0.15)', 'important');
              if (otherBadge) {
                otherBadge.style.setProperty('background-color', '#72adcb', 'important');
                otherBadge.style.setProperty('border-color', '#72adcb', 'important');
                otherBadge.style.setProperty('color', '#ffffff', 'important');
              }
              if (otherLabel) otherLabel.style.setProperty('font-weight', '600', 'important');
            } else {
              otherRadio.style.setProperty('background-color', '', 'important');
              otherRadio.style.setProperty('border-color', '', 'important');
              otherRadio.style.setProperty('box-shadow', '', 'important');
              if (otherBadge) {
                otherBadge.style.setProperty('background-color', '', 'important');
                otherBadge.style.setProperty('border-color', '', 'important');
                otherBadge.style.setProperty('color', '', 'important');
              }
              if (otherLabel) otherLabel.style.setProperty('font-weight', '', 'important');
            }
          }
        });
      });
    });
    
    // Fix checkbox spacing
    const checkboxes = form.querySelectorAll('.form_checkbox-btn');
    console.log('Checkboxes found:', checkboxes.length);
    
    checkboxes.forEach(function(checkbox) {
      const icon = checkbox.querySelector('.w-checkbox-input, .form_checkbox-icon');
      if (icon) {
        icon.style.setProperty('float', 'none', 'important');
        icon.style.setProperty('margin-left', '0', 'important');
        icon.style.setProperty('margin-right', '12px', 'important');
        icon.style.setProperty('display', 'flex', 'important');
        icon.style.setProperty('align-items', 'center', 'important');
        icon.style.setProperty('justify-content', 'center', 'important');
      }
      checkbox.style.setProperty('padding', '18px 20px', 'important');
      checkbox.style.setProperty('display', 'flex', 'important');
      checkbox.style.setProperty('align-items', 'center', 'important');
    });
    
    console.log('✅ Styles applied via JavaScript');
  }
  
  // Apply styles after a short delay to ensure DOM is ready
  setTimeout(function() {
    applyCustomStyles();
  }, 100);
  
  // Re-apply styles when step changes
  const originalShowStepFunc = showStep;
  showStep = function(step) {
    originalShowStepFunc(step);
    setTimeout(function() {
      applyCustomStyles();
    }, 50);
  };

  // Initialize
  showStep(1);
  } // End of initializeCalculator function
})();

