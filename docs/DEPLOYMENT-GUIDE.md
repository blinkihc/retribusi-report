# Deployment Guide - Sistem Laporan Retribusi

<!-- 
  File: DEPLOYMENT-GUIDE.md
  Created: 2025-11-25
-->

## Prerequisites

- **Node.js**: v18+ 
- **Bun**: v1.0+ (atau npm/yarn)
- **PostgreSQL**: v14+
- **Domain & SSL** (untuk production)

---

## 1. Setup Environment

### Clone Repository
```bash
git clone <repository-url>
cd retribusi-report
```

### Install Dependencies
```bash
bun install
# atau
npm install
```

### Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` sesuai environment:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/retribusi_db

# JWT Secret (generate random string)
JWT_SECRET=your-super-secret-key-min-32-chars

# Server
PORT=5000
NODE_ENV=production

# Frontend (untuk CORS)
FRONTEND_URL=https://retribusi.example.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

---

## 2. Database Setup

### Create Database
```sql
CREATE DATABASE retribusi_db;
```

### Run Migrations
```bash
bun run db:push
# atau
npm run db:push
```

### Seed Initial Data (Optional)
```bash
bun run db:seed
```

---

## 3. Build Application

### Build Frontend
```bash
bun run build
# atau
npm run build
```

Output akan ada di folder `dist/`.

### Build Check
```bash
# Pastikan tidak ada error
bun run check
```

---

## 4. Production Deployment

### Option A: Netlify (Frontend) + Railway (Backend) - GRATIS

**Arsitektur**:
- Frontend (React) → Netlify (gratis)
- Backend (Express) → Railway (gratis tier)
- Database (PostgreSQL) → Railway atau Supabase

#### Step 1: Push ke GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Deploy Backend ke Railway
1. Buka [railway.app](https://railway.app)
2. Login dengan GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Pilih repository `retribusi-report`
5. Set **Root Directory**: `server`
6. Add **PostgreSQL** database dari Railway
7. Set environment variables:
   ```
   DATABASE_URL=<dari Railway PostgreSQL>
   JWT_SECRET=<generate random string>
   NODE_ENV=production
   PORT=5000
   ```
8. Deploy akan otomatis jalan
9. Copy URL backend (misal: `https://retribusi-api.up.railway.app`)

#### Step 3: Deploy Frontend ke Netlify
1. Buka [netlify.com](https://netlify.com)
2. Login dengan GitHub
3. **Add new site** → **Import an existing project**
4. Pilih repository `retribusi-report`
5. Build settings (otomatis dari `netlify.toml`):
   - Build command: `bun run build`
   - Publish directory: `dist`
6. Set environment variable:
   ```
   VITE_API_URL=https://retribusi-api.up.railway.app
   ```
7. Click **Deploy site**

#### Step 4: Verify
- Frontend: `https://your-site.netlify.app`
- Backend health: `https://retribusi-api.up.railway.app/health`

---

### Option B: Easypanel (VPS dengan Panel)

Easypanel mendukung deploy Node.js apps dengan mudah.

#### Prerequisites
- Easypanel sudah terinstall di VPS
- PostgreSQL sudah running di Easypanel
- Repository sudah di-push ke GitHub

#### Step 1: Buat Project Baru
1. Login ke Easypanel dashboard
2. Click **+ Create Project**
3. Nama: `retribusi`

#### Step 2: Deploy Backend (API)
1. Di dalam project, click **+ Create Service**
2. Pilih **App**
3. Pilih **GitHub** sebagai source
4. Connect repository `retribusi-report`
5. Konfigurasi:
   - **Name**: `api`
   - **Branch**: `main`
   - **Build Command**: `bun install`
   - **Start Command**: `bun run tsx server/index.ts`
   - **Port**: `5000`

6. **Environment Variables** (click Environment tab):
   ```
   DATABASE_URL=postgresql://user:password@postgres:5432/retribusi_db
   JWT_SECRET=your-super-secret-key-min-32-chars
   NODE_ENV=production
   PORT=5000
   ```
   > **Note**: Untuk DATABASE_URL, gunakan internal hostname PostgreSQL dari Easypanel (biasanya nama service postgres)

7. **Domain** (click Domains tab):
   - Add domain: `api.retribusi.yourdomain.com`
   - Enable HTTPS

8. Click **Deploy**

#### Step 3: Deploy Frontend
1. Di project yang sama, click **+ Create Service**
2. Pilih **App**
3. Pilih **GitHub** → repository `retribusi-report`
4. Konfigurasi:
   - **Name**: `web`
   - **Branch**: `main`
   - **Build Command**: `bun install && bun run build`
   - **Start Command**: (kosongkan, static files)
   - **Publish Directory**: `dist`

5. Atau pilih **Static** service type:
   - **Build Command**: `bun install && bun run build`
   - **Publish Directory**: `dist`

6. **Environment Variables** (untuk build):
   ```
   VITE_API_URL=https://api.retribusi.yourdomain.com
   ```

7. **Domain**:
   - Add domain: `retribusi.yourdomain.com`
   - Enable HTTPS

8. Click **Deploy**

#### Step 4: Setup Database
1. Jika belum ada database, di PostgreSQL service:
   ```sql
   CREATE DATABASE retribusi_db;
   ```

2. Run migrations (via Easypanel terminal atau SSH):
   ```bash
   cd /app
   bun run db:push
   bun run db:seed
   ```

#### Step 5: Verify
- Frontend: `https://retribusi.yourdomain.com`
- Backend: `https://api.retribusi.yourdomain.com/health`

#### Troubleshooting Easypanel

**Build gagal:**
- Check logs di Easypanel dashboard
- Pastikan `bun` tersedia (atau ganti dengan `npm`)

**Database connection error:**
- Gunakan internal hostname PostgreSQL (bukan localhost)
- Format: `postgresql://user:pass@SERVICE_NAME:5432/db`

**CORS error:**
- Pastikan `VITE_API_URL` sesuai dengan domain backend

---

### Option C: VPS Manual (PM2 + Nginx)

#### 1. Setup PM2 (Process Manager)
```bash
npm install -g pm2
```

#### 2. Create PM2 Config
Buat file `ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: 'retribusi-api',
    script: 'server/index.ts',
    interpreter: 'tsx',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
}
```

#### 3. Start Server
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### 4. Setup Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name retribusi.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name retribusi.example.com;

    ssl_certificate /etc/letsencrypt/live/retribusi.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/retribusi.example.com/privkey.pem;

    # Frontend (static files)
    location / {
        root /var/www/retribusi/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/retribusi/server/public/uploads;
    }
}
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d retribusi.example.com
```

---

### Option B: Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install bun
RUN npm install -g bun

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run build

# Expose port
EXPOSE 5000

# Start server
CMD ["bun", "run", "tsx", "server/index.ts"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/retribusi
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=retribusi
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Deploy
```bash
docker-compose up -d
```

---

## 5. Post-Deployment

### Verify Deployment
```bash
# Check health endpoint
curl https://retribusi.example.com/health

# Expected response:
# {"status":"ok","timestamp":"...","environment":"production"}
```

### Create Admin User
```bash
# Via seed script atau manual SQL
bun run db:seed
```

### Setup Backup (Cron)
```bash
# Daily database backup
0 2 * * * pg_dump retribusi_db > /backups/retribusi_$(date +\%Y\%m\%d).sql
```

---

## 6. Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs retribusi-api
```

### Health Check
Setup uptime monitoring (UptimeRobot, Pingdom, etc.) untuk endpoint:
- `https://retribusi.example.com/health`

---

## 7. Troubleshooting

### Server tidak start
```bash
# Check logs
pm2 logs retribusi-api --lines 100

# Check port
lsof -i :5000
```

### Database connection error
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### CORS error
- Pastikan `FRONTEND_URL` di `.env` sesuai
- Check Nginx proxy headers

---

## 8. Rollback

### Rollback Code
```bash
git checkout <previous-commit>
bun install
bun run build
pm2 restart retribusi-api
```

### Rollback Database
```bash
psql retribusi_db < /backups/retribusi_YYYYMMDD.sql
```
