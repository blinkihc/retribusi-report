/**
 * Backend API Testing Script
 *
 * Tests all master data endpoints
 */

const BASE_URL = 'http://localhost:5000'
let TOKEN = ''

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, useAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (useAuth && TOKEN) {
    headers['Authorization'] = `Bearer ${TOKEN}`
  }

  const options = {
    method,
    headers,
  }

  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const result = await response.json()
    return { status: response.status, data: result }
  } catch (error) {
    return { status: 0, error: error.message }
  }
}

// Test functions
async function testLogin() {
  console.log('\n🔐 TEST 1: Login')
  console.log('='.repeat(50))

  const result = await apiCall('POST', '/api/auth/login', {
    username: 'admin',
    password: 'Admin123',
    rememberMe: false,
  })

  console.log('Status:', result.status)
  console.log('Response:', JSON.stringify(result.data, null, 2))

  if (result.data.success && result.data.token) {
    TOKEN = result.data.token
    console.log('✅ Login berhasil! Token saved.')
    return true
  } else {
    console.log('❌ Login gagal!')
    return false
  }
}

async function testSeedOPD() {
  console.log('\n📦 TEST 2: Seed OPD Data')
  console.log('='.repeat(50))

  const result = await apiCall('POST', '/api/opd/seed', null, true)

  console.log('Status:', result.status)
  console.log('Response:', JSON.stringify(result.data, null, 2))

  if (result.data.success) {
    console.log('✅ Seed OPD berhasil!')
    return true
  } else {
    console.log('❌ Seed OPD gagal!')
    return false
  }
}

async function testGetOPD() {
  console.log('\n📋 TEST 3: Get OPD List')
  console.log('='.repeat(50))

  const result = await apiCall('GET', '/api/opd?page=1&limit=5', null, true)

  console.log('Status:', result.status)
  console.log('Total OPD:', result.data.pagination?.total || 0)
  console.log('Data (first 5):')
  result.data.data?.slice(0, 5).forEach((opd, i) => {
    console.log(`  ${i + 1}. ${opd.kode} - ${opd.nama}`)
  })

  if (result.data.success) {
    console.log('✅ Get OPD berhasil!')
    return true
  } else {
    console.log('❌ Get OPD gagal!')
    return false
  }
}

async function testSeedJenisRetribusi() {
  console.log('\n📦 TEST 4: Seed Jenis Retribusi Data')
  console.log('='.repeat(50))

  const result = await apiCall('POST', '/api/jenis-retribusi/seed', null, true)

  console.log('Status:', result.status)
  console.log('Response:', JSON.stringify(result.data, null, 2))

  if (result.data.success) {
    console.log('✅ Seed Jenis Retribusi berhasil!')
    return true
  } else {
    console.log('❌ Seed Jenis Retribusi gagal!')
    return false
  }
}

async function testGetJenisRetribusi() {
  console.log('\n📋 TEST 5: Get Jenis Retribusi List')
  console.log('='.repeat(50))

  const result = await apiCall('GET', '/api/jenis-retribusi?page=1&limit=5', null, true)

  console.log('Status:', result.status)
  console.log('Total Jenis Retribusi:', result.data.pagination?.total || 0)
  console.log('Data (first 5):')
  result.data.data?.slice(0, 5).forEach((jr, i) => {
    console.log(`  ${i + 1}. ${jr.kode} - ${jr.nama}`)
    console.log(`     Kategori: ${jr.kategori}`)
  })

  if (result.data.success) {
    console.log('✅ Get Jenis Retribusi berhasil!')
    return true
  } else {
    console.log('❌ Get Jenis Retribusi gagal!')
    return false
  }
}

async function testGetKategori() {
  console.log('\n📊 TEST 6: Get Kategori List')
  console.log('='.repeat(50))

  const result = await apiCall('GET', '/api/jenis-retribusi/kategori', null, true)

  console.log('Status:', result.status)
  console.log('Kategori:')
  result.data.data?.forEach((kat, i) => {
    console.log(`  ${i + 1}. ${kat}`)
  })

  if (result.data.success) {
    console.log('✅ Get Kategori berhasil!')
    return true
  } else {
    console.log('❌ Get Kategori gagal!')
    return false
  }
}

async function testCreateRelationship() {
  console.log('\n🔗 TEST 7: Create OPD-Pelayanan Relationship')
  console.log('='.repeat(50))

  // Get first OPD
  const opdResult = await apiCall('GET', '/api/opd?page=1&limit=1', null, true)
  const firstOpd = opdResult.data.data?.[0]

  // Get first Jenis Retribusi
  const jrResult = await apiCall('GET', '/api/jenis-retribusi?page=1&limit=1', null, true)
  const firstJr = jrResult.data.data?.[0]

  if (!firstOpd || !firstJr) {
    console.log('❌ Tidak ada data OPD atau Jenis Retribusi!')
    return false
  }

  console.log(`Menghubungkan: ${firstOpd.kode} → ${firstJr.nama}`)

  const result = await apiCall(
    'POST',
    '/api/opd-pelayanan',
    {
      kodeOpd: firstOpd.kode,
      namaJenisRetribusi: firstJr.nama,
    },
    true
  )

  console.log('Status:', result.status)
  console.log('Response:', JSON.stringify(result.data, null, 2))

  if (result.data.success || result.status === 400) {
    console.log('✅ Create relationship berhasil (atau sudah ada)!')
    return true
  } else {
    console.log('❌ Create relationship gagal!')
    return false
  }
}

async function testBulkAssign() {
  console.log('\n🔗 TEST 8: Bulk Assign OPD-Pelayanan')
  console.log('='.repeat(50))

  // Get first OPD
  const opdResult = await apiCall('GET', '/api/opd?page=1&limit=1', null, true)
  const firstOpd = opdResult.data.data?.[0]

  // Get first 3 Jenis Retribusi
  const jrResult = await apiCall('GET', '/api/jenis-retribusi?page=1&limit=3', null, true)
  const jenisRetribusiList = jrResult.data.data?.map((jr) => jr.nama) || []

  if (!firstOpd || jenisRetribusiList.length === 0) {
    console.log('❌ Tidak ada data OPD atau Jenis Retribusi!')
    return false
  }

  console.log(`Bulk assign untuk OPD: ${firstOpd.kode}`)
  console.log(`Jenis Retribusi: ${jenisRetribusiList.length} items`)

  const result = await apiCall(
    'POST',
    '/api/opd-pelayanan/bulk',
    {
      kodeOpd: firstOpd.kode,
      namaJenisRetribusiList: jenisRetribusiList,
    },
    true
  )

  console.log('Status:', result.status)
  console.log('Response:', JSON.stringify(result.data, null, 2))

  if (result.data.success) {
    console.log('✅ Bulk assign berhasil!')
    return true
  } else {
    console.log('❌ Bulk assign gagal!')
    return false
  }
}

async function testGetOPDPelayanan() {
  console.log('\n📋 TEST 9: Get OPD-Pelayanan Relationships')
  console.log('='.repeat(50))

  const result = await apiCall('GET', '/api/opd-pelayanan', null, true)

  console.log('Status:', result.status)
  console.log('Total Relationships:', result.data.data?.length || 0)
  console.log('Data (first 5):')
  result.data.data?.slice(0, 5).forEach((rel, i) => {
    console.log(`  ${i + 1}. ${rel.kodeOpd} → ${rel.namaJenisRetribusi}`)
  })

  if (result.data.success) {
    console.log('✅ Get relationships berhasil!')
    return true
  } else {
    console.log('❌ Get relationships gagal!')
    return false
  }
}

async function testGetPelayananByOPD() {
  console.log('\n📋 TEST 10: Get Pelayanan by OPD')
  console.log('='.repeat(50))

  // Get first OPD
  const opdResult = await apiCall('GET', '/api/opd?page=1&limit=1', null, true)
  const firstOpd = opdResult.data.data?.[0]

  if (!firstOpd) {
    console.log('❌ Tidak ada data OPD!')
    return false
  }

  const result = await apiCall('GET', `/api/opd-pelayanan/opd/${firstOpd.kode}`, null, true)

  console.log('Status:', result.status)
  console.log(`OPD: ${result.data.data?.opd?.nama || 'N/A'}`)
  console.log('Pelayanan:', result.data.data?.pelayanan?.length || 0)
  result.data.data?.pelayanan?.forEach((pel, i) => {
    console.log(`  ${i + 1}. ${pel.namaJenisRetribusi}`)
  })

  if (result.data.success) {
    console.log('✅ Get pelayanan by OPD berhasil!')
    return true
  } else {
    console.log('❌ Get pelayanan by OPD gagal!')
    return false
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 STARTING BACKEND API TESTS')
  console.log('='.repeat(50))
  console.log('Base URL:', BASE_URL)
  console.log('Time:', new Date().toISOString())

  const results = []

  // Test 1: Login
  results.push(await testLogin())
  if (!results[0]) {
    console.log('\n❌ Login gagal, tidak bisa lanjut testing!')
    return
  }

  // Test 2-3: OPD
  results.push(await testSeedOPD())
  results.push(await testGetOPD())

  // Test 4-6: Jenis Retribusi
  results.push(await testSeedJenisRetribusi())
  results.push(await testGetJenisRetribusi())
  results.push(await testGetKategori())

  // Test 7-10: OPD-Pelayanan
  results.push(await testCreateRelationship())
  results.push(await testBulkAssign())
  results.push(await testGetOPDPelayanan())
  results.push(await testGetPelayananByOPD())

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  const passed = results.filter((r) => r).length
  const total = results.length
  console.log(`✅ Passed: ${passed}/${total}`)
  console.log(`❌ Failed: ${total - passed}/${total}`)
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED!')
  }
}

// Run tests
runAllTests().catch(console.error)
