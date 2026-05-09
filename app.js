const categoryFiles = [
  { name: "NPC Fruit", file: "data/npc-fruit.json" },
  { name: "Fruit Pluk", file: "data/fruit-pluk.json" },
  { name: "Vlees/Vis", file: "data/vlees-vis.json" },
  { name: "Groenten Pluk", file: "data/groenten-pluk.json" }
];

let allProducts = [];
let activeCategory = "Alles";
let cart = [];

const categoriesEl = document.getElementById("categories");
const productsEl = document.getElementById("products");
const searchEl = document.getElementById("search");

const cartBtn = document.querySelector(".cart-btn");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartContent = document.getElementById("cartContent");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const clearCart = document.getElementById("clearCart");
const orderBtn = document.getElementById("orderBtn");

async function loadProducts() {
  for (const category of categoryFiles) {
    const response = await fetch(category.file);
    const products = await response.json();

    products.forEach(product => {
      allProducts.push({ ...product, category: category.name });
    });
  }

  renderCategories();
  renderProducts();
  renderCart();
}

function renderCategories() {
  const categories = ["Alles", ...categoryFiles.map(c => c.name)];
  categoriesEl.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = "category-btn";
    button.textContent = category;

    if (category === activeCategory) button.classList.add("active");

    button.onclick = () => {
      activeCategory = category;
      renderCategories();
      renderProducts();
    };

    categoriesEl.appendChild(button);
  });
}

function renderProducts() {
  const search = searchEl.value.toLowerCase();

  const filtered = allProducts.filter(product => {
    const matchCategory =
      activeCategory === "Alles" || product.category === activeCategory;

    const matchSearch = product.name.toLowerCase().includes(search);

    return matchCategory && matchSearch;
  });

  const grouped = {};

  filtered.forEach(product => {
    if (!grouped[product.category]) grouped[product.category] = [];
    grouped[product.category].push(product);
  });

  productsEl.innerHTML = "";

  Object.keys(grouped).forEach(category => {
    const title = document.createElement("h2");
    title.className = "group-title";
    title.textContent = `${category} (${grouped[category].length})`;

    const grid = document.createElement("div");
    grid.className = "product-grid";

    grouped[category].forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <div>
          <div class="product-name">${product.name}</div>
          <span class="tag">${product.category}</span>
          <span class="price">€${product.price}</span>
        </div>

        <div class="dropdown-add">
          <button class="add-main">+ Toevoegen</button>
          <button class="add-toggle">⌄</button>

          <div class="amount-menu">
            <button data-amount="10">+10 toevoegen</button>
            <button data-amount="25">+25 toevoegen</button>
            <button data-amount="50">+50 toevoegen</button>
            <button data-amount="100">+100 toevoegen</button>
          </div>
        </div>
      `;

      const addMain = card.querySelector(".add-main");
      const toggle = card.querySelector(".add-toggle");
      const menu = card.querySelector(".amount-menu");

      addMain.onclick = () => addToCart(product, 1);

      toggle.onclick = event => {
        event.stopPropagation();

        document.querySelectorAll(".amount-menu.open").forEach(openMenu => {
          if (openMenu !== menu) openMenu.classList.remove("open");
        });

        menu.classList.toggle("open");
      };

      menu.querySelectorAll("button").forEach(button => {
        button.onclick = () => {
          addToCart(product, Number(button.dataset.amount));
          menu.classList.remove("open");
        };
      });

      grid.appendChild(card);
    });

    productsEl.appendChild(title);
    productsEl.appendChild(grid);
  });
}

function addToCart(product, amount) {
  const existingItem = cart.find(item => item.name === product.name);

  if (existingItem) {
    existingItem.amount += amount;
  } else {
    cart.push({
      name: product.name,
      category: product.category,
      price: product.price,
      amount
    });
  }

  renderCart();
}

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.amount, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.amount * item.price, 0);

  cartBtn.textContent = `Winkelwagen (${totalItems})`;
  cartCount.textContent = `${totalItems} items`;
  cartTotal.textContent = `€${totalPrice}`;

  cartContent.innerHTML = "";

  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">▢</div>
        <p>Je winkelwagen is leeg</p>
      </div>
    `;
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p>${item.amount}x · €${item.price} per stuk</p>
      </div>

      <div class="cart-item-right">
        <strong>€${item.amount * item.price}</strong>
        <button class="remove-item">×</button>
      </div>
    `;

    row.querySelector(".remove-item").onclick = () => {
      cart = cart.filter(cartItem => cartItem.name !== item.name);
      renderCart();
    };

    cartContent.appendChild(row);
  });
}

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.addEventListener("click", () => {
  document.querySelectorAll(".amount-menu.open").forEach(menu => {
    menu.classList.remove("open");
  });
});

searchEl.addEventListener("input", renderProducts);
cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartPanel);
cartOverlay.addEventListener("click", closeCartPanel);

clearCart.addEventListener("click", () => {
  cart = [];
  renderCart();
});

orderBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  alert("Bestelling geplaatst!");
  cart = [];
  renderCart();
  closeCartPanel();
});

loadProducts();