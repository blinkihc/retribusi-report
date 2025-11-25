# Wireframes & Mockups
## Sistem Monitoring dan Pelaporan Retribusi Daerah

**Version:** 1.0  
**Date:** November 5, 2025  
**Tool:** ASCII Art + Detailed Descriptions  
**Target:** Low-fidelity to Mid-fidelity Wireframes

---

## 1. Login Page

### 1.1 Desktop Login Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SISTEM MONITORING RETRIBUSI DAERAH             │
│                         [LOGO PEMDA]                               │
└─────────────────────────────────────────────────────────────────────┘
│                                                                     │
│                          ┌─────────────────────┐                   │
│                          │                     │                   │
│                          │    LOGIN SISTEM     │                   │
│                          │                     │                   │
│                          │  ┌───────────────┐  │                   │
│                          │  │ Username      │  │                   │
│                          │  │               │  │                   │
│                          │  └───────────────┘  │                   │
│                          │                     │                   │
│                          │  ┌───────────────┐  │                   │
│                          │  │ Password      │  │                   │
│                          │  │ ●●●●●●●●●●●  │  │                   │
│                          │  └───────────────┘  │                   │
│                          │                     │                   │
│                          │  [  MASUK  ]        │                   │
│                          │                     │                   │
│                          │  Lupa Password?     │                   │
│                          └─────────────────────┘                   │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Mobile Login Wireframe

```
┌─────────────────────────┐
│    ☰                   │
│                        │
│   [LOGO PEMDA]         │
│                        │
│  SISTEM MONITORING     │
│  RETRIBUSI DAERAH      │
│                        │
│ ┌────────────────────┐ │
│ │ Username           │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ Password           │ │
│ │ ●●●●●●●●●●●●●●●●  │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │      MASUK         │ │
│ └────────────────────┘ │
│                        │
│    Lupa Password?      │
│                        │
└─────────────────────────┘
```

**Components & Features:**
- **Header:** Logo pemda + sistem title
- **Form Card:** Centered, shadow, rounded corners
- **Input Fields:** Username (text), Password (hidden)
- **CTA Button:** Primary style, full width on mobile
- **Links:** Forgot password (future feature)
- **Validation:** Real-time validation messages below fields
- **Loading State:** Button shows spinner during authentication

---

## 2. Dashboard Operator OPD

### 2.1 Desktop Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] SISTEM RETRIBUSI    │  Profile: Ahmad (DISHUB)  │ [Logout] │         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐│
│ │   HARI INI      │ │  MINGGU INI     │ │   BULAN INI     │ │  TAHUN INI   ││
│ │                 │ │                 │ │                 │ │              ││
│ │ Rp 2.500.000    │ │ Rp 15.200.000   │ │ Rp 45.800.000   │ │ Rp 380.5 Jt  ││
│ │ 5 Laporan       │ │ 28 Laporan      │ │ 95 Laporan      │ │ 1.2K Laporan ││
│ └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────┘│
│                                                                             │
│ ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐ │
│ │             QUICK ACTIONS           │ │        TREND 7 HARI            │ │
│ │                                     │ │                                 │ │
│ │ ┌─────────────────────────────────┐ │ │    5M ┤                         │ │
│ │ │        INPUT LAPORAN BARU       │ │ │       │    ●                    │ │
│ │ └─────────────────────────────────┘ │ │   4M ┤      ╱╲                  │ │
│ │                                     │ │       │    ╱  ╲                 │ │
│ │ ┌─────────────────────────────────┐ │ │   3M ┤  ●╱    ╲●               │ │
│ │ │       LIHAT SEMUA LAPORAN       │ │ │       │ ╱      ╲               │ │
│ │ └─────────────────────────────────┘ │ │   2M ┤╱        ╲●             │ │
│ └─────────────────────────────────────┘ │       └──────────────────────   │ │
│                                         │        Sen Sel Rab Kam Jum     │ │
│                                         └─────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                        LAPORAN TERBARU                                  │ │
│ ├─────────────┬────────────────────┬──────────────┬──────────┬───────────┤ │
│ │ Tanggal     │ Jenis Retribusi    │ Nominal      │ Status   │ Aksi      │ │
│ ├─────────────┼────────────────────┼──────────────┼──────────┼───────────┤ │
│ │ 05/11/2025  │ Retribusi Parkir   │ Rp 500.000   │ ●Active  │ [Edit][Del│ │
│ │ 05/11/2025  │ Retribusi Terminal  │ Rp 2.000.000 │ ●Active  │ [Edit][Del│ │
│ │ 04/11/2025  │ Retribusi Parkir   │ Rp 750.000   │ ●Active  │ [Edit][Del│ │
│ │ 04/11/2025  │ Retribusi Terminal  │ Rp 1.800.000 │ ●Active  │ [Edit][Del│ │
│ │ 03/11/2025  │ Retribusi Parkir   │ Rp 450.000   │ ●Active  │ [View]    │ │
│ └─────────────┴────────────────────┴──────────────┴──────────┴───────────┘ │
│                              [Lihat Semua →]                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Mobile Dashboard Layout

```
┌─────────────────────────┐
│ ☰  RETRIBUSI       [👤]│
├─────────────────────────┤
│                         │
│  📊 RINGKASAN HARI INI  │
│ ┌─────────────────────┐ │
│ │   Rp 2.500.000      │ │
│ │   5 Laporan         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  📝 INPUT LAPORAN   │ │
│ │       BARU          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │  📋 LIHAT SEMUA     │ │
│ │     LAPORAN         │ │
│ └─────────────────────┘ │
│                         │
│  📈 TREND MINGGU INI    │
│ ┌─────────────────────┐ │
│ │ 5M ┤     ●           │ │
│ │ 4M ┤   ╱╲            │ │
│ │ 3M ┤ ●╱  ╲●          │ │
│ │ 2M ┤╱    ╲●         │ │
│ │    └──────────────   │ │
│ └─────────────────────┘ │
│                         │
├─────────────────────────┤
│ [🏠][📊][📝][👤][⚙️] │
└─────────────────────────┘
```

**Key Components:**
- **Header:** App title, user profile, logout
- **Summary Cards:** Today, week, month, year metrics with currency formatting
- **Quick Actions:** Prominent CTAs for primary tasks
- **Chart:** Simple line chart showing 7-day trend
- **Recent Reports Table:** Last 5 reports with actions
- **Mobile Navigation:** Bottom tab bar for easy thumb navigation

---

## 3. Input Laporan Form

### 3.1 Desktop Form Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [←] INPUT LAPORAN RETRIBUSI BARU                              [Save Draft] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │                            FORM INPUT LAPORAN                           │ │
│ │                                                                         │ │
│ │ Jenis Retribusi *                                                       │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Pilih Jenis Retribusi                                        ▼     │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ Tanggal Setor *                                                         │ │
│ │ ┌──────────────────────────┐  📅                                       │ │
│ │ │ DD/MM/YYYY               │                                            │ │
│ │ └──────────────────────────┘                                            │ │
│ │                                                                         │ │
│ │ Nominal *                                                               │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Rp                                                                  │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │ ℹ️ Contoh: 1000000 untuk 1 juta rupiah                                  │ │
│ │                                                                         │ │
│ │ Bukti Setor *                                                           │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │                  📎 Klik atau drag file kesini                      │ │ │
│ │ │                   PDF, JPG, PNG (Max 5MB)                          │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ Keterangan                                                              │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │                                                                     │ │ │
│ │ │                                                                     │ │ │
│ │ │                                                                     │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │                              [Batal]  [Simpan Laporan]                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Mobile Form Layout

```
┌─────────────────────────┐
│ [←] INPUT LAPORAN  [💾] │
├─────────────────────────┤
│                         │
│ Jenis Retribusi *       │
│ ┌─────────────────────┐ │
│ │ Pilih...         ▼  │ │
│ └─────────────────────┘ │
│                         │
│ Tanggal Setor *         │
│ ┌─────────────────────┐ │
│ │ 05/11/2025      📅  │ │
│ └─────────────────────┘ │
│                         │
│ Nominal *               │
│ ┌─────────────────────┐ │
│ │ Rp 0                │ │
│ └─────────────────────┘ │
│                         │
│ Bukti Setor *           │
│ ┌─────────────────────┐ │
│ │   📎 Pilih File     │ │
│ │  atau Ambil Foto    │ │
│ └─────────────────────┘ │
│                         │
│ Keterangan              │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   SIMPAN LAPORAN    │ │
│ └─────────────────────┘ │
│                         │
│        [Batal]          │
└─────────────────────────┘
```

**Form Features:**
- **Field Validation:** Real-time validation with error messages
- **Currency Input:** Auto-format to Indonesian Rupiah
- **Date Picker:** Calendar widget with backdate validation (max 30 days)
- **File Upload:** Drag & drop or click to browse, preview selected file
- **Auto-save Draft:** Save form progress to localStorage
- **Mobile Camera:** Direct camera integration for receipt capture

---

## 4. Admin Dashboard (Bapenda)

### 4.1 Desktop Admin Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] ADMIN BAPENDA          │ Muhammad Rizki (Admin)  │ [Notif 🔔 3] │ [Logout]  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ [Dashboard] [Laporan] [OPD] [Users] [Retribusi] [Export] [Settings]                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ⚠️ ALERT: 3 OPD belum melaporkan retribusi hari ini │ [Lihat Detail] │ [Dismiss]  │
│                                                                                     │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  │
│ │  HARI INI    │ │ MINGGU INI   │ │ BULAN INI    │ │ TAHUN INI    │ │ % TARGET │  │
│ │              │ │              │ │              │ │              │ │          │  │
│ │ Rp 25.4 Jt   │ │ Rp 180.5 Jt  │ │ Rp 650.8 Jt  │ │ Rp 5.2 M     │ │   87.5%  │  │
│ │ 45 Laporan   │ │ 287 Laporan  │ │ 890 Laporan  │ │ 8.5K Laporan │ │  🟢      │  │
│ │ dari 8 OPD   │ │ dari 8 OPD   │ │ dari 8 OPD   │ │ dari 8 OPD   │ │          │  │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘  │
│                                                                                     │
│ ┌───────────────────────────────────────────┐ ┌───────────────────────────────────┐│
│ │           TREND 30 HARI TERAKHIR          │ │      KOMPARASI OPD BULAN INI      ││
│ │                                           │ │                                   ││
│ │  40M ┤                             ●     │ │  DISHUB     ████████████ 180M     ││
│ │      │                           ╱        │ │  DINKES     ████████ 120M         ││
│ │  30M ┤                       ●╱           │ │  DISKOP     ███████ 95M           ││
│ │      │                     ╱              │ │  DISPAR     ██████ 85M            ││
│ │  20M ┤                 ●╱                 │ │  DLH        █████ 70M             ││
│ │      │             ●╱                     │ │  DISDIK     ████ 60M              ││
│ │  10M ┤         ●╱                         │ │  DPKP       ███ 50M               ││
│ │      │     ●╱                             │ │  DPUPR      ██ 40M                ││
│ │    0 └────────────────────────────────    │ │                                   ││
│ └───────────────────────────────────────────┘ └───────────────────────────────────┘│
│                                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐│
│ │                           LAPORAN TERBARU (SEMUA OPD)                           ││
│ ├──────────┬──────────┬───────────────────┬─────────────┬─────────────┬──────────┤│
│ │ Tanggal  │ OPD      │ Jenis Retribusi   │ Operator    │ Nominal     │ Aksi     ││
│ ├──────────┼──────────┼───────────────────┼─────────────┼─────────────┼──────────┤│
│ │05/11/2025│ DISHUB   │ Retribusi Parkir  │ Ahmad S.    │ Rp 500.000  │[View][❌]││
│ │05/11/2025│ DINKES   │ Ret. Kesehatan    │ Siti N.     │ Rp 2.000.000│[View][❌]││
│ │05/11/2025│ DISKOP   │ Retribusi Pasar   │ Budi P.     │ Rp 3.500.000│[View][❌]││
│ │04/11/2025│ DISPAR   │ Ret. Wisata       │ Indah M.    │ Rp 1.200.000│[View]    ││
│ │04/11/2025│ DISHUB   │ Retribusi Terminal│ Ahmad S.    │ Rp 800.000  │[View]    ││
│ └──────────┴──────────┴───────────────────┴─────────────┴─────────────┴──────────┘│
│                              [Lihat Semua →] [Export Excel] [Export PDF]          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Admin Alert Detail Modal

```
                    ┌───────────────────────────────────┐
                    │        OPD BELUM LAPOR            │
                    ├───────────────────────────────────┤
                    │                                   │
                    │ Tanggal: 05 November 2025         │
                    │                                   │
                    │ OPD yang belum melaporkan:        │
                    │                                   │
                    │ • DPUPR (Dinas PU & PR)          │
                    │   Operator: Eko Purnomo           │
                    │   ℹ️ Terakhir lapor: 03/11/2025   │
                    │                                   │
                    │ • DPKP (Dinas Peternakan)        │
                    │   Operator: Maria Lestari         │
                    │   ℹ️ Terakhir lapor: 04/11/2025   │
                    │                                   │
                    │ • DISDIK (Dinas Pendidikan)      │
                    │   Operator: Pak Joko              │
                    │   ℹ️ Terakhir lapor: 02/11/2025   │
                    │                                   │
                    │         [Kirim Reminder]          │
                    │         [Tutup]                   │
                    └───────────────────────────────────┘
```

---

## 5. Executive Dashboard

### 5.1 Executive Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO] DASHBOARD EKSEKUTIF     │ Kepala Bapenda        │ [Print] │ [Export PDF]    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │                         RINGKASAN PENDAPATAN RETRIBUSI                         │ │
│ │                                                                                │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │ │
│ │ │  BULAN INI      │ │   TARGET        │ │ PENCAPAIAN      │ │  PERTUMBUHAN │ │ │
│ │ │                 │ │                 │ │                 │ │              │ │ │
│ │ │ Rp 650.8 Juta   │ │ Rp 750 Juta     │ │    86.8%        │ │    +12.5%    │ │ │
│ │ │                 │ │                 │ │     🟡          │ │      📈      │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────┘ │ │
│ │                                                                                │ │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐ │ │
│ │ │ TAHUN BERJALAN  │ │ TARGET TAHUN    │ │ PENCAPAIAN YTD  │ │  vs TAHUN    │ │ │
│ │ │                 │ │                 │ │                 │ │  LALU        │ │ │
│ │ │ Rp 5.2 Miliar   │ │ Rp 6.5 Miliar   │ │    80.0%        │ │    +8.7%     │ │ │
│ │ │                 │ │                 │ │     🟢          │ │      📊      │ │ │
│ │ └─────────────────┘ └─────────────────┘ └─────────────────┘ └──────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ ┌─────────────────────────────────────────┐ ┌─────────────────────────────────────┐│
│ │       TREND 12 BULAN & TARGET           │ │     TOP 5 KONTRIBUTOR OPD          ││
│ │                                         │ │                                     ││
│ │  800M ┤ ●○○○○○○○○○○○  Target            │ │ 1. DISHUB       Rp 180M    (27.7%) ││
│ │       │                                 │ │    ████████████████████             ││
│ │  600M ┤       ●                         │ │                                     ││
│ │       │     ●╱ ╲●                       │ │ 2. DINKES       Rp 120M    (18.4%) ││
│ │  400M ┤   ●╱     ╲●                     │ │    ███████████████                  ││
│ │       │ ●╱         ╲●                   │ │                                     ││
│ │  200M ┤╱             ╲●●●               │ │ 3. DISKOP       Rp 95M     (14.6%) ││
│ │       └─────────────────────────         │ │    ████████████                     ││
│ │        J F M A M J J A S O N D          │ │                                     ││
│ └─────────────────────────────────────────┘ │ 4. DISPAR       Rp 85M     (13.1%) ││
│                                             │    ███████████                      ││
│ ┌─────────────────────────────────────────┐ │                                     ││
│ │      BREAKDOWN KATEGORI RETRIBUSI       │ │ 5. DLH          Rp 70M     (10.8%) ││
│ │                                         │ │    █████████                        ││
│ │           🟦 Jasa Umum 45.2%           │ └─────────────────────────────────────┘│
│ │                                         │                                       │
│ │        🟩 Jasa Usaha 38.7%             │ [ Bulan Ini ] [ Triwulan ] [ Tahun ]  │
│ │                                         │                                       │
│ │      🟨 Perizinan Tertentu 16.1%       │         [📊 Analisis Lanjutan]        │
│ └─────────────────────────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Executive Dashboard Features:**
- **Large Numbers:** High contrast, easy to read from distance
- **Status Indicators:** Color-coded achievement levels (🟢 good, 🟡 warning, 🔴 needs attention)
- **Simplified Charts:** Clear trends without technical complexity
- **Key Insights:** Top performers and growth metrics
- **Print-Ready:** Optimized layout for meeting materials

---

## 6. Public Transparency Dashboard

### 6.1 Public Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                      TRANSPARANSI PENDAPATAN RETRIBUSI DAERAH                      │
│                                   [LOGO PEMDA]                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│              "Keterbukaan Informasi untuk Kemajuan Bersama"                        │
│                                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐│
│ │                            PENDAPATAN RETRIBUSI DAERAH                          ││
│ │                                                                                 ││
│ │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐ ││
│ │ │   BULAN INI      │ │  TAHUN BERJALAN  │ │ PERTUMBUHAN YoY  │ │ TERAKHIR    │ ││
│ │ │                  │ │                  │ │                  │ │ UPDATE      │ ││
│ │ │ Rp 650.8 Juta    │ │ Rp 5.2 Miliar    │ │    +8.7%         │ │ 05/11/2025  │ ││
│ │ │                  │ │                  │ │     📈           │ │   16:30     │ ││
│ │ └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────┘ ││
│ └─────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                     │
│ ┌─────────────────────────────────────────┐ ┌─────────────────────────────────────┐│
│ │         TREND PENDAPATAN 12 BULAN       │ │      JENIS RETRIBUSI DAERAH         ││
│ │                                         │ │                                     ││
│ │  600M ┤                         ●       │ │  📋 APA ITU RETRIBUSI DAERAH?       ││
│ │       │                       ╱         │ │                                     ││
│ │  500M ┤                   ●╱             │ │  Retribusi adalah pungutan daerah   ││
│ │       │                 ╱               │ │  sebagai pembayaran atas jasa atau  ││
│ │  400M ┤             ●╱                   │ │  pemberian izin tertentu yang       ││
│ │       │           ╱                     │ │  khusus disediakan dan/atau         ││
│ │  300M ┤       ●╱                         │ │  diberikan oleh Pemerintah Daerah.  ││
│ │       │   ●╱                             │ │                                     ││
│ │  200M ┤ ╱                                │ │  🏛️ JENIS RETRIBUSI:                ││
│ │       └─────────────────────────────     │ │  • Jasa Umum (Kesehatan, Parkir)   ││
│ │        J F M A M J J A S O N D          │ │  • Jasa Usaha (Terminal, Pasar)     ││
│ └─────────────────────────────────────────┘ │  • Perizinan Tertentu (IMB, Izin)   ││
│                                             │                                     ││
│ ┌─────────────────────────────────────────┐ │  📞 INFORMASI LEBIH LANJUT:         ││
│ │       KATEGORI RETRIBUSI 2025           │ │                                     ││
│ │                                         │ │  Badan Pendapatan Daerah            ││
│ │    🟦 Jasa Umum         45.2%          │ │  Jl. Pemda No. 123                  ││
│ │    (Rp 2.35 M)                         │ │  Telp: (0XX) XXX-XXXX               ││
│ │                                         │ │  Email: bapenda@pemda.go.id         ││
│ │    🟩 Jasa Usaha        38.7%          │ │                                     ││
│ │    (Rp 2.01 M)                         │ └─────────────────────────────────────┘│
│ │                                         │                                       │
│ │    🟨 Perizinan Tertentu 16.1%         │                                       │
│ │    (Rp 836 Jt)                         │                                       │
│ └─────────────────────────────────────────┘                                       │
│                                                                                     │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐│
│ │  "Data ini diperbaharui secara berkala untuk transparansi pengelolaan           ││
│ │   keuangan daerah. Untuk informasi lebih detail, hubungi Bapenda."            ││
│ └─────────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Public Dashboard Features:**
- **No Authentication:** Open access for transparency
- **Educational Content:** Explains what retribusi means for citizens
- **Aggregate Data Only:** No personal or sensitive information
- **Contact Information:** Clear channels for public inquiries
- **Mobile Optimized:** Accessible on all devices

---

## 7. Mobile App Flow

### 7.1 Mobile Navigation Structure

```
┌─────────────────────────┐
│                         │
│      MAIN SCREEN        │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
│                         │
├─────────────────────────┤
│[🏠][📊][📝][👥][⚙️]  │
│Home Dashboard + Users  │
│      Input    Settings │
└─────────────────────────┘
```

### 7.2 Mobile Input Form (Step by Step)

**Step 1: Jenis Retribusi**
```
┌─────────────────────────┐
│ [←] INPUT LAPORAN  1/4  │
├─────────────────────────┤
│                         │
│    Pilih Jenis          │
│    Retribusi            │
│                         │
│ ○ Retribusi Parkir      │
│ ● Retribusi Terminal    │
│ ○ Retribusi Kesehatan   │
│                         │
│                         │
│                         │
│                         │
│                         │
│ ┌─────────────────────┐ │
│ │      LANJUT         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Step 2: Tanggal & Nominal**
```
┌─────────────────────────┐
│ [←] INPUT LAPORAN  2/4  │
├─────────────────────────┤
│                         │
│ Tanggal Setor           │
│ ┌─────────────────────┐ │
│ │ 05/11/2025      📅  │ │
│ └─────────────────────┘ │
│                         │
│ Nominal Retribusi       │
│ ┌─────────────────────┐ │
│ │ Rp 1.500.000        │ │
│ └─────────────────────┘ │
│                         │
│ [1][2][3]               │
│ [4][5][6]               │
│ [7][8][9]               │
│ [.][0][⌫]               │
│                         │
│ ┌─────────────────────┐ │
│ │      LANJUT         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Step 3: Bukti Setor**
```
┌─────────────────────────┐
│ [←] INPUT LAPORAN  3/4  │
├─────────────────────────┤
│                         │
│    Upload Bukti Setor   │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │       📷            │ │
│ │   AMBIL FOTO        │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │       📁            │ │
│ │   PILIH FILE        │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │      LANJUT         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Step 4: Konfirmasi**
```
┌─────────────────────────┐
│ [←] KONFIRMASI     4/4  │
├─────────────────────────┤
│                         │
│ Retribusi Terminal      │
│ 05/11/2025              │
│ Rp 1.500.000            │
│                         │
│ 📎 bukti_setor.jpg      │
│                         │
│ Keterangan:             │
│ ┌─────────────────────┐ │
│ │ Pembayaran terminal │ │
│ │ Bus AKAP            │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   SIMPAN LAPORAN    │ │
│ └─────────────────────┘ │
│                         │
│        [Kembali]        │
└─────────────────────────┘
```

---

## 8. Component Library Visual Guide

### 8.1 Button Variations

```
Primary:    [  Simpan Data  ]    ← Blue background, white text
Secondary:  [  Batal       ]    ← White background, blue border
Danger:     [  Hapus       ]    ← Red background, white text
Success:    [  Berhasil    ]    ← Green background, white text
Warning:    [  Peringatan  ]    ← Yellow background, dark text

Sizes:
Small:      [ Save ]              ← Compact padding
Medium:     [  Save Data  ]       ← Standard padding  
Large:      [   Save Data   ]     ← Large padding
```

### 8.2 Form Elements

```
Input Field:
┌─────────────────────────────────┐
│ Placeholder text                │
└─────────────────────────────────┘

Input Field (Focused):
┌═════════════════════════════════┐  ← Blue border
│ User input text                 │
└═════════════════════════════════┘

Input Field (Error):
┌─────────────────────────────────┐  ← Red border
│ Invalid input text              │
└─────────────────────────────────┘
⚠️ Field ini wajib diisi

Select Dropdown:
┌─────────────────────────────────┐
│ Selected option              ▼  │
└─────────────────────────────────┘

File Upload:
┌─────────────────────────────────┐
│     📎 Drag files here or       │
│        click to browse          │
│     (PDF, JPG, PNG max 5MB)     │
└─────────────────────────────────┘
```

### 8.3 Status Badges

```
● Active     ← Green circle + text
● Pending    ← Yellow circle + text  
● Cancelled  ← Red circle + text
● Draft      ← Gray circle + text
```

### 8.4 Data Tables

```
┌─────────────┬────────────────┬──────────────┬──────────┬─────────┐
│ Tanggal ▲▼ │ Retribusi ▲▼   │ Nominal ▲▼   │ Status   │ Aksi    │
├─────────────┼────────────────┼──────────────┼──────────┼─────────┤
│ 05/11/2025  │ Parkir         │ Rp 500.000   │ ●Active  │ [👁][✏️]│
│ 04/11/2025  │ Terminal       │ Rp 2.000.000 │ ●Active  │ [👁][✏️]│
│ 03/11/2025  │ Parkir         │ Rp 750.000   │ ●Pending │ [👁][✏️]│
└─────────────┴────────────────┴──────────────┴──────────┴─────────┘
                          ← 1 2 3 ... 10 →                    
```

**Table Features:**
- **Sortable Columns:** Click headers to sort (▲▼ indicators)
- **Pagination:** Page numbers at bottom
- **Actions:** View (👁), Edit (✏️), Delete (🗑️)
- **Status Colors:** Visual status indicators
- **Responsive:** Stack on mobile devices

---

## 9. Responsive Behavior

### 9.1 Breakpoint Adaptations

**Desktop (> 1024px)**
- Full sidebar navigation
- Multi-column layouts
- Detailed charts and tables
- Hover interactions

**Tablet (768px - 1024px)**
- Collapsible sidebar
- Two-column layouts
- Simplified charts
- Touch-friendly targets

**Mobile (< 768px)**
- Bottom navigation
- Single-column layouts
- Card-based interfaces
- Thumb-friendly interactions

### 9.2 Touch Interactions

```
Tap Targets (Minimum 44px):
┌────────────────────────────────────┐
│              BUTTON                │  ← Min height 44px
└────────────────────────────────────┘

Swipe Gestures:
• Swipe left: Delete item
• Swipe right: Edit item  
• Pull down: Refresh data
• Pinch: Zoom charts

Long Press:
• Long press table row: Show context menu
• Long press card: Show quick actions
```

---

This comprehensive wireframe and mockup guide provides a complete visual reference for implementing the Indonesian regional retribution monitoring system. Each component is designed with government users in mind, ensuring professional appearance, accessibility, and efficient workflows for daily operations.