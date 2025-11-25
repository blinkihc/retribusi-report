# Master Data Implementation Plan

**Document Type**: Implementation Planning & Analysis  
**Status**: PENDING APPROVAL  
**Created**: November 13, 2025 09:05 WIB  
**Version**: 1.0

---

## 📋 Executive Summary

Dokumen ini berisi analisis dan perencanaan implementasi untuk **Master Data Management** yang mencakup:
1. **OPD (Organisasi Perangkat Daerah)** - 15 OPD
2. **Jenis Retribusi** - 51 jenis retribusi
3. **Relasi OPD-Pelayanan** - Konfigurasi many-to-many relationship

Semua data akan **configurable via frontend** dengan interface CRUD lengkap.

---

## 📊 Data Analysis

### 1. Data OPD (Organisasi Perangkat Daerah)

**Source File**: `docs/RBS_M_DINAS.json`  
**Total Records**: 15 OPD

#### Struktur Data Source:
```json
{
  "CPM_KODE": "PERKIMTAN",
  "CPM_DINAS": "DINAS PERUMAHAN RAKYAT, KAWASAN PERMUKIMAN DAN PERTANAHAN",
  "CPM_ALAMAT": "Jln. G. Obos XI Komplek Perkantoran Lingkar Dalam"
}
```

#### Mapping ke Database Schema:
| Source Field | Target Field | Type | Notes |
|--------------|--------------|------|-------|
| CPM_KODE | kode | varchar(20) | Primary identifier |
| CPM_DINAS | nama | varchar(200) | Nama lengkap OPD |
| CPM_ALAMAT | alamat | text | Alamat kantor |

#### Daftar OPD:
1. PERKIMTAN - Dinas Perumahan Rakyat, Kawasan Permukiman dan Pertanahan
2. DPKP - Dinas Pertanian dan Ketahanan Pangan
3. DAMKAR - Dinas Pemadam Kebakaran dan Penyelamatan
4. DISKOMINFO - Dinas Komunikasi Informatika, Statistik dan Persandian
5. DINPER - Dinas Perikanan
6. DISPERINDAGKOP - Dinas Perindustrian, Perdagangan dan Koperasi
7. DLH - Dinas Lingkungan Hidup
8. SEKDA - Sekretariat Daerah
9. DISBUDPAR - Dinas Kebudayaan dan Pariwisata
10. DISNAKER - Dinas Tenaga Kerja
11. DISHUB - Dinas Perhubungan
12. DINKES - Dinas Kesehatan
13. DINPUPR - Dinas Pekerjaan Umum dan Penataan Ruang
14. BAPENDA - Badan Pendapatan Daerah
15. DPMPTSP - Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu

---

### 2. Data Jenis Retribusi

**Source File**: `docs/Jenis-Retribusi-RETRIBUSI.json`  
**Total Records**: 51 jenis retribusi

#### Struktur Data Source:
```json
{
  "kode_rekening": "4.1.02.01.01.0001",
  "nama_rekening": "Pelayanan Kesehatan di Puskesmas",
  "jenis_retribusi": "Retribusi Jasa Umum",
  "jenis_pelayanan": "Retribusi Pelayanan Kesehatan"
}
```

#### Mapping ke Database Schema:
| Source Field | Target Field | Type | Notes |
|--------------|--------------|------|-------|
| kode_rekening | kode | varchar(20) | Kode rekening (unique) |
| nama_rekening | nama | varchar(200) | Nama jenis retribusi |
| jenis_retribusi | kategori | varchar(50) | Kategori retribusi |
| jenis_pelayanan | keterangan | text | Jenis pelayanan detail |

#### Kategori Retribusi:
1. **Retribusi Jasa Umum** (13 items)
   - Pelayanan Kesehatan (6 items)
   - Pelayanan Persampahan/Kebersihan (4 items)
   - Pelayanan Parkir (1 item)
   - Pelayanan Pasar (3 items)
   - Pengendalian Lalu Lintas (1 item)

2. **Retribusi Jasa Usaha** (35 items)
   - Pemakaian Kekayaan Daerah (7 items)
   - Pasar Grosir/Pertokoan (3 items)
   - Tempat Pelelangan (4 items)
   - Tempat Parkir (2 items)
   - Rumah Potong Hewan (2 items)
   - Kepelabuhanan (2 items)
   - Tempat Rekreasi & Olahraga (2 items)
   - Penyeberangan Air (3 items)
   - Penjualan Produksi Usaha Daerah (5 items)
   - Lainnya (5 items)

3. **Retribusi Perizinan Tertentu** (3 items)
   - Persetujuan Bangunan Gedung
   - Penggunaan Tenaga Kerja Asing
   - Pertambangan Rakyat

---

### 3. Relasi OPD - Jenis Pelayanan

**Requirement**: Many-to-Many relationship antara OPD dan Jenis Retribusi

#### Tabel Junction: `opd_pelayanan`

**Purpose**: 
- Menghubungkan OPD dengan jenis retribusi yang mereka kelola
- Satu OPD bisa mengelola banyak jenis retribusi
- Satu jenis retribusi bisa dikelola oleh banyak OPD (jika ada)

**Schema**:
```sql
CREATE TABLE opd_pelayanan (
  id SERIAL PRIMARY KEY,
  kode_opd VARCHAR(20) NOT NULL,
  nama_jenis_retribusi VARCHAR(200) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign Keys
  FOREIGN KEY (kode_opd) REFERENCES opd(kode) ON DELETE CASCADE,
  FOREIGN KEY (nama_jenis_retribusi) REFERENCES jenis_retribusi(nama) ON DELETE CASCADE,
  
  -- Unique Constraint (prevent duplicate)
  UNIQUE(kode_opd, nama_jenis_retribusi)
);

-- Indexes for performance
CREATE INDEX idx_opd_pelayanan_kode_opd ON opd_pelayanan(kode_opd);
CREATE INDEX idx_opd_pelayanan_nama_jenis ON opd_pelayanan(nama_jenis_retribusi);
```

**Example Data**:
```
DINKES → Pelayanan Kesehatan di Puskesmas
DINKES → Pelayanan Kesehatan di Puskesmas Keliling
DLH → Pelayanan Persampahan/Kebersihan
DISHUB → Penyediaan Pelayanan Parkir di Tepi Jalan Umum
```

---

## 🗄️ Database Schema Updates

### 1. Tabel `opd` (Existing - No Changes)

**Current Schema**:
```sql
CREATE TABLE opd (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(200) NOT NULL,
  alamat TEXT,
  telepon VARCHAR(20),
  email VARCHAR(100),
  pic_name VARCHAR(100),
  pic_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

**Fields to Populate from JSON**:
- ✅ `kode` ← CPM_KODE
- ✅ `nama` ← CPM_DINAS
- ✅ `alamat` ← CPM_ALAMAT
- ⚠️ `telepon`, `email`, `pic_name`, `pic_phone` → NULL (bisa diisi manual via frontend)

---

### 2. Tabel `jenis_retribusi` (Existing - No Changes)

**Current Schema**:
```sql
CREATE TABLE jenis_retribusi (
  id SERIAL PRIMARY KEY,
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(200) NOT NULL,
  kategori VARCHAR(50),
  tarif DECIMAL(15,2),
  satuan VARCHAR(50),
  dasar_hukum TEXT,
  keterangan TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
```

**Fields to Populate from JSON**:
- ✅ `kode` ← kode_rekening
- ✅ `nama` ← nama_rekening
- ✅ `kategori` ← jenis_retribusi
- ✅ `keterangan` ← jenis_pelayanan
- ⚠️ `tarif`, `satuan`, `dasar_hukum` → NULL (bisa diisi manual via frontend)

---

### 3. Tabel `opd_pelayanan` (NEW - Junction Table)

**Purpose**: Many-to-many relationship

**Schema**:
```sql
CREATE TABLE opd_pelayanan (
  id SERIAL PRIMARY KEY,
  kode_opd VARCHAR(20) NOT NULL,
  kode_jenis_retribusi VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (kode_opd) REFERENCES opd(kode) ON DELETE CASCADE,
  FOREIGN KEY (kode_jenis_retribusi) REFERENCES jenis_retribusi(kode) ON DELETE CASCADE,
  
  UNIQUE(kode_opd, kode_jenis_retribusi)
);

CREATE INDEX idx_opd_pelayanan_kode_opd ON opd_pelayanan(kode_opd);
CREATE INDEX idx_opd_pelayanan_kode_jenis ON opd_pelayanan(kode_jenis_retribusi);
```

**Drizzle ORM Schema**:
```typescript
export const opdPelayanan = pgTable(
  'opd_pelayanan',
  {
    id: serial('id').primaryKey(),
    kodeOpd: varchar('kode_opd', { length: 20 }).notNull(),
    namaJenisRetribusi: varchar('nama_jenis_retribusi', { length: 200 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    kodeOpdIdx: index('opd_pelayanan_kode_opd_idx').on(table.kodeOpd),
    namaJenisIdx: index('opd_pelayanan_nama_jenis_idx').on(table.namaJenisRetribusi),
    uniqueRelation: unique().on(table.kodeOpd, table.namaJenisRetribusi),
  })
)
```

---

## 🎯 Implementation Scope

### Phase 1: Backend API Development

#### 1.1 OPD Management API

**Endpoints**:
```
GET    /api/opd                 # List all OPD (with pagination, search, filter)
GET    /api/opd/:kode           # Get OPD detail by kode
POST   /api/opd                 # Create new OPD
PUT    /api/opd/:kode           # Update OPD
DELETE /api/opd/:kode           # Soft delete OPD
POST   /api/opd/seed            # Seed data from JSON (admin only)
```

**Features**:
- ✅ Pagination (page, limit)
- ✅ Search (by kode, nama)
- ✅ Filter (by is_active)
- ✅ Sorting (by kode, nama, created_at)
- ✅ Validation (Zod schema)
- ✅ Soft delete (set deleted_at)
- ✅ Audit logging

---

#### 1.2 Jenis Retribusi Management API

**Endpoints**:
```
GET    /api/jenis-retribusi                # List all (with pagination, search, filter)
GET    /api/jenis-retribusi/:kode          # Get detail by kode
POST   /api/jenis-retribusi                # Create new
PUT    /api/jenis-retribusi/:kode          # Update
DELETE /api/jenis-retribusi/:kode          # Soft delete
GET    /api/jenis-retribusi/kategori       # Get unique categories
POST   /api/jenis-retribusi/seed           # Seed data from JSON (admin only)
```

**Features**:
- ✅ Pagination (page, limit)
- ✅ Search (by kode, nama)
- ✅ Filter (by kategori, is_active)
- ✅ Sorting (by kode, nama, kategori)
- ✅ Validation (Zod schema)
- ✅ Soft delete
- ✅ Audit logging

---

#### 1.3 OPD-Pelayanan Relationship API

**Endpoints**:
```
GET    /api/opd-pelayanan                          # List all relationships
GET    /api/opd-pelayanan/opd/:kode_opd           # Get all pelayanan for OPD
GET    /api/opd-pelayanan/retribusi/:nama         # Get all OPD for retribusi (by nama)
POST   /api/opd-pelayanan                          # Create relationship
DELETE /api/opd-pelayanan/:id                      # Delete relationship
POST   /api/opd-pelayanan/bulk                     # Bulk assign (multiple at once)
```

**Features**:
- ✅ Get pelayanan by OPD
- ✅ Get OPD by pelayanan
- ✅ Bulk assignment
- ✅ Validation (prevent duplicate)
- ✅ Cascade delete handling

---

### Phase 2: Frontend Development

#### 2.1 OPD Management Pages

**Pages**:
1. **OPD List Page** (`/dashboard/opd`)
   - Table with columns: Kode, Nama, Alamat, Status, Actions
   - Search bar (kode, nama)
   - Filter: Active/Inactive
   - Pagination
   - Actions: View, Edit, Delete
   - Button: + Tambah OPD, Seed Data

2. **OPD Form Page** (`/dashboard/opd/create`, `/dashboard/opd/:kode/edit`)
   - Form fields:
     - Kode OPD (required, unique)
     - Nama OPD (required)
     - Alamat (optional)
     - Telepon (optional)
     - Email (optional)
     - PIC Name (optional)
     - PIC Phone (optional)
     - Status Active (checkbox)
   - Validation
   - Submit & Cancel buttons

3. **OPD Detail Page** (`/dashboard/opd/:kode`)
   - Display all OPD info
   - List of assigned jenis retribusi
   - Button: Edit, Delete, Assign Pelayanan

---

#### 2.2 Jenis Retribusi Management Pages

**Pages**:
1. **Jenis Retribusi List Page** (`/dashboard/jenis-retribusi`)
   - Table with columns: Kode, Nama, Kategori, Tarif, Status, Actions
   - Search bar (kode, nama)
   - Filter: Kategori dropdown, Active/Inactive
   - Pagination
   - Actions: View, Edit, Delete
   - Button: + Tambah Jenis Retribusi, Seed Data

2. **Jenis Retribusi Form Page** (`/dashboard/jenis-retribusi/create`, `/dashboard/jenis-retribusi/:kode/edit`)
   - Form fields:
     - Kode Rekening (required, unique)
     - Nama Rekening (required)
     - Kategori (dropdown: Jasa Umum, Jasa Usaha, Perizinan Tertentu)
     - Tarif (number, optional)
     - Satuan (optional)
     - Dasar Hukum (textarea, optional)
     - Keterangan (textarea, optional)
     - Status Active (checkbox)
   - Validation
   - Submit & Cancel buttons

3. **Jenis Retribusi Detail Page** (`/dashboard/jenis-retribusi/:kode`)
   - Display all info
   - List of assigned OPD
   - Button: Edit, Delete

---

#### 2.3 OPD-Pelayanan Configuration Page

**Page**: **Konfigurasi OPD-Pelayanan** (`/dashboard/konfigurasi/opd-pelayanan`)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Konfigurasi OPD - Jenis Pelayanan                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Pilih OPD:  [Dropdown: Select OPD]                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Jenis Pelayanan yang Tersedia                     │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │ Search: [____________]  Filter: [Kategori ▼] │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │                                                    │ │
│  │  ☐ 4.1.02.01.01.0001 - Pelayanan Kesehatan...    │ │
│  │  ☑ 4.1.02.01.01.0002 - Pelayanan Kesehatan...    │ │
│  │  ☐ 4.1.02.01.02.0001 - Pelayanan Persampahan...  │ │
│  │  ☑ 4.1.02.01.04.0001 - Penyediaan Pelayanan...   │ │
│  │  ...                                              │ │
│  │                                                    │ │
│  │  [Select All] [Deselect All]                      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Simpan Konfigurasi]  [Batal]                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- ✅ Dropdown untuk pilih OPD
- ✅ Checkbox list untuk jenis pelayanan
- ✅ Search & filter jenis pelayanan
- ✅ Select All / Deselect All
- ✅ Bulk save (simpan semua perubahan sekaligus)
- ✅ Show current assignments (checked)
- ✅ Real-time update

**Alternative View**: **Matrix View**
```
┌─────────────────────────────────────────────────────────┐
│  Matrix View: OPD vs Jenis Pelayanan                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Filter Kategori: [All ▼]                               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │         │ DINKES │ DLH │ DISHUB │ BAPENDA │ ...   │ │
│  ├─────────┼────────┼─────┼────────┼─────────┼───────┤ │
│  │ 4.1.02..│   ☑    │  ☐  │   ☐    │    ☐    │  ...  │ │
│  │ 4.1.02..│   ☑    │  ☐  │   ☐    │    ☐    │  ...  │ │
│  │ 4.1.02..│   ☐    │  ☑  │   ☐    │    ☐    │  ...  │ │
│  │ 4.1.02..│   ☐    │  ☐  │   ☑    │    ☐    │  ...  │ │
│  │ ...     │  ...   │ ... │  ...   │   ...   │  ...  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Simpan Semua]  [Reset]                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 3: Data Seeding

#### 3.1 OPD Seeding Script

**File**: `server/scripts/seed-opd.ts`

**Process**:
1. Read `docs/RBS_M_DINAS.json`
2. Transform data:
   ```typescript
   {
     kode: CPM_KODE,
     nama: CPM_DINAS,
     alamat: CPM_ALAMAT,
     isActive: true
   }
   ```
3. Insert to database (upsert - update if exists)
4. Log results (success/failed count)

**Execution**:
- Via API: `POST /api/opd/seed` (admin only)
- Via CLI: `npm run seed:opd`

---

#### 3.2 Jenis Retribusi Seeding Script

**File**: `server/scripts/seed-jenis-retribusi.ts`

**Process**:
1. Read `docs/Jenis-Retribusi-RETRIBUSI.json`
2. Transform data:
   ```typescript
   {
     kode: kode_rekening,
     nama: nama_rekening,
     kategori: jenis_retribusi,
     keterangan: jenis_pelayanan,
     isActive: true
   }
   ```
3. Insert to database (upsert)
4. Log results

**Execution**:
- Via API: `POST /api/jenis-retribusi/seed` (admin only)
- Via CLI: `npm run seed:jenis-retribusi`

---

## 🔐 Security & Authorization

### Role-Based Access Control

**Admin**:
- ✅ Full CRUD access to OPD
- ✅ Full CRUD access to Jenis Retribusi
- ✅ Configure OPD-Pelayanan relationships
- ✅ Seed data from JSON
- ✅ View all data

**Operator**:
- ✅ View OPD (read-only)
- ✅ View Jenis Retribusi (read-only)
- ✅ View assigned pelayanan for their OPD
- ❌ Cannot create/edit/delete master data
- ❌ Cannot configure relationships

---

## 📱 UI/UX Considerations

### Design Principles
1. **Consistency**: Follow existing dashboard design pattern
2. **Simplicity**: Clear labels, minimal clicks
3. **Feedback**: Loading states, success/error messages
4. **Validation**: Real-time validation with clear error messages
5. **Responsive**: Mobile-friendly tables (horizontal scroll or cards)

### Component Reusability
- ✅ Table component with pagination
- ✅ Search bar component
- ✅ Filter dropdown component
- ✅ Form input components
- ✅ Modal for confirmations
- ✅ Toast notifications

---

## 🧪 Testing Strategy

### Backend Testing
- ✅ Unit tests for validation schemas
- ✅ Integration tests for API endpoints
- ✅ Test data seeding scripts
- ✅ Test relationship constraints

### Frontend Testing
- ✅ Manual testing for all CRUD operations
- ✅ Test pagination, search, filter
- ✅ Test form validation
- ✅ Test bulk operations
- ✅ Test responsive design

---

## 📊 Success Metrics

### Functional Requirements
- ✅ All 15 OPD dapat di-manage via frontend
- ✅ All 51 jenis retribusi dapat di-manage via frontend
- ✅ Relationship OPD-Pelayanan dapat dikonfigurasi
- ✅ Data seeding berjalan tanpa error
- ✅ Validation mencegah data invalid
- ✅ Soft delete berfungsi dengan baik

### Performance Requirements
- ✅ API response time < 200ms
- ✅ Table pagination smooth (no lag)
- ✅ Search/filter instant (<100ms)
- ✅ Bulk operations complete < 2s

---

## 📅 Implementation Timeline

### Week 1: Backend Development
- **Day 1-2**: Database schema update, Drizzle ORM models
- **Day 3-4**: OPD & Jenis Retribusi API endpoints
- **Day 5**: OPD-Pelayanan relationship API
- **Day 6**: Data seeding scripts
- **Day 7**: Testing & bug fixes

### Week 2: Frontend Development
- **Day 1-2**: OPD management pages (list, form, detail)
- **Day 3-4**: Jenis Retribusi management pages
- **Day 5-6**: OPD-Pelayanan configuration page
- **Day 7**: Integration testing & refinement

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Database migration script ready
- [ ] Seed data scripts tested
- [ ] All API endpoints tested
- [ ] Frontend pages tested
- [ ] Documentation updated

### Deployment Steps
1. Run database migration
2. Seed OPD data
3. Seed Jenis Retribusi data
4. Deploy backend
5. Deploy frontend
6. Verify all features working
7. Create checkpoint

### Post-Deployment
- [ ] Monitor for errors
- [ ] Collect user feedback
- [ ] Update documentation
- [ ] Create new checkpoint

---

## 📝 Open Questions & Decisions Needed

### 1. OPD-Pelayanan Assignment
**Question**: Apakah assignment OPD-Pelayanan akan di-seed otomatis atau manual via frontend?

**Options**:
- **A**: Manual assignment via frontend (lebih flexible)
- **B**: Auto-assign based on business logic (e.g., DINKES → semua pelayanan kesehatan)
- **C**: Hybrid: Auto-assign default, bisa di-edit manual

**Recommendation**: Option A (Manual) - lebih flexible dan sesuai kebutuhan real

---

### 2. Data Validation
**Question**: Apakah tarif retribusi wajib diisi?

**Options**:
- **A**: Optional (bisa NULL, diisi manual nanti)
- **B**: Required (harus diisi saat create/edit)

**Recommendation**: Option A (Optional) - karena data source tidak punya tarif

---

### 3. Soft Delete vs Hard Delete
**Question**: Apakah OPD/Jenis Retribusi yang sudah dipakai di laporan bisa dihapus?

**Options**:
- **A**: Soft delete only (set deleted_at, data tetap ada)
- **B**: Hard delete allowed (hapus permanent)
- **C**: Prevent delete if used in reports

**Recommendation**: Option C (Prevent delete) - untuk data integrity

---

### 4. UI Preference for OPD-Pelayanan Config
**Question**: Mana yang lebih preferred?

**Options**:
- **A**: Checkbox list per OPD (simpler)
- **B**: Matrix view (all OPD vs all pelayanan)
- **C**: Both (toggle view)

**Recommendation**: Option A (Checkbox list) - lebih simple untuk start, bisa add matrix view nanti

---

## 📋 Approval Checklist

Mohon review dan approve hal-hal berikut:

### Database Schema
- [ ] Tabel `opd` - existing schema OK
- [ ] Tabel `jenis_retribusi` - existing schema OK
- [ ] Tabel `opd_pelayanan` - new junction table OK
- [ ] Foreign key constraints OK
- [ ] Indexes OK

### Data Mapping
- [ ] OPD mapping (3 kolom: kode, nama, alamat) OK
- [ ] Jenis Retribusi mapping (4 kolom: kode, nama, kategori, keterangan) OK
- [ ] Relationship structure OK

### API Endpoints
- [ ] OPD CRUD endpoints OK
- [ ] Jenis Retribusi CRUD endpoints OK
- [ ] OPD-Pelayanan relationship endpoints OK
- [ ] Seed endpoints OK

### Frontend Pages
- [ ] OPD management pages OK
- [ ] Jenis Retribusi management pages OK
- [ ] OPD-Pelayanan configuration page OK
- [ ] UI/UX design approach OK

### Open Questions
- [ ] OPD-Pelayanan assignment strategy decided
- [ ] Tarif validation rule decided
- [ ] Delete strategy decided
- [ ] UI preference decided

---

## ✅ Next Steps After Approval

1. **Update Drizzle schema** - Add `opd_pelayanan` table
2. **Create migration script** - Database changes
3. **Implement backend APIs** - All endpoints
4. **Create seed scripts** - Data population
5. **Implement frontend pages** - UI components
6. **Testing** - End-to-end testing
7. **Documentation** - API docs & user guide
8. **Deployment** - Production release

---

**Document Status**: 🟡 PENDING APPROVAL  
**Awaiting Decision On**: Open Questions (4 items)  
**Ready to Implement**: After approval & decisions

---

**Prepared By**: AI Assistant  
**Review Required By**: User  
**Target Start Date**: After approval  
**Estimated Completion**: 2 weeks
