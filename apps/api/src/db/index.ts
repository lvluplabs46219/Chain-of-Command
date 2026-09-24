/**
 * Database Connection
 * 
 * This module provides the database connection for the API server.
 * It connects to Supabase and provides Drizzle ORM access.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../../packages/database/schema/sic-audit';
import * as chainSchema from '../../../../packages/database/schema/chain-of-command';

// Get database connection string from environment
// FAIL FAST: Require DATABASE_URL to be explicitly configured
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required - refusing to start with default credentials');
}

// Create connection pool with proper TLS verification
const pool = new Pool({
  connectionString: DATABASE_URL,
  // In production, properly verify TLS certificates to prevent MITM attacks
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

// Create Drizzle instance with all schemas
export const db = drizzle(pool, {
  schema: { ...schema, ...chainSchema },
});

export * from 'drizzle-orm';
export { pool };

export default db;
