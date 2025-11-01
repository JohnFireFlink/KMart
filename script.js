// --- Product Data ---
const products = [
  { id: 1, name: "Smartphone", price: 12000, img: "images/smartphone.png" },
  { id: 2, name: "Headphones", price: 2000, img: "images/headphones.png" },
  { id: 3, name: "Smart Watch", price: 5000, img: "images/smartwatch.png" },
  { id: 4, name: "Laptop", price: 55000, img: "images/laptop.png" },
  { id: 5, name: "Bluetooth Speaker", price: 1500, img: "images/bluetoothSpeaker.png" },
  { id: 6, name: "Neckband", price: 1200, img: "images/Neckband.png" },
  { id: 7, name: "Desktop Computer", price: 15000, img: "images/pc.png" },
  { id: 8, name: "DSLR Camera", price: 130000, img: "images/camera.png" },
  { id: 9, name: "PowerBank", price: 750, img: "images/powerbank.png" },
  { id: 10, name: "Keyboard", price: 400, img: "images/keyboard.png" }
];

// --- LOGIN ---
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "Admin" && pass === "Admin") {
    localStorage.setItem("user", user);
    window.location.href = "products.html";
  } else {
    showMessage("Invalid credentials! Use Username: Admin, Password: Admin", "error");
  }
}

// --- LOGOUT ---
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  window.location.href = "index.html";
}

// --- CHECK LOGIN ---
function checkLogin() {
  if (!localStorage.getItem("user")) {
    window.location.href = "index.html";
  } else {
    displayProducts(products);
    updateCartCount();
  }
}

// --- DISPLAY PRODUCTS ---
function displayProducts(list) {
  const container = document.getElementById("product-list");
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
  container.style.gap = "20px";

  list.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}" class="product-img">
        <h3>${p.name}</h3>
        <p>₹${p.price.toLocaleString()}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      </div>
    `;
  });
}

// --- SEARCH ---
function searchProduct() {
  const q = document.getElementById("search").value.toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q));
  displayProducts(filtered);
}

// --- CART MANAGEMENT ---
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = products.find(p => p.id === id);
  const exists = cart.find(p => p.id === id);
  if (exists) exists.qty += 1;
  else cart.push({ ...item, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showMessage(`${item.name} added to cart!`, "success");
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = document.getElementById("cart-count");
  if (count) count.innerText = cart.reduce((a, b) => a + b.qty, 0);
}

// --- LOAD CART ---
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-container");
  const orderSec = document.getElementById("order-section");

  if (!container || !orderSec) return;

  if (cart.length === 0) {
    container.innerHTML = "<h3>Your cart is empty!</h3>";
    orderSec.innerHTML = "";
    return;
  }

  let total = 0;
  container.innerHTML = "";

  cart.forEach((item) => {
    total += item.price * item.qty;
    container.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <span>${item.name}</span>
          <span>₹${(item.price * item.qty).toLocaleString()}</span>
        </div>
        <div class="cart-actions">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
          <button onclick="removeItem(${item.id})" class="remove-btn">🗑️</button>
        </div>
      </div>
    `;
  });

  orderSec.innerHTML = `
    <h3>Total: ₹${total.toLocaleString()}</h3>
    <div class="payment-options">
      <h4>Select Payment Method:</h4>
      <label><input type="radio" name="payment" value="COD" checked onclick="togglePaymentForm()"> Cash on Delivery</label>
      <label><input type="radio" name="payment" value="Credit Card" onclick="togglePaymentForm()"> Credit Card</label>
      <label><input type="radio" name="payment" value="Debit Card" onclick="togglePaymentForm()"> Debit Card</label>
      <label><input type="radio" name="payment" value="Net Banking" onclick="togglePaymentForm()"> Net Banking</label>
    </div>
    <div id="payment-form"></div>
    <button class="placeorder-btn" onclick="placeOrder()">Place Order</button>
  `;
}

function changeQty(id, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find(p => p.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(p => p.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
    updateCartCount();
  }
}

function removeItem(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(p => p.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
  showMessage("Item removed from cart", "info");
}

// --- DYNAMIC PAYMENT FORM ---
function togglePaymentForm() {
  const selected = document.querySelector('input[name="payment"]:checked').value;
  const formDiv = document.getElementById("payment-form");

  if (selected === "COD") {
    formDiv.innerHTML = "";
    return;
  }
  else if (selected === "Credit Card") {
  formDiv.innerHTML = `
    <div class="payment-form">
      <h3 class="payment-title">Enter Credit Card Details</h3>
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input id="cardNumber" type="text" class="form-control" placeholder="XXXX XXXX XXXX XXXX" maxlength="16" />
      </div>

      <div class="form-row">
        <div class="form-group half-width">
          <label for="cvv">CVV</label>
          <input id="cvv" type="password" class="form-control" placeholder="123" maxlength="3" />
        </div>
        <div class="form-group half-width">
          <label for="expMonth">Expiry (MM/YY)</label>
          <input id="expMonth" type="text" class="form-control" placeholder="MM/YY" maxlength="5" />
        </div>
      </div>
    </div>
  `;
  return;
  }
  else if (selected === "Debit Card") {
  formDiv.innerHTML = `
    <div class="payment-form">
      <h3 class="payment-title">Enter Debit Card Details</h3>
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input id="cardNumber" type="text" class="form-control" placeholder="XXXX XXXX XXXX XXXX" maxlength="16" />
      </div>

      <div class="form-row">
        <div class="form-group half-width">
          <label for="cvv">CVV</label>
          <input id="cvv" type="password" class="form-control" placeholder="123" maxlength="3" />
        </div>
        <div class="form-group half-width">
          <label for="expMonth">Expiry (MM/YY)</label>
          <input id="expMonth" type="text" class="form-control" placeholder="MM/YY" maxlength="5" />
        </div>
      </div>
    </div>
  `;
  return;
  }
  else if (selected === "Net Banking") {
  formDiv.innerHTML = `
    <div class="payment-form">
      <h3 class="payment-title">Net Banking Payment</h3>
      
      <div class="form-group">
        <label for="bankSelect">Select Bank</label>
        <select id="bankSelect" class="form-control">
          <option value="">--Select Bank--</option>
          <option value="Axis Bank">Axis Bank</option>
          <option value="ICICI Bank">ICICI Bank</option>
          <option value="SBI Bank">SBI Bank</option>
        </select>
      </div>

      <div id="netBankDetails" style="display:none;">
        <div class="form-group">
          <label for="customerId">Customer ID</label>
          <input id="customerId" type="text" class="form-control" placeholder="Customer ID" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="netPassword" type="password" class="form-control" placeholder="Password" />
        </div>
      </div>
    </div>
  `;

  // Show Customer ID and Password fields when a bank is selected
  const bankSelect = document.getElementById('bankSelect');
  const netBankDetails = document.getElementById('netBankDetails');

  bankSelect.addEventListener('change', () => {
    if (bankSelect.value) {
      netBankDetails.style.display = 'block';
    } else {
      netBankDetails.style.display = 'none';
    }
  });

  return;
}
}

// --- PLACE ORDER ---
async function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    showMessage("Your cart is empty!", "warning");
    return;
  }

  const payment = document.querySelector('input[name="payment"]:checked').value;
  const totalAmount = cart.reduce((a, b) => a + b.price * b.qty, 0);

  if (payment === "COD") {
    const orderId = Math.floor(100000 + Math.random() * 900000);
    showSuccess(`✅ Order placed successfully<br>Order ID: #${orderId}`);
  } else {
    await makePayment(payment, totalAmount);
  }
}

async function makePayment(payment, amount) {
  let body = { amount }; // common for all payment types

  if (payment === "Credit Card" || payment === "Debit Card") {
    const cardType = payment === "Credit Card" ? "credit" : "debit";
    const cardNumber = document.getElementById("cardNumber")?.value?.trim() || "";
    const cvv = document.getElementById("cvv")?.value?.trim() || "";
    const expMonth = document.getElementById("expMonth")?.value?.trim() || "";

    if (!cardNumber || !cvv || !expMonth) {
      showMessage("Please fill all card details!", "warning");
      return;
    }
    body = { ...body, cardType, cardNumber, cvv, expMonth };
   } 
   else if (payment === "Net Banking") {
    const bankName = document.getElementById("bankSelect")?.value?.trim() || "";
    const customerId = document.getElementById("customerId")?.value?.trim() || "";
    const password = document.getElementById("netPassword")?.value?.trim() || "";

    if (!bankName || !customerId || !password) {
      showMessage("Please fill all net banking details!", "warning");
      return;
    }

    body = { ...body, bankName, customerId, password };
  }

  try {
    const res = await fetch("http://localhost:8989/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const text = await res.text();

    if (res.status === 200) {
      const orderId = Math.floor(100000 + Math.random() * 900000);
      showSuccess(`✅ Payment Successful<br>Order ID: #${orderId}`);
    } else if (res.status === 400) {
      showError(`❌ Payment Failed<br>${text}`);
    } else {
      showError(`Unexpected error (${res.status})`);
    }
  } catch (err) {
    showError("Payment service unavailable. Please try again later.");
    console.error(err);
  }
}

function showSuccess(msg) {
  document.getElementById("cart-container").innerHTML = `
    <p class="success">${msg}</p>
    <p>Thank you for shopping with KMart.</p>`;
  document.getElementById("order-section").innerHTML = "";
  localStorage.removeItem("cart");
  updateCartCount();
}

function showError(msg) {
  document.getElementById("order-section").innerHTML = `<p class="error">${msg}</p>`;
}

// --- Toast Notification ---
function showMessage(message, type = "info") {
  let container = document.getElementById("message-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "message-container";
    document.body.appendChild(container);
  }

  const msg = document.createElement("div");
  msg.className = `toast-message ${type}`;
  msg.textContent = message;
  container.appendChild(msg);

  setTimeout(() => msg.classList.add("show"), 10);

  setTimeout(() => {
    msg.classList.remove("show");
    setTimeout(() => msg.remove(), 500);
  }, 5000);
}
