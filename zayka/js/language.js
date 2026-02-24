const LanguageManager = (() => {
  const translations = {
    // Navigation & Common
    pt: {
      home: "Início",
      about: "Sobre",
      contact: "Contacto",
      call: "Ligue e encomende agora!",
      menu: "Veja Menu!",
      
      // Index Page - Hero Section
      heroText: "Comida Saborosa & Mais!",
      
      // Index Page - About Section
      aboutTitle: "Sobre Nós",
      visitText: "Venha Visitar e Saborear Nossos Pratos!",
      cafeTitle: "Cafe & Restaurant",
      address: "Perto da Loja Vodacom\nAv. Julius Nyerere, Cidade de Tete, Moçambique.",
      description: "O ponto de encontro para quem não abdica de uma refeição de qualidade em Tete.",
      hoursLabel: "Horário:",
      hours: "Segunda a Domingo, das 08h às 22h.",
      
      // Languages
      languages: "Idiomas",
    },
    en: {
      home: "Home",
      about: "About",
      contact: "Contact",
      call: "Call & order now!",
      menu: "View Menu!",
      
      // Index Page - Hero Section
      heroText: "Delicious Food & More!",
      
      // Index Page - About Section
      aboutTitle: "About Us",
      visitText: "Come Visit and Taste Our Dishes!",
      cafeTitle: "Cafe & Restaurant",
      address: "Near Vodacom Store\nAv. Julius Nyerere, Tete City, Mozambique.",
      description: "The meeting point for those who don't compromise on quality meals in Tete.",
      hoursLabel: "Hours:",
      hours: "Monday to Sunday, from 8am to 10pm.",
      
      // Languages
      languages: "Languages",
    },
    gu: {
      home: "હોમ",
      about: "વિશે",
      contact: "સંપર્ક",
      call: "હવે ઓર્ડર કરો!",
      menu: "મેનુ જુઓ!",
      
      // Index Page - Hero Section
      heroText: "સ્વાદિષ્ટ ખોરાક અને વધુ!",
      
      // Index Page - About Section
      aboutTitle: "આমારા વિશે",
      visitText: "આવો અને આપણી પીસીને સ્વાદ લો!",
      cafeTitle: "કાફે અને રેસ્ટોરેન્ટ",
      address: "વોડાકોમ સ્ટોર પાસે\nએવ. જુલિયસ નેરેર, ટેટે શહેર, મોઝામ્બિક.",
      description: "ટેટમાં ગુણવત્તાની ખોરાક માટે જે લોકો આપસ નથી કરતા તેમના માટે મીટિંગ પોઈન્ટ.",
      hoursLabel: "સમય:",
      hours: "સોમવાર થી રવિવાર, સવાર ૮ થી રાત ૧૦.",
      
      // Languages
      languages: "ભાષાઓ",
    },
    zh: {
      home: "主页",
      about: "关于",
      contact: "联系",
      call: "立即致电订购！",
      menu: "查看菜单",
      
      // Index Page - Hero Section
      heroText: "美味食物等等！",
      
      // Index Page - About Section
      aboutTitle: "关于我们",
      visitText: "来访问和品尝我们的菜肴！",
      cafeTitle: "咖啡馆和餐厅",
      address: "靠近沃达丰商店\n朱利叶斯·尼雷尔大街，特特市，莫桑比克。",
      description: "这是一个汇聚点，为那些在特特不妥协于优质饭菜的人。",
      hoursLabel: "营业时间:",
      hours: "星期一至星期日，上午8点至晚上10点。",
      
      // Languages
      languages: "语言",
    }
  };

  const defaultLang = localStorage.getItem('lang') || 'pt';

  return {
    // Get translation by key and language
    t: function(key, lang = null) {
      const targetLang = lang || this.getCurrentLang();
      return translations[targetLang]?.[key] || translations['pt'][key] || key;
    },

    // Get current language
    getCurrentLang: function() {
      return localStorage.getItem('lang') || 'pt';
    },

    // Set language
    setLanguage: function(lang) {
      localStorage.setItem('lang', lang);
      // Update all language buttons
      this.updateLanguageButtons(lang);
      // Dispatch event for other listeners
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    // Update language button UI
    updateLanguageButtons: function(lang) {
      const langButtons = document.querySelectorAll('.lang-btn');
      langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });
    },

    // Get sheet tab name based on language
    // Maps language code to Google Sheet tab name
    getSheetTab: function(lang = null) {
      const targetLang = lang || this.getCurrentLang();
      const tabMap = {
        'pt': 'Menu-pt',   // Portuguese (main data source)
        'en': 'Menu-en',   // English translation tab
        'gu': 'Menu-gu',   // Gujarati translation tab
        'zh': 'Menu-zh'    // Chinese translation tab
      };
      return tabMap[targetLang] || 'Menu-pt';
    },

    // Initialize language switcher
    init: function() {
      const langButtons = document.querySelectorAll('.lang-btn');
      langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          this.setLanguage(btn.dataset.lang);
        });
      });
      // Set active button on init
      this.updateLanguageButtons(this.getCurrentLang());
    },

    // Get all available translations for a key
    getTranslations: function(key) {
      const result = {};
      Object.keys(translations).forEach(lang => {
        result[lang] = translations[lang][key] || key;
      });
      return result;
    }
  };
})();

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LanguageManager.init());
} else {
  LanguageManager.init();
}
