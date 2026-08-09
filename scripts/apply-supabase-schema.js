/**
 * Applies supabase/migrations/001_create_catalog.sql using the Supabase Management API.
 * Requires SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)
 * and SUPABASE_PROJECT_REF (xkgupqphbxvyxvetbxwd).
 *
 * Usage:
 *   set SUPABASE_ACCESS_TOKEN=your_token
 *   node scripts/apply-supabase-schema.js
 */
const fs = require('fs');
const path = require('path');

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'xkgupqphbxvyxvetbxwd';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function main() {
    if (!ACCESS_TOKEN) {
        console.error('Missing SUPABASE_ACCESS_TOKEN.');
        console.error('Run the SQL manually in Supabase Dashboard → SQL Editor:');
        console.error(path.join(__dirname, '..', 'supabase', 'migrations', '001_create_catalog.sql'));
        process.exit(1);
    }

    const sql = fs.readFileSync(
        path.join(__dirname, '..', 'supabase', 'migrations', '001_create_catalog.sql'),
        'utf8'
    );

    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
    });

    const body = await response.text();
    if (!response.ok) {
        console.error('Schema apply failed:', response.status, body);
        process.exit(1);
    }

    console.log('Schema applied successfully.');
    console.log(body);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
