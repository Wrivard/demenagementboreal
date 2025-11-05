// Clean Multi-Step Calculator - Based on CALCULATOR_INTEGRATION_GUIDE.md
console.log('🚀 Calculator script loaded');

(function() {
  'use strict';
  
  // Wait for DOM
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
        
        if (residential) residential.style.display = 'none';
        if (commercial) commercial.style.display = 'none';
        
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
    }
    
    // Validate step
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
      
      if (!stepElement) return true;
      
      const requiredFields = stepElement.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        field.classList.remove('error');
        
        if (field.type === 'radio' || field.type === 'checkbox') {
          const name = field.name;
          const hasChecked = stepElement.querySelector(`input[name="${name}"]:checked`);
          if (!hasChecked && field.required) {
            isValid = false;
            field.classList.add('error');
          }
        } else {
          if (!field.value || field.value.trim() === '') {
            isValid = false;
            field.classList.add('error');
          }
        }
      });
      
      // Special validation for step 2
      if (step === 2) {
        const serviceType = form.querySelector('input[name="service-type"]:checked');
        if (!serviceType) {
          isValid = false;
        }
      }
      
      return isValid;
    }
    
    // Navigation
    function nextStep() {
      if (!validateStep(currentStep)) {
        alert('Veuillez remplir tous les champs requis');
        return;
      }
      
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
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    }
    
    // Style radio buttons
    function styleRadios() {
      const radios = form.querySelectorAll('.custom-radio-option');
      
      radios.forEach(radio => {
        const input = radio.querySelector('input[type="radio"]');
        const badge = radio.querySelector('.custom-radio-badge');
        const label = radio.querySelector('.custom-radio-label');
        
        if (!input || !badge || !label) return;
        
        // Base styles
        radio.style.cssText = `
          display: flex;
          align-items: center;
          padding: 18px 20px;
          margin: 0 0 14px 0;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        `;
        
        badge.style.cssText = `
          width: 32px;
          height: 32px;
          margin-right: 12px;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        `;
        
        label.style.cssText = `
          flex: 1;
          color: #ffffff;
          font-size: 16px;
          font-weight: 500;
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
          radio.style.cssText += `
            background: rgba(114, 173, 203, 0.2);
            border-color: #72adcb;
            box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.3);
          `;
          badge.style.cssText += `
            background: #72adcb;
            border-color: #72adcb;
            color: #ffffff;
          `;
          label.style.cssText += `
            font-weight: 600;
          `;
        } else {
          radio.style.cssText += `
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.3);
            box-shadow: none;
          `;
          badge.style.cssText += `
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.4);
            color: #ffffff;
          `;
          label.style.cssText += `
            font-weight: 500;
          `;
        }
      });
    }
    
    // Setup button listeners
    function setupButtons() {
      // Find all next buttons
      const nextButtons = form.querySelectorAll('.form-next-btn, button[type="button"]:not(.is-back)');
      nextButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          nextStep();
        });
      });
      
      // Find all back buttons
      const backButtons = form.querySelectorAll('.form-back-btn, .button.is-secondary');
      backButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          prevStep();
        });
      });
    }
    
    // Initialize
    styleRadios();
    showStep(1);
    setupButtons();
    
    // Re-setup on step change
    const originalShowStep = showStep;
    showStep = function(step) {
      originalShowStep(step);
      setTimeout(() => {
        setupButtons();
        styleRadios();
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
