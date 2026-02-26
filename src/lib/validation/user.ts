/**
 * User Validation Schemas
 *
 * Changes:
 * - User registration and login validation
 * - Password strength requirements
 * - Role-based validation
 */

import { z } from 'zod'
import { emailSchema } from './common'

// Login schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username minimal 3 karakter' })
    .max(50, { message: 'Username maksimal 50 karakter' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
})

// User registration schema
export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username minimal 3 karakter' })
    .max(50, { message: 'Username maksimal 50 karakter' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username hanya boleh mengandung huruf, angka, dan underscore',
    }),
  email: emailSchema,
  password: z
    .string()
    .min(8, { message: 'Password minimal 8 karakter' })
    .regex(/[A-Z]/, { message: 'Password harus mengandung minimal 1 huruf besar' })
    .regex(/[a-z]/, { message: 'Password harus mengandung minimal 1 huruf kecil' })
    .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' }),
  fullName: z
    .string()
    .min(3, { message: 'Nama lengkap minimal 3 karakter' })
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' }),
  role: z.enum(['admin', 'operator'], {
    message: 'Role harus admin atau operator',
  }),
  opdId: z.number().int().positive().optional(),
})

// Update user schema
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  fullName: z
    .string()
    .min(3, { message: 'Nama lengkap minimal 3 karakter' })
    .max(100, { message: 'Nama lengkap maksimal 100 karakter' })
    .optional(),
  role: z.enum(['admin', 'operator']).optional(),
  opdId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
})

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Password lama tidak boleh kosong' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password baru minimal 8 karakter' })
      .regex(/[A-Z]/, { message: 'Password harus mengandung minimal 1 huruf besar' })
      .regex(/[a-z]/, { message: 'Password harus mengandung minimal 1 huruf kecil' })
      .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Password baru harus berbeda dengan password lama',
    path: ['newPassword'],
  })

// User query schema
export const userQuerySchema = z.object({
  role: z.enum(['admin', 'operator']).optional(),
  opdId: z.coerce.number().int().positive().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UserQuery = z.infer<typeof userQuerySchema>
