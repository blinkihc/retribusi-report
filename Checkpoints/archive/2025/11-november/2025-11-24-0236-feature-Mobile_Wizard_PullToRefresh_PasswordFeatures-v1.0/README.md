# 📊 Sistem Monitoring dan Pelaporan Retribusi Daerah

> Sistem pelaporan dan monitoring retribusi daerah berbasis web untuk meningkatkan efisiensi, transparansi, dan akuntabilitas pengelolaan retribusi daerah.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-ISC-green.svg)](LICENSE)

## ✨ Features

### 📝 Laporan Retribusi
- ✅ Create, Read, Update, Delete laporan retribusi
- ✅ Multi-status workflow: Draft → Submitted → Approved/Rejected
- ✅ File upload untuk bukti pembayaran
- ✅ Auto-generate nomor laporan
- ✅ Validation & error handling

### 📊 Monitoring & Reporting
- ✅ Dashboard dengan statistik real-time
- ✅ Rekap per kategori retribusi
- ✅ Rekap per OPD (Organisasi Perangkat Daerah)
- ✅ Filter by date range, OPD, jenis retribusi
- ✅ Export to Excel & PDF
- ✅ Advanced table with sorting & pagination

### 👥 User Management
- ✅ Role-based access control (Admin, Operator)
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Permission-based features

### 📥 Export Features
- ✅ Excel export dengan format lengkap (10 kolom)
- ✅ PDF export dengan signature section
- ✅ Format tanggal: dd/mm/yyyy
- ✅ Auto-calculate total pendapatan
- ✅ Filter-aware exports

### 🎨 UI/UX
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Modern UI dengan Tailwind CSS + shadcn/ui
- ✅ Loading states & skeleton screens
- ✅ Toast notifications
- ✅ Empty states & error handling
- ✅ Dark mode ready

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js / Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **File Upload**: Multer
- **Export**: ExcelJS, PDFKit

### Development Tools
- **Linting**: Biome
- **Package Manager**: npm / Bun
- **Version Control**: Git + Checkpoint System

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL 16
- npm or bun

## 🛠️ Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd retribusi-report
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Setup environment variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgres://user:password@host:5432/database
JWT_SECRET=your-secret-key
```

### 4. Setup database

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed` - Seed initial data
- `npm run check` - Run Biome linter and formatter
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

## 👤 Default Login Credentials

After running `npm run db:seed`:

**Admin:**
- Username: `admin`
- Password: `Admin123`

**Operators:**
- Username: `operator.disdik` / `operator.dinkes` / `operator.dispar`
- Password: `Operator123`

## 📁 Project Structure

```
retribusi-report/
├── src/                     # Frontend source code
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components (Button, Input, etc.)
│   │   ├── layout/         # Layout components (DashboardLayout, etc.)
│   │   └── shared/         # Shared components
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LaporanRetribusiListPage.tsx
│   │   ├── LaporanRetribusiFormPage.tsx
│   │   ├── RekapKategoriPage.tsx
│   │   └── RekapOpdPage.tsx
│   ├── lib/                # Utilities and libraries
│   │   ├── api/           # API client functions
│   │   ├── db/            # Database schema (shared types)
│   │   └── utils.ts       # Helper functions
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Client entry point
│   └── index.css          # Global styles
├── server/                 # Backend source code
│   ├── routes/            # Express routes
│   │   ├── auth.ts       # Authentication routes
│   │   ├── laporan-retribusi.ts  # Laporan CRUD + Export
│   │   ├── rekap.ts      # Rekap/summary routes
│   │   └── users.ts      # User management routes
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   └── error.ts      # Error handling
│   ├── utils/             # Server utilities
│   │   ├── excel-generator.ts     # Excel export generator
│   │   ├── laporan-list-excel-generator.ts
│   │   ├── laporan-list-pdf-generator.ts
│   │   └── pdf-generator.ts       # PDF export generator
│   ├── lib/               # Server libraries
│   │   └── db/           # Drizzle ORM setup
│   │       ├── schema.ts # Database schema
│   │       └── index.ts  # DB client
│   └── index.ts          # Server entry point
├── Checkpoints/           # Version control & change tracking
│   ├── CHANGELOG.md      # Checkpoint history & index
│   └── archive/          # Archived checkpoints
├── .windsurf/            # Windsurf IDE configuration
│   └── workflows/        # Custom workflows
├── docs/                 # Project documentation
├── public/               # Static assets
│   └── uploads/         # User uploaded files
├── scripts/              # Utility scripts
│   └── seed.ts          # Database seeding
├── .env                  # Environment variables (gitignored)
├── .env.example          # Environment variables template
├── biome.json            # Biome linter configuration
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🎨 Design System

All design system colors are defined as CSS variables in `app/globals.css`:

- **Primary Colors**: Government Blue (#1e40af)
- **Semantic Colors**: Success (Green), Warning (Amber), Error (Red), Info (Blue)
- **Government Specific**: Indonesian Red, Gold accents
- **Typography**: Inter font family with defined scales
- **Spacing**: Consistent spacing system (0-96px)

Colors can be customized by modifying the CSS variables in `app/globals.css`.

## 📚 Documentation

### Project Documentation
Detailed documentation available in `docs/` folder.

**📖 Documentation Index**: See [`docs/DOCS-INDEX.md`](docs/DOCS-INDEX.md) for complete documentation structure and navigation.

**Key Documents**:
- `PRD-complete.md` - Product Requirements Document
- `SRS-requirements.md` - Software Requirements Specification
- `ux-flow-journey.md` - User Experience Flow & Journey Map
- `UX-IMPLEMENTATION-STATUS.md` - Implementation Status Report ⭐
- `UX-QUICK-STATUS.md` - Quick Status Reference ⭐
- `design-system.md` - Design System & UI Kit
- `test-plan.md` - Test Plan & QA Strategy

### Checkpoint System
Project menggunakan checkpoint system untuk version control dan change tracking:

- **Location**: `Checkpoints/` directory
- **Changelog**: `Checkpoints/CHANGELOG.md` - Complete history of all checkpoints
- **Archive**: `Checkpoints/archive/` - Organized by year/month

**Latest Checkpoint**: Checkpoint 39 - Excel Export & Table Sorting Update

### API Documentation

#### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

#### Laporan Retribusi
```
GET    /api/laporan-retribusi          # List with filters, search, pagination
GET    /api/laporan-retribusi/:id      # Get single laporan
POST   /api/laporan-retribusi          # Create new laporan
PUT    /api/laporan-retribusi/:id      # Update laporan
DELETE /api/laporan-retribusi/:id      # Delete laporan
POST   /api/laporan-retribusi/:id/submit   # Submit for approval
GET    /api/laporan-retribusi/:id/pdf      # Generate PDF
GET    /api/laporan-retribusi/export/excel # Export to Excel
GET    /api/laporan-retribusi/export/pdf   # Export list to PDF
```

#### Rekap/Summary
```
GET /api/rekap/kategori    # Summary by kategori retribusi
GET /api/rekap/opd         # Summary by OPD
GET /api/rekap/kategori/export/excel  # Export kategori to Excel
GET /api/rekap/opd/export/excel       # Export OPD to Excel
```

#### Users (Admin only)
```
GET    /api/users         # List users
GET    /api/users/:id     # Get user
POST   /api/users         # Create user
PUT    /api/users/:id     # Update user
DELETE /api/users/:id     # Delete user
```

#### Query Parameters (List endpoints)
```
?page=1              # Page number (default: 1)
?limit=10            # Items per page (default: 10)
?search=keyword      # Search in multiple fields
?status=draft        # Filter by status (draft|submitted|rejected|all)
?opdId=1             # Filter by OPD
?jenisRetribusiId=1  # Filter by jenis retribusi
?startDate=2025-01-01  # Filter by date range
?endDate=2025-12-31
?sortBy=tanggalSetor   # Sort column
?sortOrder=asc         # Sort direction (asc|desc)
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:ui
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend and backend
npm run build

# Start production server
npm run start
```

### Environment Variables

Required environment variables for production:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/retribusi_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Server
PORT=5000
NODE_ENV=production

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### VPS Deployment (Ubuntu 22.04)

#### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### Deployment Steps

1. **Clone & Install**
```bash
git clone <repository-url>
cd retribusi-report
npm install
```

2. **Setup Database**
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE retribusi_db;
CREATE USER retribusi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE retribusi_db TO retribusi_user;
\q

# Run migrations
npm run db:push
npm run db:seed
```

3. **Configure Environment**
```bash
cp .env.example .env
nano .env  # Edit with production values
```

4. **Build Application**
```bash
npm run build
```

5. **Start with PM2**
```bash
pm2 start dist/server/index.js --name retribusi-report
pm2 save
pm2 startup  # Follow instructions
```

6. **Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/retribusi-report
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/retribusi-report /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **SSL with Let's Encrypt (Optional)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Detailed deployment guide available in `docs/context-plan.md`.

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

#### File Upload Not Working
```bash
# Check upload directory exists and has permissions
mkdir -p public/uploads
chmod 755 public/uploads

# Check MAX_FILE_SIZE in .env
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vinxi
npm run build
```

## 🤝 Contributing

### Development Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make Changes**
- Follow existing code style
- Run linter: `npm run check`
- Write tests for new features

3. **Create Checkpoint** (for major changes)
- Document changes in `Checkpoints/CHANGELOG.md`
- Follow checkpoint naming convention

4. **Commit & Push**
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### Code Style

- **Linter**: Biome (run `npm run check`)
- **Language**: Indonesian for comments and user-facing text
- **Naming**: camelCase for variables, PascalCase for components
- **Imports**: Absolute imports preferred

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/config changes

## 📝 License

ISC

## 👥 Contributors

- Solo Developer + AI Assistant (Windsurf Cascade)

## 📞 Support

For issues and questions:

1. Check documentation in `docs/` folder
2. Review `Checkpoints/CHANGELOG.md` for recent changes
3. Check troubleshooting section above
4. Review API documentation for endpoint usage

## 🗺️ Roadmap

### Completed ✅
- [x] Basic CRUD for Laporan Retribusi
- [x] User authentication & authorization
- [x] Dashboard with statistics
- [x] Excel & PDF export
- [x] Table sorting & filtering
- [x] Responsive design
- [x] Checkpoint system

### In Progress 🚧
- [ ] UI/UX improvements
- [ ] Advanced filtering
- [ ] Bulk operations
- [ ] Performance optimization

### Planned 📋
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API documentation with Swagger
- [ ] Automated testing
- [ ] CI/CD pipeline

---

**Built with ❤️ using React, TypeScript, and PostgreSQL**
