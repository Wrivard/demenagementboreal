// Final clean calculator - focus on working step navigation
console.log('🚀 FINAL CALCULATOR LOADED');

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM READY');
  
  const form = document.getElementById('estimation-form');
  if (!form) {
    console.error('❌ Form not found');
    return;
  }
  
  console.log('✅ Form found');
  
  let currentStep = 1;
  const totalSteps = 5;
  
  // Find all step elements
  const steps = [];
  for (let i = 1; i <= totalSteps; i++) {
    const stepEl = form.querySelector(`[data-step="${i}"]`);
    if (stepEl) {
      steps[i] = stepEl;
      console.log(`✅ Found step ${i}:`, stepEl.className);
    } else {
      console.log(`❌ Step ${i} not found`);
    }
  }
  
  // Show specific step
  function showStep(step) {
    console.log(`🔄 Showing step ${step}`);
    
    // Hide all steps
    steps.forEach((stepEl, index) => {
      if (stepEl) {
        stepEl.style.display = 'none';
        console.log(`Hidden step ${index}`);
      }
    });
    
    // Show current step
    if (steps[step]) {
      steps[step].style.display = 'block';
      console.log(`✅ Step ${step} is now visible`);
    } else {
      console.error(`❌ Cannot show step ${step} - element not found`);
    }
    
    currentStep = step;
  }
  
  // Style radio buttons
  function styleRadios() {
    const radios = form.querySelectorAll('.custom-radio-option');
    console.log(`🎨 Styling ${radios.length} radio buttons`);
    
    radios.forEach((radio, index) => {
      const input = radio.querySelector('input[type="radio"]');
      const badge = radio.querySelector('.custom-radio-badge');
      const label = radio.querySelector('.custom-radio-label');
      
      if (!input || !badge || !label) return;
      
      // Clean styling
      radio.style.cssText = `
        display: flex !important;
        align-items: center !important;
        padding: 20px !important;
        margin: 10px 0 !important;
        background: #2a2a2a !important;
        border: 2px solid #555 !important;
        border-radius: 12px !important;
        cursor: pointer !important;
      `;
      
      badge.style.cssText = `
        width: 36px !important;
        height: 36px !important;
        margin-right: 16px !important;
        background: #1a1a1a !important;
        border: 2px solid #555 !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        color: white !important;
        font-weight: 600 !important;
      `;
      
      label.style.cssText = `
        color: white !important;
        font-size: 16px !important;
      `;
      
      // Handle selection
      input.addEventListener('change', function() {
        if (this.checked) {
          console.log(`Radio selected: ${this.name} = ${this.value}`);
          
          // Style selected
          radio.style.cssText += `
            background: rgba(114, 173, 203, 0.15) !important;
            border-color: #72adcb !important;
          `;
          badge.style.cssText += `
            background: #72adcb !important;
            border-color: #72adcb !important;
          `;
          label.style.cssText += `
            font-weight: 600 !important;
          `;
          
          // Reset other radios in group
          const groupRadios = form.querySelectorAll(`input[name="${this.name}"]`);
          groupRadios.forEach(otherRadio => {
            if (otherRadio !== this) {
              const otherOption = otherRadio.closest('.custom-radio-option');
              const otherBadge = otherOption?.querySelector('.custom-radio-badge');
              const otherLabel = otherOption?.querySelector('.custom-radio-label');
              
              if (otherOption) {
                otherOption.style.cssText += `
                  background: #2a2a2a !important;
                  border-color: #555 !important;
                `;
              }
              if (otherBadge) {
                otherBadge.style.cssText += `
                  background: #1a1a1a !important;
                  border-color: #555 !important;
                `;
              }
              if (otherLabel) {
                otherLabel.style.cssText += `
                  font-weight: 500 !important;
                `;
              }
            }
          });
        }
      });
      
      // Click handler
      radio.addEventListener('click', function(e) {
        if (e.target !== input) {
          input.checked = true;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
  }
  
  // Simple validation
  function validateCurrentStep() {
    console.log(`🔍 Validating step ${currentStep}`);
    
    if (!steps[currentStep]) return true;
    
    const requiredInputs = steps[currentStep].querySelectorAll('[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
      if (input.type === 'radio') {
        const groupName = input.name;
        const hasChecked = steps[currentStep].querySelector(`input[name="${groupName}"]:checked`);
        if (!hasChecked) {
          isValid = false;
          console.log(`❌ Radio group ${groupName} not selected`);
        }
      } else if (!input.value.trim()) {
        isValid = false;
        console.log(`❌ Field ${input.name} is empty`);
      }
    });
    
    console.log(`Validation result: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    return isValid;
  }
  
  // Navigation handlers
  function goNext() {
    console.log(`➡️ Next clicked from step ${currentStep}`);
    
    if (!validateCurrentStep()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }
    
    if (currentStep < totalSteps) {
      showStep(currentStep + 1);
      styleRadios(); // Re-apply styles
    }
  }
  
  function goBack() {
    console.log(`⬅️ Back clicked from step ${currentStep}`);
    
    if (currentStep > 1) {
      showStep(currentStep - 1);
      styleRadios(); // Re-apply styles
    }
  }
  
  // Find and setup buttons
  const nextBtn = form.querySelector('.multi-form11_button.is-next, button[type="button"]:not(.is-back)');
  const backBtn = form.querySelector('.multi-form11_button.is-back');
  
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      goNext();
    });
    console.log('✅ Next button found and connected');
  } else {
    console.log('❌ Next button not found');
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      goBack();
    });
    console.log('✅ Back button found and connected');
  } else {
    console.log('❌ Back button not found');
  }
  
  // Initialize
  styleRadios();
  showStep(1);
  
  console.log('🚀 Final calculator ready!');
});
