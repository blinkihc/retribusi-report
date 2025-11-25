# CHECKPOINT 7: 3-Tier Dropdown Logic Fix

**Date:** 2025-11-14  
**Status:** ✅ COMPLETED

## 🎯 Objective
Perbaiki logic 3-tier dropdown agar:
1. Tier 2 dan Tier 3 menampilkan data yang benar
2. Hanya menampilkan jenis retribusi yang di-assign ke OPD
3. Fix infinite loop error
4. Fix NaN warning

## 🐛 Problems Fixed

### **1. Tier 2 & Tier 3 Terbalik**
**Problem:**
- Tier 2 menampilkan `nama` (seharusnya `deskripsi`)
- Tier 3 menampilkan `deskripsi` (seharusnya `nama`)

**Solution:**
```typescript
// Tier 2: Show deskripsi (Jenis Pelayanan)
const uniquePelayanan = Array.from(
  new Set(filteredByKategori?.map((item) => item.deskripsi).filter(Boolean) || [])
)

// Tier 3: Show nama (Jenis Retribusi)
{filteredJenisRetribusi?.map((item) => (
  <option value={item.jenisRetribusiId}>
    {item.jenisRetribusiNama}
  </option>
))}
```

### **2. NaN Warning**
**Problem:**
```
Warning: Received NaN for the `value` attribute
```

**Root Cause:** Backend tidak mengembalikan `jenisRetribusiId`

**Solution:**
```typescript
// Backend: Add jenisRetribusiId
.select({
  jenisRetribusiId: jenisRetribusi.id,  // ← NEW
  jenisRetribusiNama: opdPelayanan.namaJenisRetribusi,
  // ...
})

// Frontend: Use jenisRetribusiId
<option value={item.jenisRetribusiId || 0}>
```

### **3. OPD Assignment Filter**
**Problem:** Dropdown menampilkan semua jenis retribusi, tidak filter by OPD

**Root Cause:** 
- Tier 1 menggunakan hardcoded `KATEGORI_OPTIONS`
- Backend tidak support filter by `opdKode`

**Solution:**

**Backend:**
```typescript
// Add query parameter support
GET /api/opd-pelayanan?opdKode=DINKES&kategori=Retribusi%20Jasa%20Umum

// Filter by opdKode
const conditions = [eq(opdPelayanan.isActive, true)]
if (opdKode) {
  conditions.push(eq(opdPelayanan.kodeOpd, opdKode))
}
```

**Frontend:**
```typescript
// Fetch ALL assignments for OPD
const { data: opdJenisRetribusiList } = useQuery({
  queryKey: ['opd-jenis-retribusi', opdKode],
  queryFn: () => getOPDPelayananList({ opdKode, limit: 1000 }),
  enabled: !!opdKode,
})

// Extract unique kategori from assignments
const uniqueKategori = Array.from(
  new Set(opdJenisRetribusiList?.data.map((item) => item.kategori).filter(Boolean) || [])
)

// Cascade filtering
const filteredByKategori = opdJenisRetribusiList?.data.filter(
  (item) => !selectedKategori || item.kategori === selectedKategori
)

const uniquePelayanan = Array.from(
  new Set(filteredByKategori?.map((item) => item.deskripsi).filter(Boolean) || [])
)

const filteredJenisRetribusi = filteredByKategori?.filter(
  (item) => !selectedPelayanan || item.deskripsi === selectedPelayanan
)
```

### **4. Infinite Loop**
**Problem:**
```
Warning: Maximum update depth exceeded
```

**Root Cause:** `onJenisChange` in useEffect dependencies causes infinite loop

**Solution:**
```typescript
// biome-ignore lint/correctness/useExhaustiveDependencies: onJenisChange causes infinite loop
useEffect(() => {
  setSelectedKategori('')
  setSelectedPelayanan('')
  onJenisChange(0)
}, [opdId])  // Only depend on opdId
```

## 📊 Data Structure (Corrected)

```
jenis_retribusi table:
├─ kategori: "Retribusi Jasa Umum"        ← TIER 1
├─ deskripsi: "Retribusi Pelayanan Kesehatan"  ← TIER 2
└─ nama: "Pelayanan Kesehatan di Puskesmas"    ← TIER 3
```

## 🔄 Complete Flow

```
1. User selects OPD
   ↓
2. Fetch all jenis retribusi assigned to OPD
   GET /api/opd-pelayanan?opdKode=DINKES
   ↓
3. Extract unique kategori (Tier 1)
   ["Retribusi Jasa Umum"]
   ↓
4. User selects kategori
   ↓
5. Filter by kategori, extract unique deskripsi (Tier 2)
   ["Retribusi Pelayanan Kesehatan"]
   ↓
6. User selects pelayanan
   ↓
7. Filter by deskripsi, show nama (Tier 3)
   ["Pelayanan Kesehatan di Puskesmas", "Pelayanan Kesehatan di Puskesmas Keliling"]
```

## 📁 Files Modified

### **Backend:**
- `server/routes/opd-pelayanan.ts`
  - Added `jenisRetribusiId` field
  - Added `deskripsi` field
  - Added `opdKode` query parameter support
  - Added `kategori` query parameter support

### **Frontend:**
- `src/lib/api/opd-pelayanan.ts`
  - Added `jenisRetribusiId` to interface
  - Added `deskripsi` to interface

- `src/components/LaporanForm/JenisRetribusiSelector.tsx`
  - Removed hardcoded `KATEGORI_OPTIONS`
  - Fetch all OPD assignments
  - Dynamic kategori extraction
  - Cascade filtering logic
  - Fixed Tier 2/Tier 3 data display
  - Fixed useEffect infinite loop
  - Use `jenisRetribusiId` for option values

## ✅ Testing Results

**DINKES:**
- ✅ Tier 1: Retribusi Jasa Umum
- ✅ Tier 2: Retribusi Pelayanan Kesehatan
- ✅ Tier 3: Pelayanan Kesehatan di Puskesmas, Pelayanan Kesehatan di Puskesmas Keliling

**DISHUB:**
- ✅ Tier 1: Retribusi Jasa Umum
- ✅ Tier 2: Retribusi Pelayanan Parkir di Tepi Jalan Umum
- ✅ Tier 3: Penyediaan Pelayanan Parkir di Tepi Jalan Umum

**BAPENDA:**
- ✅ Shows only assigned retribusi

## 🚀 Next Steps

1. **Backend Integration:**
   - [ ] File upload endpoint (multipart/form-data)
   - [ ] PDF generation endpoint
   - [ ] Update laporan API to accept files

2. **List Page:**
   - [ ] Add action buttons (Edit, Delete, Submit)
   - [ ] Add confirmation dialogs
   - [ ] Populate filter dropdowns

3. **Testing:**
   - [ ] Test all form scenarios
   - [ ] Test file upload
   - [ ] Test 3-tier dropdown with all OPDs
   - [ ] Test responsive layout

---

**Checkpoint Created:** 2025-11-14  
**Issues Fixed:** 4 (Tier swap, NaN warning, OPD filter, Infinite loop)  
**Code Quality:** ✅ Clean, working, tested
