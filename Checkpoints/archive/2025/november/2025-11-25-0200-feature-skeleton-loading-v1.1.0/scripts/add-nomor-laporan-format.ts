/**
 * Migration script to add nomor_laporan_format column to opd table
 * Run: bun run scripts/add-nomor-laporan-format.ts
 */

import 'dotenv/config'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function migrate() {
  try {
    console.log('Adding nomor_laporan_format column to opd table...')

    await sql`
      ALTER TABLE opd 
      ADD COLUMN IF NOT EXISTS nomor_laporan_format varchar(100) 
      DEFAULT '{nomor_urut}/{bulan_romawi}/{kode_opd}/{tahun}' 
      NOT NULL
    `

    console.log('✅ Migration completed successfully!')

    // Verify
    const result = await sql`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'opd' AND column_name = 'nomor_laporan_format'
    `

    console.log('Column info:', result[0])
  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await sql.end()
  }
}

migrate()
