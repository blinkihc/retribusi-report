/**
 * Migration script:
 * 1. Remove nomor_laporan_format from opd table
 * 2. Create settings table
 * 3. Insert default nomor_laporan_format setting
 *
 * Run: bun run scripts/migrate-to-settings.ts
 */

import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function migrate() {
  try {
    console.log('Starting migration...')

    // Step 1: Remove column from opd table if exists
    console.log('1. Removing nomor_laporan_format from opd table...')
    await sql`
      ALTER TABLE opd 
      DROP COLUMN IF EXISTS nomor_laporan_format
    `
    console.log('✅ Column removed')

    // Step 2: Create settings table
    console.log('2. Creating settings table...')
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `
    console.log('✅ Settings table created')

    // Step 3: Insert default settings
    console.log('3. Inserting default settings...')
    await sql`
      INSERT INTO settings (key, value, description)
      VALUES (
        'nomor_laporan_format',
        '{nomor_urut}/{bulan_romawi}/{kode_opd}/{tahun}',
        'Format nomor laporan retribusi. Placeholders: {nomor_urut}, {bulan_romawi}, {kode_opd}, {tahun}'
      )
      ON CONFLICT (key) DO NOTHING
    `
    console.log('✅ Default settings inserted')

    // Verify
    const result = await sql`
      SELECT * FROM settings WHERE key = 'nomor_laporan_format'
    `
    console.log('\n📋 Current setting:', result[0])

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await sql.end()
  }
}

migrate()
