// menu.js

// Use official Google Sheets API
const SHEET_ID = "1sbaGlBL0KrG9i9jUQZubnc9d-vSif8QCg8JE_o0xELI";
const API_KEY = "AIzaSyA_88FypaC1s4exlXvKn_x0_28WvZnSLjs";
const RANGE = "Menu!A:D"; // adjust columns/range to match your sheet

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
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}&t=${Date.now()}`;
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
            <strong>${item["Name"]}</strong><div class="dashed"></div><span class='price'>${item["Price (MT)"]} MT</span>
            <small class="description">${item["Description"] || ""}</small>
          </div>
        `
          )
          .join("")}
      `;
      menuContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Digital menu error:", err);
  }
}

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
      <table style="width:100%; border-collapse:collapse; font-size:0.98em; color:#e22218;">
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
          <p>Refeições Rápidas!</p>
          <img src="./img/logo.png" alt="Logo">
          <p>Sabor Autêntico!</p>
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
            <strong>Restaurante No Zavala</strong><br>
            Segunda a Domingo, 09:00 - 21:00<br>
            879112092 - 872112092<br>
            Cruzamento de Seta, Matema, Tete, Moçambique.<br>
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
