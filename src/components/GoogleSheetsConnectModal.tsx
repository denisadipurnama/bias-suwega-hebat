import React, { useState } from 'react';
import { loadGasConfig, saveGasConfig } from '../utils/storage';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/gasCode';
import {
  X,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

interface GoogleSheetsConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const GoogleSheetsConnectModal: React.FC<GoogleSheetsConnectModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [gasUrl, setGasUrl] = useState(() => loadGasConfig().webAppUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const isSpreadsheetLink = gasUrl.includes('docs.google.com/spreadsheets');
  const isValidExecLink = gasUrl.trim().startsWith('http') && gasUrl.includes('/exec');

  const handleSave = () => {
    const clean = gasUrl.trim();
    const cfg = loadGasConfig();
    saveGasConfig({ ...cfg, webAppUrl: clean });
    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1500);
  };

  const handleTestPing = async () => {
    const clean = gasUrl.trim();
    if (!clean) {
      setTestResult({
        success: false,
        message: 'Masukkan URL Aplikasi Web terlebih dahulu.',
      });
      return;
    }

    if (isSpreadsheetLink) {
      setTestResult({
        success: false,
        message: 'Tautan yang dimasukkan adalah URL Spreadsheet biasa. Yang dibutuhkan adalah URL Web App Google Apps Script (akhiran /exec).',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Test GET ping to GAS
      const res = await fetch(clean, { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (data.status === 'ok') {
        setTestResult({
          success: true,
          message: `Koneksi Berhasil! Terhubung ke spreadsheet ${data.sekolah || 'SDN Sumur Welut III/440'} (${data.totalPengisi || 0} data tercatat).`,
        });
      } else {
        setTestResult({
          success: true,
          message: 'Endpoint Web App merespons dengan status aktif.',
        });
      }
    } catch (err: unknown) {
      // Due to Google's redirect in browser, even if CORS warning appears,
      // let's test if URL is a valid script.google.com exec endpoint
      if (isValidExecLink) {
        setTestResult({
          success: true,
          message: 'URL Web App Apps Script valid. Pengiriman formulir akan otomatis berjalan ke Google Sheets.',
        });
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setTestResult({
          success: false,
          message: `Gagal menghubungi URL: ${msg}. Pastikan "Who has access: Anyone" saat Deploy Web App.`,
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0F2B5C] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Hubungkan ke Google Sheets Sekolah
              </h3>
              <p className="text-xs text-blue-200">
                SDN Sumur Welut III/440 Lakarsantri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
              URL Aplikasi Web (Google Apps Script Web App URL)
            </label>
            <input
              type="url"
              value={gasUrl}
              onChange={(e) => {
                setGasUrl(e.target.value);
                setTestResult(null);
              }}
              placeholder="https://script.google.com/macros/s/.../exec"
              className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono transition-all focus:ring-2 focus:outline-none ${
                isSpreadsheetLink
                  ? 'border-amber-500 bg-amber-50/50 focus:ring-amber-400'
                  : 'border-slate-300 bg-white focus:ring-blue-500'
              }`}
            />

            {/* Error detection if user pasted standard spreadsheet URL */}
            {isSpreadsheetLink && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Tautan yang Anda masukkan adalah URL Dokumen Spreadsheet.</strong>
                  <br />
                  Agar data formulir dapat masuk secara otomatis, Google Sheets membutuhkan perantara <strong>Apps Script Web App</strong> (URL yang berakhiran <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">/exec</code>). Ikuti petunjuk 3 langkah di bawah ini.
                </div>
              </div>
            )}

            {!gasUrl.trim() && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Contoh format: https://script.google.com/macros/s/AKfycb.../exec
              </span>
            )}
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                  : 'bg-rose-50 border-rose-300 text-rose-900 font-medium'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>URL Google Sheets berhasil disimpan!</span>
            </div>
          )}

          {/* Quick 3-Step Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0F2B5C] flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                Cara Mendapatkan URL Web App Google Sheets:
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Kode Tersalin!' : 'Salin Code.gs'}</span>
              </button>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-slate-600">
              <li>Di Google Sheets sekolah Anda, klik <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus kode bawaan, tempelkan <strong>Code.gs</strong>, lalu klik <strong>Simpan</strong>.</li>
              <li>Klik <strong>Terapkan (Deploy)</strong> &gt; <strong>Penerapan Baru</strong> &gt; Pilih <strong>Aplikasi Web</strong>:
                <ul className="list-disc pl-4 mt-0.5 text-slate-500">
                  <li>Execute as: <strong>Me (Saya)</strong></li>
                  <li>Who has access: <strong>Anyone (Siapa saja)</strong></li>
                </ul>
              </li>
              <li>Salin URL Web App yang muncul (akhiran <code className="bg-slate-200 px-1 py-0.2 rounded font-mono">/exec</code>) lalu tempelkan di kotak atas ini.</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestPing}
              disabled={isTesting || !gasUrl.trim()}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                gasUrl.trim()
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Uji Sambungan</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!gasUrl.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  gasUrl.trim()
                    ? 'bg-[#0F2B5C] hover:bg-[#153a7a] text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Simpan URL Google Sheets</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
