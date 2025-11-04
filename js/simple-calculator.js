// Simple calculator script - no dependencies, no Google Maps, just basic functionality
console.log('🟢 SIMPLE CALCULATOR LOADED');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 DOM READY - Starting simple calculator');
  
  const form = document.getElementById('estimation-form');
  if (!form) {
    console.error('❌ Form not found');
    return;
  }
  
  console.log('✅ Form found:', form);
  
  // Apply simple styles to radio buttons
  function applySimpleStyles() {
    console.log('🎨 Applying simple styles');
    
    // Find all custom radio options
    const radioOptions = form.querySelectorAll('.custom-radio-option');
    console.log('Found radio options:', radioOptions.length);
    
    radioOptions.forEach(function(option, index) {
      console.log('Processing radio option', index);
      
      const input = option.querySelector('input[type="radio"]');
      const badge = option.querySelector('.custom-radio-badge');
      const label = option.querySelector('.custom-radio-label');
      
      if (!input || !badge || !label) {
        console.log('Missing elements in radio option', index);
        return;
      }
      
      // Apply base styles with maximum specificity
      option.style.cssText = `
        display: flex !important;
        align-items: center !important;
        padding: 18px 20px !important;
        margin-bottom: 14px !important;
        border: 2px solid #555555 !important;
        border-radius: 12px !important;
        background-color: #2a2a2a !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        min-height: 60px !important;
        box-sizing: border-box !important;
      `;
      
      badge.style.cssText = `
        width: 32px !important;
        height: 32px !important;
        margin-right: 12px !important;
        background-color: #1a1a1a !important;
        border: 2px solid #555555 !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-weight: 600 !important;
        font-size: 14px !important;
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
      
      // Handle selection state
      function updateSelection() {
        if (input.checked) {
          console.log('Radio selected:', index);
          option.style.cssText += `
            background-color: rgba(114, 173, 203, 0.12) !important;
            border-color: #72adcb !important;
            box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.15) !important;
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
        console.log('Radio changed:', index, input.checked);
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
                background-color: rgba(114, 173, 203, 0.12) !important;
                border-color: #72adcb !important;
                box-shadow: 0 0 0 3px rgba(114, 173, 203, 0.15) !important;
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
      });
      
      // Click handler for the entire option
      option.addEventListener('click', function(e) {
        if (e.target !== input) {
          input.checked = true;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
    
    // Fix checkbox spacing
    const checkboxes = form.querySelectorAll('.form_checkbox-btn');
    console.log('Found checkboxes:', checkboxes.length);
    
    checkboxes.forEach(function(checkbox, index) {
      console.log('Processing checkbox', index);
      
      const icon = checkbox.querySelector('.w-checkbox-input, .form_checkbox-icon');
      if (icon) {
        icon.style.cssText = `
          float: none !important;
          margin-left: 0 !important;
          margin-right: 12px !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          min-height: 32px !important;
          flex-shrink: 0 !important;
        `;
      }
      
      checkbox.style.cssText += `
        padding: 18px 20px !important;
        display: flex !important;
        align-items: center !important;
      `;
    });
    
    console.log('✅ Simple styles applied');
  }
  
  // Apply styles immediately
  applySimpleStyles();
  
  // Re-apply styles every 2 seconds to ensure they stick
  setInterval(function() {
    console.log('🔄 Re-applying styles');
    applySimpleStyles();
  }, 2000);
  
  console.log('🟢 Simple calculator initialized');
});

console.log('🟢 SIMPLE CALCULATOR SCRIPT END');
