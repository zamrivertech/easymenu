/* ===========================
   Menu Renderer
=========================== */

const MenuRenderer = (() => {
  return {
    // Render the entire digital menu
    renderDigitalMenu: async function(lang = null) {
      try {
        const targetLang = lang || LanguageManager.getCurrentLang();
        const items = await SheetAPI.fetchMenuDataByLanguage(targetLang);
        const categories = [...new Set(items.map(i => i["Category"]))];

        const menuContainer = document.querySelector(".menu");
        const navPills = document.querySelector(".nav-pills");

        if (!menuContainer || !navPills) {
          console.warn("Menu container or nav pills not found");
          return;
        }

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

          // GSAP animation for pill
          if (typeof gsap !== 'undefined') {
            gsap.from(pill, {
              duration: 0.6,
              y: -20,
              opacity: 0,
              ease: "power2.out",
              delay: navPills.children.length * 0.1
            });
          }

          // Category card
          const card = document.createElement("section");
          card.className = "category-card";
          card.id = safeId;

          const header = document.createElement("div");
          header.className = "menu-header";

          const h2 = document.createElement("h2");
          h2.textContent = category;
          header.appendChild(h2);

          const imageUrl = categoryItems[0]?.Image;
          if (imageUrl) {
            const img = document.createElement("img");
            img.src = imageUrl;
            img.alt = category;
            img.loading = "lazy";
            img.className = "category-image";
            header.appendChild(img);
          }

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
            price.textContent = `${item["Price (MT)"]}`;

            const desc = document.createElement("small");
            desc.className = "description";
            desc.textContent = item["Description"] || "";

            plate.append(name, dashed, price, desc);
            platesContainer.appendChild(plate);
          });

          card.appendChild(platesContainer);
          menuContainer.appendChild(card);

          // GSAP animations for menu categories
          if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
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
          }
        });
      } catch (err) {
        console.error("Menu render error:", err);
      }
    },

    // Re-render when language changes
    onLanguageChange: function(event) {
      const lang = event.detail.lang;
      this.renderDigitalMenu(lang);
    }
  };
})();

// Listen for language changes
window.addEventListener('languageChanged', (e) => MenuRenderer.onLanguageChange(e));
