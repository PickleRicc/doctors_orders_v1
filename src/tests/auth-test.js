import authService from '../services/supabase';

/**
 * Test script for authentication methods
 * Run this file with Node.js to test the authentication methods
 */

// Configuration
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test123456!'; // Strong password for testing
const TEST_METADATA = { firstName: 'Test', lastName: 'User' };

// Helper to log results neatly
const logResult = (title, result) => {
  console.log('\n====================================');
  console.log(`📋 ${title}`);
  console.log('====================================');
  
  if (result.error) {
    console.log('❌ Error:', result.error.message);
    if (result.error.details) {
      console.log('Details:', result.error.details);
    }
  } else {
    console.log('✅ Success!');
    console.log('Result:', JSON.stringify(result, null, 2));
  }
};

// Test functions
const testSignUp = async () => {
  console.log('\n🔹 TESTING SIGN UP 🔹');
  const result = await authService.signUp(TEST_EMAIL, TEST_PASSWORD, TEST_METADATA);
  logResult('Sign Up Result', result);
  return result;
};

const testSignIn = async () => {
  console.log('\n🔹 TESTING SIGN IN 🔹');
  const result = await authService.signIn(TEST_EMAIL, TEST_PASSWORD);
  logResult('Sign In Result', result);
  return result;
};

const testGetCurrentUser = async () => {
  console.log('\n🔹 TESTING GET CURRENT USER 🔹');
  const result = await authService.getCurrentUser();
  logResult('Get Current User Result', result);
  return result;
};

const testGetSession = async () => {
  console.log('\n🔹 TESTING GET SESSION 🔹');
  const result = await authService.getSession();
  logResult('Get Session Result', result);
  return result;
};

const testSignOut = async () => {
  console.log('\n🔹 TESTING SIGN OUT 🔹');
  const result = await authService.signOut();
  logResult('Sign Out Result', result);
  return result;
};

const testResetPassword = async () => {
  console.log('\n🔹 TESTING PASSWORD RESET 🔹');
  const result = await authService.resetPassword(TEST_EMAIL);
  logResult('Reset Password Result', result);
  return result;
};

// Run tests
const runTests = async (testType) => {
  try {
    console.log('🟢 Starting authentication tests...');
    
    switch (testType) {
      case 'signup':
        await testSignUp();
        break;
      case 'signin':
        await testSignIn();
        break;
      case 'session':
        await testGetSession();
        break;
      case 'user':
        await testGetCurrentUser();
        break;
      case 'signout':
        await testSignOut();
        break;
      case 'reset':
        await testResetPassword();
        break;
      case 'flow': 
        // Test complete flow
        await testSignUp();
        await testSignIn();
        await testGetCurrentUser();
        await testGetSession();
        await testSignOut();
        break;
      default:
        console.log('Please specify a test type: signup, signin, session, user, signout, reset, flow');
    }
    
    console.log('\n🏁 Testing complete!');
  } catch (error) {
    console.error('🔴 Test failed with error:', error);
  }
};

// Get test type from command line argument
const testType = process.argv[2] || 'flow';
runTests(testType);

export { runTests };
