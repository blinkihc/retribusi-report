# Product Requirements Document (PRD)
## Sistem Monitoring dan Pelaporan Retribusi Daerah

**Document Version:** 1.0  
**Date:** November 5, 2025  
**Product Owner:** Badan Pendapatan Daerah (Bapenda)  
**Development Team:** Solo Developer + AI Assistant  
**Target Launch:** January 2026

---

## Executive Summary

### Product Vision
Menciptakan sistem digital yang **efisien, transparan, dan akuntabel** untuk monitoring dan pelaporan retribusi daerah dari OPD (Organisasi Perangkat Daerah) ke Bapenda, menggantikan proses manual yang rentan error dan lambat.

### Product Mission
Menyediakan platform berbasis web yang memudahkan operator OPD melaporkan pendapatan retribusi harian/mingguan/bulanan, sekaligus memberikan visibilitas real-time kepada Bapenda untuk monitoring, analisis, dan pengambilan keputusan strategis.

### Success Metrics
- **Adoption Rate:** 100% OPD menggunakan sistem dalam 2 bulan pertama
- **Reporting Compliance:** >95% laporan masuk tepat waktu (H+1)
- **Data Accuracy:** <2% error rate dalam input data
- **User Satisfaction:** >4.0/5.0 rating dari pengguna aktif
- **System Uptime:** >99% availability
- **Time Savings:** Mengurangi waktu pelaporan dari 30 menit → 5 menit per laporan

---

## 1. Product Overview

### 1.1 Background & Problem Statement

#### Current Pain Points
**Proses Manual Existing:**
- Operator OPD input data retribusi di Excel/Spreadsheet
- Pengiriman laporan via email/WhatsApp ke Bapenda
- Admin Bapenda melakukan rekapitulasi manual dari semua OPD
- Proses memakan waktu 2-3 hari untuk konsolidasi bulanan
- Rawan kesalahan input dan kehilangan data
- Tidak ada visibilitas real-time
- Sulit melacak OPD yang belum lapor
- Data historis sulit diakses untuk analisis

#### Regulatory Requirements
- **UU No. 1 Tahun 2022** tentang Hubungan Keuangan Pusat dan Daerah
- **UU No. 28 Tahun 2009** tentang Pajak Daerah dan Retribusi Daerah
- Kewajiban transparansi informasi publik (UU No. 14 Tahun 2008)
- Standar audit pemerintahan (SPIP)

### 1.2 Target Users

#### Primary Users (16-20 users total)

**1. Operator OPD (16 users)**
- **Profile:** Staf administrasi di 8-10 OPD, 2 operator per OPD
- **Tech Literacy:** Basic to intermediate (familiar dengan Excel, email)
- **Daily Tasks:** Input laporan retribusi harian/mingguan, upload bukti setor
- **Device Usage:** Desktop computer di kantor, occasional mobile
- **Pain Points:** 
  - Proses manual memakan waktu
  - Kesulitan tracking laporan yang sudah/belum disubmit
  - Tidak ada konfirmasi real-time bahwa laporan diterima

**2. Admin Bapenda (2 users)**
- **Profile:** Staf IT atau admin keuangan Bapenda
- **Tech Literacy:** Advanced (familiar dengan sistem database, reporting)
- **Daily Tasks:** 
  - Monitor laporan masuk dari semua OPD
  - Kelola master data (OPD, jenis retribusi, user)
  - Generate laporan konsolidasi bulanan/tahunan
  - Handle issue dan support user
- **Pain Points:**
  - Sulit melacak OPD yang belum lapor
  - Rekapitulasi manual memakan waktu
  - Tidak ada audit trail untuk perubahan data

**3. Executive/Kepala Bapenda (1 user)**
- **Profile:** Pejabat struktural tingkat eselon
- **Tech Literacy:** Basic (lebih suka dashboard visual)
- **Usage Frequency:** Weekly untuk review, monthly untuk rapat
- **Needs:**
  - Dashboard ringkasan high-level
  - Trend analysis dan komparasi antar OPD
  - Export untuk presentasi/rapat
- **Pain Points:**
  - Data tidak up-to-date untuk decision making
  - Sulit membandingkan performa antar OPD

#### Secondary Users

**4. Public/Masyarakat (unlimited access)**
- **Profile:** Warga masyarakat umum
- **Access:** Tanpa login, read-only
- **Needs:** Transparansi pendapatan retribusi daerah
- **Usage:** Occasional, driven by awareness campaigns

### 1.3 Product Scope

#### In Scope (MVP - Phase 1)
✅ **User Management:**
- Role-based authentication (Admin, Operator)
- User CRUD dengan assignment OPD dan retribusi

✅ **Master Data Management:**
- Kelola OPD (nama, kode, deskripsi)
- Kelola Jenis Retribusi (kategori, nama, kode, assign ke OPD)

✅ **Report Input & Management:**
- Form input laporan dengan validasi
- Upload bukti setor (PDF/JPG/PNG, max 5MB)
- Edit laporan (dalam status active)
- Soft delete dengan reason
- Duplicate detection (same retribusi + date)

✅ **Dashboard & Monitoring:**
- Operator Dashboard (personal summary)
- Admin Dashboard (all OPD monitoring)
- Executive Dashboard (high-level metrics)
- Public Transparency Dashboard (aggregate data only)

✅ **Data Export:**
- Excel export dengan multi-sheet
- PDF export dengan template formal

✅ **Audit Trail:**
- Log semua perubahan data (create, update, delete, cancel)
- Track user actions dengan timestamp dan IP address

#### Out of Scope (Future Phases)
❌ **Payment Gateway Integration** (sistem ini hanya monitoring, bukan payment processing)
❌ **Mobile Native Apps** (Phase 2 - web responsive untuk Phase 1)
❌ **Email Notifications** (Phase 2 - reminder OPD belum lapor)
❌ **SMS Integration** (Phase 3)
❌ **Automated Bank Reconciliation** (Phase 3)
❌ **Integration dengan SIMDA/SIPKD** (Phase 3)
❌ **Multi-Regional Deployment** (Phase 3)
❌ **Advanced Analytics & ML** (Phase 4)

---

## 2. User Stories & Acceptance Criteria

### 2.1 Epic 1: User Authentication & Authorization

#### User Story 1.1: User Login
**As an** Operator OPD  
**I want to** login dengan username dan password  
**So that** saya dapat mengakses sistem secara aman

**Acceptance Criteria:**
- [ ] User dapat input username dan password di halaman login
- [ ] Validasi kredensial dilakukan di server-side
- [ ] Password di-hash menggunakan bcrypt (12 rounds minimum)
- [ ] Session token (JWT) valid selama 8 jam
- [ ] Redirect ke dashboard sesuai role setelah login sukses
- [ ] Error message "Username atau password salah" jika gagal
- [ ] Rate limiting: max 5 failed attempts dalam 5 menit
- [ ] Log semua login attempts (success & failed) ke audit trail

**Technical Notes:**
- JWT payload: { userId, username, role, opdId, iat, exp }
- HTTP-only secure cookie untuk token storage
- HTTPS only di production

---

#### User Story 1.2: Role-Based Access Control
**As an** Admin Bapenda  
**I want to** sistem membatasi akses berdasarkan role  
**So that** data sensitif terlindungi dari akses unauthorized

**Acceptance Criteria:**
- [ ] Operator hanya dapat akses laporan mereka sendiri
- [ ] Admin dapat akses semua laporan dari semua OPD
- [ ] UI elements hidden/disabled jika user tidak punya permission
- [ ] API endpoints melakukan permission check di middleware
- [ ] Unauthorized access attempts menghasilkan 403 Forbidden
- [ ] Log unauthorized attempts ke audit trail

**Permission Matrix:**

| Feature | Operator | Admin |
|---------|----------|-------|
| View own reports | ✅ | ✅ |
| View all reports | ❌ | ✅ |
| Create report | ✅ | ✅ |
| Edit own report | ✅ | ✅ |
| Delete own report | ✅ | ✅ |
| Cancel any report | ❌ | ✅ |
| Manage users | ❌ | ✅ |
| Manage OPD | ❌ | ✅ |
| Manage Retribusi | ❌ | ✅ |
| Export data | ✅ (own) | ✅ (all) |

---

### 2.2 Epic 2: Laporan Retribusi Management

#### User Story 2.1: Input Laporan Retribusi
**As an** Operator OPD  
**I want to** input laporan retribusi harian  
**So that** data pendapatan retribusi tercatat di sistem

**Acceptance Criteria:**
- [ ] Form memiliki field: Jenis Retribusi (dropdown), Tanggal Setor (date picker), Nominal (currency input), Bukti Setor (file upload), Keterangan (textarea optional)
- [ ] Dropdown Jenis Retribusi hanya menampilkan yang di-assign ke user
- [ ] Tanggal Setor tidak boleh future date
- [ ] Tanggal Setor dapat backdate maksimal 30 hari
- [ ] Nominal harus angka positif > 0
- [ ] File upload accept: PDF, JPG, PNG dengan max size 5MB
- [ ] Auto-format currency: 1000000 → Rp 1.000.000
- [ ] Validasi client-side (real-time) dan server-side
- [ ] Duplicate detection: kombinasi retribusi + tanggal setor harus unik per user
- [ ] Show warning jika duplikat terdeteksi: "Laporan untuk retribusi ini pada tanggal tersebut sudah ada"
- [ ] Success message setelah submit: "Laporan berhasil disimpan"
- [ ] Redirect ke list laporan setelah success

**Validation Rules:**
```typescript
{
  retribusiId: required, must exist in assigned retribusi,
  tanggalSetor: required, date, not future, max 30 days backdate,
  nominal: required, number, > 0, max 999999999999.99,
  buktiSetor: required, file, types: [pdf, jpg, png], maxSize: 5MB,
  keterangan: optional, string, max 500 chars
}
```

**Error Messages:**
- "Jenis retribusi wajib dipilih"
- "Tanggal setor wajib diisi"
- "Tanggal setor tidak boleh di masa depan"
- "Tanggal setor tidak boleh lebih dari 30 hari yang lalu"
- "Nominal wajib diisi dan harus lebih dari 0"
- "File bukti setor wajib diupload"
- "File harus berformat PDF, JPG, atau PNG"
- "Ukuran file maksimal 5MB"
- "Laporan untuk retribusi ini pada tanggal tersebut sudah ada"

---

#### User Story 2.2: Edit Laporan Retribusi
**As an** Operator OPD  
**I want to** edit laporan yang sudah saya submit  
**So that** saya dapat memperbaiki kesalahan input

**Acceptance Criteria:**
- [ ] Hanya laporan dengan status "active" yang dapat di-edit
- [ ] Hanya owner laporan yang dapat edit (operator tidak bisa edit laporan operator lain)
- [ ] Admin dapat edit semua laporan
- [ ] Pre-fill form dengan data existing
- [ ] Validasi sama seperti input baru
- [ ] File bukti setor dapat diganti (upload file baru)
- [ ] Jika file tidak diganti, retain file lama
- [ ] Log perubahan ke audit trail (old value vs new value)
- [ ] Success message: "Laporan berhasil diperbarui"

**Audit Trail Format:**
```json
{
  "action": "UPDATE_REPORT",
  "userId": "user-id",
  "recordId": "report-id",
  "changes": {
    "nominal": { "old": 1000000, "new": 1500000 },
    "keterangan": { "old": "...", "new": "..." }
  },
  "timestamp": "2025-11-05T10:30:00Z",
  "ipAddress": "192.168.1.100"
}
```

---

#### User Story 2.3: Delete Laporan Retribusi
**As an** Operator OPD  
**I want to** hapus laporan yang salah input  
**So that** data tetap accurate dan clean

**Acceptance Criteria:**
- [ ] Soft delete (set deleted_at timestamp, tidak hard delete)
- [ ] Hanya laporan active yang dapat di-delete
- [ ] Hanya owner atau admin yang dapat delete
- [ ] Require deletion reason (min 10 characters)
- [ ] Confirmation dialog: "Apakah Anda yakin ingin menghapus laporan ini? Aksi ini tidak dapat dibatalkan."
- [ ] Log deletion ke audit trail dengan reason
- [ ] Data tetap di database untuk audit purpose
- [ ] Success message: "Laporan berhasil dihapus"

---

#### User Story 2.4: Lihat Daftar Laporan
**As an** Operator OPD  
**I want to** melihat list semua laporan saya  
**So that** saya dapat tracking laporan yang sudah saya submit

**Acceptance Criteria:**
- [ ] Table dengan kolom: Tanggal Setor, Jenis Retribusi, Nominal, Status, Aksi
- [ ] Pagination: 20 items per page
- [ ] Default sort: Tanggal Setor descending
- [ ] Filter: Date range, Jenis Retribusi, Status
- [ ] Search: by keterangan (full-text search)
- [ ] Currency formatting: Rp 1.000.000
- [ ] Status indicator: Active (green), Cancelled (red)
- [ ] Action buttons: View Detail, Edit (if active), Delete (if active)
- [ ] Empty state: "Belum ada laporan. Klik 'Input Laporan Baru' untuk memulai."

**Table Layout:**
```
┌──────────────┬─────────────────────┬──────────────┬──────────┬─────────────┐
│ Tanggal Setor│ Jenis Retribusi     │ Nominal      │ Status   │ Aksi        │
├──────────────┼─────────────────────┼──────────────┼──────────┼─────────────┤
│ 05/11/2025   │ Retribusi Parkir    │ Rp 500.000   │ ● Active │ [👁][✏️][🗑️]│
│ 04/11/2025   │ Retribusi Terminal  │ Rp 2.000.000 │ ● Active │ [👁][✏️][🗑️]│
│ 03/11/2025   │ Retribusi Parkir    │ Rp 750.000   │ ● Cancel │ [👁]        │
└──────────────┴─────────────────────┴──────────────┴──────────┴─────────────┘
                            ← 1 2 3 ... 10 →
```

---

### 2.3 Epic 3: Dashboard & Monitoring

#### User Story 3.1: Operator Dashboard
**As an** Operator OPD  
**I want to** melihat summary laporan saya  
**So that** saya dapat monitoring performa pelaporan saya

**Acceptance Criteria:**
- [ ] Summary cards: Today (total + count), This Week, This Month, This Year
- [ ] Chart: 7-day trend (line chart)
- [ ] Recent Reports table (last 10 entries)
- [ ] Quick action buttons: Input Laporan Baru, Lihat Semua Laporan
- [ ] Real-time data (auto-refresh every 5 minutes)
- [ ] Loading skeleton saat fetch data
- [ ] Error handling dengan retry button

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard Operator - Ahmad (DISHUB)                    [Logout] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐│
│ │  HARI INI    │ │ MINGGU INI   │ │  BULAN INI   │ │ TAHUN   ││
│ │ Rp 2.500.000 │ │ Rp 15.200.000│ │ Rp 45.800.000│ │ Rp 380M ││
│ │  5 Laporan   │ │  28 Laporan  │ │  95 Laporan  │ │ 1.2K    ││
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────┘│
│                                                                 │
│ ┌─────────────────────────┐  ┌───────────────────────────────┐ │
│ │    QUICK ACTIONS        │  │     TREND 7 HARI TERAKHIR     │ │
│ │ ┌─────────────────────┐ │  │  5M ┤         ●               │ │
│ │ │ INPUT LAPORAN BARU  │ │  │     │       ╱ ╲               │ │
│ │ └─────────────────────┘ │  │  4M ┤     ●╱   ╲              │ │
│ │ ┌─────────────────────┐ │  │     │   ╱       ╲●            │ │
│ │ │ LIHAT SEMUA LAPORAN │ │  │  3M ┤ ●╱         ╲            │ │
│ │ └─────────────────────┘ │  │     └────────────────────     │ │
│ └─────────────────────────┘  └───────────────────────────────┘ │
│                                                                 │
│ LAPORAN TERBARU                                                 │
│ [Table with last 10 reports...]                                │
└─────────────────────────────────────────────────────────────────┘
```

---

#### User Story 3.2: Admin Dashboard
**As an** Admin Bapenda  
**I want to** monitoring semua OPD dalam satu dashboard  
**So that** saya dapat mengidentifikasi masalah dan take action cepat

**Acceptance Criteria:**
- [ ] System-wide summary: Today, Week, Month, Year (all OPD)
- [ ] Alert indicator: "X OPD belum lapor hari ini" (clickable)
- [ ] Multi-chart visualization:
  - 30-day trend (all OPD aggregate)
  - OPD comparison (bar chart bulan ini)
  - Breakdown by kategori retribusi (pie chart)
- [ ] Latest Reports table (50 entries, all OPD)
- [ ] Table columns: Tanggal, OPD, Jenis Retribusi, Operator, Nominal, Status, Aksi
- [ ] Quick filters: OPD, Date range, Status
- [ ] Export buttons: Excel, PDF
- [ ] Real-time updates (WebSocket atau polling 5 min)

**Alert Logic:**
- Query semua OPD, hitung berapa yang belum ada laporan hari ini
- Modal detail: list OPD yang belum lapor, contact info, "Send Reminder" button (Phase 2)

---

#### User Story 3.3: Executive Dashboard
**As a** Kepala Bapenda  
**I want to** melihat high-level summary dan trend  
**So that** saya dapat membuat keputusan strategis berdasarkan data

**Acceptance Criteria:**
- [ ] Large, clear summary metrics dengan % achievement vs target
- [ ] 12-month trend dengan target line overlay
- [ ] Top 5 OPD contributors (bar chart)
- [ ] Growth indicators (YoY comparison)
- [ ] Simplified interface (minimal technical jargon)
- [ ] Print-friendly layout (CSS @media print)
- [ ] Export to PDF for presentations
- [ ] Performance status indicators (🟢 good, 🟡 warning, 🔴 attention)

**Dashboard Sections:**
1. Hero Metrics (Bulan Ini, Tahun Berjalan, Achievement %, Growth %)
2. 12-Month Trend Chart dengan Target Line
3. Top Performers (OPD ranking)
4. Category Breakdown (Jasa Umum, Jasa Usaha, Perizinan)
5. Actionable Insights (auto-generated brief summary)

---

#### User Story 3.4: Public Transparency Dashboard
**As a** Warga Masyarakat  
**I want to** melihat data retribusi daerah secara transparan  
**So that** saya dapat mengetahui pengelolaan keuangan pemerintah

**Acceptance Criteria:**
- [ ] No authentication required (public access)
- [ ] Aggregate data only (no OPD-specific breakdown)
- [ ] Display: Bulan Ini total, Tahun Ini total, 12-month trend
- [ ] Educational content: "Apa itu Retribusi Daerah?"
- [ ] Jenis-jenis Retribusi dengan penjelasan
- [ ] No personal information exposed
- [ ] No file download/export (read-only)
- [ ] Mobile-optimized (responsive)
- [ ] Performance optimized (static caching)

---

### 2.4 Epic 4: Master Data Management

#### User Story 4.1: Manage OPD
**As an** Admin Bapenda  
**I want to** kelola data OPD  
**So that** sistem memiliki data referensi yang accurate

**Acceptance Criteria:**
- [ ] CRUD operations: Create, Read, Update, Delete OPD
- [ ] Form fields: Nama OPD (required, min 3 chars), Kode OPD (required, unique, max 20 chars), Deskripsi (optional, max 500 chars)
- [ ] Table list dengan search dan sort
- [ ] Validation: Kode OPD harus unique
- [ ] Cannot delete OPD jika ada:
  - Users assigned ke OPD tersebut
  - Jenis Retribusi assigned ke OPD tersebut
  - Laporan dari OPD tersebut
- [ ] Show dependency count sebelum delete attempt
- [ ] Success messages untuk setiap action

**Business Rules:**
- OPD code format: uppercase letters + numbers (e.g., DISHUB, DINKES01)
- Nama OPD harus mencakup jenis organisasi (Dinas/Badan/Kantor)

---

#### User Story 4.2: Manage Jenis Retribusi
**As an** Admin Bapenda  
**I want to** kelola jenis retribusi  
**So that** operator dapat memilih retribusi yang benar saat input

**Acceptance Criteria:**
- [ ] CRUD operations untuk Jenis Retribusi
- [ ] Form fields:
  - Kategori (dropdown: Jasa Umum, Jasa Usaha, Perizinan Tertentu)
  - Nama (required, max 200 chars)
  - Kode (required, unique, max 50 chars)
  - Assign ke OPD (dropdown, required)
- [ ] Table dengan filter by Kategori dan OPD
- [ ] Cannot delete jika ada laporan menggunakan retribusi ini
- [ ] Cannot change OPD assignment jika sudah ada laporan
- [ ] Bulk import dari Excel (Phase 2)

**Kategori Retribusi (sesuai UU No. 1/2022):**
1. **Jasa Umum:** Pelayanan publik (parkir, kebersihan, kesehatan, dll)
2. **Jasa Usaha:** Pemakaian kekayaan daerah (terminal, pasar, dll)
3. **Perizinan Tertentu:** Izin-izin spesifik (IMB, izin usaha, dll)

---

#### User Story 4.3: Manage Users
**As an** Admin Bapenda  
**I want to** kelola user accounts  
**So that** hanya authorized users yang dapat akses sistem

**Acceptance Criteria:**
- [ ] CRUD operations untuk Users
- [ ] Form fields:
  - Username (required, unique, 3-50 chars, alphanumeric + underscore)
  - Email (required, unique, valid email format)
  - Password (required on create, min 8 chars, complexity requirement)
  - Role (dropdown: Admin, Operator)
  - Assign OPD (dropdown, required untuk Operator)
  - Status (toggle: Active/Inactive)
- [ ] Password auto-generate option dengan "Copy to Clipboard"
- [ ] Send credentials via email (Phase 2)
- [ ] Password complexity: min 8 chars, uppercase, lowercase, number, special char
- [ ] Cannot delete user dengan laporan existing (deactivate instead)
- [ ] Show last login timestamp
- [ ] Reset password functionality

---

#### User Story 4.4: Assign Retribusi to User
**As an** Admin Bapenda  
**I want to** assign specific jenis retribusi ke operator  
**So that** operator hanya dapat input retribusi yang relevan

**Acceptance Criteria:**
- [ ] Multi-select interface untuk assign retribusi
- [ ] Filter retribusi by OPD (hanya tampilkan retribusi dari OPD user)
- [ ] Check/uncheck individual atau "Select All"
- [ ] Visual indicator retribusi yang sudah assigned
- [ ] Save changes dengan confirmation
- [ ] Log assignment changes ke audit trail

**Business Rule:**
- Operator hanya dapat di-assign retribusi dari OPD mereka sendiri
- Admin tidak perlu assignment (access all)

---

### 2.5 Epic 5: Data Export

#### User Story 5.1: Export Laporan ke Excel
**As an** Admin Bapenda  
**I want to** export laporan ke Excel  
**So that** saya dapat analisa lebih lanjut di spreadsheet

**Acceptance Criteria:**
- [ ] Multi-sheet Excel workbook:
  - Sheet 1: Summary (aggregates by OPD, kategori, bulan)
  - Sheet 2: Detail (semua laporan dengan filters applied)
  - Sheet 3: Charts (embedded charts)
- [ ] Apply current filters dari UI (date range, OPD, status)
- [ ] Professional formatting:
  - Header dengan logo pemda + title
  - Borders dan cell shading
  - Currency formatting Rp 1.000.000
  - Date formatting DD/MM/YYYY
  - Auto-width columns
- [ ] Formula untuk totals dan subtotals
- [ ] File naming: `Laporan_Retribusi_[StartDate]_to_[EndDate]_[Timestamp].xlsx`
- [ ] Background processing untuk large datasets (>1000 records)
- [ ] Download progress indicator
- [ ] Success notification: "File siap didownload"

**Technical Implementation:**
- Library: ExcelJS atau SheetJS
- Max records per export: 50,000 (pagination jika lebih)
- Server-side generation untuk security

---

#### User Story 5.2: Export Laporan ke PDF
**As an** Kepala Bapenda  
**I want to** export laporan ke PDF  
**So that** saya dapat print untuk rapat dan dokumentasi resmi

**Acceptance Criteria:**
- [ ] PDF dengan template formal pemerintah:
  - Kop surat pemda
  - Judul laporan
  - Periode laporan
  - Tabel data
  - Tanda tangan digital (Phase 2)
- [ ] Multiple template options:
  - Executive Summary (1-2 pages)
  - Detailed Report (with all data)
  - Audit Report (with audit trail)
- [ ] Page numbering dan table of contents
- [ ] Landscape orientation untuk wide tables
- [ ] Print-optimized (A4 paper size)
- [ ] File naming: `Laporan_Retribusi_[Type]_[Date].pdf`

**Technical Implementation:**
- Library: Puppeteer (headless Chrome) atau PDFKit
- HTML → PDF rendering dengan custom CSS
- Server-side generation

---

### 2.6 Epic 6: Audit & Compliance

#### User Story 6.1: Audit Trail Logging
**As an** Admin Bapenda  
**I want to** sistem mencatat semua perubahan data  
**So that** ada accountability dan traceability untuk audit

**Acceptance Criteria:**
- [ ] Log semua actions: CREATE, READ (admin only), UPDATE, DELETE, CANCEL
- [ ] Capture data: User, Action, Table Name, Record ID, Old Value, New Value, Timestamp, IP Address
- [ ] Tamper-proof logging (append-only, no delete)
- [ ] Search dan filter audit logs
- [ ] Export audit trail ke Excel/PDF
- [ ] Retention policy: keep all logs minimum 5 years

**Logged Actions:**
- User login/logout
- Report create/edit/delete/cancel
- Master data changes (OPD, Retribusi, Users)
- Permission changes
- Export operations
- Failed authentication attempts

---

#### User Story 6.2: Admin Cancel Report
**As an** Admin Bapenda  
**I want to** cancel laporan yang invalid  
**So that** data tetap accurate untuk audit

**Acceptance Criteria:**
- [ ] Only admin dapat cancel reports
- [ ] Require cancellation reason (min 10 chars)
- [ ] Change status dari "active" → "cancelled"
- [ ] Preserve original data (soft update)
- [ ] Set cancelled_by (admin user ID) dan cancelled_at timestamp
- [ ] Log cancellation ke audit trail
- [ ] Cancelled reports tidak included dalam summary/aggregates
- [ ] Cancelled reports visible di admin view dengan indicator merah
- [ ] Cannot un-cancel (permanent action)
- [ ] Confirmation dialog: "Apakah Anda yakin ingin membatalkan laporan ini? Operator tidak dapat mengembalikannya."

---

## 3. Functional Requirements

### 3.1 Data Validation Rules

#### Laporan Retribusi
```typescript
interface LaporanRetribusiValidation {
  retribusiId: {
    required: true;
    type: 'UUID';
    mustExist: 'jenis_retribusi table';
    mustBeAssigned: 'to current user';
  };
  
  tanggalSetor: {
    required: true;
    type: 'Date';
    notFuture: true;
    maxBackdate: '30 days';
    format: 'YYYY-MM-DD';
  };
  
  nominal: {
    required: true;
    type: 'Decimal(15,2)';
    min: 0.01;
    max: 999999999999.99;
  };
  
  buktiSetor: {
    required: true;
    type: 'File';
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'];
    maxSize: 5 * 1024 * 1024; // 5MB
  };
  
  keterangan: {
    required: false;
    type: 'String';
    maxLength: 500;
  };
  
  uniqueConstraint: {
    fields: ['retribusiId', 'tanggalSetor', 'userId'];
    message: 'Laporan untuk retribusi ini pada tanggal tersebut sudah ada';
  };
}
```

#### User Management
```typescript
interface UserValidation {
  username: {
    required: true;
    type: 'String';
    minLength: 3;
    maxLength: 50;
    pattern: /^[a-zA-Z0-9_]+$/;
    unique: true;
  };
  
  email: {
    required: true;
    type: 'Email';
    maxLength: 100;
    unique: true;
  };
  
  password: {
    required: true; // on create only
    minLength: 8;
    mustContain: ['uppercase', 'lowercase', 'number', 'special'];
  };
  
  role: {
    required: true;
    enum: ['admin', 'operator'];
  };
  
  opdId: {
    required: 'if role === operator';
    type: 'UUID';
    mustExist: 'opd table';
  };
}
```

### 3.2 Business Logic Rules

#### Duplicate Detection
```typescript
// Check for duplicate reports
const isDuplicate = await db.query(
  `SELECT id FROM laporan_retribusi 
   WHERE retribusi_id = $1 
   AND tanggal_setor = $2 
   AND user_id = $3 
   AND status = 'active'
   AND deleted_at IS NULL
   LIMIT 1`,
  [retribusiId, tanggalSetor, userId]
);

if (isDuplicate.rows.length > 0) {
  throw new DuplicateReportError('Laporan untuk retribusi ini pada tanggal tersebut sudah ada');
}
```

#### Permission Check
```typescript
function canAccessReport(user: User, report: Report): boolean {
  // Admin can access all reports
  if (user.role === 'admin') return true;
  
  // Operator can only access their own reports
  if (user.role === 'operator' && report.userId === user.id) return true;
  
  return false;
}

function canCancelReport(user: User): boolean {
  // Only admin can cancel reports
  return user.role === 'admin';
}
```

#### Dashboard Aggregation
```typescript
// Calculate dashboard summary
const summary = await db.query(`
  SELECT 
    SUM(CASE WHEN DATE(tanggal_setor) = CURRENT_DATE THEN nominal ELSE 0 END) as total_today,
    COUNT(CASE WHEN DATE(tanggal_setor) = CURRENT_DATE THEN 1 END) as count_today,
    SUM(CASE WHEN tanggal_setor >= DATE_TRUNC('week', CURRENT_DATE) THEN nominal ELSE 0 END) as total_week,
    COUNT(CASE WHEN tanggal_setor >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END) as count_week,
    SUM(CASE WHEN DATE_TRUNC('month', tanggal_setor) = DATE_TRUNC('month', CURRENT_DATE) THEN nominal ELSE 0 END) as total_month,
    COUNT(CASE WHEN DATE_TRUNC('month', tanggal_setor) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as count_month
  FROM laporan_retribusi
  WHERE user_id = $1 
  AND status = 'active' 
  AND deleted_at IS NULL
`, [userId]);
```

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **Page Load Time:** < 2 seconds (3G connection)
- **API Response Time:** < 500ms (95th percentile)
- **Database Query Time:** < 100ms (average)
- **File Upload Time:** < 10 seconds for 5MB file
- **Concurrent Users:** Support 50 concurrent users without degradation
- **Dashboard Auto-refresh:** Every 5 minutes (configurable)

### 4.2 Security Requirements
- **Authentication:** JWT with 8-hour expiration
- **Password Storage:** bcrypt hash with 12 salt rounds
- **HTTPS Only:** Force HTTPS in production
- **Input Sanitization:** XSS and SQL injection prevention
- **File Upload Security:** Virus scan (Phase 2), file type validation, size limits
- **Rate Limiting:** 100 requests per minute per user
- **Session Management:** Secure, HTTP-only cookies
- **Audit Logging:** All sensitive operations logged

### 4.3 Reliability Requirements
- **Uptime:** 99% availability (max 7.3 hours downtime per month)
- **Backup:** Daily automated database backups, 30-day retention
- **Error Handling:** Graceful error messages, no stack traces exposed
- **Data Integrity:** Database transactions for complex operations
- **Recovery:** System restart procedures documented

### 4.4 Usability Requirements
- **Language:** Complete Bahasa Indonesia interface
- **Accessibility:** WCAG 2.1 Level A compliance
- **Mobile Responsive:** Functional on screens ≥ 375px width
- **Browser Support:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Help System:** Contextual help tooltips
- **Error Messages:** Clear, actionable, in Indonesian

### 4.5 Scalability Requirements
- **Current:** 50 concurrent users, 100,000 reports per year
- **Year 1:** 100 concurrent users, 200,000 reports
- **Year 3:** 200 concurrent users, 500,000 reports, multi-regional

---

## 5. Technical Specifications

### 5.1 Technology Stack
- **Frontend:** React + TanStack Start (SSR), TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui components
- **Backend:** TanStack Start API routes (full-stack framework)
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM
- **Authentication:** JWT + bcrypt
- **File Storage:** Local filesystem (VPS)
- **Charts:** Recharts or Chart.js
- **Excel Export:** ExcelJS
- **PDF Export:** Puppeteer
- **Testing:** Vitest, Testing Library, Playwright
- **Deployment:** VPS Ubuntu 22.04 LTS, Nginx, PM2

### 5.2 Database Schema Summary
```sql
-- Core Tables
users (id, username, email, password_hash, role, opd_id, status, created_at, updated_at)
opd (id, name, code, description, created_at, updated_at)
jenis_retribusi (id, kategori, nama, kode, opd_id, created_at, updated_at)
laporan_retribusi (id, retribusi_id, user_id, tanggal_setor, tanggal_input, nominal, bukti_setor_path, keterangan, status, cancelled_by, cancelled_at, cancellation_reason, deleted_at, created_at, updated_at)
target_retribusi (id, retribusi_id, tahun, bulan, target_nominal, created_at, updated_at)
audit_log (id, user_id, action, table_name, record_id, old_value, new_value, ip_address, created_at)

-- Indexes for Performance
CREATE INDEX idx_laporan_tanggal_setor ON laporan_retribusi(tanggal_setor);
CREATE INDEX idx_laporan_user ON laporan_retribusi(user_id);
CREATE INDEX idx_laporan_retribusi ON laporan_retribusi(retribusi_id);
CREATE INDEX idx_laporan_status ON laporan_retribusi(status);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_table ON audit_log(table_name, record_id);
```

### 5.3 API Endpoints Summary
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id/status

GET    /api/opd
POST   /api/opd
PUT    /api/opd/:id
DELETE /api/opd/:id

GET    /api/retribusi
POST   /api/retribusi
PUT    /api/retribusi/:id
DELETE /api/retribusi/:id

GET    /api/laporan
POST   /api/laporan
GET    /api/laporan/:id
PUT    /api/laporan/:id
DELETE /api/laporan/:id
POST   /api/laporan/:id/cancel

GET    /api/dashboard/operator
GET    /api/dashboard/admin
GET    /api/dashboard/executive
GET    /api/dashboard/public

POST   /api/export/excel
POST   /api/export/pdf

POST   /api/upload/bukti-setor
GET    /api/files/:filename
```

---

## 6. Project Timeline & Milestones

### Phase 1: MVP (November - December 2025)

#### Sprint 1 (Nov 5-18): Foundation
- [ ] Project setup + Git repository
- [ ] Database schema design + migrations
- [ ] Authentication system (login, JWT, RBAC)
- [ ] User management CRUD (admin only)

**Deliverable:** Admin dapat login dan manage users

#### Sprint 2 (Nov 19 - Dec 2): Core Features
- [ ] OPD management CRUD
- [ ] Jenis Retribusi management CRUD
- [ ] Laporan input form dengan validasi
- [ ] File upload functionality
- [ ] Laporan list view dengan pagination

**Deliverable:** Operator dapat input dan view laporan

#### Sprint 3 (Dec 3-16): Dashboard & Export
- [ ] Operator dashboard dengan summary cards + chart
- [ ] Admin dashboard dengan monitoring + alerts
- [ ] Executive dashboard dengan high-level metrics
- [ ] Public transparency dashboard
- [ ] Excel export functionality
- [ ] PDF export functionality

**Deliverable:** Semua dashboard functional + export works

#### Sprint 4 (Dec 17-30): Testing & Deployment
- [ ] Unit tests + integration tests
- [ ] E2E testing dengan Playwright
- [ ] Security testing + penetration test
- [ ] Performance optimization
- [ ] User Acceptance Testing (UAT) dengan Bapenda
- [ ] Bug fixes dari UAT
- [ ] Production deployment ke VPS
- [ ] User training sessions
- [ ] Documentation finalization

**Deliverable:** Production-ready system + user trained

### Phase 2: Enhancements (Q1 2026)
- Email notifications
- SMS alerts
- Target vs Realization tracking
- Advanced filtering + search
- Mobile app considerations

### Phase 3: Integration (Q2 2026)
- SIMDA/SIPKD integration
- Bank reconciliation
- Digital signature
- API for external systems

---

## 7. Success Criteria & KPIs

### Launch Success Criteria
- [ ] 100% OPD onboarded dan trained
- [ ] >95% system uptime dalam bulan pertama
- [ ] <5 critical bugs in production
- [ ] User satisfaction score >4.0/5.0
- [ ] >90% laporan submitted on time (H+1)

### Ongoing KPIs (Monthly Tracking)
1. **Adoption Metrics:**
   - Active users (DAU/MAU ratio)
   - Reports submitted per OPD per day
   - Login frequency per user

2. **Performance Metrics:**
   - System uptime %
   - Average page load time
   - API response time P95
   - Error rate %

3. **Business Metrics:**
   - On-time reporting compliance %
   - Data accuracy rate (audit findings)
   - Time saved vs manual process
   - Admin intervention rate (cancellations, corrections)

4. **User Experience Metrics:**
   - User satisfaction survey (quarterly)
   - Support tickets per week
   - Average time to complete report submission
   - Feature usage analytics

---

## 8. Risks & Mitigation

### Technical Risks

**Risk 1: Data Loss**
- **Impact:** High
- **Probability:** Low
- **Mitigation:**
  - Daily automated backups
  - 30-day backup retention
  - Monthly backup restore testing
  - Database replication (Phase 2)

**Risk 2: Performance Degradation**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:**
  - Database query optimization + indexing
  - Pagination for large datasets
  - Background job processing for exports
  - Load testing before launch
  - Monitoring + alerts

**Risk 3: Security Breach**
- **Impact:** High
- **Probability:** Low
- **Mitigation:**
  - Regular security audits
  - Penetration testing
  - HTTPS enforcement
  - Rate limiting + IP whitelisting
  - Audit trail logging
  - Regular security patches

### Business Risks

**Risk 4: Low User Adoption**
- **Impact:** High
- **Probability:** Medium
- **Mitigation:**
  - Comprehensive user training
  - Easy-to-use interface design
  - Onboarding support team
  - Feedback collection + iteration
  - Management endorsement

**Risk 5: Data Quality Issues**
- **Impact:** Medium
- **Probability:** Medium
- **Mitigation:**
  - Strong input validation
  - Duplicate detection
  - Admin review workflow
  - Audit trail for accountability
  - Regular data quality reports

---

## 9. Assumptions & Dependencies

### Assumptions
1. VPS infrastructure available dan memenuhi minimum specs (2vCPU, 4GB RAM, 40GB SSD)
2. OPD operators memiliki internet access yang reliable
3. Bukti setor dalam format digital (PDF/JPG/PNG)
4. Bapenda IT team dapat provide initial data migration support
5. Government network allow HTTPS traffic on standard ports

### Dependencies
1. **VPS Setup:** Bapenda IT team menyediakan VPS access + credentials
2. **Master Data:** Bapenda provide existing OPD list + retribusi types
3. **User Accounts:** Bapenda provide initial user list (username, email, OPD assignment)
4. **Logo & Branding:** Pemda logo untuk kop surat dan dashboard
5. **Training Schedule:** Bapenda coordinate training sessions dengan semua OPD
6. **Go-Live Approval:** Final sign-off dari Kepala Bapenda

---

## 10. Appendix

### A. Glossary
- **OPD:** Organisasi Perangkat Daerah (regional government agency)
- **Bapenda:** Badan Pendapatan Daerah (Regional Revenue Agency)
- **Retribusi:** Regional retribution/fee for government services
- **Bukti Setor:** Proof of deposit/payment receipt
- **PAD:** Pendapatan Asli Daerah (Original Regional Revenue)

### B. References
- UU No. 1 Tahun 2022 tentang Hubungan Keuangan Pusat dan Daerah
- UU No. 28 Tahun 2009 tentang Pajak Daerah dan Retribusi Daerah
- UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik
- Permendagri tentang Standar Pelayanan Minimal

### C. Change Log
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-05 | AI Assistant | Initial PRD creation |

---

**Document Approval:**

- [ ] Product Owner (Kepala Bapenda): ____________________
- [ ] IT Manager (Bapenda): ____________________
- [ ] Developer Lead: ____________________
- [ ] Stakeholder Representative: ____________________

**Next Steps:**
1. Review PRD dengan stakeholders (target: Nov 8)
2. Technical design review (target: Nov 10)
3. Development kickoff (target: Nov 12)

---

*This PRD is a living document and will be updated as requirements evolve throughout the development process.*