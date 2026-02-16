document.addEventListener("DOMContentLoaded", () => {

  const productContainer = document.getElementById("productDetail");
  const cartCount = document.getElementById("cartCount");
  const loading = document.getElementById("productLoading");
  const errorDiv = document.getElementById("productError");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = total;
  }

  updateCartCount();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    loading.style.display = "none";
    errorDiv.textContent = "Product not found.";
    return;
  }

  async function fetchProduct() {
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      if (!response.ok) throw new Error();

      const product = await response.json();
      loading.style.display = "none";

      renderProduct(product);

    } catch {
      loading.style.display = "none";
      errorDiv.textContent = "Failed to load product.";
    }
  }

  function renderProduct(product) {

    productContainer.innerHTML = `
      <div class="product-detail">

        <div class="product-image">
          <div class="zoom-container">
            <img id="mainImage" src="${product.image}" alt="${product.title}">
          </div>
        </div>

        <div class="product-info">
          <h1>${product.title}</h1>

          <p class="price">$<span id="unitPrice">${product.price}</span></p>

          <p class="description">${product.description}</p>

          <!-- Variations -->
          <div class="variations">
            <h4>Select Size:</h4>
            <div class="options" id="sizeOptions">
              <button data-value="S">S</button>
              <button data-value="M">M</button>
              <button data-value="L">L</button>
            </div>

            <h4>Select Color:</h4>
            <div class="options" id="colorOptions">
              <button data-value="Black">Black</button>
              <button data-value="Blue">Blue</button>
              <button data-value="Red">Red</button>
            </div>
          </div>

          <!-- Quantity -->
          <div class="quantity-selector">
            <button id="decrease">−</button>
            <span id="quantity">1</span>
            <button id="increase">+</button>
          </div>

          <p class="total-price">
            Total: $<span id="totalPrice">${product.price}</span>
          </p>

          <button class="add-to-cart-btn">Add to Cart</button>

          <div id="successMessage" class="success"></div>

        </div>
      </div>
    `;

    setupInteractions(product);
  }

  function setupInteractions(product) {

    const unitPrice = parseFloat(product.price);
    let quantity = 1;
    let selectedSize = null;
    let selectedColor = null;

    const quantityEl = document.getElementById("quantity");
    const totalPriceEl = document.getElementById("totalPrice");

    // Quantity Controls
    document.getElementById("increase").addEventListener("click", () => {
      quantity++;
      updateTotal();
    });

    document.getElementById("decrease").addEventListener("click", () => {
      if (quantity > 1) {
        quantity--;
        updateTotal();
      }
    });

    function updateTotal() {
      quantityEl.textContent = quantity;
      totalPriceEl.textContent = (unitPrice * quantity).toFixed(2);
    }

    // Variation Selection
    document.querySelectorAll("#sizeOptions button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#sizeOptions button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSize = btn.dataset.value;
      });
    });

    document.querySelectorAll("#colorOptions button").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#colorOptions button").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedColor = btn.dataset.value;
      });
    });

    // Image Zoom
    const image = document.getElementById("mainImage");

    image.addEventListener("mousemove", (e) => {
      image.style.transformOrigin = `${e.offsetX}px ${e.offsetY}px`;
      image.style.transform = "scale(2)";
    });

    image.addEventListener("mouseleave", () => {
      image.style.transform = "scale(1)";
    });

    // Add To Cart
    document.querySelector(".add-to-cart-btn")
      .addEventListener("click", () => {

        const existing = cart.find(item =>
          item.id === product.id &&
          item.size === selectedSize &&
          item.color === selectedColor
        );

        if (existing) {
          existing.quantity += quantity;
        } else {
          cart.push({
            ...product,
            quantity,
            size: selectedSize,
            color: selectedColor
          });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();

        const msg = document.getElementById("successMessage");
        msg.textContent = "Added to cart successfully!";
        setTimeout(() => msg.textContent = "", 2000);
      });
  }

  fetchProduct();
});
