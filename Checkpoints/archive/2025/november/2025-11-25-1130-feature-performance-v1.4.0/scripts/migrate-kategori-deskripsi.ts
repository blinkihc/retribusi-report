/**
 * Migration Script: Populate kategori and deskripsi for existing laporan
 *
 * This script updates all laporan_retribusi records that have NULL kategori or deskripsi
 * by fetching the values from jenis_retribusi table based on jenisRetribusiId
 */

import { eq, or, sql } from 'drizzle-orm'
import { db } from '../src/lib/db'
import { jenisRetribusi, laporanRetribusi } from '../src/lib/db/schema'

async function migrateLaporanKategoriDeskripsi() {
  console.log('🔄 Starting migration: Populate kategori and deskripsi...')

  try {
    // Find all laporan with NULL kategori or deskripsi
    const laporanList = await db
      .select()
      .from(laporanRetribusi)
      .where(
        or(sql`${laporanRetribusi.kategori} IS NULL`, sql`${laporanRetribusi.deskripsi} IS NULL`)
      )

    console.log(`📊 Found ${laporanList.length} laporan to update`)

    let updated = 0
    let skipped = 0

    for (const laporan of laporanList) {
      // Fetch kategori and deskripsi from jenis_retribusi
      const [jenisData] = await db
        .select({
          kategori: jenisRetribusi.kategori,
          deskripsi: jenisRetribusi.deskripsi,
        })
        .from(jenisRetribusi)
        .where(eq(jenisRetribusi.id, laporan.jenisRetribusiId))

      if (jenisData && (jenisData.kategori || jenisData.deskripsi)) {
        // Update laporan with kategori and deskripsi
        await db
          .update(laporanRetribusi)
          .set({
            kategori: jenisData.kategori,
            deskripsi: jenisData.deskripsi,
            updatedAt: new Date(),
          })
          .where(eq(laporanRetribusi.id, laporan.id))

        updated++
        console.log(`✅ Updated laporan #${laporan.id} (${laporan.nomorLaporan})`)
      } else {
        skipped++
        console.log(
          `⚠️  Skipped laporan #${laporan.id} - jenis retribusi not found or has no kategori/deskripsi`
        )
      }
    }

    console.log('\n✅ Migration completed!')
    console.log(`   Updated: ${updated}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Total: ${laporanList.length}`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migrateLaporanKategoriDeskripsi()
  .then(() => {
    console.log('\n🎉 Migration finished successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration failed with error:', error)
    process.exit(1)
  })
