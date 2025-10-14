/**
 * Central Database Connection
 * Single source of truth for Azure PostgreSQL connection
 */

import { Pool } from 'pg';

// Create a single pool instance to be reused across the application
let pool = null;

/**
 * Get or create the database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
export function getPool() {
  if (!pool) {
    console.log('🔌 Creating new PostgreSQL connection pool...');
    pool = new Pool({
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { 
        rejectUnauthorized: false 
      },
      max: 5, // Reduced for serverless (Vercel has limited connections)
      idleTimeoutMillis: 10000, // Close idle clients after 10 seconds (serverless optimization)
      connectionTimeoutMillis: 10000, // Increased timeout for Azure
      allowExitOnIdle: true, // Allow pool to close when idle (important for serverless)
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('❌ Unexpected database pool error:', err);
      pool = null; // Reset pool on error
    });
    
    console.log('✅ PostgreSQL pool created');
  }

  return pool;
}

/**
 * Execute a database query
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params) {
  const pool = getPool();
  const client = await pool.connect();
  
  try {
    console.log('🔍 Executing query:', text.substring(0, 100) + '...');
    const result = await client.query(text, params);
    console.log('✅ Query successful, rows:', result.rows?.length || 0);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Audit logging helper for HIPAA compliance
 * @param {string} encounterId - Encounter ID
 * @param {string} actorId - User/clinician ID
 * @param {string} event - Event type (READ, WRITE, DELETE, etc.)
 */
export async function logAudit(encounterId, actorId, event) {
  try {
    await query(
      'INSERT INTO phi.audit_events (encounter_id, actor_id, event) VALUES ($1, $2, $3)',
      [encounterId, actorId, event]
    );
  } catch (error) {
    // Log audit failures but don't break the main operation
    console.error('Audit logging failed:', error);
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection success status
 */
export async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connected:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default {
  getPool,
  query,
  logAudit,
  testConnection
};
