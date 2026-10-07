import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Terminal,
  Database,
  ShieldCheck,
  CheckCircle2,
  Mail,
  UserCheck,
  FileText,
  Upload,
  Key,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTab?: (tab: any) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, onSwitchTab }) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'student' | 'admin' | 'supabase' | 'encryption'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Panduan Pengoperasian Sistem PKL Terpadu</h2>
              <p className="text-xs text-slate-400">
                Langkah demi langkah menjalankan aplikasi, alur kerja siswa, dashboard admin, dan integrasi Supabase.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex space-x-2 sm:space-x-4 text-xs font-semibold overflow-x-auto no-scrollbar">
          {[
            { id: 'quickstart', label: '1. Menjalankan Server', icon: <Terminal className="w-3.5 h-3.5" /> },
            { id: 'student', label: '2. Alur Siswa (Pendaftaran)', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'admin', label: '3. Alur Admin & Verifikasi', icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: 'supabase', label: '4. Setup Supabase Cloud', icon: <Database className="w-3.5 h-3.5" /> },
            { id: 'encryption', label: '5. Keamanan & Audit Trail', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`py-3 px-2 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeSection === tab.id
                  ? 'border-sky-600 text-sky-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* SECTION 1: QUICKSTART */}
          {activeSection === 'quickstart' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-900">
                <h3 className="font-bold text-base text-sky-950 mb-1 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-600" />
                  Perintah Menjalankan Aplikasi
                </h3>
                <p className="text-xs text-sky-800">
                  Aplikasi ini berjalan sebagai server full-stack Express + Vite pada port <strong>3000</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">A. Perintah di Terminal:</h4>
                <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                  <div className="text-slate-500"># 1. Jalankan server pengembangan (Express API + Vite Dev Server)</div>
                  <div className="text-emerald-400 font-bold">npm run dev</div>
                  <div className="pt-2 text-slate-500"># 2. Build untuk produksi</div>
                  <div className="text-emerald-400 font-bold">npm run build</div>
                  <div className="pt-2 text-slate-500"># 3. Jalankan server produksi</div>
                  <div className="text-emerald-400 font-bold">npm run start</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">B. Kredensial Login Admin Demo:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <strong className="block text-slate-900">Super Admin</strong>
                    <div className="font-mono text-sky-700 mt-1">admin@instansi.go.id</div>
                    <div className="text-slate-500 mt-0.5">Password: <code className="font-mono font-bold">admin123</code></div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <strong className="block text-slate-900">Koordinator PKL</strong>
                    <div className="font-mono text-sky-700 mt-1">koordinator@pkl.id</div>
                    <div className="text-slate-500 mt-0.5">Password: <code className="font-mono font-bold">admin123</code></div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3 bg-white">
                    <strong className="block text-slate-900">Verifikator Dokumen</strong>
                    <div className="font-mono text-sky-700 mt-1">verifikator@pkl.id</div>
                    <div className="text-slate-500 mt-0.5">Password: <code className="font-mono font-bold">admin123</code></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ALUR SISWA */}
          {activeSection === 'student' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Alur Penggunaan untuk Siswa / Mahasiswa</h3>
              <ol className="space-y-3 list-decimal list-inside">
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Buka Menu "Pendaftaran Siswa":</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Isi data akademik (Nama, NISN 10 digit, Email, Asal Sekolah, Jurusan, Divisi Tujuan, Periode Mulai & Selesai). Anda juga dapat menekan tombol <strong>"Isi Data Contoh (Demo)"</strong> di kanan atas untuk pengujian cepat.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Isi Biodata Sensitif Terenkripsi (Langkah 2):</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Masukkan NIK (16 digit), No. WhatsApp, Nama Orang Tua, No. Kontak Wali, dan Alamat Rumah. Data ini langsung dienkripsi menggunakan standar <strong>AES-256-GCM</strong>.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Unggah 5 Dokumen Pendukung Wajib (Langkah 3):</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Unggah: 1) Surat Pengantar Resmi Sekolah, 2) CV & Portofolio, 3) Transkrip Nilai / Rapor, 4) Surat Izin Orang Tua, dan 5) Pas Foto Formal (3x4). Berkas disimpan ke Supabase Storage bucket <code>pkl-documents</code>.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Dapatkan Kode Registrasi & Notifikasi Email:</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Setelah dikirim, sistem akan menerbitkan Kode Registrasi (misal: <code>PKL-2026-8921</code>) dan mengirimkan surel bukti pendaftaran ke email siswa.
                  </p>
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Melacak Status & Mengunggah Revisi (Menu "Lacak Berkas"):</strong>
                  <p className="text-xs text-slate-600 mt-1">
                    Siswa dapat memasukkan Kode Registrasi atau NISN untuk melihat tahapan persetujuan. Jika statusnya <strong>Perlu Revisi</strong>, tombol <strong>"Unggah Perbaikan"</strong> akan otomatis muncul sehingga siswa bisa langsung memperbarui berkas.
                  </p>
                </li>
              </ol>
            </div>
          )}

          {/* SECTION 3: ALUR ADMIN */}
          {activeSection === 'admin' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Alur Penggunaan untuk Admin & Verifikator</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    1. Masuk ke Dashboard Admin
                  </h4>
                  <p className="text-xs text-slate-600">
                    Buka tab <strong>"Dashboard Admin"</strong>. Anda dapat melihat kartu metrik real-time: Total Pendaftar, Antrean Menunggu Verifikasi, Sedang Ditinjau, Memerlukan Revisi, dan Persentase Disetujui.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    2. Verifikasi Otomatis (Auto-Verify Engine)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Tekan tombol <strong>"Auto-Verify Seluruh Berkas"</strong> di kanan atas, atau buka berkas siswa dan klik <strong>"Jalankan Auto-Verify Ulang"</strong>. Sistem akan mengevaluasi kelengkapan dokumen, format foto, keabsahan NISN, dan kop surat, lalu memberikan Skor Integritas (0-100%).
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    3. Peninjauan Berkas & Viewer Interaktif
                  </h4>
                  <p className="text-xs text-slate-600">
                    Klik <strong>"Tinjau Berkas"</strong> pada siswa yang diinginkan. Anda dapat memperbesar (*zoom*), memutar dokumen, menandai dokumen sebagai <em>Valid</em> atau <em>Minta Revisi</em>, dan memeriksa hash SHA-256 berkas.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    4. Dekripsi Data Sensitif (AES-256)
                  </h4>
                  <p className="text-xs text-slate-600">
                    Pada tab <strong>"Biodata Sensitif Terenkripsi"</strong> di dalam modal peninjauan, tekan <strong>"Buka Dekripsi Data"</strong>. Data NIK dan kontak yang sebelumnya disensor akan ditampilkan secara transparan, dan tindakan dekripsi Anda langsung dicatat dalam Audit Trail.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    5. Menetapkan Keputusan & Mengirim Email Otomatis
                  </h4>
                  <p className="text-xs text-slate-600">
                    Pilih status: <strong>Disetujui</strong>, <strong>Perlu Revisi</strong>, atau <strong>Ditolak</strong>, tulis catatan verifikator, lalu tekan <strong>"Simpan Keputusan & Kirim Email"</strong>. Notifikasi surel HTML resmi akan dikirim seketika ke alamat email siswa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: SETUP SUPABASE */}
          {activeSection === 'supabase' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Panduan Menghubungkan ke Cloud Supabase</h3>
              <p className="text-xs text-slate-600">
                Aplikasi telah dilengkapi fallback penyimpanan aman otomatis. Jika Anda ingin menghubungkannya langsung ke proyek Supabase pribadi Anda, ikuti langkah mudah berikut:
              </p>

              <ol className="space-y-3 list-decimal list-inside text-xs text-slate-700">
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Buka Proyek Supabase:</strong> Masuk ke <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-600 underline">supabase.com</a> dan buat proyek baru.
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Jalankan Skrip Migrasi SQL:</strong> Buka tab <strong>"Supabase & Enkripsi"</strong> di web PKL ini, tekan <strong>"Salin SQL"</strong>, lalu tempel (*paste*) dan jalankan di <strong>SQL Editor</strong> dashboard Supabase Anda. Tabel <code>pkl_registrations</code>, <code>pkl_documents</code>, <code>pkl_activity_logs</code>, dan bucket <code>pkl-documents</code> akan terbuat otomatis.
                </li>
                <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong>Masukkan Kredensial API:</strong> Salin <strong>Project URL</strong> dan <strong>Anon Key</strong> dari <em>Project Settings → API</em> di Supabase, masukkan ke formulir di tab <strong>"Supabase & Enkripsi"</strong>, lalu tekan <strong>"Simpan & Tes Koneksi"</strong>.
                </li>
              </ol>
            </div>
          )}

          {/* SECTION 5: ENKRIPSI & AUDIT */}
          {activeSection === 'encryption' && (
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-900">Arsitektur Enkripsi & Modul Audit Trail</h3>
              
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                <strong>Standar Enkripsi AES-256-GCM:</strong>
                <p className="mt-1">
                  Setiap data sensitif (NIK 16 digit, No. WhatsApp siswa, No. HP wali, Alamat rumah) dienkripsi dengan kunci 256-bit turunan SHA-256 dan Initialization Vector (IV) 96-bit yang unik untuk setiap entri data. Tag otentikasi menjamin bahwa data tidak dapat diubah oleh pihak luar tanpa terdeteksi.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <strong className="text-slate-900 block">Modul Audit Trail (Audit Aktivitas):</strong>
                <p className="text-slate-600">
                  Setiap aktivitas tercatat secara otomatis di menu <strong>"Audit Aktivitas"</strong>, meliputi:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Upaya login dan logout admin.</li>
                  <li>Pengunggahan dokumen dan perhitungan hash SHA-256.</li>
                  <li>Dekripsi data sensitif (dilengkapi identitas admin dan IP peninjau).</li>
                  <li>Pembaruan status berkas siswa dan pengiriman email.</li>
                </ul>
                <p className="text-slate-600 pt-1">
                  Anda dapat menyaring log berdasarkan kategori dan mengunduh seluruh rekaman ke format <strong>CSV</strong> atau <strong>JSON</strong> untuk kebutuhan pelaporan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Sistem Pendaftaran PKL Terpadu · Dokumentasi Lengkap 2026
          </span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
