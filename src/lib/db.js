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
        rejectUnauthorized: process.env.ENABLE_SSL_VALIDATION === 'true' ? true : false
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
 * Enhanced with IP address, user agent, and change tracking
 * @param {string} encounterId - Encounter ID
 * @param {string} actorId - User/clinician ID
 * @param {string} event - Event type (CREATE, READ, UPDATE, DELETE, etc.)
 * @param {Object} metadata - Additional audit data (ipAddress, userAgent, changes, resource)
 */
export async function logAudit(encounterId, actorId, event, metadata = {}) {
  try {
    const {
      ipAddress = null,
      userAgent = null,
      changes = null,
      resource = 'encounter'
    } = metadata;

    await query(
      `INSERT INTO phi.audit_events 
       (encounter_id, actor_id, event, ip_address, user_agent, changes, resource) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        encounterId, 
        actorId, 
        event,
        ipAddress,
        userAgent,
        changes ? JSON.stringify(changes) : null,
        resource
      ]
    );
    console.log(`✅ Audit: ${event} by ${actorId} on ${resource} ${encounterId || ''}`);
  } catch (error) {
    // Log audit failures but don't break the main operation
    console.error('❌ Audit logging failed:', error.message);
    // In production, this should trigger an alert
  }
}

/**
 * Helper to extract audit metadata from HTTP request
 * @param {Object} req - Next.js API request object
 * @returns {Object} Audit metadata (ipAddress, userAgent)
 */
export function getAuditMetadata(req) {
  return {
    ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               req.socket?.remoteAddress ||
               'unknown',
    userAgent: req.headers['user-agent'] || 'unknown'
  };
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
  getAuditMetadata,
  testConnection
};
