/**
 * Bcrypt Password Hashing Utilities
 *
 * Changes:
 * - Password hashing with bcrypt
 * - 12 rounds as per SRS security requirements
 * - Password comparison for authentication
 */

import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

/**
 * Compare plain password with hashed password
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Validate password strength
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password harus minimal 8 karakter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf besar')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 huruf kecil')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung minimal 1 angka')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
