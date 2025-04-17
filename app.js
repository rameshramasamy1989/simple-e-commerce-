const API_URL = "https://fv473l2zd8.execute-api.us-east-1.amazonaws.com";

let cart = [];
let allProducts = []; // Store all products globally for filtering
// Utility Functions
const showPage = (pageId) => {
  document.querySelectorAll('.page').forEach((page) => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
};

const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/items`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};



const renderProducts = async (searchQuery = '') => {
  if (allProducts.length === 0) {
    allProducts = await fetchProducts(); // Fetch products only once
    console.log("Fetched products:", allProducts);
  }

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productGrid = document.getElementById('product-grid');
  productGrid.innerHTML = '';
  filteredProducts.forEach((product) => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button>Add to Cart</button>
    `;
    const addToCartButton = productDiv.querySelector('button');
    addToCartButton.addEventListener('click', () => addToCart(product.id));
    productGrid.appendChild(productDiv);
  });
};



const fetchCart = async () => {
  try {
    const response = await fetch(`${API_URL}/cart`);
    if (!response.ok) throw new Error("Failed to fetch cart");
    cart = await response.json(); // Update the global cart array
    return cart;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
};

const renderCart = async () => {
  const cartItems = await fetchCart();
  const cartContainer = document.getElementById('cart-items');
  cartContainer.innerHTML = '';
  cartItems.forEach((item) => {
    const cartItem = document.createElement('div');
    cartItem.innerHTML = `
      <p>${item.name} - $${item.price}</p>
      <button>Remove</button>
    `;
    const removeButton = cartItem.querySelector('button');
    removeButton.addEventListener('click', () => removeFromCart(item.id));
    cartContainer.appendChild(cartItem);
  });
  document.getElementById('cart-count').textContent = cartItems.length;
};

const addToCart = async (productId) => {
  const products = await fetchProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) {
    console.error("Product not found:", productId);
    return;
  }
  try {
    await fetch(`${API_URL}/cart`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    renderCart();
  } catch (error) {
    console.error("Error adding to cart:", error);
  }
};

const removeFromCart = async (productId) => {
  try {
    await fetch(`${API_URL}/cart/${productId}`, { method: 'DELETE' });
    renderCart();
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
};

const renderOrderConfirmation = async () => {
  await fetchCart(); // Ensure the cart is fetched and updated

  const orderedProductsContainer = document.getElementById('ordered-products');
  orderedProductsContainer.innerHTML = '';
  let totalPrice = 0;

  cart.forEach((item) => {
    const productDiv = document.createElement('div');
    productDiv.innerHTML = `<p>${item.name} - $${item.price}</p>`;
    orderedProductsContainer.appendChild(productDiv);
    totalPrice += item.price;
  });

  document.getElementById('total-price').textContent = totalPrice.toFixed(2);
};

// Function to clear the cart
const clearCart = async () => {
  try {
    const cartItems = await fetchCart();
    for (const item of cartItems) {
      await fetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' });
    }
    cart = []; // Clear the global cart array
  } catch (error) {
    console.error("Error clearing cart:", error);
  }
};


// Event Listeners
document.getElementById('login-btn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Hardcoded credentials
  const validUsername = "user123";
  const validPassword = "pass123";

  if (username === validUsername && password === validPassword) {
    // Save the username (optional)
    localStorage.setItem('username', username);

    // Proceed to the product page
    showPage('product-page');
    renderProducts();
  } else {
    alert('Invalid username or password. Please try again.');
  }
});




document.getElementById('cart-icon').addEventListener('click', () => {
  showPage('cart-page');
  renderCart();
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  showPage('shipping-page');
});

document.getElementById('shipping-form').addEventListener('submit', (e) => {
  e.preventDefault();
  showPage('payment-page');
});

// Add event listener for the search bar
document.getElementById('search-bar').addEventListener('input', (e) => {
  const searchQuery = e.target.value;
  renderProducts(searchQuery);
});


document.getElementById('payment-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Generate a random order ID
  const orderId = Math.floor(Math.random() * 1000000);
  document.getElementById('order-id').textContent = orderId;

  // Render order confirmation details
  await renderOrderConfirmation();

  // Populate shipping details
  const address = document.getElementById('address').value;
  const city = document.getElementById('city').value;
  const zip = document.getElementById('zip').value;
  document.getElementById('shipping-details').textContent = `${address}, ${city}, ${zip}`;

  // Populate payment details
  const cardNumber = document.getElementById('card-number').value;
  const maskedCard = `**** **** **** ${cardNumber.slice(-4)}`;
  document.getElementById('payment-details').textContent = `Card ending in ${maskedCard}`;

  // Clear the cart
  await clearCart();

  // Show confirmation page
  showPage('confirmation-page');
});

// Event listener for the "Back to Products" button
document.getElementById('back-to-products-btn').addEventListener('click', () => {
  showPage('product-page');
  renderProducts();
});
