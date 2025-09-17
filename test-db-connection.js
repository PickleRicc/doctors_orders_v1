#!/usr/bin/env node

/**
 * Azure PostgreSQL Connection Test Script
 * 
 * This script tests the connection to your Azure PostgreSQL database
 * using the connection details from your environment variables.
 * 
 * Usage: node test-db-connection.js
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Azure PostgreSQL Connection...\n');

  // Connection configuration from environment variables
  const config = {
    host: process.env.PGHOST || 'do-phi-2025.postgres.database.azure.com',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'postgres',
    user: process.env.PGUSER || 'eric@clicklessai.com',
    password: process.env.PGPASSWORD,
    ssl: {
      rejectUnauthorized: false // Azure requires SSL but with flexible certificate validation
    }
  };

  console.log('📋 Connection Details:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${config.password ? '***hidden***' : '❌ NOT SET'}\n`);

  if (!config.password) {
    console.error('❌ ERROR: PGPASSWORD environment variable is not set!');
    console.log('💡 Add your password to .env.local file:');
    console.log('   PGPASSWORD=your_actual_password');
    process.exit(1);
  }

  const client = new Client(config);

  try {
    console.log('🔌 Attempting to connect...');
    await client.connect();
    console.log('✅ Successfully connected to Azure PostgreSQL!');

    // Test basic query
    console.log('\n🧪 Running test query...');
    const result = await client.query('SELECT version(), current_database(), current_user');
    
    console.log('✅ Query successful!');
    console.log('📊 Database Info:');
    console.log(`   Version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   User: ${result.rows[0].current_user}`);

    // Check if any tables exist
    console.log('\n📋 Checking existing tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📊 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('📝 No tables found (fresh database)');
    }

  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('🔍 Error details:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Possible solutions:');
      console.log('   - Check if the server name is correct');
      console.log('   - Verify your internet connection');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed:');
      console.log('   - Check your username and password');
      console.log('   - Ensure username format is: email@domain.com');
    } else if (error.code === '3D000') {
      console.log('\n💡 Database not found:');
      console.log('   - Check if database name is correct');
      console.log('   - Try using "postgres" as database name');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Connection closed.');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the test
testConnection()
  .then(() => {
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('✅ Your Azure PostgreSQL database is ready to use.');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  });
