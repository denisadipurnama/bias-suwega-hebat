import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ConsentForm } from './components/ConsentForm';
import { PublicRecap } from './components/PublicRecap';
import { AdminPortal } from './components/AdminPortal';
import { SuccessModal } from './components/SuccessModal';
import { IntegrationGuideModal } from './components/IntegrationGuideModal';
import { ConsentSubmission, OverallStatistics } from './types';
import {
  loadSubmissions,
  saveSubmissions,
  calculateStatistics,
  loadGasConfig,
  getAdminAuth
} from './utils/storage';
import {
  FileText,
  BarChart2,
  ShieldAlert,
  BookOpen,
  Building,
  HeartHandshake,
  CheckCircle,
  ExternalLink,
  Info,
  Lock
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'recap' | 'admin'>('form');
  const [submissions, setSubmissions] = useState<ConsentSubmission[]>([]);
  const [stats, setStats] = useState<OverallStatistics | null>(null);
  const [successSubmission, setSuccessSubmission] = useState<ConsentSubmission | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => getAdminAuth());

  // Load existing submissions on mount
  useEffect(() => {
    const data = loadSubmissions();
    setSubmissions(data);
    setStats(calculateStatistics(data));
    setIsAdminLoggedIn(getAdminAuth());
  }, []);

  // Update statistics whenever submissions change
  const handleFormSubmitted = (newSub: ConsentSubmission) => {
    const updated = [newSub, ...submissions.filter((s) => s.id !== newSub.id)];
    setSubmissions(updated);
    saveSubmissions(updated);
    setStats(calculateStatistics(updated));
    setSuccessSubmission(newSub);
  };

  const currentStats = stats || calculateStatistics(submissions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/20 to-slate-100 text-slate-800 flex flex-col font-sans selection:bg-[#0F2B5C] selection:text-white">
      {/* Official Header with direct Login Admin button */}
      <Header
        onOpenAdmin={() => {
          setActiveTab('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Primary Navigation Tabs */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 py-2 overflow-x-auto">
            {/* Tab 1: Formulir Persetujuan */}
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-[#0F2B5C] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Form Persetujuan</span>
            </button>

            {/* Tab 2: Rekapitulasi Publik */}
            <button
              type="button"
              onClick={() => setActiveTab('recap')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'recap'
                  ? 'bg-[#0F2B5C] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Rekapitulasi Terbuka</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {currentStats.totalMengisi}
              </span>
            </button>

            {/* Tab 3: Portal Admin Sekolah / Login Admin */}
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-[#0F2B5C] text-white shadow-sm ring-2 ring-blue-400'
                  : isAdminLoggedIn
                  ? 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  : 'text-[#0F2B5C] bg-blue-50/90 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Panel Admin</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>Login Admin</span>
                </>
              )}
            </button>
          </div>

          {/* Guide / Code.gs Trigger */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>Panduan Google Sheets</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'form' && (
          <div className="space-y-6">
            <ConsentForm
              existingSubmissions={submissions}
              onFormSubmitted={handleFormSubmitted}
            />
          </div>
        )}

        {activeTab === 'recap' && (
          <PublicRecap
            stats={currentStats}
            onNavigateToForm={() => setActiveTab('form')}
            onNavigateToAdmin={() => {
              setActiveTab('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            submissions={submissions}
            onOpenGasGuide={() => setIsGuideOpen(true)}
            onRefreshData={() => {
              const fresh = loadSubmissions();
              setSubmissions(fresh);
              setStats(calculateStatistics(fresh));
            }}
            onResetData={() => {
              setSubmissions([]);
              setStats(calculateStatistics([]));
            }}
            onAuthChange={(auth) => setIsAdminLoggedIn(auth)}
            onCancelLogin={() => setActiveTab('form')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-12 border-t-4 border-amber-400 py-8 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-1">
            <div className="font-extrabold text-white text-sm tracking-wide">
              SDN SUMUR WELUT III/440 SURABAYA
            </div>
            <p>Jalan Raya Sumur Welut No. 2, Lakarsantri, Kota Surabaya, Jawa Timur</p>
            <p className="text-slate-500">
              Bekerjasama dengan Puskesmas Bangkingan &bull; Program BIAS DT/Td 2026
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
            <button
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 font-semibold cursor-pointer transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAdminLoggedIn ? 'Panel Admin Sekolah' : 'Login Admin Sekolah'}</span>
            </button>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
            >
              Unduh Code.gs &amp; Panduan Integrasi
            </button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          &copy; 2026 SDN Sumur Welut III/440. Seluruh hak cipta dilindungi. Data kesehatan anak dijaga sesuai perundang-undangan.
        </div>
      </footer>

      {/* Success Receipt Modal */}
      {successSubmission && (
        <SuccessModal
          submission={successSubmission}
          onClose={() => setSuccessSubmission(null)}
          onResetForAnother={() => {
            setSuccessSubmission(null);
            setActiveTab('form');
          }}
        />
      )}

      {/* Integration Guide & Code.gs Modal */}
      <IntegrationGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
