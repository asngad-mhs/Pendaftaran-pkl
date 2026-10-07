import {
  ActivityLog,
  AdminUser,
  ApplicantDocument,
  DashboardStats,
  EmailNotification,
  Registration,
  RegistrationStatus,
  SensitiveData,
} from '../src/types';
import { runAutoVerification } from './autoVerifier';
import { generateEmailHtml } from './emailService';
import { decryptField, encryptField, maskNik, maskPhone } from './encryption';

// Initial pre-configured Admins
export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-01',
    name: 'Budi Santoso, M.Kom',
    email: 'admin@instansi.go.id',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'adm-02',
    name: 'Dewi Lestari, S.T',
    email: 'koordinator@pkl.id',
    role: 'KOORDINATOR_PKL',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'adm-03',
    name: 'Rian Prasetyo, S.Pd',
    email: 'verifikator@pkl.id',
    role: 'VERIFIKATOR_DOKUMEN',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
];

// In-Memory Storage Tables
let registrations: Registration[] = [];
let activityLogs: ActivityLog[] = [];
let emailNotifications: EmailNotification[] = [];

/**
 * Creates sample dummy document files with realistic properties
 */
function createSampleDoc(
  type: ApplicantDocument['type'],
  title: string,
  fileName: string,
  fileType: string,
  sizeKb: number,
  status: ApplicantDocument['status'] = 'VALID',
  score: number = 95
): ApplicantDocument {
  return {
    id: `doc-${Math.random().toString(36).substring(2, 9)}`,
    type,
    title,
    fileName,
    fileSize: sizeKb * 1024,
    fileType,
    fileUrl: `https://raw.githubusercontent.com/mozilla/pdf.js/master/examples/learning/helloworld.pdf`,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status,
    ocrScore: score,
    validationFeedback: status === 'VALID' ? 'Tervalidasi secara otomatis oleh sistem.' : 'Memerlukan stempel kepala sekolah.',
    storageProvider: 'supabase',
    storagePath: `uploads/${fileName}`,
  };
}

/**
 * Helper to register and encrypt sensitive data
 */
export function createEncryptedRecord(
  code: string,
  fullName: string,
  nisn: string,
  email: string,
  schoolName: string,
  major: string,
  targetDepartment: string,
  startDate: string,
  endDate: string,
  status: RegistrationStatus,
  sensitive: SensitiveData,
  docs: ApplicantDocument[],
  reviewerNotes?: string
): Registration {
  const encNik = encryptField(sensitive.nik);
  const encPhone = encryptField(sensitive.phone);
  const encParentName = encryptField(sensitive.parentName);
  const encParentPhone = encryptField(sensitive.parentPhone);
  const encAddress = encryptField(sensitive.address);

  const reg: Registration = {
    id: `reg-${Math.random().toString(36).substring(2, 9)}`,
    registrationCode: code,
    fullName,
    nisn,
    email,
    schoolName,
    major,
    targetDepartment,
    startDate,
    endDate,
    status,
    documents: docs,
    encryptedSensitiveData: {
      encryptedNik: encNik.cipherText,
      encryptedPhone: encPhone.cipherText,
      encryptedParentName: encParentName.cipherText,
      encryptedParentPhone: encParentPhone.cipherText,
      encryptedAddress: encAddress.cipherText,
      iv: encNik.iv,
      algorithm: 'AES-256-GCM',
      tag: encNik.tag,
      maskedNik: maskNik(sensitive.nik),
      maskedPhone: maskPhone(sensitive.phone),
      maskedParentPhone: maskPhone(sensitive.parentPhone),
    },
    reviewerNotes,
    reviewedBy: status === 'DISETUJUI' || status === 'PERLU_REVISI' ? 'Budi Santoso, M.Kom' : undefined,
    reviewedAt: status === 'DISETUJUI' || status === 'PERLU_REVISI' ? new Date().toISOString() : undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  reg.autoVerification = runAutoVerification(docs, nisn);
  return reg;
}

// Seed Initial Data
export function seedInitialData() {
  if (registrations.length > 0) return;

  const reg1 = createEncryptedRecord(
    'PKL-2026-1042',
    'Muhammad Fajar Nugraha',
    '0067829104',
    'fajar.nugraha@smktelkom-pwt.sch.id',
    'SMK Telkom Purwokerto',
    'Rekayasa Perangkat Lunak (RPL)',
    'Divisi Rekayasa Perangkat Lunak & AI',
    '2026-11-01',
    '2027-02-01',
    'DISETUJUI',
    {
      nik: '3302191506060002',
      phone: '081234567890',
      parentName: 'Agus Nugraha',
      parentPhone: '081398765432',
      address: 'Jl. D.I. Panjaitan No. 128, Purwokerto Selatan, Jawa Tengah',
    },
    [
      createSampleDoc('SURAT_PENGANTAR', 'Surat Permohonan PKL Sekolah', 'Surat_Pengantar_SMKTelkom_Fajar.pdf', 'application/pdf', 380, 'VALID', 98),
      createSampleDoc('CV_PORTOFOLIO', 'CV & Portofolio Siswa', 'CV_Fajar_RPL_2026.pdf', 'application/pdf', 840, 'VALID', 95),
      createSampleDoc('TRANSKRIP_NILAI', 'Rapor Semester 1 - 4', 'Rapor_Semester_Fajar.pdf', 'application/pdf', 1240, 'VALID', 93),
      createSampleDoc('IZIN_ORANG_TUA', 'Surat Persetujuan Orang Tua', 'Surat_Izin_Ortu_Fajar.pdf', 'application/pdf', 290, 'VALID', 97),
      createSampleDoc('PAS_FOTO', 'Pas Foto Formal Siswa', 'PasFoto_Fajar_3x4.jpg', 'image/jpeg', 180, 'VALID', 96),
    ],
    'Dokumen lengkap dan terverifikasi sah. Kualifikasi teknis Node.js dan React sangat relevan untuk proyek digital instansi.'
  );

  const reg2 = createEncryptedRecord(
    'PKL-2026-1043',
    'Siti Aisyah Wardani',
    '0071239845',
    'aisyah.wardani@smkn1jkt.sch.id',
    'SMKN 1 Jakarta',
    'Teknik Komputer dan Jaringan (TKJ)',
    'Divisi Infrastruktur Jaringan & Keamanan Siber',
    '2026-11-15',
    '2027-02-15',
    'PERLU_REVISI',
    {
      nik: '3171055209070004',
      phone: '085712348899',
      parentName: 'Hj. Nurhayati',
      parentPhone: '085876543211',
      address: 'Jl. Kramat Raya No. 45, Senen, Jakarta Pusat',
    },
    [
      createSampleDoc('SURAT_PENGANTAR', 'Surat Permohonan PKL Sekolah', 'Surat_SMKN1_Aisyah.pdf', 'application/pdf', 340, 'PERLU_PERBAIKAN', 65),
      createSampleDoc('CV_PORTOFOLIO', 'Curriculum Vitae', 'CV_Aisyah_TKJ.pdf', 'application/pdf', 520, 'VALID', 90),
      createSampleDoc('TRANSKRIP_NILAI', 'Transkrip Nilai Rapor', 'Transkrip_SMKN1.pdf', 'application/pdf', 910, 'VALID', 88),
      createSampleDoc('IZIN_ORANG_TUA', 'Surat Izin Orang Tua', 'Izin_Ortu_Aisyah.pdf', 'application/pdf', 310, 'VALID', 92),
      createSampleDoc('PAS_FOTO', 'Pas Foto Formal', 'Foto_Aisyah_Formal.jpg', 'image/jpeg', 210, 'VALID', 95),
    ],
    'Mohon perbaiki Surat Pengantar Sekolah: Tanda tangan Kepala Sekolah belum tertera stempel basah resmi. Silakan unggah ulang versi berstempel.'
  );

  const reg3 = createEncryptedRecord(
    'PKL-2026-1044',
    'Rifky Maulana Pratama',
    '0065432198',
    'rifky.pratama@smktarunabhakti.net',
    'SMK Taruna Bhakti Depok',
    'Teknik Jaringan Akses & Cloud',
    'Divisi Cloud Infrastructure & SysAdmin',
    '2026-12-01',
    '2027-03-01',
    'MENUNGGU_VERIFIKASI',
    {
      nik: '3276012403060007',
      phone: '087812984567',
      parentName: 'Bambang Pratama',
      parentPhone: '087889123456',
      address: 'Jl. Pekapuran No. 89, Sukatani, Tapos, Kota Depok',
    },
    [
      createSampleDoc('SURAT_PENGANTAR', 'Surat Permohonan PKL', 'Surat_Permohonan_Rifky.pdf', 'application/pdf', 410, 'MENUNGGU', 90),
      createSampleDoc('CV_PORTOFOLIO', 'CV & Portofolio Jaringan', 'CV_Rifky_Cloud.pdf', 'application/pdf', 730, 'MENUNGGU', 92),
      createSampleDoc('TRANSKRIP_NILAI', 'Rapor Semester 1 - 4', 'Rapor_Rifky_TB.pdf', 'application/pdf', 1100, 'MENUNGGU', 89),
      createSampleDoc('IZIN_ORANG_TUA', 'Surat Izin Wali', 'Surat_Izin_Rifky.pdf', 'application/pdf', 320, 'MENUNGGU', 91),
      createSampleDoc('PAS_FOTO', 'Pas Foto 3x4', 'Foto_Rifky_Formal.jpg', 'image/jpeg', 190, 'MENUNGGU', 95),
    ]
  );

  const reg4 = createEncryptedRecord(
    'PKL-2026-1045',
    'Anindya Putri Maharani',
    '0078901234',
    'anindya.putri@mhs.pnj.ac.id',
    'Politeknik Negeri Jakarta (PNJ)',
    'Teknik Informatika',
    'Divisi UI/UX & Data Analytics',
    '2026-11-01',
    '2027-04-30',
    'SEDANG_DITINJAU',
    {
      nik: '3201026508050003',
      phone: '089611223344',
      parentName: 'Drs. Hendro Wibowo',
      parentPhone: '081299887766',
      address: 'Jl. Margonda Raya No. 100, Beji, Kota Depok',
    },
    [
      createSampleDoc('SURAT_PENGANTAR', 'Surat Rekomendasi Magang Kampus', 'Rekomendasi_PNJ_Anindya.pdf', 'application/pdf', 520, 'VALID', 99),
      createSampleDoc('CV_PORTOFOLIO', 'Portfolio UI/UX Design Figma', 'Portofolio_Anindya_Figma.pdf', 'application/pdf', 3400, 'VALID', 98),
      createSampleDoc('TRANSKRIP_NILAI', 'Transkrip Nilai Akademik Kumulatif', 'Transkrip_PNJ_Anindya.pdf', 'application/pdf', 680, 'VALID', 94),
      createSampleDoc('IZIN_ORANG_TUA', 'Surat Izin Orang Tua', 'Izin_Ortu_Anindya.pdf', 'application/pdf', 280, 'VALID', 95),
      createSampleDoc('PAS_FOTO', 'Pas Foto Berwarna', 'Foto_Anindya_3x4.png', 'image/png', 240, 'VALID', 98),
    ],
    'Sedang disinkronisasikan dengan mentor divisi UI/UX mengenai ketersediaan kuota bimbingan.'
  );

  registrations = [reg1, reg2, reg3, reg4];

  // Seed sample activity logs
  logActivity({
    actorType: 'SISTEM',
    actorName: 'System Bootstrapper',
    action: 'INISIALISASI_SISTEM',
    category: 'SISTEM',
    details: 'Database in-memory dan modul keamanan terenkripsi AES-256 siap digunakan.',
    ipAddress: '127.0.0.1',
    severity: 'INFO',
  });

  logActivity({
    actorType: 'ADMIN',
    actorName: 'Budi Santoso, M.Kom',
    action: 'VERIFIKASI_BERKAS',
    category: 'VERIFIKASI',
    details: 'Menyetujui pendaftaran PKL-2026-1042 atas nama Muhammad Fajar Nugraha.',
    ipAddress: '192.168.1.10',
    registrationCode: 'PKL-2026-1042',
    severity: 'SUCCESS',
  });

  logActivity({
    actorType: 'ADMIN',
    actorName: 'Dewi Lestari, S.T',
    action: 'MINTA_REVISI',
    category: 'VERIFIKASI',
    details: 'Mengirimkan permintaan revisi stempel surat pengantar untuk PKL-2026-1043.',
    ipAddress: '192.168.1.15',
    registrationCode: 'PKL-2026-1043',
    severity: 'WARNING',
  });

  // Seed sample emails
  const email1 = generateEmailHtml(reg1, 'STATUS_DISETUJUI');
  emailNotifications.push({
    id: `mail-01`,
    registrationId: reg1.id,
    registrationCode: reg1.registrationCode,
    recipientEmail: reg1.email,
    recipientName: reg1.fullName,
    subject: email1.subject,
    event: 'STATUS_DISETUJUI',
    status: 'TERKIRIM',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    htmlPreview: email1.html,
  });

  const email2 = generateEmailHtml(reg2, 'STATUS_REVISI', reg2.reviewerNotes);
  emailNotifications.push({
    id: `mail-02`,
    registrationId: reg2.id,
    registrationCode: reg2.registrationCode,
    recipientEmail: reg2.email,
    recipientName: reg2.fullName,
    subject: email2.subject,
    event: 'STATUS_REVISI',
    status: 'TERKIRIM',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    htmlPreview: email2.html,
  });
}

// Initial seed call
seedInitialData();

export function getAllRegistrations(): Registration[] {
  return registrations;
}

export function getRegistrationById(id: string): Registration | undefined {
  return registrations.find((r) => r.id === id || r.registrationCode === id || r.nisn === id);
}

export function addRegistration(reg: Registration): Registration {
  registrations.unshift(reg);
  return reg;
}

export function updateRegistration(id: string, updates: Partial<Registration>): Registration | null {
  const index = registrations.findIndex((r) => r.id === id || r.registrationCode === id);
  if (index === -1) return null;

  registrations[index] = {
    ...registrations[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return registrations[index];
}

/**
 * Decrypts sensitive applicant data with audit trail
 */
export function decryptApplicantData(
  id: string,
  adminUser: AdminUser,
  ipAddress: string
): SensitiveData | null {
  const reg = getRegistrationById(id);
  if (!reg) return null;

  const enc = reg.encryptedSensitiveData;
  const decrypted: SensitiveData = {
    nik: decryptField({ cipherText: enc.encryptedNik, iv: enc.iv, tag: enc.tag || '' }),
    phone: decryptField({ cipherText: enc.encryptedPhone, iv: enc.iv, tag: enc.tag || '' }),
    parentName: decryptField({ cipherText: enc.encryptedParentName, iv: enc.iv, tag: enc.tag || '' }),
    parentPhone: decryptField({ cipherText: enc.encryptedParentPhone, iv: enc.iv, tag: enc.tag || '' }),
    address: decryptField({ cipherText: enc.encryptedAddress, iv: enc.iv, tag: enc.tag || '' }),
  };

  // Log this critical privacy event to Audit Trail
  logActivity({
    actorType: 'ADMIN',
    actorName: `${adminUser.name} (${adminUser.role})`,
    action: 'DEKRIPSI_DATA_SENSITIF',
    category: 'ENKRIPSI',
    details: `Membuka data sensitif terenkripsi (NIK, No. HP, Alamat) milik pendaftar ${reg.registrationCode} (${reg.fullName}).`,
    ipAddress,
    registrationCode: reg.registrationCode,
    severity: 'WARNING',
  });

  return decrypted;
}

/**
 * Logs an activity to the audit trail
 */
export function logActivity(params: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
  activityLogs.unshift(log);
  if (activityLogs.length > 500) {
    activityLogs = activityLogs.slice(0, 500);
  }
  return log;
}

export function getActivityLogs(): ActivityLog[] {
  return activityLogs;
}

/**
 * Adds an email to the notification log
 */
export function queueEmailNotification(
  registration: Registration,
  event: EmailNotification['event'],
  reviewerNotes?: string
): EmailNotification {
  const { subject, html } = generateEmailHtml(registration, event, reviewerNotes);
  const emailItem: EmailNotification = {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    registrationId: registration.id,
    registrationCode: registration.registrationCode,
    recipientEmail: registration.email,
    recipientName: registration.fullName,
    subject,
    event,
    status: 'TERKIRIM',
    sentAt: new Date().toISOString(),
    htmlPreview: html,
  };

  emailNotifications.unshift(emailItem);

  // Log activity
  logActivity({
    actorType: 'SISTEM',
    actorName: 'Automated Email Dispatcher',
    action: 'KIRIM_EMAIL_NOTIFIKASI',
    category: 'EMAIL',
    details: `Mengirimkan email notifikasi [${event}] ke ${registration.email} (${registration.fullName}).`,
    ipAddress: '127.0.0.1',
    registrationCode: registration.registrationCode,
    severity: 'INFO',
  });

  return emailItem;
}

export function getEmailNotifications(): EmailNotification[] {
  return emailNotifications;
}

/**
 * Computes dashboard statistics
 */
export function getDashboardStats(): DashboardStats {
  const total = registrations.length;
  const pending = registrations.filter((r) => r.status === 'MENUNGGU_VERIFIKASI').length;
  const underReview = registrations.filter((r) => r.status === 'SEDANG_DITINJAU').length;
  const revision = registrations.filter((r) => r.status === 'PERLU_REVISI').length;
  const approved = registrations.filter((r) => r.status === 'DISETUJUI').length;
  const rejected = registrations.filter((r) => r.status === 'DITOLAK').length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const departmentDistribution: Record<string, number> = {};
  const schoolDistribution: Record<string, number> = {};

  for (const reg of registrations) {
    departmentDistribution[reg.targetDepartment] = (departmentDistribution[reg.targetDepartment] || 0) + 1;
    schoolDistribution[reg.schoolName] = (schoolDistribution[reg.schoolName] || 0) + 1;
  }

  return {
    totalApplicants: total,
    pendingCount: pending,
    underReviewCount: underReview,
    revisionNeededCount: revision,
    approvedCount: approved,
    rejectedCount: rejected,
    approvalRate,
    averageVerificationTime: '1.4 Hari Kerja',
    departmentDistribution,
    schoolDistribution,
  };
}
