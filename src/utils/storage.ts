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
): Promise<{ success: boolean; message: string; isConfigMissing?: boolean }> => {
  const cleanUrl = (gasUrl || '').trim();

  if (!cleanUrl || !cleanUrl.startsWith('http')) {
    return {
      success: false,
      isConfigMissing: true,
      message: 'URL Google Apps Script belum diatur. Masukkan URL Web App (akhiran /exec) pada panel pengaturan.',
    };
  }

  // Detect accidental pasting of standard Google Spreadsheet link
  if (cleanUrl.includes('docs.google.com/spreadsheets')) {
    return {
      success: false,
      message: 'Perhatian: URL yang dimasukkan adalah tautan Google Sheets biasa, bukan URL Web App Google Apps Script. Buka menu Ekstensi > Apps Script > Terapkan > Aplikasi Web.',
    };
  }

  const payload = {
    action: 'submitConsent',
    nomor: record.no,
    timestamp: record.formattedDate,
    namaSiswa: record.namaSiswa,
    kelas: record.kelas,
    namaOrtu: record.namaOrtu,
    persetujuan: record.persetujuan,
    alasanPenolakan: record.alasanMenolak || '-',
    tandaTangan: record.tandaTanganUrl ? 'Tersimpan (Aman)' : '-',
    statusPengiriman: 'Sukses Terkirim',
  };

  try {
    // 1. Primary method: POST with text/plain & mode: 'no-cors'
    // Google Apps Script requires text/plain to avoid preflight OPTIONS block in no-cors
    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Data berhasil dikirim dan tersinkronisasi ke Google Sheets!',
    };
  } catch (err: unknown) {
    console.warn('POST failed, attempting GET fallback to Google Apps Script:', err);

    // 2. Secondary Fallback method: GET with encoded parameters
    try {
      const qParams = new URLSearchParams({
        action: 'submitConsent',
        nomor: String(record.no),
        timestamp: record.formattedDate,
        namaSiswa: record.namaSiswa,
        kelas: record.kelas,
        namaOrtu: record.namaOrtu,
        persetujuan: record.persetujuan,
        alasanPenolakan: record.alasanMenolak || '-',
        tandaTangan: 'Tersimpan (Aman)',
      });

      const separator = cleanUrl.includes('?') ? '&' : '?';
      await fetch(`${cleanUrl}${separator}${qParams.toString()}`, {
        method: 'GET',
        mode: 'no-cors',
      });

      return {
        success: true,
        message: 'Data berhasil diserahkan ke Google Sheets melalui jalur alternatif GET.',
      };
    } catch (fallbackErr: unknown) {
      const errStr = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      return {
        success: false,
        message: `Gagal mengirim ke Google Sheets: ${errStr}. Data tetap tersimpan aman di sistem lokal.`,
      };
    }
  }
};

// Batch sync all submissions to Google Sheets
export const syncAllSubmissionsToGas = async (
  submissions: ConsentSubmission[],
  gasUrl: string
): Promise<{ total: number; successCount: number; message: string }> => {
  if (!gasUrl || !gasUrl.trim().startsWith('http')) {
    return {
      total: submissions.length,
      successCount: 0,
      message: 'URL Google Apps Script belum diisi.',
    };
  }

  let successCount = 0;
  for (const item of submissions) {
    const res = await sendToGoogleAppsScript(item, gasUrl);
    if (res.success) {
      item.statusPengiriman = 'Terkirim ke Google Sheets';
      successCount++;
    }
    // Brief interval to prevent rate-limit
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  saveSubmissions(submissions);

  return {
    total: submissions.length,
    successCount,
    message: `Selesai: ${successCount} dari ${submissions.length} data berhasil disinkronkan ke Google Sheets sekolah.`,
  };
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
