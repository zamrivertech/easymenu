// menu.js

// Use official Google Sheets API
const SHEET_ID = "1m_V01h0JhDC6FrfWvRVh9ENQB99KIPjnzkVd3Ttlrew";
const API_KEY = "AIzaSyA_88FypaC1s4exlXvKn_x0_28WvZnSLjs";

// language handling
let CURRENT_LANG = localStorage.getItem('menuLang') || 'pt';

if (typeof document !== 'undefined') document.documentElement.lang = CURRENT_LANG;

function sheetRangeForLang(lang) {
  const tab = lang === 'en' ? 'Menu-en' : 'Menu-pt';
  return `${tab}!A:E`;
}

// ---------- Shared Helpers ----------
function slugify(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    (acc[item[key]] = acc[item[key]] || []).push(item);
    return acc;
  }, {});
}

async function fetchMenuData() {

  const range = sheetRangeForLang(CURRENT_LANG);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}&t=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });

  const data = await res.json();

  if (!data.values) throw new Error("No values found");

  const [headers, ...rows] = data.values;

  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });
    return obj;
  });

}

// ---------- Digital Menu ----------
async function renderDigitalMenu() {

  try {

    const items = await fetchMenuData();

    const categories = [...new Set(items.map(i => i["Category"]))];

    const menuContainer = document.querySelector(".menu");

    const navPills = document.querySelector(".nav-pills");

    menuContainer.innerHTML = "";
    navPills.innerHTML = "";

    categories.forEach(category => {

      const safeId = slugify(category);

      const categoryItems = items.filter(i => i["Category"] === category);

      const pill = document.createElement("a");
      pill.href = `#${safeId}`;
      pill.textContent = category;
      navPills.appendChild(pill);

      const card = document.createElement("div");
      card.className = "category-card";
      card.id = safeId;

      card.innerHTML = `
      <div class="menu-header"><h2>${category}</h2></div>

      ${categoryItems.map(item => `
        <div class="plate">

          ${item["Image"] ? `<img style="display:none" src="${item["Image"]}" alt="${item["Name"]}" class="plate-img"/>` : ""}

          <strong>${item["Name"]}</strong>



          <span class="price">${item["Price (MT)"]} MT</span>

        </div>

                  <small class="description">${item["Description"] || ""}</small>
      `).join("")}
      `;

      const wrapper1 = document.createElement("div");
      wrapper1.className = "category-wrapper";

      const wrapper2 = document.createElement("div");
      wrapper2.className = "category-outer-wrapper";

      wrapper1.appendChild(card);
      wrapper2.appendChild(wrapper1);

      menuContainer.appendChild(wrapper2);

    });

  } catch (err) {

    console.error("Digital menu error:", err);

  }

}

// ---------- Language ----------
function setLanguage(lang) {

  if (lang !== 'en' && lang !== 'pt') return;

  CURRENT_LANG = lang;

  localStorage.setItem('menuLang', lang);

  document.documentElement.lang = lang;

  renderDigitalMenu();

  if (typeof renderPdfMenu === 'function') renderPdfMenu();

  document.querySelectorAll('.menu-controls .lang-btn, .modal .lang-btn').forEach(btn => {

    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);

  });

}

// buttons
if (typeof window !== 'undefined') {

  document.addEventListener('DOMContentLoaded', () => {

    const btnEn = document.getElementById('lang-en');
    const btnPt = document.getElementById('lang-pt');

    if (btnEn) {
      btnEn.addEventListener('click', () => setLanguage('en'));
      if (CURRENT_LANG === 'en') btnEn.classList.add('active');
    }

    if (btnPt) {
      btnPt.addEventListener('click', () => setLanguage('pt'));
      if (CURRENT_LANG === 'pt') btnPt.classList.add('active');
    }

  });

}


// ---------- Category Order ----------

const CATEGORY_ORDER_PT = [

  ["Petiscos","Delícias no Pão","Saladas","Mutxutxu","Extras","Pratos Mariscos", "Pratos Principais", "Bebidas", "Outras Bebidas"],
  ["Garrafeira & Bar", "Tabacaria"]

];

const CATEGORY_ORDER_EN = [

  ["Snacks","Delicious Bread","Salads","Mutxutxu","Extras","Seafood Dishes", "Main Dishes", "Drinks", "Other Drinks"],
  ["Wine Cellar & Bar", "Tobacco shop"]
];

function getCategoryOrder() {

  return CURRENT_LANG === "en" ? CATEGORY_ORDER_EN : CATEGORY_ORDER_PT;

}


// ---------- Footer Text ----------

function getFooterHTML(pageIndex) {

  if (CURRENT_LANG === "en") {

    if (pageIndex === 0) {

      return `
        <div class="footer-info-alt">

          <div class="footer-text">

            <p>At <strong>Canto de África</strong>, we serve freshly prepared dishes with authentic flavors in a welcoming space.</p>

            <p>Thank you for your choice — <strong>enjoy your meal!</strong></p>

            <p>
              <strong>MPesa: </strong> 84 779 6666 • <strong>Emola:</strong> 86 021  8992
              <br>Telma Elisio da Silva
            </p>

          </div>

        </div>
      `;

    }

  } else {

    if (pageIndex === 0) {

      return `
        <div class="footer-info-alt">

          <div class="footer-text">

            <p>No <strong>Canto de África</strong>, servimos pratos frescos com sabores autênticos num ambiente acolhedor.</p>

            <p>Obrigado pela preferência — <strong>bom apetite!</strong></p>

            <p>
              <strong>MPesa: </strong> 84 779 6666 • <strong>Emola:</strong> 86 021  8992
              <br>Telma Elisio da Silva
            </p>

          </div>

        </div>
      `;

    }

        if (pageIndex === 1) {

      return `
        <div class="footer">



        </div>
      `;

    }

  }

  return "";

}


// ---------- PDF Menu ----------

function createCategoryBlock(category, items) {

  const grouped = groupBy(items, "Name");

  const block = document.createElement("div");

  block.className = "category-block";

  block.innerHTML = `

    <h2>${category}</h2>

    ${Object.keys(grouped).map(name => {

      const item = grouped[name][0];

      return `

        ${item["Image"] ? `<img src="${item["Image"]}" class="plate-img"/>` : ""}

        <div class="plate">

          <strong>${item["Name"]}</strong>

          <div class="dashed"></div>

          <span class="price">${item["Price (MT)"]} MT</span>

        </div>

        <small>${item["Description"]}</small>

      `;

    }).join("")}

  `;

  return block;

}


async function renderPdfMenu() {

  try {

    const items = await fetchMenuData();

    const categories = [...new Set(items.map(i => i["Category"]))];

    const CATEGORY_ORDER = getCategoryOrder();

    const pagesDiv = document.getElementById("pages");

    pagesDiv.innerHTML = "";

    CATEGORY_ORDER.forEach((catGroup, idx) => {

      const page = document.createElement("div");
      page.className = "page";

      if (idx === 0) {

        page.innerHTML += `
        <div class="header-info">
          <img src="./img/logo.png" alt="Ellite Logo">
        </div>
        `;

      }

      const grid = document.createElement("div");
      grid.className = "menu-grid";

      const blocks = [];

      catGroup.forEach(category => {

        if (!categories.includes(category)) return;

        const catItems = items.filter(i => i["Category"] === category);

        if (catItems.length === 0) return;

        blocks.push(createCategoryBlock(category, catItems));

      });

      for (let i = 0; i < blocks.length; i += 3) {

        const row = document.createElement("div");
        row.className = "menu-row";

        const rowBlocks = blocks.slice(i, i + 3);

        rowBlocks.forEach(block => row.appendChild(block));

        if (rowBlocks.length < 3) {
          rowBlocks.forEach(block => block.style.flex = "1");
        }

        grid.appendChild(row);

      }

      page.appendChild(grid);

      // FOOTER
      page.innerHTML += getFooterHTML(idx);

      pagesDiv.appendChild(page);

    });

  } catch (err) {

    console.error("PDF menu error:", err);

  }

}


// ---------- Export ----------
window.MenuApp = { renderDigitalMenu, renderPdfMenu };