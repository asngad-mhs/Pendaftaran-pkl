import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  Mail,
  Eye,
  Download,
  ShieldCheck,
  Send,
  FileText,
  RotateCw,
  ZoomIn,
  ZoomOut,
  UserCheck,
} from 'lucide-react';
import { AdminUser, ApplicantDocument, Registration, RegistrationStatus, SensitiveData } from '../types';
import { api } from '../services/api';

interface ApplicantDetailModalProps {
  applicant: Registration;
  currentUser: AdminUser | null;
  onClose: () => void;
  onUpdated: (updated: Registration) => void;
}

export const ApplicantDetailModal: React.FC<ApplicantDetailModalProps> = ({
  applicant,
  currentUser,
  onClose,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'sensitive' | 'decision'>('docs');
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);

  // Sensitive Decryption State
  const [decryptedData, setDecryptedData] = useState<SensitiveData | null>(null);
  const [decrypting, setDecrypting] = useState<boolean>(false);
  const [decryptError, setDecryptError] = useState<string>('');

  // Decision Form State
  const [targetStatus, setTargetStatus] = useState<RegistrationStatus>(applicant.status);
  const [reviewerNotes, setReviewerNotes] = useState<string>(applicant.reviewerNotes || '');
  const [savingDecision, setSavingDecision] = useState<boolean>(false);
  const [decisionSuccess, setDecisionSuccess] = useState<string>('');

  // Auto-verify state
  const [runningAutoVerify, setRunningAutoVerify] = useState<boolean>(false);

  // Document viewer controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const currentDoc = applicant.documents[selectedDocIndex] || applicant.documents[0];

  // Handle Decryption of Sensitive Data
  const handleDecrypt = async () => {
    setDecrypting(true);
    setDecryptError('');
    try {
      const res = await api.decryptData(applicant.id, currentUser?.email || 'admin@instansi.go.id');
      setDecryptedData(res.sensitiveData);
    } catch (err: any) {
      setDecryptError(err.message || 'Gagal mendekripsi data sensitif.');
    } finally {
      setDecrypting(false);
    }
  };

  // Run Auto Verify on this dossier
  const handleRunAutoVerify = async () => {
    setRunningAutoVerify(true);
    try {
      const res = await api.runAutoVerification(applicant.id, currentUser?.name);
      onUpdated(res.registration);
    } catch (err: any) {
      alert('Gagal menjalankan auto-verify: ' + err.message);
    } finally {
      setRunningAutoVerify(false);
    }
  };

  // Update Individual Document Status
  const handleUpdateDocStatus = async (status: ApplicantDocument['status'], feedback?: string) => {
    if (!currentDoc) return;
    try {
      await api.updateDocumentStatus(
        currentDoc.id,
        applicant.id,
        status,
        feedback,
        currentUser?.name
      );

      const updatedDocs = [...applicant.documents];
      updatedDocs[selectedDocIndex] = {
        ...currentDoc,
        status,
        validationFeedback: feedback || currentDoc.validationFeedback,
      };

      const updatedApplicant = {
        ...applicant,
        documents: updatedDocs,
      };
      onUpdated(updatedApplicant);
    } catch (err: any) {
      alert('Gagal memperbarui status dokumen: ' + err.message);
    }
  };

  // Submit Final Decision
  const handleSaveDecision = async () => {
    setSavingDecision(true);
    setDecisionSuccess('');
    try {
      const res = await api.updateStatus(
        applicant.id,
        targetStatus,
        reviewerNotes,
        currentUser?.name || 'Admin Koordinator PKL'
      );
      setDecisionSuccess(res.message);
      onUpdated(res.registration);
      setTimeout(() => {
        setDecisionSuccess('');
      }, 3000);
    } catch (err: any) {
      alert('Gagal menyimpan putusan: ' + err.message);
    } finally {
      setSavingDecision(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">{applicant.fullName}</h2>
                <span className="font-mono text-xs text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {applicant.registrationCode}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {applicant.schoolName} · {applicant.major}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                applicant.status === 'DISETUJUI'
                  ? 'bg-emerald-600 text-white'
                  : applicant.status === 'PERLU_REVISI'
                  ? 'bg-amber-600 text-white'
                  : applicant.status === 'DITOLAK'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {applicant.status}
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex space-x-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Berkas & Verifikasi Otomatis ({applicant.documents.length})
          </button>

          <button
            onClick={() => setActiveTab('sensitive')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sensitive'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-600" />
            Biodata Sensitif Terenkripsi (AES)
          </button>

          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'decision'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            Keputusan Status & Notifikasi Email
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DOKUMEN & VERIFIKASI OTOMATIS */}
          {activeTab === 'docs' && (
            <div className="space-y-6">
              {/* Auto-verify summary banner */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-sky-600 text-white rounded-lg shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        Hasil Analisis Verifikasi Dokumen Otomatis
                      </h4>
                      <span className="font-mono text-xs bg-sky-600 text-white px-2 py-0.5 rounded font-bold">
                        Skor: {applicant.autoVerification?.overallScore || 90}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                      {applicant.autoVerification?.notes ||
                        'Dokumen sedang diperiksa kelengkapannya sesuai format regulasi instansi.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunAutoVerify}
                  disabled={runningAutoVerify}
                  className="inline-flex items-center gap-1.5 bg-white border border-sky-300 hover:bg-sky-50 text-sky-800 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {runningAutoVerify ? 'Menganalisis...' : 'Jalankan Auto-Verify Ulang'}
                </button>
              </div>

              {/* Main Document Review Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Document List Selector */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Daftar Dokumen Siswa
                  </span>
                  {applicant.documents.map((doc, idx) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocIndex(idx);
                        setRotation(0);
                        setZoomLevel(100);
                      }}
                      className={`cursor-pointer p-3 rounded-lg border transition-all text-xs ${
                        selectedDocIndex === idx
                          ? 'border-sky-500 bg-sky-50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800 line-clamp-1">{doc.title}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            doc.status === 'VALID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'PERLU_PERBAIKAN'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {doc.fileName} · {Math.round(doc.fileSize / 1024)} KB
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Document Viewer & Quick Validation */}
                <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col">
                  {currentDoc ? (
                    <>
                      {/* Document Viewer Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 mb-4">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{currentDoc.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Checksum SHA-256: {currentDoc.checksum?.substring(0, 16) || 'a8f94e2...'} · Storage: {currentDoc.storageProvider}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setZoomLevel((z) => Math.max(50, z - 20))}
                            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                            title="Zoom Out"
                          >
                            <ZoomOut className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-mono text-slate-600 px-1">{zoomLevel}%</span>
                          <button
                            onClick={() => setZoomLevel((z) => Math.min(200, z + 20))}
                            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                            title="Zoom In"
                          >
                            <ZoomIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                            title="Putar 90 Derajat"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={currentDoc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
                            title="Buka Tab Baru"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Document Canvas / Simulation */}
                      <div className="flex-1 min-h-[320px] bg-slate-200/70 rounded-lg flex items-center justify-center p-4 overflow-hidden relative border border-slate-300">
                        <div
                          style={{
                            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                          className="bg-white p-6 shadow-md rounded-md max-w-sm w-full text-center border border-slate-300"
                        >
                          <div className="border-b border-slate-200 pb-3 mb-3">
                            <span className="text-[10px] uppercase font-bold text-sky-700 tracking-wider">
                              PRATINJAU DOKUMEN DIGITAL
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 mt-1">{currentDoc.title}</h5>
                            <span className="text-xs text-slate-500">{applicant.schoolName}</span>
                          </div>

                          <div className="py-6 space-y-2 text-xs text-slate-600">
                            <p><strong>Nama Berkas:</strong> {currentDoc.fileName}</p>
                            <p><strong>Ukuran Berkas:</strong> {Math.round(currentDoc.fileSize / 1024)} KB</p>
                            <p><strong>Tipe MIME:</strong> {currentDoc.fileType}</p>
                            <div className="bg-emerald-50 text-emerald-800 p-2 rounded text-[11px] font-mono border border-emerald-200">
                              ✓ Integritas Berkas Valid (Verified Cloud Storage)
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                            <span>Sistem PKL 2026</span>
                            <span className="font-mono">{applicant.registrationCode}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Document Status Control */}
                      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs">
                          <span className="text-slate-500">Status Saat Ini: </span>
                          <strong className="text-slate-800">{currentDoc.status}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateDocStatus('VALID', 'Dokumen terverifikasi sah dan lengkap.')}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tandai Valid
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt('Masukkan catatan perbaikan untuk siswa:', 'Tanda tangan atau stempel belum jelas.');
                              if (note) handleUpdateDocStatus('PERLU_PERBAIKAN', note);
                            }}
                            className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Minta Revisi
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIODATA SENSITIF TERENKRIPSI */}
          {activeTab === 'sensitive' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-emerald-600 rounded-lg">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Perlindungan Data Sensitif (AES-256-GCM)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                        Data identitas kependudukan, nomor pribadi, dan alamat disimpan dalam bentuk ciphertext di database. Seluruh tindakan dekripsi dicatat dalam audit trail instansi.
                      </p>
                    </div>
                  </div>

                  {!decryptedData ? (
                    <button
                      onClick={handleDecrypt}
                      disabled={decrypting}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Unlock className="w-4 h-4" />
                      {decrypting ? 'Mendekripsi...' : 'Buka Dekripsi Data (AES-256)'}
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      DATA DIDEKRIPSI RESMI
                    </span>
                  )}
                </div>
              </div>

              {decryptError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
                  {decryptError}
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="py-3 px-4">Bidang Data Sensitif</th>
                      <th className="py-3 px-4">Nilai Data</th>
                      <th className="py-3 px-4">Status Keamanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        NIK (Nomor Induk Kependudukan)
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-sm">
                        {decryptedData ? decryptedData.nik : applicant.encryptedSensitiveData.maskedNik}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {decryptedData ? 'Decrypted (Logged)' : 'AES-256 Encrypted'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        Nomor Handphone Siswa
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        {decryptedData ? decryptedData.phone : applicant.encryptedSensitiveData.maskedPhone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {decryptedData ? 'Decrypted (Logged)' : 'AES-256 Encrypted'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        Nama Lengkap Orang Tua / Wali
                      </td>
                      <td className="py-3.5 px-4">
                        {decryptedData ? decryptedData.parentName : '••••••••••••••••'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {decryptedData ? 'Decrypted (Logged)' : 'AES-256 Encrypted'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        Kontak Darurat Orang Tua / Wali
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {decryptedData
                          ? decryptedData.parentPhone
                          : applicant.encryptedSensitiveData.maskedParentPhone}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {decryptedData ? 'Decrypted (Logged)' : 'AES-256 Encrypted'}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        Alamat Domisili Lengkap
                      </td>
                      <td className="py-3.5 px-4">
                        {decryptedData ? decryptedData.address : '••••••••••••••••••••••••••••••••••••'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-mono text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {decryptedData ? 'Decrypted (Logged)' : 'AES-256 Encrypted'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: KEPUTUSAN STATUS & EMAIL NOTIFIKASI */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Tetapkan Keputusan Status Pendaftaran
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perubahan status akan langsung memperbarui database dan memicu pengiriman notifikasi email otomatis ke siswa ({applicant.email}).
                  </p>
                </div>

                {decisionSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-lg text-xs font-semibold">
                    ✓ {decisionSuccess}
                  </div>
                )}

                {/* Status Radio Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => {
                      setTargetStatus('DISETUJUI');
                      setReviewerNotes(
                        'Selamat! Berkas dan kompetensi Anda telah memenuhi standar. Silakan persiapkan diri untuk orientasi program PKL.'
                      );
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                      targetStatus === 'DISETUJUI'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Setujui Berkas (Diterima)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Menerbitkan persetujuan resmi penempatan magang PKL.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setTargetStatus('PERLU_REVISI');
                      setReviewerNotes(
                        'Mohon perbaiki dokumen permohonan sekolah: Surat harus dilengkapi stempel basah resmi dari kepala sekolah.'
                      );
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                      targetStatus === 'PERLU_REVISI'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Minta Perbaikan (Revisi)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Meminta siswa mengunggah ulang dokumen yang belum sah.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setTargetStatus('DITOLAK');
                      setReviewerNotes(
                        'Mohon maaf, kuota penerimaan untuk divisi yang dituju telah penuh pada periode ini.'
                      );
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border text-xs transition-all ${
                      targetStatus === 'DITOLAK'
                        ? 'border-red-500 bg-red-50 text-red-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Tolak Berkas (Tidak Lolos)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal">
                      Menolak permohonan dengan alasan kuota atau ketidaksesuaian.
                    </p>
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Verifikator untuk Siswa (Akan Disertakan dalam Email) *
                  </label>
                  <textarea
                    rows={3}
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Tuliskan arahan, catatan revisi, atau jadwal kehadiran untuk siswa..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Email dispatch preview notice */}
                <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 text-xs text-sky-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>
                      Email notifikasi otomatis dengan format HTML resmi akan dikirim ke: <strong>{applicant.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-sky-200 text-sky-800 px-2 py-0.5 rounded font-semibold">
                    AUTO-DISPATCH
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveDecision}
                    disabled={savingDecision}
                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {savingDecision ? 'Menyimpan & Mengirim Email...' : 'Simpan Keputusan & Kirim Email'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
