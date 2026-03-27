// script.js
const menus = [
  { name: "Chicken Express", folder: "expresschicken", path: "expresschicken/index.html" },
  { name: "Flames", folder: "flames", path: "flames/index.html" },
  { name: "No Zavala", folder: "nozavala", path: "nozavala/index.html" },
  { name: "Shak's Coffee", folder: "shakscoffee", path: "shakscoffee/index.html" },
  { name: "Ellite Catering & Services", folder: "ellite", path: "ellite/index.html" }
];

const translations = {
  pt: {
    toppilltext: "Chamativo & Dinâmico",
    title: "Cardápio com QR Code para o seu restaurante",
    mainbutton: "Criar meu menu!",
    clientbutton: "Ver Menus Reais",    
    about_title: "Zambezi River Technologies",
    about_text: "A Zambezi River Technologies é uma empresa inovadora focada em transformar a experiência gastronómica através da tecnologia.",
    footer: "© 2026 Zambezi River Technologies. Todos os direitos reservados."
  },
  en: {
    toppilltext: "Bold & Dynamic",
    title: "Menu with QR Code for your restaurant!",
    mainbutton: "Get my menu!",
    clientbutton: "See Real Menus",    
    about_title: "Zambezi River Technologies",
    about_text: "Zambezi River Technologies is an innovative company focused on transforming the gastronomic experience through technology.",
    footer: "© 2026 Zambezi River Technologies. All rights reserved."
  }
};

function buildMarquee() {
  const track = document.getElementById('marqueeTrack');
  const items = menus.map(menu => `
    <div class="snap">
      <a href="${menu.path}">
        <img src="${menu.folder}/img/logo.png" alt="${menu.name}" onerror="this.src='./img/favicon.png'">
      </a>
    </div>
  `).join('');

  track.innerHTML = items + items + items;
}

function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = translations[lang][key] || "";
  });
  localStorage.setItem("lang", lang);
}

document.addEventListener('DOMContentLoaded', () => {
  buildMarquee();

  const select = document.getElementById("languageSelect");
  const savedLang = localStorage.getItem("lang") || "pt";

  select.value = savedLang;
  setLanguage(savedLang);

  select.addEventListener("change", e => setLanguage(e.target.value));
});
