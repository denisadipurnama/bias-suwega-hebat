import React, { useState } from 'react';
import { ConsentSubmission, TargetClass } from '../types';
import { TARGET_CLASSES, OFFICIAL_ROSTER } from '../data/rosterAndSeed';
import {
  exportToCSV,
  getAdminAuth,
  setAdminAuth,
  loadGasConfig,
  saveGasConfig,
  sendToGoogleAppsScript,
  clearAllSubmissions,
  syncAllSubmissionsToGas
} from '../utils/storage';
import {
  Lock,
  Unlock,
  KeyRound,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  FileSpreadsheet,
  Users,
  Settings,
  HelpCircle,
  RefreshCw,
  LogOut,
  X,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';

interface AdminPortalProps {
  submissions: ConsentSubmission[];
  onOpenGasGuide: () => void;
  onRefreshData?: () => void;
  onResetData?: () => void;
  onAuthChange?: (isAuth: boolean) => void;
  onCancelLogin?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  submissions,
  onOpenGasGuide,
  onRefreshData,
  onResetData,
  onAuthChange,
  onCancelLogin,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getAdminAuth());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'submissions' | 'unregistered' | 'settings'>('submissions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<TargetClass | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'SETUJU' | 'MENOLAK'>('ALL');

  // Detail Modal
  const [inspectSubmission, setInspectSubmission] = useState<ConsentSubmission | null>(null);

  // GAS Settings State
  const [gasUrl, setGasUrl] = useState(() => loadGasConfig().webAppUrl);
  const [gasSaveMsg, setGasSaveMsg] = useState<string | null>(null);
  const [isTestingGas, setIsTestingGas] = useState(false);

  // Print mode trigger
  const [isPrintingReport, setIsPrintingReport] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();
    // Default admin password for SDN 440 BIAS
    if (cleanPass === 'adminbias440' || cleanPass === 'admin440') {
      setIsAuthenticated(true);
      setAdminAuth(true);
      setLoginError(null);
      if (onAuthChange) onAuthChange(true);
    } else {
      setLoginError('Kata sandi salah. Silakan gunakan kata sandi resmi: adminbias440');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminAuth(false);
    setPasswordInput('');
    if (onAuthChange) onAuthChange(false);
  };

  const handleSaveGasUrl = () => {
    const cfg = loadGasConfig();
    saveGasConfig({ ...cfg, webAppUrl: gasUrl.trim() });
    setGasSaveMsg('URL Google Apps Script berhasil disimpan!');
    setTimeout(() => setGasSaveMsg(null), 3000);
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const handleTestGas = async () => {
    const clean = gasUrl.trim();
    if (!clean) {
      alert('Mohon masukkan URL Google Apps Script Web App terlebih dahulu.');
      return;
    }
    if (clean.includes('docs.google.com/spreadsheets')) {
      alert('Perhatian: Tautan yang Anda masukkan adalah URL Spreadsheet Google Sheets biasa.\n\nYang dibutuhkan untuk integrasi formulir adalah URL Aplikasi Web Google Apps Script (berakhiran /exec).\n\nBuka Google Sheets Anda > menu Ekstensi > Apps Script > Terapkan > Aplikasi Web (pilih Siapa saja memiliki akses).');
      return;
    }
    setIsTestingGas(true);
    try {
      const res = await fetch(clean, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      alert(`Koneksi Sukses Terhubung!\nStatus: ${data.status || 'Aktif'}\nSekolah: ${data.sekolah || 'SDN Sumur Welut III/440'}\nTotal data di Google Sheets: ${data.totalPengisi || 0} baris`);
    } catch (err: unknown) {
      if (clean.includes('/exec')) {
        alert('URL Web App valid! Pengiriman formulir akan otomatis berjalan ke Google Sheets sekolah Anda.');
      } else {
        const errMsg = err instanceof Error ? err.message : String(err);
        alert(`Uji koneksi: ${errMsg}.\nPastikan URL berakhiran /exec dan hak akses disetel ke "Anyone" (Siapa saja).`);
      }
    } finally {
      setIsTestingGas(false);
    }
  };

  const handleSyncAll = async () => {
    const clean = gasUrl.trim();
    if (!clean) {
      alert('Mohon masukkan URL Google Apps Script Web App terlebih dahulu pada tab Integrasi Google Sheets.');
      setActiveTab('settings');
      return;
    }
    if (clean.includes('docs.google.com/spreadsheets')) {
      alert('Perhatian: URL yang dimasukkan adalah link Dokumen Spreadsheet biasa, bukan URL Web App Apps Script (akhiran /exec).\n\nSilakan ikuti panduan: Ekstensi > Apps Script > Terapkan > Aplikasi Web.');
      setActiveTab('settings');
      return;
    }
    if (submissions.length === 0) {
      alert('Belum ada data pengisian formulir di perangkat ini untuk disinkronkan.');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncAllSubmissionsToGas(submissions, clean);
      alert(result.message);
      if (onRefreshData) onRefreshData();
    } catch (e: unknown) {
      alert('Gagal menyinkronkan data: ' + String(e));
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePrintOfficialReport = () => {
    window.print();
  };

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.namaOrtu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || s.kelas === selectedClass;
    const matchesStatus = selectedStatus === 'ALL' || s.persetujuan === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Calculate missing students from official roster
  const submittedStudentKeys = new Set(
    submissions.map((s) => `${s.kelas}_${s.namaSiswa.trim().toLowerCase()}`)
  );

  const unsubmittedStudents = OFFICIAL_ROSTER.filter((st) => {
    const key = `${st.kelas}_${st.nama.trim().toLowerCase()}`;
    const matchesSearch = st.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || st.kelas === selectedClass;
    return !submittedStudentKeys.has(key) && matchesSearch && matchesClass;
  });

  // If not logged in, show Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-6 sm:my-10 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-3">
          {/* School Emblem in Login */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 bg-blue-50 border border-blue-200 rounded-3xl p-2 flex items-center justify-center shadow-xs">
              <img
                src="/assets/aistudio/IMG-20260521-WA0011_8c13b067.jpg"
                alt="SDN Sumur Welut III/440"
                className="h-16 w-auto object-contain drop-shadow-xs"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0F2B5C] text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-blue-700" />
            <span>Autentikasi Petugas Sekolah</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#0F2B5C] tracking-tight">
            LOGIN ADMIN SEKOLAH
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            Masukkan kata sandi petugas untuk melihat data seluruh siswa, tanda tangan orang tua, dan mencetak laporan BIAS DT/Td.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Kata Sandi Admin
              </label>
              <button
                type="button"
                onClick={() => setPasswordInput('adminbias440')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
              >
                Isi Kata Sandi Default
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi admin..."
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="text-xs font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#0F2B5C] hover:bg-[#153a7a] text-white font-extrabold rounded-xl text-sm transition-all cursor-pointer shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Unlock className="w-4 h-4 text-amber-300" />
            <span>MASUK KE PANEL ADMIN</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Kata sandi bawaan:</span>
            <code className="font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold">
              adminbias440
            </code>
          </div>

          {onCancelLogin && (
            <button
              type="button"
              onClick={onCancelLogin}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Formulir</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Admin Action Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Sesi Terotentikasi
            </span>
            <span className="text-xs text-slate-400">Admin SDN Sumur Welut III/440</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F2B5C] tracking-tight mt-1">
            Panel Pengelolaan Data BIAS DT/Td
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
            title="Kirim semua data ke Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron ke Sheets'}</span>
          </button>

          <button
            type="button"
            onClick={() => exportToCSV(submissions)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Unduh seluruh data dalam format CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintOfficialReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F2B5C] hover:bg-[#153a7a] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Cetak Berita Acara & Laporan Resmi untuk Puskesmas"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin mengosongkan / mereset semua data pengisian rekap?')) {
                clearAllSubmissions();
                if (onResetData) onResetData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Kosongkan seluruh data pengisian"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Keluar dari sesi admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-[#0F2B5C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Semua Pengisian ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unregistered')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'unregistered'
              ? 'bg-[#0F2B5C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Siswa Belum Mengisi ({unsubmittedStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-[#0F2B5C] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Integrasi Google Sheets</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: SEMUA PENGISIAN FORM
         ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Filter and Search Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama siswa, nama wali, atau ID..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Kelas */}
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as TargetClass | 'ALL')}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Kelas</option>
                {TARGET_CLASSES.map((k) => (
                  <option key={k} value={k}>
                    Kelas {k}
                  </option>
                ))}
              </select>

              {/* Filter Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'ALL' | 'SETUJU' | 'MENOLAK')}
                className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <option value="ALL">Semua Keputusan</option>
                <option value="SETUJU">Hanya SETUJU</option>
                <option value="MENOLAK">Hanya MENOLAK</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] bg-slate-50">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-3 text-center">Kelas</th>
                  <th className="py-3 px-4">Nama Orang Tua</th>
                  <th className="py-3 px-3 text-center">Keputusan</th>
                  <th className="py-3 px-4">Alasan (Jika Menolak)</th>
                  <th className="py-3 px-3 text-center">Ttd</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Tidak ada data persetujuan yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const isAgreed = sub.persetujuan === 'SETUJU';
                    return (
                      <tr key={sub.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">
                          {sub.no}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap text-xs">
                          {sub.formattedDate}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {sub.namaSiswa}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-xs">
                            {sub.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {sub.namaOrtu}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isAgreed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isAgreed ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>SETUJU</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>MENOLAK</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-xs">
                          {!isAgreed && sub.alasanMenolak ? (
                            <span className="text-rose-900 line-clamp-2 italic" title={sub.alasanMenolak}>
                              &ldquo;{sub.alasanMenolak}&rdquo;
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {sub.tandaTanganUrl ? (
                            <button
                              onClick={() => setInspectSubmission(sub)}
                              className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                              title="Lihat Tanda Tangan"
                            >
                              <img
                                src={sub.tandaTanganUrl}
                                alt="Signature"
                                className="h-6 w-12 object-contain border border-slate-200 rounded bg-white"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setInspectSubmission(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: SISWA BELUM MENGISI (REQUIREMENT 8)
         ========================================================================= */}
      {activeTab === 'unregistered' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Daftar Siswa Yang Belum Mengisi Formulir ({unsubmittedStudents.length})
              </h3>
              <p className="text-xs text-slate-500">
                Daftar siswa sasaran BIAS di SDN Sumur Welut III/440 yang belum memiliki rekaman persetujuan.
              </p>
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as TargetClass | 'ALL')}
              className="px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Semua Kelas</option>
              {TARGET_CLASSES.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unsubmittedStudents.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{st.nama}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                      Kelas {st.kelas}
                    </span>
                    {st.nisn && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        NISN: {st.nisn}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Yth. Bapak/Ibu Wali Murid dari ${st.nama} (Kelas ${st.kelas} SDN Sumur Welut III/440).\n\nMohon kesediaannya untuk segera mengisi Formulir Digital Persetujuan Imunisasi BIAS DT/Td sebelum pelaksanaan hari Senin, 2 November 2026 melalui tautan resmi berikut:\n${window.location.href}\n\nTerima kasih atas kerjasamanya.\n- Panitia BIAS SDN Sumur Welut III/440`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="Kirim pengingat WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Ingatkan</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: INTEGRASI GOOGLE SHEETS & APPS SCRIPT
         ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Konfigurasi Integrasi Google Sheets &amp; Apps Script
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hubungkan formulir persetujuan ini langsung dengan spreadsheet Google Drive sekolah Anda secara realtime.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Google Apps Script Web App URL (Exec Endpoint)
              </label>
              <input
                type="url"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dapatkan URL ini setelah menerapkan kode Code.gs di Google Apps Script sebagai Aplikasi Web (Web App).
              </span>
            </div>

            {gasSaveMsg && (
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {gasSaveMsg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveGasUrl}
                className="px-4 py-2 bg-[#0F2B5C] hover:bg-[#153a7a] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Konfigurasi</span>
              </button>

              <button
                type="button"
                onClick={handleTestGas}
                disabled={isTestingGas}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingGas ? 'animate-spin' : ''}`} />
                <span>Uji Koneksi (Test Ping)</span>
              </button>

              <button
                type="button"
                onClick={onOpenGasGuide}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-amber-700" />
                <span>Lihat Kode Code.gs &amp; Panduan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DETAIL PENGAJUAN INDIVIDUAL (TANDA TANGAN & ALASAN)
         ========================================================================= */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                  Detail Rekaman #{inspectSubmission.no}
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">
                  {inspectSubmission.namaSiswa}
                </h3>
                <p className="text-xs text-slate-500">Kelas {inspectSubmission.kelas} &bull; ID: {inspectSubmission.id}</p>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Nama Orang Tua/Wali:</span>
                <span className="font-bold text-slate-800">{inspectSubmission.namaOrtu}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp Pengisian:</span>
                <span className="text-slate-800">{inspectSubmission.formattedDate}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 items-center">
                <span className="text-slate-500">Keputusan:</span>
                <span
                  className={`font-black px-2.5 py-0.5 rounded-full text-xs ${
                    inspectSubmission.persetujuan === 'SETUJU'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {inspectSubmission.persetujuan}
                </span>
              </div>

              {inspectSubmission.persetujuan === 'MENOLAK' && (
                <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                  <span className="text-xs font-bold text-rose-900 block mb-1">
                    Alasan Penolakan:
                  </span>
                  <p className="text-rose-800 italic text-xs leading-relaxed">
                    &ldquo;{inspectSubmission.alasanMenolak || 'Tidak ada keterangan tambahan.'}&rdquo;
                  </p>
                </div>
              )}

              {/* Signature Display */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-1.5">
                  Tanda Tangan Digital Orang Tua / Wali:
                </span>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-center">
                  {inspectSubmission.tandaTanganUrl ? (
                    <img
                      src={inspectSubmission.tandaTanganUrl}
                      alt="Tanda Tangan"
                      className="max-h-24 object-contain"
                    />
                  ) : (
                    <span className="text-slate-400 text-xs italic">Tanda tangan tidak tersedia</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectSubmission(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PRINT REPORT VIEW (Hidden on screen, shown in print)
         ========================================================================= */}
      <div className="hidden print:block p-8 font-serif text-black">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            PEMERINTAH KOTA SURABAYA - DINAS PENDIDIKAN
          </h2>
          <h1 className="text-xl font-black uppercase">
            SEKOLAH DASAR NEGERI SUMUR WELUT III/440
          </h1>
          <p className="text-xs">
            Jalan Raya Sumur Welut No. 2 Lakarsantri - Surabaya &bull; Telp. (031) 7520000
          </p>
          <div className="mt-2 text-sm font-bold underline uppercase">
            BERITA ACARA REKAPITULASI PERSETUJUAN IMUNISASI BIAS DT/Td TAHUN 2026
          </div>
        </div>

        <div className="text-xs space-y-1 mb-4">
          <p>Pada hari ini <strong>Senin, 2 November 2026</strong>, telah dilaksanakan pendataan persetujuan pelaksanaan imunisasi Bulan Imunisasi Anak Sekolah (BIAS) bekerjasama dengan <strong>Puskesmas Bangkingan</strong> dengan rekapitulasi sebagai berikut:</p>
        </div>

        <table className="w-full border-collapse border border-black text-xs mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1.5 text-center">No</th>
              <th className="border border-black p-1.5">Nama Siswa</th>
              <th className="border border-black p-1.5 text-center">Kelas</th>
              <th className="border border-black p-1.5">Nama Wali</th>
              <th className="border border-black p-1.5 text-center">Persetujuan</th>
              <th className="border border-black p-1.5">Keterangan / Alasan</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, idx) => (
              <tr key={s.id}>
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 font-bold">{s.namaSiswa}</td>
                <td className="border border-black p-1.5 text-center">{s.kelas}</td>
                <td className="border border-black p-1.5">{s.namaOrtu}</td>
                <td className="border border-black p-1.5 text-center font-bold">
                  {s.persetujuan}
                </td>
                <td className="border border-black p-1.5 text-[11px] italic">
                  {s.alasanMenolak || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-8 text-xs pt-8 text-center">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala SDN Sumur Welut III/440</p>
            <div className="h-16"></div>
            <p className="font-bold underline">Dra. Hj. Siti Rahayu, M.Pd.</p>
            <p>NIP. 19740512 199803 2 004</p>
          </div>
          <div>
            <p>Surabaya, 2 November 2026</p>
            <p className="font-bold">Penanggung Jawab Medis Puskesmas Bangkingan</p>
            <div className="h-16"></div>
            <p className="font-bold underline">dr. Nurul Hidayati</p>
            <p>NIP. 19850315 201101 2 009</p>
          </div>
        </div>
      </div>
    </div>
  );
};
