import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { EmailNotification } from '../types';
import { api } from '../services/api';

export const EmailOutboxModal: React.FC = () => {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string>('');

  const fetchEmails = async () => {
    setRefreshing(true);
    try {
      const data = await api.getEmails();
      setEmails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleResend = async (email: EmailNotification) => {
    setResendingId(email.id);
    try {
      const res = await api.resendEmail(email.id);
      setToastMsg(res.message);
      await fetchEmails();
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err: any) {
      alert('Gagal mengirim ulang email: ' + err.message);
    } finally {
      setResendingId(null);
    }
  };

  const getEventBadge = (event: EmailNotification['event']) => {
    switch (event) {
      case 'STATUS_DISETUJUI':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">DISETUJUI RESMI</span>;
      case 'STATUS_REVISI':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">PERMINTAAN REVISI</span>;
      case 'STATUS_DITOLAK':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">DITOLAK</span>;
      default:
        return <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">PENDAFTARAN BARU</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Log Pengiriman Notifikasi Email Otomatis
            </h1>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200 font-bold">
              SMTP / Webhook Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Riwayat lengkap surel konfirmasi pendaftaran dan pembaruan status berkas yang terkirim ke siswa.
          </p>
        </div>

        <button
          onClick={fetchEmails}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
          Segarkan Antrean
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold">
          ✓ {toastMsg}
        </div>
      )}

      {/* Email Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Penerima & Siswa</th>
                <th className="py-3 px-4">Subjek Email</th>
                <th className="py-3 px-4">Peristiwa Pemicu</th>
                <th className="py-3 px-4">Kode Registrasi</th>
                <th className="py-3 px-4">Waktu Terkirim</th>
                <th className="py-3 px-4">Status Pengiriman</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat email notifikasi yang dikirimkan.
                  </td>
                </tr>
              ) : (
                emails.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.recipientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.recipientEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs font-medium text-slate-800 truncate">
                      {item.subject}
                    </td>

                    <td className="py-3.5 px-4">{getEventBadge(item.event)}</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700">
                      {item.registrationCode}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(item.sentAt).toLocaleString('id-ID')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEmail(item)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Pratinjau
                      </button>
                      <button
                        onClick={() => handleResend(item)}
                        disabled={resendingId === item.id}
                        className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        {resendingId === item.id ? 'Mengirim...' : 'Kirim Ulang'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rendered HTML Email Preview Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                  PRATINJAU SUREL ASLI
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-lg mt-0.5">
                  {selectedEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Meta bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 text-xs text-slate-600 flex flex-wrap justify-between gap-2">
              <div>
                <strong>Kepada:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;
              </div>
              <div>
                <strong>Waktu:</strong> {new Date(selectedEmail.sentAt).toLocaleString('id-ID')}
              </div>
            </div>

            {/* Rendered Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              <div
                className="bg-white rounded-xl shadow-xs overflow-hidden max-w-xl mx-auto"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlPreview }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
