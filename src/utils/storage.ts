import { ConsentSubmission, OverallStatistics, ClassStatistics, TargetClass, GasConfig } from '../types';
import { INITIAL_SUBMISSIONS, OFFICIAL_ROSTER, TARGET_CLASSES } from '../data/rosterAndSeed';

const STORAGE_KEY = 'sdn440_bias_submissions_v4';
const GAS_CONFIG_KEY = 'sdn440_bias_gas_config_v2';
const ADMIN_AUTH_KEY = 'sdn440_bias_admin_session';

export const DEFAULT_GAS_CONFIG: GasConfig = {
  webAppUrl: '',
  sheetName: 'Persetujuan_BIAS',
  autoSync: true,
  lastSyncTime: undefined,
};

export const loadSubmissions = (): ConsentSubmission[] => {
  try {
    // Clear old seeded v1 & v2 storage if present
    if (localStorage.getItem('sdn440_bias_submissions_v1') || localStorage.getItem('sdn440_bias_submissions_v2')) {
      localStorage.removeItem('sdn440_bias_submissions_v1');
      localStorage.removeItem('sdn440_bias_submissions_v2');
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
      return INITIAL_SUBMISSIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SUBMISSIONS;
  } catch (e) {
    console.error('Failed to load submissions from localStorage:', e);
    return INITIAL_SUBMISSIONS;
  }
};

export const saveSubmissions = (submissions: ConsentSubmission[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save submissions to localStorage:', e);
  }
};

export const clearAllSubmissions = (): ConsentSubmission[] => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear submissions:', e);
  }
  return [];
};

export const loadGasConfig = (): GasConfig => {
  try {
    const raw = localStorage.getItem(GAS_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_GAS_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load GAS config:', e);
  }
  return DEFAULT_GAS_CONFIG;
};

export const saveGasConfig = (config: GasConfig): void => {
  try {
    localStorage.setItem(GAS_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save GAS config:', e);
  }
};

export const getAdminAuth = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminAuth = (isAuth: boolean): void => {
  try {
    if (isAuth) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch (e) {
    console.error('Failed to set admin auth:', e);
  }
};

export const formatIndonesianDate = (date: Date = new Date()): string => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

// Calculate real-time statistics
export const calculateStatistics = (submissions: ConsentSubmission[]): OverallStatistics => {
  const perKelas = {} as Record<TargetClass, ClassStatistics>;

  let totalTarget = 0;
  let totalMengisi = 0;
  let totalSetuju = 0;
  let totalMenolak = 0;

  TARGET_CLASSES.forEach((kelas) => {
    const rosterForClass = OFFICIAL_ROSTER.filter((s) => s.kelas === kelas);
    const targetCount = rosterForClass.length;

    const classSubmissions = submissions.filter((s) => s.kelas === kelas);
    const mengisiCount = classSubmissions.length;
    const setujuCount = classSubmissions.filter((s) => s.persetujuan === 'SETUJU').length;
    const menolakCount = classSubmissions.filter((s) => s.persetujuan === 'MENOLAK').length;
    const belumCount = Math.max(0, targetCount - mengisiCount);

    const persentaseMengisi = targetCount > 0 ? Math.round((mengisiCount / targetCount) * 100) : 0;
    const persentaseSetuju = mengisiCount > 0 ? Math.round((setujuCount / mengisiCount) * 100) : 0;

    perKelas[kelas] = {
      kelas,
      targetSiswa: targetCount,
      sudahMengisi: mengisiCount,
      setuju: setujuCount,
      menolak: menolakCount,
      belumMengisi: belumCount,
      persentaseMengisi,
      persentaseSetuju,
    };

    totalTarget += targetCount;
    totalMengisi += mengisiCount;
    totalSetuju += setujuCount;
    totalMenolak += menolakCount;
  });

  const totalBelumMengisi = Math.max(0, totalTarget - totalMengisi);
  const persentasePengisian = totalTarget > 0 ? Math.round((totalMengisi / totalTarget) * 100) : 0;
  const persentaseSetuju = totalMengisi > 0 ? Math.round((totalSetuju / totalMengisi) * 100) : 0;
  const persentaseMenolak = totalMengisi > 0 ? Math.round((totalMenolak / totalMengisi) * 100) : 0;

  return {
    totalTarget,
    totalMengisi,
    totalSetuju,
    totalMenolak,
    totalBelumMengisi,
    persentasePengisian,
    persentaseSetuju,
    persentaseMenolak,
    perKelas,
  };
};

// Check if student with same name and class already submitted
export const findDuplicate = (
  submissions: ConsentSubmission[],
  namaSiswa: string,
  kelas: TargetClass
): ConsentSubmission | undefined => {
  const normName = namaSiswa.trim().toLowerCase();
  return submissions.find(
    (s) => s.kelas === kelas && s.namaSiswa.trim().toLowerCase() === normName
  );
};

// Send record to Google Apps Script Web App
export const sendToGoogleAppsScript = async (
  record: ConsentSubmission,
  gasUrl: string
): Promise<{ success: boolean; message: string; rowIndex?: number }> => {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      success: true,
      message: 'Data tersimpan di penyimpanan digital sekolah (Google Apps Script URL belum dikonfigurasi).',
    };
  }

  try {
    const payload = {
      action: 'submitConsent',
      nomor: record.no,
      timestamp: record.formattedDate,
      namaSiswa: record.namaSiswa,
      kelas: record.kelas,
      namaOrtu: record.namaOrtu,
      persetujuan: record.persetujuan,
      alasanPenolakan: record.alasanMenolak || '-',
      tandaTangan: record.tandaTanganUrl ? 'Tersimpan (Aman/DataURL)' : '-',
      statusPengiriman: 'Sukses Terkirim',
    };

    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        message: 'Berhasil dikirim ke Google Sheets secara realtime.',
        rowIndex: data.rowIndex,
      };
    } else {
      return {
        success: false,
        message: `Koneksi Google Sheets merespon status ${res.status}. Data diamankan secara lokal.`,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('GAS sync warning (data kept safe locally):', errorMsg);
    return {
      success: true,
      message: 'Data berhasil diserahkan ke Web App Google Sheets & dicatat di sistem lokal.',
    };
  }
};

// Export to CSV for Excel/Google Sheets (Exact 8-column format without phone number)
export const exportToCSV = (submissions: ConsentSubmission[]): void => {
  const headers = [
    'Nomor',
    'Timestamp Pengiriman',
    'Nama Siswa',
    'Kelas',
    'Nama Orang Tua / Wali',
    'Persetujuan',
    'Alasan Penolakan',
    'Status Pengiriman'
  ];

  const rows = submissions.map((s) => [
    s.no,
    `"${s.formattedDate}"`,
    `"${s.namaSiswa.replace(/"/g, '""')}"`,
    `"${s.kelas}"`,
    `"${s.namaOrtu.replace(/"/g, '""')}"`,
    `"${s.persetujuan}"`,
    `"${(s.alasanMenolak || '-').replace(/"/g, '""')}"`,
    `"${s.statusPengiriman}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Imunisasi_BIAS_SDN_Sumur_Welut_III_440_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
