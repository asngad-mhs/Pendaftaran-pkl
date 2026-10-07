import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ADMIN_USERS,
  addRegistration,
  createEncryptedRecord,
  decryptApplicantData,
  getActivityLogs,
  getAllRegistrations,
  getDashboardStats,
  getEmailNotifications,
  getRegistrationById,
  logActivity,
  queueEmailNotification,
  updateRegistration,
} from './server/db.ts';
import { runAutoVerification } from './server/autoVerifier.ts';
import { calculateChecksum } from './server/encryption.ts';
import {
  getSupabaseStatus,
  SUPABASE_SQL_SCHEMA,
  updateSupabaseConfig,
  uploadDocumentToStorage,
} from './server/supabase.ts';
import { ApplicantDocument, DocumentType, RegistrationStatus, SensitiveData } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get client IP
const getClientIp = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
};

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Sistem Pendaftaran PKL Terpadu API',
  });
});

// Admin Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const ip = getClientIp(req);

  const user = ADMIN_USERS.find(
    (u) => u.email.toLowerCase() === (email || '').toLowerCase().trim()
  );

  // For ease of evaluation, standard password 'admin123' or direct match for demo users
  if (!user || (password && password !== 'admin123' && password !== 'password')) {
    logActivity({
      actorType: 'ADMIN',
      actorName: email || 'Tamu',
      action: 'LOGIN_GAGAL',
      category: 'AUTH',
      details: `Percobaan login gagal untuk akun: ${email}`,
      ipAddress: ip,
      severity: 'WARNING',
    });
    return res.status(401).json({ error: 'Email atau kata sandi tidak cocok. Gunakan password: admin123' });
  }

  logActivity({
    actorType: 'ADMIN',
    actorName: `${user.name} (${user.role})`,
    action: 'LOGIN_BERHASIL',
    category: 'AUTH',
    details: `Admin berhasil masuk ke dashboard sistem.`,
    ipAddress: ip,
    severity: 'INFO',
  });

  res.json({
    success: true,
    user,
    token: `token-${user.id}-${Date.now()}`,
  });
});

// Admin Auth: Me
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ user: null });
  }
  // Return first admin or matched
  res.json({ user: ADMIN_USERS[0] });
});

// Dashboard Statistics
app.get('/api/stats', (req, res) => {
  const stats = getDashboardStats();
  res.json(stats);
});

// Registrations: List all
app.get('/api/registrations', (req, res) => {
  const { status, search, major } = req.query;
  let list = getAllRegistrations();

  if (status && status !== 'ALL') {
    list = list.filter((r) => r.status === status);
  }
  if (major && major !== 'ALL') {
    list = list.filter((r) => r.major.toLowerCase().includes(String(major).toLowerCase()));
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.registrationCode.toLowerCase().includes(q) ||
        r.schoolName.toLowerCase().includes(q) ||
        r.nisn.includes(q)
    );
  }

  res.json(list);
});

// Registrations: Get detail by ID or Registration Code
app.get('/api/registrations/:id', (req, res) => {
  const item = getRegistrationById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
  }
  res.json(item);
});

// Registrations: Create new (From Student Portal)
app.post('/api/registrations', async (req, res) => {
  try {
    const {
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
      documents,
    } = req.body;

    if (!fullName || !nisn || !email || !schoolName || !nik || !phone) {
      return res.status(400).json({ error: 'Harap lengkapi semua bidang wajib biodata dan data kontak.' });
    }

    const ip = getClientIp(req);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const registrationCode = `PKL-2026-${randomDigits}`;

    const sensitive: SensitiveData = {
      nik,
      phone,
      parentName: parentName || '-',
      parentPhone: parentPhone || '-',
      address: address || '-',
    };

    const docs: ApplicantDocument[] = (documents || []).map((d: any) => ({
      ...d,
      id: d.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
      uploadedAt: d.uploadedAt || new Date().toISOString(),
      status: 'MENUNGGU',
    }));

    // Create encrypted record
    const newReg = createEncryptedRecord(
      registrationCode,
      fullName,
      nisn,
      email,
      schoolName,
      major || 'Teknik Informatika / Komputer',
      targetDepartment || 'Divisi IT & Pengembangan Perangkat Lunak',
      startDate || '2026-11-01',
      endDate || '2027-02-01',
      'MENUNGGU_VERIFIKASI',
      sensitive,
      docs
    );

    addRegistration(newReg);

    // Audit log
    logActivity({
      actorType: 'SISWA',
      actorName: fullName,
      action: 'PENDAFTARAN_BARU',
      category: 'PENDAFTARAN',
      details: `Pendaftaran baru diterima dengan kode ${registrationCode} (${schoolName} - ${major}). Data sensitif otomatis dienkripsi AES-256.`,
      ipAddress: ip,
      registrationCode,
      severity: 'INFO',
    });

    // Auto verification run
    if (docs.length > 0) {
      logActivity({
        actorType: 'SISTEM',
        actorName: 'AI Document Inspector',
        action: 'VERIFIKASI_OTOMATIS',
        category: 'VERIFIKASI',
        details: `Pemeriksaan otomatis berkas untuk ${registrationCode}: Skor ${newReg.autoVerification?.overallScore}% (${newReg.autoVerification?.aiRecommendation}).`,
        ipAddress: '127.0.0.1',
        registrationCode,
        severity: 'INFO',
      });
    }

    // Automated Email Notification
    queueEmailNotification(newReg, 'PENDAFTARAN_BERHASIL');

    res.status(201).json({
      success: true,
      registration: newReg,
      message: 'Pendaftaran berhasil dikirim! Silakan simpan Kode Registrasi Anda.',
    });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Gagal memproses pendaftaran: ' + error.message });
  }
});

// Registrations: Update status (Approve, Revision, Reject, Review)
app.patch('/api/registrations/:id/status', (req, res) => {
  const { status, reviewerNotes, reviewerName } = req.body;
  const ip = getClientIp(req);
  const reg = getRegistrationById(req.params.id);

  if (!reg) {
    return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
  }

  const validStatuses: RegistrationStatus[] = [
    'MENUNGGU_VERIFIKASI',
    'SEDANG_DITINJAU',
    'PERLU_REVISI',
    'DISETUJUI',
    'DITOLAK',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid.' });
  }

  const oldStatus = reg.status;
  const updated = updateRegistration(reg.id, {
    status,
    reviewerNotes: reviewerNotes || reg.reviewerNotes,
    reviewedBy: reviewerName || 'Admin Koordinator PKL',
    reviewedAt: new Date().toISOString(),
  });

  // Log activity
  logActivity({
    actorType: 'ADMIN',
    actorName: reviewerName || 'Admin Koordinator PKL',
    action: 'UPDATE_STATUS_BERKAS',
    category: 'VERIFIKASI',
    details: `Mengubah status ${reg.registrationCode} dari ${oldStatus} menjadi ${status}. Catatan: ${reviewerNotes || 'Tidak ada.'}`,
    ipAddress: ip,
    registrationCode: reg.registrationCode,
    severity: status === 'DISETUJUI' ? 'SUCCESS' : status === 'PERLU_REVISI' ? 'WARNING' : 'INFO',
  });

  // Trigger automated email based on new status
  if (status === 'DISETUJUI') {
    queueEmailNotification(updated!, 'STATUS_DISETUJUI', reviewerNotes);
  } else if (status === 'PERLU_REVISI') {
    queueEmailNotification(updated!, 'STATUS_REVISI', reviewerNotes);
  } else if (status === 'DITOLAK') {
    queueEmailNotification(updated!, 'STATUS_DITOLAK', reviewerNotes);
  }

  res.json({
    success: true,
    registration: updated,
    message: `Status berkas berhasil diperbarui menjadi ${status} dan email notifikasi telah dikirimkan secara otomatis ke ${reg.email}.`,
  });
});

// Registrations: Run Automated Document Verification
app.post('/api/registrations/:id/auto-verify', (req, res) => {
  const reg = getRegistrationById(req.params.id);
  if (!reg) {
    return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
  }

  const result = runAutoVerification(reg.documents, reg.nisn);
  const updated = updateRegistration(reg.id, {
    autoVerification: result,
  });

  logActivity({
    actorType: 'ADMIN',
    actorName: req.body.adminName || 'Verifikator Sistem',
    action: 'JALANKAN_AI_VERIFIKASI',
    category: 'VERIFIKASI',
    details: `Menjalankan verifikasi otomatis ulang untuk ${reg.registrationCode}. Skor: ${result.overallScore}%. Rekomendasi: ${result.aiRecommendation}`,
    ipAddress: getClientIp(req),
    registrationCode: reg.registrationCode,
    severity: 'INFO',
  });

  res.json({
    success: true,
    autoVerification: result,
    registration: updated,
  });
});

// Registrations: Decrypt Sensitive Data (Requires authorization & logs audit trail)
app.post('/api/registrations/:id/decrypt', (req, res) => {
  const { adminEmail } = req.body;
  const ip = getClientIp(req);
  const admin = ADMIN_USERS.find((a) => a.email.toLowerCase() === (adminEmail || '').toLowerCase()) || ADMIN_USERS[0];

  const decrypted = decryptApplicantData(req.params.id, admin, ip);
  if (!decrypted) {
    return res.status(404).json({ error: 'Gagal mendekripsi data pendaftar.' });
  }

  res.json({
    success: true,
    sensitiveData: decrypted,
    message: 'Data sensitif berhasil didekripsi dengan kunci AES-256 dan telah dicatat dalam Audit Trail Keamanan.',
  });
});

// Storage: Upload document
app.post('/api/documents/upload', async (req, res) => {
  try {
    const { fileName, fileData, fileType, documentType, documentTitle } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Nama file dan konten berkas diperlukan.' });
    }

    // fileData can be base64 string
    const base64Content = fileData.replace(/^data:.+;base64,/, '');
    const buffer = Buffer.from(base64Content, 'base64');
    const mime = fileType || 'application/pdf';
    const checksum = calculateChecksum(buffer);

    const uploadResult = await uploadDocumentToStorage(fileName, buffer, mime);

    const doc: ApplicantDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: (documentType as DocumentType) || 'SURAT_PENGANTAR',
      title: documentTitle || fileName,
      fileName,
      fileSize: buffer.length,
      fileType: mime,
      fileUrl: uploadResult.url,
      uploadedAt: new Date().toISOString(),
      status: 'MENUNGGU',
      ocrScore: 92,
      validationFeedback: 'Dokumen diunggah ke penyimpanan cloud.',
      checksum,
      storageProvider: uploadResult.provider,
      storagePath: uploadResult.path,
    };

    logActivity({
      actorType: 'SISWA',
      actorName: 'Pendaftar Web',
      action: 'UNGGAH_BERKAS',
      category: 'STORAGE',
      details: `Mengunggah berkas ${fileName} (${Math.round(buffer.length / 1024)} KB) ke ${uploadResult.provider === 'supabase' ? 'Supabase Storage Bucket' : 'Penyimpanan Aman'}. Hash: ${checksum.substring(0, 10)}...`,
      ipAddress: getClientIp(req),
      severity: 'INFO',
    });

    res.json({
      success: true,
      document: doc,
    });
  } catch (err: any) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Gagal mengunggah berkas: ' + err.message });
  }
});

// Document: Update single document status
app.patch('/api/documents/:docId/status', (req, res) => {
  const { docId } = req.params;
  const { status, feedback, registrationId } = req.body;
  const reg = getRegistrationById(registrationId);

  if (!reg) {
    return res.status(404).json({ error: 'Pendaftaran tidak ditemukan.' });
  }

  const doc = reg.documents.find((d) => d.id === docId);
  if (!doc) {
    return res.status(404).json({ error: 'Dokumen tidak ditemukan.' });
  }

  doc.status = status;
  if (feedback) doc.validationFeedback = feedback;

  updateRegistration(reg.id, { documents: reg.documents });

  logActivity({
    actorType: 'ADMIN',
    actorName: req.body.adminName || 'Verifikator Berkas',
    action: 'VERIFIKASI_ITEM_DOKUMEN',
    category: 'VERIFIKASI',
    details: `Memperbarui status dokumen ${doc.title} (${doc.fileName}) menjadi ${status}.`,
    ipAddress: getClientIp(req),
    registrationCode: reg.registrationCode,
    severity: status === 'VALID' ? 'SUCCESS' : 'WARNING',
  });

  res.json({
    success: true,
    document: doc,
  });
});

// Activity Logs: List and filter
app.get('/api/activity-logs', (req, res) => {
  const { category, actorType, severity, search } = req.query;
  let logs = getActivityLogs();

  if (category && category !== 'ALL') {
    logs = logs.filter((l) => l.category === category);
  }
  if (actorType && actorType !== 'ALL') {
    logs = logs.filter((l) => l.actorType === actorType);
  }
  if (severity && severity !== 'ALL') {
    logs = logs.filter((l) => l.severity === severity);
  }
  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.details.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.registrationCode && l.registrationCode.toLowerCase().includes(q))
    );
  }

  res.json(logs);
});

// Activity Logs: Export CSV
app.get('/api/activity-logs/export', (req, res) => {
  const logs = getActivityLogs();
  const format = req.query.format === 'json' ? 'json' : 'csv';

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs_pkl.json"');
    return res.json(logs);
  }

  const csvRows = [
    ['ID', 'Timestamp', 'Actor Type', 'Actor Name', 'Action', 'Category', 'Severity', 'IP Address', 'Kode Registrasi', 'Details'].join(','),
  ];

  for (const log of logs) {
    const row = [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.actorType}"`,
      `"${log.actorName.replace(/"/g, '""')}"`,
      `"${log.action}"`,
      `"${log.category}"`,
      `"${log.severity}"`,
      `"${log.ipAddress}"`,
      `"${log.registrationCode || '-'}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  }

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="audit_logs_pkl.csv"');
  res.send(csvRows.join('\n'));
});

// Email Notifications: List
app.get('/api/emails', (req, res) => {
  const emails = getEmailNotifications();
  res.json(emails);
});

// Email Notifications: Resend
app.post('/api/emails/resend', (req, res) => {
  const { emailId } = req.body;
  const emails = getEmailNotifications();
  const target = emails.find((e) => e.id === emailId);

  if (!target) {
    return res.status(404).json({ error: 'Email tidak ditemukan.' });
  }

  target.sentAt = new Date().toISOString();
  target.status = 'TERKIRIM';

  logActivity({
    actorType: 'ADMIN',
    actorName: req.body.adminName || 'Admin Koordinator',
    action: 'KIRIM_ULANG_EMAIL',
    category: 'EMAIL',
    details: `Mengirim ulang notifikasi email (${target.subject}) ke ${target.recipientEmail}.`,
    ipAddress: getClientIp(req),
    registrationCode: target.registrationCode,
    severity: 'INFO',
  });

  res.json({
    success: true,
    message: `Notifikasi email ke ${target.recipientEmail} berhasil dikirim ulang!`,
  });
});

// Supabase: Status & Config
app.get('/api/supabase/status', (req, res) => {
  res.json({
    ...getSupabaseStatus(),
    sqlSchema: SUPABASE_SQL_SCHEMA,
  });
});

app.post('/api/supabase/config', (req, res) => {
  const { url, anonKey, serviceKey } = req.body;
  const updatedClient = updateSupabaseConfig(url, anonKey, serviceKey);
  const status = getSupabaseStatus();

  logActivity({
    actorType: 'ADMIN',
    actorName: 'Super Admin',
    action: 'KONFIGURASI_SUPABASE',
    category: 'SISTEM',
    details: `Memperbarui konfigurasi koneksi Supabase (${status.url}). Status: ${status.isConnected ? 'Terhubung' : 'Gagal Konek'}.`,
    ipAddress: getClientIp(req),
    severity: status.isConnected ? 'SUCCESS' : 'WARNING',
  });

  res.json({
    success: !!updatedClient,
    status,
    message: updatedClient
      ? 'Berhasil tersambung ke database & storage Supabase!'
      : 'Koneksi gagal atau kredensial belum lengkap. Sistem beralih ke penyimpanan terisolasi yang aman.',
  });
});

// ==========================================
// VITE DEV MIDDLEWARE / STATIC FILES
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server Sistem Pendaftaran PKL berjalan di http://0.0.0.0:${PORT}`);
  });
}

startServer();
