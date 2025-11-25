# Windsurf Coding Template - Initial Project Setup
## Sistem Monitoring dan Pelaporan Retribusi Daerah

**Framework:** TanStack Start (TypeScript Full-Stack)  
**Date:** November 5, 2025  
**Status:** Initial Setup Template

---

## 📁 Project Structure

```
retribusi-monitoring/
├── .github/
│   └── workflows/
│       └── test.yml                 # CI/CD pipeline
├── app/
│   ├── api/                         # API routes
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   └── me.ts
│   │   ├── users/
│   │   │   ├── index.ts
│   │   │   ├── [id].ts
│   │   │   └── [id]/status.ts
│   │   ├── opd/
│   │   │   ├── index.ts
│   │   │   └── [id].ts
│   │   ├── retribusi/
│   │   │   ├── index.ts
│   │   │   └── [id].ts
│   │   ├── laporan/
│   │   │   ├── index.ts
│   │   │   ├── [id].ts
│   │   │   └── [id]/cancel.ts
│   │   ├── dashboard/
│   │   │   ├── operator.ts
│   │   │   ├── admin.ts
│   │   │   ├── executive.ts
│   │   │   └── public.ts
│   │   ├── export/
│   │   │   ├── excel.ts
│   │   │   └── pdf.ts
│   │   └── upload/
│   │       └── bukti-setor.ts
│   ├── routes/                      # Frontend routes
│   │   ├── __root.tsx               # Root layout
│   │   ├── index.tsx                # Landing page
│   │   ├── login.tsx                # Login page
│   │   ├── dashboard/
│   │   │   ├── index.tsx            # Role-based redirect
│   │   │   ├── operator.tsx         # Operator dashboard
│   │   │   ├── admin.tsx            # Admin dashboard
│   │   │   └── executive.tsx        # Executive dashboard
│   │   ├── laporan/
│   │   │   ├── index.tsx            # Report list
│   │   │   ├── input.tsx            # Report input form
│   │   │   └── [id].tsx             # Report detail/edit
│   │   ├── admin/
│   │   │   ├── users.tsx            # User management
│   │   │   ├── opd.tsx              # OPD management
│   │   │   ├── retribusi.tsx        # Retribusi management
│   │   │   └── reports.tsx          # All reports view
│   │   └── public.tsx               # Public transparency
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── toast.tsx
│   │   ├── forms/                   # Form components
│   │   │   ├── ReportInputForm.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── OPDForm.tsx
│   │   │   └── RetribusiForm.tsx
│   │   ├── dashboard/               # Dashboard components
│   │   │   ├── SummaryCard.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   ├── RecentReports.tsx
│   │   │   └── AlertIndicator.tsx
│   │   ├── tables/                  # Table components
│   │   │   ├── ReportTable.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── DataTable.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/                  # Shared utilities
│   │       ├── FileUpload.tsx
│   │       ├── CurrencyInput.tsx
│   │       ├── DatePicker.tsx
│   │       └── LoadingSpinner.tsx
│   ├── lib/                         # Utilities & configs
│   │   ├── db/                      # Database
│   │   │   ├── index.ts             # Drizzle client
│   │   │   ├── schema.ts            # Database schema
│   │   │   └── migrations/          # SQL migrations
│   │   ├── auth/                    # Authentication
│   │   │   ├── jwt.ts               # JWT utilities
│   │   │   ├── bcrypt.ts            # Password hashing
│   │   │   └── middleware.ts        # Auth middleware
│   │   ├── validation/              # Validation schemas
│   │   │   ├── report.ts
│   │   │   ├── user.ts
│   │   │   └── common.ts
│   │   ├── services/                # Business logic services
│   │   │   ├── reportService.ts
│   │   │   ├── userService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── exportService.ts
│   │   │   └── auditService.ts
│   │   ├── utils/                   # Helper functions
│   │   │   ├── currency.ts
│   │   │   ├── date.ts
│   │   │   ├── file.ts
│   │   │   └── validation.ts
│   │   └── constants.ts             # App constants
│   └── styles/                      # Global styles
│       └── globals.css              # Tailwind + custom CSS
├── public/                          # Static assets
│   ├── logo-pemda.png
│   └── favicon.ico
├── tests/                           # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── uploads/                         # File uploads (gitignored)
│   ├── bukti_setor/
│   └── exports/
├── .env.example                     # Environment variables template
├── .env                             # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
└── README.md
```

---

## 🚀 Step 1: Initialize Project

### Create TanStack Start Project
```bash
# Create new TanStack Start project
npm create @tanstack/start@latest retribusi-monitoring

# Navigate to project
cd retribusi-monitoring

# Install dependencies
npm install

# Install additional dependencies
npm install drizzle-orm postgres
npm install -D drizzle-kit
npm install bcryptjs jsonwebtoken
npm install zod
npm install @tanstack/react-query
npm install recharts
npm install exceljs
npm install date-fns
npm install clsx tailwind-merge

# Install Shadcn UI
npx shadcn-ui@latest init

# Add Shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
```

---

## 📦 Step 2: Environment Configuration

### `.env.example`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/retribusi_db

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars

# App Config
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Session
JWT_EXPIRATION=8h

# Admin Credentials (initial setup)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@bapenda.go.id
ADMIN_PASSWORD=ChangeMe123!
```

### `.env` (create this, gitignored)
```env
# Copy .env.example and fill with actual values
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/retribusi_db
JWT_SECRET=generate-a-secure-random-string-here
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
JWT_EXPIRATION=8h
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@bapenda.go.id
ADMIN_PASSWORD=Admin123!
```

---

## 🗄️ Step 3: Database Setup

### `app/lib/db/schema.ts` (Drizzle Schema)
```typescript
import { pgTable, uuid, varchar, text, timestamp, decimal, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'operator']);
export const statusEnum = pgEnum('status', ['active', 'inactive']);
export const reportStatusEnum = pgEnum('report_status', ['active', 'cancelled']);
export const kategoriRetribusiEnum = pgEnum('kategori_retribusi', ['jasa_umum', 'jasa_usaha', 'perizinan_tertentu']);

// OPD Table
export const opd = pgTable('opd', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Jenis Retribusi Table
export const jenisRetribusi = pgTable('jenis_retribusi', {
  id: uuid('id').primaryKey().defaultRandom(),
  kategori: kategoriRetribusiEnum('kategori').notNull(),
  nama: varchar('nama', { length: 200 }).notNull(),
  kode: varchar('kode', { length: 50 }).notNull().unique(),
  opdId: uuid('opd_id').notNull().references(() => opd.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  opdIdIdx: index('idx_jenis_retribusi_opd_id').on(table.opdId),
  kategoriIdx: index('idx_jenis_retribusi_kategori').on(table.kategori)
}));

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: roleEnum('role').notNull(),
  opdId: uuid('opd_id').references(() => opd.id),
  status: statusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  opdIdIdx: index('idx_users_opd_id').on(table.opdId),
  roleIdx: index('idx_users_role').on(table.role),
  statusIdx: index('idx_users_status').on(table.status),
  emailIdx: index('idx_users_email').on(table.email)
}));

// Laporan Retribusi Table
export const laporanRetribusi = pgTable('laporan_retribusi', {
  id: uuid('id').primaryKey().defaultRandom(),
  retribusiId: uuid('retribusi_id').notNull().references(() => jenisRetribusi.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  tanggalSetor: timestamp('tanggal_setor', { mode: 'date' }).notNull(),
  tanggalInput: timestamp('tanggal_input').defaultNow().notNull(),
  nominal: decimal('nominal', { precision: 15, scale: 2 }).notNull(),
  buktiSetorPath: varchar('bukti_setor_path', { length: 500 }).notNull(),
  keterangan: text('keterangan'),
  status: reportStatusEnum('status').notNull().default('active'),
  cancelledBy: uuid('cancelled_by').references(() => users.id),
  cancelledAt: timestamp('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  tanggalSetorIdx: index('idx_laporan_tanggal_setor').on(table.tanggalSetor),
  userIdIdx: index('idx_laporan_user_id').on(table.userId),
  retribusiIdIdx: index('idx_laporan_retribusi_id').on(table.retribusiId),
  statusIdx: index('idx_laporan_status').on(table.status)
}));

// Target Retribusi Table (Phase 1.5)
export const targetRetribusi = pgTable('target_retribusi', {
  id: uuid('id').primaryKey().defaultRandom(),
  retribusiId: uuid('retribusi_id').notNull().references(() => jenisRetribusi.id),
  tahun: varchar('tahun', { length: 4 }).notNull(),
  bulan: varchar('bulan', { length: 2 }).notNull(),
  targetNominal: decimal('target_nominal', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Audit Log Table
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 50 }).notNull(),
  recordId: uuid('record_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('idx_audit_user_id').on(table.userId),
  tableNameIdx: index('idx_audit_table_name').on(table.tableName),
  recordIdIdx: index('idx_audit_record_id').on(table.recordId)
}));

// Relations
export const opdRelations = relations(opd, ({ many }) => ({
  jenisRetribusi: many(jenisRetribusi),
  users: many(users)
}));

export const jenisRetribusiRelations = relations(jenisRetribusi, ({ one, many }) => ({
  opd: one(opd, {
    fields: [jenisRetribusi.opdId],
    references: [opd.id]
  }),
  laporan: many(laporanRetribusi)
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  opd: one(opd, {
    fields: [users.opdId],
    references: [opd.id]
  }),
  laporan: many(laporanRetribusi),
  cancelledReports: many(laporanRetribusi, { relationName: 'cancelledBy' })
}));

export const laporanRetribusiRelations = relations(laporanRetribusi, ({ one }) => ({
  retribusi: one(jenisRetribusi, {
    fields: [laporanRetribusi.retribusiId],
    references: [jenisRetribusi.id]
  }),
  user: one(users, {
    fields: [laporanRetribusi.userId],
    references: [users.id]
  }),
  cancelledByUser: one(users, {
    fields: [laporanRetribusi.cancelledBy],
    references: [users.id],
    relationName: 'cancelledBy'
  })
}));
```

### `drizzle.config.ts`
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './app/lib/db/schema.ts',
  out: './app/lib/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!
  }
} satisfies Config;
```

### `app/lib/db/index.ts` (Database Client)
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Create postgres client
const client = postgres(connectionString);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

export * from './schema';
```

### Generate Migration
```bash
# Generate migration from schema
npm run db:generate

# Push schema to database
npm run db:push

# Or run migration manually
npm run db:migrate
```

### `package.json` scripts addition
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "tsx app/lib/db/migrate.ts",
    "db:seed": "tsx app/lib/db/seed.ts"
  }
}
```

---

## 🔐 Step 4: Authentication Setup

### `app/lib/auth/jwt.ts`
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '8h';

export interface JWTPayload {
  userId: string;
  username: string;
  role: 'admin' | 'operator';
  opdId?: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
```

### `app/lib/auth/bcrypt.ts`
```typescript
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### `app/lib/auth/middleware.ts`
```typescript
import { verifyToken, JWTPayload } from './jwt';

export async function requireAuth(request: Request): Promise<JWTPayload> {
  const authHeader = request.headers.get('Authorization');
  const cookieHeader = request.headers.get('Cookie');
  
  let token: string | null = null;
  
  // Check Authorization header
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  // Check cookies
  if (!token && cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    );
    token = cookies['auth-token'];
  }
  
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }
  
  try {
    return verifyToken(token);
  } catch (error) {
    throw new Error('Unauthorized: Invalid token');
  }
}

export function requireAdmin(user: JWTPayload): void {
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
}

export function requireOperatorOrAdmin(user: JWTPayload): void {
  if (user.role !== 'admin' && user.role !== 'operator') {
    throw new Error('Forbidden: Insufficient permissions');
  }
}
```

---

## ✅ Step 5: Validation Schemas (Zod)

### `app/lib/validation/common.ts`
```typescript
import { z } from 'zod';

export const uuidSchema = z.string().uuid('Invalid UUID format');

export const emailSchema = z.string().email('Format email tidak valid');

export const passwordSchema = z.string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
  .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
  .regex(/[0-9]/, 'Password harus mengandung angka')
  .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial');

export const dateSchema = z.coerce.date();

export const currencySchema = z.number().positive('Nominal harus lebih dari 0');
```

### `app/lib/validation/report.ts`
```typescript
import { z } from 'zod';
import { uuidSchema, dateSchema, currencySchema } from './common';

export const reportInputSchema = z.object({
  retribusiId: uuidSchema,
  tanggalSetor: dateSchema
    .refine(date => date <= new Date(), 'Tanggal setor tidak boleh di masa depan')
    .refine(date => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    }, 'Tanggal setor tidak boleh lebih dari 30 hari yang lalu'),
  nominal: currencySchema,
  keterangan: z.string().max(500, 'Keterangan maksimal 500 karakter').optional()
});

export const reportUpdateSchema = reportInputSchema.partial();

export const reportCancelSchema = z.object({
  reason: z.string().min(10, 'Alasan pembatalan minimal 10 karakter')
});

export type ReportInput = z.infer<typeof reportInputSchema>;
export type ReportUpdate = z.infer<typeof reportUpdateSchema>;
export type ReportCancel = z.infer<typeof reportCancelSchema>;
```

### `app/lib/validation/user.ts`
```typescript
import { z } from 'zod';
import { uuidSchema, emailSchema, passwordSchema } from './common';

export const userCreateSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'operator']),
  opdId: uuidSchema.optional()
}).refine(data => {
  if (data.role === 'operator') {
    return !!data.opdId;
  }
  return true;
}, {
  message: 'Operator harus memiliki OPD assignment',
  path: ['opdId']
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true });

export const userStatusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive'])
});

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserStatusUpdate = z.infer<typeof userStatusUpdateSchema>;
```

---

## 🎯 Step 6: Sample API Route

### `app/api/auth/login.ts`
```typescript
import { json } from '@tanstack/start';
import { db, users } from '~/lib/db';
import { verifyPassword } from '~/lib/auth/bcrypt';
import { generateToken } from '~/lib/auth/jwt';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi')
});

export async function POST({ request }: { request: Request }) {
  try {
    // Parse request body
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!user) {
      return json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return json({ error: 'Akun tidak aktif' }, { status: 403 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      opdId: user.opdId || undefined
    });

    // Set cookie
    const response = json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        opdId: user.opdId
      }
    });

    // Set HTTP-only secure cookie
    response.headers.set(
      'Set-Cookie',
      `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${8 * 60 * 60}`
    );

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: error.errors[0].message }, { status: 400 });
    }
    
    console.error('Login error:', error);
    return json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
```

---

## 🎨 Step 7: Sample Component

### `app/components/forms/ReportInputForm.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportInputSchema, type ReportInput } from '~/lib/validation/report';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Select } from '~/components/ui/select';
import { Card } from '~/components/ui/card';
import { toast } from '~/components/ui/toast';

export function ReportInputForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ReportInput>({
    resolver: zodResolver(reportInputSchema)
  });

  const onSubmit = async (data: ReportInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menyimpan laporan');
      }

      toast({ title: 'Sukses', description: 'Laporan berhasil disimpan' });
      reset();
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Jenis Retribusi *
          </label>
          <Select {...register('retribusiId')}>
            {/* Options will be populated dynamically */}
          </Select>
          {errors.retribusiId && (
            <p className="text-sm text-red-500 mt-1">{errors.retribusiId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Tanggal Setor *
          </label>
          <Input type="date" {...register('tanggalSetor')} />
          {errors.tanggalSetor && (
            <p className="text-sm text-red-500 mt-1">{errors.tanggalSetor.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nominal *
          </label>
          <Input type="number" step="0.01" {...register('nominal', { valueAsNumber: true })} />
          {errors.nominal && (
            <p className="text-sm text-red-500 mt-1">{errors.nominal.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Bukti Setor *
          </label>
          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Keterangan
          </label>
          <textarea 
            {...register('keterangan')} 
            className="w-full border rounded p-2"
            rows={3}
          />
          {errors.keterangan && (
            <p className="text-sm text-red-500 mt-1">{errors.keterangan.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
        </Button>
      </form>
    </Card>
  );
}
```

---

## 📝 Step 8: Initial Database Seed

### `app/lib/db/seed.ts`
```typescript
import { db, opd, jenisRetribusi, users } from './index';
import { hashPassword } from '../auth/bcrypt';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create OPD
    const [opdDishub] = await db.insert(opd).values({
      name: 'Dinas Perhubungan',
      code: 'DISHUB',
      description: 'Dinas Perhubungan OKU Selatan'
    }).returning();

    const [opdDinkes] = await db.insert(opd).values({
      name: 'Dinas Kesehatan',
      code: 'DINKES',
      description: 'Dinas Kesehatan OKU Selatan'
    }).returning();

    console.log('✅ OPD created');

    // Create Jenis Retribusi
    await db.insert(jenisRetribusi).values([
      {
        kategori: 'jasa_umum',
        nama: 'Retribusi Parkir',
        kode: 'PARKIR',
        opdId: opdDishub.id
      },
      {
        kategori: 'jasa_usaha',
        nama: 'Retribusi Terminal',
        kode: 'TERMINAL',
        opdId: opdDishub.id
      },
      {
        kategori: 'jasa_umum',
        nama: 'Retribusi Pelayanan Kesehatan',
        kode: 'YANKES',
        opdId: opdDinkes.id
      }
    ]);

    console.log('✅ Jenis Retribusi created');

    // Create Admin User
    const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'Admin123!');
    await db.insert(users).values({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@bapenda.go.id',
      passwordHash: adminPassword,
      role: 'admin',
      status: 'active'
    });

    // Create Operator User
    const operatorPassword = await hashPassword('Operator123!');
    await db.insert(users).values({
      username: 'operator_dishub',
      email: 'operator@dishub.go.id',
      passwordHash: operatorPassword,
      role: 'operator',
      opdId: opdDishub.id,
      status: 'active'
    });

    console.log('✅ Users created');
    console.log('🎉 Seeding completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log(`   Admin: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
    console.log(`   Operator: operator_dishub / Operator123!`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }

  process.exit(0);
}

seed();
```

---

## 🚦 Step 9: Run Development

```bash
# Setup database
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

---

## 📚 Next Steps

1. ✅ Setup project structure
2. ✅ Configure database with Drizzle
3. ✅ Setup authentication (JWT + bcrypt)
4. ✅ Create validation schemas (Zod)
5. ⬜ Build API routes (auth, users, OPD, retribusi, laporan)
6. ⬜ Build frontend pages (login, dashboards, forms)
7. ⬜ Implement file upload functionality
8. ⬜ Build dashboard components with charts
9. ⬜ Implement export functionality (Excel/PDF)
10. ⬜ Add audit logging system
11. ⬜ Write tests (unit, integration, E2E)
12. ⬜ Deploy to VPS

---

## 🎓 Windsurf Prompt Templates

### For API Development:
```
Create API route for [feature name]:
- Endpoint: [METHOD] /api/[path]
- Authentication: [required/optional]
- Request schema: [describe input]
- Response format: [describe output]
- Business logic: [describe rules]
- Error handling: [list error cases]
```

### For Component Development:
```
Create React component for [feature name]:
- Component type: [form/table/dashboard/etc]
- Props: [list props with types]
- State management: [useState/TanStack Query/etc]
- Validation: [Zod schema]
- UI library: Shadcn/ui
- Styling: Tailwind CSS
```

### For Database Queries:
```
Create database query for [purpose]:
- Table(s): [list tables]
- Filters: [WHERE conditions]
- Joins: [related tables]
- Aggregations: [SUM/COUNT/etc]
- Return type: [TypeScript interface]
```

---

**Happy Coding! 🚀**

Semua template ini siap langsung digunakan di Windsurf IDE untuk memulai development sistem monitoring retribusi daerah kamu!