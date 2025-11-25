/**
 * Database Client Configuration
 *
 * Changes:
 * - Drizzle ORM client setup with PostgreSQL
 * - Connection pooling configuration
 * - Export db instance and schema
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection string from environment
const connectionString = process.env.DATABASE_URL!

// Create postgres client with connection pooling
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
})

// Create Drizzle ORM instance
export const db = drizzle(client, { schema })

// Export schema for use in queries
export { schema }

// Export types
export type Database = typeof db
