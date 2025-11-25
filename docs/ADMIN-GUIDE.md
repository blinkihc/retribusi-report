# Panduan Administrator - Sistem Laporan Retribusi

<!-- 
  File: ADMIN-GUIDE.md
  Updated: 2025-11-25
-->

## Daftar Isi
1. [Manajemen User](#manajemen-user)
2. [Master Data](#master-data)
3. [Manajemen Laporan](#manajemen-laporan)
4. [Troubleshooting](#troubleshooting)

---

## Manajemen User

### Melihat Daftar User
1. Klik **Users** di sidebar (hanya untuk Admin)
2. Daftar user akan ditampilkan dalam tabel

### Membuat User Baru
1. Klik **+ Tambah User**
2. Isi form:
   - **Username**: Unik, tanpa spasi
   - **Password**: Min 8 karakter
   - **Nama Lengkap**: Nama user
   - **Email**: Email valid
   - **Role**: Admin atau Operator
   - **OPD**: Pilih OPD (wajib untuk Operator)
3. Klik **Simpan**

### Role & Permission

| Role | Akses |
|------|-------|
| **Admin** | Full access: kelola user, master data, dan semua laporan |
| **Operator** | CRUD laporan untuk OPD yang di-assign |

> **Catatan**: Operator harus di-assign ke OPD tertentu. Operator hanya bisa melihat dan mengelola laporan dari OPD-nya sendiri.

### Edit User
1. Klik ikon **Edit** pada baris user
2. Ubah data yang diperlukan
3. Klik **Simpan**

### Hapus User
1. Klik ikon **Hapus** pada baris user
2. Konfirmasi penghapusan

---

## Master Data

### OPD (Organisasi Perangkat Daerah)

#### Melihat Daftar OPD
1. Menu **Master Data > OPD**
2. Gunakan search untuk mencari OPD

#### Menambah OPD
1. Klik **+ Tambah OPD**
2. Isi form:
   - **Kode**: Kode unik OPD
   - **Nama**: Nama lengkap OPD
   - **Singkatan**: Singkatan OPD
3. Klik **Simpan**

#### Edit/Hapus OPD
- Klik ikon **Edit** atau **Hapus** pada baris OPD
- OPD yang sudah memiliki laporan tidak bisa dihapus

### Jenis Retribusi

#### Melihat Daftar Jenis Retribusi
1. Menu **Master Data > Jenis Retribusi**
2. Filter berdasarkan kategori atau OPD

#### Menambah Jenis Retribusi
1. Klik **+ Tambah**
2. Isi form:
   - **Kode**: Kode retribusi
   - **Nama**: Nama jenis retribusi
   - **Kategori**: Jasa Umum / Jasa Usaha / Perizinan Tertentu
   - **OPD**: OPD yang mengelola retribusi ini
3. Klik **Simpan**

### Pelayanan OPD

#### Menambah Pelayanan
1. Menu **Master Data > Pelayanan OPD**
2. Klik **+ Tambah Pelayanan**
3. Pilih OPD dan isi nama pelayanan
4. Klik **Simpan**

---

## Manajemen Laporan

### Melihat Semua Laporan
- Admin dapat melihat laporan dari semua OPD
- Gunakan filter OPD untuk menyaring

### Approve/Reject Laporan
1. Buka detail laporan
2. Review data yang diinput
3. Klik **Approve** atau **Reject**

### Export Data
1. Menu **Rekap & Laporan**
2. Pilih periode dan jenis rekap
3. Klik **Export Excel**

---

## Troubleshooting

### User Tidak Bisa Login
1. Pastikan username dan password benar
2. Periksa apakah user sudah terdaftar
3. Coba reset password user

### Operator Tidak Bisa Lihat Laporan
1. Pastikan Operator sudah di-assign ke OPD
2. Periksa apakah OPD memiliki laporan

### Data Tidak Muncul
1. Periksa filter yang aktif
2. Klik **Reset Filter**
3. Refresh halaman

---

## Kontak Support

Untuk bantuan teknis, hubungi tim IT.
