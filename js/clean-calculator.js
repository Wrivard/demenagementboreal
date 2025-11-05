// Clean calculator script - no Google Maps, focus on radio buttons only
console.log('🟢 CLEAN CALCULATOR LOADED');

document.addEventListener('DOMContentLoaded', function() {
  console.log('🟢 DOM READY - Clean calculator starting');
  
  const form = document.getElementById('estimation-form');
  if (!form) {
    console.error('❌ Form not found');
    return;
  }
  
  console.log('✅ Form found');
  
  // Clean radio button styling - start fresh
  function styleRadioButtons() {
    console.log('🎨 Styling radio buttons');
    
    // Find all custom radio options
    const radioOptions = form.querySelectorAll('.custom-radio-option');
    console.log('Found radio options:', radioOptions.length);
    
    radioOptions.forEach(function(option, index) {
      console.log('Processing radio option', index, option);
      
      const input = option.querySelector('input[type="radio"]');
      const badge = option.querySelector('.custom-radio-badge');
      const label = option.querySelector('.custom-radio-label');
      
      if (!input || !badge || !label) {
        console.log('Missing elements in radio option', index);
        return;
      }
      
      console.log('Radio elements found:', {input: input.name, badge: badge.textContent, label: label.textContent});
      
      // Apply clean base styles
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
        console.log('Updating selection for', index, ':', isSelected);
        
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
        console.log('Radio changed:', index, input.name, input.checked);
        
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
      });
      
      // Click handler for the entire option
      option.addEventListener('click', function(e) {
        if (e.target !== input) {
          console.log('Option clicked:', index);
          input.checked = true;
          input.dispatchEvent(new Event('change'));
        }
      });
    });
    
    console.log('✅ Radio buttons styled');
  }
  
  // Apply styles immediately
  styleRadioButtons();
  
  console.log('🟢 Clean calculator initialized');
});

console.log('🟢 CLEAN CALCULATOR SCRIPT END');
