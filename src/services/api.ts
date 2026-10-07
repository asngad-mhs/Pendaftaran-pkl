import {
  ActivityLog,
  AdminUser,
  ApplicantDocument,
  AutoVerificationSummary,
  DashboardStats,
  EmailNotification,
  Registration,
  RegistrationStatus,
  SensitiveData,
  SupabaseConfigState,
} from '../types';

export const api = {
  // Stats
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Gagal mengambil statistik dashboard');
    return res.json();
  },

  // Registrations
  async getRegistrations(filters?: { status?: string; major?: string; search?: string }): Promise<Registration[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters?.major && filters.major !== 'ALL') params.append('major', filters.major);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/registrations?${params.toString()}`);
    if (!res.ok) throw new Error('Gagal mengambil daftar pendaftaran');
    return res.json();
  },

  async getRegistrationById(id: string): Promise<Registration> {
    const res = await fetch(`/api/registrations/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Pendaftaran tidak ditemukan');
    return res.json();
  },

  async createRegistration(data: any): Promise<{ registration: Registration; message: string }> {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengirim pendaftaran');
    }
    return res.json();
  },

  async updateStatus(
    id: string,
    status: RegistrationStatus,
    reviewerNotes: string,
    reviewerName: string
  ): Promise<{ registration: Registration; message: string }> {
    const res = await fetch(`/api/registrations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewerNotes, reviewerName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal memperbarui status berkas');
    }
    return res.json();
  },

  async runAutoVerification(id: string, adminName?: string): Promise<{ autoVerification: AutoVerificationSummary; registration: Registration }> {
    const res = await fetch(`/api/registrations/${id}/auto-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminName }),
    });
    if (!res.ok) throw new Error('Gagal menjalankan verifikasi otomatis');
    return res.json();
  },

  async decryptData(id: string, adminEmail: string): Promise<{ sensitiveData: SensitiveData; message: string }> {
    const res = await fetch(`/api/registrations/${id}/decrypt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mendekripsi data');
    }
    return res.json();
  },

  // Documents
  async uploadDocument(data: {
    fileName: string;
    fileData: string; // base64
    fileType: string;
    documentType: string;
    documentTitle: string;
  }): Promise<{ document: ApplicantDocument }> {
    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal mengunggah dokumen');
    }
    return res.json();
  },

  async updateDocumentStatus(
    docId: string,
    registrationId: string,
    status: ApplicantDocument['status'],
    feedback?: string,
    adminName?: string
  ): Promise<{ document: ApplicantDocument }> {
    const res = await fetch(`/api/documents/${docId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, feedback, registrationId, adminName }),
    });
    if (!res.ok) throw new Error('Gagal memperbarui status dokumen');
    return res.json();
  },

  // Auth
  async login(email: string, password?: string): Promise<{ user: AdminUser; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login gagal');
    }
    return res.json();
  },

  // Activity Logs
  async getActivityLogs(filters?: { category?: string; actorType?: string; severity?: string; search?: string }): Promise<ActivityLog[]> {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.actorType && filters.actorType !== 'ALL') params.append('actorType', filters.actorType);
    if (filters?.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/activity-logs?${params.toString()}`);
    if (!res.ok) throw new Error('Gagal mengambil audit logs');
    return res.json();
  },

  // Emails
  async getEmails(): Promise<EmailNotification[]> {
    const res = await fetch('/api/emails');
    if (!res.ok) throw new Error('Gagal mengambil log email');
    return res.json();
  },

  async resendEmail(emailId: string, adminName?: string): Promise<{ message: string }> {
    const res = await fetch('/api/emails/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailId, adminName }),
    });
    if (!res.ok) throw new Error('Gagal mengirim ulang email');
    return res.json();
  },

  // Supabase Config
  async getSupabaseStatus(): Promise<SupabaseConfigState & { sqlSchema: string }> {
    const res = await fetch('/api/supabase/status');
    if (!res.ok) throw new Error('Gagal mengambil status Supabase');
    return res.json();
  },

  async updateSupabaseConfig(data: { url: string; anonKey: string; serviceKey?: string }): Promise<{ success: boolean; message: string; status: SupabaseConfigState }> {
    const res = await fetch('/api/supabase/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Gagal memperbarui konfigurasi Supabase');
    return res.json();
  },
};
