import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Upload,
  ShieldCheck,
  Mail,
  School,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ApplicantDocument, DocumentType, Registration } from '../types';
import { api } from '../services/api';

interface StudentTrackingPortalProps {
  initialCode?: string;
}

export const StudentTrackingPortal: React.FC<StudentTrackingPortalProps> = ({ initialCode }) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialCode || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [applicant, setApplicant] = useState<Registration | null>(null);

  // Re-upload state for revision
  const [reuploadingDocType, setReuploadingDocType] = useState<DocumentType | null>(null);
  const [reuploadSuccess, setReuploadSuccess] = useState<string>('');

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg('');
    setReuploadSuccess('');

    try {
      const data = await api.getRegistrationById(q);
      setApplicant(data);
    } catch (err: any) {
      setErrorMsg('Data pendaftaran tidak ditemukan. Pastikan Kode Registrasi atau NISN Anda benar.');
      setApplicant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReupload = async (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType, docTitle: string) => {
    const file = e.target.files?.[0];
    if (!file || !applicant) return;

    setReuploadingDocType(docType);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const uploadRes = await api.uploadDocument({
            fileName: file.name,
            fileData: base64Data,
            fileType: file.type || 'application/pdf',
            documentType: docType,
            documentTitle: docTitle,
          });

          // Update applicant document list
          const updatedDocs = applicant.documents.map((d) =>
            d.type === docType
              ? {
                  ...uploadRes.document,
                  status: 'MENUNGGU' as const,
                  validationFeedback: 'Berkas perbaikan baru diunggah oleh siswa.',
                }
              : d
          );

          // Update status to SEDANG_DITINJAU
          await api.updateStatus(
            applicant.id,
            'SEDANG_DITINJAU',
            'Siswa telah mengunggah berkas revisi terbaru.',
            'Siswa (Self Re-upload)'
          );

          setApplicant({
            ...applicant,
            status: 'SEDANG_DITINJAU',
            documents: updatedDocs,
          });

          setReuploadSuccess(`Berkas ${docTitle} berhasil diperbarui! Status berkas Anda kini Sedang Ditinjau.`);
        } catch (err: any) {
          setErrorMsg(err.message || 'Gagal mengunggah berkas perbaikan.');
        } finally {
          setReuploadingDocType(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('Gagal memproses file.');
      setReuploadingDocType(null);
    }
  };

  const getStatusBadge = (status: Registration['status']) => {
    switch (status) {
      case 'DISETUJUI':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          title: 'PENDAFTARAN DISETUJUI / DITERIMA',
          desc: 'Selamat! Berkas dan kualifikasi Anda telah disetujui untuk mengikuti program PKL.',
        };
      case 'PERLU_REVISI':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          title: 'MEMERLUKAN PERBAIKAN / REVISI',
          desc: 'Terdapat catatan verifikator pada dokumen Anda. Silakan unggah perbaikan di bawah ini.',
        };
      case 'SEDANG_DITINJAU':
        return {
          icon: <Clock className="w-5 h-5 text-sky-600" />,
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          title: 'SEDANG DALAM PENINJAUAN',
          desc: 'Berkas Anda sedang ditelaah oleh verifikator dan koordinator divisi penempatan.',
        };
      case 'DITOLAK':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          bg: 'bg-red-50 border-red-200 text-red-800',
          title: 'BERKAS BELUM DAPAT DITERIMA',
          desc: 'Permohonan belum memenuhi kuota atau ketentuan instansi pada periode ini.',
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-slate-600" />,
          bg: 'bg-slate-50 border-slate-200 text-slate-800',
          title: 'MENUNGGU VERIFIKASI',
          desc: 'Berkas telah berhasil terdaftar dan masuk dalam antrean verifikasi otomatis.',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Pelacakan Status Berkas PKL</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto mb-6">
          Masukkan Kode Registrasi resmi (contoh: <code className="font-mono text-sky-700">PKL-2026-1042</code>) atau Nomor Induk Siswa Nasional (NISN) Anda untuk memantau status secara real-time.
        </p>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Masukkan Kode Registrasi atau NISN..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Mencari...' : 'Lacak Berkas'}
          </button>
        </form>

        {/* Quick Demo Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Contoh Data Tersedia:</span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('PKL-2026-1042');
              handleSearch('PKL-2026-1042');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 transition-colors"
          >
            PKL-2026-1042 (Disetujui)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('PKL-2026-1043');
              handleSearch('PKL-2026-1043');
            }}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded font-mono text-amber-800 transition-colors border border-amber-200"
          >
            PKL-2026-1043 (Perlu Revisi)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('PKL-2026-1044');
              handleSearch('PKL-2026-1044');
            }}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 transition-colors"
          >
            PKL-2026-1044 (Menunggu)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm mb-6 text-center">
          {errorMsg}
        </div>
      )}

      {reuploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm mb-6 text-center font-medium">
          {reuploadSuccess}
        </div>
      )}

      {/* Applicant Result Card */}
      {applicant && (
        <div className="space-y-6">
          {/* Status Banner */}
          {(() => {
            const badge = getStatusBadge(applicant.status);
            return (
              <div className={`border rounded-2xl p-6 ${badge.bg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-xs">{badge.icon}</div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider block opacity-75">
                        STATUS PERSETUJUAN BERKAS
                      </span>
                      <h2 className="text-xl font-bold tracking-tight">{badge.title}</h2>
                      <p className="text-xs sm:text-sm mt-0.5 opacity-90">{badge.desc}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono text-xs">
                    <div className="font-bold text-base">{applicant.registrationCode}</div>
                    <div className="opacity-75">Update: {new Date(applicant.updatedAt).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>

                {/* Reviewer Feedback Note */}
                {applicant.reviewerNotes && (
                  <div className="mt-4 pt-4 border-t border-black/10">
                    <span className="text-xs font-bold block mb-1">Catatan Tim Verifikator:</span>
                    <p className="text-xs sm:text-sm bg-white/70 rounded-lg p-3 italic">
                      "{applicant.reviewerNotes}"
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Progress Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
              Tahapan Verifikasi Berkas Digital
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  01. Pendaftaran
                </div>
                <p className="text-slate-600 text-[11px]">
                  Berkas terdaftar & NIK terenkripsi AES-256.
                </p>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 rounded-lg border ${
                  applicant.autoVerification?.passed
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-sky-200 bg-sky-50/50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  02. Auto-Verify AI
                </div>
                <p className="text-slate-600 text-[11px]">
                  Skor Integritas: <strong>{applicant.autoVerification?.overallScore || 90}%</strong>
                </p>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-lg border ${
                  applicant.status === 'SEDANG_DITINJAU' || applicant.status === 'DISETUJUI'
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  03. Verifikator Ahli
                </div>
                <p className="text-slate-600 text-[11px]">
                  Penyesuaian kuota divisi & kompetensi siswa.
                </p>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3 rounded-lg border ${
                  applicant.status === 'DISETUJUI'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : applicant.status === 'PERLU_REVISI'
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {applicant.status === 'DISETUJUI' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  04. Keputusan
                </div>
                <p className="text-[11px]">
                  {applicant.status === 'DISETUJUI'
                    ? 'Persetujuan resmi diterbitkan'
                    : applicant.status === 'PERLU_REVISI'
                    ? 'Membutuhkan berkas revisi'
                    : 'Menunggu keputusan akhir'}
                </p>
              </div>
            </div>
          </div>

          {/* Student Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Informasi Pendaftaran Siswa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Lengkap</span>
                <span className="font-semibold text-slate-800 text-sm">{applicant.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">NISN</span>
                <span className="font-mono font-medium text-slate-800">{applicant.nisn}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Asal Sekolah</span>
                <span className="font-medium text-slate-800">{applicant.schoolName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Jurusan</span>
                <span className="font-medium text-slate-800">{applicant.major}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Divisi Penempatan Dituju</span>
                <span className="font-semibold text-sky-700">{applicant.targetDepartment}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Periode Pelaksanaan</span>
                <span className="font-medium text-slate-800">
                  {applicant.startDate} s/d {applicant.endDate}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Status Enkripsi Privasi</span>
                <span className="font-mono text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  NIK: {applicant.encryptedSensitiveData.maskedNik}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Email Konfirmasi</span>
                <span className="text-slate-800">{applicant.email}</span>
              </div>
            </div>
          </div>

          {/* Documents Table with Re-upload functionality */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dokumen Pendukung PKL</h3>
                <p className="text-xs text-slate-500">
                  Status verifikasi setiap berkas yang tersimpan di cloud storage.
                </p>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {applicant.documents.length} Dokumen
              </div>
            </div>

            <div className="space-y-3">
              {applicant.documents.map((doc) => {
                const isNeedsFix = doc.status === 'PERLU_PERBAIKAN' || doc.status === 'TIDAK_VALID';
                const isUploading = reuploadingDocType === doc.type;

                return (
                  <div
                    key={doc.id}
                    className={`border rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isNeedsFix ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white rounded border border-slate-200 text-slate-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800">{doc.title}</h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              doc.status === 'VALID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : isNeedsFix
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {doc.fileName} · {Math.round(doc.fileSize / 1024)} KB
                        </div>
                        {doc.validationFeedback && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            Catatan: {doc.validationFeedback}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Re-upload button if revision needed */}
                    {(applicant.status === 'PERLU_REVISI' || isNeedsFix) && (
                      <div className="self-start sm:self-center">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          {isUploading ? 'Mengunggah...' : 'Unggah Perbaikan'}
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => handleReupload(e, doc.type, doc.title)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
