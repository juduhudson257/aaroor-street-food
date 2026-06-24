// ============================================================
// ADMIN APP - DIVINE VOICE
// ============================================================

// Defaults
const DEFAULT_PRODUCT_IMAGE = 'product-image.jpg';

let adminData = {
    products:    JSON.parse(localStorage.getItem('divine_admin_products'))    || [],
    homams:      JSON.parse(localStorage.getItem('divine_admin_homams'))      || [],
    prasadhams:  JSON.parse(localStorage.getItem('divine_admin_prasadhams')) || [],
    achievements: JSON.parse(localStorage.getItem('divine_admin_achievements')) || [],
    banners:     JSON.parse(localStorage.getItem('divine_admin_banners'))     || {},
    donations:   JSON.parse(localStorage.getItem('divine_admin_donations'))   || { 'don-1': 50, 'don-10': 500, 'don-50': 2500, 'don-100': 5000 }
};

// ── Utility ──────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Toast ────────────────────────────────────────────────────
function showToast(message, type) {
    type = type || 'info';
    var bg = { success: '#28a745', error: '#dc3545', info: '#17a2b8' };
    var cont = document.getElementById('_toast_container');
    if (!cont) {
        cont = document.createElement('div');
        cont.id = '_toast_container';
        cont.style.cssText = 'position:fixed;top:24px;right:24px;z-index:99999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(cont);
    }
    var t = document.createElement('div');
    t.style.cssText = [
        'background:' + (bg[type] || '#333'),
        'color:#fff',
        'padding:14px 20px',
        'border-radius:8px',
        'box-shadow:0 4px 20px rgba(0,0,0,0.15)',
        'font-size:0.9rem',
        'min-width:220px',
        'opacity:0',
        'transform:translateY(-10px)',
        'transition:opacity 0.3s,transform 0.3s',
        'font-family:Inter,sans-serif',
        'font-weight:500'
    ].join(';');
    t.textContent = message;
    cont.appendChild(t);
    // Animate in
    setTimeout(function() { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; }, 10);
    // Animate out
    setTimeout(function() {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        setTimeout(function() { t.remove(); }, 300);
    }, 3000);
}

// ── Custom Confirm ────────────────────────────────────────────
function showConfirm(message, onYes) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99998;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML =
        '<div style="background:#fff;border-radius:10px;padding:36px 32px;max-width:400px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,0.2);font-family:Inter,sans-serif;">' +
            '<p style="margin:0 0 28px;font-size:1rem;color:#111;line-height:1.6;">' + escHtml(message) + '</p>' +
            '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
                '<button id="_conf_cancel" style="padding:10px 22px;border:1px solid #ccc;border-radius:6px;background:#fff;cursor:pointer;font-size:0.9rem;font-family:Inter,sans-serif;">Cancel</button>' +
                '<button id="_conf_ok" style="padding:10px 22px;border:none;border-radius:6px;background:#e53935;color:#fff;cursor:pointer;font-size:0.9rem;font-weight:700;font-family:Inter,sans-serif;">Delete</button>' +
            '</div>' +
        '</div>';
    document.body.appendChild(overlay);
    document.getElementById('_conf_ok').onclick = function() { overlay.remove(); onYes(); };
    document.getElementById('_conf_cancel').onclick = function() { overlay.remove(); };
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
}

// ── Render Tables ─────────────────────────────────────────────
function renderTables() {
    // --- Products ---
    var prodTbody = document.getElementById('table-products');
    if (prodTbody) {
        if (adminData.products.length === 0) {
            prodTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:30px;">No products added yet.</td></tr>';
        } else {
            prodTbody.innerHTML = adminData.products.map(function(p) {
                var inStock = p.inStock !== false;
                return '<tr>' +
                    '<td><img src="' + escHtml(p.image) + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;"></td>' +
                    '<td>' + escHtml(p.name) + '<br><small style="color:#888;">' + escHtml(p.category) + '</small></td>' +
                    '<td>&#8377;' + escHtml(String(p.price)) + '</td>' +
                    '<td style="white-space:nowrap;">' +
                        '<button onclick="toggleStock(\'' + escHtml(p.id) + '\')" style="' + stockBtnStyle(inStock) + '">' +
                            (inStock ? '&#128683; Out of Stock' : '&#9989; In Stock') +
                        '</button>' +
                        ' <button onclick="deleteItem(\'' + escHtml(p.id) + '\',\'products\')" style="' + deleteBtnStyle() + '">&#128465; Delete</button>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }
    }

    // --- Homams ---
    var homamTbody = document.getElementById('table-homams');
    if (homamTbody) {
        if (adminData.homams.length === 0) {
            homamTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:30px;">No homams added yet.</td></tr>';
        } else {
            homamTbody.innerHTML = adminData.homams.map(function(h) {
                return '<tr>' +
                    '<td><img src="' + escHtml(h.image) + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;"></td>' +
                    '<td>' + escHtml(h.name) + '</td>' +
                    '<td>&#8377;' + escHtml(String(h.price)) + '</td>' +
                    '<td><button onclick="deleteItem(\'' + escHtml(h.id) + '\',\'homams\')" style="' + deleteBtnStyle() + '">&#128465; Delete</button></td>' +
                '</tr>';
            }).join('');
        }
    }

    // --- Prasadhams ---
    var prasTbody = document.getElementById('table-prasadhams');
    if (prasTbody) {
        if (adminData.prasadhams.length === 0) {
            prasTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:30px;">No prasadhams added yet.</td></tr>';
        } else {
            prasTbody.innerHTML = adminData.prasadhams.map(function(pr) {
                return '<tr>' +
                    '<td><img src="' + escHtml(pr.image) + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;"></td>' +
                    '<td>' + escHtml(pr.name) + '</td>' +
                    '<td>&#8377;' + escHtml(String(pr.price)) + '</td>' +
                    '<td><button onclick="deleteItem(\'' + escHtml(pr.id) + '\',\'prasadhams\')" style="' + deleteBtnStyle() + '">&#128465; Delete</button></td>' +
                '</tr>';
            }).join('');
        }
    }

    // --- Achievements ---
    var achTbody = document.getElementById('table-achievements');
    if (achTbody) {
        if (adminData.achievements.length === 0) {
            achTbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#999;padding:30px;">No achievements added yet.</td></tr>';
        } else {
            achTbody.innerHTML = adminData.achievements.map(function(ach) {
                return '<tr>' +
                    '<td><img src="' + escHtml(ach.image) + '" style="width:80px;height:50px;object-fit:cover;border-radius:4px;"></td>' +
                    '<td>' + escHtml(ach.name || 'Untitled Achievement') + '</td>' +
                    '<td><button onclick="deleteItem(\'' + escHtml(ach.id) + '\',\'achievements\')" style="' + deleteBtnStyle() + '">&#128465; Delete</button></td>' +
                '</tr>';
            }).join('');
        }
    }
}

function stockBtnStyle(inStock) {
    var base = 'cursor:pointer;padding:7px 12px;border-radius:5px;font-size:0.8rem;font-weight:600;font-family:Inter,sans-serif;border:none;margin-right:4px;';
    return inStock
        ? base + 'background:#fff3cd;color:#856404;border:1px solid #ffc107;'
        : base + 'background:#d4edda;color:#155724;border:1px solid #28a745;';
}

function deleteBtnStyle() {
    return 'cursor:pointer;padding:7px 12px;border-radius:5px;font-size:0.8rem;font-weight:600;font-family:Inter,sans-serif;border:1px solid #f5c6cb;background:#fff5f5;color:#e53935;';
}

// ── Action Functions (GLOBAL) ─────────────────────────────────
function toggleStock(id) {
    var product = null;
    for (var i = 0; i < adminData.products.length; i++) {
        if (adminData.products[i].id === id) { product = adminData.products[i]; break; }
    }
    if (!product) { showToast('Product not found!', 'error'); return; }
    product.inStock = (product.inStock === false) ? true : false;
    localStorage.setItem('divine_admin_products', JSON.stringify(adminData.products));
    showToast(product.inStock ? 'Marked as In Stock.' : 'Marked as Out of Stock.', 'info');
    renderTables();
}

function deleteItem(id, type) {
    showConfirm('Are you sure you want to delete this item?', function() {
        adminData[type] = adminData[type].filter(function(i) { return i.id !== id; });
        localStorage.setItem('divine_admin_' + type, JSON.stringify(adminData[type]));
        renderTables();
        showToast('Item deleted successfully.', 'success');
    });
}

function editItem(id, type) {
    var item = null;
    for (var i = 0; i < adminData[type].length; i++) {
        if (adminData[type][i].id === id) { item = adminData[type][i]; break; }
    }
    if (!item) return;
    if (type === 'products') {
        document.getElementById('prod-id').value = item.id;
        document.getElementById('prod-name').value = item.name;
        document.getElementById('prod-category').value = item.category;
        document.getElementById('prod-price').value = item.price;
        document.getElementById('prod-image-base64').value = '';
    } else if (type === 'homams') {
        document.getElementById('homam-id').value = item.id;
        document.getElementById('homam-name').value = item.name;
        document.getElementById('homam-desc').value = item.description;
        document.getElementById('homam-price').value = item.price;
        document.getElementById('homam-image-base64').value = '';
    } else if (type === 'prasadhams') {
        document.getElementById('pras-id').value = item.id;
        document.getElementById('pras-name').value = item.name;
        document.getElementById('pras-temple').value = item.temple;
        document.getElementById('pras-price').value = item.price;
        document.getElementById('pras-image-base64').value = '';
    }
}

function saveItem(e, type) {
    e.preventDefault();
    var newItem = {};
    if (type === 'products') {
        var id = document.getElementById('prod-id').value || ('p' + Date.now());
        newItem = {
            id: id,
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            image: document.getElementById('prod-image-base64').value || DEFAULT_PRODUCT_IMAGE,
            inStock: true
        };
    } else if (type === 'homams') {
        var id = document.getElementById('homam-id').value || ('h' + Date.now());
        newItem = {
            id: id,
            name: document.getElementById('homam-name').value,
            description: document.getElementById('homam-desc').value,
            price: parseFloat(document.getElementById('homam-price').value),
            image: document.getElementById('homam-image-base64').value || DEFAULT_PRODUCT_IMAGE
        };
    } else if (type === 'prasadhams') {
        var id = document.getElementById('pras-id').value || ('pr' + Date.now());
        newItem = {
            id: id,
            name: document.getElementById('pras-name').value,
            temple: document.getElementById('pras-temple').value,
            price: parseFloat(document.getElementById('pras-price').value),
            image: document.getElementById('pras-image-base64').value || DEFAULT_PRODUCT_IMAGE
        };
    } else if (type === 'achievements') {
        var id = document.getElementById('ach-id').value || ('ach' + Date.now());
        var imgBase64 = document.getElementById('ach-image-base64').value;
        if (!imgBase64 && !document.getElementById('ach-id').value) {
            showToast('Image is required for achievements!', 'error');
            return;
        }
        newItem = {
            id: id,
            name: document.getElementById('ach-name').value || '',
            image: imgBase64 || ''
        };
    }

    var index = -1;
    for (var i = 0; i < adminData[type].length; i++) {
        if (adminData[type][i].id === newItem.id) { index = i; break; }
    }
    if (index > -1) {
        var prefix = type === 'products' ? 'prod' : type === 'homams' ? 'homam' : type === 'prasadhams' ? 'pras' : 'ach';
        if (!document.getElementById(prefix + '-image-base64').value) {
            newItem.image = adminData[type][index].image;
        }
        adminData[type][index] = newItem;
    } else {
        adminData[type].push(newItem);
    }

    localStorage.setItem('divine_admin_' + type, JSON.stringify(adminData[type]));
    showToast('Saved successfully!', 'success');
    var formSuffix = type === 'products' ? 'product' : type === 'homams' ? 'homam' : type === 'prasadhams' ? 'prasadham' : 'achievement';
    resetForm('form-' + formSuffix);
    renderTables();
}

function resetForm(formId) {
    var f = document.getElementById(formId);
    if (f) f.reset();
    var hidden = f ? f.querySelector('input[type="hidden"]') : null;
    if (hidden) hidden.value = '';
}

function logoutAdmin() {
    sessionStorage.removeItem('divine_admin_auth');
    sessionStorage.removeItem('divine_admin_token');
    sessionStorage.removeItem('divine_admin_ts');
    window.location.href = 'admin-login.html';
}

// ── Banners ───────────────────────────────────────────────────
function renderBanners() {
    ['home', 'puja', 'homam', 'prasadham', 'donate', 'about-hero', 'about-story'].forEach(function(key) {
        if (adminData.banners[key]) {
            var el = document.getElementById('preview-' + key);
            if (el) el.src = adminData.banners[key];
        }
    });
}

async function uploadBanner(event, type) {
    var file = event.target.files[0];
    if (!file) return;
    var preview = document.getElementById('preview-' + type);
    var oldSrc = preview ? preview.src : '';
    if (preview) preview.src = 'https://placehold.co/400x160?text=Uploading...';
    var publicUrl = await uploadToSupabase(file);
    if (publicUrl) {
        adminData.banners[type] = publicUrl;
        localStorage.setItem('divine_admin_banners', JSON.stringify(adminData.banners));
        if (preview) preview.src = publicUrl;
        showToast('Banner updated!', 'success');
    } else {
        if (preview) preview.src = oldSrc;
        showToast('Banner upload failed.', 'error');
    }
}

// ── Donations ─────────────────────────────────────────────────
function renderDonations() {
    ['don-1', 'don-10', 'don-50', 'don-100'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el && adminData.donations[id]) el.value = adminData.donations[id];
    });
}

function saveDonationPrices(e) {
    e.preventDefault();
    adminData.donations = {
        'don-1':   document.getElementById('don-1').value,
        'don-10':  document.getElementById('don-10').value,
        'don-50':  document.getElementById('don-50').value,
        'don-100': document.getElementById('don-100').value
    };
    localStorage.setItem('divine_admin_donations', JSON.stringify(adminData.donations));
    showToast('Donation pricing saved!', 'success');
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar menu routing
    document.querySelectorAll('.admin-menu li[data-target]').forEach(function(li) {
        li.addEventListener('click', function() {
            document.querySelectorAll('.admin-menu li').forEach(function(el) { el.classList.remove('active'); });
            li.classList.add('active');
            var target = li.getAttribute('data-target');
            document.querySelectorAll('.admin-panel').forEach(function(panel) { panel.classList.remove('active'); });
            var targetPanel = document.getElementById(target);
            if (targetPanel) targetPanel.classList.add('active');
            var pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.innerText = li.innerText.trim();
        });
    });

    // Image upload via Supabase
    ['prod', 'homam', 'pras', 'ach'].forEach(function(prefix) {
        var fileInput = document.getElementById(prefix + '-image-file');
        if (!fileInput) return;
        fileInput.addEventListener('change', async function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var formIdMap = { prod: 'product', homam: 'homam', pras: 'prasadham', ach: 'achievement' };
            var btn = document.querySelector('#form-' + formIdMap[prefix] + ' button[type="submit"]');
            if (btn) { btn.disabled = true; btn.innerText = 'Uploading...'; }
            var publicUrl = await uploadToSupabase(file);
            if (publicUrl) {
                document.getElementById(prefix + '-image-base64').value = publicUrl;
                showToast('Image uploaded!', 'success');
            } else {
                showToast('Upload failed. Check Supabase credentials.', 'error');
            }
            if (btn) { btn.disabled = false; btn.innerText = 'Save Item'; }
        });
    });

    renderTables();
    renderBanners();
    renderDonations();
});
