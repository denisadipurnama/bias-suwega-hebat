import React, { useState } from 'react';
import { TargetClass, ConsentStatus, ConsentSubmission } from '../types';
import { TARGET_CLASSES, OFFICIAL_ROSTER } from '../data/rosterAndSeed';
import { SignaturePad } from './SignaturePad';
import {
  formatIndonesianDate,
  findDuplicate,
  sendToGoogleAppsScript,
  loadGasConfig
} from '../utils/storage';
import {
  User,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Loader2,
  ShieldAlert,
  Info
} from 'lucide-react';

interface ConsentFormProps {
  existingSubmissions: ConsentSubmission[];
  onFormSubmitted: (newSubmission: ConsentSubmission) => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({
  existingSubmissions,
  onFormSubmitted,
}) => {
  // Form State
  const [namaSiswa, setNamaSiswa] = useState('');
  const [kelas, setKelas] = useState<TargetClass | ''>('');
  const [namaOrtu, setNamaOrtu] = useState('');
  const [persetujuan, setPersetujuan] = useState<ConsentStatus | ''>('');
  const [alasanMenolak, setAlasanMenolak] = useState('');
  const [tandaTanganUrl, setTandaTanganUrl] = useState<string | null>(null);
  const [isStatementAgreed, setIsStatementAgreed] = useState(false);

  // Status & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationTriggered, setValidationTriggered] = useState(false);

  // Filter roster suggestions based on selected class
  const classRosterSuggestions = kelas
    ? OFFICIAL_ROSTER.filter((s) => s.kelas === kelas)
    : [];

  const handleSelectRosterName = (name: string) => {
    setNamaSiswa(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationTriggered(true);
    setErrorMessage(null);

    // 1. Validation checks
    if (!namaSiswa.trim()) {
      setErrorMessage('Mohon lengkapi Nama Lengkap Siswa.');
      return;
    }

    if (!kelas) {
      setErrorMessage('Mohon pilih Kelas siswa.');
      return;
    }

    if (!namaOrtu.trim()) {
      setErrorMessage('Mohon isi Nama Lengkap Orang Tua / Wali.');
      return;
    }

    if (!persetujuan) {
      setErrorMessage('Mohon pilih salah satu keputusan: SETUJU atau MENOLAK.');
      return;
    }

    if (persetujuan === 'MENOLAK' && !alasanMenolak.trim()) {
      setErrorMessage('Karena Anda memilih MENOLAK, mohon tuliskan alasan penolakan pada kolom yang disediakan.');
      return;
    }

    if (!tandaTanganUrl) {
      setErrorMessage('Tanda tangan digital orang tua/wali wajib dibubuhkan.');
      return;
    }

    if (!isStatementAgreed) {
      setErrorMessage('Mohon centang pernyataan konfirmasi bahwa data yang Anda isi adalah benar.');
      return;
    }

    // 2. Duplicate checking
    const duplicate = findDuplicate(existingSubmissions, namaSiswa, kelas as TargetClass);
    if (duplicate) {
      const confirmUpdate = window.confirm(
        `Data persetujuan untuk siswa "${namaSiswa}" di kelas ${kelas} sudah pernah dikirim sebelumnya (${duplicate.formattedDate}). Apakah Anda ingin memperbarui (update) data persetujuan ini?`
      );
      if (!confirmUpdate) {
        return;
      }
    }

    // 3. Initiate Submission
    setIsSubmitting(true);

    try {
      const nextNo = duplicate ? duplicate.no : existingSubmissions.length + 1;
      const submissionId = duplicate ? duplicate.id : `SUB-440-${String(nextNo).padStart(3, '0')}`;
      const now = new Date();

      const newSubmission: ConsentSubmission = {
        id: submissionId,
        no: nextNo,
        timestamp: now.toISOString(),
        formattedDate: formatIndonesianDate(now),
        namaSiswa: namaSiswa.trim(),
        kelas: kelas as TargetClass,
        namaOrtu: namaOrtu.trim(),
        persetujuan: persetujuan as ConsentStatus,
        alasanMenolak: persetujuan === 'MENOLAK' ? alasanMenolak.trim() : undefined,
        tandaTanganUrl: tandaTanganUrl,
        statusPengiriman: 'Tersimpan (Lokal)',
      };

      // 4. Send to Google Sheets if GAS configured
      const gasConfig = loadGasConfig();
      if (gasConfig.webAppUrl) {
        const gasResult = await sendToGoogleAppsScript(newSubmission, gasConfig.webAppUrl);
        if (gasResult.success) {
          newSubmission.statusPengiriman = 'Terkirim ke Google Sheets';
          newSubmission.gasRowIndex = gasResult.rowIndex;
        }
      }

      // 5. Notify parent app
      onFormSubmitted(newSubmission);

      // Reset form fields
      setNamaSiswa('');
      setKelas('');
      setNamaOrtu('');
      setPersetujuan('');
      setAlasanMenolak('');
      setTandaTanganUrl(null);
      setIsStatementAgreed(false);
      setValidationTriggered(false);
    } catch (err: unknown) {
      const errorStr = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Terjadi kesalahan saat memproses data: ${errorStr}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-blue-950/5 border border-slate-200/90 overflow-hidden">
      {/* Form Card Header */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 p-6 border-b border-slate-200">
        <div className="flex items-center gap-2.5 text-xs font-bold text-[#0F2B5C] uppercase tracking-wider mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Formulir Elektronik Orang Tua / Wali
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Pernyataan &amp; Persetujuan Imunisasi
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Silakan mengisi data siswa dan keputusan orang tua dengan jujur dan lengkap di bawah ini.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm font-semibold text-rose-800 leading-snug">
              {errorMessage}
            </div>
          </div>
        )}

        {/* =========================================================================
            BAGIAN A: IDENTITAS SISWA
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              A
            </div>
            <h4 className="text-base font-bold text-slate-800 tracking-tight">
              Identitas Siswa
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Input 1: Kelas Siswa (Dropdown: 1-A, 1-B, 2-A, 2-B, 5) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-800" />
                <span>Kelas Siswa</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value as TargetClass)}
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-800 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  validationTriggered && !kelas
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-300 hover:border-blue-400'
                }`}
              >
                <option value="">-- Pilih Kelas --</option>
                {TARGET_CLASSES.map((k) => (
                  <option key={k} value={k}>
                    Kelas {k} {k.startsWith('1') ? '(Vaksin DT)' : '(Vaksin Td)'}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Khusus kelas sasaran: 1-A, 1-B, 2-A, 2-B, dan 5
              </span>
            </div>

            {/* Input 2: Nama Lengkap Siswa */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-800" />
                <span>Nama Lengkap Siswa</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={namaSiswa}
                onChange={(e) => setNamaSiswa(e.target.value)}
                placeholder="Contoh: Achmad Fauzi Pratama"
                className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-800 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  validationTriggered && !namaSiswa.trim()
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-300 hover:border-blue-400'
                }`}
              />

              {/* Helpful auto-complete suggestion pills for SDN Sumur Welut III */}
              {kelas && classRosterSuggestions.length > 0 && !namaSiswa && (
                <div className="mt-2 text-xs">
                  <div className="text-slate-400 font-medium mb-1">
                    Atau klik nama siswa terdaftar di Kelas {kelas}:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                    {classRosterSuggestions.map((st) => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => handleSelectRosterName(st.nama)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-900 transition-colors cursor-pointer text-[11px]"
                      >
                        {st.nama}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            BAGIAN B: IDENTITAS ORANG TUA / WALI
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              B
            </div>
            <h4 className="text-base font-bold text-slate-800 tracking-tight">
              Identitas Orang Tua / Wali
            </h4>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-800" />
              <span>Nama Lengkap Orang Tua / Wali</span>
              <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={namaOrtu}
              onChange={(e) => setNamaOrtu(e.target.value)}
              placeholder="Contoh: Bambang Sugiyanto"
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-slate-800 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                validationTriggered && !namaOrtu.trim()
                  ? 'border-red-500 bg-red-50/20'
                  : 'border-slate-300 hover:border-blue-400'
              }`}
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Wajib diisi sesuai nama ayah, ibu, atau wali resmi siswa.
            </span>
          </div>
        </section>

        {/* =========================================================================
            BAGIAN C: PERSETUJUAN IMUNISASI
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              C
            </div>
            <h4 className="text-base font-bold text-slate-800 tracking-tight">
              Persetujuan Tindakan Imunisasi
            </h4>
          </div>

          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
            <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Program BIAS DT/Td diberikan secara gratis oleh Pemerintah Kota Surabaya melalui tenaga medis Puskesmas Bangkingan untuk memperkuat imunitas tubuh terhadap penyakit Tetanus dan Difteri.
            </div>
          </div>

          {/* Persetujuan Orang Tua/Wali: SETUJU / MENOLAK (Radio / Big Button Cards) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              Keputusan Orang Tua / Wali Murid: <span className="text-red-500 font-bold">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pilihan SETUJU */}
              <label
                className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  persetujuan === 'SETUJU'
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="persetujuan"
                  value="SETUJU"
                  checked={persetujuan === 'SETUJU'}
                  onChange={() => setPersetujuan('SETUJU')}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-base font-bold text-emerald-950">SETUJU</span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Mengizinkan putra/putri saya untuk diimunisasi DT/Td oleh tim medis.
                  </p>
                </div>
              </label>

              {/* Pilihan MENOLAK */}
              <label
                className={`relative flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  persetujuan === 'MENOLAK'
                    ? 'border-rose-500 bg-rose-50/80 shadow-md ring-2 ring-rose-200'
                    : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="persetujuan"
                  value="MENOLAK"
                  checked={persetujuan === 'MENOLAK'}
                  onChange={() => setPersetujuan('MENOLAK')}
                  className="w-5 h-5 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span className="text-base font-bold text-rose-950">MENOLAK</span>
                  </div>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Tidak mengizinkan imunisasi (wajib mengisi alasan penolakan).
                  </p>
                </div>
              </label>
            </div>

            {validationTriggered && !persetujuan && (
              <span className="text-xs font-semibold text-red-600 block mt-1">
                * Wajib memilih salah satu keputusan (SETUJU atau MENOLAK).
              </span>
            )}
          </div>

          {/* Kolom Alasan Menolak (Hanya muncul jika MENOLAK dipilih - Requirement 3.C.5) */}
          {persetujuan === 'MENOLAK' && (
            <div className="bg-rose-50/60 p-5 rounded-2xl border-2 border-rose-300 space-y-2 animate-in fade-in">
              <label className="block text-sm font-bold text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Alasan Menolak Imunisasi</span>
                <span className="text-rose-600 font-bold">*</span>
              </label>
              <p className="text-xs text-rose-700 leading-normal">
                Mohon tuliskan penjelasan alasan penolakan imunisasi secara bebas dan jelas (misalnya: riwayat kesehatan khusus, rekomendasi dokter anak, atau alasan lainnya):
              </p>
              <textarea
                value={alasanMenolak}
                onChange={(e) => setAlasanMenolak(e.target.value)}
                rows={3}
                placeholder="Tuliskan alasan penolakan Anda di sini..."
                className={`w-full p-3.5 rounded-xl border bg-white text-slate-800 text-sm transition-all focus:ring-2 focus:ring-rose-500 focus:outline-none ${
                  validationTriggered && !alasanMenolak.trim()
                    ? 'border-red-500 bg-red-50/40 ring-2 ring-red-200'
                    : 'border-rose-300'
                }`}
              />
              {validationTriggered && !alasanMenolak.trim() && (
                <span className="text-xs font-bold text-red-600 block">
                  * Alasan penolakan wajib diisi apabila memilih MENOLAK.
                </span>
              )}
            </div>
          )}
        </section>

        {/* =========================================================================
            BAGIAN D: TANDA TANGAN ORANG TUA / WALI
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
              D
            </div>
            <h4 className="text-base font-bold text-slate-800 tracking-tight">
              Tanda Tangan &amp; Pernyataan
            </h4>
          </div>

          {/* Signature Canvas Component */}
          <SignaturePad
            onSignatureChange={(sig) => setTandaTanganUrl(sig)}
            requiredError={validationTriggered && !tandaTanganUrl}
          />

          {/* Pernyataan Konfirmasi Wajib (Requirement 3.D) */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              validationTriggered && !isStatementAgreed
                ? 'border-red-400 bg-red-50/40'
                : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isStatementAgreed}
                onChange={(e) => setIsStatementAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-blue-900 focus:ring-blue-800 shrink-0"
              />
              <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                &ldquo;Saya menyatakan bahwa data yang saya isi benar dan keputusan persetujuan atau penolakan imunisasi ini merupakan keputusan saya sebagai orang tua/wali siswa.&rdquo;
              </span>
            </label>
            {validationTriggered && !isStatementAgreed && (
              <span className="text-xs font-bold text-red-600 block mt-2 ml-8">
                * Wajib mencentang kotak pernyataan sebelum mengirimkan formulir.
              </span>
            )}
          </div>
        </section>

        {/* Submit Button Section (Requirement 4: KIRIM PERSETUJUAN) */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 transition-all cursor-pointer shadow-lg active:scale-[0.99] ${
              isSubmitting
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-[#0F2B5C] hover:bg-[#153a7a] text-white hover:shadow-blue-900/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-white" />
                <span>Memproses &amp; Mengirim Persetujuan...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 text-amber-300" />
                <span>KIRIM PERSETUJUAN</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-3">
            Puskesmas Bangkingan &bull; SDN Sumur Welut III/440 Lakarsantri Surabaya &bull; Data Terproteksi
          </p>
        </div>
      </form>
    </div>
  );
};
