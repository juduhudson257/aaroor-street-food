// The Divine Voice - Global Application State & UI Interactions

// Sample Data Structures
const DEFAULT_PRODUCT_IMAGE = 'product-image.jpg';
const PRODUCTS = [];

const HOMAMS = [];

const PRASADHAMS = [];

// App State Manager
class AppState {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('divine_cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('divine_wishlist')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('divine_user')) || null;
        this.orders = JSON.parse(localStorage.getItem('divine_orders')) || [];
        this.selectedFilters = {
            categories: [],
            priceRange: '',
            availability: 'in-stock'
        };
        this.sortOption = 'popularity';
        this.searchQuery = '';
        this.currentCategoryTab = 'all';
    }

    // Cart Operations
    addToCart(item, type = 'product') {
        const cartItem = this.cart.find(i => i.id === item.id && i.type === type);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            this.cart.push({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                type: type,
                quantity: 1
            });
        }
        this.saveCart();
        this.showToast(`${item.name} added to cart!`);
    }

    removeFromCart(id, type = 'product') {
        this.cart = this.cart.filter(i => !(i.id === id && i.type === type));
        this.saveCart();
        this.showToast('Item removed from cart');
    }

    updateQuantity(id, type, quantity) {
        const item = this.cart.find(i => i.id === id && i.type === type);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
            this.saveCart();
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('divine_cart', JSON.stringify(this.cart));
        this.updateCartBadge();
        this.renderCartModal();
    }

    updateCartBadge() {
        const badges = document.querySelectorAll('.cart-count-badge');
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Wishlist Operations
    toggleWishlist(id) {
        const index = this.wishlist.indexOf(id);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.showToast('Removed from Wishlist');
        } else {
            this.wishlist.push(id);
            this.showToast('Added to Wishlist');
        }
        localStorage.setItem('divine_wishlist', JSON.stringify(this.wishlist));
        this.updateWishlistUI();
    }

    updateWishlistUI() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const id = btn.dataset.id;
            if (this.wishlist.includes(id)) {
                btn.classList.add('active');
                btn.querySelector('i').className = 'fa-solid fa-heart';
            } else {
                btn.classList.remove('active');
                btn.querySelector('i').className = 'fa-regular fa-heart';
            }
        });
        this.updateWishlistBadge();
        this.renderWishlistItems();
    }

    updateWishlistBadge() {
        const badges = document.querySelectorAll('.wishlist-count-badge');
        const count = this.wishlist.length;
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    renderWishlistItems() {
        const wishlistContainer = document.getElementById('wishlist-grid');
        if (!wishlistContainer) return;

        if (this.wishlist.length === 0) {
            wishlistContainer.innerHTML = `<div class="empty-state" style="text-align: center; grid-column: 1 / -1; padding: 40px;">
                <i class="fa-regular fa-heart" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 20px;"></i>
                <h3>Your Wishlist is Empty</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">You haven't added any items to your wishlist yet.</p>
                <a href="puja-products.html" class="primary-btn">Explore Products</a>
            </div>`;
            return;
        }

        const allItems = [...PRODUCTS, ...HOMAMS, ...PRASADHAMS];
        const wishlistedItems = allItems.filter(item => this.wishlist.includes(item.id));

        wishlistContainer.innerHTML = wishlistedItems.map(product => `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <img src="${product.image}" alt="${product.name}">
                    <button class="wishlist-btn ${this.wishlist.includes(product.id) ? 'active' : ''}" data-id="${product.id}" onclick="window.appState.toggleWishlist('${product.id}')" title="Wishlist">
                        <i class="${this.wishlist.includes(product.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category || 'Homam/Prasadham'}</span>
                    <h3>${product.name}</h3>
                    <div class="product-rating">
                        <i class="fa-solid fa-star"></i>
                        <span>${product.rating || '4.8'} (${product.reviews || '100'})</span>
                    </div>
                    <div class="product-bottom">
                        <span class="product-price">₹${product.price}</span>
                        ${product.id.startsWith('h') ? `<button class="primary-btn" onclick="window.location.href='online-homam.html'">Book Now</button>` : `<button class="primary-btn" onclick="window.appState.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>`}
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Auth Operations
    registerUser(name, email, password) {
        const users = JSON.parse(localStorage.getItem('divine_users_list')) || [];
        if (users.find(u => u.email === email)) {
            this.showToast('Email already registered!', 'error');
            return false;
        }
        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('divine_users_list', JSON.stringify(users));
        this.loginUser(email, password);
        return true;
    }

    loginUser(email, password) {
        const users = JSON.parse(localStorage.getItem('divine_users_list')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = { name: user.name, email: user.email };
            localStorage.setItem('divine_user', JSON.stringify(this.currentUser));
            this.updateUserUI();
            this.showToast(`Welcome back, ${user.name}!`);
            document.getElementById('auth-modal')?.classList.remove('active');
            return true;
        }
        this.showToast('Invalid credentials!', 'error');
        return false;
    }

    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('divine_user');
        this.updateUserUI();
        this.showToast('Logged out successfully');
    }

    updateUserUI() {
        const userBtn = document.getElementById('user-menu-btn');
        if (userBtn) {
            if (this.currentUser) {
                userBtn.innerHTML = `<div class="user-avatar">${this.currentUser.name[0].toUpperCase()}</div>`;
            } else {
                userBtn.innerHTML = `<i class="fa-regular fa-user"></i>`;
            }
        }
    }

    // Order Tracking & Checkout
    placeOrder(customerInfo) {
        const orderId = 'DV-' + Math.floor(100000 + Math.random() * 900000);
        const newOrder = {
            orderId: orderId,
            date: new Date().toLocaleDateString(),
            items: [...this.cart],
            total: this.getCartTotal(),
            status: 'Processing',
            customerInfo: customerInfo
        };
        this.orders.push(newOrder);
        localStorage.setItem('divine_orders', JSON.stringify(this.orders));
        this.clearCart();
        return orderId;
    }

    // Helper functions
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container') || this.createToastContainer();
        const iconClass = type === 'success'
            ? 'fa-circle-check'
            : type === 'error'
                ? 'fa-circle-xmark'
                : type === 'warning'
                    ? 'fa-triangle-exclamation'
                    : 'fa-circle-info';

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
            <div class="toast-content"><p>${message}</p></div>
            <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
        `;

        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        const removeToast = () => {
            toast.classList.remove('show');
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', removeToast);
        setTimeout(removeToast, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    renderCartModal() {
        const drawer = document.getElementById('cart-drawer');
        if (!drawer) return;
        const listContainer = drawer.querySelector('.cart-items-list');
        const subtotalEl = drawer.querySelector('.cart-subtotal-val');
        if (!listContainer || !subtotalEl) return;

        if (this.cart.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-cart-state">
                    <i class="fa-solid fa-shopping-bag"></i>
                    <p>Your cart is empty</p>
                    <a href="puja-products.html" class="primary-btn">Shop Products</a>
                </div>
            `;
            subtotalEl.textContent = '₹0';
            return;
        }

        listContainer.innerHTML = this.cart.map(item => `
            <div class="cart-drawer-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <span class="item-category">${item.type.toUpperCase()}</span>
                    <span class="item-price">₹${item.price}</span>
                    <div class="item-quantity-controls">
                        <button onclick="window.appState.changeQuantity('${item.id}', '${item.type}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.quantity}</span>
                        <button onclick="window.appState.changeQuantity('${item.id}', '${item.type}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="remove-item-btn" onclick="window.appState.removeItem('${item.id}', '${item.type}')">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        `).join('');

        subtotalEl.textContent = `₹${this.getCartTotal()}`;
    }

    changeQuantity(id, type, change) {
        const item = this.cart.find(i => i.id === id && i.type === type);
        if (item) {
            const newQty = item.quantity + change;
            if (newQty <= 0) {
                this.removeFromCart(id, type);
            } else {
                this.updateQuantity(id, type, newQty);
            }
        }
    }

    removeItem(id, type) {
        this.removeFromCart(id, type);
    }
}

// Instantiate Global State
window.appState = new AppState();

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI Syncs
    window.appState.updateCartBadge();
    window.appState.updateUserUI();
    window.appState.updateWishlistUI();
    window.appState.renderWishlistItems();

    // Sticky Header Scroll Effect
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }

    // Modal Toggles (Cart & Auth)
    setupModals();

    // Setup Testimonial Sliders
    setupTestimonialCarousels();
});

function setupModals() {
    // Cart Drawer Toggle
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');

    if (cartBtn && cartDrawerOverlay) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartDrawerOverlay.classList.add('active');
            window.appState.renderCartModal();
        });
    }
    if (closeCartBtn && cartDrawerOverlay) {
        closeCartBtn.addEventListener('click', () => {
            cartDrawerOverlay.classList.remove('active');
        });
    }
    // Click outside cart drawer to close
    if (cartDrawerOverlay) {
        cartDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === cartDrawerOverlay) {
                cartDrawerOverlay.classList.remove('active');
            }
        });
    }

    // Clerk Login Button handling moved to index.html to avoid duplicate listener conflicts
    // (clerkLoginBtn handler removed from app.js)

    // Auth Modal Toggle
    const userBtn = document.getElementById('user-menu-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthBtn = document.getElementById('close-auth-btn');

    if (userBtn && authModal) {
        // Custom auth modal handling removed; Clerk sign-in handles authentication.
// The following block is no longer needed:
// userBtn.addEventListener('click', (e) => {
//   e.preventDefault();
        // Removed legacy auth modal handling – now using Clerk for sign‑in
        userBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.appState.currentUser) {
                // Show dynamic user portal modal or profile settings (or log out choice)
                if (confirm(`Logged in as ${window.appState.currentUser.name}. Would you like to Logout?`)) {
                    window.appState.logoutUser();
                }
            } else {
                authModal.classList.add('active');
            }
        });
    }
    if (closeAuthBtn && authModal) {
        closeAuthBtn.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }
    // Click outside auth modal to close
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.classList.remove('active');
            }
        });
    }

    // Login/Register Form Toggle
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form-wrapper');
    const registerForm = document.getElementById('register-form-wrapper');

    if (showRegister && showLogin && loginForm && registerForm) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // Login & Register Form Submits
    const loginFormEl = document.getElementById('login-form');
    const registerFormEl = document.getElementById('register-form');

    if (loginFormEl) {
        loginFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginFormEl.querySelector('input[type="email"]').value;
            const password = loginFormEl.querySelector('input[type="password"]').value;
            window.appState.loginUser(email, password);
        });
    }

    if (registerFormEl) {
        registerFormEl.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = registerFormEl.querySelector('input[placeholder="Full Name"]').value;
            const email = registerFormEl.querySelector('input[placeholder="Email Address"]').value;
            const password = registerFormEl.querySelector('input[placeholder="Password"]').value;
            window.appState.registerUser(name, email, password);
        });
    }

    // Order Tracking Modal setup
    setupCheckoutAndOrderTracking();
}

function setupCheckoutAndOrderTracking() {
    // Checkout Modal Elements
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutBtn && checkoutModal) {
        checkoutBtn.addEventListener('click', () => {
            if (window.appState.cart.length === 0) {
                window.appState.showToast('Your cart is empty', 'error');
                return;
            }
            document.getElementById('cart-drawer-overlay').classList.remove('active');
            checkoutModal.classList.add('active');
            // Populate total
            document.getElementById('checkout-total-val').textContent = `₹${window.appState.getCartTotal()}`;
        });
    }

    if (closeCheckoutBtn && checkoutModal) {
        closeCheckoutBtn.addEventListener('click', () => {
            checkoutModal.classList.remove('active');
        });
    }
    // Click outside checkout modal to close
    if (checkoutModal) {
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) {
                checkoutModal.classList.remove('active');
            }
        });
    }

    if (checkoutForm && checkoutModal) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const customerInfo = {
                name: checkoutForm.querySelector('#cust-name').value,
                email: checkoutForm.querySelector('#cust-email').value,
                phone: checkoutForm.querySelector('#cust-phone').value,
                address: checkoutForm.querySelector('#cust-address').value
            };
            const orderId = window.appState.placeOrder(customerInfo);
            checkoutModal.classList.remove('active');
            window.appState.showToast(`Order Placed Successfully! Your Order ID is ${orderId}.`, 'success');
        });
    }

    // Search bar / tracking bar setup
    const searchForm = document.getElementById('header-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const q = searchForm.querySelector('input').value.trim();
            if (q.startsWith('DV-')) {
                // Track Order
                const order = window.appState.orders.find(o => o.orderId === q);
                if (order) {
                    window.appState.showToast(`Order Found! ID: ${order.orderId} | Status: ${order.status}`, 'success');
                } else {
                    window.appState.showToast(`Order ${q} not found. Please verify the ID.`, 'error');
                }
            } else if (q) {
                window.location.href = `puja-products.html?q=${encodeURIComponent(q)}`;
            }
        });
    }
}

function setupTestimonialCarousels() {
    const sliders = document.querySelectorAll('.testimonials-slider-container');
    sliders.forEach(slider => {
        const slides = slider.querySelectorAll('.testimonial-card');
        const dots = slider.querySelectorAll('.carousel-dot');
        let activeIdx = 0;

        if (slides.length <= 1) return;

        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            activeIdx = index;
        }

        dots.forEach((dot, idx) => {
            dot.addEventListener('click', () => showSlide(idx));
        });

        // Auto slide every 5 seconds
        setInterval(() => {
            let next = (activeIdx + 1) % slides.length;
            showSlide(next);
        }, 5000);
    });
}
