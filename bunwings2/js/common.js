/* ===========================
   Common Utilities
=========================== */

// Slugify text for URL-safe IDs
function slugify(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

// Get current language from localStorage
function getCurrentLanguage() {
  return localStorage.getItem('lang') || 'pt';
}

// Set language in localStorage
function setStoredLanguage(lang) {
  localStorage.setItem('lang', lang);
}

// Utility for debugging
function log(message, data = null) {
  console.log(`[Zayka] ${message}`, data || "");
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { slugify, getCurrentLanguage, setStoredLanguage, log };
}
