// supabase-config.js

// Replace these with your actual Supabase project URL and anon key
const SUPABASE_URL = 'https://kkorztusjlxmfclobgdc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hnF_UCHhlbm2rUeXzT28AQ_OEH6BDnt';
const SUPABASE_BUCKET ='divine_voice_sx85fm_0'; // updated bucket name

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function uploadToSupabase(file, bucketName = SUPABASE_BUCKET) {
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image to Supabase:', error);
            alert('Failed to upload image. Make sure your Supabase credentials are correct and the bucket exists.');
            return null;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (err) {
        console.error('Unexpected error during upload:', err);
        return null;
    }
}

// Expose the upload function globally for admin-app.js
window.uploadToSupabase = uploadToSupabase;
