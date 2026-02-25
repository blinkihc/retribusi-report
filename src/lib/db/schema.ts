/**
 * Database Schema - Sistem Monitoring Retribusi Daerah
 *
 * Changes:
 * - Initial schema creation with 6 core tables
 * - Users, OPD, Jenis Retribusi, Laporan, Target, Audit Log
 * - Implements soft delete pattern
 * - Proper indexing for performance
 */

import { relations } from 'drizzle-orm'
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core'

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'operator'])
export const laporanStatusEnum = pgEnum('laporan_status', [
  'draft',
  'submitted',
  'verified',
  'rejected',
])
export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
])

// Users Table
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    email: varchar('email', { length: 100 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 100 }).notNull(),
    role: userRoleEnum('role').notNull().default('operator'),
    opdId: integer('opd_id').references(() => opd.id),
    avatar: varchar('avatar', { length: 50 }).default('male-1'),
    isActive: boolean('is_active').notNull().default(true),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    usernameIdx: index('users_username_idx').on(table.username),
    emailIdx: index('users_email_idx').on(table.email),
    roleIdx: index('users_role_idx').on(table.role),
    opdIdx: index('users_opd_idx').on(table.opdId),
  })
)

// OPD (Organisasi Perangkat Daerah) Table
export const opd = pgTable(
  'opd',
  {
    id: serial('id').primaryKey(),
    kode: varchar('kode', { length: 20 }).notNull().unique(),
    nama: varchar('nama', { length: 200 }).notNull(),
    alamat: text('alamat'),
    telepon: varchar('telepon', { length: 20 }),
    email: varchar('email', { length: 100 }),
    kepala: varchar('kepala', { length: 100 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    kodeIdx: index('opd_kode_idx').on(table.kode),
    namaIdx: index('opd_nama_idx').on(table.nama),
  })
)

// Jenis Retribusi Table
export const jenisRetribusi = pgTable(
  'jenis_retribusi',
  {
    id: serial('id').primaryKey(),
    kode: varchar('kode', { length: 20 }).notNull().unique(),
    nama: varchar('nama', { length: 200 }).notNull().unique(),
    kategori: varchar('kategori', { length: 100 }),
    deskripsi: text('deskripsi'),
    dasar_hukum: text('dasar_hukum'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    kodeIdx: index('jenis_retribusi_kode_idx').on(table.kode),
    namaIdx: index('jenis_retribusi_nama_idx').on(table.nama),
    kategoriIdx: index('jenis_retribusi_kategori_idx').on(table.kategori),
  })
)

// OPD-Pelayanan Junction Table (Many-to-Many relationship)
export const opdPelayanan = pgTable(
  'opd_pelayanan',
  {
    id: serial('id').primaryKey(),
    kodeOpd: varchar('kode_opd', { length: 20 })
      .notNull()
      .references(() => opd.kode, { onDelete: 'cascade' }),
    namaJenisRetribusi: varchar('nama_jenis_retribusi', { length: 200 })
      .notNull()
      .references(() => jenisRetribusi.nama, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    kodeOpdIdx: index('opd_pelayanan_kode_opd_idx').on(table.kodeOpd),
    namaJenisIdx: index('opd_pelayanan_nama_jenis_idx').on(table.namaJenisRetribusi),
    uniqueRelation: unique('opd_pelayanan_unique').on(table.kodeOpd, table.namaJenisRetribusi),
  })
)

// Laporan Retribusi Table
export const laporanRetribusi = pgTable(
  'laporan_retribusi',
  {
    id: serial('id').primaryKey(),
    nomorLaporan: varchar('nomor_laporan', { length: 50 }).notNull().unique(),
    opdId: integer('opd_id')
      .notNull()
      .references(() => opd.id),
    jenisRetribusiId: integer('jenis_retribusi_id')
      .notNull()
      .references(() => jenisRetribusi.id),
    kategori: varchar('kategori', { length: 100 }),
    deskripsi: text('deskripsi'),
    tanggalSetor: timestamp('tanggal_setor').notNull(),
    nominal: decimal('nominal', { precision: 15, scale: 2 }).notNull(),
    keterangan: text('keterangan'),
    fileBukti: varchar('file_bukti', { length: 255 }),
    status: laporanStatusEnum('status').notNull().default('draft'),
    submittedBy: integer('submitted_by')
      .notNull()
      .references(() => users.id),
    submittedAt: timestamp('submitted_at'),
    verifiedBy: integer('verified_by').references(() => users.id),
    verifiedAt: timestamp('verified_at'),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    nomorLaporanIdx: index('laporan_nomor_idx').on(table.nomorLaporan),
    opdIdx: index('laporan_opd_idx').on(table.opdId),
    jenisIdx: index('laporan_jenis_idx').on(table.jenisRetribusiId),
    statusIdx: index('laporan_status_idx').on(table.status),
    tanggalSetorIdx: index('laporan_tanggal_setor_idx').on(table.tanggalSetor),
    submittedByIdx: index('laporan_submitted_by_idx').on(table.submittedBy),
  })
)

// Target Retribusi Table
// Target per Jenis Retribusi per Tahun (bukan per OPD/bulan)
// Realisasi dihitung on-the-fly dari laporan_retribusi
export const targetRetribusi = pgTable(
  'target_retribusi',
  {
    id: serial('id').primaryKey(),
    jenisRetribusiId: integer('jenis_retribusi_id')
      .notNull()
      .references(() => jenisRetribusi.id),
    tahun: integer('tahun').notNull(),
    targetNominal: decimal('target_nominal', { precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    jenisIdx: index('target_jenis_idx').on(table.jenisRetribusiId),
    tahunIdx: index('target_tahun_idx').on(table.tahun),
    uniqueJenisTahun: unique('target_jenis_tahun_unique').on(table.jenisRetribusiId, table.tahun),
  })
)

// Audit Log Table
export const auditLog = pgTable(
  'audit_log',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    action: auditActionEnum('action').notNull(),
    tableName: varchar('table_name', { length: 50 }),
    recordId: integer('record_id'),
    oldValues: text('old_values'),
    newValues: text('new_values'),
    details: text('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('audit_user_idx').on(table.userId),
    actionIdx: index('audit_action_idx').on(table.action),
    tableIdx: index('audit_table_idx').on(table.tableName),
    createdAtIdx: index('audit_created_at_idx').on(table.createdAt),
  })
)

// Notifications Table — untuk notifikasi approve/reject ke operator
export const notifications = pgTable(
  'notifications',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 30 }).notNull(), // 'approved' | 'rejected' | 'info'
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message').notNull(),
    laporanId: integer('laporan_id').references(() => laporanRetribusi.id),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index('notif_user_idx').on(table.userId),
    isReadIdx: index('notif_is_read_idx').on(table.isRead),
    createdAtIdx: index('notif_created_at_idx').on(table.createdAt),
  })
)

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  opd: one(opd, {
    fields: [users.opdId],
    references: [opd.id],
  }),
  submittedReports: many(laporanRetribusi, { relationName: 'submittedBy' }),
  verifiedReports: many(laporanRetribusi, { relationName: 'verifiedBy' }),
  auditLogs: many(auditLog),
}))

export const opdRelations = relations(opd, ({ many }) => ({
  users: many(users),
  laporanRetribusi: many(laporanRetribusi),
  targetRetribusi: many(targetRetribusi),
}))

export const jenisRetribusiRelations = relations(jenisRetribusi, ({ many }) => ({
  laporanRetribusi: many(laporanRetribusi),
  targetRetribusi: many(targetRetribusi),
}))

export const laporanRetribusiRelations = relations(laporanRetribusi, ({ one }) => ({
  opd: one(opd, {
    fields: [laporanRetribusi.opdId],
    references: [opd.id],
  }),
  jenisRetribusi: one(jenisRetribusi, {
    fields: [laporanRetribusi.jenisRetribusiId],
    references: [jenisRetribusi.id],
  }),
  submittedByUser: one(users, {
    fields: [laporanRetribusi.submittedBy],
    references: [users.id],
    relationName: 'submittedBy',
  }),
  verifiedByUser: one(users, {
    fields: [laporanRetribusi.verifiedBy],
    references: [users.id],
    relationName: 'verifiedBy',
  }),
}))

export const targetRetribusiRelations = relations(targetRetribusi, ({ one }) => ({
  jenisRetribusi: one(jenisRetribusi, {
    fields: [targetRetribusi.jenisRetribusiId],
    references: [jenisRetribusi.id],
  }),
}))

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}))

// Settings Table - Global Configuration
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type OPD = typeof opd.$inferSelect
export type NewOPD = typeof opd.$inferInsert
export type JenisRetribusi = typeof jenisRetribusi.$inferSelect
export type NewJenisRetribusi = typeof jenisRetribusi.$inferInsert
export type LaporanRetribusi = typeof laporanRetribusi.$inferSelect
export type NewLaporanRetribusi = typeof laporanRetribusi.$inferInsert
export type TargetRetribusi = typeof targetRetribusi.$inferSelect
export type NewTargetRetribusi = typeof targetRetribusi.$inferInsert
export type AuditLog = typeof auditLog.$inferSelect
export type NewAuditLog = typeof auditLog.$inferInsert
export type Settings = typeof settings.$inferSelect
export type NewSettings = typeof settings.$inferInsert

// Computed types for Target-Realisasi feature
export type TargetRealisasiBulanan = {
  bulan: number
  namabulan: string
  realisasi: number
}

export type TargetRealisasiRekap = {
  jenisRetribusiId: number
  namaRetribusi: string
  target: number
  realisasiBulanLalu: number
  realisasiBulanIni: number
  realisasiTotal: number
  persentase: number
  sisaTarget: number
}

export type TargetRealisasiMatrix = {
  jenisRetribusiId: number
  namaRetribusi: string
  target: number
  bulanan: Record<number, number> // bulan 1-12 → nominal
  total: number
  persentase: number
}
