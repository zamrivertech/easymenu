const PageTranslator = (() => {
  let isInitialLoad = true;

  return {
    // Translate all elements on page with data-i18n attribute
    translatePage: function(lang = null, forceStaggerTranslation = false) {
      const targetLang = lang || LanguageManager.getCurrentLang();
      
      // Find all elements with data-i18n attribute
      const translatableElements = document.querySelectorAll('[data-i18n]');
      
      translatableElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = LanguageManager.t(key, targetLang);
        
        // Check if element has text or placeholder
        const target = element.getAttribute('data-i18n-target');
        
        if (target === 'placeholder') {
          element.placeholder = translation;
        } else if (target === 'title') {
          element.title = translation;
        } else if (target === 'alt') {
          element.alt = translation;
        } else if (target === 'value') {
          element.value = translation;
        } else {
          // Special handling for stagger animation elements
          if (element.id === 'stagger-p') {
            // Only translate on language changes, not on initial load
            // This allows GSAP to animate Portuguese text first
            if (forceStaggerTranslation) {
              // Clear existing spans
              element.textContent = "";
              // Split into character spans for GSAP stagger animation
              [...translation].forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                element.appendChild(span);
              });
            }
          } else {
            // Default: update text content
            element.textContent = translation;
          }
        }
      });
    },

    // Translate stagger-p after GSAP animations complete
    translateStaggerAfterAnimation: function() {
      const targetLang = LanguageManager.getCurrentLang();
      
      // Only translate if not Portuguese (Portuguese is default/animated)
      if (targetLang !== 'pt') {
        const staggerP = document.getElementById('stagger-p');
        if (staggerP) {
          const translation = LanguageManager.t('heroText', targetLang);
          // Clear existing spans
          staggerP.textContent = "";
          // Split into character spans for GSAP stagger animation
          [...translation].forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            staggerP.appendChild(span);
          });
          
          // Re-animate with GSAP
          gsap.from("#stagger-p span", { 
            opacity: 0, 
            y: 20, 
            rotationX: 90, 
            duration: 0.6, 
            stagger: 0.03, 
            ease: "power2.out" 
          });
        }
      }
    },

    // Initialize page translator
    init: function() {
      // Translate on page load (skips stagger-p entirely on initial load)
      this.translatePage();
      isInitialLoad = false;
      
      // After GSAP animations complete (~2.5 seconds), translate stagger-p if needed
      setTimeout(() => {
        this.translateStaggerAfterAnimation();
      }, 2600);
      
      // Listen for language changes
      window.addEventListener('languageChanged', (e) => {
        // Force translate stagger-p on language changes
        this.translatePage(e.detail.lang, true);
        // Also re-animate it
        setTimeout(() => {
          gsap.from("#stagger-p span", { 
            opacity: 0, 
            y: 20, 
            rotationX: 90, 
            duration: 0.6, 
            stagger: 0.03, 
            ease: "power2.out" 
          });
        }, 50);
      });
    }
  };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PageTranslator.init());
} else {
  PageTranslator.init();
}
