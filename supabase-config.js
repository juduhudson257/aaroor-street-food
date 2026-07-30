
const SUPABASE_URL = 'https://kkorztusjlxmfclobgdc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hnF_UCHhlbm2rUeXzT28AQ_OEH6BDnt';
const SUPABASE_BUCKET = 'DIVINE_VOICE';

function getSupabaseClient() {
    const lib = window.supabase;
    if (!lib || typeof lib.createClient !== 'function') {
        throw new Error('Supabase library did not load. Check your internet connection and refresh the page.');
    }
    return lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function uploadToSupabase(file, bucketName = SUPABASE_BUCKET) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `public/${fileName}`;

    try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image to Supabase:', error);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Unexpected error during upload:', err);
        return null;
    }
}

async function saveSettingToSupabase(key, value) {
    try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
            .from('settings')
            .upsert({ key: key, value: value });
        if (error) {
            console.error('Error saving setting to Supabase:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Unexpected error saving setting:', err);
        return false;
    }
}

async function getSettingFromSupabase(key) {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .maybeSingle();
        if (error) {
            console.error('Error getting setting from Supabase:', error);
            return null;
        }
        return data ? data.value : null;
    } catch (err) {
        console.error('Unexpected error getting setting:', err);
        return null;
    }
}

window.uploadToSupabase = uploadToSupabase;
window.saveSettingToSupabase = saveSettingToSupabase;
window.getSettingFromSupabase = getSettingFromSupabase;
