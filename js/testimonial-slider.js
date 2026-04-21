(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.testimonial6_slider-wrapper');
    
    sliders.forEach(function(wrapper) {
      const slider = wrapper.querySelector('.testimonial6_grid-list');
      const items = slider.querySelectorAll('.testimonial6_content');
      const prevBtn = wrapper.parentElement.querySelector('.testimonial6_prev');
      const nextBtn = wrapper.parentElement.querySelector('.testimonial6_next');
      
      if (!slider || items.length === 0) return;
      
      let currentIndex = 0;
      const totalItems = items.length;
      const visibleItems = window.innerWidth <= 767 ? 1 : 3;
      const maxIndex = Math.max(0, totalItems - visibleItems);
      
      function updateSlider() {
        const itemWidth = items[0].offsetWidth;
        const gap = window.innerWidth <= 767 ? 0 : 48;
        const offset = currentIndex * (itemWidth + gap);
        slider.style.transform = `translateX(-${offset}px)`;
        
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
      }
      
      function goToNext() {
        if (currentIndex < maxIndex) {
          currentIndex++;
          updateSlider();
        }
      }
      
      function goToPrev() {
        if (currentIndex > 0) {
          currentIndex--;
          updateSlider();
        }
      }
      
      if (prevBtn) prevBtn.addEventListener('click', goToPrev);
      if (nextBtn) nextBtn.addEventListener('click', goToNext);
      
      updateSlider();
      
      let resizeTimeout;
      window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
          const newVisibleItems = window.innerWidth <= 767 ? 1 : 3;
          const newMaxIndex = Math.max(0, totalItems - newVisibleItems);
          if (currentIndex > newMaxIndex) {
            currentIndex = newMaxIndex;
          }
          updateSlider();
        }, 250);
      });
    });
  });
})();
