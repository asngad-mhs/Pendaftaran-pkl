import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Key,
  HardDrive,
  Copy,
  Check,
  Sparkles,
  Server,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { SupabaseConfigState } from '../types';
import { api } from '../services/api';

export const SupabaseConfigModal: React.FC = () => {
  const [status, setStatus] = useState<(SupabaseConfigState & { sqlSchema: string }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [url, setUrl] = useState<string>('');
  const [anonKey, setAnonKey] = useState<string>('');
  const [serviceKey, setServiceKey] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const loadStatus = async () => {
    try {
      const data = await api.getSupabaseStatus();
      setStatus(data);
      if (data.url && !data.url.includes('Penyimpanan')) {
        setUrl(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.updateSupabaseConfig({
        url,
        anonKey,
        serviceKey,
      });
      setMessage(res.message);
      await loadStatus();
    } catch (err: any) {
      setMessage('Gagal memperbarui konfigurasi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopySql = () => {
    if (status?.sqlSchema) {
      navigator.clipboard.writeText(status.sqlSchema);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Integrasi Database Supabase & Arsitektur Enkripsi
          </h1>
          <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-bold">
            AES-256 + Cloud Storage
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi konektivitas basis data Supabase, bucket storage berkas pendaftaran, serta skema enkripsi data sensitif.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Connection status card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">STATUS DATABASE</span>
              <h3 className="text-sm font-bold text-slate-900">
                {status?.isConnected ? 'Cloud Supabase Terhubung' : 'Penyimpanan Aktif'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">{status?.message}</p>
          <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-700 break-all">
            URL: {status?.url}
          </div>
        </div>

        {/* Bucket Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">SUPABASE STORAGE BUCKET</span>
              <h3 className="text-sm font-bold text-slate-900">pkl-documents</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Menyimpan berkas permohonan sekolah, CV portofolio, transkrip, surat wali, dan pas foto secara terorganisir.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-700">
            Bucket Policy: Public Read & Signed Uploads
          </div>
        </div>

        {/* Encryption card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block uppercase">ENKRIPSI PRIVASI</span>
              <h3 className="text-sm font-bold text-slate-900">AES-256-GCM</h3>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            NIK (16 digit), nomor WhatsApp siswa, nomor wali, dan alamat domisili dienkripsi otomatis sebelum disimpan.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[11px] font-mono text-slate-700">
            Key: SHA-256 derived 32-byte key + IV 96-bit
          </div>
        </div>
      </div>

      {/* Supabase Connection Setup Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Hubungkan Langsung ke Akun Cloud Supabase Anda
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Masukkan Project URL dan API Key dari dashboard Supabase (<span className="font-mono">Project Settings → API</span>).
        </p>

        {message && (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-lg text-xs font-semibold mb-4">
            {message}
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Project URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Anon Key (Public) *
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supabase Service Role Key (Opsional - Full Access)
              </label>
              <input
                type="password"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-xs transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              {saving ? 'Menghubungkan...' : 'Simpan & Tes Koneksi Supabase'}
            </button>
          </div>
        </form>
      </div>

      {/* SQL Migration Script Box */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Skrip SQL Migrasi Database & Storage Supabase
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Jalankan skrip berikut di <strong>Supabase SQL Editor</strong> untuk membuat seluruh tabel pendaftaran, audit logs, notifikasi email, dan storage bucket.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors flex-shrink-0"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSql ? 'Tersalin!' : 'Salin SQL'}
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
          {status?.sqlSchema || 'Memuat skema SQL...'}
        </pre>
      </div>
    </div>
  );
};
