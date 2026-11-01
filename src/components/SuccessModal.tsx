import React, { useEffect } from 'react';
import { ConsentSubmission } from '../types';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  ShieldCheck,
  FileCheck2,
  Calendar,
  User,
  GraduationCap,
  Sparkles,
  X
} from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';

interface SuccessModalProps {
  submission: ConsentSubmission;
  onClose: () => void;
  onResetForAnother: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  submission,
  onClose,
  onResetForAnother,
}) => {
  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0F2B5C', '#38BDF8', '#F59E0B', '#10B981'],
      });
    } catch {
      // Safe fallback if confetti fails
    }
  }, []);

  const handlePrintReceipt = () => {
    window.print();
  };

  const isAgreed = submission.persetujuan === 'SETUJU';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#0F2B5C] to-[#1e3a8a] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Pemberitahuan Resmi
              </div>
              <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                Persetujuan Terkirim!
              </h3>
            </div>
          </div>

          <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/15 text-sm text-blue-50 font-medium">
            &ldquo;Terima kasih! Data persetujuan imunisasi telah berhasil dikirim.&rdquo;
          </div>
        </div>

        {/* Printable Digital Receipt Card */}
        <div className="p-6 space-y-6 printable-receipt">
          <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-b from-slate-50/50 to-white shadow-xs">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4 gap-2">
              <OfficialLogo size="sm" showSubtitle={false} />
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  No. Bukti Digital
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-[#0F2B5C]">
                  {submission.id}
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                TANDA TERIMA DIGITAL PERSETUJUAN IMUNISASI BIAS DT/Td
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                SDN Sumur Welut III/440 Surabaya &bull; Puskesmas Bangkingan
              </p>
            </div>

            {/* Decision Highlight Badge */}
            <div
              className={`p-4 rounded-xl mb-4 border text-center ${
                isAgreed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="text-xs font-semibold tracking-wider uppercase mb-1">
                Keputusan Orang Tua / Wali
              </div>
              <div className="text-xl sm:text-2xl font-black flex items-center justify-center gap-2">
                {isAgreed ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <span>SETUJU DIBERIKAN IMUNISASI</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
                    <span>MENOLAK PEMBERIAN IMUNISASI</span>
                  </>
                )}
              </div>
            </div>

            {/* Student & Parent Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mb-4">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nama Siswa</span>
                </div>
                <div className="font-bold text-slate-800">{submission.namaSiswa}</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kelas</span>
                </div>
                <div className="font-bold text-slate-800">Kelas {submission.kelas}</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nama Orang Tua/Wali</span>
                </div>
                <div className="font-semibold text-slate-800">{submission.namaOrtu}</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Waktu Pengisian</span>
                </div>
                <div className="font-medium text-slate-700">{submission.formattedDate}</div>
              </div>
            </div>

            {/* If declined, show reason in receipt */}
            {!isAgreed && submission.alasanMenolak && (
              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 text-xs sm:text-sm mb-4">
                <span className="font-semibold text-rose-900 block mb-1">
                  Alasan Penolakan dari Orang Tua:
                </span>
                <p className="text-rose-800 italic leading-relaxed">&ldquo;{submission.alasanMenolak}&rdquo;</p>
              </div>
            )}

            {/* Signature preview stamp */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Status: Data Tersimpan Resmi</span>
              </div>
              {submission.tandaTanganUrl && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Tanda Tangan Terverifikasi:</span>
                  <img
                    src={submission.tandaTanganUrl}
                    alt="Tanda Tangan Wali"
                    className="h-10 max-w-[120px] object-contain inline-block border-b border-slate-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2.5 text-xs text-slate-500 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
            <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Ringkasan ini merupakan bukti sah tanda terima digital orang tua/wali murid SDN Sumur Welut III/440. Data Anda disimpan secara aman dan tidak dapat dilihat oleh wali murid lainnya demi menjaga kerahasiaan data anak.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors cursor-pointer text-sm border border-slate-300"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak / Simpan Bukti</span>
            </button>
            <button
              type="button"
              onClick={onResetForAnother}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F2B5C] hover:bg-[#153a7a] text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm shadow-md"
            >
              <span>Isi untuk Anak Lain</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
