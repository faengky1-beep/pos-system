// Store Frontend Logic
let cart = JSON.parse(localStorage.getItem('pos_cart') || '[]');
let currentProduct = null;
let currentLocation = null;

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});

// Load and display products
function loadProducts() {
    const grid = document.getElementById('product-grid');
    const products = DB.getProducts();

    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-message">ບໍ່ມີສິນຄ້າ</p>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetail('${product.id}')">
            <img src="${product.image}" alt="${product.name}" class="product-card-image" onerror="this.src='https://via.placeholder.com/300x200/2d2d44/ffffff?text=No+Image'">
            <div class="product-card-body">
                <h3 class="product-card-name">${product.name}</h3>
                <p class="product-card-price">${formatPrice(product.price)} ກີບ</p>
                <p class="product-card-stock">ສະຕັອກ: ${product.stock} ອັນ</p>
            </div>
        </div>
    `).join('');
}

// Show product detail
function showProductDetail(productId) {
    const product = DB.getProduct(productId);
    if (!product) return;

    currentProduct = product;
    document.getElementById('product-detail-name').textContent = product.name;
    document.getElementById('product-detail-image').src = product.image;
    document.getElementById('product-detail-price').textContent = formatPrice(product.price);
    document.getElementById('product-detail-stock').textContent = product.stock;
    document.getElementById('product-modal').classList.add('active');
}

function closeProductDetail() {
    document.getElementById('product-modal').classList.remove('active');
    currentProduct = null;
}

// Cart functions
function addToCart(productId, quantity = 1) {
    const product = DB.getProduct(productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart();
    updateCartCount();
    showNotification('ເພີ່ມໃສ່ກະຕ່າແລ້ວ!');
}

function addToCartFromDetail() {
    if (currentProduct) {
        addToCart(currentProduct.id);
        closeProductDetail();
    }
}

function updateCartItem(productId, change) {
    const item = cart.find(item => item.productId === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.productId !== productId);
        }
    }
    saveCart();
    updateCartCount();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

function saveCart() {
    localStorage.setItem('pos_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Show cart modal
function showCart() {
    renderCart();
    document.getElementById('cart-modal').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-modal').classList.remove('active');
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-message">ກະຕ່າວ່າງເປົ່າ</p>';
        totalEl.textContent = '0';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60x60/2d2d44/ffffff?text=No'">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">${formatPrice(item.price)} ກີບ</p>
            </div>
            <div class="cart-item-quantity">
                <button class="qty-btn" onclick="updateCartItem('${item.productId}', -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateCartItem('${item.productId}', 1)">+</button>
                <button class="qty-btn" style="background-color: #e74c3c;" onclick="removeFromCart('${item.productId}')">&times;</button>
            </div>
        </div>
    `).join('');

    totalEl.textContent = formatPrice(getCartTotal());
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('ກະຕ່າວ່າງເປົ່າ');
        return;
    }
    closeCart();
    document.getElementById('checkout-modal').classList.add('active');
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.remove('active');
}

// Get location using HTML5 Geolocation
function getLocation() {
    const mapView = document.getElementById('map-view');
    mapView.innerHTML = '<p class="map-placeholder">ກຳລັງຊອກຫາຕຳແໜ່ງ...</p>';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                currentLocation = { lat, lng };
                displayMap(lat, lng);
            },
            (error) => {
                mapView.innerHTML = '<p class="map-placeholder">ບໍ່ສາມາດຊອກຫາຕຳແໜ່ງໄດ້</p>';
                showNotification('ບໍ່ສາມາດຊອກຫາຕຳແໜ່ງ GPS ໄດ້');
            }
        );
    } else {
        mapView.innerHTML = '<p class="map-placeholder">Browser ບໍ່ຮອງຮັບ GPS</p>';
        showNotification('Browser ບໍ່ຮອງຮັບ GPS');
    }
}

// Search location
function searchLocation() {
    const query = document.getElementById('map-search').value;
    if (query.length < 3) return;

    // Use Nominatim OpenStreetMap for geocoding
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=la`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);
                currentLocation = { lat, lng };
                displayMap(lat, lng);
            }
        })
        .catch(() => {
            showNotification('ບໍ່ພົບສະຖານທີ່');
        });
}

// Display map using OpenStreetMap
function displayMap(lat, lng) {
    const mapView = document.getElementById('map-view');
    const zoom = 15;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
    mapView.innerHTML = `<iframe src="${mapUrl}" allowfullscreen></iframe>`;
    document.getElementById('customer-address').value = `Lat: ${lat}, Lng: ${lng}`;
}

// Payment method toggle
document.addEventListener('change', (e) => {
    if (e.target.name === 'payment') {
        const qrPayment = document.getElementById('qr-payment');
        qrPayment.style.display = e.target.value === 'qr' ? 'block' : 'none';
    }
});

// Submit order
function submitOrder() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (!name || !phone) {
        showNotification('ກະລຸນາປ້ອນຊື່ ແລະ ເບີໂທ');
        return;
    }

    const slipFile = document.getElementById('payment-slip').files[0];
    let slipImage = null;
    if (slipFile) {
        slipImage = URL.createObjectURL(slipFile);
    }

    const order = {
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        paymentMethod: paymentMethod,
        slipImage: slipImage,
        items: cart,
        total: getCartTotal(),
        location: currentLocation
    };

    const savedOrder = DB.addOrder(order);

    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();

    // Show success
    document.getElementById('checkout-modal').classList.remove('active');
    document.getElementById('order-id').textContent = savedOrder.id;
    document.getElementById('success-modal').classList.add('active');

    // Reset form
    document.getElementById('customer-name').value = '';
    document.getElementById('customer-phone').value = '';
    document.getElementById('customer-address').value = '';
    document.getElementById('payment-slip').value = '';
}

function closeSuccess() {
    document.getElementById('success-modal').classList.remove('active');
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('lo-LA').format(price);
}

function showNotification(message) {
    // Simple notification
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2d2d44;
        color: #ffffff;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        border-left: 4px solid #3498db;
        animation: slideIn 0.3s ease;
    `;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Close modals on outside click
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
