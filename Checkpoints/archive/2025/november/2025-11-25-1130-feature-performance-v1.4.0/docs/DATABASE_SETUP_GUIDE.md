# Local Database Setup Guide

**Date**: November 13, 2025  
**Purpose**: Setup local PostgreSQL untuk development & testing

---

## 🎯 Options

Ada 3 cara untuk setup local database:

1. **Docker** (Recommended) - Paling mudah & cepat
2. **PostgreSQL Native** - Install PostgreSQL di Windows
3. **Use Existing VPS** - Gunakan database yang ada (jika koneksi stabil)

---

## Option 1: Docker PostgreSQL (Recommended) 🐳

### Prerequisites
- Docker Desktop installed
- Docker running

### Step 1: Check Docker
```bash
docker --version
```

### Step 2: Create Docker Compose File
File sudah dibuat: `docker-compose.yml`

### Step 3: Start PostgreSQL Container
```bash
docker-compose up -d
```

### Step 4: Verify Container Running
```bash
docker ps
```

### Step 5: Update .env
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/retribusi_dev
```

### Step 6: Test Connection
```bash
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev
```

---

## Option 2: PostgreSQL Native Installation 💾

### Step 1: Download PostgreSQL
- Download dari: https://www.postgresql.org/download/windows/
- Pilih versi 15 atau 16
- Install dengan default settings

### Step 2: Set Password
- Saat install, set password untuk user `postgres`
- Catat password ini!

### Step 3: Create Database
```bash
# Open psql
psql -U postgres

# Create database
CREATE DATABASE retribusi_dev;

# Exit
\q
```

### Step 4: Update .env
```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/retribusi_dev
```

---

## Option 3: Use VPS Database 🌐

### Requirements
- Stable internet connection
- VPN if needed
- Firewall rules configured

### Current Connection
```env
DATABASE_URL=postgres://postgres:5e143792382e5874f9ea@43.157.223.45:5431/vps-retribusi?sslmode=disable
```

### Test Connection
```bash
# Test with psql
psql "postgres://postgres:5e143792382e5874f9ea@43.157.223.45:5431/vps-retribusi?sslmode=disable"
```

---

## 🚀 After Database Setup

### 1. Run Drizzle Push (Create Tables)
```bash
bun run db:push
```

### 2. Verify Tables Created
```sql
-- Connect to database
psql -U postgres -d retribusi_dev

-- List tables
\dt

-- Check schema
\d users
\d opd
\d jenis_retribusi
\d opd_pelayanan
```

### 3. Seed Initial Data
```bash
# Start server
bun run dev:server

# In another terminal, run seed script
node test-api.js
```

Or manually via API:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123","rememberMe":false}'

# Seed OPD (use token from login)
curl -X POST http://localhost:5000/api/opd/seed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Seed Jenis Retribusi
curl -X POST http://localhost:5000/api/jenis-retribusi/seed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Troubleshooting

### Issue: Port 5432 already in use
```bash
# Check what's using port 5432
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Connection refused
- Check PostgreSQL service running
- Check firewall settings
- Verify DATABASE_URL correct

### Issue: Authentication failed
- Check username/password in DATABASE_URL
- Check pg_hba.conf settings (for native install)

### Issue: Database doesn't exist
```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE retribusi_dev;
```

---

## 📝 Database Schema

After `db:push`, these tables will be created:

1. **users** - User accounts
2. **opd** - Organisasi Perangkat Daerah
3. **jenis_retribusi** - Jenis Retribusi
4. **opd_pelayanan** - OPD-Pelayanan relationships (NEW)
5. **laporan_retribusi** - Laporan
6. **target_retribusi** - Target
7. **audit_log** - Audit trail

---

## 🎯 Verification Checklist

After setup, verify:

- [ ] Database created
- [ ] Connection successful
- [ ] Tables created (8 tables)
- [ ] Admin user exists
- [ ] OPD data seeded (15 records)
- [ ] Jenis Retribusi seeded (51 records)
- [ ] Server can connect to database
- [ ] API endpoints working

---

## 📊 Expected Data

After seeding:

| Table | Records | Source |
|-------|---------|--------|
| users | 1 | Seed script (admin) |
| opd | 15 | RBS_M_DINAS.json |
| jenis_retribusi | 51 | Jenis-Retribusi-RETRIBUSI.json |
| opd_pelayanan | 0 | Manual via API |
| laporan_retribusi | 0 | Manual via frontend |

---

**Choose your preferred option and follow the steps!** 🚀
