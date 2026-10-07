import { EmailNotification, Registration, RegistrationStatus } from '../src/types';

export function generateEmailHtml(
  registration: Registration,
  event: EmailNotification['event'],
  reviewerNotes?: string
): { subject: string; html: string } {
  const code = registration.registrationCode;
  const name = registration.fullName;
  const school = registration.schoolName;
  const major = registration.major;
  const dept = registration.targetDepartment;
  const notes = reviewerNotes || registration.reviewerNotes || 'Tidak ada catatan tambahan.';

  let statusBadgeColor = '#2563eb';
  let statusText = 'Sedang Diproses';
  let subject = `[PKL-Online] Notifikasi Pendaftaran ${code} - ${name}`;
  let headline = 'Pemberitahuan Status Berkas PKL';
  let messageContent = '';

  switch (event) {
    case 'PENDAFTARAN_BERHASIL':
      statusBadgeColor = '#0284c7';
      statusText = 'BERKAS DITERIMA';
      subject = `[PKL-Online] Bukti Pendaftaran PKL Berhasil - ${code} (${name})`;
      headline = 'Pendaftaran PKL Anda Telah Masuk ke Sistem';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Halo <strong>${name}</strong> dari <strong>${school}</strong> (${major}),
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Berkas pendaftaran Praktik Kerja Lapangan (PKL) Anda pada divisi <strong>${dept}</strong> telah berhasil kami terima.
          Tim verifikator dan sistem AI kami saat ini sedang memeriksa keabsahan dokumen pendukung Anda.
        </p>
        <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 4px; margin: 18px 0;">
          <p style="margin: 0; font-size: 14px; color: #1e293b;">
            <strong>Kode Registrasi Anda:</strong> <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #0369a1;">${code}</span>
          </p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #64748b;">
            Simpan kode ini dengan baik untuk memantau status persetujuan secara berkala melalui portal pelacakan.
          </p>
        </div>
      `;
      break;

    case 'STATUS_DISETUJUI':
      statusBadgeColor = '#059669';
      statusText = 'DISETUJUI / DITERIMA';
      subject = `[PKL-Online] SELAMAT! Berkas Pendaftaran PKL Anda Diterima & Disetujui (${code})`;
      headline = 'Selamat, Pengajuan PKL Anda Telah Disetujui!';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Yth. <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Berdasarkan hasil verifikasi dokumen dan kualifikasi kejuruan, permohonan Praktik Kerja Lapangan Anda di <strong>Divisi ${dept}</strong> dinyatakan <strong>DISETUJUI RESMI</strong>.
        </p>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px; color: #065f46; font-size: 15px;">Catatan & Arahan Pembimbing Lapangan:</h4>
          <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.5;">${notes}</p>
        </div>
        <p style="margin: 0 0 12px; font-size: 14px; color: #475569;">
          <strong>Jadwal Pelaksanaan:</strong> ${registration.startDate} s/d ${registration.endDate}
        </p>
        <p style="margin: 0 0 12px; font-size: 14px; color: #475569;">
          Silakan persiapkan Surat Tugas resmi dan hadir pada pengarahan awal (Onboarding) sesuai jadwal yang tertera.
        </p>
      `;
      break;

    case 'STATUS_REVISI':
      statusBadgeColor = '#d97706';
      statusText = 'MEMERLUKAN PERBAIKAN';
      subject = `[PKL-Online] Tindakan Diperlukan: Perbaikan Dokumen Pendaftaran PKL (${code})`;
      headline = 'Dokumen Pendaftaran Memerlukan Revisi';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Halo <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Setelah dilakukan peninjauan dokumen, terdapat beberapa berkas yang belum memenuhi standar atau memerlukan perbaikan sebelum dapat diproses lebih lanjut.
        </p>
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px; color: #92400e; font-size: 15px;">Detail Revisi yang Harus Dilakukan:</h4>
          <p style="margin: 0; color: #b45309; font-size: 14px; line-height: 1.5; font-weight: 500;">
            ${notes}
          </p>
        </div>
        <p style="margin: 0 0 14px; font-size: 14px; color: #475569;">
          Silakan buka portal pendaftaran, masukkan kode registrasi Anda, dan unggah berkas perbaikan paling lambat 3 (tiga) hari kerja sejak surel ini diterima.
        </p>
      `;
      break;

    case 'STATUS_DITOLAK':
      statusBadgeColor = '#dc2626';
      statusText = 'BELUM DAPAT DITERIMA';
      subject = `[PKL-Online] Pemberitahuan Hasil Seleksi Berkas PKL (${code})`;
      headline = 'Pemberitahuan Hasil Seleksi Berkas PKL';
      messageContent = `
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Yth. <strong>${name}</strong>,
        </p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
          Terima kasih atas ketertarikan Anda untuk melaksanakan Praktik Kerja Lapangan bersama instansi kami.
          Mohon maaf, saat ini kami belum dapat menyetujui permohonan Anda untuk penempatan periode ${registration.startDate} - ${registration.endDate} dikarenakan kapasitas kuota divisi atau ketidaksesuaian prasyarat.
        </p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 6px; color: #991b1b; font-size: 14px;">Catatan Verifikator:</h4>
          <p style="margin: 0; color: #b91c1c; font-size: 14px;">${notes}</p>
        </div>
      `;
      break;

    default:
      subject = `[PKL-Online] Pembaruan Status Berkas PKL ${code}`;
      messageContent = `<p>Status berkas Anda saat ini telah diperbarui menjadi <strong>${registration.status}</strong>.</p>`;
  }

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a;">
  <div style="max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; color: #ffffff;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8;">PORTAL RESMI PKL</span>
        <span style="background-color: ${statusBadgeColor}; color: #ffffff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${statusText}</span>
      </div>
      <h1 style="margin: 12px 0 0; font-size: 20px; font-weight: 700; line-height: 1.3; color: #ffffff;">${headline}</h1>
      <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Instansi Mitra & Verifikasi Dokumen Digital</p>
    </div>

    <!-- Body -->
    <div style="padding: 32px;">
      ${messageContent}

      <!-- Metadata Box -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 24px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
        <tr>
          <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0; width: 40%;">Kode Registrasi</td>
          <td style="padding: 10px 16px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${code}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Nama Siswa / Mahasiswa</td>
          <td style="padding: 10px 16px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #64748b; border-bottom: 1px solid #e2e8f0;">Asal Instansi / Sekolah</td>
          <td style="padding: 10px 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${school} (${major})</td>
        </tr>
        <tr>
          <td style="padding: 10px 16px; color: #64748b;">Divisi Penempatan</td>
          <td style="padding: 10px 16px; font-weight: 600; color: #0284c7;">${dept}</td>
        </tr>
      </table>

      <!-- Security Notice -->
      <div style="margin-top: 24px; padding: 12px; background-color: #f8fafc; border-radius: 6px; font-size: 12px; color: #64748b; text-align: center;">
        🛡️ Seluruh data identitas siswa (NIK, Kontak, Dokumen) dilindungi dengan standar enkripsi <strong>AES-256</strong> & Cloud Storage terverifikasi.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 6px;">Surel ini dikirimkan secara otomatis oleh Sistem Pendaftaran PKL Terpadu.</p>
      <p style="margin: 0;">Harap tidak membalas email ini secara langsung (No-Reply).</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
