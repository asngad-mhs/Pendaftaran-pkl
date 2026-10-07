import React, { useState } from 'react';
import { X, Lock, LogIn, Shield, UserCheck, Sparkles } from 'lucide-react';
import { AdminUser } from '../types';
import { api } from '../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState<string>('admin@instansi.go.id');
  const [password, setPassword] = useState<string>('admin123');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Login Petugas & Verifikator PKL</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Masuk untuk meninjau berkas siswa, dekripsi data sensitif, dan memutakhirkan status persetujuan.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs">
              {errorMsg}
            </div>
          )}

          {/* Quick Demo Accounts */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Akun Demonstrasi Cepat (1-Klik):
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@instansi.go.id')}
                className={`p-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                  email === 'admin@instansi.go.id'
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <strong className="block font-semibold">Budi Santoso, M.Kom</strong>
                  <span className="text-[11px] text-slate-500">Super Admin (Akses Penuh & Dekripsi)</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">Pilih</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('koordinator@pkl.id')}
                className={`p-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                  email === 'koordinator@pkl.id'
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <strong className="block font-semibold">Dewi Lestari, S.T</strong>
                  <span className="text-[11px] text-slate-500">Koordinator Divisi PKL</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">Pilih</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('verifikator@pkl.id')}
                className={`p-2 rounded-lg border text-left transition-colors flex items-center justify-between ${
                  email === 'verifikator@pkl.id'
                    ? 'border-sky-500 bg-sky-50 text-sky-900'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <strong className="block font-semibold">Rian Prasetyo, S.Pd</strong>
                  <span className="text-[11px] text-slate-500">Verifikator Kelengkapan Berkas</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">Pilih</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Petugas
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
              <span className="text-[11px] text-slate-400">Password default demo: <code className="font-mono">admin123</code></span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Memverifikasi Akun...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
