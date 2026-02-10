/* ===========================
   Modal Management
=========================== */

const ModalManager = (() => {
  return {
    // Initialize contact modal
    initContactModal: function() {
      const modal = document.getElementById('contactModal');
      const openBtn = document.getElementById('openModal');
      const closeBtn = document.getElementById('closeContactModal');

      if (!modal || !openBtn) return;

      openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.style.display = 'none';
        });
      }

      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
      });

      // Update modal text when language changes
      window.addEventListener('languageChanged', (e) => {
        const lang = e.detail.lang;
        const h2 = modal.querySelector('.modal-actions h2');
        const callBtn = modal.querySelector('.call-btn');
        
        if (h2) h2.textContent = LanguageManager.t('contact', lang);
        if (callBtn) callBtn.textContent = LanguageManager.t('call', lang);
      });
    },

    // Initialize image modal (now uses contact modal)
    initImageModal: function() {
      const modal = document.getElementById("contactModal");
      const imageDisplay = document.getElementById("modalImage");
      const contactDisplay = document.getElementById("modalContact");
      const imageContent = document.getElementById("imageContent");
      const imageCaptionText = document.getElementById("imageCaptionText");
      const closeBtn = document.getElementById("closeContactModal");

      if (!modal) return;

      const openImageModal = (img) => {
        // Hide contact info, show image
        contactDisplay.style.display = "none";
        imageDisplay.style.display = "flex";

        imageContent.src = img.src;
        imageContent.alt = img.alt;
        imageCaptionText.textContent = img.alt;

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
      };

      const closeImageModal = () => {
        modal.style.display = "none";
        imageDisplay.style.display = "none";
        contactDisplay.style.display = "block";
        imageContent.src = "";
        document.body.style.overflow = "";
      };

      // OPEN IMAGE
      document.addEventListener("click", (e) => {
        const img = e.target.closest(".category-image");
        if (!img) return;
        openImageModal(img);
      });

      // CLOSE BUTTON
      if (closeBtn) {
        closeBtn.addEventListener("click", closeImageModal);
      }

      // MODAL BACKDROP CLICK
      const backdrop = modal.querySelector("::before"); // pseudo-element not accessible
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeImageModal();
      });

      // ESC KEY
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && imageDisplay.style.display !== "none") {
          closeImageModal();
        }
      });
    },

    // Initialize map toggle on index page
    initMapToggle: function() {
      const badge = document.querySelector('.badge');
      if (!badge) return;

      badge.addEventListener('click', function() {
        const wrapper = this.closest('.map-wrapper');
        if (wrapper) {
          wrapper.classList.toggle('is-active');
        }
      });
    }
  };
})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ModalManager.initContactModal();
    ModalManager.initImageModal();
    ModalManager.initMapToggle();
  });
} else {
  ModalManager.initContactModal();
  ModalManager.initImageModal();
  ModalManager.initMapToggle();
}
