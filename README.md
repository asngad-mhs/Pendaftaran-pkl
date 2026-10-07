# Sistem Pendaftaran PKL & Verifikasi Berkas Terpadu

Platform pendaftaran Praktik Kerja Lapangan (PKL) terintegrasi **Frontend React (Vite)** dan **Backend API Full-Stack** dengan dukungan database & storage **Supabase**, dashboard pemantauan status persetujuan real-time, mesin verifikasi dokumen otomatis, notifikasi email otomatis, enkripsi data sensitif (AES-256-GCM), dan modul audit aktivitas pengguna.

---

## 🚀 Fitur Utama

1. **Portal Pendaftaran Siswa Multi-Langkah (Wizard Form)**
   - Formulir pendaftaran terstruktur untuk siswa SMK dan mahasiswa.
   - Pengisian data akademik, sekolah, jurusan, dan penempatan divisi magang.
   - Tombol *Demo Auto-Fill* untuk pengujian kilat.
   - Penerbitan Kode Registrasi unik otomatis (contoh: `PKL-2026-1042`).

2. **Perlindungan Privasi & Enkripsi Data Sensitif (AES-256-GCM)**
   - Bidang data privat (NIK 16 digit, nomor handphone siswa, nomor kontak orang tua, dan alamat lengkap) dienkripsi secara simetris sebelum disimpan.
   - Menggunakan kunci 256-bit turunan SHA-256, Initialization Vector (IV) 96-bit unik, dan authentication tag.
   - Tampilan default tersensor (*masked*). Dekripsi hanya dapat diakses oleh petugas terotorisasi dan setiap tindakan dekripsi dicatat dalam *Audit Trail*.

3. **Unggah Dokumen Pendukung & Integrasi Supabase Storage**
   - Mendukung 5 dokumen pendukung wajib:
     1. Surat Permohonan / Pengantar Resmi Sekolah (PDF/JPG)
     2. Curriculum Vitae (CV) & Portofolio (PDF)
     3. Transkrip Nilai / Rapor Semester Terakhir (PDF/JPG)
     4. Surat Persetujuan / Izin Orang Tua/Wali (PDF/JPG)
     5. Pas Foto Formal Berwarna 3x4 (JPG/PNG)
   - Disimpan ke bucket storage Supabase `pkl-documents`.
   - Dilengkapi kalkulasi hash integritas berkas **SHA-256**.

4. **Verifikasi Dokumen Otomatis (Auto-Verifier Engine)**
   - Mesin validasi heuristik dan integritas dokumen untuk mengevaluasi kelengkapan berkas, format pas foto, resolusi, keabsahan format NISN (10 digit sesuai standar Dapodik), dan deteksi kop surat.
   - Menghasilkan Skor Integritas (0–100%) dan rekomendasi otomatis (*TERIMA*, *PERLU_REVISI_DOKUMEN*, atau *TOLAK_BERKAS*).
   - Tombol *Batch Auto-Verify* untuk memproses seluruh antrean pendaftaran sekaligus.

5. **Dashboard Admin Real-Time & Peninjauan Berkas**
   - Pemantauan metrik KPI secara *real-time*: Total Pendaftar, Menunggu Verifikasi, Sedang Ditinjau, Memerlukan Revisi, dan Persentase Disetujui.
   - Fitur pencarian instan dan penyaringan berdasarkan status atau jurusan.
   - *Document Viewer* interaktif dengan fitur perbesaran (*zoom*), rotasi, dan validasi per berkas.

6. **Notifikasi Email Otomatis (Auto-Dispatch)**
   - Pengiriman surel HTML resmi secara otomatis saat:
     - Berkas pendaftaran baru diterima.
     - Berkas dinyatakan **Disetujui / Diterima**.
     - Berkas dinyatakan **Memerlukan Perbaikan / Revisi**.
     - Berkas **Ditolak**.
   - Dilengkapi menu *Log Pengiriman Email* dengan pratinjau tampilan surel di inbox dan tombol *Kirim Ulang*.

7. **Portal Lacak Berkas Mandiri & Unggah Ulang Dokumen Revisi**
   - Siswa dapat melacak proses seleksi berkas secara transparan menggunakan Kode Registrasi atau NISN.
   - Jika berkas berstatus **Perlu Revisi**, formulir unggah ulang langsung aktif sehingga siswa dapat memperbarui berkas tanpa mendaftar dari awal.

8. **Modul Laporan Aktivitas Pengguna (Audit Trail & Ekspor)**
   - Rekam jejak seluruh peristiwa: login/logout, pengunggahan berkas, pembaruan status, auto-verify, hingga dekripsi data sensitif.
   - Dilengkapi stempel waktu WIB, nama aktor, peran, alamat IP, dan tingkat keparahan (*INFO, SUCCESS, WARNING, CRITICAL*).
   - Fitur ekspor rekaman audit langsung ke format **CSV** dan **JSON**.

---

## 🛠️ Tumpukan Teknologi (Tech Stack)

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion.
- **Backend API:** Express, Tsx / Node.js, RESTful Architecture.
- **Database & Storage:** Supabase Client (`@supabase/supabase-js`), PostgreSQL / Supabase Storage (`pkl-documents`).
- **Kriptografi & Keamanan:** Node.js `crypto` (AES-256-GCM, SHA-256).

---

## 📦 Instalasi & Cara Menjalankan

### Prasyarat
- Node.js versi 18+ atau 20+
- NPM versi 9+

### Langkah Menjalankan
1. **Klon atau Buka Direktori Proyek:**
   ```bash
   git clone <repo-url>
   cd <nama-folder>
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan (Opsional):**
   Salin file `.env.example` ke `.env` jika ingin menghubungkan langsung ke Supabase Cloud:
   ```bash
   cp .env.example .env
   ```

4. **Jalankan Aplikasi (Development Mode):**
   ```bash
   npm run dev
   ```
   Buka browser di: **`http://localhost:3000`**

5. **Build untuk Produksi:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Kredensial Akun Demonstrasi (Admin)

Gunakan tombol **"Login Admin"** di navigasi kanan atas atau pilih salah satu akun demonstrasi siap pakai:

| Peran (Role) | Email | Kata Sandi | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@instansi.go.id` | `admin123` | Akses penuh, dekripsi data AES-256, ekspor laporan, setup Supabase. |
| **Koordinator PKL** | `koordinator@pkl.id` | `admin123` | Persetujuan/penolakan berkas, pengiriman notifikasi email, kuota divisi. |
| **Verifikator Dokumen** | `verifikator@pkl.id` | `admin123` | Eksekusi Auto-Verify dokumen, review berkas, meminta revisi. |

---

## 🗄️ Konfigurasi Database & Storage Supabase

Sistem telah memiliki *fallback storage* otomatis sehingga langsung aktif tanpa konfigurasi tambahan. Untuk menyambungkannya ke proyek Supabase pribadi:

1. Buat proyek baru di [Supabase Console](https://supabase.com).
2. Buka menu **Supabase & Enkripsi** di navigasi aplikasi PKL.
3. Klik **Salin SQL** dan jalankan skrip migrasi tersebut pada **SQL Editor** di dashboard Supabase Anda:
   - Membuat tabel: `pkl_registrations`, `pkl_documents`, `pkl_activity_logs`, dan `pkl_email_notifications`.
   - Membuat bucket: `pkl-documents` dengan kebijakan akses publik dan unggah terverifikasi.
4. Salin **Project URL** dan **Anon Key** dari menu *Project Settings → API* di Supabase ke form konfigurasi aplikasi, lalu klik **Simpan & Tes Koneksi**.

---

## 🛡️ Skema Enkripsi & Privasi

Data sensitif disimpan menggunakan enkripsi terotentikasi **AES-256-GCM**:
- Kunci enkripsi diturunkan dari master secret menggunakan **SHA-256** (32 byte).
- Setiap enkripsi menghasilkan **Initialization Vector (IV)** 96-bit acak dan **Authentication Tag** 128-bit untuk mencegah manipulasi data.
- Nilai tersimpan dalam database berformat ciphertext terisolasi, sementara antarmuka pengguna hanya menampilkan nilai tersensor (contoh: `3302••••••••0002`).

---

## 📑 Struktur Direktori Proyek

```
├── .env.example              # Contoh variabel lingkungan
├── index.html                # Entry point HTML aplikasi
├── metadata.json             # Metadata konfigurasi applet
├── package.json              # Daftar dependensi & script NPM
├── server.ts                 # Backend Express & proxy API full-stack
├── server/
│   ├── autoVerifier.ts       # Mesin validasi dokumen otomatis (Auto-Verifier)
│   ├── db.ts                 # Repository database, seed pendaftar, & audit log
│   ├── emailService.ts       # Template & dispatcher email HTML otomatis
│   ├── encryption.ts         # Modul enkripsi AES-256-GCM, masking, & hashing
│   └── supabase.ts           # Inisialisasi Supabase client & bucket storage
├── src/
│   ├── App.tsx               # Komponen utama & state router navigasi
│   ├── index.css             # Tailwind CSS global styles
│   ├── main.tsx              # Entry point React Vite
│   ├── types.ts              # Definisi tipe TypeScript
│   ├── services/
│   │   └── api.ts            # Client SDK pemanggil endpoint REST API
│   └── components/
│       ├── Navbar.tsx                   # Navigasi utama & session indicator
│       ├── StudentRegistrationWizard.tsx# Formulir pendaftaran siswa multi-tahap
│       ├── StudentTrackingPortal.tsx    # Portal lacak berkas mandiri & re-upload
│       ├── AdminDashboard.tsx           # Dashboard KPI & pemantauan status
│       ├── ApplicantDetailModal.tsx     # Modal review berkas, viewer, & dekripsi
│       ├── ActivityLogView.tsx          # Modul laporan aktivitas & audit trail
│       ├── EmailOutboxModal.tsx         # Riwayat & pratinjau notifikasi email
│       ├── SupabaseConfigModal.tsx      # Manajemen koneksi Supabase & skema SQL
│       ├── AdminLoginModal.tsx          # Modal login admin & quick-switch akun
│       └── UserGuideModal.tsx           # Modal panduan pengoperasian interaktif
└── tsconfig.json             # Konfigurasi TypeScript
```

---

## 📄 Lisensi
Hak Cipta © 2026. Dikembangkan untuk efisiensi tata kelola pendaftaran dan verifikasi berkas Praktik Kerja Lapangan (PKL).
