
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
            alert(`Failed to upload image: ${error.message}`);
            return null;
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Unexpected error during upload:', err);
        alert(err.message || 'Unexpected error during upload.');
        return null;
    }
}

window.uploadToSupabase = uploadToSupabase;
