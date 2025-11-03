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

// --- Helper: Translation (fetches current language JSON from localStorage or URL) ---
async function t(key) {
  const lang = new URLSearchParams(window.location.search).get("lang") || localStorage.getItem("selectedLang") || "en";
  try {
    const response = await fetch(`lang/${lang}.json`);
    const translations = await response.json();
    return translations[key] || key;
  } catch (err) {
    console.error("Translation error:", err);
    return key;
  }
}

// --- LOGIN ---
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (user === "Admin" && pass === "Admin") {
    localStorage.setItem("user", user);
    window.location.href = "products.html";
  } else {
    t("invalid_credentials").then(msg => showMessage(msg, "error"));
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
async function displayProducts(list) {
  const container = document.getElementById("product-list");
  if (!container) return;

  container.innerHTML = "";
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fill, minmax(220px, 1fr))";
  container.style.gap = "20px";

  const addToCartText = await t("add_to_cart");

  list.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}" class="product-img">
        <h3>${p.name}</h3>
        <p>₹${p.price.toLocaleString()}</p>
        <button onclick="addToCart(${p.id})">${addToCartText}</button>
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
async function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = products.find(p => p.id === id);
  const exists = cart.find(p => p.id === id);
  if (exists) exists.qty += 1;
  else cart.push({ ...item, qty: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();

  const msg = await t("item_added_to_cart");
  showMessage(`${item.name} ${msg}`, "success");
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = document.getElementById("cart-count");
  if (count) count.innerText = cart.reduce((a, b) => a + b.qty, 0);
}

// --- LOAD CART ---
async function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-container");
  const orderSec = document.getElementById("order-section");

  if (!container || !orderSec) return;

  if (cart.length === 0) {
    const empty = await t("empty_cart");
    container.innerHTML = `<h3>${empty}</h3>`;
    orderSec.innerHTML = "";
    return;
  }

  let total = 0;
  container.innerHTML = "";

  const removeText = await t("remove");
  const totalText = await t("total");
  const placeOrderText = await t("place_order");
  const paymentMethodText = await t("select_payment_method");
  const codText = await t("cash_on_delivery");
  const ccText = await t("credit_card");
  const dcText = await t("debit_card");
  const nbText = await t("net_banking");

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
          <button onclick="removeItem(${item.id})" class="remove-btn">${removeText}</button>
        </div>
      </div>
    `;
  });

  orderSec.innerHTML = `
    <h3>${totalText}: ₹${total.toLocaleString()}</h3>
    <div class="payment-options">
      <h4>${paymentMethodText}</h4>
      <label><input type="radio" name="payment" value="COD" checked onclick="togglePaymentForm()"> ${codText}</label>
      <label><input type="radio" name="payment" value="Credit Card" onclick="togglePaymentForm()"> ${ccText}</label>
      <label><input type="radio" name="payment" value="Debit Card" onclick="togglePaymentForm()"> ${dcText}</label>
      <label><input type="radio" name="payment" value="Net Banking" onclick="togglePaymentForm()"> ${nbText}</label>
    </div>
    <div id="payment-form"></div>
    <button class="placeorder-btn" onclick="placeOrder()">${placeOrderText}</button>
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

async function removeItem(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(p => p.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
  const msg = await t("item_removed");
  showMessage(msg, "info");
}

// --- DYNAMIC PAYMENT FORM ---
async function togglePaymentForm() {
  const selected = document.querySelector('input[name="payment"]:checked').value;
  const formDiv = document.getElementById("payment-form");
  formDiv.innerHTML = "";

  const ccTitle = await t("enter_credit_details");
  const dcTitle = await t("enter_debit_details");
  const nbTitle = await t("net_banking_payment");
  const cardNumber = await t("card_number");
  const cvvText = await t("cvv");
  const expiry = await t("expiry");
  const selectBank = await t("select_bank");
  const custId = await t("customer_id");
  const payment_password = await t("payment_password");

  if (selected === "COD") return;

  if (selected === "Credit Card" || selected === "Debit Card") {
    const title = selected === "Credit Card" ? ccTitle : dcTitle;
    formDiv.innerHTML = `
      <div class="payment-form">
        <h3 class="payment-title">${title}</h3>
        <div class="form-group">
          <label for="cardNumber">${cardNumber}</label>
          <input id="cardNumber" type="text" class="form-control" placeholder="XXXX XXXX XXXX XXXX" maxlength="16" />
        </div>

        <div class="form-row">
          <div class="form-group half-width">
            <label for="cvv">${cvvText}</label>
            <input id="cvv" type="password" class="form-control" placeholder="123" maxlength="3" />
          </div>
          <div class="form-group half-width">
            <label for="expMonth">${expiry}</label>
            <input id="expMonth" type="text" class="form-control" placeholder="MM/YY" maxlength="5" />
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (selected === "Net Banking") {
    formDiv.innerHTML = `
      <div class="payment-form">
        <h3 class="payment-title">${nbTitle}</h3>
        <div class="form-group">
          <label for="bankSelect">${selectBank}</label>
          <select id="bankSelect" class="form-control">
            <option value="">--${selectBank}--</option>
            <option value="Axis Bank">Axis Bank</option>
            <option value="ICICI Bank">ICICI Bank</option>
            <option value="SBI Bank">SBI Bank</option>
          </select>
        </div>

        <div id="netBankDetails" style="display:none;">
          <div class="form-group">
            <label for="customerId">${custId}</label>
            <input id="customerId" type="text" class="form-control" placeholder="${custId}" />
          </div>
          <div class="form-group">
            <label for="netPassword">${payment_password}</label>
            <input id="netPassword" type="password" class="form-control" placeholder="${payment_password}" />
          </div>
        </div>
      </div>
    `;

    const bankSelect = document.getElementById("bankSelect");
    const netBankDetails = document.getElementById("netBankDetails");

    bankSelect.addEventListener("change", () => {
      netBankDetails.style.display = bankSelect.value ? "block" : "none";
    });
  }
}

// --- PLACE ORDER ---
async function placeOrder() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    const msg = await t("empty_cart");
    showMessage(msg, "warning");
    return;
  }

  const payment = document.querySelector('input[name="payment"]:checked').value;
  const totalAmount = cart.reduce((a, b) => a + b.price * b.qty, 0);

  if (payment === "COD") {
    const orderId = Math.floor(100000 + Math.random() * 900000);
    const success = await t("order_success");
    showSuccess(`✅ ${success}<br>Order ID: #${orderId}`);
  } else {
    await makePayment(payment, totalAmount);
  }
}

// --- PAYMENT API HANDLING ---
async function makePayment(payment, amount) {
  let body = { amount };

  if (payment === "Credit Card" || payment === "Debit Card") {
    const cardNumber = document.getElementById("cardNumber")?.value?.trim() || "";
    const cvv = document.getElementById("cvv")?.value?.trim() || "";
    const expMonth = document.getElementById("expMonth")?.value?.trim() || "";
    const cardType="credit";
    if(payment === "Debit Card")
    {
        cardType="debit";
    }

    if (!cardNumber || !cvv || !expMonth) {
      const msg = await t("fill_card_details");
      showMessage(msg, "warning");
      return;
    }
    body = { ...body, cardType, cardNumber, cvv, expMonth };
  } else if (payment === "Net Banking") {
    const bankName = document.getElementById("bankSelect")?.value?.trim() || "";
    const customerId = document.getElementById("customerId")?.value?.trim() || "";
    const password = document.getElementById("netPassword")?.value?.trim() || "";

    if (!bankName || !customerId || !password) {
      const msg = await t("fill_net_details");
      showMessage(msg, "warning");
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
      const msg = await t("payment_success");
      showSuccess(`✅ ${msg}<br>Order ID: #${orderId}`);
    } else {
      const msg = await t("payment_failed");
      showError(`❌ ${msg}<br>${text}`);
    }
  } catch (err) {
    const msg = await t("payment_unavailable");
    showError(msg);
    console.error(err);
  }
}

async function showSuccess(msg) {
  const thankYou = await t("thank_you");
  document.getElementById("cart-container").innerHTML = `
    <p class="success">${msg}</p>
    <p>${thankYou}</p>`;
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
