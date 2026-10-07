import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Filter,
  Search,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';
import { ActivityLog } from '../types';
import { api } from '../services/api';

export const ActivityLogView: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [actorTypeFilter, setActorTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = async () => {
    setRefreshing(true);
    try {
      const data = await api.getActivityLogs({
        category: categoryFilter,
        actorType: actorTypeFilter,
        severity: severityFilter,
        search: searchQuery,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [categoryFilter, actorTypeFilter, severityFilter, searchQuery]);

  const handleExport = (format: 'csv' | 'json') => {
    window.open(`/api/activity-logs/export?format=${format}`, '_blank');
  };

  const getSeverityBadge = (severity: ActivityLog['severity']) => {
    switch (severity) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3" /> CRITICAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <Info className="w-3 h-3" /> INFO
          </span>
        );
    }
  };

  const getCategoryIcon = (category: ActivityLog['category']) => {
    switch (category) {
      case 'ENKRIPSI':
        return <Lock className="w-3.5 h-3.5 text-amber-600" />;
      case 'AUTH':
        return <UserCheck className="w-3.5 h-3.5 text-sky-600" />;
      case 'EMAIL':
        return <Mail className="w-3.5 h-3.5 text-indigo-600" />;
      case 'VERIFIKASI':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'STORAGE':
        return <Server className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Metrics
  const encryptionCount = logs.filter((l) => l.category === 'ENKRIPSI').length;
  const verificationCount = logs.filter((l) => l.category === 'VERIFIKASI').length;
  const emailCount = logs.filter((l) => l.category === 'EMAIL').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Modul Laporan Aktivitas Pengguna (Audit Trail)
            </h1>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-300 font-bold">
              {logs.length} Aktivitas Terekam
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak komprehensif audit keamanan, dekripsi data sensitif, verifikasi berkas, dan notifikasi email.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            Segarkan
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor CSV
          </button>

          <button
            onClick={() => handleExport('json')}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor JSON
          </button>
        </div>
      </div>

      {/* Mini metric badges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Aktivitas
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{logs.length} Log</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Akses Enkripsi & Privasi
          </span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">{encryptionCount} Akses</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Verifikasi & Putusan
          </span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">{verificationCount} Tindakan</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">
            Notifikasi Terkirim
          </span>
          <span className="text-xl font-bold text-sky-600 mt-1 block">{emailCount} Pengiriman</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari rincian log, aktor, IP, atau kode..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-700"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="AUTH">Otentikasi (AUTH)</option>
            <option value="PENDAFTARAN">Pendaftaran Siswa</option>
            <option value="VERIFIKASI">Verifikasi Berkas</option>
            <option value="ENKRIPSI">Enkripsi & Dekripsi</option>
            <option value="EMAIL">Notifikasi Email</option>
            <option value="STORAGE">Penyimpanan Berkas</option>
            <option value="SISTEM">Sistem</option>
          </select>

          <select
            value={actorTypeFilter}
            onChange={(e) => setActorTypeFilter(e.target.value)}
            className="bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-700"
          >
            <option value="ALL">Semua Aktor</option>
            <option value="ADMIN">Admin</option>
            <option value="SISWA">Siswa</option>
            <option value="SISTEM">Sistem Otomatis</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-700"
          >
            <option value="ALL">Semua Tingkat Keparahan</option>
            <option value="INFO">INFO</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARNING">WARNING</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Aktor & IP</th>
                <th className="py-3 px-4">Kategori & Aksi</th>
                <th className="py-3 px-4">Kode Registrasi</th>
                <th className="py-3 px-4">Rincian Aktivitas</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada aktivitas yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-slate-500">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.actorType} · {log.ipAddress}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        {getCategoryIcon(log.category)}
                        <span>{log.action}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">{log.category}</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-sky-700">
                      {log.registrationCode || '-'}
                    </td>

                    <td className="py-3 px-4 max-w-md text-slate-800">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
