import React from 'react';
import {
  Shield,
  FileCheck2,
  UserCheck,
  History,
  Mail,
  Database,
  Search,
  LogIn,
  LogOut,
  ChevronDown,
  Building2,
  BookOpen,
} from 'lucide-react';
import { AdminUser } from '../types';

interface NavbarProps {
  activeTab: 'register' | 'track' | 'admin' | 'logs' | 'emails' | 'supabase';
  setActiveTab: (tab: 'register' | 'track' | 'admin' | 'logs' | 'emails' | 'supabase') => void;
  currentUser: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  supabaseConnected: boolean;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLogin,
  onLogout,
  supabaseConnected,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('register')}>
            <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-white">PORTAL PKL TERPADU</span>
                <span className="flex items-center text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                  LIVE REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Verifikasi Dokumen Otomatis & Enkripsi AES-256
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'register'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Pendaftaran Siswa
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'track'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Lacak Status Berkas
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Dashboard Admin
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Audit Aktivitas
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'emails'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Notifikasi Email
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'supabase'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Supabase & Enkripsi
            </button>
          </nav>

          {/* User / Login Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs"
              title="Buka Panduan Lengkap"
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Panduan</span>
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold leading-tight text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-sky-400 font-mono">{currentUser.role}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Keluar Admin"
                  className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login Admin
              </button>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation */}
        <div className="lg:hidden flex overflow-x-auto py-2 border-t border-slate-800 gap-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('register')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'register' ? 'bg-sky-700 text-white' : 'text-slate-400'}`}
          >
            Pendaftaran
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'track' ? 'bg-sky-700 text-white' : 'text-slate-400'}`}
          >
            Lacak Berkas
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'admin' ? 'bg-sky-700 text-white' : 'text-slate-400'}`}
          >
            Dashboard Admin
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'logs' ? 'bg-sky-700 text-white' : 'text-slate-400'}`}
          >
            Audit Logs
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'emails' ? 'bg-sky-700 text-white' : 'text-slate-400'}`}
          >
            Email
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'supabase' ? 'bg-sky-700 text-white' : 'text-slate-400'}`}
          >
            Supabase
          </button>
        </div>
      </div>
    </header>
  );
};
