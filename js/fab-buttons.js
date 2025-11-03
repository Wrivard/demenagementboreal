/**
 * Floating Action Buttons (Back to Top + Messenger)
 * Centralized script for all pages
 * Injects homepage markup and handles show/hide + scroll behavior
 */

(function() {
  'use strict';

  // Configuration
  const SCROLL_THRESHOLD = 300; // Show buttons after scrolling 300px
  const MESSENGER_URL = 'https://m.me/61555945646998'; // Messenger link (update if needed)
  
  // Button markup template (SVGs inlined to avoid path issues)
  const messengerIconSVG = `<svg id="Logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 502 502"><defs><style>.cls-1{fill:#fff;stroke-width:0px;}</style></defs><path class="cls-1" d="M251,1C110.17,1,1,104.16,1,243.5c0,72.89,29.87,135.86,78.51,179.37,4.09,3.65,6.55,8.78,6.72,14.25l1.36,44.48c.43,14.18,15.09,23.41,28.06,17.68l49.62-21.91c4.21-1.85,8.92-2.2,13.35-.97,22.81,6.27,47.07,9.61,72.37,9.61,140.83,0,250-103.16,250-242.5S391.83,1,251,1ZM405.92,178.79l-87.04,134.52c-4.42,6.83-13.53,8.78-20.36,4.36l-80.63-52.17c-3.12-2.02-7.16-1.96-10.22.15l-90.88,62.68c-13.26,9.14-29.47-6.59-20.72-20.11l87.05-134.52c4.42-6.83,13.53-8.78,20.35-4.36l80.65,52.18c3.12,2.02,7.16,1.96,10.22-.15l90.86-62.67c13.26-9.15,29.47,6.59,20.72,20.11Z"/></svg>`;
  
  const arrowIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="24" height="24" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet"><path fill="#ffffff" d="m4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"></path></svg>`;
  
  const buttonMarkup = `
    <a href="${MESSENGER_URL}" target="_blank" class="messenger-button" aria-label="Contactez-nous sur Messenger">
      ${messengerIconSVG}
    </a>
    <button class="st_button" aria-label="Retour en haut">
      ${arrowIconSVG}
    </button>
  `;

  // Initialize buttons
  function initButtons() {
    // Find or create wrapper
    let wrapper = document.querySelector('.st_wrapper');
    
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'st_wrapper';
      document.body.appendChild(wrapper);
    }

    // Check if buttons already exist
    const existingButtons = wrapper.querySelector('.st_button, .messenger-button');
    
    if (!existingButtons && wrapper.innerHTML.trim() === '') {
      wrapper.innerHTML = buttonMarkup;
    }

    // Get all button instances
    const backToTopButtons = document.querySelectorAll('.st_button');
    const messengerButtons = document.querySelectorAll('.messenger-button');

    // Bind scroll handler
    let ticking = false;
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const isVisible = scrollTop > SCROLL_THRESHOLD;

          // Toggle visibility for all buttons
          backToTopButtons.forEach(function(button) {
            if (isVisible) {
              button.classList.add('is-visible', 'appear');
            } else {
              button.classList.remove('is-visible', 'appear');
            }
          });

          messengerButtons.forEach(function(button) {
            if (isVisible) {
              button.classList.add('is-visible', 'appear');
            } else {
              button.classList.remove('is-visible', 'appear');
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    }

    // Bind scroll event
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    // Bind click handler for Back to Top
    backToTopButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtons);
  } else {
    initButtons();
  }
})();

