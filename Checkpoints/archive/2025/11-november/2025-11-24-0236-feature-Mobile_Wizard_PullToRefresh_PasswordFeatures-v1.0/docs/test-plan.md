# Test Plan & Quality Assurance Strategy
## Sistem Monitoring dan Pelaporan Retribusi Daerah

**Version:** 1.0  
**Date:** November 5, 2025  
**Scope:** Comprehensive testing strategy for all system components  
**Target:** Government-grade reliability and security

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
                    ┌─────────────────────┐
                    │   MANUAL TESTING    │ ← 5%
                    │                     │
                    │ • Exploratory       │
                    │ • User Acceptance   │
                    │ • Security Audit    │
                    └─────────────────────┘
                   ┌─────────────────────────┐
                   │    E2E TESTING         │ ← 15%
                   │                        │
                   │ • User Workflows       │
                   │ • Cross-browser        │
                   │ • Integration Paths    │
                   └─────────────────────────┘
                ┌──────────────────────────────┐
                │   INTEGRATION TESTING        │ ← 25%
                │                              │
                │ • API Integration            │
                │ • Database Operations        │
                │ • File System Operations     │
                │ • Authentication Flow        │
                └──────────────────────────────┘
        ┌─────────────────────────────────────────────┐
        │           UNIT TESTING                      │ ← 55%
        │                                             │
        │ • Business Logic Functions                  │
        │ • Validation Rules                          │
        │ • Utility Functions                         │
        │ • Component Behavior                        │
        └─────────────────────────────────────────────┘
```

### 1.2 Testing Types & Coverage Goals

| Testing Type | Coverage Goal | Primary Tools | Focus Areas |
|--------------|---------------|---------------|-------------|
| **Unit Tests** | 80% for business logic | Vitest, Testing Library | Functions, components, validators |
| **Integration Tests** | 70% for critical paths | Vitest, Supertest | API endpoints, database operations |
| **E2E Tests** | 100% for user journeys | Playwright | Complete user workflows |
| **Performance Tests** | Key scenarios | Artillery, Lighthouse | Load, stress, performance |
| **Security Tests** | Critical vulnerabilities | OWASP ZAP, Custom | Authentication, authorization, inputs |
| **Manual Tests** | All user interfaces | Human testers | Usability, edge cases, compliance |

### 1.3 Testing Environment Strategy

```
Development Environment:
├── Local Testing (Developer Machine)
│   ├── Unit tests (on every save)
│   ├── Integration tests (on commit)
│   └── Component tests (during development)
│
├── CI/CD Pipeline (GitHub Actions)
│   ├── Automated test suite (on PR)
│   ├── Security scanning
│   ├── Performance benchmarks
│   └── Code quality checks
│
├── Staging Environment (VPS Test Instance)
│   ├── Full system testing
│   ├── User acceptance testing
│   ├── Performance testing
│   └── Security penetration testing
│
└── Production Monitoring
    ├── Health checks
    ├── Error monitoring
    ├── Performance monitoring
    └── User experience tracking
```

---

## 2. Unit Testing Strategy

### 2.1 Business Logic Testing

#### 2.1.1 Validation Functions
```typescript
// Example test structure
describe('Report Validation', () => {
  describe('validateReportInput', () => {
    it('should accept valid report data', () => {
      const validReport = {
        retribusiId: 'valid-uuid',
        tanggalSetor: '2025-11-05',
        nominal: 1000000,
        buktiSetor: 'valid-file.pdf'
      };
      expect(validateReportInput(validReport)).toBe(true);
    });

    it('should reject future tanggal setor', () => {
      const futureReport = {
        retribusiId: 'valid-uuid',
        tanggalSetor: '2025-12-31',
        nominal: 1000000,
        buktiSetor: 'valid-file.pdf'
      };
      expect(() => validateReportInput(futureReport))
        .toThrow('Tanggal setor tidak boleh di masa depan');
    });

    it('should reject negative nominal', () => {
      const negativeReport = {
        retribusiId: 'valid-uuid',
        tanggalSetor: '2025-11-05',
        nominal: -100,
        buktiSetor: 'valid-file.pdf'
      };
      expect(() => validateReportInput(negativeReport))
        .toThrow('Nominal harus lebih dari 0');
    });

    it('should reject backdate beyond 30 days', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      
      const backdateReport = {
        retribusiId: 'valid-uuid',
        tanggalSetor: oldDate.toISOString().split('T')[0],
        nominal: 1000000,
        buktiSetor: 'valid-file.pdf'
      };
      expect(() => validateReportInput(backdateReport))
        .toThrow('Tanggal setor tidak boleh lebih dari 30 hari yang lalu');
    });
  });
});
```

#### 2.1.2 Currency Formatting Tests
```typescript
describe('Currency Utilities', () => {
  describe('formatIDR', () => {
    it('should format numbers to Indonesian Rupiah', () => {
      expect(formatIDR(1000000)).toBe('Rp 1.000.000');
      expect(formatIDR(500000.50)).toBe('Rp 500.000,50');
      expect(formatIDR(0)).toBe('Rp 0');
    });
  });

  describe('parseIDR', () => {
    it('should parse Indonesian Rupiah strings to numbers', () => {
      expect(parseIDR('Rp 1.000.000')).toBe(1000000);
      expect(parseIDR('1.500.000,50')).toBe(1500000.50);
      expect(parseIDR('500000')).toBe(500000);
    });
  });
});
```

#### 2.1.3 Permission Logic Tests
```typescript
describe('Permission System', () => {
  describe('canAccessReport', () => {
    it('should allow operator to access their own reports', () => {
      const operator = { id: 'user-1', role: 'operator', opdId: 'opd-1' };
      const report = { id: 'report-1', userId: 'user-1', retribusiId: 'ret-1' };
      
      expect(canAccessReport(operator, report)).toBe(true);
    });

    it('should deny operator access to other user reports', () => {
      const operator = { id: 'user-1', role: 'operator', opdId: 'opd-1' };
      const report = { id: 'report-1', userId: 'user-2', retribusiId: 'ret-1' };
      
      expect(canAccessReport(operator, report)).toBe(false);
    });

    it('should allow admin to access all reports', () => {
      const admin = { id: 'admin-1', role: 'admin' };
      const report = { id: 'report-1', userId: 'user-1', retribusiId: 'ret-1' };
      
      expect(canAccessReport(admin, report)).toBe(true);
    });
  });
});
```

### 2.2 Component Testing

#### 2.2.1 Form Component Tests
```typescript
describe('ReportInputForm', () => {
  it('should render all required fields', () => {
    render(<ReportInputForm />);
    
    expect(screen.getByLabelText(/jenis retribusi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tanggal setor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nominal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bukti setor/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    render(<ReportInputForm />);
    
    const submitButton = screen.getByRole('button', { name: /simpan/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/jenis retribusi wajib dipilih/i)).toBeInTheDocument();
      expect(screen.getByText(/tanggal setor wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/nominal wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('should format currency input correctly', async () => {
    render(<ReportInputForm />);
    
    const nominalInput = screen.getByLabelText(/nominal/i);
    fireEvent.change(nominalInput, { target: { value: '1000000' } });
    
    await waitFor(() => {
      expect(nominalInput).toHaveValue('Rp 1.000.000');
    });
  });
});
```

#### 2.2.2 Dashboard Component Tests
```typescript
describe('OperatorDashboard', () => {
  const mockDashboardData = {
    summary: {
      today: { total: 1000000, count: 5 },
      week: { total: 5000000, count: 25 },
      month: { total: 15000000, count: 75 }
    },
    recentReports: [
      { id: '1', tanggalSetor: '2025-11-05', nominal: 500000 },
      { id: '2', tanggalSetor: '2025-11-04', nominal: 750000 }
    ],
    chartData: [
      { date: '2025-11-01', amount: 1000000 },
      { date: '2025-11-02', amount: 1500000 }
    ]
  };

  it('should display summary cards with correct data', () => {
    render(<OperatorDashboard data={mockDashboardData} />);
    
    expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
    expect(screen.getByText('5 Laporan')).toBeInTheDocument();
    expect(screen.getByText('Rp 5.000.000')).toBeInTheDocument();
  });

  it('should render recent reports table', () => {
    render(<OperatorDashboard data={mockDashboardData} />);
    
    expect(screen.getByText('05/11/2025')).toBeInTheDocument();
    expect(screen.getByText('Rp 500.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 750.000')).toBeInTheDocument();
  });

  it('should show loading state when data is loading', () => {
    render(<OperatorDashboard data={null} isLoading={true} />);
    
    expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(3);
  });
});
```

---

## 3. Integration Testing Strategy

### 3.1 API Endpoint Testing

#### 3.1.1 Authentication API Tests
```typescript
describe('Authentication API', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'operator1',
          password: 'ValidPassword123!'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        user: {
          username: 'operator1',
          role: 'operator'
        }
      });
      expect(response.headers['set-cookie']).toMatch(/auth-token=/);
    });

    it('should reject invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'operator1',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should rate limit after multiple failed attempts', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            username: 'operator1',
            password: 'wrongpassword'
          });
      }

      // 6th attempt should be rate limited
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'operator1',
          password: 'wrongpassword'
        })
        .expect(429);
    });
  });
});
```

#### 3.1.2 Report API Tests
```typescript
describe('Report API', () => {
  let authToken: string;
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser({
      username: 'testoperator',
      role: 'operator',
      opdId: 'test-opd-1'
    });
    authToken = await getAuthToken(testUser);
  });

  describe('POST /api/laporan', () => {
    it('should create report with valid data', async () => {
      const reportData = {
        retribusiId: 'test-retribusi-1',
        tanggalSetor: '2025-11-05',
        nominal: 1000000,
        keterangan: 'Test report'
      };

      const response = await request(app)
        .post('/api/laporan')
        .set('Cookie', `auth-token=${authToken}`)
        .field('retribusiId', reportData.retribusiId)
        .field('tanggalSetor', reportData.tanggalSetor)
        .field('nominal', reportData.nominal.toString())
        .field('keterangan', reportData.keterangan)
        .attach('buktiSetor', Buffer.from('fake pdf content'), 'receipt.pdf')
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          retribusiId: reportData.retribusiId,
          nominal: reportData.nominal,
          status: 'active'
        }
      });
    });

    it('should reject duplicate reports', async () => {
      // Create first report
      await createTestReport({
        retribusiId: 'test-retribusi-1',
        tanggalSetor: '2025-11-05',
        userId: testUser.id
      });

      // Try to create duplicate
      await request(app)
        .post('/api/laporan')
        .set('Cookie', `auth-token=${authToken}`)
        .field('retribusiId', 'test-retribusi-1')
        .field('tanggalSetor', '2025-11-05')
        .field('nominal', '500000')
        .attach('buktiSetor', Buffer.from('fake pdf'), 'receipt.pdf')
        .expect(400);
    });

    it('should reject unauthorized retribusi access', async () => {
      await request(app)
        .post('/api/laporan')
        .set('Cookie', `auth-token=${authToken}`)
        .field('retribusiId', 'unauthorized-retribusi')
        .field('tanggalSetor', '2025-11-05')
        .field('nominal', '500000')
        .attach('buktiSetor', Buffer.from('fake pdf'), 'receipt.pdf')
        .expect(403);
    });
  });

  describe('GET /api/laporan', () => {
    beforeEach(async () => {
      // Create test reports
      await createTestReports([
        {
          retribusiId: 'test-retribusi-1',
          tanggalSetor: '2025-11-05',
          nominal: 1000000,
          userId: testUser.id
        },
        {
          retribusiId: 'test-retribusi-2',
          tanggalSetor: '2025-11-04',
          nominal: 500000,
          userId: testUser.id
        }
      ]);
    });

    it('should return user reports with filters', async () => {
      const response = await request(app)
        .get('/api/laporan')
        .query({
          startDate: '2025-11-01',
          endDate: '2025-11-30'
        })
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        retribusiId: 'test-retribusi-1',
        nominal: 1000000
      });
    });

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get('/api/laporan')
        .query({
          page: 1,
          limit: 1
        })
        .set('Cookie', `auth-token=${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2
      });
    });
  });
});
```

### 3.2 Database Integration Tests

#### 3.2.1 Database Transaction Tests
```typescript
describe('Database Transactions', () => {
  describe('Report Creation with File Upload', () => {
    it('should rollback on file upload failure', async () => {
      const reportData = {
        retribusiId: 'test-retribusi-1',
        tanggalSetor: '2025-11-05',
        nominal: 1000000,
        userId: 'test-user-1'
      };

      // Mock file upload to fail
      jest.spyOn(fileService, 'uploadFile').mockRejectedValue(new Error('Upload failed'));

      await expect(reportService.createReport(reportData, mockFile))
        .rejects.toThrow('Upload failed');

      // Verify no report was created in database
      const reports = await db.select().from(laporanRetribusi);
      expect(reports).toHaveLength(0);
    });

    it('should commit transaction on successful creation', async () => {
      const reportData = {
        retribusiId: 'test-retribusi-1',
        tanggalSetor: '2025-11-05',
        nominal: 1000000,
        userId: 'test-user-1'
      };

      const result = await reportService.createReport(reportData, mockFile);

      expect(result).toMatchObject({
        retribusiId: reportData.retribusiId,
        nominal: reportData.nominal,
        status: 'active'
      });

      // Verify report exists in database
      const dbReport = await db.select()
        .from(laporanRetribusi)
        .where(eq(laporanRetribusi.id, result.id));
      
      expect(dbReport).toHaveLength(1);
    });
  });
});
```

### 3.3 File System Integration Tests

#### 3.3.1 File Upload Tests
```typescript
describe('File Upload Service', () => {
  const testUploadDir = path.join(__dirname, 'test-uploads');

  beforeEach(async () => {
    await fs.ensureDir(testUploadDir);
  });

  afterEach(async () => {
    await fs.remove(testUploadDir);
  });

  it('should upload file to correct location', async () => {
    const mockFile = {
      buffer: Buffer.from('test file content'),
      originalname: 'test-receipt.pdf',
      mimetype: 'application/pdf'
    };

    const result = await fileService.uploadBuktiSetor(mockFile, 'report-123');

    expect(result).toMatch(/uploads\/bukti_setor\/\d{4}\/\d{2}\/report-123_\d+\.pdf/);
    
    const filePath = path.join(testUploadDir, result);
    const fileExists = await fs.pathExists(filePath);
    expect(fileExists).toBe(true);
  });

  it('should reject invalid file types', async () => {
    const mockFile = {
      buffer: Buffer.from('test content'),
      originalname: 'test.exe',
      mimetype: 'application/octet-stream'
    };

    await expect(fileService.uploadBuktiSetor(mockFile, 'report-123'))
      .rejects.toThrow('File type not allowed');
  });

  it('should reject oversized files', async () => {
    const mockFile = {
      buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
      originalname: 'large-file.pdf',
      mimetype: 'application/pdf'
    };

    await expect(fileService.uploadBuktiSetor(mockFile, 'report-123'))
      .rejects.toThrow('File size exceeds limit');
  });
});
```

---

## 4. End-to-End Testing Strategy

### 4.1 Critical User Journey Tests

#### 4.1.1 Operator Report Submission Flow
```typescript
// Playwright E2E Test
describe('Operator Report Submission', () => {
  test('complete report submission workflow', async ({ page }) => {
    // Login as operator
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'operator1');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to input form
    await page.waitForURL('/dashboard');
    await page.click('[data-testid="input-laporan-button"]');

    // Fill report form
    await page.selectOption('[data-testid="jenis-retribusi"]', 'retribusi-parkir');
    await page.fill('[data-testid="tanggal-setor"]', '05/11/2025');
    await page.fill('[data-testid="nominal"]', '1000000');
    await page.setInputFiles('[data-testid="bukti-setor"]', 'tests/fixtures/sample-receipt.pdf');
    await page.fill('[data-testid="keterangan"]', 'Pembayaran parkir November');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Laporan berhasil disimpan');

    // Check report appears in list
    await page.click('[data-testid="lihat-semua-button"]');
    await expect(page.locator('[data-testid="report-table"]'))
      .toContainText('Rp 1.000.000');
  });

  test('form validation prevents invalid submission', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('/laporan/input');

    // Try to submit empty form
    await page.click('[data-testid="submit-button"]');

    // Check validation errors
    await expect(page.locator('[data-testid="error-jenis-retribusi"]'))
      .toContainText('Jenis retribusi wajib dipilih');
    await expect(page.locator('[data-testid="error-tanggal-setor"]'))
      .toContainText('Tanggal setor wajib diisi');
    await expect(page.locator('[data-testid="error-nominal"]'))
      .toContainText('Nominal wajib diisi');

    // Form should not submit
    await expect(page).toHaveURL('/laporan/input');
  });

  test('file upload with progress indicator', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('/laporan/input');

    // Fill required fields
    await page.selectOption('[data-testid="jenis-retribusi"]', 'retribusi-parkir');
    await page.fill('[data-testid="tanggal-setor"]', '05/11/2025');
    await page.fill('[data-testid="nominal"]', '500000');

    // Upload file and check progress
    const fileInput = page.locator('[data-testid="bukti-setor"]');
    await fileInput.setInputFiles('tests/fixtures/sample-receipt.pdf');

    // Wait for upload progress
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();

    // Submit form
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

#### 4.1.2 Admin Monitoring Flow
```typescript
describe('Admin Monitoring Dashboard', () => {
  test('admin can view and manage all reports', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Check dashboard overview
    await expect(page.locator('[data-testid="total-today"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-week"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-indicator"]')).toBeVisible();

    // Navigate to all reports
    await page.click('[data-testid="view-all-reports"]');
    
    // Apply filters
    await page.selectOption('[data-testid="filter-opd"]', 'dishub');
    await page.fill('[data-testid="filter-start-date"]', '01/11/2025');
    await page.fill('[data-testid="filter-end-date"]', '30/11/2025');
    await page.click('[data-testid="apply-filters"]');

    // Verify filtered results
    await expect(page.locator('[data-testid="reports-table"] tbody tr'))
      .toHaveCountGreaterThan(0);
    
    // Test report cancellation
    await page.click('[data-testid="cancel-report-1"]');
    await page.fill('[data-testid="cancellation-reason"]', 'Data duplikat');
    await page.click('[data-testid="confirm-cancel"]');
    
    await expect(page.locator('[data-testid="cancel-success"]'))
      .toContainText('Laporan berhasil dibatalkan');
  });

  test('export functionality works correctly', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reports');

    // Set up download handling
    const downloadPromise = page.waitForEvent('download');
    
    // Trigger Excel export
    await page.click('[data-testid="export-excel"]');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/Laporan_Retribusi_.*\.xlsx$/);

    // Verify download started
    await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
  });
});
```

### 4.2 Cross-Browser Testing

#### 4.2.1 Browser Compatibility Matrix
```typescript
const browsers = ['chromium', 'firefox', 'webkit'];

browsers.forEach(browserName => {
  describe(`Cross-browser testing - ${browserName}`, () => {
    test('login and basic navigation', async ({ page }) => {
      await page.goto('/login');
      
      // Test basic functionality across browsers
      await page.fill('[data-testid="username"]', 'operator1');
      await page.fill('[data-testid="password"]', 'password123');
      await page.click('[data-testid="login-button"]');
      
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="user-profile"]'))
        .toContainText('operator1');
    });

    test('responsive design at different viewports', async ({ page }) => {
      // Mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
      await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeHidden();
      
      // Tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      // Desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.reload();
      
      await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeHidden();
    });
  });
});
```

---

## 5. Performance Testing Strategy

### 5.1 Load Testing

#### 5.1.1 API Load Testing (Artillery.js)
```yaml
# artillery-load-test.yml
config:
  target: 'https://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users per second
      name: "Warm up"
    - duration: 120
      arrivalRate: 50  # 50 users per second
      name: "Peak load"
    - duration: 60
      arrivalRate: 100 # 100 users per second
      name: "Stress test"

scenarios:
  - name: "Login and Dashboard Access"
    weight: 40
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "operator{{ $randomInt(1, 20) }}"
            password: "password123"
          capture:
            - header: "set-cookie"
              as: "authCookie"
      - get:
          url: "/api/dashboard/operator"
          headers:
            Cookie: "{{ authCookie }}"

  - name: "Report Submission"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "operator{{ $randomInt(1, 20) }}"
            password: "password123"
          capture:
            - header: "set-cookie"
              as: "authCookie"
      - post:
          url: "/api/laporan"
          headers:
            Cookie: "{{ authCookie }}"
          json:
            retribusiId: "{{ $randomString() }}"
            tanggalSetor: "2025-11-05"
            nominal: "{{ $randomInt(100000, 5000000) }}"
            keterangan: "Load test report"

  - name: "Report Listing"
    weight: 30
    flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "admin1"
            password: "adminpassword123"
          capture:
            - header: "set-cookie"
              as: "authCookie"
      - get:
          url: "/api/laporan?page=1&limit=50"
          headers:
            Cookie: "{{ authCookie }}"
```

#### 5.1.2 Database Performance Testing
```typescript
describe('Database Performance Tests', () => {
  test('report query performance with large dataset', async () => {
    // Create 10,000 test reports
    const reports = Array.from({ length: 10000 }, (_, i) => ({
      retribusiId: `retribusi-${i % 10}`,
      userId: `user-${i % 20}`,
      tanggalSetor: new Date(2025, 0, (i % 30) + 1).toISOString().split('T')[0],
      nominal: Math.floor(Math.random() * 5000000) + 100000,
      status: 'active'
    }));

    await db.insert(laporanRetribusi).values(reports);

    // Test query performance
    const startTime = Date.now();
    
    const results = await db.select()
      .from(laporanRetribusi)
      .where(
        and(
          gte(laporanRetribusi.tanggalSetor, '2025-01-01'),
          lte(laporanRetribusi.tanggalSetor, '2025-01-31'),
          eq(laporanRetribusi.status, 'active')
        )
      )
      .orderBy(desc(laporanRetribusi.tanggalSetor))
      .limit(50);

    const queryTime = Date.now() - startTime;

    expect(queryTime).toBeLessThan(100); // Should complete within 100ms
    expect(results).toHaveLength(50);
  });

  test('dashboard aggregation performance', async () => {
    const startTime = Date.now();

    const summary = await db
      .select({
        totalToday: sql<number>`sum(case when date(tanggal_setor) = current_date then nominal else 0 end)`,
        totalWeek: sql<number>`sum(case when tanggal_setor >= date_trunc('week', current_date) then nominal else 0 end)`,
        totalMonth: sql<number>`sum(case when date_trunc('month', tanggal_setor) = date_trunc('month', current_date) then nominal else 0 end)`,
        countToday: sql<number>`count(case when date(tanggal_setor) = current_date then 1 end)`
      })
      .from(laporanRetribusi)
      .where(eq(laporanRetribusi.status, 'active'));

    const queryTime = Date.now() - startTime;

    expect(queryTime).toBeLessThan(200); // Aggregation should be fast
    expect(summary[0]).toBeDefined();
  });
});
```

### 5.2 Frontend Performance Testing

#### 5.2.1 Lighthouse Performance Audit
```typescript
// lighthouse-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

describe('Performance Audits', () => {
  let chrome;
  let url = 'http://localhost:3000';

  beforeAll(async () => {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox']
    });
  });

  afterAll(async () => {
    await chrome.kill();
  });

  test('homepage performance meets standards', async () => {
    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port
    };

    const runnerResult = await lighthouse(url, options);
    const performanceScore = runnerResult.lhr.categories.performance.score * 100;

    expect(performanceScore).toBeGreaterThanOrEqual(85); // Minimum 85/100
  });

  test('dashboard performance under load', async () => {
    // Login first
    const loginUrl = `${url}/login`;
    // ... perform login via Lighthouse

    const dashboardUrl = `${url}/dashboard`;
    const result = await lighthouse(dashboardUrl, {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port
    });

    const metrics = result.lhr.audits;
    
    expect(metrics['first-contentful-paint'].numericValue).toBeLessThan(2000); // < 2s
    expect(metrics['largest-contentful-paint'].numericValue).toBeLessThan(3000); // < 3s
    expect(metrics['cumulative-layout-shift'].numericValue).toBeLessThan(0.1); // < 0.1
  });
});
```

---

## 6. Security Testing Strategy

### 6.1 Authentication & Authorization Tests

#### 6.1.1 Security Penetration Tests
```typescript
describe('Security Tests', () => {
  describe('Authentication Security', () => {
    test('prevents brute force attacks', async () => {
      // Attempt multiple failed logins
      const attempts = Array.from({ length: 10 }, () =>
        request(app)
          .post('/api/auth/login')
          .send({ username: 'operator1', password: 'wrongpassword' })
      );

      const results = await Promise.all(attempts);
      
      // First 5 should return 401, rest should be rate limited (429)
      expect(results.slice(0, 5).every(r => r.status === 401)).toBe(true);
      expect(results.slice(5).every(r => r.status === 429)).toBe(true);
    });

    test('JWT tokens expire correctly', async () => {
      // Create short-lived token for testing
      const shortToken = jwt.sign(
        { userId: 'test-user', role: 'operator' },
        process.env.JWT_SECRET!,
        { expiresIn: '1s' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Request with expired token should fail
      await request(app)
        .get('/api/laporan')
        .set('Cookie', `auth-token=${shortToken}`)
        .expect(401);
    });

    test('prevents session fixation attacks', async () => {
      // Login and get session
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'operator1', password: 'password123' });

      const firstSessionId = extractSessionId(loginResponse.headers['set-cookie']);

      // Login again with same credentials
      const secondLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({ username: 'operator1', password: 'password123' });

      const secondSessionId = extractSessionId(secondLoginResponse.headers['set-cookie']);

      // Session ID should be different (regenerated)
      expect(firstSessionId).not.toBe(secondSessionId);
    });
  });

  describe('Authorization Security', () => {
    test('prevents horizontal privilege escalation', async () => {
      const user1Token = await getAuthToken('operator1');
      const user2Token = await getAuthToken('operator2');

      // User 1 creates a report
      const reportResponse = await request(app)
        .post('/api/laporan')
        .set('Cookie', `auth-token=${user1Token}`)
        .send(validReportData);

      const reportId = reportResponse.body.data.id;

      // User 2 tries to access User 1's report
      await request(app)
        .get(`/api/laporan/${reportId}`)
        .set('Cookie', `auth-token=${user2Token}`)
        .expect(403);
    });

    test('prevents vertical privilege escalation', async () => {
      const operatorToken = await getAuthToken('operator1');

      // Operator tries to access admin endpoint
      await request(app)
        .get('/api/admin/users')
        .set('Cookie', `auth-token=${operatorToken}`)
        .expect(403);

      // Operator tries to cancel someone else's report
      await request(app)
        .post('/api/laporan/some-report-id/cancel')
        .set('Cookie', `auth-token=${operatorToken}`)
        .send({ reason: 'Unauthorized attempt' })
        .expect(403);
    });
  });
});
```

### 6.2 Input Validation & XSS Prevention

#### 6.2.1 Input Security Tests
```typescript
describe('Input Security Tests', () => {
  test('prevents XSS attacks', async () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '<svg onload="alert(\'xss\')">',
      '"><script>alert("xss")</script>'
    ];

    for (const payload of xssPayloads) {
      const response = await request(app)
        .post('/api/laporan')
        .set('Cookie', `auth-token=${validToken}`)
        .send({
          ...validReportData,
          keterangan: payload
        });

      // XSS payload should be sanitized in response
      expect(response.body.data.keterangan).not.toContain('<script');
      expect(response.body.data.keterangan).not.toContain('javascript:');
      expect(response.body.data.keterangan).not.toContain('onerror');
    }
  });

  test('prevents SQL injection', async () => {
    const sqlPayloads = [
      "'; DROP TABLE laporan_retribusi; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; INSERT INTO users (username) VALUES ('hacked'); --"
    ];

    for (const payload of sqlPayloads) {
      await request(app)
        .get('/api/laporan')
        .query({ search: payload })
        .set('Cookie', `auth-token=${validToken}`)
        .expect(200); // Should not crash or expose data

      // Verify database integrity
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      expect(userCount[0].count).toBeLessThan(100); // Should not have injected records
    }
  });

  test('validates file upload security', async () => {
    const maliciousFiles = [
      { name: 'malware.exe', content: 'MZ...', mimetype: 'application/octet-stream' },
      { name: 'script.php', content: '<?php echo "hacked"; ?>', mimetype: 'text/php' },
      { name: 'large.pdf', content: 'x'.repeat(10 * 1024 * 1024), mimetype: 'application/pdf' } // 10MB
    ];

    for (const file of maliciousFiles) {
      await request(app)
        .post('/api/laporan')
        .set('Cookie', `auth-token=${validToken}`)
        .field('retribusiId', 'valid-id')
        .field('tanggalSetor', '2025-11-05')
        .field('nominal', '1000000')
        .attach('buktiSetor', Buffer.from(file.content), file.name)
        .expect(400); // Should reject malicious files
    }
  });
});
```

### 6.3 Data Protection Tests

#### 6.3.1 Data Leakage Prevention
```typescript
describe('Data Protection Tests', () => {
  test('prevents sensitive data exposure in API responses', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Cookie', `auth-token=${validToken}`)
      .expect(200);

    // Password hash should not be exposed
    expect(response.body.data).not.toHaveProperty('passwordHash');
    expect(response.body.data).not.toHaveProperty('password');
    
    // Only safe fields should be included
    expect(response.body.data).toMatchObject({
      id: expect.any(String),
      username: expect.any(String),
      email: expect.any(String),
      role: expect.any(String)
    });
  });

  test('prevents data leakage through error messages', async () => {
    // Try to access non-existent user
    const response = await request(app)
      .get('/api/users/non-existent-id')
      .set('Cookie', `auth-token=${adminToken}`)
      .expect(404);

    // Error message should not reveal database structure
    expect(response.body.error).not.toContain('table');
    expect(response.body.error).not.toContain('column');
    expect(response.body.error).not.toContain('SELECT');
    expect(response.body.error).toBe('User not found');
  });

  test('audit logs capture security events', async () => {
    // Trigger security event (failed login)
    await request(app)
      .post('/api/auth/login')
      .send({ username: 'operator1', password: 'wrongpassword' });

    // Check audit log
    const auditLogs = await db.select()
      .from(auditLog)
      .where(eq(auditLog.action, 'LOGIN_FAILED'));

    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0]).toMatchObject({
      action: 'LOGIN_FAILED',
      tableName: 'authentication',
      ipAddress: expect.any(String)
    });
  });
});
```

---

## 7. Manual Testing Strategy

### 7.1 User Acceptance Testing (UAT)

#### 7.1.1 UAT Test Cases
```
Test Case: TC-001 - Operator Daily Workflow
Objective: Verify operator can complete daily reporting tasks efficiently
Preconditions: 
- Operator user account exists and is active
- OPD has assigned retribution types
- Test data available

Steps:
1. Login to system with operator credentials
   Expected: Successful login, redirect to operator dashboard
   
2. Review today's summary on dashboard
   Expected: Display today's report count and total amount
   
3. Click "Input Laporan Baru" button
   Expected: Navigate to report input form
   
4. Select retribution type from dropdown
   Expected: Dropdown shows only assigned retribution types
   
5. Enter yesterday's date in tanggal setor field
   Expected: Date accepts backdate within 30 days
   
6. Enter nominal amount: 1,500,000
   Expected: Currency formatting applied automatically (Rp 1.500.000)
   
7. Upload PDF receipt file (2MB)
   Expected: File upload progress shown, success confirmation
   
8. Enter description in keterangan field
   Expected: Text area accepts Indonesian characters
   
9. Submit form
   Expected: Success message, redirect to report list
   
10. Verify report appears in list
    Expected: New report visible with correct data

Result: [ PASS / FAIL ]
Notes: ________________________________
Tester: ________________________________
Date: __________________________________
```

#### 7.1.2 UAT Scenarios by User Type

**Operator OPD Scenarios:**
- Daily report submission workflow
- Editing recently submitted reports
- Viewing personal report history
- File upload with different formats and sizes
- Form validation and error handling
- Mobile device usage for field reporting

**Admin Bapenda Scenarios:**
- Monitoring dashboard overview
- Filtering and searching all reports
- User management (create, edit, deactivate)
- Report cancellation workflow
- Data export to Excel and PDF
- Alert management for missing reports

**Executive Scenarios:**
- High-level dashboard interpretation
- Trend analysis and insights
- Print/export for meetings
- Performance comparison between OPD
- Target vs actual achievement review

**Public User Scenarios:**
- Accessing transparency dashboard without login
- Understanding retribution information
- Mobile access to public data
- Performance on slow connections

### 7.2 Usability Testing

#### 7.2.1 Usability Test Protocol
```
Session Setup:
- Duration: 60 minutes per user
- Participants: 2-3 from each user type
- Setting: Actual work environment at OPD/Bapenda
- Recording: Screen capture + audio (with permission)
- Facilitator: Developer + UX observer

Pre-test Questions:
1. How do you currently handle retribution reporting?
2. What challenges do you face with current process?
3. What are your expectations from digital system?
4. Rate your computer/internet comfort level (1-5)

Task Scenarios:
Task 1: "You need to report yesterday's parking retribution of Rp 750,000. Please complete this using the system."
- Observe: Navigation path, form completion time, error recovery
- Measure: Time to completion, number of errors, success rate

Task 2: "Find all reports from last week and show the total amount."
- Observe: Search/filter usage, data interpretation
- Measure: Task completion, accuracy of result

Task 3: "The system shows an alert that DPUPR hasn't reported today. Please investigate and take action."
- Observe: Alert understanding, investigation process
- Measure: Correct identification of issue, appropriate action taken

Post-task Questions:
1. How was that compared to your current process?
2. What confused you or slowed you down?
3. What did you like about the system?
4. What would you change or improve?
5. Would you recommend this system to colleagues?

Success Criteria:
- Task completion rate >80%
- Average time per task <5 minutes
- User satisfaction score >4/5
- Less than 2 critical errors per session
```

### 7.3 Accessibility Testing

#### 7.3.1 Accessibility Checklist
```
WCAG 2.1 Level A Compliance Checklist:

Visual Accessibility:
□ Color contrast ratio ≥4.5:1 for normal text
□ Color contrast ratio ≥3:1 for large text  
□ Information not conveyed by color alone
□ Text can be resized to 200% without horizontal scrolling
□ Focus indicators visible for all interactive elements

Keyboard Accessibility:
□ All functionality available via keyboard
□ Logical tab order throughout application
□ No keyboard traps (can exit all components)
□ Skip links available for main content
□ Modal dialogs trap focus appropriately

Screen Reader Compatibility:
□ All images have appropriate alt text
□ Form inputs have associated labels
□ Headings used in logical order (h1-h6)
□ ARIA labels used for complex components
□ Status messages announced to screen readers

Motor Accessibility:
□ Touch targets minimum 44px x 44px
□ Hover functionality also available via keyboard
□ Drag operations have keyboard alternatives
□ Timeout warnings provided with extension option

Cognitive Accessibility:
□ Clear navigation and page structure
□ Error messages clear and actionable
□ Help text available for complex forms
□ Consistent layout and terminology
□ Progress indicators for multi-step processes

Testing Tools:
- Screen reader: NVDA (Windows), VoiceOver (Mac)
- Keyboard navigation: Tab, Shift+Tab, Arrow keys, Enter, Space
- Color blindness: Colour Oracle simulator
- Zoom testing: Browser zoom 200%, 300%
- Automated scan: axe-core accessibility engine
```

### 7.4 Mobile Testing Strategy

#### 7.4.1 Mobile Device Testing Matrix

| Device Type | Screen Size | Test Priority | Key Test Areas |
|-------------|-------------|---------------|----------------|
| **Smartphone** | 375x667px (iPhone SE) | High | Touch targets, form input, file upload |
| **Smartphone** | 390x844px (iPhone 12) | High | Navigation, dashboard layout |
| **Smartphone** | 360x640px (Android) | Medium | Cross-platform compatibility |
| **Tablet** | 768x1024px (iPad) | Medium | Admin dashboard, data tables |
| **Tablet** | 1024x768px (landscape) | Low | Executive dashboard, charts |

#### 7.4.2 Mobile-Specific Test Cases
```
Mobile Test Case: MT-001 - Report Input on Mobile
Device: iPhone SE (375x667px)
Objective: Verify report input form works on small screen

Steps:
1. Open system on mobile browser
   Expected: Responsive layout loads correctly
   
2. Login with operator credentials
   Expected: Login form fits screen, no horizontal scroll
   
3. Navigate to report input form
   Expected: Form elements stack vertically, readable text
   
4. Fill form using on-screen keyboard
   Expected: Keyboard doesn't obscure active field
   
5. Use camera to capture receipt
   Expected: Camera integration works, file uploads successfully
   
6. Submit form
   Expected: Success feedback visible, appropriate for touch

Result: [ PASS / FAIL ]
Issues Found: ___________________________
Network Conditions: _____________________
```

---

## 8. Test Automation & CI/CD Integration

### 8.1 Continuous Testing Pipeline

#### 8.1.1 GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: retribusi_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/retribusi_test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/retribusi_test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm start &
          npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: OWASP ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3000'
```

### 8.2 Test Data Management

#### 8.2.1 Test Database Seeding
```typescript
// tests/setup/seed-database.ts
export async function seedTestDatabase() {
  // Create test OPD
  const testOPD = await db.insert(opd).values([
    { id: 'test-opd-1', name: 'Dinas Test', code: 'DINTEST', description: 'Test department' },
    { id: 'test-opd-2', name: 'Badan Test', code: 'BADTEST', description: 'Test agency' }
  ]).returning();

  // Create test retribution types
  const testRetribusi = await db.insert(jenisRetribusi).values([
    {
      id: 'test-ret-1',
      kategori: 'jasa_umum',
      nama: 'Test Parkir',
      kode: 'TEST_PARKIR',
      opdId: 'test-opd-1'
    },
    {
      id: 'test-ret-2',
      kategori: 'jasa_usaha',
      nama: 'Test Terminal',
      kode: 'TEST_TERMINAL',
      opdId: 'test-opd-1'
    }
  ]).returning();

  // Create test users
  const passwordHash = await bcrypt.hash('password123', 12);
  const testUsers = await db.insert(users).values([
    {
      id: 'test-operator-1',
      username: 'operator1',
      email: 'operator1@test.com',
      passwordHash,
      role: 'operator',
      opdId: 'test-opd-1',
      status: 'active'
    },
    {
      id: 'test-admin-1',
      username: 'admin1',
      email: 'admin1@test.com',
      passwordHash,
      role: 'admin',
      status: 'active'
    }
  ]).returning();

  return {
    opd: testOPD,
    retribusi: testRetribusi,
    users: testUsers
  };
}

export async function cleanupTestDatabase() {
  await db.delete(auditLog);
  await db.delete(laporanRetribusi);
  await db.delete(jenisRetribusi);
  await db.delete(users);
  await db.delete(opd);
}
```

### 8.3 Performance Monitoring

#### 8.3.1 Performance Regression Detection
```typescript
// tests/performance/benchmarks.test.ts
describe('Performance Benchmarks', () => {
  test('API response times remain within thresholds', async () => {
    const benchmarks = [
      { endpoint: '/api/auth/login', maxTime: 200 },
      { endpoint: '/api/dashboard/operator', maxTime: 500 },
      { endpoint: '/api/laporan', maxTime: 300 },
      { endpoint: '/api/laporan', method: 'POST', maxTime: 1000 }
    ];

    for (const benchmark of benchmarks) {
      const startTime = Date.now();
      
      const response = await request(app)
        [benchmark.method || 'get'](benchmark.endpoint)
        .set('Cookie', validAuthCookie)
        .send(benchmark.data || {});

      const responseTime = Date.now() - startTime;

      expect(response.status).toBeLessThan(400);
      expect(responseTime).toBeLessThan(benchmark.maxTime);
    }
  });

  test('database query performance benchmarks', async () => {
    // Create large dataset for testing
    await createPerformanceTestData(10000);

    const queries = [
      {
        name: 'Report listing with filters',
        query: () => db.select().from(laporanRetribusi)
          .where(gte(laporanRetribusi.tanggalSetor, '2025-01-01'))
          .limit(50),
        maxTime: 100
      },
      {
        name: 'Dashboard aggregation',
        query: () => db.select({
          total: sql<number>`sum(nominal)`,
          count: sql<number>`count(*)`
        }).from(laporanRetribusi)
          .where(eq(laporanRetribusi.status, 'active')),
        maxTime: 150
      }
    ];

    for (const queryBenchmark of queries) {
      const startTime = Date.now();
      await queryBenchmark.query();
      const queryTime = Date.now() - startTime;

      expect(queryTime).toBeLessThan(queryBenchmark.maxTime);
    }
  });
});
```

---

## 9. Test Reporting & Quality Metrics

### 9.1 Test Coverage Requirements

| Component Type | Coverage Target | Measurement Method |
|----------------|-----------------|-------------------|
| **Business Logic** | 90% | Line + Branch Coverage |
| **API Endpoints** | 85% | Integration Test Coverage |
| **UI Components** | 75% | Component Test Coverage |
| **Critical Paths** | 100% | E2E Test Coverage |
| **Security Features** | 100% | Security Test Coverage |

### 9.2 Quality Gates

```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/api/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  }
};
```

### 9.3 Test Documentation

All test cases are documented with:
- **Test ID**: Unique identifier for traceability
- **Objective**: Clear statement of what is being tested
- **Prerequisites**: Setup requirements and test data
- **Steps**: Detailed execution steps
- **Expected Results**: Clear pass/fail criteria
- **Actual Results**: Recorded outcomes
- **Priority**: Critical, High, Medium, Low
- **Automation Status**: Manual, Automated, Cannot Automate

---

This comprehensive test plan ensures the Regional Retribution Monitoring System meets government-grade quality standards through systematic testing at all levels, from unit tests to user acceptance testing. The combination of automated and manual testing provides confidence in system reliability, security, and usability.