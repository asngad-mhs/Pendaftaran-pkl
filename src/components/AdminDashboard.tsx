import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Eye,
  FileText,
  Mail,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { AdminUser, DashboardStats, Registration, RegistrationStatus } from '../types';
import { api } from '../services/api';
import { ApplicantDetailModal } from './ApplicantDetailModal';

interface AdminDashboardProps {
  currentUser: AdminUser | null;
  onOpenLogin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onOpenLogin }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [majorFilter, setMajorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected applicant for detail modal
  const [selectedApplicant, setSelectedApplicant] = useState<Registration | null>(null);

  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setRefreshing(true);
    try {
      const [statsData, regsData] = await Promise.all([
        api.getStats(),
        api.getRegistrations({
          status: statusFilter,
          major: majorFilter,
          search: searchQuery,
        }),
      ]);
      setStats(statsData);
      setRegistrations(regsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Real-time polling every 12 seconds for auto synchronization
    const timer = setInterval(() => {
      fetchData(true);
    }, 12000);
    return () => clearInterval(timer);
  }, [statusFilter, majorFilter, searchQuery]);

  // Batch Auto-Verify for all applicants
  const handleBatchAutoVerify = async () => {
    setRefreshing(true);
    try {
      for (const reg of registrations) {
        if (!reg.autoVerification) {
          await api.runAutoVerification(reg.id, currentUser?.name);
        }
      }
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: RegistrationStatus) => {
    switch (status) {
      case 'DISETUJUI':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded">Disetujui</span>;
      case 'PERLU_REVISI':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded">Perlu Revisi</span>;
      case 'SEDANG_DITINJAU':
        return <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded">Sedang Ditinjau</span>;
      case 'DITOLAK':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded">Ditolak</span>;
      default:
        return <span className="bg-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded">Menunggu Verifikasi</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Verifikasi Berkas PKL
            </h1>
            <span className="flex items-center text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
              REAL-TIME SYNC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau dan kelola berkas pendaftaran siswa secara real-time dengan verifikasi otomatis & enkripsi privasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            Segarkan
          </button>

          <button
            onClick={handleBatchAutoVerify}
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Auto-Verify Seluruh Berkas
          </button>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Pendaftar</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{stats.totalApplicants}</div>
            <div className="text-[11px] text-slate-400 mt-1">Siswa Terdaftar di Sistem</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Menunggu Verifikasi</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{stats.pendingCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Antrean Berkas Masuk</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Sedang Ditinjau</span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-extrabold text-sky-600">{stats.underReviewCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Proses Sinkronisasi Kuota</div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Perlu Revisi</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700">{stats.revisionNeededCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Menunggu Unggah Ulang Siswa</div>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Disetujui Resmi</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-emerald-600">{stats.approvedCount}</span>
              <span className="text-xs text-emerald-700 font-semibold font-mono">({stats.approvalRate}%)</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Tingkat Kelulusan Seleksi</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status segmented buttons */}
        <div className="flex items-center overflow-x-auto w-full md:w-auto pb-2 md:pb-0 gap-1 text-xs">
          {[
            { key: 'ALL', label: 'Semua Status' },
            { key: 'MENUNGGU_VERIFIKASI', label: 'Menunggu' },
            { key: 'SEDANG_DITINJAU', label: 'Ditinjau' },
            { key: 'PERLU_REVISI', label: 'Perlu Revisi' },
            { key: 'DISETUJUI', label: 'Disetujui' },
            { key: 'DITOLAK', label: 'Ditolak' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === item.key
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search & Major Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, atau kode..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
            className="bg-white border border-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-700"
          >
            <option value="ALL">Semua Jurusan</option>
            <option value="RPL">RPL</option>
            <option value="TKJ">TKJ</option>
            <option value="Multimedia">Multimedia / DKV</option>
            <option value="Informatika">Teknik Informatika</option>
          </select>
        </div>
      </div>

      {/* Main Registrations Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Pendaftar & Sekolah</th>
                <th className="py-3 px-4">Jurusan & Divisi Tujuan</th>
                <th className="py-3 px-4">Keamanan NIK</th>
                <th className="py-3 px-4">Auto-Verify AI</th>
                <th className="py-3 px-4">Kelengkapan Berkas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada data pendaftaran yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{reg.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {reg.schoolName} · <span className="font-mono text-sky-700">{reg.registrationCode}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{reg.major}</div>
                      <div className="text-[11px] text-sky-700 font-semibold">{reg.targetDepartment}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {reg.encryptedSensitiveData.maskedNik}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800">
                          {reg.autoVerification?.overallScore || 90}%
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            reg.autoVerification?.passed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {reg.autoVerification?.aiRecommendation || 'TERIMA'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600">
                        {reg.documents.filter((d) => d.status === 'VALID').length} / {reg.documents.length} Valid
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(reg.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApplicant(reg)}
                        className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Tinjau Berkas
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant Detail Drawer / Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          currentUser={currentUser}
          onClose={() => setSelectedApplicant(null)}
          onUpdated={(updated) => {
            setSelectedApplicant(updated);
            fetchData();
          }}
        />
      )}
    </div>
  );
};
