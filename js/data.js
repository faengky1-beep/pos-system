// Data Layer - LocalStorage based database
const DB = {
    // Initialize database
    init() {
        if (!localStorage.getItem('pos_products')) {
            localStorage.setItem('pos_products', JSON.stringify(this.getDefaultProducts()));
        }
        if (!localStorage.getItem('pos_orders')) {
            localStorage.setItem('pos_orders', JSON.stringify([]));
        }
        if (!localStorage.getItem('pos_admin_logged_in')) {
            localStorage.setItem('pos_admin_logged_in', 'false');
        }
    },

    // Default products
    getDefaultProducts() {
        return [
            { id: '1', name: 'ເສື້ອຍືດຜູ້ຊາຍ', price: 150000, stock: 25, image: 'https://via.placeholder.com/300x200/3498db/ffffff?text=ເສື້ອຍືດ' },
            { id: '2', name: 'ກະໂປົງຜູ້ຍິງ', price: 85000, stock: 40, image: 'https://via.placeholder.com/300x200/e74c3c/ffffff?text=ກະໂປົງ' },
            { id: '3', name: 'ເກືອງຜູ້ຊາຍ', price: 120000, stock: 30, image: 'https://via.placeholder.com/300x200/f1c40f/ffffff?text=ເກືອງ' },
            { id: '4', name: 'ຖົງເທົ້າຜູ້ຍິງ', price: 95000, stock: 20, image: 'https://via.placeholder.com/300x200/9b59b6/ffffff?text=ຖົງເທົ້າ' },
            { id: '5', name: 'ໂທລະສັບມືຖື', price: 850000, stock: 15, image: 'https://via.placeholder.com/300x200/2ecc71/ffffff?text=ໂທລະສັບ' },
            { id: '6', name: 'ຫູຟັງບູທູດ', price: 250000, stock: 18, image: 'https://via.placeholder.com/300x200/1abc9c/ffffff?text=ຫູຟັງ' }
        ];
    },

    // Products
    getProducts() {
        return JSON.parse(localStorage.getItem('pos_products') || '[]');
    },

    getProduct(id) {
        return this.getProducts().find(p => p.id === id);
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = Date.now().toString();
        products.push(product);
        localStorage.setItem('pos_products', JSON.stringify(products));
        return product;
    },

    updateProduct(id, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            localStorage.setItem('pos_products', JSON.stringify(products));
            return products[index];
        }
        return null;
    },

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('pos_products', JSON.stringify(products));
    },

    // Orders
    getOrders() {
        return JSON.parse(localStorage.getItem('pos_orders') || '[]');
    },

    getOrder(id) {
        return this.getOrders().find(o => o.id === id);
    },

    addOrder(order) {
        const orders = this.getOrders();
        order.id = 'ORD-' + Date.now().toString().slice(-8);
        order.status = 'pending';
        order.createdAt = new Date().toISOString();
        orders.unshift(order);
        localStorage.setItem('pos_orders', JSON.stringify(orders));
        return order;
    },

    updateOrderStatus(id, status) {
        const orders = this.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].status = status;
            localStorage.setItem('pos_orders', JSON.stringify(orders));
            return orders[index];
        }
        return null;
    },

    // Admin Auth
    isLoggedIn() {
        return localStorage.getItem('pos_admin_logged_in') === 'true';
    },

    login(username, password) {
        if (username === 'admin' && password === 'admin') {
            localStorage.setItem('pos_admin_logged_in', 'true');
            return true;
        }
        return false;
    },

    logout() {
        localStorage.setItem('pos_admin_logged_in', 'false');
    }
};

// Initialize on load
DB.init();
