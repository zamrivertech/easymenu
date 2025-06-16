async function fetchData() {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1hLQqPbEG-AKG8PpNkghQUhR_CFnhLbXU1XAZlgiWb30/gviz/tq?tqx=out:json";

    try {
        const response = await fetch(sheetUrl);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(47, text.length - 2));
        const rows = jsonData.table.rows;

        const menuContainer = document.querySelector(".menu");
        const navpillsContainer = document.getElementById("category");
        const categories = {};

        rows.forEach(row => {
            let category = row.c[0]?.v;
            let name = row.c[1]?.v;
            let price = row.c[2]?.v;
            let description = (row.c[3]?.v) ? row.c[3]?.v : "";;

            if (!categories[category]) {
                categories[category] = [];
            }

            categories[category].push(`
                <div class="card">
                    <div class="plate">
                        <p>${name}</p>
                        <div class="dots"></div>
                        <p>${price} MT</p>
                    </div>
                    <div class="description">${description}</div>
                </div>
            `);
        });

        Object.keys(categories).forEach(category => {
            // Create Navpill Item
            const pill = document.createElement("a");
            pill.classList.add("pill");
            pill.href = `#${category.replace(/\s+/g, "-").toLowerCase()}`;
            pill.textContent = category;
            navpillsContainer.appendChild(pill);

            // Create Menu Section
            const categorySection = document.createElement("div");
            categorySection.classList.add("card");
            categorySection.id = category.replace(/\s+/g, "").toLowerCase();
            categorySection.innerHTML = `<div class="title">${category}</div>` + categories[category].join("");
            menuContainer.appendChild(categorySection);
        });

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

fetchData();
