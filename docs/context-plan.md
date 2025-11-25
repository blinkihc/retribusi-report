# Context & Development Plan
## Sistem Monitoring dan Pelaporan Retribusi Daerah

**Version:** 1.0  
**Date:** November 5, 2025  
**Project Type:** Solo Development + AI-Assisted  
**Methodology:** Agile with 2-week sprints

---

## 1. Project Context

### 1.1 Regulatory & Legal Context

#### Peraturan Yang Relevan
- **UU No. 1 Tahun 2022** tentang Hubungan Keuangan Antara Pemerintah Pusat dan Pemerintah Daerah
  - Pasal tentang PAD (Pendapatan Asli Daerah)
  - Kategori retribusi daerah
  
- **UU No. 28 Tahun 2009** tentang Pajak Daerah dan Retribusi Daerah
  - Jenis-jenis retribusi: Jasa Umum, Jasa Usaha, Perizinan Tertentu
  - Tata cara pemungutan dan pelaporan

- **UU No. 14 Tahun 2008** tentang Keterbukaan Informasi Publik
  - Kewajiban transparansi pendapatan daerah
  - Akses publik terhadap informasi keuangan

- **PP No. 12 Tahun 2019** tentang Pengelolaan Keuangan Daerah
  - Standar akuntansi pemerintahan
  - Sistem pelaporan keuangan

### 1.2 Organizational Context

#### Struktur Pemerintahan
```
Pemerintah Kabupaten OKU Selatan
├── Bapenda (Badan Pendapatan Daerah)
│   ├── Kepala Bapenda
│   ├── Bidang Pendaftaran dan Penetapan
│   ├── Bidang Penagihan
│   └── Bidang Data dan Informasi ← Target User (Admin)
│
└── OPD (Organisasi Perangkat Daerah) - 8-10 unit
    ├── Dinas Perhubungan (DISHUB)
    ├── Dinas Kesehatan (DINKES)
    ├── Dinas Pekerjaan Umum (DPUPR)
    ├── Dinas Perindustrian & Perdagangan
    ├── Dinas Pariwisata
    ├── Badan Pengelola Pasar
    └── [6-8 OPD lainnya]
```

#### User Base
- **Total Users:** 18-22 users
  - 16-20 Operators (2 per OPD × 8-10 OPD)
  - 2 Admin Bapenda
  - 1 Executive (Kepala Bapenda)
  - Unlimited Public (view-only, no login)

### 1.3 Current State Analysis

#### Existing Process (Manual)
```
Day 1 Morning:
Operator OPD → Input data retribusi ke Excel

Day 1 Afternoon:
Operator OPD → Email Excel file ke Bapenda

Day 2-3:
Admin Bapenda → Download semua Excel files
                → Manual consolidation ke master spreadsheet
                → Data validation & cleaning
                → Create summary report

End of Month:
Admin Bapenda → Rekapitulasi bulanan (2-3 hari kerja)
                → Create charts di PowerPoint
                → Print report untuk Kepala Bapenda

Pain Points:
❌ Time consuming (2-3 hari untuk monthly report)
❌ Error prone (manual copy-paste)
❌ No real-time visibility
❌ Difficult to track missing reports
❌ Historical data hard to access
❌ No audit trail
❌ Tidak ada dashboard untuk monitoring
```

#### Target State (Digital System)
```
Real-time:
Operator OPD → Login to web system
                → Input laporan (5 minutes)
                → Auto-validation
                → Instant submission ✅

Admin Bapenda → Real-time dashboard
                → Auto-aggregation
                → Alert for missing reports
                → One-click export

Kepala Bapenda → Executive dashboard
                 → High-level metrics
                 → Trend analysis
                 → Print-ready reports

Public → Transparency dashboard
        → Aggregate data only
        → No login required

Benefits:
✅ Time savings: 30 min → 5 min per report
✅ Real-time data visibility
✅ Automated validation & duplicate detection
✅ Complete audit trail
✅ Easy historical data access
✅ Automatic monthly reports
```

---

## 2. Technical Context

### 2.1 Infrastructure Context

#### Deployment Environment
- **Location:** VPS di data center lokal Pemda
- **Network:** Intranet pemerintah (akses dari kantor OPD)
- **Specs:** 2-4 vCPU, 4-8GB RAM, 40-100GB SSD
- **OS:** Ubuntu 22.04 LTS
- **Database:** PostgreSQL 16
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** PM2
- **Backup:** Daily automated backup, 30-day retention

#### Network Topology
```
Internet
    │
    ├─── Public Users (HTTPS)
    │
Government Network (Firewall)
    │
    ├─── OPD Offices (Intranet)
    │    └─── Operator Workstations
    │
    └─── Bapenda Office (Intranet)
         ├─── Admin Workstation
         ├─── Executive Workstation
         └─── VPS Server (10.x.x.x)
              ├─── Nginx :80, :443
              ├─── App :3000
              └─── PostgreSQL :5432
```

### 2.2 Technology Stack Rationale

#### Why TanStack Start?
- **Full-stack TypeScript:** Single language across frontend/backend
- **Type Safety:** End-to-end type safety with TypeScript
- **Modern DX:** Excellent developer experience
- **SSR Support:** Server-side rendering for performance
- **File-based Routing:** Intuitive project structure
- **API Routes:** Built-in backend capabilities
- **Small Learning Curve:** React-based, easy for solo dev

#### Why Drizzle ORM?
- **Type-safe queries:** Auto-completion and type checking
- **Performance:** Lightweight, minimal overhead
- **PostgreSQL native:** First-class Postgres support
- **Migration system:** Database version control
- **Relations:** Easy to define and query relationships

#### Why PostgreSQL?
- **ACID compliance:** Critical for financial data
- **JSON support:** Flexible audit log storage
- **Mature & stable:** Battle-tested in government systems
- **Open source:** No licensing costs
- **Good performance:** Handles expected load easily

#### Why Tailwind CSS + Shadcn/ui?
- **Rapid development:** Pre-built accessible components
- **Consistency:** Design system tokens
- **Customizable:** Easy to adapt to branding
- **Responsive:** Mobile-friendly out of the box
- **No runtime:** Pure CSS, fast loading

### 2.3 Data Volume Projections

#### Year 1 Estimates
```
Users: 20 active users
OPD: 10 units
Retribusi Types: ~30 types total
Reports per OPD per month: ~20-30 reports
Total reports per month: 200-300 reports
Annual reports: ~2,500-3,500 reports

Database Size:
- Tables: ~10,000 rows (year 1)
- Files: ~5-10GB (bukti setor)
- Audit logs: ~50,000 entries
- Total DB: <1GB
```

#### 3-Year Projections
```
Year 1: 3,000 reports
Year 2: 6,000 reports (cumulative)
Year 3: 10,000 reports (cumulative)

Scalability considerations:
- Pagination required for report lists
- Archive strategy for old reports (>2 years)
- Database indexing optimization
- File storage cleanup policy
```

---

## 3. Development Plan

### 3.1 Development Approach

#### Solo Development Strategy
- **Primary Developer:** 1 person (you)
- **AI Assistant:** Windsurf/Cascade for code generation
- **Methodology:** Vibe coding with AI assistance
- **Version Control:** Git + GitHub
- **Testing:** Automated tests + manual UAT
- **Documentation:** Inline code comments + Markdown docs

#### Vibe Coding Workflow
```
1. Requirements Analysis
   ├─ Review PRD section
   ├─ Break down to specific features
   └─ Write natural language spec

2. AI-Assisted Code Generation
   ├─ Use Windsurf prompts
   ├─ Generate boilerplate code
   ├─ Review & refine output
   └─ Test generated code

3. Iterative Refinement
   ├─ Test functionality
   ├─ Fix bugs/issues
   ├─ Optimize performance
   └─ Add error handling

4. Documentation
   ├─ Update code comments
   ├─ Document API endpoints
   └─ Update README/guides

5. Commit & Push
   └─ Git commit with descriptive message
```

### 3.2 Sprint Planning (2-week sprints)

#### Sprint 1: Foundation (Nov 5-18, 2025)
**Goal:** Authentication & User Management

**Tasks:**
- [x] Project setup (TanStack Start init)
- [x] Database schema design (Drizzle)
- [x] Database migrations setup
- [ ] Authentication system (JWT + bcrypt)
  - [ ] Login API endpoint
  - [ ] Logout API endpoint
  - [ ] Auth middleware
  - [ ] Cookie management
- [ ] User Management (Admin only)
  - [ ] Create user API
  - [ ] List users API
  - [ ] Update user API
  - [ ] Change user status API
- [ ] User Management UI
  - [ ] User list page
  - [ ] User create form
  - [ ] User edit form
- [ ] Testing
  - [ ] Unit tests for auth logic
  - [ ] Integration tests for user APIs

**Deliverables:**
- Functional login system
- Admin can create and manage users
- Test coverage >70%

**AI Prompts for Sprint 1:**
```
"Generate JWT authentication middleware with bcrypt password hashing for TanStack Start"
"Create user CRUD API routes with role-based access control"
"Build user management table component with Shadcn/ui and TanStack Query"
```

---

#### Sprint 2: Master Data (Nov 19 - Dec 2, 2025)
**Goal:** OPD & Retribusi Management

**Tasks:**
- [ ] OPD Management APIs
  - [ ] CRUD endpoints for OPD
  - [ ] Validation with Zod
- [ ] Jenis Retribusi Management APIs
  - [ ] CRUD endpoints
  - [ ] OPD assignment logic
  - [ ] Kategori filtering
- [ ] Master Data UI
  - [ ] OPD list & form pages
  - [ ] Retribusi list & form pages
  - [ ] Bulk import modal (Phase 2 consideration)
- [ ] Laporan Input System
  - [ ] Report input API
  - [ ] File upload endpoint
  - [ ] Duplicate detection logic
  - [ ] Validation rules implementation
- [ ] Report Input UI
  - [ ] Input form with file upload
  - [ ] Currency input formatting
  - [ ] Date picker with backdate validation
  - [ ] Success/error feedback
- [ ] Testing
  - [ ] Unit tests for business logic
  - [ ] Integration tests for APIs
  - [ ] E2E test for report submission

**Deliverables:**
- Admin can manage OPD and Retribusi types
- Operator can submit reports with file upload
- Validation working correctly

**AI Prompts for Sprint 2:**
```
"Create OPD and Jenis Retribusi CRUD APIs with Drizzle ORM and validation"
"Build file upload endpoint for PDF/JPG/PNG with size validation (5MB max)"
"Generate report input form with currency formatting, date picker, and file upload"
"Implement duplicate detection logic for retribusi reports"
```

---

#### Sprint 3: Dashboard & Monitoring (Dec 3-16, 2025)
**Goal:** Multi-level Dashboards & Export

**Tasks:**
- [ ] Dashboard APIs
  - [ ] Operator dashboard data endpoint
  - [ ] Admin dashboard data endpoint
  - [ ] Executive dashboard data endpoint
  - [ ] Public dashboard data endpoint
  - [ ] Aggregation queries optimization
- [ ] Dashboard UI Components
  - [ ] Summary card component
  - [ ] Trend chart component (Recharts)
  - [ ] Recent reports table
  - [ ] Alert indicator component
- [ ] Dashboard Pages
  - [ ] Operator dashboard
  - [ ] Admin dashboard (with OPD filtering)
  - [ ] Executive dashboard (high-level)
  - [ ] Public transparency page
- [ ] Report List & Detail
  - [ ] Report list with pagination
  - [ ] Filters (date range, OPD, status)
  - [ ] Report detail view
  - [ ] Edit report page
  - [ ] Admin cancel report modal
- [ ] Export Functionality
  - [ ] Excel export service (ExcelJS)
  - [ ] PDF export service (Puppeteer)
  - [ ] Export API endpoints
  - [ ] Download UI buttons
- [ ] Testing
  - [ ] Dashboard data accuracy tests
  - [ ] Chart rendering tests
  - [ ] Export file generation tests

**Deliverables:**
- All 4 dashboards functional with real-time data
- Excel and PDF export working
- Report list with filters operational

**AI Prompts for Sprint 3:**
```
"Generate PostgreSQL aggregation queries for dashboard summary (today, week, month, year)"
"Create operator dashboard with summary cards and 7-day trend chart using Recharts"
"Build admin dashboard with OPD monitoring, alerts, and multi-chart visualization"
"Implement Excel export with multiple sheets using ExcelJS (summary + detail + charts)"
"Generate PDF report with government letterhead template using Puppeteer"
```

---

#### Sprint 4: Testing & Deployment (Dec 17-30, 2025)
**Goal:** Production Readiness

**Tasks:**
- [ ] Complete Test Coverage
  - [ ] Unit tests for remaining services
  - [ ] Integration tests for all APIs
  - [ ] E2E tests for critical user journeys
  - [ ] Security penetration tests
  - [ ] Performance load tests
- [ ] Bug Fixes & Optimization
  - [ ] Fix all critical/high bugs from testing
  - [ ] Database query optimization
  - [ ] Frontend performance optimization
  - [ ] Mobile responsiveness fixes
- [ ] Audit System
  - [ ] Complete audit logging implementation
  - [ ] Audit trail viewer UI
  - [ ] Audit report export
- [ ] Documentation
  - [ ] User manual (Bahasa Indonesia)
  - [ ] Admin guide
  - [ ] API documentation
  - [ ] Deployment guide
  - [ ] Troubleshooting guide
- [ ] VPS Setup & Deployment
  - [ ] VPS provisioning (Ubuntu 22.04)
  - [ ] Nginx configuration
  - [ ] PostgreSQL setup
  - [ ] PM2 configuration
  - [ ] SSL certificate setup
  - [ ] Firewall configuration
  - [ ] Backup automation setup
- [ ] Data Migration
  - [ ] Prepare initial OPD data
  - [ ] Prepare initial retribusi types
  - [ ] Create user accounts for all operators
  - [ ] Run database seed script
- [ ] User Acceptance Testing (UAT)
  - [ ] UAT session dengan Admin Bapenda (2-3 hari)
  - [ ] UAT session dengan 2-3 OPD sample
  - [ ] Collect feedback
  - [ ] Fix UAT findings
- [ ] Training & Handover
  - [ ] Admin training session (4 hours)
  - [ ] Operator training session per OPD (2 hours)
  - [ ] Create training materials/videos
  - [ ] Handover documentation to Bapenda IT

**Deliverables:**
- Production-ready application deployed on VPS
- All tests passing (>80% coverage)
- Complete documentation
- All users trained
- Go-live approval from Kepala Bapenda

**AI Prompts for Sprint 4:**
```
"Generate comprehensive unit test suite for report service using Vitest"
"Create E2E tests for operator report submission workflow using Playwright"
"Write deployment script for Ubuntu VPS with Nginx, PostgreSQL, PM2, and SSL"
"Generate user training presentation (Bahasa Indonesia) for operator workflow"
```

---

### 3.3 Risk Management Plan

#### Technical Risks

| Risk | Impact | Probability | Mitigation | Contingency |
|------|--------|-------------|------------|-------------|
| **Database performance degradation** | High | Medium | Index optimization, query profiling | Add read replica, upgrade VPS |
| **File storage running out** | Medium | Low | Monitor disk usage, file retention policy | Expand storage, move to S3 |
| **Authentication vulnerabilities** | High | Low | Security audit, penetration test | Patch immediately, force password reset |
| **Deployment failures** | High | Medium | Staging environment testing, rollback plan | Restore from backup, previous version |
| **Third-party library issues** | Medium | Medium | Pin dependency versions, regular updates | Find alternatives, implement workaround |

#### Business Risks

| Risk | Impact | Probability | Mitigation | Contingency |
|------|--------|-------------|------------|-------------|
| **Low user adoption** | High | Medium | Comprehensive training, easy UI | Management endorsement, user support |
| **Requirement changes mid-dev** | Medium | High | Agile methodology, MVP first | Defer to Phase 2, re-prioritize |
| **Data quality issues** | Medium | Medium | Strong validation, admin review | Data cleanup scripts, corrections |
| **Resistance to change** | Medium | Medium | Involve users early, gather feedback | Parallel run with manual system |
| **Timeline delays** | Low | High | Buffer time, clear priorities | Extend timeline, reduce scope |

---

## 4. Constraints & Assumptions

### 4.1 Constraints

**Budget Constraints:**
- Low budget project (Rp 0 - minimal)
- Open source tools preferred
- No paid SaaS services
- Use existing government VPS infrastructure

**Technical Constraints:**
- Single developer (solo project)
- No dedicated DevOps team
- Limited VPS resources (2-4 vCPU, 4-8GB RAM)
- Government network restrictions
- Must work on older browsers (IE11 support not required, but Chrome/Firefox last 2 versions)

**Time Constraints:**
- MVP target: End of December 2025
- Go-live target: January 2026
- Training must fit OPD schedules
- Cannot disrupt current manual reporting (parallel run)

**Organizational Constraints:**
- Requires approval from Kepala Bapenda for go-live
- Must comply with government IT security policies
- Data retention as per government regulations (5+ years)
- Public transparency required by law

### 4.2 Assumptions

**Infrastructure Assumptions:**
1. VPS with minimum specs available (2 vCPU, 4GB RAM, 40GB SSD)
2. Static IP address assigned to VPS
3. Domain/subdomain can be registered (e.g., retribusi.okuselatan.go.id)
4. HTTPS certificate can be obtained (Let's Encrypt)
5. Government firewall allows HTTPS traffic on port 443

**User Assumptions:**
1. All operators have desktop/laptop computers
2. Internet connectivity available at OPD offices (minimum 1 Mbps)
3. Operators familiar with basic computer operations (login, form input, file upload)
4. Admin Bapenda has intermediate IT literacy
5. Bukti setor available in digital format (PDF/JPG/PNG)

**Data Assumptions:**
1. Existing OPD list can be provided by Bapenda
2. Existing jenis retribusi list can be provided
3. No historical data migration required (fresh start)
4. User credentials can be distributed securely
5. Data backup can be stored on separate disk/server

**Operational Assumptions:**
1. Bapenda IT team available for VPS access and support
2. Training can be scheduled within December 2025
3. Parallel run with manual system acceptable for 1 month
4. User feedback collection mechanism in place
5. Change management process exists

---

## 5. Success Criteria

### 5.1 MVP Success Criteria (Go-Live Decision)

**Must Have (Non-Negotiable):**
- [ ] All 4 user types can login successfully (Admin, Operator, Executive, Public)
- [ ] Operator can submit laporan retribusi with file upload
- [ ] Admin can view all reports from all OPD
- [ ] Dashboard shows accurate real-time summary data
- [ ] Excel export produces correct data
- [ ] System uptime >95% during testing period
- [ ] No critical security vulnerabilities found
- [ ] All 10 OPD onboarded and trained
- [ ] UAT sign-off from Kepala Bapenda

**Nice to Have (Can defer to Phase 2):**
- PDF export with custom templates
- Email notifications
- Advanced filtering options
- Mobile app considerations
- Target vs realization tracking

### 5.2 Post-Launch Success Metrics

**Month 1 (January 2026):**
- [ ] 100% OPD login at least once
- [ ] >50 reports submitted
- [ ] System uptime >99%
- [ ] <10 support tickets
- [ ] User satisfaction survey >3.5/5

**Month 3 (March 2026):**
- [ ] >95% on-time reporting compliance
- [ ] >200 reports submitted per month
- [ ] Average report submission time <10 minutes
- [ ] <5 data correction requests per month
- [ ] User satisfaction survey >4.0/5

**Month 6 (June 2026):**
- [ ] Parallel manual system discontinued
- [ ] >95% reporting accuracy
- [ ] Export feature used regularly (>10 times/month)
- [ ] Public dashboard receives >100 views/month
- [ ] Zero critical bugs in production

---

## 6. Communication Plan

### 6.1 Stakeholder Communication

**Weekly Status Updates:**
- **To:** Kepala Bapenda + Admin Bapenda
- **Format:** Email with progress summary
- **Content:** Completed tasks, next week plan, blockers/issues

**Sprint Demo (Biweekly):**
- **To:** Bapenda team
- **Format:** Live demo session (30 min)
- **Content:** Show completed features, gather feedback

**UAT Sessions:**
- **To:** Selected OPD operators + Admin Bapenda
- **Format:** Hands-on testing session (2 hours)
- **Content:** Test scenarios, collect bugs/feedback

### 6.2 Developer Notes & Learnings

**Daily Logging:**
- Maintain development journal in `DEVLOG.md`
- Document decisions, challenges, solutions
- Track time spent per feature
- Note AI prompt effectiveness

**Code Review Process:**
- Self-review before commit
- Use AI for code quality checks
- Run tests before push
- Descriptive commit messages

---

## 7. Next Steps & Action Items

### Immediate Actions (This Week)
- [x] Complete PRD documentation
- [x] Create project structure template
- [x] Setup Git repository
- [ ] Initialize TanStack Start project
- [ ] Setup PostgreSQL database
- [ ] Configure development environment
- [ ] Create initial database schema
- [ ] Implement authentication system

### Short-term (Next 2 Weeks)
- [ ] Complete Sprint 1 tasks
- [ ] User management functionality
- [ ] Initial deployment to staging environment
- [ ] First demo to Bapenda

### Medium-term (Next Month)
- [ ] Complete Sprint 2 & 3 tasks
- [ ] All core features implemented
- [ ] Begin UAT planning
- [ ] Prepare training materials

### Long-term (2+ Months)
- [ ] Production deployment
- [ ] User training completion
- [ ] Go-live approval
- [ ] Phase 2 planning

---

**Document Status:** Living document - will be updated as project progresses

**Last Updated:** November 5, 2025

**Next Review:** November 19, 2025 (End of Sprint 1)