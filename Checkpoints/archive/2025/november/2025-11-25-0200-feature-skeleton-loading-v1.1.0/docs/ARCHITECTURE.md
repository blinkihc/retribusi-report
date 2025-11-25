# Architecture Documentation - Retribusi Report

**Last Updated**: November 13, 2025 02:15 WIB  
**Version**: v1.0

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Browser (Chrome, Firefox, Edge)                       │ │
│  │  - React 18 Application                                │ │
│  │  - React Router v7 (Client-side routing)              │ │
│  │  - Tailwind CSS (Styling)                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND SERVER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Vite Dev Server (Port 3001)                          │ │
│  │  - Hot Module Replacement (HMR)                       │ │
│  │  - API Proxy to Backend                               │ │
│  │  - Static Asset Serving                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ Proxy /api/*
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js (Port 5000)                               │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Middleware Layer                                 │ │ │
│  │  │  - CORS                                           │ │ │
│  │  │  - Body Parser                                    │ │ │
│  │  │  - Auth Middleware (JWT)                          │ │ │
│  │  │  - Error Handler                                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Route Layer                                      │ │ │
│  │  │  - /api/auth (Login, Logout)                     │ │ │
│  │  │  - /api/dashboard (Stats)                        │ │ │
│  │  │  - /api/reports (CRUD)                           │ │ │
│  │  │  - /api/users (CRUD)                             │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                  │ │
│  │  - users                                              │ │
│  │  - opd                                                │ │
│  │  - jenis_retribusi                                    │ │
│  │  - laporan_retribusi                                  │ │
│  │  - audit_log                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Architecture

### Frontend Architecture

```
src/
├── main.tsx                    # Application entry point
│   └── RouterProvider          # React Router setup
│       └── QueryClientProvider # React Query setup
│
├── router.tsx                  # Route definitions
│   ├── Public Routes
│   │   ├── / (HomePage)
│   │   └── /login (LoginPage)
│   └── Protected Routes
│       └── /dashboard/* (DashboardLayout)
│           └── /dashboard (DashboardHomePage)
│
├── pages/                      # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── DashboardHomePage.tsx
│
├── layouts/                    # Layout components
│   └── DashboardLayout.tsx
│       ├── Sidebar
│       ├── Header
│       └── Main Content
│
├── components/                 # Reusable components
│   └── (to be created)
│
├── actions/                    # React Router actions
│   └── auth.ts
│       └── loginAction()
│
├── loaders/                    # React Router loaders
│   └── dashboard.ts
│       └── dashboardHomeLoader()
│
└── lib/                        # Utilities & libraries
    ├── api/
    │   └── client.ts           # Axios instance
    ├── auth/
    │   ├── jwt.ts              # JWT utilities
    │   └── password.ts         # Password hashing
    └── db/
        ├── index.ts            # DB connection
        └── schema.ts           # Drizzle schema
```

### Backend Architecture

```
server/
├── index.ts                    # Express server setup
│   ├── CORS middleware
│   ├── Body parser
│   ├── Request logging
│   └── Route mounting
│
├── middleware/
│   ├── auth.ts                 # JWT authentication
│   │   └── verifyToken()
│   └── errorHandler.ts         # Global error handler
│
└── routes/
    ├── auth.ts                 # Authentication routes
    │   ├── POST /login
    │   └── POST /logout
    ├── dashboard.ts            # Dashboard routes
    │   └── GET /stats
    ├── reports.ts              # Report routes (placeholder)
    │   ├── GET /
    │   ├── POST /
    │   ├── GET /:id
    │   ├── PUT /:id
    │   └── DELETE /:id
    └── users.ts                # User routes (placeholder)
        ├── GET /
        ├── POST /
        ├── GET /:id
        ├── PUT /:id
        └── DELETE /:id
```

---

## 🔄 Data Flow

### Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │ Backend  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Enter credentials                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. POST /api/auth/login                 │
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │                    │ 3. Query user      │
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │                    │ 4. User data       │
     │                    │                    │<───────────────────┤
     │                    │                    │                    │
     │                    │                    │ 5. Verify password │
     │                    │                    │ (bcrypt.compare)   │
     │                    │                    │                    │
     │                    │                    │ 6. Generate JWT    │
     │                    │                    │ (jwt.sign)         │
     │                    │                    │                    │
     │                    │                    │ 7. Log audit       │
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │ 8. Return token    │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │                    │ 9. Store token     │                    │
     │                    │ (localStorage)     │                    │
     │                    │                    │                    │
     │ 10. Redirect to dashboard               │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
```

### Protected Route Access Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  User    │         │ Frontend │         │ Backend  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Access /dashboard                    │                    │
     ├───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. GET /api/dashboard/stats             │
     │                    │    Header: Authorization: Bearer <token>│
     │                    ├───────────────────>│                    │
     │                    │                    │                    │
     │                    │                    │ 3. Verify JWT      │
     │                    │                    │ (jwt.verify)       │
     │                    │                    │                    │
     │                    │                    │ 4. Query stats     │
     │                    │                    ├───────────────────>│
     │                    │                    │                    │
     │                    │                    │ 5. Stats data      │
     │                    │                    │<───────────────────┤
     │                    │                    │                    │
     │                    │ 6. Return data     │                    │
     │                    │<───────────────────┤                    │
     │                    │                    │                    │
     │ 7. Display dashboard                    │                    │
     │<───────────────────┤                    │                    │
     │                    │                    │                    │
```

### Dashboard Stats Query Flow

```
Backend receives GET /api/dashboard/stats
│
├─> Auth Middleware
│   └─> Verify JWT token
│       ├─> Valid: Continue
│       └─> Invalid: Return 401
│
├─> Dashboard Controller
│   │
│   ├─> Query 1: Daily Revenue
│   │   SELECT SUM(nominal) WHERE tanggal_setor = TODAY
│   │
│   ├─> Query 2: Weekly Revenue
│   │   SELECT SUM(nominal) WHERE tanggal_setor >= START_OF_WEEK
│   │
│   ├─> Query 3: Monthly Revenue
│   │   SELECT SUM(nominal) WHERE MONTH(tanggal_setor) = CURRENT_MONTH
│   │
│   ├─> Query 4: Total Revenue
│   │   SELECT SUM(nominal) FROM laporan_retribusi
│   │
│   └─> Query 5: Total Reports
│       SELECT COUNT(*) FROM laporan_retribusi
│
└─> Return JSON Response
    {
      dailyRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      totalRevenue: 0,
      totalReports: 0
    }
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: CORS Protection                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Allowed Origin: http://localhost:3001           │ │
│  │ - Credentials: true                                │ │
│  │ - Methods: GET, POST, PUT, DELETE                  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Layer 2: JWT Authentication                            │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Token in Authorization header                    │ │
│  │ - Verify signature with secret                     │ │
│  │ - Check expiration                                 │ │
│  │ - Extract user payload                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Layer 3: Role-Based Access Control                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Admin: Full access                               │ │
│  │ - Operator: Limited to own OPD                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Layer 4: Data Validation                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Zod schema validation                            │ │
│  │ - Input sanitization                               │ │
│  │ - Type checking                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Layer 5: Audit Logging                                 │
│  ┌────────────────────────────────────────────────────┐ │
│  │ - Log all sensitive actions                        │ │
│  │ - Track IP address & user agent                   │ │
│  │ - Store old/new values                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Password Security

```
Registration/Password Change:
1. User enters password
2. Backend receives plain text
3. bcrypt.hash(password, 12 rounds)
4. Store hashed password in database
5. Never store plain text

Login:
1. User enters password
2. Backend receives plain text
3. Query user from database (get hashed password)
4. bcrypt.compare(plain, hashed)
5. If match: Generate JWT
6. If no match: Return error
```

---

## 📊 Database Architecture

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ password        │
│ fullName        │
│ email           │
│ role            │
│ opdId (FK)      │──┐
│ isActive        │  │
│ lastLogin       │  │
│ createdAt       │  │
│ updatedAt       │  │
│ deletedAt       │  │
└─────────────────┘  │
         │           │
         │ submittedBy
         │           │
         ↓           │
┌─────────────────┐  │
│ laporan_retribusi│ │
├─────────────────┤  │
│ id (PK)         │  │
│ nomorLaporan    │  │
│ opdId (FK)      │←─┼────┐
│ jenisRetribusiId│←─┼──┐ │
│ tanggalSetor    │  │  │ │
│ nominal         │  │  │ │
│ keterangan      │  │  │ │
│ fileBukti       │  │  │ │
│ status          │  │  │ │
│ submittedBy (FK)│──┘  │ │
│ submittedAt     │     │ │
│ verifiedBy (FK) │     │ │
│ verifiedAt      │     │ │
│ rejectionReason │     │ │
│ createdAt       │     │ │
│ updatedAt       │     │ │
│ deletedAt       │     │ │
└─────────────────┘     │ │
                        │ │
         ┌──────────────┘ │
         │                │
         ↓                │
┌─────────────────┐       │
│ jenis_retribusi │       │
├─────────────────┤       │
│ id (PK)         │       │
│ kode            │       │
│ nama            │       │
│ kategori        │       │
│ tarif           │       │
│ satuan          │       │
│ dasar_hukum     │       │
│ keterangan      │       │
│ isActive        │       │
│ createdAt       │       │
│ updatedAt       │       │
│ deletedAt       │       │
└─────────────────┘       │
                          │
         ┌────────────────┘
         │
         ↓
┌─────────────────┐
│      opd        │
├─────────────────┤
│ id (PK)         │
│ kode            │
│ nama            │
│ alamat          │
│ telepon         │
│ email           │
│ picName         │
│ picPhone        │
│ isActive        │
│ createdAt       │
│ updatedAt       │
│ deletedAt       │
└─────────────────┘

┌─────────────────┐
│   audit_log     │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │──> users.id
│ action          │
│ tableName       │
│ recordId        │
│ oldValues       │
│ newValues       │
│ ipAddress       │
│ userAgent       │
│ createdAt       │
└─────────────────┘
```

### Indexes Strategy

```sql
-- Primary Keys (automatic indexes)
users.id
opd.id
jenis_retribusi.id
laporan_retribusi.id
audit_log.id

-- Unique Indexes
users.username
users.email
opd.kode
jenis_retribusi.kode
laporan_retribusi.nomorLaporan

-- Foreign Key Indexes
users.opdId
laporan_retribusi.opdId
laporan_retribusi.jenisRetribusiId
laporan_retribusi.submittedBy
laporan_retribusi.verifiedBy
audit_log.userId

-- Query Optimization Indexes
laporan_retribusi.status          -- For filtering by status
laporan_retribusi.tanggalSetor    -- For date range queries
jenis_retribusi.kategori          -- For category filtering
```

---

## 🚀 Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────┐
│                  Developer Machine                       │
│                                                          │
│  ┌────────────────┐         ┌────────────────┐         │
│  │  Vite Dev      │         │  Express Dev   │         │
│  │  Port 3001     │◄───────►│  Port 5000     │         │
│  │  HMR Enabled   │         │  tsx watch     │         │
│  └────────────────┘         └────────────────┘         │
│         │                           │                   │
│         │                           │                   │
│         └───────────┬───────────────┘                   │
│                     │                                   │
│                     ↓                                   │
│         ┌────────────────────┐                         │
│         │  PostgreSQL        │                         │
│         │  (Remote/Local)    │                         │
│         └────────────────────┘                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Production Environment (Future)

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                  (Nginx/CloudFlare)                      │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ↓                       ↓
┌─────────────────┐     ┌─────────────────┐
│  Web Server 1   │     │  Web Server 2   │
│  (Node.js)      │     │  (Node.js)      │
│  - Frontend     │     │  - Frontend     │
│  - Backend API  │     │  - Backend API  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ↓
         ┌────────────────────┐
         │  PostgreSQL        │
         │  (Primary)         │
         │                    │
         │  ┌──────────────┐ │
         │  │  Replica     │ │
         │  │  (Read-only) │ │
         │  └──────────────┘ │
         └────────────────────┘
                     │
                     ↓
         ┌────────────────────┐
         │  File Storage      │
         │  (S3/MinIO)        │
         └────────────────────┘
```

---

## 🔧 Technology Stack Details

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI library |
| React Router | 7.0.1 | Client-side routing |
| Vite | 6.0.1 | Build tool & dev server |
| Tailwind CSS | 3.4.15 | Utility-first CSS |
| Lucide React | 0.462.0 | Icon library |
| Axios | 1.7.7 | HTTP client |
| React Query | 5.59.20 | Data fetching & caching |
| TypeScript | 5.6.3 | Type safety |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.16.0 | Runtime environment |
| Express | 4.21.1 | Web framework |
| TypeScript | 5.6.3 | Type safety |
| Drizzle ORM | 0.36.4 | Database ORM |
| PostgreSQL | - | Database |
| jsonwebtoken | 9.0.2 | JWT authentication |
| bcrypt | 5.1.1 | Password hashing |
| Zod | 3.23.8 | Schema validation |
| CORS | 2.8.5 | Cross-origin requests |
| dotenv | 16.4.5 | Environment variables |

### Development Tools

| Tool | Purpose |
|------|---------|
| Biome | Linting & formatting |
| tsx | TypeScript execution |
| concurrently | Run multiple commands |
| Git | Version control |

---

## 📈 Scalability Considerations

### Current Limitations
- Single server instance
- No caching layer
- No CDN for static assets
- No database connection pooling optimization

### Future Improvements
1. **Horizontal Scaling**
   - Multiple backend instances
   - Load balancer
   - Session management (Redis)

2. **Caching Strategy**
   - Redis for API responses
   - Browser caching for static assets
   - Database query result caching

3. **Database Optimization**
   - Connection pooling
   - Read replicas
   - Query optimization
   - Partitioning for large tables

4. **CDN Integration**
   - Static asset delivery
   - Image optimization
   - Global distribution

---

**Document Version**: 1.0  
**Last Review**: November 13, 2025  
**Next Review**: When architecture changes occur
