
var BANNER_DEFAULTS = {
    home: 'hero-pooja.jpg',
    puja: 'pooja banner_divine.png',
    homam: 'homam banner final_divine.png',
    prasadham: 'prasadham banner final_divine.png',
    donate: 'food donation banner final _divine.jpeg',
    'about-hero': 'hero-pooja.jpg',
    'about-story': 'hero-pooja.jpg'
};

var DONATION_CARD_MAP = {
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

// ── Load catalog from Supabase ───────────────────────────────────────

async function loadCatalogFromSupabase() {
    try {
        var supabase = getSupabaseClient();

        // Products
        var prodResult = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!prodResult.error && Array.isArray(prodResult.data)) {
            PRODUCTS.length = 0;
            prodResult.data.forEach(function(r) {
                PRODUCTS.push({
                    id: r.id, name: r.name, category: r.category || '',
                    price: Number(r.price), image: r.image || '',
                    inStock: r.in_stock, rating: 4.8, reviews: 100
                });
            });
        }

        // Homams
        var homamResult = await supabase.from('homams').select('*').order('created_at', { ascending: false });
        if (!homamResult.error && Array.isArray(homamResult.data)) {
            HOMAMS.length = 0;
            homamResult.data.forEach(function(r) {
                HOMAMS.push({
                    id: r.id, name: r.name, description: r.description || '',
                    price: Number(r.price), image: r.image || ''
                });
            });
        }

        // Prasadhams
        var prasResult = await supabase.from('prasadhams').select('*').order('created_at', { ascending: false });
        if (!prasResult.error && Array.isArray(prasResult.data)) {
            PRASADHAMS.length = 0;
            prasResult.data.forEach(function(r) {
                PRASADHAMS.push({
                    id: r.id, name: r.name, temple: r.temple || '',
                    description: r.description || '', price: Number(r.price),
                    image: r.image || '', isSpecial: r.is_special || false,
                    rating: 4.8, reviews: 100
                });
            });
        }
    } catch (err) {
        console.error('loadCatalogFromSupabase error:', err);
    }
}

// ── Load banners from Supabase ───────────────────────────────────────

async function loadBannersFromSupabase() {
    try {
        var supabase = getSupabaseClient();
        var { data, error } = await supabase.from('settings').select('value').eq('key', 'banners').maybeSingle();
        if (!error && data && data.value && typeof data.value === 'object') {
            return data.value;
        }
    } catch (err) {
        console.error('loadBannersFromSupabase error:', err);
    }
    return {};
}

async function loadDonationsFromSupabase() {
    try {
        var supabase = getSupabaseClient();
        var { data, error } = await supabase.from('settings').select('value').eq('key', 'donations').maybeSingle();
        if (!error && data && data.value && typeof data.value === 'object') {
            return data.value;
        }
    } catch (err) {
        console.error('loadDonationsFromSupabase error:', err);
    }
    return null;
}

// ── Apply banners to site ────────────────────────────────────────────

function applySiteBanners(banners) {
    banners = banners || {};
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

    if (page === 'index.html' || page === '') {
        var homeImg = document.querySelector('.hero-sec .hero-right img');
        if (homeImg) {
            homeImg.src = banners.home || BANNER_DEFAULTS.home;
        }
    } else if (page === 'about-us.html') {
        var aboutHeroImg = document.querySelector('.hero-sec .hero-right img');
        if (aboutHeroImg) aboutHeroImg.src = banners['about-hero'] || BANNER_DEFAULTS['about-hero'];
        var aboutStoryImg = document.querySelector('.about-story-img img');
        if (aboutStoryImg) aboutStoryImg.src = banners['about-story'] || BANNER_DEFAULTS['about-story'];
    }

    var bannerConfigs = [
        { page: 'puja-products.html', key: 'puja', selector: '.pooja-products-hero', overlay: 'rgba(26, 24, 21, 0.12)' },
        { page: 'online-homam.html', key: 'homam', selector: '.inner-hero-section', overlay: 'rgba(26, 24, 21, 0.5)' },
        { page: 'temple-prasadham.html', key: 'prasadham', selector: '.inner-hero-section', overlay: 'rgba(26, 24, 21, 0.4)' },
        { page: 'donate-for-food.html', key: 'donate', selector: '.inner-hero-section', overlay: 'rgba(26, 24, 21, 0.4)' }
    ];

    bannerConfigs.forEach(function(cfg) {
        if (page !== cfg.page) return;
        var el = document.querySelector(cfg.selector);
        var image = banners[cfg.key] || BANNER_DEFAULTS[cfg.key];
        if (el && image) {
            el.style.backgroundImage = 'linear-gradient(' + cfg.overlay + ', ' + cfg.overlay + '), url(\'' + image + '\')';
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
        }
    });
}

// ── Render grids (unchanged logic) ───────────────────────────────────

function renderBestSellers() {
    var grid = document.getElementById('best-sellers-grid');
    if (!grid || typeof PRODUCTS === 'undefined') return;

    var items = PRODUCTS.filter(function(p) { return p.inStock !== false; }).slice(0, 5);
    grid.innerHTML = items.map(function(p) {
        return '<div class="product-card">' +
            '<button class="wishlist-btn ' + (window.appState.wishlist.includes(p.id) ? 'active' : '') + '" data-id="' + p.id + '" onclick="window.appState.toggleWishlist(\'' + p.id + '\')">' +
                '<i class="' + (window.appState.wishlist.includes(p.id) ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i>' +
            '</button>' +
            '<div class="product-img-wrapper">' +
                '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '">' +
            '</div>' +
            '<div class="product-details">' +
                '<h4>' + escapeHtml(p.name) + '</h4>' +
                '<div class="rating-container">' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star-half-stroke"></i>' +
                    '<span class="review-count">(' + (p.reviews || 100) + ')</span>' +
                '</div>' +
                '<div class="price-row" style="flex-wrap: wrap; gap: 8px;">' +
                    '<span class="price-val">₹' + p.price + '</span>' +
                    '<div style="display: flex; gap: 6px;">' +
                        '<button class="add-cart-btn" onclick="window.appState.addToCart({id: \'' + p.id + '\', name: \'' + escapeHtml(p.name) + '\', price: ' + p.price + ', image: \'' + escapeHtml(p.image) + '\'})" title="Add to Cart"><i class="fa-solid fa-cart-shopping"></i></button>' +
                        '<button class="buy-now-direct-btn" onclick="window.openBuyModal({name: \'' + escapeHtml(p.name) + '\', price: ' + p.price + ', image: \'' + escapeHtml(p.image) + '\'})">Buy Now</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function renderHomamGrid() {
    var grid = document.getElementById('homam-grid');
    if (!grid || typeof HOMAMS === 'undefined') return;

    grid.innerHTML = HOMAMS.map(function(h) {
        return '<div class="homam-details-card">' +
            '<img src="' + escapeHtml(h.image) + '" alt="' + escapeHtml(h.name) + '">' +
            '<div class="homam-details-content">' +
                '<h3>' + escapeHtml(h.name) + '</h3>' +
                '<p>' + escapeHtml(h.description) + '</p>' +
                '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--borders); padding-top: 15px;">' +
                    '<span class="price-val">₹' + h.price.toLocaleString('en-IN') + '</span>' +
                    '<button class="primary-btn" onclick="window.location.href=\'book-homam.html?homam=\' + encodeURIComponent(\'' + escapeHtml(h.name) + '\')" style="padding: 10px 20px; font-size: 0.85rem;">Book Now</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function renderPrasadhamGrid() {
    var grid = document.getElementById('prasadham-grid');
    if (!grid || typeof PRASADHAMS === 'undefined') return;

    grid.innerHTML = PRASADHAMS.map(function(p) {
        return '<div class="product-card">' +
            '<button class="wishlist-btn ' + (window.appState.wishlist.includes(p.id) ? 'active' : '') + '" data-id="' + p.id + '" onclick="window.appState.toggleWishlist(\'' + p.id + '\')">' +
                '<i class="' + (window.appState.wishlist.includes(p.id) ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i>' +
            '</button>' +
            '<div class="product-img-wrapper">' +
                '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '">' +
            '</div>' +
            '<div class="product-details">' +
                '<h4>' + escapeHtml(p.name) + '</h4>' +
                '<p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">' + escapeHtml(p.temple || '') + '</p>' +
                '<div class="rating-container">' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star"></i>' +
                    '<i class="fa-solid fa-star-half-stroke"></i>' +
                    '<span class="review-count">(' + (p.reviews || 100) + ')</span>' +
                '</div>' +
                '<div class="price-row" style="flex-wrap: wrap; gap: 8px;">' +
                    '<span class="price-val">₹' + p.price + '</span>' +
                    '<div style="display: flex; gap: 6px;">' +
                        '<button class="add-cart-btn" onclick="window.appState.addToCart({id: \'' + p.id + '\', name: \'' + escapeHtml(p.name) + '\', price: ' + p.price + ', image: \'' + escapeHtml(p.image) + '\'}, \'prasadham\')" title="Add to Cart"><i class="fa-solid fa-cart-shopping"></i></button>' +
                        '<button class="buy-now-direct-btn" onclick="window.openBuyModal({name: \'' + escapeHtml(p.name) + '\', price: ' + p.price + ', image: \'' + escapeHtml(p.image) + '\'})">Buy Now</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function applyDonationPrices(donations) {
    if (!donations) return;

    document.querySelectorAll('[data-donation-key]').forEach(function(card) {
        var key = card.dataset.donationKey;
        var price = donations[key];
        if (!price) return;

        var amountEl = card.querySelector('.amount');
        var btn = card.querySelector('button.primary-btn');
        var meta = DONATION_CARD_MAP[key];

        if (amountEl) {
            amountEl.textContent = '₹' + Number(price).toLocaleString('en-IN');
        }
        if (btn && meta) {
            btn.setAttribute('onclick', 'openDonationModal(\'' + meta.title + '\', ' + price + ')');
        }
    });
}

function renderTodaysSpecial() {
    var container = document.getElementById('todays-special-container');
    var section = document.getElementById('todays-special-section');
    if (!container || !section || typeof PRASADHAMS === 'undefined') return;

    var specialItem = PRASADHAMS.find(function(p) { return p.isSpecial === true; });
    if (specialItem) {
        section.style.display = 'block';
        container.innerHTML =
            '<div style="background-color: var(--white); border: 1px solid var(--borders); border-radius: 8px; padding: 40px; box-shadow: var(--shadow-medium); display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 40px; align-items: center;">' +
                '<div>' +
                    '<img src="' + escapeHtml(specialItem.image) + '" alt="' + escapeHtml(specialItem.name) + ' Special" style="border-radius: 8px; box-shadow: var(--shadow-light); width: 100%;">' +
                '</div>' +
                '<div>' +
                    '<span style="background-color: var(--primary-gold); color: var(--white); font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 12px; text-transform: uppercase;">TODAY\'S SPECIAL</span>' +
                    '<h3 style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 700; margin-top: 15px; margin-bottom: 12px;">' + escapeHtml(specialItem.name) + '</h3>' +
                    '<p style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.6;">' + escapeHtml(specialItem.description || 'Prepared with utmost devotion and offered to the deities today.') + '</p>' +
                    '<div style="background-color: var(--background); padding: 15px 25px; border-radius: 6px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">' +
                        '<div>' +
                            '<span style="font-size: 0.85rem; color: var(--text-secondary); display: block;">Price per pack</span>' +
                            '<span style="font-size: 1.6rem; font-weight: 700; color: var(--primary-gold);">₹' + specialItem.price + ' <span style="font-size: 0.95rem; font-weight: 500; color: var(--text-secondary);">/ Pack</span></span>' +
                        '</div>' +
                        '<div style="display: flex; gap: 8px;">' +
                            '<button class="secondary-btn" onclick="window.appState.addToCart({id: \'' + specialItem.id + '\', name: \'' + escapeHtml(specialItem.name) + '\', price: ' + specialItem.price + ', image: \'' + escapeHtml(specialItem.image) + '\'}, \'prasadham\')">Add to Cart</button>' +
                            '<button class="buy-modal-submit" onclick="window.openBuyModal({name: \'' + escapeHtml(specialItem.name) + '\', price: ' + specialItem.price + ', image: \'' + escapeHtml(specialItem.image) + '\'})" style="margin: 0; padding: 10px 20px; font-size: 0.9rem;">Buy Now</button>' +
                        '</div>' +
                    '</div>' +
                    '<div style="border-top: 1px solid var(--borders); padding-top: 20px; display: flex; align-items: center; gap: 12px;">' +
                        '<i class="fa-solid fa-gopuram" style="color: var(--primary-gold); font-size: 1.5rem;"></i>' +
                        '<div>' +
                            '<span style="font-size: 0.8rem; color: var(--text-secondary); display: block;">Offered at:</span>' +
                            '<strong style="font-size: 0.95rem; color: var(--text-dark);">' + escapeHtml(specialItem.temple || '') + '</strong>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
    } else {
        section.style.display = 'none';
        container.innerHTML = '';
    }
}

// ── DOMContentLoaded ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async function() {
    // Load catalog from Supabase
    await loadCatalogFromSupabase();

    // Apply banners
    var banners = await loadBannersFromSupabase();
    applySiteBanners(banners);

    // Load donations
    var donations = await loadDonationsFromSupabase();

    // Render all sections
    renderBestSellers();
    renderHomamGrid();
    renderPrasadhamGrid();
    renderTodaysSpecial();
    applyDonationPrices(donations);

    if (typeof renderCatalog === 'function') {
        renderCatalog();
    }
});
