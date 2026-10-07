export type RegistrationStatus =
  | 'MENUNGGU_VERIFIKASI'
  | 'SEDANG_DITINJAU'
  | 'PERLU_REVISI'
  | 'DISETUJUI'
  | 'DITOLAK';

export type DocumentType =
  | 'SURAT_PENGANTAR'
  | 'CV_PORTOFOLIO'
  | 'TRANSKRIP_NILAI'
  | 'IZIN_ORANG_TUA'
  | 'PAS_FOTO';

export type DocumentStatus = 'MENUNGGU' | 'VALID' | 'TIDAK_VALID' | 'PERLU_PERBAIKAN';

export interface ApplicantDocument {
  id: string;
  type: DocumentType;
  title: string;
  fileName: string;
  fileSize: number; // in bytes
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
  status: DocumentStatus;
  ocrScore?: number; // 0 - 100%
  validationFeedback?: string;
  checksum?: string;
  storageProvider: 'supabase' | 'secure_local';
  storagePath?: string;
}

export interface SensitiveData {
  nik: string; // 16 digit
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
}

export interface EncryptedSensitiveData {
  encryptedNik: string;
  encryptedPhone: string;
  encryptedParentName: string;
  encryptedParentPhone: string;
  encryptedAddress: string;
  iv: string;
  algorithm: 'AES-256-GCM';
  tag?: string;
  maskedNik: string;
  maskedPhone: string;
  maskedParentPhone: string;
}

export interface AutoVerificationSummary {
  overallScore: number; // 0 - 100
  passed: boolean;
  checkedAt: string;
  findings: Array<{
    documentType: DocumentType;
    passed: boolean;
    rule: string;
    detail: string;
    score: number;
  }>;
  aiRecommendation: 'TERIMA' | 'PERLU_REVISI_DOKUMEN' | 'TOLAK_BERKAS';
  notes: string;
}

export interface Registration {
  id: string;
  registrationCode: string; // e.g., PKL-2026-0814
  fullName: string;
  nisn: string;
  email: string;
  schoolName: string;
  major: string;
  targetDepartment: string;
  startDate: string;
  endDate: string;
  status: RegistrationStatus;
  documents: ApplicantDocument[];
  sensitiveData?: SensitiveData; // Only present when decrypted
  encryptedSensitiveData: EncryptedSensitiveData;
  autoVerification?: AutoVerificationSummary;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'SUPER_ADMIN' | 'KOORDINATOR_PKL' | 'VERIFIKATOR_DOKUMEN';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actorType: 'ADMIN' | 'SISWA' | 'SISTEM';
  actorName: string;
  action: string;
  category: 'AUTH' | 'PENDAFTARAN' | 'VERIFIKASI' | 'ENKRIPSI' | 'EMAIL' | 'STORAGE' | 'SISTEM';
  details: string;
  ipAddress: string;
  registrationCode?: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

export interface EmailNotification {
  id: string;
  registrationId: string;
  registrationCode: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  event: 'PENDAFTARAN_BERHASIL' | 'STATUS_DISETUJUI' | 'STATUS_REVISI' | 'STATUS_DITOLAK' | 'VERIFIKASI_OTOMATIS';
  status: 'TERKIRIM' | 'MENUNGGU' | 'GAGAL';
  sentAt: string;
  htmlPreview: string;
}

export interface SupabaseConfigState {
  isConnected: boolean;
  mode: 'live' | 'emulated';
  url: string;
  bucketName: string;
  hasServiceKey: boolean;
  message: string;
}

export interface DashboardStats {
  totalApplicants: number;
  pendingCount: number;
  underReviewCount: number;
  revisionNeededCount: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number; // percentage
  averageVerificationTime: string;
  departmentDistribution: Record<string, number>;
  schoolDistribution: Record<string, number>;
}
