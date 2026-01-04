/**
 * Health Check Endpoint
 * Used for testing and monitoring
 */

import { testConnection } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      api: true,
      database: false,
      supabase: false
    }
  };

  // Test database connection
  try {
    const dbConnected = await testConnection();
    health.checks.database = dbConnected;
  } catch (error) {
    health.checks.database = false;
    health.errors = health.errors || [];
    health.errors.push(`Database: ${error.message}`);
  }

  // Test Supabase configuration
  try {
    health.checks.supabase = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  } catch (error) {
    health.checks.supabase = false;
  }

  // Determine overall status
  const allChecksPass = Object.values(health.checks).every(check => check === true);
  health.status = allChecksPass ? 'healthy' : 'degraded';

  const statusCode = allChecksPass ? 200 : 503;
  return res.status(statusCode).json(health);
}

