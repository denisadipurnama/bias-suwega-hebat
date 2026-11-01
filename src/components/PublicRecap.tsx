import React from 'react';
import { OverallStatistics } from '../types';
import { TARGET_CLASSES } from '../data/rosterAndSeed';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  PieChart,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Calendar,
  Lock
} from 'lucide-react';

interface PublicRecapProps {
  stats: OverallStatistics;
  onNavigateToForm?: () => void;
}

export const PublicRecap: React.FC<PublicRecapProps> = ({
  stats,
  onNavigateToForm,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title & Subtitle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-blue-700" />
              Statistik Terbuka &amp; Transparan
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2B5C] tracking-tight">
              REKAPITULASI IMUNISASI BIAS DT/Td
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              SDN Sumur Welut III/440 Lakarsantri &bull; Pelaksana: Puskesmas Bangkingan Surabaya
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-900">
              Pembaruan Real-Time Aktif
            </span>
          </div>
        </div>

        {/* 5 Main Summary Metric Cards (Requirement 6) */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
          {/* 1. Total Sudah Mengisi */}
          <div className="bg-gradient-to-br from-blue-50/80 to-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
            <div className="flex items-center justify-between text-blue-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Sudah Mengisi</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#0F2B5C]">
              {stats.totalMengisi}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              dari {stats.totalTarget} target siswa
            </div>
          </div>

          {/* 2. Jumlah SETUJU */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">SETUJU</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">
              {stats.totalSetuju}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1">
              {stats.persentaseSetuju}% dari pengisi
            </div>
          </div>

          {/* 3. Jumlah MENOLAK */}
          <div className="bg-gradient-to-br from-rose-50/80 to-white p-4 rounded-2xl border border-rose-200/80 shadow-xs">
            <div className="flex items-center justify-between text-rose-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">MENOLAK</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-700">
              {stats.totalMenolak}
            </div>
            <div className="text-[11px] font-semibold text-rose-700 mt-1">
              {stats.persentaseMenolak}% dari pengisi
            </div>
          </div>

          {/* 4. Jumlah Belum Mengisi */}
          <div className="bg-gradient-to-br from-amber-50/80 to-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between text-amber-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Belum Mengisi</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800">
              {stats.totalBelumMengisi}
            </div>
            <div className="text-[11px] text-amber-700 mt-1">
              siswa menunggu konfirmasi
            </div>
          </div>

          {/* 5. Persentase Pengisian */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-50/80 to-white p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
            <div className="flex items-center justify-between text-indigo-800 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Persentase</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-900">
              {stats.persentasePengisian}%
            </div>
            <div className="text-[11px] text-indigo-700 mt-1">
              progres pengisian total
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 bg-slate-100 rounded-full h-3.5 overflow-hidden flex shadow-inner">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${(stats.totalSetuju / (stats.totalTarget || 1)) * 100}%` }}
            title={`Setuju: ${stats.totalSetuju}`}
          ></div>
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${(stats.totalMenolak / (stats.totalTarget || 1)) * 100}%` }}
            title={`Menolak: ${stats.totalMenolak}`}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Setuju ({stats.totalSetuju})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Menolak ({stats.totalMenolak})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
              Belum Mengisi ({stats.totalBelumMengisi})
            </span>
          </div>
          <span>Target: {stats.totalTarget} Siswa</span>
        </div>
      </div>

      {/* Visual Chart Comparison & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Decision Visual Bar Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-[#0F2B5C]" />
            <h3 className="text-base font-bold text-slate-800">
              Rasio Keputusan Orang Tua
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-800">SETUJU DIBERIKAN IMUNISASI</span>
                <span className="text-emerald-900">{stats.totalSetuju} Siswa ({stats.persentaseSetuju}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.persentaseSetuju}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-800">MENOLAK IMUNISASI</span>
                <span className="text-rose-900">{stats.totalMenolak} Siswa ({stats.persentaseMenolak}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.persentaseMenolak}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
            {stats.totalMengisi === 0 ? (
              <span className="italic text-slate-400">
                Belum ada data pengisian. Persentase perbandingan akan terhitung otomatis begitu orang tua siswa mulai mengirim formulir.
              </span>
            ) : (
              <>
                Perbandingan persentase dihitung dari <strong>{stats.totalMengisi}</strong> orang tua murid yang telah mengonfirmasi hingga saat ini.
              </>
            )}
          </div>
        </div>

        {/* Right: Rekapitulasi Berdasarkan Kelas (1-A, 1-B, 2-A, 2-B, 5) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">
              Rekapitulasi Berdasarkan Kelas
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              5 Kelas Sasaran BIAS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-3 rounded-l-xl">Kelas</th>
                  <th className="py-3 px-3">Jenis Vaksin</th>
                  <th className="py-3 px-3 text-center">Target</th>
                  <th className="py-3 px-3 text-center text-blue-900 font-bold">Mengisi</th>
                  <th className="py-3 px-3 text-center text-emerald-700">Setuju</th>
                  <th className="py-3 px-3 text-center text-rose-700">Menolak</th>
                  <th className="py-3 px-3 text-center text-amber-700">Belum</th>
                  <th className="py-3 px-3 text-right rounded-r-xl">Progres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TARGET_CLASSES.map((kelas) => {
                  const cStat = stats.perKelas[kelas];
                  const isDt = kelas.startsWith('1');
                  return (
                    <tr key={kelas} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-[#0F2B5C]">
                        Kelas {kelas}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isDt
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          }`}
                        >
                          {isDt ? 'Vaksin DT' : 'Vaksin Td'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                        {cStat.targetSiswa}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-blue-900">
                        {cStat.sudahMengisi}
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-emerald-700">
                        {cStat.setuju}
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-rose-700">
                        {cStat.menolak}
                      </td>
                      <td className="py-3.5 px-3 text-center font-medium text-amber-700">
                        {cStat.belumMengisi}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            {cStat.persentaseMengisi}%
                          </span>
                          <div className="w-14 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#0F2B5C] h-full rounded-full"
                              style={{ width: `${cStat.persentaseMengisi}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STRICT DATA PRIVACY BANNER (Requirement 6 & 7) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Kerahasiaan &amp; Keamanan Data Pribadi Siswa
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Dilindungi
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Sesuai ketentuan UU Perlindungan Data Pribadi dan etika medis, halaman rekapitulasi publik hanya menampilkan statistik agregat. <strong>Nama siswa, nama orang tua, alasan penolakan, serta tanda tangan digital tidak pernah ditampilkan di publik</strong> dan hanya dapat diakses oleh Admin Sekolah dan Tim Medis Puskesmas Bangkingan.
              </p>
            </div>
          </div>

          {onNavigateToForm && (
            <button
              onClick={onNavigateToForm}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md"
            >
              Isi Formulir Siswa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
