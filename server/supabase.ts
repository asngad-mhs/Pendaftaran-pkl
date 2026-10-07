import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default / runtime config
let supabaseUrl = process.env.SUPABASE_URL || '';
let supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let client: SupabaseClient | null = null;

export const BUCKET_NAME = 'pkl-documents';

export function initSupabase(): SupabaseClient | null {
  if (supabaseUrl && (supabaseAnonKey || supabaseServiceKey)) {
    try {
      client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: { persistSession: false },
      });
      console.log('✅ Supabase client initialized:', supabaseUrl);
      return client;
    } catch (e) {
      console.warn('⚠️ Could not initialize Supabase client:', e);
      client = null;
      return null;
    }
  }
  return null;
}

// Initial attempt
initSupabase();

export function getSupabaseClient(): SupabaseClient | null {
  return client;
}

export function updateSupabaseConfig(url: string, anonKey: string, serviceKey?: string) {
  supabaseUrl = url.trim();
  supabaseAnonKey = anonKey.trim();
  if (serviceKey) supabaseServiceKey = serviceKey.trim();
  return initSupabase();
}

export function getSupabaseStatus() {
  const isConnected = !!client;
  return {
    isConnected,
    mode: isConnected ? ('live' as const) : ('emulated' as const),
    url: supabaseUrl || 'Tersambung ke Penyimpanan Internal (Supabase Ready)',
    bucketName: BUCKET_NAME,
    hasServiceKey: !!supabaseServiceKey,
    message: isConnected
      ? 'Terhubung langsung ke Cloud Supabase & Storage Bucket'
      : 'Penyimpanan berkas aktif secara otomatis (Siap dihubungkan ke Supabase kapan saja)',
  };
}

/**
 * Uploads a file to Supabase Storage if configured, otherwise returns local data URL
 */
export async function uploadDocumentToStorage(
  fileName: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ url: string; provider: 'supabase' | 'secure_local'; path: string }> {
  if (client) {
    try {
      const sanitizedName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const path = `uploads/${sanitizedName}`;

      const { data, error } = await client.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!error && data) {
        const { data: publicData } = client.storage.from(BUCKET_NAME).getPublicUrl(path);
        return {
          url: publicData.publicUrl || `https://supabase.co/storage/v1/object/public/${BUCKET_NAME}/${path}`,
          provider: 'supabase',
          path,
        };
      }
    } catch (err) {
      console.warn('⚠️ Supabase upload failed, falling back to local storage:', err);
    }
  }

  // Fallback: create base64 data uri for instant preview and local resilience
  const base64 = buffer.toString('base64');
  const localUrl = `data:${mimeType};base64,${base64}`;
  return {
    url: localUrl,
    provider: 'secure_local',
    path: `local/${fileName}`,
  };
}

/**
 * SQL migration schema for Supabase table generation
 */
export const SUPABASE_SQL_SCHEMA = `-- ========================================================
-- SKEMA DATABASE SUPABASE UNTUK SISTEM PENDAFTARAN PKL
-- Salin dan jalankan skrip ini di Supabase SQL Editor
-- ========================================================

-- 1. Tabel Registrasi Siswa PKL
CREATE TABLE IF NOT EXISTS public.pkl_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_code VARCHAR(32) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  nisn VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  major VARCHAR(100) NOT NULL,
  target_department VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'MENUNGGU_VERIFIKASI',
  
  -- Data Sensitif Terenkripsi (AES-256-GCM)
  encrypted_nik TEXT NOT NULL,
  encrypted_phone TEXT NOT NULL,
  encrypted_parent_name TEXT NOT NULL,
  encrypted_parent_phone TEXT NOT NULL,
  encrypted_address TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  masked_nik VARCHAR(32),
  masked_phone VARCHAR(32),
  
  -- Catatan & AI Verification
  auto_verification_summary JSONB,
  reviewer_notes TEXT,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Dokumen Pendukung
CREATE TABLE IF NOT EXISTS public.pkl_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.pkl_registrations(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'MENUNGGU',
  ocr_score INT,
  validation_feedback TEXT,
  checksum VARCHAR(64),
  storage_provider VARCHAR(50) DEFAULT 'supabase',
  storage_path TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabel Laporan Aktivitas Pengguna (Audit Trail)
CREATE TABLE IF NOT EXISTS public.pkl_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR(50) NOT NULL, -- 'ADMIN', 'SISWA', 'SISTEM'
  actor_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(50),
  registration_code VARCHAR(32),
  severity VARCHAR(20) DEFAULT 'INFO',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabel Riwayat Notifikasi Email
CREATE TABLE IF NOT EXISTS public.pkl_email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_code VARCHAR(32) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  event VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'TERKIRIM',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  html_preview TEXT
);

-- 5. Storage Bucket Supabase: pkl-documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('pkl-documents', 'pkl-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Akses Storage (RLS)
CREATE POLICY "Public Access for PKL Documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'pkl-documents');

CREATE POLICY "Allow Document Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pkl-documents');
`;
