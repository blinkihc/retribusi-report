/**
 * Insert Default Settings
 * Run this script to add default settings to database
 */

import { sql } from 'drizzle-orm'
import fs from 'fs'
import { db } from '../src/lib/db/index.js'

async function insertDefaultSettings() {
  try {
    console.log('📝 Inserting default settings...')

    const migration = fs.readFileSync('./migrations/0004_insert_default_settings.sql', 'utf-8')
    await db.execute(sql.raw(migration))

    console.log('✅ Default settings inserted successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error inserting settings:', error)
    process.exit(1)
  }
}

insertDefaultSettings()
