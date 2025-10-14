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
    pool = new Pool({
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { 
        rejectUnauthorized: false 
      },
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
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
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
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
