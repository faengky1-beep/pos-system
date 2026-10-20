// Admin Panel Logic

// Check login status on load
document.addEventListener('DOMContentLoaded', () => {
    if (DB.isLoggedIn()) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Login functions
function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadOrders();
    loadProductsAdmin();
}

function login() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (DB.login(username, password)) {
        showDashboard();
        showNotification('ເຂົ້າລະບົບສຳເລັດ!');
    } else {
        showNotification('Username ຫຼື Password ບໍ່ຖືກຕ້ອງ');
    }
}

function logout() {
    DB.logout();
    showLogin();
}

// Navigation
function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(el => el.style.display = 'none');
    document.getElementById(section + '-section').style.display = 'block';

    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
}

// Orders Management
function loadOrders() {
    const container = document.getElementById('orders-list');
    const orders = DB.getOrders();

    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-message">ຍັງບໍ່ມີອໍເດີ້</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card" onclick="showOrderDetail('${order.id}')">
            <div class="order-card-id">${order.id}</div>
            <div class="order-card-info">
                <span class="order-card-customer">${order.customerName} - ${order.customerPhone}</span>
                <span class="order-card-total">${formatPrice(order.total)} ກີບ</span>
                <span class="order-card-date">${new Date(order.createdAt).toLocaleString('lo-LA')}</span>
            </div>
            <span class="order-status status-${order.status}">${getStatusText(order.status)}</span>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'ລຳຖ້າ',
        'preparing': 'ກຳລັງກຽມ',
        'shipping': 'ກຳລັງສົ່ງ',
        'delivered': 'ຈັດສົ່ງສຳເລັດ'
    };
    return statusMap[status] || status;
}

function showOrderDetail(orderId) {
    const order = DB.getOrder(orderId);
    if (!order) return;

    const content = document.getElementById('order-detail-content');
    content.innerHTML = `
        <div class="order-detail-section">
            <p class="order-detail-label">ເລກທີ່ອໍເດີ້</p>
            <p class="order-detail-value">${order.id}</p>
        </div>
        <div class="order-detail-section">
            <p class="order-detail-label">ຂໍ້ມູນລູກຄ້າ</p>
            <p class="order-detail-value">ຊື່: ${order.customerName}</p>
            <p class="order-detail-value">ເບີໂທ: ${order.customerPhone}</p>
            <p class="order-detail-value">ທີ່ຢູ່: ${order.customerAddress || '-'}</p>
        </div>
        <div class="order-detail-section">
            <p class="order-detail-label">ລາຍການສິນຄ້າ</p>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item-row">
                        <span>${item.name} x${item.quantity}</span>
                        <span>${formatPrice(item.price * item.quantity)} ກີບ</span>
                    </div>
                `).join('')}
            </div>
            <p class="order-detail-value" style="margin-top: 10px; font-weight: 700; color: #f1c40f;">
                ລວມ: ${formatPrice(order.total)} ກີບ
            </p>
        </div>
        <div class="order-detail-section">
            <p class="order-detail-label">ການຈ່າຍເງິນ</p>
            <p class="order-detail-value">${order.paymentMethod === 'cod' ? 'ເງິນສົດ (COD)' : 'Bank QR Code'}</p>
            ${order.slipImage ? `<img src="${order.slipImage}" style="max-width: 200px; margin-top: 10px; border-radius: 8px;" alt="Slip">` : ''}
        </div>
        ${order.location ? `
        <div class="order-detail-section">
            <p class="order-detail-label">ຕຳແໜ່ງຈັດສົ່ງ</p>
            <div class="map-view">
                <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${order.location.lng-0.01},${order.location.lat-0.01},${order.location.lng+0.01},${order.location.lat+0.01}&layer=mapnik&marker=${order.location.lat},${order.location.lng}" allowfullscreen></iframe>
            </div>
        </div>
        ` : ''}
    `;

    document.getElementById('order-detail-modal').classList.add('active');
}

function closeOrderDetail() {
    document.getElementById('order-detail-modal').classList.remove('active');
}

function updateOrderStatus(status) {
    const orderId = document.querySelector('.order-card:hover')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
    if (!orderId) {
        // Try to get from the currently displayed order detail
        const urlParams = new URLSearchParams(window.location.search);
        const currentOrderId = urlParams.get('order');
        if (currentOrderId) {
            DB.updateOrderStatus(currentOrderId, status);
            loadOrders();
            closeOrderDetail();
            showNotification('ອັບເດດສະຖານະສຳເລັດ!');
        }
        return;
    }
    DB.updateOrderStatus(orderId, status);
    loadOrders();
    closeOrderDetail();
    showNotification('ອັບເດດສະຖານະສຳເລັດ!');
}

// Products Management
function loadProductsAdmin() {
    const container = document.getElementById('products-admin-list');
    const products = DB.getProducts();

    container.innerHTML = products.map(product => `
        <div class="product-admin-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/250x150/2d2d44/ffffff?text=No+Image'">
            <div class="product-admin-card-body">
                <h3 class="product-admin-card-name">${product.name}</h3>
                <p class="product-admin-card-price">${formatPrice(product.price)} ກີບ</p>
                <p style="color: #95a5a6; margin-bottom: 10px;">ສະຕັອກ: ${product.stock}</p>
                <div class="product-admin-card-actions">
                    <button class="btn btn-blue" onclick="editProduct('${product.id}')">ແກ້ໄຂ</button>
                    <button class="btn btn-red" onclick="deleteProduct('${product.id}')">ລົບ</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showAddProduct() {
    document.getElementById('product-form-title').textContent = 'ເພີ່ມສິນຄ້າ';
    document.getElementById('edit-product-id').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-stock').value = '';
    document.getElementById('product-image').value = '';
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('product-form-modal').classList.add('active');
}

function editProduct(productId) {
    const product = DB.getProduct(productId);
    if (!product) return;

    document.getElementById('product-form-title').textContent = 'ແກ້ໄຂສິນຄ້າ';
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('image-preview').innerHTML = `<img src="${product.image}" alt="Preview">`;
    document.getElementById('product-form-modal').classList.add('active');
}

function closeProductForm() {
    document.getElementById('product-form-modal').classList.remove('active');
}

function saveProduct() {
    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const imageFile = document.getElementById('product-image').files[0];

    if (!name || isNaN(price) || isNaN(stock)) {
        showNotification('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ');
        return;
    }

    let imageUrl = '';
    if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
    }

    if (editId) {
        // Update existing product
        const existingProduct = DB.getProduct(editId);
        DB.updateProduct(editId, {
            name,
            price,
            stock,
            image: imageUrl || existingProduct.image
        });
        showNotification('ອັບເດດສິນຄ້າສຳເລັດ!');
    } else {
        // Add new product
        if (!imageUrl) {
            imageUrl = 'https://via.placeholder.com/300x200/3498db/ffffff?text=' + encodeURIComponent(name);
        }
        DB.addProduct({ name, price, stock, image: imageUrl });
        showNotification('ເພີ່ມສິນຄ້າສຳເລັດ!');
    }

    closeProductForm();
    loadProductsAdmin();
}

function deleteProduct(productId) {
    if (confirm('ທ່ານແນ່ຈະລົບສິນຄ້ານີ້?')) {
        DB.deleteProduct(productId);
        loadProductsAdmin();
        showNotification('ລົບສິນຄ້າສຳເລັດ!');
    }
}

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('lo-LA').format(price);
}

function showNotification(message) {
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
