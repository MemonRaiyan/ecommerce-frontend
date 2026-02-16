document.addEventListener("DOMContentLoaded", () => {

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  const cartCount = document.getElementById("cartCount");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = total;
  }

  updateCartCount();

  const productsGrid = document.getElementById("productsGrid");
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");

  if (!productsGrid) return;

  const API_URL = "https://fakestoreapi.com/products?limit=8";

  async function fetchProducts() {
    try {
      loadingMessage.style.display = "block";

      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API error");

      const products = await response.json();
      loadingMessage.style.display = "none";

      renderProducts(products);

    } catch (error) {
      loadingMessage.style.display = "none";
      errorMessage.textContent = "Failed to load products.";
    }
  }

  function renderProducts(products) {
    products.forEach(product => {
      const card = document.createElement("div");
      card.classList.add("product-card");

      card.innerHTML = `
        <img src="${product.image}" loading="lazy">
        <h3>
          <a href="product.html?id=${product.id}">
            ${product.title.substring(0, 50)}...
          </a>
        </h3>
        <div class="price">$${product.price}</div>
        <button class="add-to-cart">Add to Cart</button>
      `;

      card.querySelector(".add-to-cart")
        .addEventListener("click", () => addToCart(product));

      productsGrid.appendChild(card);
    });
  }

  function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }

  fetchProducts();
});
