/**
 * Script: Populate kategori and deskripsi for existing laporan
 * Run this after adding kategori and deskripsi columns to database
 */

import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL || ''

async function populateKategoriDeskripsi() {
  console.log('🔄 Starting: Populate kategori and deskripsi...')

  const sql = postgres(DATABASE_URL)

  try {
    // Update all laporan with kategori and deskripsi from jenis_retribusi
    const result = await sql`
      UPDATE laporan_retribusi lr
      SET 
        kategori = jr.kategori,
        deskripsi = jr.deskripsi,
        updated_at = NOW()
      FROM jenis_retribusi jr
      WHERE lr.jenis_retribusi_id = jr.id
        AND (lr.kategori IS NULL OR lr.deskripsi IS NULL)
    `

    console.log(`✅ Updated ${result.count} records`)

    // Verify
    const stats = await sql`
      SELECT 
        COUNT(*) as total_records,
        COUNT(kategori) as records_with_kategori,
        COUNT(deskripsi) as records_with_deskripsi
      FROM laporan_retribusi
    `

    console.log('\n📊 Statistics:')
    console.log(`   Total records: ${stats[0].total_records}`)
    console.log(`   With kategori: ${stats[0].records_with_kategori}`)
    console.log(`   With deskripsi: ${stats[0].records_with_deskripsi}`)

    await sql.end()
    console.log('\n✅ Done!')
  } catch (error) {
    console.error('❌ Error:', error)
    await sql.end()
    throw error
  }
}

populateKategoriDeskripsi()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
