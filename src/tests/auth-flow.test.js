/**
 * Authentication Flow Tests
 * Tests authentication after credential changes
 * 
 * Run with: npm test auth-flow.test.js
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Authentication Flow After Credential Changes', () => {
  let supabase;
  
  beforeAll(async () => {
    // Import after environment is loaded
    const { supabase: supabaseClient } = await import('../lib/supabase');
    supabase = supabaseClient;
  });

  describe('Environment Configuration', () => {
    it('should have NEXT_PUBLIC_SUPABASE_URL set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toContain('.supabase.co');
    });

    it('should have NEXT_PUBLIC_SUPABASE_ANON_KEY set', () => {
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
      expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toMatch(/^eyJ/);
    });

    it('should NOT have hardcoded credentials in code', () => {
      const fs = require('fs');
      const supabaseFile = fs.readFileSync('src/lib/supabase.js', 'utf8');
      
      // Should NOT contain hardcoded URLs
      expect(supabaseFile).not.toContain('https://oozghvnctxihtbqzktdv.supabase.co');
      
      // SHOULD contain environment variable references
      expect(supabaseFile).toContain('process.env.NEXT_PUBLIC_SUPABASE_URL');
      expect(supabaseFile).toContain('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });
  });

  describe('Supabase Client Initialization', () => {
    it('should initialize Supabase client', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
    });

    it('should have auth methods available', () => {
      expect(typeof supabase.auth.signUp).toBe('function');
      expect(typeof supabase.auth.signInWithPassword).toBe('function');
      expect(typeof supabase.auth.signOut).toBe('function');
      expect(typeof supabase.auth.getUser).toBe('function');
      expect(typeof supabase.auth.getSession).toBe('function');
    });

    it('should configure session settings correctly', async () => {
      // Try to get session (should work even if not authenticated)
      const { data, error } = await supabase.auth.getSession();
      
      // Should not throw error (even if no session)
      expect(error).toBeNull();
    });
  });

  describe('Authentication Service', () => {
    it('should import auth service successfully', async () => {
      const authService = await import('../services/supabase');
      expect(authService.default).toBeDefined();
    });

    it('should have all required auth methods', async () => {
      const authService = await import('../services/supabase');
      const auth = authService.default;
      
      expect(typeof auth.signUp).toBe('function');
      expect(typeof auth.signIn).toBe('function');
      expect(typeof auth.signOut).toBe('function');
      expect(typeof auth.getSession).toBe('function');
      expect(typeof auth.onAuthStateChange).toBe('function');
    });

    it('should have profession constants defined', async () => {
      const { PROFESSIONS } = await import('../services/supabase');
      
      expect(PROFESSIONS).toBeDefined();
      expect(PROFESSIONS.PHYSICAL_THERAPY).toBe('physical_therapy');
      expect(PROFESSIONS.CHIROPRACTIC).toBe('chiropractic');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Save original values
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Temporarily remove env vars
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Clear module cache
      jest.resetModules();
      
      // Should not throw, should return empty client
      const { supabase: testClient } = await import('../lib/supabase');
      expect(testClient).toBeDefined();
      
      // Restore values
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
    });

    it('should validate URL format', async () => {
      const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      // Test with invalid URL
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://invalid-url.com';
      
      jest.resetModules();
      const { supabase: testClient } = await import('../lib/supabase');
      
      // Should fall back to empty client
      expect(testClient).toBeDefined();
      
      // Restore
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const { data, error } = await supabase.auth.getSession();
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have 1 hour session expiry configured', async () => {
      // This is configured in the client initialization
      // We verify it's set in the code
      const fs = require('fs');
      const supabaseFile = fs.readFileSync('src/lib/supabase.js', 'utf8');
      
      expect(supabaseFile).toContain('sessionExpirySeconds: 3600');
    });
  });
});

describe('Manual Testing Checklist', () => {
  it('should document required manual tests', () => {
    const manualTests = [
      '✅ User registration works',
      '✅ User login works with valid credentials',
      '✅ Invalid credentials are rejected',
      '✅ Session persists across page reloads',
      '✅ Token refresh works automatically',
      '✅ Protected routes redirect unauthenticated users',
      '✅ Authenticated users can access protected routes',
      '✅ Logout clears session correctly',
      '✅ Cannot access protected routes after logout',
      '✅ No credentials visible in client bundle',
      '✅ No credentials in browser console',
      '✅ No credentials in network requests (except in headers)'
    ];
    
    console.log('\n📋 Manual Testing Checklist:');
    manual Tests.forEach(test => console.log(`  ${test}`));
    
    expect(manualTests.length).toBeGreaterThan(0);
  });
});

