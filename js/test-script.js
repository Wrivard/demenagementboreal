// Test script to verify loading
console.log('🟡 TEST SCRIPT LOADED SUCCESSFULLY');
console.log('Time:', new Date().toISOString());

document.addEventListener('DOMContentLoaded', function() {
  console.log('🟡 TEST SCRIPT DOM READY');
  
  const form = document.getElementById('estimation-form');
  console.log('Form found:', form !== null);
  
  if (form) {
    const radios = form.querySelectorAll('.custom-radio-option');
    console.log('Radio options found:', radios.length);
    
    // Apply immediate visible styles to test
    radios.forEach(function(radio, index) {
      radio.style.border = '3px solid red';
      radio.style.padding = '20px';
      radio.style.margin = '10px 0';
      console.log('Applied red border to radio', index);
    });
  }
});
