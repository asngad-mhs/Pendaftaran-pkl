import React, { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  User,
  School,
  Sparkles,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ApplicantDocument, DocumentType } from '../types';
import { api } from '../services/api';

interface StudentRegistrationWizardProps {
  onSuccess: (regCode: string) => void;
  onNavigateToTrack: (regCode: string) => void;
}

const REQUIRED_DOCS: Array<{ type: DocumentType; title: string; required: boolean; desc: string }> = [
  {
    type: 'SURAT_PENGANTAR',
    title: 'Surat Permohonan / Pengantar Resmi Sekolah',
    required: true,
    desc: 'Wajib berkop resmi sekolah, bertandatangan Kepala Sekolah & stempel basah (PDF/JPG)',
  },
  {
    type: 'CV_PORTOFOLIO',
    title: 'Curriculum Vitae (CV) & Portofolio Karya',
    required: true,
    desc: 'Riwayat pendidikan, keahlian teknis & tautan proyek atau karya siswa (PDF)',
  },
  {
    type: 'TRANSKRIP_NILAI',
    title: 'Transkrip Nilai / Rapor Semester Terakhir',
    required: true,
    desc: 'Bukti prestasi akademik dan kompetensi kejuruan semester berjalan (PDF/JPG)',
  },
  {
    type: 'IZIN_ORANG_TUA',
    title: 'Surat Persetujuan / Izin Orang Tua/Wali',
    required: true,
    desc: 'Surat persetujuan orang tua bermaterai atau bertandatangan resmi (PDF/JPG)',
  },
  {
    type: 'PAS_FOTO',
    title: 'Pas Foto Formal Berwarna (3x4)',
    required: true,
    desc: 'Foto formal berseragam sekolah dengan latar belakang merah/biru (JPG/PNG)',
  },
];

export const StudentRegistrationWizard: React.FC<StudentRegistrationWizardProps> = ({
  onSuccess,
  onNavigateToTrack,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successCode, setSuccessCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [nisn, setNisn] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [major, setMajor] = useState<string>('Rekayasa Perangkat Lunak (RPL)');
  const [targetDepartment, setTargetDepartment] = useState<string>(
    'Divisi Rekayasa Perangkat Lunak & AI'
  );
  const [startDate, setStartDate] = useState<string>('2026-11-01');
  const [endDate, setEndDate] = useState<string>('2027-02-01');

  // Sensitive Encrypted Fields
  const [nik, setNik] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  // Uploaded Documents
  const [uploadedDocs, setUploadedDocs] = useState<ApplicantDocument[]>([]);
  const [uploadingDocType, setUploadingDocType] = useState<DocumentType | null>(null);

  // Quick Demo Auto-fill Helper
  const handleAutoFillDemo = () => {
    setFullName('Bagus Tri Wicaksono');
    setNisn('0074561289');
    setEmail('bagus.wicaksono@smk1purwokerto.sch.id');
    setSchoolName('SMK Negeri 1 Purwokerto');
    setMajor('Rekayasa Perangkat Lunak (RPL)');
    setTargetDepartment('Divisi Rekayasa Perangkat Lunak & AI');
    setStartDate('2026-11-01');
    setEndDate('2027-02-01');

    setNik('3302011408070003');
    setPhone('081329881122');
    setParentName('Drs. Slamet Triyono');
    setParentPhone('081234567888');
    setAddress('Jl. Kenanga No. 24, Berkoh, Purwokerto Selatan, Jawa Tengah');

    // Auto-fill mock documents
    const mockFiles: ApplicantDocument[] = REQUIRED_DOCS.map((doc, idx) => ({
      id: `doc-demo-${idx}`,
      type: doc.type,
      title: doc.title,
      fileName: `${doc.type.toLowerCase()}_bagus_tri.pdf`,
      fileSize: 1024 * (300 + idx * 150),
      fileUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf',
      fileType: doc.type === 'PAS_FOTO' ? 'image/jpeg' : 'application/pdf',
      uploadedAt: new Date().toISOString(),
      status: 'MENUNGGU',
      ocrScore: 94,
      validationFeedback: 'File terunggah siap diverifikasi.',
      storageProvider: 'supabase',
      storagePath: `uploads/${doc.type.toLowerCase()}_bagus_tri.pdf`,
    }));
    setUploadedDocs(mockFiles);
  };

  // Upload File Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType, docTitle: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocType(docType);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await api.uploadDocument({
            fileName: file.name,
            fileData: base64Data,
            fileType: file.type || 'application/pdf',
            documentType: docType,
            documentTitle: docTitle,
          });

          setUploadedDocs((prev) => {
            const filtered = prev.filter((d) => d.type !== docType);
            return [...filtered, res.document];
          });
        } catch (err: any) {
          setErrorMsg(err.message || 'Gagal mengunggah dokumen.');
        } finally {
          setUploadingDocType(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file.');
      setUploadingDocType(null);
    }
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (uploadedDocs.length < 5) {
        throw new Error('Harap unggah seluruh 5 dokumen pendukung yang diwajibkan.');
      }

      const payload = {
        fullName,
        nisn,
        email,
        schoolName,
        major,
        targetDepartment,
        startDate,
        endDate,
        nik,
        phone,
        parentName,
        parentPhone,
        address,
        documents: uploadedDocs,
      };

      const result = await api.createRegistration(payload);
      setSuccessCode(result.registration.registrationCode);
      onSuccess(result.registration.registrationCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (successCode) {
      navigator.clipboard.writeText(successCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Render Step 4 Success Screen
  if (successCode) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran PKL Berhasil Dikirim!</h2>
        <p className="text-sm text-slate-600 mb-6">
          Berkas permohonan Anda telah tersimpan di cloud storage dan sistem verifikasi otomatis telah mulai memvalidasi kelengkapan dokumen.
        </p>

        {/* Code Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6 text-center">
          <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">KODE REGISTRASI RESMI</span>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="font-mono text-3xl font-extrabold text-sky-700 tracking-wider">
              {successCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-md transition-colors"
              title="Salin Kode"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          {copied && <p className="text-xs text-emerald-600 font-medium mt-1">Kode berhasil disalin ke clipboard!</p>}
          <p className="text-xs text-slate-500 mt-2">
            Simpan kode ini untuk memantau status persetujuan atau mengunggah revisi dokumen sewaktu-waktu.
          </p>
        </div>

        {/* Info features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left text-xs text-slate-600">
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
            <strong className="text-sky-900 block mb-1">✉️ Email Notifikasi Terkirim</strong>
            Bukti pendaftaran dan ringkasan jadwal telah otomatis dikirimkan ke <strong>{email}</strong>.
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <strong className="text-emerald-900 block mb-1">🛡️ Perlindungan Privasi AES-256</strong>
            NIK, Kontak, dan alamat rumah Anda telah dienkripsi secara aman dalam basis data.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigateToTrack(successCode)}
            className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
          >
            Lacak Status Berkas Sekarang
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSuccessCode('');
              setStep(1);
              setUploadedDocs([]);
            }}
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            Daftar Lagi / Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-2.5 py-0.5 rounded border border-sky-800">
                Penerimaan Periode 2026/2027
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Enkripsi Aktif
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Formulir Pendaftaran PKL Siswa</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Daftarkan diri Anda untuk Praktik Kerja Lapangan (PKL). Data sensitif Anda dienkripsi menggunakan standar militer AES-256 dan berkas diproses secara terorganisir.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoFillDemo}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2.5 rounded-lg border border-white/20 transition-all self-start sm:self-center"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            Isi Data Contoh (Demo)
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-slate-800">
          <div
            className={`cursor-pointer pb-2 text-left border-b-2 transition-colors ${
              step >= 1 ? 'border-sky-400 text-white' : 'border-slate-700 text-slate-500'
            }`}
            onClick={() => setStep(1)}
          >
            <span className="text-[11px] font-mono text-sky-400 block">LANGKAH 01</span>
            <span className="text-xs sm:text-sm font-semibold">Data Akademik & Divisi</span>
          </div>
          <div
            className={`cursor-pointer pb-2 text-left border-b-2 transition-colors ${
              step >= 2 ? 'border-sky-400 text-white' : 'border-slate-700 text-slate-500'
            }`}
            onClick={() => setStep(2)}
          >
            <span className="text-[11px] font-mono text-sky-400 block">LANGKAH 02</span>
            <span className="text-xs sm:text-sm font-semibold">Biodata Sensitif (AES-256)</span>
          </div>
          <div
            className={`cursor-pointer pb-2 text-left border-b-2 transition-colors ${
              step >= 3 ? 'border-sky-400 text-white' : 'border-slate-700 text-slate-500'
            }`}
            onClick={() => setStep(3)}
          >
            <span className="text-[11px] font-mono text-sky-400 block">LANGKAH 03</span>
            <span className="text-xs sm:text-sm font-semibold">Unggah 5 Berkas & Kirim</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong className="block font-medium">Periksa Kembali Data Anda</strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
        {/* STEP 1: AKADEMIK */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <School className="w-5 h-5 text-sky-600" />
                Informasi Akademik & Rencana Penempatan
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi identitas asal sekolah/kampus dan divisi magang yang Anda minati.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa / Mahasiswa *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Fajar Nugraha"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NISN (10 Digit Numerik) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 0067829104"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <span className="text-[11px] text-slate-500">Wajib sesuai data Dapodik Kemendikbud.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Aktif (Untuk Notifikasi) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="siswa@sekolah.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asal Sekolah / Kampus *
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Contoh: SMK Telkom Purwokerto"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kompetensi Keahlian / Jurusan *
                </label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Rekayasa Perangkat Lunak (RPL)">Rekayasa Perangkat Lunak (RPL)</option>
                  <option value="Teknik Komputer dan Jaringan (TKJ)">Teknik Komputer dan Jaringan (TKJ)</option>
                  <option value="Multimedia / Desain Komunikasi Visual (DKV)">Multimedia / DKV</option>
                  <option value="Sistem Informasi & Jaringan Aplikasi (SIJA)">SIJA (Sistem Informasi & Jaringan Aplikasi)</option>
                  <option value="Teknik Otomasi Industri & Mekatronika">Teknik Otomasi Industri & Mekatronika</option>
                  <option value="Akuntansi & Keuangan Lembaga">Akuntansi & Keuangan Lembaga</option>
                  <option value="Manajemen Perkantoran & Otomatisasi (MPLB)">Manajemen Perkantoran & Otomatisasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Divisi Penempatan yang Dituju *
                </label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium"
                >
                  <option value="Divisi Rekayasa Perangkat Lunak & AI">Divisi Rekayasa Perangkat Lunak & AI</option>
                  <option value="Divisi Infrastruktur Jaringan & Keamanan Siber">Divisi Jaringan & Keamanan Siber</option>
                  <option value="Divisi Cloud Infrastructure & SysAdmin">Divisi Cloud Infrastructure & SysAdmin</option>
                  <option value="Divisi UI/UX & Data Analytics">Divisi UI/UX & Data Analytics</option>
                  <option value="Divisi Administrasi Digital & Tata Kelola">Divisi Administrasi Digital & Tata Kelola</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai PKL *</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Berakhir PKL *</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!fullName || !nisn || !email || !schoolName) {
                    setErrorMsg('Harap lengkapi semua kolom wajib akademik sebelum lanjut.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                Lanjut ke Biodata Sensitif
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BIODATA SENSITIF TERENKRIPSI */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    Biodata Sensitif Terenkripsi (AES-256-GCM)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Data berikut ini dilindungi kerahasiaannya dengan enkripsi simetris tingkat tinggi.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-md text-xs font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  ENKRIPSI OTOMATIS
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Jaminan Perlindungan Privasi Data:</strong> NIK, nomor kontak pribadi, dan kontak orang tua akan langsung dienkripsi sebelum disimpan di database. Admin hanya dapat mendekripsi data ini dengan izin verifikasi resmi dan setiap akses dicatat dalam Audit Trail.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK - 16 Digit) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="3302xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                <span className="text-[11px] text-slate-500">Akan disimpan terenkripsi sebagai AES-256 ciphertext.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Handphone / WhatsApp Siswa *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Orang Tua / Wali *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nama Ayah/Ibu/Wali"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Kontak Darurat Orang Tua / Wali *
                </label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="081398765432"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Domisili / Tempat Tinggal *
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Provinsi"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 border border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!nik || !phone || !parentName || !parentPhone || !address) {
                    setErrorMsg('Harap lengkapi semua data sensitif yang diwajibkan.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(3);
                }}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                Lanjut ke Unggah Berkas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: UNGGAH 5 BERKAS PENDUKUNG */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-sky-600" />
                    Unggah 5 Dokumen Pendukung Wajib
                  </h2>
                  <p className="text-xs text-slate-500">
                    Dokumen akan disimpan ke Supabase Storage bucket <code className="font-mono text-sky-700">pkl-documents</code> dan divalidasi oleh sistem auto-verify.
                  </p>
                </div>
                <div className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  {uploadedDocs.length} / 5 Berkas Terunggah
                </div>
              </div>
            </div>

            {/* List of 5 documents upload slots */}
            <div className="space-y-4">
              {REQUIRED_DOCS.map((item, index) => {
                const existing = uploadedDocs.find((d) => d.type === item.type);
                const isUploading = uploadingDocType === item.type;

                return (
                  <div
                    key={item.type}
                    className={`border rounded-xl p-4 transition-all ${
                      existing
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            existing ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {existing ? <CheckCircle2 className="w-5 h-5" /> : `0${index + 1}`}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            {item.title}
                            {item.required && <span className="text-red-500 text-xs">*</span>}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                          {existing && (
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-700 font-mono">
                              <span>✓ {existing.fileName}</span>
                              <span>·</span>
                              <span>{Math.round(existing.fileSize / 1024)} KB</span>
                              <span>·</span>
                              <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">
                                Hash SHA-256 Siap
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload button */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <label
                          className={`cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            existing
                              ? 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                              : 'bg-sky-600 hover:bg-sky-500 text-white'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {isUploading ? 'Mengunggah...' : existing ? 'Ganti File' : 'Pilih Berkas'}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, item.type, item.title)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submission Checklist Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
              <div className="font-semibold text-slate-800 mb-1">Ringkasan Konfirmasi Pendaftaran:</div>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Nama Siswa: <strong>{fullName}</strong> (NISN: {nisn})</li>
                <li>Sekolah & Jurusan: <strong>{schoolName}</strong> - {major}</li>
                <li>Divisi Tujuan: <strong>{targetDepartment}</strong></li>
                <li>Enkripsi NIK & Kontak: <strong>AES-256-GCM Diaktifkan</strong></li>
              </ul>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 border border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>

              <button
                type="submit"
                disabled={loading || uploadedDocs.length < 5}
                className={`flex items-center gap-2 text-sm font-semibold px-8 py-2.5 rounded-lg transition-all shadow-sm ${
                  uploadedDocs.length < 5
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {loading ? (
                  <>Memproses Enkripsi & Mengirim...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Kirim & Daftarkan Berkas PKL
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
