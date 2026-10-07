import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentRegistrationWizard } from './components/StudentRegistrationWizard';
import { StudentTrackingPortal } from './components/StudentTrackingPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { ActivityLogView } from './components/ActivityLogView';
import { EmailOutboxModal } from './components/EmailOutboxModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { UserGuideModal } from './components/UserGuideModal';
import { AdminUser } from './types';
import { ShieldCheck, Heart, Database, Lock, Mail } from 'lucide-react';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'register' | 'track' | 'admin' | 'logs' | 'emails' | 'supabase'>('register');
  const [currentUser, setCurrentUser] = useState<AdminUser | null>({
    id: 'adm-01',
    name: 'Budi Santoso, M.Kom',
    email: 'admin@instansi.go.id',
    role: 'SUPER_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  useEffect(() => {
    api.getSupabaseStatus()
      .then((res) => {
        setSupabaseConnected(res.isConnected);
      })
      .catch(() => {});
  }, []);

  const handleRegistrationSuccess = (regCode: string) => {
    setTrackingCode(regCode);
  };

  const handleNavigateToTrack = (regCode: string) => {
    setTrackingCode(regCode);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => setCurrentUser(null)}
        supabaseConnected={supabaseConnected}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'register' && (
          <StudentRegistrationWizard
            onSuccess={handleRegistrationSuccess}
            onNavigateToTrack={handleNavigateToTrack}
          />
        )}

        {activeTab === 'track' && (
          <StudentTrackingPortal initialCode={trackingCode} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'logs' && <ActivityLogView />}

        {activeTab === 'emails' && <EmailOutboxModal />}

        {activeTab === 'supabase' && <SupabaseConfigModal />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">PORTAL PKL TERPADU 2026</span>
            <span>·</span>
            <span>Frontend React & Vite · Backend Express/Next.js API Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-600">
              <Database className="w-3.5 h-3.5 text-emerald-600" /> Supabase Storage & SQL Ready
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Enkripsi Data Sensitif AES-256
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-sky-600" /> Notifikasi Email Otomatis
            </span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* Interactive User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onSwitchTab={(tab) => {
          setActiveTab(tab);
          setIsGuideModalOpen(false);
        }}
      />
    </div>
  );
}
