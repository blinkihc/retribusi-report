/**
 * Run Database Migration
 *
 * Script to add avatar column to users table
 */

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'
import postgres from 'postgres'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
config({ path: join(__dirname, '..', '.env') })

const sql = postgres(process.env.DATABASE_URL || '', {
  max: 1,
})

async function runMigration() {
  try {
    console.log('🔄 Running migration: Add avatar column to users table...')

    // Add avatar column
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT 'avatar-1'
    `
    console.log('✅ Avatar column added successfully')

    // Update existing users
    await sql`
      UPDATE users 
      SET avatar = 'avatar-1' 
      WHERE avatar IS NULL
    `
    console.log('✅ Existing users updated with default avatar')

    // Add comment
    await sql`
      COMMENT ON COLUMN users.avatar IS 'Avatar ID for user profile (e.g., avatar-1, avatar-2)'
    `
    console.log('✅ Column comment added')

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigration()
