# PANDUAN LENGKAP SISTEM FORM PERSETUJUAN IMUNISASI BIAS DT/Td
## SDN SUMUR WELUT III/440 - PUSKESMAS BANGKINGAN SURABAYA
**Hari, Tanggal Pelaksanaan:** Senin, 2 November 2026  
**Alamat Sekolah:** Jalan Raya Sumur Welut No. 2 Lakarsantri - Surabaya  

---

### DAFTAR ISI
1. [Struktur Database Google Sheets (9 Kolom)](#1-struktur-database-google-sheets)
2. [Pemasangan Google Apps Script (Code.gs)](#2-pemasangan-google-apps-script-codegs)
3. [Menghubungkan Website ke Google Apps Script](#3-menghubungkan-website-ke-google-apps-script)
4. [Panduan Deployment ke Netlify / GitHub Pages](#4-panduan-deployment-ke-netlify--github-pages)
5. [Panduan Pengelolaan Data Melalui Halaman Admin](#5-panduan-pengelolaan-data-melalui-halaman-admin)

---

### 1. STRUKTUR DATABASE GOOGLE SHEETS
Spreadsheet Google Sheets berfungsi sebagai database utama penerima data dari website formulir persetujuan.

**Langkah Pembuatan:**
1. Masuk ke Google Drive / Google Sheets ([sheets.new](https://sheets.new)) dengan akun Google sekolah atau guru (`@guru.sd.belajar.id`).
2. Beri nama file: `DATA PERSETUJUAN IMUNISASI BIAS DT/Td - SDN SUMUR WELUT III/440`.
3. Beri nama sheet (tab di bagian bawah): `Persetujuan_BIAS`.
4. Buat 9 kolom pada Baris 1:
   - **Kolom A (1):** `Nomor`
   - **Kolom B (2):** `Timestamp Pengiriman`
   - **Kolom C (3):** `Nama Siswa`
   - **Kolom D (4):** `Kelas` (1-A, 1-B, 2-A, 2-B, atau 5)
   - **Kolom E (5):** `Nama Orang Tua/Wali`
   - **Kolom F (6):** `Persetujuan (Setuju/Menolak)`
   - **Kolom G (7):** `Alasan Penolakan`
   - **Kolom H (8):** `Tanda Tangan (Penyimpanan Digital)`
   - **Kolom I (9):** `Status Pengiriman`

*(Catatan: Anda juga bisa menjalankan fungsi `setupSheet()` di Google Apps Script untuk otomatis membuat format header dengan warna resmi Navy Blue).*

---

### 2. PEMASANGAN GOOGLE APPS SCRIPT (Code.gs)
1. Di dalam spreadsheet Google Sheets, klik menu **Ekstensi (Extensions)** > **Apps Script**.
2. Hapus teks bawaan `myFunction()`.
3. Buka file `Code.gs` yang disediakan dalam sistem ini, lalu salin dan tempel (paste) seluruh kodenya ke editor Apps Script.
4. Klik tombol **Simpan (Save)** (ikon disket).
5. Pada menu drop-down fungsi di atas, pilih `setupSheet`, lalu klik tombol **Jalankan (Run)** sekali untuk inisialisasi awal.

---

### 3. MENGHUBUNGKAN WEBSITE KE GOOGLE APPS SCRIPT
1. Di editor Apps Script, klik tombol biru **Terapkan (Deploy)** di pojok kanan atas > **Penerapan Baru (New Deployment)**.
2. Klik ikon roda gigi di sebelah kiri, pilih jenis **Aplikasi Web (Web app)**.
3. Konfigurasi:
   - **Deskripsi:** `Form BIAS SDN 440`
   - **Jalankan sebagai (Execute as):** `Saya (Me)`
   - **Siapa yang memiliki akses (Who has access):** `Siapa saja (Anyone)` *(PENTING: Jangan pilih 'Hanya Saya' agar formulir orang tua siswa bisa mengirim data).*
4. Klik **Terapkan (Deploy)**. Jika Google meminta izin (*Authorization*), klik *Review Permissions*, pilih akun Google Anda, klik *Advanced*, lalu *Go to ... (unsafe)* dan izinkan (*Allow*).
5. Salin URL Aplikasi Web yang muncul (berakhiran `/exec`).
6. Buka Website Form Persetujuan > Masuk ke tab **Admin Sekolah** > Tab **Integrasi Google Sheets** > Tempelkan URL tersebut ke kolom URL > Klik **Simpan Konfigurasi**.

---

### 4. PANDUAN DEPLOYMENT KE NETLIFY / GITHUB PAGES

#### Metode A: Netlify Drop (Paling Mudah & Cepat)
1. Buka terminal proyek dan ketik: `npm run build`
2. Perintah ini akan menghasilkan folder bernama `dist`.
3. Buka [app.netlify.com/drop](https://app.netlify.com/drop) di browser.
4. Seret (drag and drop) folder `dist` ke halaman Netlify tersebut.
5. Dalam 10 detik, website langsung online dengan tautan HTTPS gratis yang dapat dibagikan kepada seluruh orang tua siswa.

#### Metode B: GitHub Pages
1. Push repository ke akun GitHub sekolah.
2. Masuk ke **Settings** > **Pages** > pilih branch `gh-pages` atau konfigurasi GitHub Action static Vite.

---

### 5. PANDUAN PENGELOLAAN DATA MELALUI HALAMAN ADMIN

1. **Login Admin:**
   - Buka tab **Admin Sekolah** pada website.
   - Masukkan kata sandi admin default: `adminbias440`.
2. **Melihat & Memfilter Data:**
   - Filter berdasarkan kelas (1-A, 1-B, 2-A, 2-B, 5).
   - Filter keputusan (SETUJU / MENOLAK).
   - Cari berdasarkan nama siswa atau orang tua.
3. **Melihat Tanda Tangan & Alasan:**
   - Klik tombol **Detail** pada setiap baris untuk melihat pratinjau tanda tangan digital dan membaca alasan penolakan secara lengkap.
4. **Melihat Siswa Belum Mengisi:**
   - Klik tab **Siswa Belum Mengisi** untuk melihat daftar anak yang belum mengonfirmasi.
   - Klik tombol **Ingatkan** untuk langsung membuka draf pesan pengingat WhatsApp ke orang tua/wali siswa.
5. **Mencetak Laporan untuk Puskesmas Bangkingan:**
   - Klik tombol **Cetak Laporan Resmi**.
   - Halaman akan menampilkan Berita Acara resmi berkop surat SDN Sumur Welut III/440 dengan kolom tanda tangan Kepala Sekolah dan Dokter Puskesmas Bangkingan.
6. **Unduh Excel / CSV:**
   - Klik tombol **Unduh Excel / CSV** untuk menyimpan rekapitulasi ke komputer format `.csv` yang dapat dibuka di Microsoft Excel atau diimpor ke Google Sheets.
