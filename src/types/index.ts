/**
 * Types for BIAS DT/Td Immunization Consent Form
 * SDN Sumur Welut III/440 - Surabaya
 */

export type TargetClass = '1-A' | '1-B' | '2-A' | '2-B' | '5';

export type ConsentStatus = 'SETUJU' | 'MENOLAK';

export interface ConsentSubmission {
  id: string;
  no: number;
  timestamp: string; // ISO string
  formattedDate: string; // Indonesian readable string e.g., "2 Nov 2026, 08:30 WIB"
  namaSiswa: string;
  kelas: TargetClass;
  namaOrtu: string;
  persetujuan: ConsentStatus;
  alasanMenolak?: string;
  tandaTanganUrl: string; // Base64 data URL
  statusPengiriman: 'Tersimpan (Lokal)' | 'Terkirim ke Google Sheets';
  gasRowIndex?: number;
}

export interface StudentRosterItem {
  id: string;
  nama: string;
  kelas: TargetClass;
  nisn?: string;
}

export interface ClassStatistics {
  kelas: TargetClass;
  targetSiswa: number;
  sudahMengisi: number;
  setuju: number;
  menolak: number;
  belumMengisi: number;
  persentaseMengisi: number;
  persentaseSetuju: number;
}

export interface OverallStatistics {
  totalTarget: number;
  totalMengisi: number;
  totalSetuju: number;
  totalMenolak: number;
  totalBelumMengisi: number;
  persentasePengisian: number;
  persentaseSetuju: number;
  persentaseMenolak: number;
  perKelas: Record<TargetClass, ClassStatistics>;
}

export interface GasConfig {
  webAppUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime?: string;
}
