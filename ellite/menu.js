// menu.js

// Use official Google Sheets API
const SHEET_ID = "1GNZQ2jyNs8tENfcGjF_jnY2j7kXbYJtTpk39iDrK68s";
const API_KEY = "AIzaSyA_88FypaC1s4exlXvKn_x0_28WvZnSLjs";

// language handling
let CURRENT_LANG = localStorage.getItem('menuLang') || 'pt';
// ensure html element lang matches
if (typeof document !== 'undefined') document.documentElement.lang = CURRENT_LANG;

function sheetRangeForLang(lang) {
  const tab = lang === 'en' ? 'Menu-en' : 'Menu-pt';
  return `${tab}!A:E`; // assume extra column for Image
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

  // Convert rows into objects with headers
  const [headers, ...rows] = data.values;
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });
    return obj;
  });
}

// ---------- Digital Menu (menu.html) ----------
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

      // Nav pill
      const pill = document.createElement("a");
      pill.href = `#${safeId}`;
      pill.textContent = category;
      navPills.appendChild(pill);

    // Category card
    const card = document.createElement("div");
    card.className = "category-card";
    card.id = safeId;
    card.innerHTML = `
      <div class="menu-header"><h2>${category}</h2></div>
      ${categoryItems
        .map(
          item => `
        <div class="plate">
          ${item["Image"] ? `<img src="${item["Image"]}" alt="${item["Name"]}" class="plate-img" />` : ""}
          <strong>${item["Name"]}</strong>
          <small class="description">${item["Description"] || ""}</small>
          <span class='price'>${item["Price (MT)"]} MT</span>
          </div>
      `
        )
        .join("")}
    `;

    // First wrapper
    const wrapper1 = document.createElement("div");
    wrapper1.className = "category-wrapper";

    // Second wrapper
    const wrapper2 = document.createElement("div");
    wrapper2.className = "category-outer-wrapper";

    // Nest them
    wrapper1.appendChild(card);
    wrapper2.appendChild(wrapper1);

    // Append outer wrapper to menu
    menuContainer.appendChild(wrapper2);


      
    });
  } catch (err) {
    console.error("Digital menu error:", err);
  }
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'pt') return;
  CURRENT_LANG = lang;
  localStorage.setItem('menuLang', lang);
  renderDigitalMenu();
  // reflect attribute on html element
  document.documentElement.lang = lang;
  // if pdf page present
  if (typeof renderPdfMenu === 'function') renderPdfMenu();

  // update active state on any language buttons
  document.querySelectorAll('.menu-controls .lang-btn, .modal .lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// wire up buttons when DOM ready
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

// ---------- PDF Menu (pdf.html) ----------

// ---------- PDF Menu (pdf.html) ----------
const CATEGORY_ORDER = [
  ["Entradas e Extras", "Petiscos", "Pizzas", "Carnes", "Aves", "Peixes e Mariscos"],  

  ["Cervejas", "Soft Drinks", "Vinhos", "Bebidas Extra"]
];

function createCategoryBlock(category, items) {
  if (category === "Bebidas") {
    const block = document.createElement("div");
    block.className = "category-block";
    block.innerHTML = `<h2>${category}</h2>
      <table style="width:100%; border-collapse:collapse; font-size:0.98em; color:#C6A75E;">
        <tbody>
          ${items
            .map(
              item => `
            <tr>
              <td>${item["Name"]}</td>
              <td style='text-align:right;'>${item["Price (MT)"]}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>`;
    return block;
  }

  const grouped = groupBy(items, "Name");
  const block = document.createElement("div");
  block.className = "category-block";
  block.innerHTML = `
    <h2>${category}</h2>
    ${Object.keys(grouped)
      .map(name => {
        const group = grouped[name];
        if (group.length === 1) {
          const item = group[0];
          return `<div class="plate">
            ${item["Image"] ? `<img src="${item["Image"]}" alt="${item["Name"]}" class="plate-img"/>` : ""}
            <strong>${item["Name"]}</strong>
            <div class="dashed"></div>
            <span class="price">${item["Price (MT)"]} MT</span>
          </div>`;
        } else {
          return `<div class="plate">
            <strong>${name}</strong>
            <table style='width:100%; font-size:0.97em;'>
              ${group
                .map(
                  item => `
                ${item["Image"] ? `<tr><td colspan="2"><img src="${item["Image"]}" alt="${item["Name"]}" style="max-width:80px; display:block; margin:4px auto;"></td></tr>` : ``}
                <tr>
                  <td>${item["Description"] || ""}</td>
                  <td style='text-align:right;'>${item["Price (MT)"]} MT</td>
                </tr>
              `
                )
                .join("")}
            </table>
          </div>`;
        }
      })
      .join("")}
  `;
  return block;
}

async function renderPdfMenu() {
  try {
    const items = await fetchMenuData();
    const categories = [...new Set(items.map(i => i["Category"]))];
    const pagesDiv = document.getElementById("pages");
    pagesDiv.innerHTML = "";

    CATEGORY_ORDER.forEach((catGroup, idx) => {
      const page = document.createElement("div");
      page.className = "page";

      if (idx === 0) {
        page.innerHTML += `<div class="header-info">
          <p>Sabores de Moatize!</p>
          <img src="./img/logo.png" alt="Ellite Logo">
          <p>Próximo à Casa Bota</p>
        </div>`;
      }

      const grid = document.createElement("div");
      grid.className = "menu-grid"; // should be display:flex; flex-wrap:wrap in CSS

      // Collect blocks for this group
      const blocks = [];
      catGroup.forEach(category => {
        if (!categories.includes(category)) return;
        const catItems = items.filter(i => i["Category"] === category);
        if (catItems.length === 0) return;
        blocks.push(createCategoryBlock(category, catItems));
      });

      // Append blocks in rows of 3
      for (let i = 0; i < blocks.length; i += 3) {
        const row = document.createElement("div");
        row.className = "menu-row"; // flex container for each row
        const rowBlocks = blocks.slice(i, i + 3);

        rowBlocks.forEach(block => row.appendChild(block));

        // If row has < 3 blocks, let them flex-grow to fill space
        if (rowBlocks.length < 3) {
          rowBlocks.forEach(block => {
            block.style.flex = "1"; // flex-grow:1, flex-basis:auto
          });
        }

        grid.appendChild(row);
      }

      page.appendChild(grid);

      if (idx === 1) {
        page.innerHTML += `<div class="footer-info">
          <img src="./img/qr-code.png" alt="QR" style="height:150px;">
          <div class='footer-text'>
            <strong>Restaurante Ellite</strong><br>
            Segunda a Domingo, 08:00 - 22:00<br>
            841230987<br>
            Próximo à Casa Bota, Moatize, Tete, Moçambique.<br>
            <span style="font-size:0.95em;">Obrigado pela preferência!</span>
          </div>
        </div>`;
      }

      if (idx === 0) {
        page.innerHTML += `<div class="footer-info-alt">
           <p>Todos os pratos acompanham arroz, batata e salada. Xima é opcional.</p>
           <p>Aceitamos pagamentos em dinheiro, M-Pesa e cartões.</p>   
        </div>`;
      }

      pagesDiv.appendChild(page);
    });
  } catch (err) {
    console.error("PDF menu error:", err);
  }
}


// ---------- Export ----------
window.MenuApp = { renderDigitalMenu, renderPdfMenu };
