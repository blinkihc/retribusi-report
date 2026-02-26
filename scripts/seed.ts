/**
 * Database Seed Script
 *
 * Seeds initial data:
 * - Admin user
 * - Sample OPD
 * - Sample Jenis Retribusi
 * - Sample Operator users
 */

import 'dotenv/config'
import { hashPassword } from '../src/lib/auth/bcrypt'
import { db } from '../src/lib/db/index'
import { jenisRetribusi, opd, settings, users } from '../src/lib/db/schema'

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // 1. Create Admin User
    console.log('Creating admin user...')
    const hashedAdminPassword = await hashPassword('Admin123')

    const [adminUser] = await db
      .insert(users)
      .values({
        username: 'admin',
        email: 'admin@bapenda.go.id',
        password: hashedAdminPassword,
        fullName: 'Administrator Bapenda',
        role: 'admin',
        isActive: true,
      })
      .returning()

    console.log('✅ Admin user created:', adminUser.username)

    // 2. Create Sample OPD
    console.log('Creating sample OPD...')
    const opdData = [
      {
        kode: 'DISDIK',
        nama: 'Dinas Pendidikan',
        alamat: 'Jl. Pendidikan No. 1',
        telepon: '0271-123456',
        email: 'disdik@pemda.go.id',
        kepala: 'Dr. Budi Santoso, M.Pd',
        isActive: true,
      },
      {
        kode: 'DINKES',
        nama: 'Dinas Kesehatan',
        alamat: 'Jl. Kesehatan No. 2',
        telepon: '0271-234567',
        email: 'dinkes@pemda.go.id',
        kepala: 'dr. Siti Rahayu, Sp.PK',
        isActive: true,
      },
      {
        kode: 'DISPAR',
        nama: 'Dinas Pariwisata',
        alamat: 'Jl. Wisata No. 3',
        telepon: '0271-345678',
        email: 'dispar@pemda.go.id',
        kepala: 'Ir. Ahmad Wijaya, M.M',
        isActive: true,
      },
    ]

    const createdOpd = await db.insert(opd).values(opdData).returning()
    console.log(`✅ Created ${createdOpd.length} OPD`)

    // 3. Create Sample Jenis Retribusi
    console.log('Creating sample jenis retribusi...')
    const jenisRetribusiData = [
      {
        kode: 'RET-001',
        nama: 'Retribusi Pelayanan Kesehatan',
        kategori: 'Jasa Umum',
        deskripsi: 'Retribusi atas pelayanan kesehatan di Puskesmas dan Rumah Sakit Daerah',
        dasar_hukum: 'Perda No. 1 Tahun 2023',
        isActive: true,
      },
      {
        kode: 'RET-002',
        nama: 'Retribusi Pelayanan Pendidikan',
        kategori: 'Jasa Umum',
        deskripsi: 'Retribusi atas pelayanan pendidikan di sekolah daerah',
        dasar_hukum: 'Perda No. 2 Tahun 2023',
        isActive: true,
      },
      {
        kode: 'RET-003',
        nama: 'Retribusi Tempat Wisata',
        kategori: 'Jasa Usaha',
        deskripsi: 'Retribusi masuk tempat wisata dan rekreasi',
        dasar_hukum: 'Perda No. 3 Tahun 2023',
        isActive: true,
      },
      {
        kode: 'RET-004',
        nama: 'Retribusi Parkir',
        kategori: 'Jasa Usaha',
        deskripsi: 'Retribusi parkir kendaraan di tempat khusus parkir',
        dasar_hukum: 'Perda No. 4 Tahun 2023',
        isActive: true,
      },
    ]

    const createdJenisRetribusi = await db
      .insert(jenisRetribusi)
      .values(jenisRetribusiData)
      .returning()

    console.log(`✅ Created ${createdJenisRetribusi.length} jenis retribusi`)

    // 4. Create Sample Operator Users
    console.log('Creating sample operator users...')
    const hashedOperatorPassword = await hashPassword('Operator123')

    const operatorData = [
      {
        username: 'operator.disdik',
        email: 'operator@disdik.go.id',
        password: hashedOperatorPassword,
        fullName: 'Operator Dinas Pendidikan',
        role: 'operator' as const,
        opdId: createdOpd[0].id,
        isActive: true,
      },
      {
        username: 'operator.dinkes',
        email: 'operator@dinkes.go.id',
        password: hashedOperatorPassword,
        fullName: 'Operator Dinas Kesehatan',
        role: 'operator' as const,
        opdId: createdOpd[1].id,
        isActive: true,
      },
      {
        username: 'operator.dispar',
        email: 'operator@dispar.go.id',
        password: hashedOperatorPassword,
        fullName: 'Operator Dinas Pariwisata',
        role: 'operator' as const,
        opdId: createdOpd[2].id,
        isActive: true,
      },
    ]

    const createdOperators = await db.insert(users).values(operatorData).returning()
    console.log(`✅ Created ${createdOperators.length} operator users`)

    // 5. Seed Default Settings
    console.log('Creating default settings...')
    const defaultSettings = [
      {
        key: 'nomor_laporan_format',
        value: 'LR/{TAHUN}/{NOMOR}',
        description: 'Format nomor laporan otomatis. Placeholder: {TAHUN}, {BULAN}, {NOMOR}',
      },
      {
        key: 'jenis_pemerintahan',
        value: 'PEMERINTAH KABUPATEN',
        description: 'Jenis pemerintahan yang tampil di PDF laporan',
      },
      {
        key: 'nama_pemerintahan',
        value: 'KABUPATEN',
        description: 'Nama pemerintahan yang tampil di PDF laporan',
      },
      {
        key: 'logo_kabupaten',
        value: '',
        description: 'Path logo kabupaten untuk PDF laporan',
      },
    ]

    for (const s of defaultSettings) {
      await db.insert(settings).values(s).onConflictDoNothing()
    }
    console.log(`✅ Created ${defaultSettings.length} default settings`)

    console.log('\n🎉 Database seed completed successfully!')
    console.log('\n📝 Login credentials:')
    console.log('Admin:')
    console.log('  Username: admin')
    console.log('  Password: Admin123')
    console.log('\nOperators:')
    console.log('  Username: operator.disdik / operator.dinkes / operator.dispar')
    console.log('  Password: Operator123')
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }

  process.exit(0)
}

seed()
