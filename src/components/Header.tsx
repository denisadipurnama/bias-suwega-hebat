import React from 'react';
import { OfficialLogo } from './OfficialLogo';
import { Calendar, MapPin, Building2, Stethoscope, ShieldCheck, HeartHandshake, Lock, Unlock } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  return (
    <header className="relative bg-gradient-to-b from-[#0F2B5C] via-[#153a7a] to-[#0F2B5C] text-white pt-6 pb-10 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-400 shadow-xl overflow-hidden">
      {/* Decorative subtle background motifs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Bar with School Crest & Admin Login */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-lg border border-white/20 mb-6 text-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <OfficialLogo size="md" />
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-xs font-semibold text-blue-900 tracking-wide">
                  BIAS DT/Td
                </span>
              </div>

              {onOpenAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isAdminLoggedIn
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#0F2B5C] hover:bg-[#153a7a] text-white hover:shadow-md'
                  }`}
                >
                  {isAdminLoggedIn ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Panel Admin (Aktif)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-300" />
                      <span>Login Admin Sekolah</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Title Section */}
        <div className="text-center sm:text-left mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-semibold tracking-wide uppercase mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />
            Program Kesehatan Anak Nasional
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase drop-shadow-sm leading-tight">
            FORM PERSETUJUAN IMUNISASI BIAS DT/Td
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-2xl font-normal leading-relaxed">
            Formulir digital resmi bagi orang tua/wali murid untuk memberikan persetujuan tindakan medis pemberian imunisasi DT &amp; Td di lingkungan sekolah.
          </p>
        </div>

        {/* 4 Identitas Kegiatan Cards (Specified in Requirement 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6">
          {/* Card 1: Nama Sekolah */}
          <div className="bg-white/10 hover:bg-white/15 transition-all backdrop-blur-sm rounded-xl p-3.5 sm:p-4 border border-white/20 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0 text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-amber-300 tracking-wider uppercase">
                Nama Sekolah
              </div>
              <div className="text-sm sm:text-base font-bold text-white">
                SDN Sumur Welut III/440
              </div>
              <div className="text-xs text-blue-200">Kecamatan Lakarsantri</div>
            </div>
          </div>

          {/* Card 2: Alamat */}
          <div className="bg-white/10 hover:bg-white/15 transition-all backdrop-blur-sm rounded-xl p-3.5 sm:p-4 border border-white/20 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-400/20 border border-sky-300/30 flex items-center justify-center shrink-0 text-sky-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-sky-300 tracking-wider uppercase">
                Alamat Sekolah
              </div>
              <div className="text-sm font-medium text-white leading-snug">
                Jalan Raya Sumur Welut No. 2
              </div>
              <div className="text-xs text-blue-200">Lakarsantri - Surabaya</div>
            </div>
          </div>

          {/* Card 3: Hari, Tanggal */}
          <div className="bg-white/10 hover:bg-white/15 transition-all backdrop-blur-sm rounded-xl p-3.5 sm:p-4 border border-white/20 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center shrink-0 text-emerald-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-emerald-300 tracking-wider uppercase">
                Hari, Tanggal Pelaksanaan
              </div>
              <div className="text-sm sm:text-base font-bold text-white">
                Senin, 2 November 2026
              </div>
              <div className="text-xs text-emerald-200">Pukul 08.00 WIB - Selesai</div>
            </div>
          </div>

          {/* Card 4: Pelaksana */}
          <div className="bg-white/10 hover:bg-white/15 transition-all backdrop-blur-sm rounded-xl p-3.5 sm:p-4 border border-white/20 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-400/20 border border-rose-300/30 flex items-center justify-center shrink-0 text-rose-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-rose-300 tracking-wider uppercase">
                Tim Medis Pelaksana
              </div>
              <div className="text-sm sm:text-base font-bold text-white">
                Puskesmas Bangkingan
              </div>
              <div className="text-xs text-blue-200">Dinas Kesehatan Kota Surabaya</div>
            </div>
          </div>
        </div>

        {/* Child-friendly Educational Brief Banner */}
        <div className="mt-4 bg-blue-950/60 rounded-xl p-3.5 border border-sky-400/30 text-xs text-blue-100 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></div>
          <p className="leading-relaxed">
            <strong className="text-amber-300 font-semibold">Sasaran BIAS:</strong> Vaksin <span className="underline decoration-sky-400 font-medium">DT</span> (Difteri Tetanus) untuk kelas 1, serta Vaksin <span className="underline decoration-sky-400 font-medium">Td</span> (Tetanus difteri) untuk kelas 2 dan 5. Lindungi masa depan buah hati dari penyakit berbahaya.
          </p>
        </div>
      </div>
    </header>
  );
};
