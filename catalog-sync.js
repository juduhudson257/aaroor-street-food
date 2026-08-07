
const BANNER_DEFAULTS = {
    home: 'hero-pooja.jpg',
    puja: 'pooja banner_divine.png',
    homam: 'homam banner final_divine.png',
    prasadham: 'prasadham banner final_divine.png',
    donate: 'food donation banner final _divine.jpeg',
    'about-hero': 'hero-pooja.jpg',
    'about-story': 'hero-pooja.jpg'
};

const DONATION_CARD_MAP = {
    'don-1': { title: 'Feed 1 Person', multiplier: 1 },
    'don-10': { title: 'Feed 10 People', multiplier: 10 },
    'don-50': { title: 'Feed 50 People', multiplier: 50 },
    'don-100': { title: 'Feed 100 People', multiplier: 100 }
};

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function loadJson(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function syncCatalogFromAdmin() {
    const adminProducts = loadJson('divine_admin_products');
    if (Array.isArray(adminProducts) && typeof PRODUCTS !== 'undefined') {
        const defaults = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
        PRODUCTS.length = 0;
        adminProducts.forEach(item => {
            PRODUCTS.push({
                rating: 4.8,
                reviews: 100,
                inStock: true,
                ...defaults[item.id],
                ...item
            });
        });
    }

    const adminHomams = loadJson('divine_admin_homams');
    if (Array.isArray(adminHomams) && typeof HOMAMS !== 'undefined') {
        const defaults = Object.fromEntries(HOMAMS.map(h => [h.id, h]));
        HOMAMS.length = 0;
        adminHomams.forEach(item => {
            HOMAMS.push({ ...defaults[item.id], ...item });
        });
    }

    const adminPrasadhams = loadJson('divine_admin_prasadhams');
    if (Array.isArray(adminPrasadhams) && typeof PRASADHAMS !== 'undefined') {
        const defaults = Object.fromEntries(PRASADHAMS.map(p => [p.id, p]));
        PRASADHAMS.length = 0;
        adminPrasadhams.forEach(item => {
            PRASADHAMS.push({
                rating: 4.8,
                reviews: 100,
                ...defaults[item.id],
                ...item
            });
        });
    }
}

function applySiteBanners() {
    const banners = loadJson('divine_admin_banners') || {};
    const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    if (page === 'index.html' || page === '') {
        const homeImg = document.querySelector('.hero-sec .hero-right img');
        if (homeImg) {
            homeImg.src = banners.home || BANNER_DEFAULTS.home;
        }
    } else if (page === 'about-us.html') {
        const aboutHeroImg = document.querySelector('.hero-sec .hero-right img');
        if (aboutHeroImg) aboutHeroImg.src = banners['about-hero'] || BANNER_DEFAULTS['about-hero'];
        const aboutStoryImg = document.querySelector('.about-story-img img');
        if (aboutStoryImg) aboutStoryImg.src = banners['about-story'] || BANNER_DEFAULTS['about-story'];
    }

    const bannerConfigs = [
        { page: 'puja-products.html', key: 'puja', selector: '.pooja-products-hero', overlay: 'rgba(26, 24, 21, 0.12)' },
        { page: 'online-homam.html', key: 'homam', selector: '.inner-hero-section', overlay: 'rgba(26, 24, 21, 0.5)' },
        { page: 'temple-prasadham.html', key: 'prasadham', selector: '.inner-hero-section', overlay: 'rgba(26, 24, 21, 0.4)' },
        { page: 'donate-for-food.html', key: 'donate', selector: '.inner-hero-section', overlay: 'rgba(26, 24, 21, 0.4)' }
    ];

    bannerConfigs.forEach(({ page: targetPage, key, selector, overlay }) => {
        if (page !== targetPage) return;
        const el = document.querySelector(selector);
        const image = banners[key] || BANNER_DEFAULTS[key];
        if (el && image) {
            el.style.backgroundImage = `linear-gradient(${overlay}, ${overlay}), url('${image}')`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
        }
    });
}

function renderBestSellers() {
    const grid = document.getElementById('best-sellers-grid');
    if (!grid || typeof PRODUCTS === 'undefined') return;

    const items = PRODUCTS.filter(p => p.inStock !== false).slice(0, 5);
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <button class="wishlist-btn ${window.appState.wishlist.includes(p.id) ? 'active' : ''}" data-id="${p.id}" onclick="window.appState.toggleWishlist('${p.id}')">
                <i class="${window.appState.wishlist.includes(p.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="product-img-wrapper">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
            </div>
            <div class="product-details">
                <h4>${escapeHtml(p.name)}</h4>
                <div class="rating-container">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star-half-stroke"></i>
                    <span class="review-count">(${p.reviews || 100})</span>
                </div>
                <div class="price-row" style="flex-wrap: wrap; gap: 8px;">
                    <span class="price-val">₹${p.price}</span>
                    <div style="display: flex; gap: 6px;">
                        <button class="add-cart-btn" onclick="window.appState.addToCart({id: '${p.id}', name: '${escapeHtml(p.name)}', price: ${p.price}, image: '${escapeHtml(p.image)}'})" title="Add to Cart"><i class="fa-solid fa-cart-shopping"></i></button>
                        <button class="buy-now-direct-btn" onclick="window.openBuyModal({name: '${escapeHtml(p.name)}', price: ${p.price}, image: '${escapeHtml(p.image)}'})">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderHomamGrid() {
    const grid = document.getElementById('homam-grid');
    if (!grid || typeof HOMAMS === 'undefined') return;

    grid.innerHTML = HOMAMS.map(h => `
        <div class="homam-details-card">
            <img src="${escapeHtml(h.image)}" alt="${escapeHtml(h.name)}">
            <div class="homam-details-content">
                <h3>${escapeHtml(h.name)}</h3>
                <p>${escapeHtml(h.description)}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--borders); padding-top: 15px;">
                    <span class="price-val">₹${h.price.toLocaleString('en-IN')}</span>
                    <button class="primary-btn" onclick="window.location.href='book-homam.html?homam=' + encodeURIComponent('${escapeHtml(h.name)}')" style="padding: 10px 20px; font-size: 0.85rem;">Book Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPrasadhamGrid() {
    const grid = document.getElementById('prasadham-grid');
    if (!grid || typeof PRASADHAMS === 'undefined') return;

    grid.innerHTML = PRASADHAMS.map(p => `
        <div class="product-card">
            <button class="wishlist-btn ${window.appState.wishlist.includes(p.id) ? 'active' : ''}" data-id="${p.id}" onclick="window.appState.toggleWishlist('${p.id}')">
                <i class="${window.appState.wishlist.includes(p.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
            <div class="product-img-wrapper">
                <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}">
            </div>
            <div class="product-details">
                <h4>${escapeHtml(p.name)}</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">${escapeHtml(p.temple || '')}</p>
                <div class="rating-container">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star-half-stroke"></i>
                    <span class="review-count">(${p.reviews || 100})</span>
                </div>
                <div class="price-row" style="flex-wrap: wrap; gap: 8px;">
                    <span class="price-val">₹${p.price}</span>
                    <div style="display: flex; gap: 6px;">
                        <button class="add-cart-btn" onclick="window.appState.addToCart({id: '${p.id}', name: '${escapeHtml(p.name)}', price: ${p.price}, image: '${escapeHtml(p.image)}'}, 'prasadham')" title="Add to Cart"><i class="fa-solid fa-cart-shopping"></i></button>
                        <button class="buy-now-direct-btn" onclick="window.openBuyModal({name: '${escapeHtml(p.name)}', price: ${p.price}, image: '${escapeHtml(p.image)}'})">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function applyDonationPrices() {
    const donations = loadJson('divine_admin_donations');
    if (!donations) return;

    document.querySelectorAll('[data-donation-key]').forEach(card => {
        const key = card.dataset.donationKey;
        const price = donations[key];
        if (!price) return;

        const amountEl = card.querySelector('.amount');
        const btn = card.querySelector('button.primary-btn');
        const meta = DONATION_CARD_MAP[key];

        if (amountEl) {
            amountEl.textContent = `₹${Number(price).toLocaleString('en-IN')}`;
        }
        if (btn && meta) {
            btn.setAttribute('onclick', `openDonationModal('${meta.title}', ${price})`);
        }
    });
}

function renderTodaysSpecial() {
    const container = document.getElementById('todays-special-container');
    const section = document.getElementById('todays-special-section');
    if (!container || !section || typeof PRASADHAMS === 'undefined') return;

    const specialItem = PRASADHAMS.find(p => p.isSpecial === true);
    if (specialItem) {
        section.style.display = 'block';
        container.innerHTML = `
            <div style="background-color: var(--white); border: 1px solid var(--borders); border-radius: 8px; padding: 40px; box-shadow: var(--shadow-medium); display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 40px; align-items: center;">
                <div>
                    <img src="${escapeHtml(specialItem.image)}" alt="${escapeHtml(specialItem.name)} Special" style="border-radius: 8px; box-shadow: var(--shadow-light); width: 100%;">
                </div>
                <div>
                    <span style="background-color: var(--primary-gold); color: var(--white); font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase;">TODAY'S SPECIAL</span>
                    <h3 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 700; margin-top: 15px; margin-bottom: 12px;">${escapeHtml(specialItem.name)}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">${escapeHtml(specialItem.description || 'Prepared with utmost devotion and offered to the deities today.')}</p>
                    
                    <div style="background-color: var(--background); padding: 15px 25px; border-radius: 6px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 0.85rem; color: var(--text-secondary); display: block;">Price per pack</span>
                            <span style="font-size: 1.6rem; font-weight: 700; color: var(--primary-gold);">₹${specialItem.price} <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary);">/ Pack</span></span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="secondary-btn" onclick="window.appState.addToCart({id: '${specialItem.id}', name: '${escapeHtml(specialItem.name)}', price: ${specialItem.price}, image: '${escapeHtml(specialItem.image)}'}, 'prasadham')">Add to Cart</button>
                            <button class="buy-modal-submit" onclick="window.openBuyModal({name: '${escapeHtml(specialItem.name)}', price: ${specialItem.price}, image: '${escapeHtml(specialItem.image)}'})" style="margin: 0; padding: 10px 20px; font-size: 0.9rem;">Buy Now</button>
                        </div>
                    </div>

                    <div style="border-top: 1px solid var(--borders); padding-top: 20px; display: flex; align-items: center; gap: 12px;">
                        <i class="fa-solid fa-gopuram" style="color: var(--primary-gold); font-size: 1.5rem;"></i>
                        <div>
                            <span style="font-size: 0.8rem; color: var(--text-secondary); display: block;">Offered at:</span>
                            <strong style="font-size: 0.95rem; color: var(--text-dark);">${escapeHtml(specialItem.temple || '')}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        section.style.display = 'none';
        container.innerHTML = '';
    }
}

const CLOUD_CATALOG_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fdd4de6750c25';

async function syncCatalogFromCloud() {
    try {
        const response = await fetch(CLOUD_CATALOG_URL);
        if (!response.ok) return;
        const resJson = await response.json();
        if (resJson && resJson.data) {
            const cloudData = resJson.data;
            if (Array.isArray(cloudData.products)) {
                localStorage.setItem('divine_admin_products', JSON.stringify(cloudData.products));
            }
            if (Array.isArray(cloudData.homams)) {
                localStorage.setItem('divine_admin_homams', JSON.stringify(cloudData.homams));
            }
            if (Array.isArray(cloudData.prasadhams)) {
                localStorage.setItem('divine_admin_prasadhams', JSON.stringify(cloudData.prasadhams));
            }
            if (cloudData.banners && typeof cloudData.banners === 'object') {
                localStorage.setItem('divine_admin_banners', JSON.stringify(cloudData.banners));
            }
            if (cloudData.donations && typeof cloudData.donations === 'object') {
                localStorage.setItem('divine_admin_donations', JSON.stringify(cloudData.donations));
            }
            if (Array.isArray(cloudData.achievements)) {
                localStorage.setItem('divine_admin_achievements', JSON.stringify(cloudData.achievements));
            }

            syncCatalogFromAdmin();
            applySiteBanners();
            renderBestSellers();
            renderHomamGrid();
            renderPrasadhamGrid();
            renderTodaysSpecial();
            applyDonationPrices();

            if (typeof renderCatalog === 'function') {
                renderCatalog();
            }
        }
    } catch (e) {
        console.warn('Cloud catalog sync fallback to local storage:', e);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    syncCatalogFromAdmin();
    applySiteBanners();
    renderBestSellers();
    renderHomamGrid();
    renderPrasadhamGrid();
    renderTodaysSpecial();
    applyDonationPrices();

    if (typeof renderCatalog === 'function') {
        renderCatalog();
    }

    syncCatalogFromCloud();
});
