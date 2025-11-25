# 🐳 Docker PostgreSQL - Quick Start

**Status**: Ready to use after Docker Desktop installed

---

## 📥 Step 1: Install Docker Desktop

### Download:
https://www.docker.com/products/docker-desktop/

### Install Steps:
1. Download installer (~500MB)
2. Run installer
3. ✅ Check "Use WSL 2 instead of Hyper-V"
4. Complete installation
5. **Restart computer**
6. Start Docker Desktop
7. Wait for Docker icon to turn green in system tray

### Verify:
```bash
docker --version
docker ps
```

---

## 🚀 Step 2: Run Setup Script

Setelah Docker Desktop running:

```bash
# Run automated setup
.\setup-db.ps1
```

Script akan otomatis:
- ✅ Check Docker running
- ✅ Start PostgreSQL container
- ✅ Wait for database ready
- ✅ Update .env file
- ✅ Create all tables
- ✅ Verify setup

**Total time**: ~2-3 minutes

---

## 🧪 Step 3: Test & Seed Data

```bash
# Start server (terminal 1)
bun run dev:server

# Test & seed (terminal 2)
node test-api.js
```

Expected output:
```
✅ Login berhasil!
✅ Seed OPD berhasil! (15 records)
✅ Seed Jenis Retribusi berhasil! (51 records)
🎉 ALL TESTS PASSED!
```

---

## 📊 Database Info

After setup:
- **Host**: localhost
- **Port**: 5432
- **Database**: retribusi_dev
- **Username**: postgres
- **Password**: postgres

---

## 🔧 Useful Commands

### Container Management:
```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Restart database
docker-compose restart

# View logs
docker logs retribusi-postgres

# Follow logs
docker logs -f retribusi-postgres
```

### Database Access:
```bash
# Connect to database
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev

# Run SQL command
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT COUNT(*) FROM opd;"

# List tables
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "\dt"
```

### Data Management:
```bash
# Check OPD count
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT COUNT(*) FROM opd;"

# Check Jenis Retribusi count
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT COUNT(*) FROM jenis_retribusi;"

# View all OPD
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT kode, nama FROM opd;"
```

---

## ⚠️ Troubleshooting

### Issue: Docker not found
**Solution**: Install Docker Desktop first
```
Download: https://www.docker.com/products/docker-desktop/
```

### Issue: Docker not running
**Solution**: Start Docker Desktop application

### Issue: Port 5432 already in use
**Solution**: Stop existing PostgreSQL
```bash
# Check what's using port
netstat -ano | findstr :5432

# Kill process
taskkill /PID <PID> /F
```

### Issue: Container won't start
**Solution**: Clean and restart
```bash
docker-compose down
docker volume rm retribusi-report_postgres_data
docker-compose up -d
```

### Issue: Tables not created
**Solution**: Run db:push manually
```bash
bun run db:push
```

### Issue: Seed fails
**Solution**: Check if admin user exists
```bash
# Check users
docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev -c "SELECT * FROM users;"

# If no admin, the seed script will create it
node test-api.js
```

---

## 🎯 Success Checklist

After setup, verify:
- [ ] Docker Desktop running
- [ ] Container `retribusi-postgres` running
- [ ] Database `retribusi_dev` created
- [ ] 8 tables created
- [ ] Server connects to database
- [ ] Login works (admin/Admin123)
- [ ] OPD seeded (15 records)
- [ ] Jenis Retribusi seeded (51 records)

---

## 🔄 Daily Workflow

### Start Development:
```bash
# 1. Make sure Docker Desktop is running
# 2. Start database (if not auto-started)
docker-compose up -d

# 3. Start server
bun run dev:server

# 4. Start frontend (in another terminal)
bun run dev
```

### Stop Development:
```bash
# Stop server: Ctrl+C

# Stop database (optional - can keep running)
docker-compose down
```

---

## 📈 Database Statistics

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

**Total**: 67+ records ready

---

## 🆘 Need Help?

If stuck:
1. Check Docker Desktop is running (green icon)
2. Check logs: `docker logs retribusi-postgres`
3. Try restart: `docker-compose restart`
4. Check .env file has correct DATABASE_URL
5. Run setup script again: `.\setup-db.ps1`

---

**Ready to go! 🚀**
