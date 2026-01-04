/**
 * Test Helpers for HIPAA Security Implementation
 * Utilities for testing security features safely
 */

/**
 * Test authentication flow
 * @returns {Promise<Object>} Test results
 */
export async function testAuthenticationFlow() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Test 1: Can access Supabase client
    results.tests.push({
      name: 'Supabase Client Initialization',
      status: 'pending'
    });

    // Test 2: Environment variables present
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    results.tests.push({
      name: 'Environment Variables',
      status: (hasSupabaseUrl && hasSupabaseKey) ? 'passed' : 'failed',
      details: {
        hasSupabaseUrl,
        hasSupabaseKey
      }
    });

    if (hasSupabaseUrl && hasSupabaseKey) {
      results.passed++;
    } else {
      results.failed++;
      results.errors.push('Missing Supabase environment variables');
    }

  } catch (error) {
    results.errors.push(error.message);
    results.failed++;
  }

  return results;
}

/**
 * Test database connectivity
 * @returns {Promise<Object>} Test results
 */
export async function testDatabaseConnection() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    errors: []
  };

  try {
    // Test PostgreSQL environment variables
    const hasPgHost = !!process.env.PGHOST;
    const hasPgUser = !!process.env.PGUSER;
    const hasPgPassword = !!process.env.PGPASSWORD;
    const hasPgDatabase = !!process.env.PGDATABASE;

    results.tests.push({
      name: 'PostgreSQL Environment Variables',
      status: (hasPgHost && hasPgUser && hasPgPassword && hasPgDatabase) ? 'passed' : 'failed',
      details: {
        hasPgHost,
        hasPgUser,
        hasPgPassword: hasPgPassword ? 'present' : 'missing',
        hasPgDatabase
      }
    });

    if (hasPgHost && hasPgUser && hasPgPassword && hasPgDatabase) {
      results.passed++;
    } else {
      results.failed++;
      results.errors.push('Missing PostgreSQL environment variables');
    }

  } catch (error) {
    results.errors.push(error.message);
    results.failed++;
  }

  return results;
}

/**
 * Test API endpoints
 * @param {string} baseUrl - Base URL for API
 * @returns {Promise<Object>} Test results
 */
export async function testAPIEndpoints(baseUrl = '') {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    errors: []
  };

  const endpoints = [
    { path: '/api/health', method: 'GET', expected: 200 },
    { path: '/api/phi/encounters', method: 'GET', expected: [200, 401] }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method
      });

      const passed = Array.isArray(endpoint.expected)
        ? endpoint.expected.includes(response.status)
        : response.status === endpoint.expected;

      results.tests.push({
        name: `${endpoint.method} ${endpoint.path}`,
        status: passed ? 'passed' : 'failed',
        details: {
          expectedStatus: endpoint.expected,
          actualStatus: response.status
        }
      });

      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.tests.push({
        name: `${endpoint.method} ${endpoint.path}`,
        status: 'failed',
        error: error.message
      });
      results.failed++;
      results.errors.push(`${endpoint.path}: ${error.message}`);
    }
  }

  return results;
}

/**
 * Validate no hardcoded credentials in client bundle
 * @returns {Object} Validation results
 */
export function validateNoHardcodedCredentials() {
  const warnings = [];
  const errors = [];

  // Check if credentials are coming from environment
  if (typeof window !== 'undefined') {
    // Client-side check
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      const content = script.innerHTML;
      
      // Check for common patterns of exposed credentials
      if (content.includes('supabase.co') && content.includes('eyJ')) {
        errors.push('Potential hardcoded Supabase credentials found in client bundle');
      }
      
      if (content.includes('sk-') || content.includes('openai')) {
        warnings.push('Potential OpenAI API key pattern detected');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate test report
 * @param {Array<Object>} testResults - Array of test result objects
 * @returns {string} Formatted report
 */
export function generateTestReport(testResults) {
  let report = '\n=== HIPAA Security Test Report ===\n\n';
  
  for (const result of testResults) {
    report += `Test Suite: ${result.name || 'Unnamed'}\n`;
    report += `Timestamp: ${result.timestamp}\n`;
    report += `Passed: ${result.passed} | Failed: ${result.failed}\n`;
    
    if (result.errors && result.errors.length > 0) {
      report += `\nErrors:\n`;
      result.errors.forEach(error => {
        report += `  - ${error}\n`;
      });
    }
    
    report += '\n';
  }
  
  return report;
}

export default {
  testAuthenticationFlow,
  testDatabaseConnection,
  testAPIEndpoints,
  validateNoHardcodedCredentials,
  generateTestReport
};

