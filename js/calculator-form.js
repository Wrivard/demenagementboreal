// Multi-step form with conditional branching logic
(function() {
  'use strict';

  const form = document.getElementById('estimation-form');
  if (!form) return;

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
    if (typeof google === 'undefined' || !google.maps) {
      console.warn('Google Maps API not loaded');
      return false;
    }

    try {
      distanceMatrixService = new google.maps.DistanceMatrixService();
      return true;
    } catch (error) {
      console.error('Error initializing Google Maps services:', error);
      return false;
    }
  }

  // Initialize Google Places Autocomplete
  function initGooglePlacesAutocomplete() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
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

    distanceMatrixService.getDistanceMatrix(request, (response, status) => {
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
    });
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

  // Service type selection handler
  form.querySelectorAll('input[name="service-type"]').forEach(radio => {
    radio.addEventListener('change', handleServiceTypeSelection);
    
    // Add visual feedback class
    radio.addEventListener('change', function() {
      // Remove checked class from all radio buttons
      form.querySelectorAll('.form_radio-btn').forEach(btn => {
        btn.classList.remove('is-checked');
      });
      // Add checked class to parent of selected radio
      if (radio.checked && radio.closest('.form_radio-btn')) {
        radio.closest('.form_radio-btn').classList.add('is-checked');
      }
    });
  });

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

  // Initialize radio button checked state on page load
  form.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
    if (radio.closest('.form_radio-btn')) {
      radio.closest('.form_radio-btn').classList.add('is-checked');
    }
  });

  // Form submit handler
  form.addEventListener('submit', handleSubmit);

  // Initialize
  showStep(1);
})();

