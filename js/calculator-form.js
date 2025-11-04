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
  });

  // Form submit handler
  form.addEventListener('submit', handleSubmit);

  // Initialize
  showStep(1);
})();

