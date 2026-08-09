-- Run this in Supabase Dashboard → SQL Editor (project: xkgupqphbxvyxvetbxwd)

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.homams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prasadhams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  temple TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL DEFAULT '',
  is_special BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prasadhams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON public.products;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_public_write" ON public.products;
CREATE POLICY "products_public_write" ON public.products FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_public_update" ON public.products;
CREATE POLICY "products_public_update" ON public.products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "products_public_delete" ON public.products;
CREATE POLICY "products_public_delete" ON public.products FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "homams_public_read" ON public.homams;
CREATE POLICY "homams_public_read" ON public.homams FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "homams_public_write" ON public.homams;
CREATE POLICY "homams_public_write" ON public.homams FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "homams_public_update" ON public.homams;
CREATE POLICY "homams_public_update" ON public.homams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "homams_public_delete" ON public.homams;
CREATE POLICY "homams_public_delete" ON public.homams FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "prasadhams_public_read" ON public.prasadhams;
CREATE POLICY "prasadhams_public_read" ON public.prasadhams FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "prasadhams_public_write" ON public.prasadhams;
CREATE POLICY "prasadhams_public_write" ON public.prasadhams FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "prasadhams_public_update" ON public.prasadhams;
CREATE POLICY "prasadhams_public_update" ON public.prasadhams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "prasadhams_public_delete" ON public.prasadhams;
CREATE POLICY "prasadhams_public_delete" ON public.prasadhams FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "settings_public_write" ON public.settings;
CREATE POLICY "settings_public_write" ON public.settings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "settings_public_update" ON public.settings;
CREATE POLICY "settings_public_update" ON public.settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "settings_public_delete" ON public.settings;
CREATE POLICY "settings_public_delete" ON public.settings FOR DELETE TO anon, authenticated USING (true);

-- Storage: allow public read + anon upload to DIVINE_VOICE/public/
DROP POLICY IF EXISTS "divine_voice_public_read" ON storage.objects;
CREATE POLICY "divine_voice_public_read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'DIVINE_VOICE');

DROP POLICY IF EXISTS "divine_voice_anon_upload" ON storage.objects;
CREATE POLICY "divine_voice_anon_upload" ON storage.objects FOR INSERT TO anon
  WITH CHECK (
    bucket_id = 'DIVINE_VOICE'
    AND lower((storage.foldername(name))[1]) = 'public'
    AND storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
  );
