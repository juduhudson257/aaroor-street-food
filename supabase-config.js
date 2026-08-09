
const SUPABASE_URL = 'https://xkgupqphbxvyxvetbxwd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uevivbeRjSALmV1_GAnw9w_BKsOXeIe';
const SUPABASE_BUCKET = 'DIVINE_VOICE';

let _supabaseClient = null;

function getSupabaseClient() {
    if (_supabaseClient) return _supabaseClient;
    const lib = window.supabase;
    if (!lib || typeof lib.createClient !== 'function') {
        throw new Error('Supabase library did not load. Check your internet connection and refresh the page.');
    }
    _supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _supabaseClient;
}

// ── Storage ──────────────────────────────────────────────────────────

async function uploadToSupabase(file, bucketName) {
    bucketName = bucketName || SUPABASE_BUCKET;
    var fileExt = file.name.split('.').pop();
    var fileName = Date.now() + '_' + Math.random().toString(36).substring(2) + '.' + fileExt;
    var filePath = 'public/' + fileName;

    var supabase = getSupabaseClient();
    var result = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (result.error) {
        console.error('Error uploading image to Supabase:', result.error);
        throw new Error('Image upload failed: ' + result.error.message);
    }

    var urlResult = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return urlResult.data.publicUrl;
}

// ── Products CRUD ────────────────────────────────────────────────────

async function fetchProducts() {
    var supabase = getSupabaseClient();
    var { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchProducts error:', error); throw error; }
    return (data || []).map(function(r) {
        return { id: r.id, name: r.name, category: r.category, price: Number(r.price), image: r.image || '', inStock: r.in_stock };
    });
}

async function upsertProduct(item) {
    var supabase = getSupabaseClient();
    var row = { id: item.id, name: item.name, category: item.category || '', price: item.price, image: item.image || '', in_stock: item.inStock !== false };
    var { data, error } = await supabase.from('products').upsert(row).select().single();
    if (error) { console.error('upsertProduct error:', error); throw error; }
    return data;
}

async function deleteProduct(id) {
    var supabase = getSupabaseClient();
    var { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { console.error('deleteProduct error:', error); throw error; }
}

// ── Homams CRUD ──────────────────────────────────────────────────────

async function fetchHomams() {
    var supabase = getSupabaseClient();
    var { data, error } = await supabase.from('homams').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchHomams error:', error); throw error; }
    return (data || []).map(function(r) {
        return { id: r.id, name: r.name, description: r.description || '', price: Number(r.price), image: r.image || '' };
    });
}

async function upsertHomam(item) {
    var supabase = getSupabaseClient();
    var row = { id: item.id, name: item.name, description: item.description || '', price: item.price, image: item.image || '' };
    var { data, error } = await supabase.from('homams').upsert(row).select().single();
    if (error) { console.error('upsertHomam error:', error); throw error; }
    return data;
}

async function deleteHomam(id) {
    var supabase = getSupabaseClient();
    var { error } = await supabase.from('homams').delete().eq('id', id);
    if (error) { console.error('deleteHomam error:', error); throw error; }
}

// ── Prasadhams CRUD ──────────────────────────────────────────────────

async function fetchPrasadhams() {
    var supabase = getSupabaseClient();
    var { data, error } = await supabase.from('prasadhams').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchPrasadhams error:', error); throw error; }
    return (data || []).map(function(r) {
        return { id: r.id, name: r.name, temple: r.temple || '', description: r.description || '', price: Number(r.price), image: r.image || '', isSpecial: r.is_special || false };
    });
}

async function upsertPrasadham(item) {
    var supabase = getSupabaseClient();
    var row = { id: item.id, name: item.name, temple: item.temple || '', description: item.description || '', price: item.price, image: item.image || '', is_special: item.isSpecial || false };
    var { data, error } = await supabase.from('prasadhams').upsert(row).select().single();
    if (error) { console.error('upsertPrasadham error:', error); throw error; }
    return data;
}

async function deletePrasadham(id) {
    var supabase = getSupabaseClient();
    var { error } = await supabase.from('prasadhams').delete().eq('id', id);
    if (error) { console.error('deletePrasadham error:', error); throw error; }
}

// ── Achievements CRUD ────────────────────────────────────────────────

async function fetchAchievements() {
    var supabase = getSupabaseClient();
    var { data, error } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
    if (error) { console.error('fetchAchievements error:', error); throw error; }
    return (data || []).map(function(r) {
        return { id: r.id, name: r.name || '', image: r.image || '' };
    });
}

async function upsertAchievement(item) {
    var supabase = getSupabaseClient();
    var row = { id: item.id, name: item.name || '', image: item.image || '' };
    var { data, error } = await supabase.from('achievements').upsert(row).select().single();
    if (error) { console.error('upsertAchievement error:', error); throw error; }
    return data;
}

async function deleteAchievement(id) {
    var supabase = getSupabaseClient();
    var { error } = await supabase.from('achievements').delete().eq('id', id);
    if (error) { console.error('deleteAchievement error:', error); throw error; }
}

// ── Settings (banners, donations) ────────────────────────────────────

async function saveSettingToSupabase(key, value) {
    var supabase = getSupabaseClient();
    var { error } = await supabase.from('settings').upsert({ key: key, value: value, updated_at: new Date().toISOString() });
    if (error) { console.error('saveSettingToSupabase error:', error); throw error; }
    return true;
}

async function getSettingFromSupabase(key) {
    var supabase = getSupabaseClient();
    var { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    if (error) { console.error('getSettingFromSupabase error:', error); return null; }
    return data ? data.value : null;
}

// ── Expose globally ──────────────────────────────────────────────────

window.getSupabaseClient = getSupabaseClient;
window.uploadToSupabase = uploadToSupabase;
window.fetchProducts = fetchProducts;
window.upsertProduct = upsertProduct;
window.deleteProduct = deleteProduct;
window.fetchHomams = fetchHomams;
window.upsertHomam = upsertHomam;
window.deleteHomam = deleteHomam;
window.fetchPrasadhams = fetchPrasadhams;
window.upsertPrasadham = upsertPrasadham;
window.deletePrasadham = deletePrasadham;
window.fetchAchievements = fetchAchievements;
window.upsertAchievement = upsertAchievement;
window.deleteAchievement = deleteAchievement;
window.saveSettingToSupabase = saveSettingToSupabase;
window.getSettingFromSupabase = getSettingFromSupabase;
