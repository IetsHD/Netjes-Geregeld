const initialProducts = [
  {
    name: "Watermeloen",
    category: "NPC Fruit",
    price: 5
  },
  {
    name: "Peer",
    category: "NPC Fruit",
    price: 5
  },
  {
    name: "Citroen",
    category: "NPC Fruit",
    price: 5
  },
  {
    name: "Banaan",
    category: "NPC Fruit",
    price: 5
  },
  {
    name: "Perzik",
    category: "NPC Fruit",
    price: 5
  },
  {
    name: "Mango",
    category: "NPC Fruit",
    price: 5
  },
  {
    name: "Kip",
    category: "Vlees/Vis",
    price: 10
  },
  {
    name: "Tomaat",
    category: "Groenten Pluk",
    price: 10
  }
];

let products = initialProducts;
let cart = [];

let activeCategory = "Alles";

const productSections =
  document.querySelector("#productSections");

const categoryFilters =
  document.querySelector("#categoryFilters");

const searchInput =
  document.querySelector("#searchInput");

const cartCount =
  document.querySelector("#cartCount");

const cartDialog =
  document.querySelector("#cartDialog");

const productDialog =
  document.querySelector("#productDialog");

/* CATEGORIES */

function categories() {

  return [
    "Alles",
    ...new Set(products.map(p => p.category))
  ];

}

/* FILTER BUTTONS */

function renderFilters() {

  categoryFilters.innerHTML =
    categories()
      .map(category => `
        <button
          class="chip ${
            category === activeCategory
              ? "active"
              : ""
          }"
          data-category="${category}"
        >
          ${category}
        </button>
      `)
      .join("");

  document
    .querySelectorAll("[data-category]")
    .forEach(button => {

      button.addEventListener("click", () => {

        activeCategory =
          button.dataset.category;

        render();

      });

    });

}

/* FILTER PRODUCTS */

function filteredProducts() {

  const query =
    searchInput.value
      .toLowerCase()
      .trim();

  return products.filter(product => {

    const matchesCategory =
      activeCategory === "Alles"
      ||
      product.category === activeCategory;

    const matchesSearch =
      product.name
        .toLowerCase()
        .includes(query);

    return matchesCategory && matchesSearch;

  });

}

/* PRODUCTEN */

function renderProducts() {

  const grouped =
    Object.groupBy(
      filteredProducts(),
      product => product.category
    );

  productSections.innerHTML =
    Object.entries(grouped)
      .map(([category, items]) => `

        <h2 class="category-title">
          ${category}
        </h2>

        <div class="grid">

          ${items.map(product => `

            <article class="card">

              <div>

                <h3>${product.name}</h3>

                <div class="meta">

                  <span class="badge">
                    ${product.category}
                  </span>

                  <span class="price">
                    €${product.price}
                  </span>

                </div>

              </div>

              <div class="add">

                <button
                  data-add="${product.name}"
                >
                  + Toevoegen
                </button>

              </div>

            </article>

          `).join("")}

        </div>

      `)
      .join("");

  document
    .querySelectorAll("[data-add]")
    .forEach(button => {

      button.addEventListener("click", () => {

        addToCart(button.dataset.add);

      });

    });

}

/* WINKELWAGEN */

function addToCart(name) {

  const product =
    products.find(p => p.name === name);

  const existing =
    cart.find(p => p.name === name);

  if (existing) {

    existing.quantity++;

  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }

  renderCart();

}

function renderCart() {

  cartCount.textContent =
    cart.length
      ? `(${cart.length})`
      : "";

  document.querySelector("#cartItems")
    .innerHTML =
      cart.length
        ? cart.map(item => `

          <div class="cart-row">

            <span>
              ${item.quantity}x ${item.name}
            </span>

            <strong>
              €${item.quantity * item.price}
            </strong>

          </div>

        `).join("")
        : "<p>Je winkelwagen is leeg.</p>";

  document.querySelector("#cartTotal")
    .textContent =
      "€" +
      cart.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      );

}

/* RENDER */

function render() {

  renderFilters();
  renderProducts();
  renderCart();

}

/* SEARCH */

searchInput.addEventListener(
  "input",
  renderProducts
);

/* BUTTONS */

document.querySelector("#cartBtn")
  .addEventListener("click", () => {

    cartDialog.showModal();

  });

document.querySelector("#newProductBtn")
  .addEventListener("click", () => {

    productDialog.showModal();

  });

document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.addEventListener("click", () => {

      button
        .closest("dialog")
        .close();

    });

  });

/* CLEAR CART */

document.querySelector("#clearCartBtn")
  .addEventListener("click", () => {

    cart = [];
    renderCart();

  });

/* NIEUW PRODUCT */

document.querySelector("#productForm")
  .addEventListener("submit", event => {

    event.preventDefault();

    const form =
      new FormData(event.target);

    products.push({
      name: form.get("name"),
      category: form.get("category"),
      price: Number(form.get("price"))
    });

    event.target.reset();

    productDialog.close();

    render();

  });

render();