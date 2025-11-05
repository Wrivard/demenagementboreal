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
      
      // Update progress
      const progressBar = form.querySelector('#progress-indicator');
      if (progressBar) {
        const progress = (step / totalSteps) * 100;
        progressBar.style.width = progress + '%';
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
        
        // Base styles with good contrast
        radio.style.cssText = `
          display: flex;
          align-items: center;
          padding: 20px;
          margin: 0 0 16px 0;
          background: rgba(255, 255, 255, 0.12);
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-sizing: border-box;
        `;
        
        badge.style.cssText = `
          width: 36px;
          height: 36px;
          margin-right: 16px;
          background: rgba(255, 255, 255, 0.18);
          border: 2px solid rgba(255, 255, 255, 0.45);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        `;
        
        label.style.cssText = `
          flex: 1;
          color: #ffffff;
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
          // Selected state - accent blue color
          radio.style.cssText += `
            background: rgba(114, 173, 203, 0.25);
            border-color: #72adcb;
            box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.35);
          `;
          badge.style.cssText += `
            background: #72adcb;
            border-color: #72adcb;
            color: #ffffff;
          `;
          label.style.cssText += `
            color: #ffffff;
            font-weight: 600;
          `;
        } else {
          // Unselected state - dark background for excellent contrast
          radio.style.cssText += `
            background: #2a2a2a;
            border-color: rgba(255, 255, 255, 0.4);
            box-shadow: none;
          `;
          badge.style.cssText += `
            background: #1a1a1a;
            border-color: rgba(255, 255, 255, 0.5);
            color: #ffffff;
          `;
          label.style.cssText += `
            color: #ffffff;
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
    
    // Initialize
    styleRadios();
    showStep(1);
    setupButtons();
    
    console.log('✅ Calculator initialized');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();