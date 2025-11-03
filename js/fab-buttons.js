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
  
  // Button markup template
  const buttonMarkup = `
    <a href="${MESSENGER_URL}" target="_blank" class="messenger-button" aria-label="Contactez-nous sur Messenger">
      <img src="images/Messenger_Icon_Secondary_White.svg" alt="Messenger" />
    </a>
    <button class="st_button" aria-label="Retour en haut">
      <img src="images/IcBaselineArrowUpward.svg" alt="Retour en haut" class="arrow-icon" />
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

