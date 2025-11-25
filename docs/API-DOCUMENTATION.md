# API Documentation - Sistem Laporan Retribusi

<!-- 
  File: API-DOCUMENTATION.md
  Created: 2025-11-25
-->

## Base URL
```
Development: http://localhost:5000
Production: https://api.retribusi.example.com
```

## Authentication
Semua endpoint (kecuali login) memerlukan JWT token di header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Authentication

#### POST /api/auth/login
Login user dan dapatkan token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123",
  "rememberMe": false
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "admin",
    "opdId": null,
    "avatar": null
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

#### POST /api/auth/logout
Logout user.

**Request Body:**
```json
{
  "userId": 1
}
```

#### GET /api/auth/me
Get current user info.

**Response (200):**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### 2. Laporan Retribusi

#### GET /api/laporan-retribusi
List laporan dengan pagination dan filter.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Halaman (default: 1) |
| limit | number | Jumlah per halaman (default: 10) |
| search | string | Cari berdasarkan nomor/keterangan |
| status | string | Filter status: draft/submitted/rejected |
| opdId | number | Filter berdasarkan OPD |
| jenisRetribusiId | number | Filter berdasarkan jenis |
| startDate | string | Tanggal mulai (YYYY-MM-DD) |
| endDate | string | Tanggal akhir (YYYY-MM-DD) |
| sortBy | string | Field untuk sorting |
| sortOrder | string | asc/desc |

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/laporan-retribusi/:id
Get detail laporan.

#### POST /api/laporan-retribusi
Create laporan baru.

**Request Body (multipart/form-data):**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| opdId | number | Yes | ID OPD |
| jenisRetribusiId | number | Yes | ID Jenis Retribusi |
| opdPelayananId | number | No | ID Pelayanan OPD |
| jumlah | number | Yes | Jumlah retribusi |
| tanggalSetor | string | Yes | Tanggal setor (YYYY-MM-DD) |
| keterangan | string | No | Keterangan tambahan |
| buktiSetor | file | No | File bukti (JPG/PNG/PDF, max 5MB) |

#### PUT /api/laporan-retribusi/:id
Update laporan (hanya status draft).

#### DELETE /api/laporan-retribusi/:id
Soft delete laporan.

#### POST /api/laporan-retribusi/:id/submit
Submit laporan (draft → submitted).

#### POST /api/laporan-retribusi/:id/reject
Reject laporan (admin only).

**Request Body:**
```json
{
  "reason": "Alasan penolakan"
}
```

---

### 3. OPD (Master Data)

#### GET /api/opd
List semua OPD.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Halaman |
| limit | number | Jumlah per halaman |
| search | string | Cari berdasarkan nama/kode |

#### GET /api/opd/:id
Get detail OPD.

#### POST /api/opd
Create OPD baru (admin only).

**Request Body:**
```json
{
  "kode": "DISDIK",
  "nama": "Dinas Pendidikan",
  "singkatan": "Disdik"
}
```

#### PUT /api/opd/:id
Update OPD (admin only).

#### DELETE /api/opd/:id
Delete OPD (admin only).

---

### 4. Jenis Retribusi (Master Data)

#### GET /api/jenis-retribusi
List jenis retribusi.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| opdId | number | Filter berdasarkan OPD |
| kategori | string | Filter kategori |

#### POST /api/jenis-retribusi
Create jenis retribusi (admin only).

**Request Body:**
```json
{
  "kode": "RET001",
  "nama": "Retribusi Parkir",
  "kategori": "Jasa Umum",
  "opdId": 1
}
```

---

### 5. Pelayanan OPD (Master Data)

#### GET /api/opd-pelayanan
List pelayanan OPD.

#### POST /api/opd-pelayanan
Create pelayanan (admin only).

---

### 6. Dashboard

#### GET /api/dashboard/stats
Get statistik dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLaporan": 150,
    "totalPendapatan": 50000000,
    "laporanBulanIni": 25,
    "rataRata": 333333
  }
}
```

#### GET /api/dashboard/recent-reports
Get laporan terbaru.

#### GET /api/dashboard/revenue-trend
Get tren pendapatan bulanan.

#### GET /api/dashboard/opd-revenue
Get pendapatan per OPD.

---

### 7. Reports (Rekap)

#### GET /api/reports/rekap-opd
Rekap laporan per OPD.

#### GET /api/reports/rekap-kategori
Rekap laporan per kategori.

#### GET /api/reports/rekap-jenis
Rekap laporan per jenis retribusi.

---

### 8. Users (Admin Only)

#### GET /api/users
List semua user.

#### POST /api/users
Create user baru.

**Request Body:**
```json
{
  "username": "operator1",
  "password": "password123",
  "fullName": "Operator Satu",
  "email": "operator1@example.com",
  "role": "operator",
  "opdId": 1
}
```

#### PUT /api/users/:id
Update user.

#### DELETE /api/users/:id
Delete user.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Data tidak valid",
  "errors": ["Field X wajib diisi"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid atau expired"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Anda tidak memiliki akses"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Data tidak ditemukan"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan server"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
