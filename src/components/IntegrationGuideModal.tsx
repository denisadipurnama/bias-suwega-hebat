import React, { useState } from 'react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/gasCode';
import {
  X,
  Copy,
  Check,
  Download,
  BookOpen,
  FileCode,
  Table,
  Globe,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeGuideTab, setActiveGuideTab] = useState<'code' | 'sheets' | 'gas_connect' | 'netlify' | 'admin'>('code');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadCodeGs = () => {
    const blob = new Blob([GOOGLE_APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="bg-[#0F2B5C] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#0F2B5C] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold">
                Panduan Integrasi &amp; Kode Sumber Lengkap
              </h3>
              <p className="text-xs text-blue-200">
                Dokumentasi resmi Google Sheets, Apps Script (Code.gs), Netlify &amp; Admin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveGuideTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'code'
                ? 'bg-white text-[#0F2B5C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>1. File Code.gs</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('sheets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'sheets'
                ? 'bg-white text-[#0F2B5C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>2. Panduan Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('gas_connect')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'gas_connect'
                ? 'bg-white text-[#0F2B5C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>3. Hubungkan Apps Script</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('netlify')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'netlify'
                ? 'bg-white text-[#0F2B5C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>4. Panduan Netlify / GitHub</span>
          </button>

          <button
            onClick={() => setActiveGuideTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeGuideTab === 'admin'
                ? 'bg-white text-[#0F2B5C] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Panduan Kelola Admin</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* TAB 1: CODE.GS */}
          {activeGuideTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50 p-3.5 rounded-2xl border border-blue-200">
                <div>
                  <span className="font-bold text-[#0F2B5C] text-sm block">
                    Source Code Google Apps Script (Code.gs)
                  </span>
                  <p className="text-xs text-slate-500">
                    Kode ini berjalan di Google Apps Script untuk menerima kiriman data form dan otomatis mencatat ke 9 kolom Google Sheets.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0F2B5C] hover:bg-[#153a7a] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCodeGs}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Code.gs</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed border border-slate-800">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: PANDUAN MEMBUAT GOOGLE SHEETS */}
          {activeGuideTab === 'sheets' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#0F2B5C]">
                Panduan Membuat Spreadsheet Database Google Sheets
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">
                    Langkah 1: Buat Spreadsheet Baru
                  </h5>
                  <p>Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> pada akun Google guru atau sekolah (<span className="font-mono bg-blue-50 px-1 py-0.5 rounded text-blue-900">@guru.sd.belajar.id</span>).</p>
                  <p className="mt-1">Beri judul spreadsheet: <strong className="text-[#0F2B5C]">DATA PERSETUJUAN IMUNISASI BIAS DT/Td - SDN SUMUR WELUT III/440</strong></p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-2">
                    Langkah 2: Struktur 9 Kolom Database
                  </h5>
                  <p className="mb-2">Beri nama sheet (tab di bawah): <code className="font-bold bg-white px-2 py-0.5 rounded border border-slate-300">Persetujuan_BIAS</code> lalu isi baris 1 (header) dengan 9 kolom berikut:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">1. Nomor</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">2. Timestamp Pengiriman</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">3. Nama Siswa</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">4. Kelas</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">5. Nama Orang Tua/Wali</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium text-emerald-700 font-bold">6. Persetujuan (Setuju/Menolak)</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium text-rose-700">7. Alasan Penolakan</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">8. Tanda Tangan (Penyimpanan Digital)</div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-medium">9. Status Pengiriman</div>
                  </div>
                  <p className="mt-2 text-slate-500 italic">
                    Tips: Anda tidak perlu mengetik satu-satu secara manual! Cukup jalankan fungsi <span className="font-mono bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold">setupSheet()</span> di Apps Script untuk otomatis memformat header berwarna Navy Blue &amp; ukuran pas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HUBUNGKAN WEBSITE DENGAN GOOGLE APPS SCRIPT */}
          {activeGuideTab === 'gas_connect' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#0F2B5C]">
                Panduan Menghubungkan Website ke Google Apps Script (Web App)
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div>
                    <h5 className="font-bold text-slate-800">Buka Menu Apps Script</h5>
                    <p className="text-slate-600">Di Google Sheets, klik menu <span className="font-semibold text-blue-900">Ekstensi (Extensions)</span> &gt; <span className="font-semibold text-blue-900">Apps Script</span>.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div>
                    <h5 className="font-bold text-slate-800">Tempelkan Kode Code.gs</h5>
                    <p className="text-slate-600">Hapus fungsi kosong <code className="bg-slate-200 px-1 py-0.5 rounded">myFunction()</code>, lalu tempelkan seluruh kode dari tab <strong>File Code.gs</strong>. Tekan tombol Simpan (Ikon Disket).</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div>
                    <h5 className="font-bold text-slate-800">Deploy sebagai Aplikasi Web (Web App)</h5>
                    <p className="text-slate-600">Klik tombol biru <span className="font-semibold">Terapkan (Deploy)</span> di pojok kanan atas &gt; <span className="font-semibold">Penerapan Baru (New Deployment)</span>.</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li>Pilih jenis roda gigi: <strong>Aplikasi Web (Web app)</strong></li>
                      <li>Jalankan sebagai (Execute as): <strong>Saya (Me)</strong></li>
                      <li>Siapa yang memiliki akses (Who has access): <strong>Siapa saja (Anyone)</strong> <span className="text-rose-600 font-bold">(Wajib pilih ini agar form orang tua dapat mengirim)</span></li>
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0F2B5C] text-white flex items-center justify-center font-bold text-xs shrink-0">4</div>
                  <div>
                    <h5 className="font-bold text-slate-800">Salin URL &amp; Masukkan ke Website</h5>
                    <p className="text-slate-600">Salin tautan Aplikasi Web (berakhiran <code className="bg-slate-200 px-1 py-0.5 rounded">.../exec</code>). Masuk ke tab <strong>Portal Admin Sekolah</strong> pada website ini, pilih <strong>Integrasi Google Sheets</strong>, lalu tempelkan URL tersebut dan klik Simpan.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEPLOYMENT KE NETLIFY / GITHUB PAGES */}
          {activeGuideTab === 'netlify' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#0F2B5C]">
                Panduan Deployment Website ke Netlify &amp; GitHub Pages
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h5 className="font-bold text-slate-800">Cara 1: Deploy Instan ke Netlify (Gratis)</h5>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
                  <li>Buat akun di <a href="https://netlify.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">netlify.com</a>.</li>
                  <li>Jalankan perintah build: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">npm run build</code> untuk menghasilkan folder <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">dist</code>.</li>
                  <li>Tarik (drag and drop) folder <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">dist</code> ke dashboard Netlify Drop.</li>
                  <li>Website form persetujuan SDN Sumur Welut III/440 langsung aktif dan siap dibagikan ke grup WhatsApp wali murid!</li>
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-800">Hosting Static HTML Standalone</h5>
                <p className="text-slate-600">
                  Aplikasi ini menggunakan teknologi web standar yang ringan. Semua file yang dihasilkan dapat di-host langsung pada GitHub Pages, Cloudflare Pages, atau server hosting Dinas Pendidikan Surabaya tanpa biaya tambahan.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: PANDUAN KELOLA ADMIN */}
          {activeGuideTab === 'admin' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#0F2B5C]">
                Panduan Pengelolaan Data oleh Tim Sekolah &amp; Puskesmas
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">Kredensial Akses</h5>
                  <p>Akses admin dilindungi oleh PIN/Kata Sandi: <span className="font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">adminbias440</span>.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">Fitur Laporan Puskesmas</h5>
                  <p>Gunakan tombol <strong>Cetak Laporan Resmi</strong> di pojok kanan atas Admin untuk mencetak format Berita Acara yang siap ditandatangani oleh Kepala Sekolah SDN Sumur Welut III/440 dan Dokter Puskesmas Bangkingan.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h5 className="font-bold text-slate-800 mb-1">Tindak Lanjut Siswa Belum Mengisi</h5>
                  <p>Buka tab <strong>Siswa Belum Mengisi</strong> untuk melihat nama anak yang belum merespon. Klik tombol <strong>Ingatkan</strong> untuk membuka pesan pengingat WhatsApp yang siap dikirim langsung ke grup kelas atau wali murid.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            BIAS DT/Td &bull; SDN Sumur Welut III/440 Lakarsantri
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0F2B5C] hover:bg-[#153a7a] text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
