/**
 * Google Apps Script (Code.gs)
 * Untuk integrasi Google Sheets Form Persetujuan Imunisasi BIAS DT/Td
 * SDN Sumur Welut III/440 - Surabaya
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - FORM PERSETUJUAN IMUNISASI BIAS DT/Td
 * SDN SUMUR WELUT III/440 - PUSKESMAS BANGKINGAN SURABAYA
 * ============================================================================
 * 
 * Petunjuk Pemasangan:
 * 1. Buka Google Sheets baru di https://sheets.google.com
 * 2. Beri nama file: "DATA PERSETUJUAN IMUNISASI BIAS DT/Td - SDN SUMUR WELUT III/440"
 * 3. Klik menu: Ekstensi (Extensions) > Apps Script
 * 4. Hapus seluruh kode bawaan, lalu Salin & Tempel (Paste) seluruh kode di bawah ini.
 * 5. Jalankan fungsi "setupSheet()" sekali untuk membuat header tabel secara otomatis.
 * 6. Klik tombol "Terapkan" (Deploy) > "Penerapan Baru" (New Deployment).
 * 7. Pilih Jenis: "Aplikasi Web" (Web App).
 * 8. Konfigurasi:
 *    - Deskripsi: Webhook Form BIAS SDN 440
 *    - Jalankan sebagai (Execute as): Saya (Me)
 *    - Siapa yang memiliki akses (Who has access): Siapa saja (Anyone) -> PENTING!
 * 9. Klik "Terapkan" (Deploy), berikan izin Google (Review Permissions > Advanced > Go to...).
 * 10. Salin URL Aplikasi Web (akhiran /exec) dan tempelkan pada website.
 */

const SHEET_NAME = "Persetujuan_BIAS";

/**
 * Inisialisasi awal struktur sheet dan format 9 kolom resmi
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  // 9 Kolom Utama Sesuai Spesifikasi BIAS DT/Td
  const headers = [
    "Nomor",
    "Timestamp Pengiriman",
    "Nama Siswa",
    "Kelas",
    "Nama Orang Tua/Wali",
    "Persetujuan (Setuju/Menolak)",
    "Alasan Penolakan",
    "Tanda Tangan (Penyimpanan Digital)",
    "Status Pengiriman"
  ];
  
  // Pasang header
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format Header: Tema Navy Blue (#0F2B5C) & Teks Putih Tebal
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0F2B5C")
             .setFontColor("#FFFFFF")
             .setFontWeight("bold")
             .setFontSize(11)
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);
  
  // Lebar kolom yang proporsional
  sheet.setColumnWidth(1, 70);   // Nomor
  sheet.setColumnWidth(2, 190);  // Timestamp
  sheet.setColumnWidth(3, 230);  // Nama Siswa
  sheet.setColumnWidth(4, 90);   // Kelas
  sheet.setColumnWidth(5, 210);  // Nama Orang Tua
  sheet.setColumnWidth(6, 150);  // Persetujuan
  sheet.setColumnWidth(7, 300);  // Alasan Penolakan
  sheet.setColumnWidth(8, 160);  // Tanda Tangan
  sheet.setColumnWidth(9, 140);  // Status
  
  Logger.log("Setup Sheet Persetujuan_BIAS selesai dibuat dengan 9 kolom resmi.");
}

/**
 * Logika Bersama untuk memproses penyimpanan data persetujuan (baik POST maupun GET)
 */
function handleRecordSubmission(payload) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }
    
    // Ambil data dari payload
    const namaSiswa = (payload.namaSiswa || "").trim();
    const kelas = (payload.kelas || "").trim();
    const namaOrtu = (payload.namaOrtu || "").trim();
    const persetujuan = (payload.persetujuan || "SETUJU").trim().toUpperCase();
    const alasanPenolakan = payload.alasanPenolakan ? payload.alasanPenolakan.trim() : "-";
    const timestamp = payload.timestamp || Utilities.formatDate(new Date(), "Asia/Jakarta", "dd MMMM yyyy, HH:mm 'WIB'");
    const tandaTangan = payload.tandaTangan || "Tersimpan (Aman)";
    const statusPengiriman = "Sukses Terkirim";
    
    // Validasi Kolom Wajib
    if (!namaSiswa || !kelas || !namaOrtu) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Data tidak lengkap: Nama Siswa, Kelas, dan Nama Wali wajib diisi."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const lastRow = sheet.getLastRow();
    let nomorUrut = 1;
    
    // Pemeriksaan data ganda (Duplikasi Siswa di Kelas yang sama)
    if (lastRow > 1) {
      const dataSiswa = sheet.getRange(2, 3, lastRow - 1, 2).getValues(); // Kolom C (Nama) & D (Kelas)
      for (let i = 0; i < dataSiswa.length; i++) {
        const existNama = String(dataSiswa[i][0]).trim().toLowerCase();
        const existKelas = String(dataSiswa[i][1]).trim().toLowerCase();
        if (existNama === namaSiswa.toLowerCase() && existKelas === kelas.toLowerCase()) {
          // Update data jika orang tua melakukan perbaikan
          const targetRow = i + 2;
          sheet.getRange(targetRow, 2).setValue(timestamp + " (Diperbarui)");
          sheet.getRange(targetRow, 5).setValue(namaOrtu);
          sheet.getRange(targetRow, 6).setValue(persetujuan);
          sheet.getRange(targetRow, 7).setValue(alasanPenolakan);
          sheet.getRange(targetRow, 8).setValue(tandaTangan);
          sheet.getRange(targetRow, 9).setValue("Sukses Diperbarui");
          
          formatRowStyle(sheet, targetRow, persetujuan);
          
          return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            action: "updated",
            message: "Data persetujuan siswa " + namaSiswa + " (" + kelas + ") berhasil diperbarui di Google Sheets.",
            row: targetRow
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      nomorUrut = lastRow; // baris ke-2 bernomor 1, dst.
    }
    
    // Tambah baris baru
    const newRow = [
      nomorUrut,
      timestamp,
      namaSiswa,
      kelas,
      namaOrtu,
      persetujuan,
      alasanPenolakan,
      tandaTangan,
      statusPengiriman
    ];
    
    sheet.appendRow(newRow);
    const currentRow = sheet.getLastRow();
    formatRowStyle(sheet, currentRow, persetujuan);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: "created",
      message: "Terima kasih! Data persetujuan imunisasi telah berhasil dikirim ke Google Sheets sekolah.",
      nomorUrut: nomorUrut,
      row: currentRow
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Gagal memproses data: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Format baris data agar rapi dan kontras
 */
function formatRowStyle(sheet, rowIdx, persetujuan) {
  const rowRange = sheet.getRange(rowIdx, 1, 1, 9);
  rowRange.setVerticalAlignment("middle");
  
  // Kolom persetujuan (Kolom F / 6) diberi warna indikator
  const persetujuanCell = sheet.getRange(rowIdx, 6);
  if (persetujuan === "SETUJU") {
    persetujuanCell.setBackground("#DCFCE7").setFontColor("#15803D").setFontWeight("bold");
  } else {
    persetujuanCell.setBackground("#FEE2E2").setFontColor("#B91C1C").setFontWeight("bold");
  }
  
  // Rata tengah
  sheet.getRange(rowIdx, 1).setHorizontalAlignment("center");
  sheet.getRange(rowIdx, 4).setHorizontalAlignment("center");
  sheet.getRange(rowIdx, 6).setHorizontalAlignment("center");
  sheet.getRange(rowIdx, 9).setHorizontalAlignment("center");
}

/**
 * Menangani HTTP POST Request dari Form Persetujuan
 */
function doPost(e) {
  let payload = {};
  if (e && e.postData && e.postData.contents) {
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      payload = e.parameter || {};
    }
  } else if (e && e.parameter) {
    payload = e.parameter;
  }
  return handleRecordSubmission(payload);
}

/**
 * Menangani HTTP GET Request untuk Uji Koneksi / Fallback Submission
 */
function doGet(e) {
  // Jika dipanggil dengan action submitConsent melalui GET
  if (e && e.parameter && (e.parameter.action === 'submitConsent' || e.parameter.namaSiswa)) {
    return handleRecordSubmission(e.parameter);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }
  
  const lastRow = sheet.getLastRow();
  let totalData = 0;
  let totalSetuju = 0;
  let totalMenolak = 0;
  const rekapKelas = {
    "1-A": { setuju: 0, menolak: 0 },
    "1-B": { setuju: 0, menolak: 0 },
    "2-A": { setuju: 0, menolak: 0 },
    "2-B": { setuju: 0, menolak: 0 },
    "5": { setuju: 0, menolak: 0 }
  };
  
  if (lastRow > 1) {
    const values = sheet.getRange(2, 4, lastRow - 1, 3).getValues(); // D(Kelas), E(Ortu), F(Persetujuan)
    totalData = values.length;
    
    values.forEach(row => {
      const kelas = String(row[0]).trim();
      const status = String(row[2]).trim().toUpperCase();
      
      if (status === "SETUJU") {
        totalSetuju++;
        if (rekapKelas[kelas]) rekapKelas[kelas].setuju++;
      } else if (status === "MENOLAK") {
        totalMenolak++;
        if (rekapKelas[kelas]) rekapKelas[kelas].menolak++;
      }
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    sekolah: "SDN Sumur Welut III/440",
    puskesmas: "Puskesmas Bangkingan",
    kegiatan: "BIAS DT/Td 2026",
    totalPengisi: totalData,
    totalSetuju: totalSetuju,
    totalMenolak: totalMenolak,
    rekapKelas: rekapKelas,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
