const langButtons = document.querySelectorAll('.lang-btn');
const defaultLang = localStorage.getItem('lang') || 'pt';

/* =====================
   TRANSLATIONS LIVE HERE
===================== */
const translations = {
  pt: {
    contact: "Contacto",
    call: "Ligue e encomende agora!",
  },
  en: {
    contact: "Contact",
    call: "Call & order now!",
  },
  gu: {
    contact: "સંપર્ક",
    call: "હવે ઓર્ડર કરો!",
  },
  zh: {
    contact: "联系",
    call: "立即致电订购！",
  }
};

/* =====================
   APPLY LANGUAGE
===================== */
function setLanguage(lang) {
  localStorage.setItem('lang', lang);

  // Highlight active
  langButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Example text swap (extend later)
  const data = translations[lang];
  if (!data) return;

  document.querySelector('.modal-actions h2').textContent = data.contact;
  document.querySelector('.call-btn').textContent = data.call;
}

/* =====================
   EVENTS
===================== */
langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
  });
});

/* Init */
setLanguage(defaultLang);


