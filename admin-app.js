// Default Data
const DEFAULT_PRODUCT_IMAGE = 'product-image.jpg';
const DEFAULT_PRODUCTS = [
    { id: 'p1', name: 'Temple Brass Diya', category: 'diyas', price: 799, image: DEFAULT_PRODUCT_IMAGE },
    { id: 'p2', name: 'Pure Kumkum', category: 'kumkum', price: 149, image: DEFAULT_PRODUCT_IMAGE },
    { id: 'p3', name: 'Turmeric Powder', category: 'turmeric', price: 129, image: DEFAULT_PRODUCT_IMAGE }
];
const DEFAULT_HOMAMS = [
    { id: 'h1', name: 'Ganapathi Homam', description: 'Removes obstacles and brings wisdom.', price: 2100, image: DEFAULT_PRODUCT_IMAGE },
    { id: 'h2', name: 'Lakshmi Homam', description: 'Invites wealth and abundance.', price: 2500, image: DEFAULT_PRODUCT_IMAGE }
];
const DEFAULT_PRASADHAMS = [
    { id: 'pr1', name: 'Boondi Laddu', price: 180, image: DEFAULT_PRODUCT_IMAGE, temple: 'Arulmigu Lakshmi Narayana Perumal Temple' },
    { id: 'pr2', name: 'Sakkarai Pongal', price: 150, image: DEFAULT_PRODUCT_IMAGE, temple: 'Arulmigu Lakshmi Narayana Perumal Temple' }
];

let adminData = {
    products: JSON.parse(localStorage.getItem('divine_admin_products')) || DEFAULT_PRODUCTS,
    homams: JSON.parse(localStorage.getItem('divine_admin_homams')) || DEFAULT_HOMAMS,
    prasadhams: JSON.parse(localStorage.getItem('divine_admin_prasadhams')) || DEFAULT_PRASADHAMS,
    banners: JSON.parse(localStorage.getItem('divine_admin_banners')) || {},
    donations: JSON.parse(localStorage.getItem('divine_admin_donations')) || { 'don-1': 50, 'don-10': 500, 'don-50': 2500, 'don-100': 5000 }
};

document.addEventListener('DOMContentLoaded', () => {
    // Menu routing
    document.querySelectorAll('.admin-menu li').forEach(li => {
        li.addEventListener('click', () => {
            document.querySelectorAll('.admin-menu li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            const target = li.getAttribute('data-target');
            document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            document.getElementById('page-title').innerText = li.innerText;
        });
    });

    // File inputs Supabase upload
    ['prod', 'homam', 'pras'].forEach(prefix => {
        const fileInput = document.getElementById(`${prefix}-image-file`);
        if(fileInput) {
            fileInput.addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (file) {
                    const formIdMap = { 'prod': 'product', 'homam': 'homam', 'pras': 'prasadham' };
                    const btn = document.querySelector(`#form-${formIdMap[prefix]} button[type="submit"]`);
                    if (btn) {
                        btn.disabled = true;
                        btn.innerText = "Uploading image...";
                    }

                    const publicUrl = await uploadToSupabase(file);
                    if (publicUrl) {
                        document.getElementById(`${prefix}-image-base64`).value = publicUrl;
                    } else {
                        alert('Upload failed. Verify bucket name, policy, and credentials.');
                    }
                    // Re‑enable the form button regardless of success or failure
                    if (btn) {
                        btn.disabled = false;
                        btn.innerText = "Save Item";
                    }
                }
            });
        }
    });

    renderTables();
    renderBanners();
    renderDonations();
});

function renderTables() {
    // Products
    const prodTable = document.getElementById('table-products');
    prodTable.innerHTML = adminData.products.map(p => `
        <tr>
            <td><img src="${p.image}"></td>
            <td>${p.name} (${p.category})</td>
            <td>₹${p.price}</td>
            <td>
                <button class="action-btn" onclick="deleteItem('${p.id}', 'products')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // Homams
    const homamTable = document.getElementById('table-homams');
    homamTable.innerHTML = adminData.homams.map(h => `
        <tr>
            <td><img src="${h.image}"></td>
            <td>${h.name}</td>
            <td>₹${h.price}</td>
            <td>
                <button class="action-btn" onclick="deleteItem('${h.id}', 'homams')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    // Prasadhams
    const prasTable = document.getElementById('table-prasadhams');
    prasTable.innerHTML = adminData.prasadhams.map(pr => `
        <tr>
            <td><img src="${pr.image}"></td>
            <td>${pr.name}</td>
            <td>₹${pr.price}</td>
            <td>
                <button class="action-btn" onclick="deleteItem('${pr.id}', 'prasadhams')"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderBanners() {
    ['home', 'puja', 'homam', 'prasadham', 'donate', 'about-hero', 'about-story'].forEach(key => {
        if (adminData.banners[key]) {
            const preview = document.getElementById(`preview-${key}`);
            if (preview) preview.src = adminData.banners[key];
        }
    });
}

function renderDonations() {
    ['don-1', 'don-10', 'don-50', 'don-100'].forEach(id => {
        if (adminData.donations[id]) {
            document.getElementById(id).value = adminData.donations[id];
        }
    });
}

function saveItem(e, type) {
    e.preventDefault();
    let newItem = {};
    if (type === 'products') {
        const id = document.getElementById('prod-id').value || 'p' + Date.now();
        newItem = {
            id,
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            image: document.getElementById('prod-image-base64').value || DEFAULT_PRODUCT_IMAGE
        };
    } else if (type === 'homams') {
        const id = document.getElementById('homam-id').value || 'h' + Date.now();
        newItem = {
            id,
            name: document.getElementById('homam-name').value,
            description: document.getElementById('homam-desc').value,
            price: parseFloat(document.getElementById('homam-price').value),
            image: document.getElementById('homam-image-base64').value || DEFAULT_PRODUCT_IMAGE
        };
    } else if (type === 'prasadhams') {
        const id = document.getElementById('pras-id').value || 'pr' + Date.now();
        newItem = {
            id,
            name: document.getElementById('pras-name').value,
            temple: document.getElementById('pras-temple').value,
            price: parseFloat(document.getElementById('pras-price').value),
            image: document.getElementById('pras-image-base64').value || DEFAULT_PRODUCT_IMAGE
        };
    }

    const index = adminData[type].findIndex(i => i.id === newItem.id);
    if (index > -1) {
        if(!document.getElementById(`${type === 'products' ? 'prod' : type === 'homams' ? 'homam' : 'pras'}-image-base64`).value) {
            newItem.image = adminData[type][index].image; // Keep old image if not updated
        }
        adminData[type][index] = newItem;
    } else {
        adminData[type].push(newItem);
    }

    localStorage.setItem(`divine_admin_${type}`, JSON.stringify(adminData[type]));
    alert('Saved successfully!');
    resetForm(`form-${type === 'products' ? 'product' : type === 'homams' ? 'homam' : 'prasadham'}`);
    renderTables();
}

function editItem(id, type) {
    const item = adminData[type].find(i => i.id === id);
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

function deleteItem(id, type) {
    if (confirm('Are you sure you want to delete this item?')) {
        adminData[type] = adminData[type].filter(i => i.id !== id);
        localStorage.setItem(`divine_admin_${type}`, JSON.stringify(adminData[type]));
        renderTables();
    }
}

async function uploadBanner(event, type) {
    const file = event.target.files[0];
    if (file) {
        const preview = document.getElementById(`preview-${type}`);
        const oldSrc = preview.src;
        preview.src = "https://placehold.co/150x150?text=Uploading...";

        const publicUrl = await uploadToSupabase(file);
        if (publicUrl) {
            adminData.banners[type] = publicUrl;
            localStorage.setItem('divine_admin_banners', JSON.stringify(adminData.banners));
            preview.src = publicUrl;
            alert('Banner updated successfully!');
        } else {
            preview.src = oldSrc; // restore on failure
        }
    }
}

function saveDonationPrices(e) {
    e.preventDefault();
    adminData.donations = {
        'don-1': document.getElementById('don-1').value,
        'don-10': document.getElementById('don-10').value,
        'don-50': document.getElementById('don-50').value,
        'don-100': document.getElementById('don-100').value
    };
    localStorage.setItem('divine_admin_donations', JSON.stringify(adminData.donations));
    alert('Donation pricing saved successfully!');
}

function resetForm(formId) {
    document.getElementById(formId).reset();
    const idInput = document.getElementById(formId).querySelector('input[type="hidden"]');
    if(idInput) idInput.value = '';
}

function logoutAdmin() {
    sessionStorage.removeItem('divine_admin_auth');
    window.location.href = 'admin-login.html';
}
