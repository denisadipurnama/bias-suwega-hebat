import { ConsentSubmission, StudentRosterItem, TargetClass } from '../types';

export const TARGET_CLASSES: TargetClass[] = ['1-A', '1-B', '2-A', '2-B', '5'];

// Target Student Roster for SDN Sumur Welut III/440 (Lakarsantri, Surabaya)
export const OFFICIAL_ROSTER: StudentRosterItem[] = [
  // Kelas 1-A (Target Imunisasi DT - Difteri Tetanus)
  { id: '1A-01', nama: 'Achmad Fauzi Pratama', kelas: '1-A', nisn: '31650101' },
  { id: '1A-02', nama: 'Aisyah Putri Azzahra', kelas: '1-A', nisn: '31650102' },
  { id: '1A-03', nama: 'Alvaro Rizky Ramadhan', kelas: '1-A', nisn: '31650103' },
  { id: '1A-04', nama: 'Annisa Syifa Nuraini', kelas: '1-A', nisn: '31650104' },
  { id: '1A-05', nama: 'Bagus Dwi Cahyono', kelas: '1-A', nisn: '31650105' },
  { id: '1A-06', nama: 'Cantika Dewi Maharani', kelas: '1-A', nisn: '31650106' },
  { id: '1A-07', nama: 'Danendra Bima Sakti', kelas: '1-A', nisn: '31650107' },
  { id: '1A-08', nama: 'Fatimah Zahra Aurelia', kelas: '1-A', nisn: '31650108' },
  { id: '1A-09', nama: 'Gilang Arya Saputra', kelas: '1-A', nisn: '31650109' },
  { id: '1A-10', nama: 'Hafiz Zufar Kurniawan', kelas: '1-A', nisn: '31650110' },
  { id: '1A-11', nama: 'Indah Kusuma Wardani', kelas: '1-A', nisn: '31650111' },
  { id: '1A-12', nama: 'Kevin Aditya Nugroho', kelas: '1-A', nisn: '31650112' },

  // Kelas 1-B
  { id: '1B-01', nama: 'Aditya Bagas Wicaksono', kelas: '1-B', nisn: '31650201' },
  { id: '1B-02', nama: 'Bilqis Nadira Salma', kelas: '1-B', nisn: '31650202' },
  { id: '1B-03', nama: 'Chelsea Olivia Santoso', kelas: '1-B', nisn: '31650203' },
  { id: '1B-04', nama: 'Dimas Anggoro Yudho', kelas: '1-B', nisn: '31650204' },
  { id: '1B-05', nama: 'Erika Febriana Putri', kelas: '1-B', nisn: '31650205' },
  { id: '1B-06', nama: 'Fajar Hidayatullah', kelas: '1-B', nisn: '31650206' },
  { id: '1B-07', nama: 'Ghea Amanda Clarissa', kelas: '1-B', nisn: '31650207' },
  { id: '1B-08', nama: 'Ilham Maulana Syahputra', kelas: '1-B', nisn: '31650208' },
  { id: '1B-09', nama: 'Jasmine Kirana Larasati', kelas: '1-B', nisn: '31650209' },
  { id: '1B-10', nama: 'Kenzo Rafa Al-Ghifari', kelas: '1-B', nisn: '31650210' },
  { id: '1B-11', nama: 'Luthfi Hakim Ansori', kelas: '1-B', nisn: '31650211' },
  { id: '1B-12', nama: 'Meisya Salsabila Putri', kelas: '1-B', nisn: '31650212' },

  // Kelas 2-A (Target Imunisasi Td - Tetanus difteri)
  { id: '2A-01', nama: 'Arya Seno Pamungkas', kelas: '2-A', nisn: '31550101' },
  { id: '2A-02', nama: 'Bella Safira Anggraini', kelas: '2-A', nisn: '31550102' },
  { id: '2A-03', nama: 'Candra Wahyu Hidayat', kelas: '2-A', nisn: '31550103' },
  { id: '2A-04', nama: 'Dinda Ayu Lestari', kelas: '2-A', nisn: '31550104' },
  { id: '2A-05', nama: 'Elang Satria Wibowo', kelas: '2-A', nisn: '31550105' },
  { id: '2A-06', nama: 'Fitri Handayani', kelas: '2-A', nisn: '31550106' },
  { id: '2A-07', nama: 'Galih Rakha Pratama', kelas: '2-A', nisn: '31550107' },
  { id: '2A-08', nama: 'Hana Marwah Zahidah', kelas: '2-A', nisn: '31550108' },
  { id: '2A-09', nama: 'Irfan Dani Firmansyah', kelas: '2-A', nisn: '31550109' },
  { id: '2A-10', nama: 'Kania Citra Kirana', kelas: '2-A', nisn: '31550110' },
  { id: '2A-11', nama: 'Lukman Nurhakim', kelas: '2-A', nisn: '31550111' },

  // Kelas 2-B
  { id: '2B-01', nama: 'Agus Triyono', kelas: '2-B', nisn: '31550201' },
  { id: '2B-02', nama: 'Bunga Citra Melati', kelas: '2-B', nisn: '31550202' },
  { id: '2B-03', nama: 'Cahyo Utomo', kelas: '2-B', nisn: '31550203' },
  { id: '2B-04', nama: 'Dava Maulana Ibrahim', kelas: '2-B', nisn: '31550204' },
  { id: '2B-05', nama: 'Evelyn Nathania Susanto', kelas: '2-B', nisn: '31550205' },
  { id: '2B-06', nama: 'Farhan Dwi Nugraha', kelas: '2-B', nisn: '31550206' },
  { id: '2B-07', nama: 'Gisella Valerie Putri', kelas: '2-B', nisn: '31550207' },
  { id: '2B-08', nama: 'Harun Al Rasyid', kelas: '2-B', nisn: '31550208' },
  { id: '2B-09', nama: 'Intan Permata Sari', kelas: '2-B', nisn: '31550209' },
  { id: '2B-10', nama: 'Jovan Surya Pratama', kelas: '2-B', nisn: '31550210' },
  { id: '2B-11', nama: 'Karina Aulia Rahma', kelas: '2-B', nisn: '31550211' },

  // Kelas 5 (Target Imunisasi Td lanjutan)
  { id: '5-01', nama: 'Ahmad Raihan Muzakki', kelas: '5', nisn: '31250001' },
  { id: '5-02', nama: 'Berlian Natasha Putri', kelas: '5', nisn: '31250002' },
  { id: '5-03', nama: 'Christian Arya Putra', kelas: '5', nisn: '31250003' },
  { id: '5-04', nama: 'Deandra Khumaira', kelas: '5', nisn: '31250004' },
  { id: '5-05', nama: 'Evan Zaidan Saputra', kelas: '5', nisn: '31250005' },
  { id: '5-06', nama: 'Felicia Amanda', kelas: '5', nisn: '31250006' },
  { id: '5-07', nama: 'Gavin Alvaro Prasetyo', kelas: '5', nisn: '31250007' },
  { id: '5-08', nama: 'Helena Safitri', kelas: '5', nisn: '31250008' },
  { id: '5-09', nama: 'Ikhsan Nur Huda', kelas: '5', nisn: '31250009' },
  { id: '5-10', nama: 'Jessica Alena Sitorus', kelas: '5', nisn: '31250010' },
  { id: '5-11', nama: 'Kenzie Putra Perdana', kelas: '5', nisn: '31250011' },
  { id: '5-12', nama: 'Lintang Kinanti Wibowo', kelas: '5', nisn: '31250012' },
  { id: '5-13', nama: 'Muhammad Dzaky Rabbani', kelas: '5', nisn: '31250013' }
];

// Reset: Belum ada siswa yang mulai mengisi link (0 pengisian)
export const INITIAL_SUBMISSIONS: ConsentSubmission[] = [];
