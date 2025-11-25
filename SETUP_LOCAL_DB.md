# 🗄️ Setup Local Database - Quick Start Guide

**Last Updated**: November 13, 2025

---

## 📋 Prerequisites Check

Kamu perlu salah satu dari:
- ✅ **Docker Desktop** (Recommended - paling mudah)
- ✅ **PostgreSQL Native** (Install manual)

---

## 🐳 Option 1: Docker (Recommended)

### Step 1: Install Docker Desktop
1. Download dari: https://www.docker.com/products/docker-desktop/
2. Install dan restart komputer
3. Buka Docker Desktop
4. Verify installation:
```bash
docker --version
```

### Step 2: Start PostgreSQL Container
```bash
# Di folder project
docker-compose up -d
```

Output yang diharapkan:
```
Creating network "retribusi-report_default" with the default driver
Creating volume "retribusi-report_postgres_data" with local driver
Creating retribusi-postgres ... done
```

### Step 3: Verify Container Running
```bash
docker ps
```

Harus muncul container `retribusi-postgres` dengan status `Up`.

### Step 4: Update .env
```bash
# Backup .env lama
copy .env .env.backup

# Copy .env.local ke .env
copy .env.local .env
```

Atau manual edit `.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/retribusi_dev
```

### Step 5: Push Database Schema
```bash
bun run db:push
```

Output yang diharapkan:
```
✓ Pulling schema from database...
✓ Generating migrations...
✓ Applying migrations...
✓ Done!
```

### Step 6: Verify Tables Created
```bash
# Connect to database
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev

# List tables
\dt

# Should show:
# - users
# - opd
# - jenis_retribusi
# - opd_pelayanan
# - laporan_retribusi
# - target_retribusi
# - audit_log

# Exit
\q
```

---

## 💾 Option 2: PostgreSQL Native

### Step 1: Download & Install
1. Download dari: https://www.postgresql.org/download/windows/
2. Pilih PostgreSQL 15 atau 16
3. Install dengan settings:
   - Port: 5432
   - Locale: Default
   - Password: **postgres** (atau catat password kamu)

### Step 2: Verify Installation
```bash
psql --version
```

### Step 3: Create Database
```bash
# Connect as postgres user
psql -U postgres

# Enter password yang kamu set saat install

# Create database
CREATE DATABASE retribusi_dev;

# Verify
\l

# Exit
\q
```

### Step 4: Update .env
```bash
# Backup .env lama
copy .env .env.backup

# Edit .env
# Ganti YOUR_PASSWORD dengan password postgres kamu
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/retribusi_dev
```

### Step 5: Push Database Schema
```bash
bun run db:push
```

### Step 6: Verify Tables
```bash
# Connect to database
psql -U postgres -d retribusi_dev

# List tables
\dt

# Exit
\q
```

---

## 🧪 Testing Database Connection

### Test 1: Check Server Can Connect
```bash
# Kill existing server
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Start server
bun run dev:server
```

Output yang diharapkan:
```
🚀 Server running on http://localhost:5000
📊 Environment: development
🗄️  Database: Connected  ← HARUS MUNCUL INI!
```

### Test 2: Login API
```bash
# Di terminal baru
node test-api.js
```

Output yang diharapkan:
```
🔐 TEST 1: Login
Status: 200
✅ Login berhasil! Token saved.
```

---

## 📦 Seeding Data

### Automatic (via test script)
```bash
node test-api.js
```

Script akan otomatis:
1. Login
2. Seed OPD (15 records)
3. Seed Jenis Retribusi (51 records)
4. Test relationships

### Manual (via API)

#### 1. Login & Get Token
```bash
# Windows PowerShell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"admin","password":"Admin123","rememberMe":false}'
$token = $response.token
```

#### 2. Seed OPD
```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/opd/seed" -Method POST -Headers @{Authorization="Bearer $token"}
```

#### 3. Seed Jenis Retribusi
```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/jenis-retribusi/seed" -Method POST -Headers @{Authorization="Bearer $token"}
```

#### 4. Verify Data
```bash
# Get OPD list
Invoke-RestMethod -Uri "http://localhost:5000/api/opd?page=1&limit=5" -Headers @{Authorization="Bearer $token"}

# Get Jenis Retribusi list
Invoke-RestMethod -Uri "http://localhost:5000/api/jenis-retribusi?page=1&limit=5" -Headers @{Authorization="Bearer $token"}
```

---

## 🔍 Verify Everything Works

### Checklist:
- [ ] Database created
- [ ] Server connects to database
- [ ] Login successful (admin/Admin123)
- [ ] OPD seeded (15 records)
- [ ] Jenis Retribusi seeded (51 records)
- [ ] API endpoints responding

### Quick Verification:
```bash
# 1. Check database
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT COUNT(*) FROM opd;"
# Should return: 15

docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT COUNT(*) FROM jenis_retribusi;"
# Should return: 51

# 2. Check API
# Login and test endpoints with test-api.js
node test-api.js
```

---

## ⚠️ Troubleshooting

### Issue: Port 5432 already in use
```bash
# Check what's using the port
netstat -ano | findstr :5432

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F

# Or stop existing PostgreSQL service
net stop postgresql-x64-15
```

### Issue: Docker container won't start
```bash
# Check logs
docker logs retribusi-postgres

# Remove and recreate
docker-compose down
docker volume rm retribusi-report_postgres_data
docker-compose up -d
```

### Issue: Connection timeout
```bash
# Check if PostgreSQL is running
docker ps  # For Docker
# OR
net start | findstr postgres  # For native install

# Check .env DATABASE_URL is correct
```

### Issue: Authentication failed
- Check password in DATABASE_URL
- For Docker: password is `postgres`
- For native: use password you set during install

### Issue: Tables not created
```bash
# Run db:push again
bun run db:push

# Check drizzle.config.ts schema path is correct
# Should be: './src/lib/db/schema.ts'
```

### Issue: Seed fails
```bash
# Check if tables exist
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "\dt"

# Check if admin user exists
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT * FROM users;"

# If no admin user, create manually:
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "INSERT INTO users (username, email, password, full_name, role, is_active) VALUES ('admin', 'admin@example.com', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWYgmmK6', 'Administrator', 'admin', true);"
```

---

## 🎯 Success Criteria

Jika semua berhasil, kamu akan punya:

✅ PostgreSQL running (Docker atau native)  
✅ Database `retribusi_dev` created  
✅ 8 tables created  
✅ Admin user exists (username: admin, password: Admin123)  
✅ 15 OPD records  
✅ 51 Jenis Retribusi records  
✅ Server connects successfully  
✅ All API endpoints working  

---

## 📊 Database Statistics

After successful setup:

| Table | Records | Source |
|-------|---------|--------|
| users | 1 | Default admin |
| opd | 15 | RBS_M_DINAS.json |
| jenis_retribusi | 51 | Jenis-Retribusi-RETRIBUSI.json |
| opd_pelayanan | 0 | Manual via API |
| laporan_retribusi | 0 | Via frontend |
| target_retribusi | 0 | Via frontend |
| audit_log | 1+ | Auto (login events) |

---

## 🚀 Next Steps

After database setup:
1. ✅ Test all API endpoints
2. ✅ Create some OPD-Pelayanan relationships
3. ✅ Start frontend development
4. ✅ Test full flow: Login → View OPD → View Retribusi → Configure relationships

---

## 🆘 Need Help?

Jika masih ada masalah:
1. Check error messages carefully
2. Verify all prerequisites installed
3. Check firewall/antivirus not blocking
4. Try restarting Docker/PostgreSQL service
5. Check logs: `docker logs retribusi-postgres`

---

**Good luck! 🎉**
