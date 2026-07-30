/**
 * buy-modal.js
 * Injects a "Buy Now" order details modal into every page.
 * Call window.openBuyModal(product) from any Buy Now button.
 * Admin WhatsApp: 918148147056
 */

(function () {
    const ADMIN_WHATSAPP = '918148147056';

    /* ── Inject the modal HTML once the DOM is ready ── */
    function injectModal() {
        if (document.getElementById('buy-now-modal')) return;

        const html = `
        <div class="buy-modal-overlay" id="buy-now-modal" role="dialog" aria-modal="true" aria-labelledby="buy-modal-title">
            <div class="buy-modal-container">
                <!-- Close -->
                <button class="buy-modal-close" id="buy-modal-close-btn" title="Close" aria-label="Close">
                    <i class="fa-solid fa-xmark"></i>
                </button>

                <!-- Header -->
                <div class="buy-modal-header">
                    <div class="buy-modal-icon"><i class="fa-brands fa-whatsapp"></i></div>
                    <h2 class="buy-modal-title" id="buy-modal-title">Order via WhatsApp</h2>
                    <p class="buy-modal-subtitle">Fill in your details and we'll confirm your order instantly on WhatsApp.</p>
                </div>

                <!-- Product summary strip -->
                <div class="buy-modal-product-strip" id="buy-modal-product-strip">
                    <img id="buy-modal-product-img" src="" alt="Product" class="buy-modal-product-img">
                    <div class="buy-modal-product-info">
                        <span class="buy-modal-product-name" id="buy-modal-product-name">Product</span>
                        <span class="buy-modal-product-price" id="buy-modal-product-price">₹0</span>
                    </div>
                    <div class="buy-modal-qty-wrap">
                        <button class="buy-modal-qty-btn" id="buy-modal-qty-minus" aria-label="Decrease quantity">−</button>
                        <span class="buy-modal-qty-val" id="buy-modal-qty-val">1</span>
                        <button class="buy-modal-qty-btn" id="buy-modal-qty-plus" aria-label="Increase quantity">+</button>
                    </div>
                </div>

                <!-- Form -->
                <form class="buy-modal-form" id="buy-modal-form" novalidate>
                    <div class="buy-modal-field">
                        <label for="bm-name"><i class="fa-solid fa-user"></i> Full Name <span class="req">*</span></label>
                        <input type="text" id="bm-name" placeholder="e.g. Ramesh Kumar" required autocomplete="name">
                    </div>
                    <div class="buy-modal-field">
                        <label for="bm-phone"><i class="fa-solid fa-phone"></i> Phone Number <span class="req">*</span></label>
                        <input type="tel" id="bm-phone" placeholder="e.g. 9876543210" required autocomplete="tel"
                               pattern="[6-9][0-9]{9}" maxlength="10">
                    </div>
                    <div class="buy-modal-field">
                        <label for="bm-email"><i class="fa-solid fa-envelope"></i> Email Address</label>
                        <input type="email" id="bm-email" placeholder="e.g. ramesh@gmail.com" autocomplete="email">
                    </div>
                    <div class="buy-modal-field">
                        <label for="bm-address"><i class="fa-solid fa-location-dot"></i> Delivery Address <span class="req">*</span></label>
                        <textarea id="bm-address" placeholder="House No., Street, City, State, Pincode" rows="3" required autocomplete="street-address"></textarea>
                    </div>
                    <div class="buy-modal-field">
                        <label for="bm-note"><i class="fa-solid fa-note-sticky"></i> Special Note (optional)</label>
                        <input type="text" id="bm-note" placeholder="Any special instructions...">
                    </div>

                    <!-- Total -->
                    <div class="buy-modal-total-row">
                        <span>Total Amount:</span>
                        <strong id="buy-modal-total">₹0</strong>
                    </div>

                    <button type="submit" class="buy-modal-submit" id="buy-modal-submit-btn">
                        <i class="fa-brands fa-whatsapp"></i>
                        Send Order on WhatsApp
                    </button>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        /* ── Wire up events ── */
        const overlay    = document.getElementById('buy-now-modal');
        const closeBtn   = document.getElementById('buy-modal-close-btn');
        const form       = document.getElementById('buy-modal-form');
        const minusBtn   = document.getElementById('buy-modal-qty-minus');
        const plusBtn    = document.getElementById('buy-modal-qty-plus');
        const qtyVal     = document.getElementById('buy-modal-qty-val');
        const totalEl    = document.getElementById('buy-modal-total');

        // Close on overlay click
        overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
        closeBtn.addEventListener('click', closeModal);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

        // Quantity controls
        minusBtn.addEventListener('click', () => {
            const n = parseInt(qtyVal.textContent);
            if (n > 1) {
                qtyVal.textContent = n - 1;
                updateTotal();
            }
        });
        plusBtn.addEventListener('click', () => {
            qtyVal.textContent = parseInt(qtyVal.textContent) + 1;
            updateTotal();
        });

        function updateTotal() {
            const price = parseInt(overlay.dataset.price || 0);
            const qty   = parseInt(qtyVal.textContent);
            totalEl.textContent = `₹${price * qty}`;
        }

        // Form submit → WhatsApp
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateForm()) return;

            const name    = document.getElementById('bm-name').value.trim();
            const phone   = document.getElementById('bm-phone').value.trim();
            const email   = document.getElementById('bm-email').value.trim();
            const address = document.getElementById('bm-address').value.trim();
            const note    = document.getElementById('bm-note').value.trim();

            const productName  = overlay.dataset.productName  || 'Product';
            const price        = parseInt(overlay.dataset.price || 0);
            const qty          = parseInt(qtyVal.textContent);
            const total        = price * qty;

            const orderId = 'DV-' + Math.floor(100000 + Math.random() * 900000);

            const message =
`🛕 *New Order – The Divine Voice* 🛕

🆔 *Order ID:* ${orderId}

🛒 *Product:* ${productName}
   Qty: ${qty}  |  Price: ₹${price} each
   *Subtotal: ₹${total}*

👤 *Customer Details:*
  • Name    : ${name}
  • Phone   : ${phone}${email ? `\n  • Email   : ${email}` : ''}
  • Address : ${address}${note ? `\n  • Note    : ${note}` : ''}

💰 *Total Payable: ₹${total}*

_Please confirm this order and arrange delivery._`;

            closeModal();

            // Show a brief toast if appState exists
            if (window.appState && window.appState.showToast) {
                window.appState.showToast('Redirecting to WhatsApp...', 'success');
            }

            setTimeout(() => {
                window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
            }, 600);
        });
    }

    function validateForm() {
        const name    = document.getElementById('bm-name').value.trim();
        const phone   = document.getElementById('bm-phone').value.trim();
        const address = document.getElementById('bm-address').value.trim();

        if (!name) { flashError('bm-name', 'Please enter your full name'); return false; }
        if (!phone || !/^[6-9][0-9]{9}$/.test(phone)) { flashError('bm-phone', 'Enter a valid 10-digit mobile number'); return false; }
        if (!address) { flashError('bm-address', 'Please enter your delivery address'); return false; }
        return true;
    }

    function flashError(fieldId, msg) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.add('buy-modal-field-error');
        field.focus();
        field.setAttribute('placeholder', msg);
        field.addEventListener('input', () => {
            field.classList.remove('buy-modal-field-error');
            field.removeAttribute('placeholder');
        }, { once: true });
        if (window.appState && window.appState.showToast) {
            window.appState.showToast(msg, 'error');
        }
    }

    /* ── Public API ── */
    window.openBuyModal = function (product) {
        injectModal();

        const overlay = document.getElementById('buy-now-modal');
        const price   = Number(product.price) || 0;

        // Populate product info
        overlay.dataset.price       = price;
        overlay.dataset.productName = product.name || 'Product';

        document.getElementById('buy-modal-product-img').src    = product.image || '';
        document.getElementById('buy-modal-product-img').alt    = product.name  || 'Product';
        document.getElementById('buy-modal-product-name').textContent  = product.name  || 'Product';
        document.getElementById('buy-modal-product-price').textContent = `₹${price}`;
        document.getElementById('buy-modal-qty-val').textContent       = '1';
        document.getElementById('buy-modal-total').textContent         = `₹${price}`;

        // Reset form
        document.getElementById('buy-modal-form').reset();
        document.querySelectorAll('.buy-modal-field-error').forEach(el => el.classList.remove('buy-modal-field-error'));

        // Show
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => document.getElementById('bm-name')?.focus(), 150);
    };

    function closeModal() {
        const overlay = document.getElementById('buy-now-modal');
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Auto-inject on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectModal);
    } else {
        injectModal();
    }
})();
