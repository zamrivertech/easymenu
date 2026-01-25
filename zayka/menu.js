// Google Sheets API
const SHEET_ID = "1LshawAIIIorlZF1T3rV6LDx1hx81M-CpOCmMq3hGQjU";
const API_KEY = "AIzaSyA_88FypaC1s4exlXvKn_x0_28WvZnSLjs";
const RANGE = "Menu!A:D";

// ---------- Helpers ----------
function slugify(text) {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

async function fetchMenuData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}&t=${Date.now()}`;
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

      // Animate pill
      gsap.from(pill, {
        duration: 0.6,
        y: -20,
        opacity: 0,
        ease: "power2.out",
        delay: navPills.children.length * 0.1
      });

      // Category card
      const card = document.createElement("section");
      card.className = "category-card";
      card.id = safeId;

      const header = document.createElement("div");
      header.className = "menu-header";
      const h2 = document.createElement("h2");
      h2.textContent = category;
      header.appendChild(h2);
      card.appendChild(header);

      const platesContainer = document.createElement("div");
      platesContainer.className = "plates";

      categoryItems.forEach(item => {
        const plate = document.createElement("article");
        plate.className = "plate";

        const name = document.createElement("strong");
        name.textContent = item["Name"];

        const dashed = document.createElement("div");
        dashed.className = "dashed";

        const price = document.createElement("span");
        price.className = "price";
        price.textContent = `${item["Price (MT)"]} MT`;

        const desc = document.createElement("small");
        desc.className = "description";
        desc.textContent = item["Description"] || "";

        plate.append(name, dashed, price, desc);
        platesContainer.appendChild(plate);
      });

      card.appendChild(platesContainer);
      menuContainer.appendChild(card);

      // Animate card on scroll
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        },
        duration: 1,
        y: 40,
        opacity: 0,
        ease: "power2.out"
      });

      // Animate plates inside card
      gsap.from(platesContainer.children, {
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
        duration: 0.8,
        y: 20,
        opacity: 0,
        stagger: 0.15,
        ease: "power3.out"
      });
    });
  } catch (err) {
    console.error("Digital menu error:", err);
  }
}


// ---------- Export ----------
window.MenuApp = { renderDigitalMenu };

