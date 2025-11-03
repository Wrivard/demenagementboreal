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
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.268 2 2 7.925 2 15.213c0 4.446 2.225 8.41 5.725 11.015l-1.5 5.362c-.093.339.238.63.561.468l5.725-3.004c1.519.425 3.131.656 4.824.656h.15c7.732 0 14-5.925 14-13.213S23.732 2 16 2z" fill="#ffffff"/>
        <path d="M10.5 15.5c0-.828.672-1.5 1.5-1.5h8c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5h-8c-.828 0-1.5-.672-1.5-1.5z" fill="#72adcb"/>
      </svg>
    </a>
    <button class="st_button" aria-label="Retour en haut">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4L4 12h3v8h10v-8h3L12 4z" fill="currentColor"/>
      </svg>
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

