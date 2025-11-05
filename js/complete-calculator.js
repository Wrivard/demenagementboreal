// Complete calculator with navigation and styling
console.log('🟢 COMPLETE CALCULATOR LOADED');

document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 DOM READY - Complete calculator starting');
  
  const form = document.getElementById('estimation-form');
  if (!form) {
    console.error('❌ Form not found');
    return;
  }
  
  console.log('✅ Form found');
  
  let currentStep = 1;
  const totalSteps = 5;
  let selectedServiceType = null;
  
  // Style radio buttons
  function styleRadioButtons() {
    console.log('🎨 Styling radio buttons');
    
    const radioOptions = form.querySelectorAll('.custom-radio-option');
    console.log('Found radio options:', radioOptions.length);
    
    radioOptions.forEach(function(option, index) {
      const input = option.querySelector('input[type="radio"]');
      const badge = option.querySelector('.custom-radio-badge');
      const label = option.querySelector('.custom-radio-label');
      
      if (!input || !badge || !label) return;
      
      // Apply clean styles
      option.style.cssText = `
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        padding: 20px !important;
        margin: 0 0 16px 0 !important;
        background-color: #2a2a2a !important;
        border: 2px solid #555555 !important;
        border-radius: 12px !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
        box-sizing: border-box !important;
      `;
      
      badge.style.cssText = `
        width: 36px !important;
        height: 36px !important;
        margin-right: 16px !important;
        background-color: #1a1a1a !important;
        border: 2px solid #555555 !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-weight: 600 !important;
        font-size: 16px !important;
        color: #ffffff !important;
        flex-shrink: 0 !important;
      `;
      
      label.style.cssText = `
        flex: 1 !important;
        color: #ffffff !important;
        font-weight: 500 !important;
        font-size: 16px !important;
        line-height: 1.4 !important;
      `;
      
      // Handle selection
      function updateSelection() {
        const isSelected = input.checked;
        
        if (isSelected) {
          option.style.cssText += `
            background-color: rgba(114, 173, 203, 0.15) !important;
            border-color: #72adcb !important;
            box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.2) !important;
          `;
          badge.style.cssText += `
            background-color: #72adcb !important;
            border-color: #72adcb !important;
            color: #ffffff !important;
          `;
          label.style.cssText += `
            font-weight: 600 !important;
          `;
        } else {
          option.style.cssText += `
            background-color: #2a2a2a !important;
            border-color: #555555 !important;
            box-shadow: none !important;
          `;
          badge.style.cssText += `
            background-color: #1a1a1a !important;
            border-color: #555555 !important;
            color: #ffffff !important;
          `;
          label.style.cssText += `
            font-weight: 500 !important;
          `;
        }
      }
      
      // Initial state
      updateSelection();
      
      // Listen for changes
      input.addEventListener('change', function() {
        console.log('Radio changed:', input.name, input.value, input.checked);
        
        // Update all radios in this group
        const groupName = input.name;
        const allInGroup = form.querySelectorAll(`input[name="${groupName}"]`);
        
        allInGroup.forEach(function(radio) {
          const radioOption = radio.closest('.custom-radio-option');
          if (radioOption) {
            const radioBadge = radioOption.querySelector('.custom-radio-badge');
            const radioLabel = radioOption.querySelector('.custom-radio-label');
            
            if (radio.checked) {
              radioOption.style.cssText += `
                background-color: rgba(114, 173, 203, 0.15) !important;
                border-color: #72adcb !important;
                box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.2) !important;
              `;
              if (radioBadge) {
                radioBadge.style.cssText += `
                  background-color: #72adcb !important;
                  border-color: #72adcb !important;
                  color: #ffffff !important;
                `;
              }
              if (radioLabel) {
                radioLabel.style.cssText += `font-weight: 600 !important;`;
              }
            } else {
              radioOption.style.cssText += `
                background-color: #2a2a2a !important;
                border-color: #555555 !important;
                box-shadow: none !important;
              `;
              if (radioBadge) {
                radioBadge.style.cssText += `
                  background-color: #1a1a1a !important;
                  border-color: #555555 !important;
                  color: #ffffff !important;
                `;
              }
              if (radioLabel) {
                radioLabel.style.cssText += `font-weight: 500 !important;`;
              }
            }
          }
        });
        
        // Handle service type selection
        if (input.name === 'service-type') {
          selectedServiceType = input.value;
          console.log('Service type selected:', selectedServiceType);
        }
      });
      
      // Click handler for the entire option
      option.addEventListener('click', function(e) {
        if (e.target !== input) {
          input.checked = true;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
  }
  
  // Show specific step
  function showStep(step) {
    console.log('🔄 Showing step:', step);
    
    // Hide all steps
    const allSteps = form.querySelectorAll('[data-step]');
    allSteps.forEach(stepEl => {
      stepEl.style.display = 'none';
    });
    
    // Show current step
    const currentStepEl = form.querySelector(`[data-step="${step}"]`);
    if (currentStepEl) {
      currentStepEl.style.display = 'block';
      console.log('✅ Step', step, 'shown');
    } else {
      console.error('❌ Step element not found for step:', step);
    }
    
    // Handle conditional steps (step 3)
    if (step === 3) {
      const residentialStep = form.querySelector('.residential-questions');
      const commercialStep = form.querySelector('.commercial-questions');
      
      if (residentialStep) residentialStep.style.display = 'none';
      if (commercialStep) commercialStep.style.display = 'none';
      
      if (selectedServiceType === 'residential' && residentialStep) {
        residentialStep.style.display = 'block';
        console.log('✅ Residential questions shown');
      } else if (selectedServiceType === 'commercial' && commercialStep) {
        commercialStep.style.display = 'block';
        console.log('✅ Commercial questions shown');
      }
    }
    
    // Update progress bar
    const progressIndicator = document.getElementById('progress-indicator');
    if (progressIndicator) {
      const progress = (step / totalSteps) * 100;
      progressIndicator.style.width = progress + '%';
    }
    
    // Update step indicator
    const stepIndicator = document.querySelector('.multi-form11_step-text');
    if (stepIndicator) {
      stepIndicator.textContent = `Étape ${step}/${totalSteps}`;
    }
    
    // Re-apply styles after showing step
    setTimeout(styleRadioButtons, 100);
  }
  
  // Validate current step
  function validateStep(step) {
    console.log('🔍 Validating step:', step);
    
    let stepElement;
    if (step === 3) {
      if (selectedServiceType === 'residential') {
        stepElement = form.querySelector('.residential-questions');
      } else if (selectedServiceType === 'commercial') {
        stepElement = form.querySelector('.commercial-questions');
      }
    } else {
      stepElement = form.querySelector(`[data-step="${step}"]`);
    }
    
    if (!stepElement) {
      console.log('✅ Step element not found, assuming valid');
      return true;
    }
    
    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      field.classList.remove('error');
      
      if (field.type === 'checkbox' || field.type === 'radio') {
        const name = field.name;
        const hasChecked = stepElement.querySelector(`input[name="${name}"]:checked`);
        
        if (!hasChecked && field.required) {
          isValid = false;
          field.classList.add('error');
          console.log('❌ Required field not filled:', name);
        }
      } else {
        if (!field.value || field.value.trim() === '') {
          isValid = false;
          field.classList.add('error');
          console.log('❌ Required field empty:', field.name);
        }
      }
    });
    
    // Special validation for step 2 (service type)
    if (step === 2) {
      const serviceType = form.querySelector('input[name="service-type"]:checked');
      if (!serviceType) {
        isValid = false;
        console.log('❌ Service type not selected');
      }
    }
    
    console.log('Validation result:', isValid ? '✅ Valid' : '❌ Invalid');
    return isValid;
  }
  
  // Handle next button
  function handleNext() {
    console.log('➡️ Next button clicked, current step:', currentStep);
    
    if (!validateStep(currentStep)) {
      console.log('❌ Validation failed');
      return;
    }
    
    // Handle service type selection for step 2
    if (currentStep === 2) {
      const serviceType = form.querySelector('input[name="service-type"]:checked');
      if (serviceType) {
        selectedServiceType = serviceType.value;
        console.log('Service type selected:', selectedServiceType);
      }
    }
    
    if (currentStep < totalSteps) {
      currentStep++;
      showStep(currentStep);
      console.log('✅ Moved to step:', currentStep);
    }
  }
  
  // Handle back button
  function handleBack() {
    console.log('⬅️ Back button clicked, current step:', currentStep);
    
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
      console.log('✅ Moved back to step:', currentStep);
    }
  }
  
  // Set up event listeners
  const nextButton = form.querySelector('.multi-form11_button.is-next');
  const backButton = form.querySelector('.multi-form11_button.is-back');
  
  if (nextButton) {
    nextButton.addEventListener('click', function(e) {
      e.preventDefault();
      handleNext();
    });
    console.log('✅ Next button listener added');
  }
  
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      handleBack();
    });
    console.log('✅ Back button listener added');
  }
  
  // Initialize
  styleRadioButtons();
  showStep(1);
  
  console.log('🟢 Complete calculator initialized');
});

console.log('🟢 COMPLETE CALCULATOR SCRIPT END');
