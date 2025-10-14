/**
 * Database Connection Test Endpoint
 * GET /api/phi/test-db
 */

import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envCheck = {
      PGHOST: !!process.env.PGHOST,
      PGUSER: !!process.env.PGUSER,
      PGPASSWORD: !!process.env.PGPASSWORD,
      PGDATABASE: !!process.env.PGDATABASE,
      PGPORT: !!process.env.PGPORT
    };

    console.log('🔍 Environment variables check:', envCheck);

    if (!process.env.PGHOST || !process.env.PGUSER || !process.env.PGPASSWORD) {
      return res.status(500).json({
        success: false,
        error: 'Missing database environment variables',
        envCheck,
        config: {
          host: process.env.PGHOST || 'NOT SET',
          user: process.env.PGUSER || 'NOT SET',
          database: process.env.PGDATABASE || 'NOT SET',
          port: process.env.PGPORT || 'NOT SET'
        }
      });
    }

    // Test basic query
    const timeResult = await query('SELECT NOW() as current_time, current_database() as database');
    
    // Check if phi schema exists
    const schemaCheck = await query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'phi'
    `);
    
    // Check if encounters table exists
    const tableCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'phi' 
      AND table_name = 'encounters'
    `);

    // Count encounters
    let encounterCount = 0;
    try {
      const countResult = await query('SELECT COUNT(*) as count FROM phi.encounters');
      encounterCount = parseInt(countResult.rows[0].count);
    } catch (e) {
      console.error('Error counting encounters:', e);
    }

    return res.status(200).json({
      success: true,
      message: 'Database connection successful! ✅',
      data: {
        currentTime: timeResult.rows[0].current_time,
        database: timeResult.rows[0].database,
        phiSchemaExists: schemaCheck.rows.length > 0,
        encountersTableExists: tableCheck.rows.length > 0,
        encounterCount,
        config: {
          host: process.env.PGHOST,
          user: process.env.PGUSER,
          database: process.env.PGDATABASE,
          port: process.env.PGPORT
        }
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      details: error.stack
    });
  }
}
