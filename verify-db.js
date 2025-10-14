#!/usr/bin/env node

/**
 * Database Verification Script
 * Runs SQL queries to verify SOAP notes are being saved correctly
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runVerification() {
  console.log('🔍 VERIFYING AZURE DATABASE DATA\n');
  console.log('=' .repeat(60));
  console.log('\n');

  try {
    // 1. Total encounters
    console.log('📊 1. TOTAL ENCOUNTERS');
    console.log('-'.repeat(60));
    const totalResult = await pool.query(`
      SELECT 
        COUNT(*) as total_encounters,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'final' THEN 1 END) as final_count
      FROM phi.encounters
    `);
    console.log('Total Encounters:', totalResult.rows[0].total_encounters);
    console.log('Draft:', totalResult.rows[0].draft_count);
    console.log('Final:', totalResult.rows[0].final_count);
    console.log('\n');

    // 2. Recent encounters
    console.log('📋 2. RECENT ENCOUNTERS (Last 5)');
    console.log('-'.repeat(60));
    const recentResult = await pool.query(`
      SELECT 
        id,
        template_type,
        session_title,
        status,
        created_at,
        CASE WHEN soap IS NOT NULL THEN 'Yes' ELSE 'No' END as has_soap
      FROM phi.encounters
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (recentResult.rows.length === 0) {
      console.log('❌ No encounters found in database');
    } else {
      recentResult.rows.forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.session_title || 'Untitled'}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Template: ${row.template_type}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Has SOAP: ${row.has_soap}`);
        console.log(`   Created: ${new Date(row.created_at).toLocaleString()}`);
      });
    }
    console.log('\n');

    // 3. SOAP data structure
    console.log('🔬 3. SOAP DATA STRUCTURE (Most Recent)');
    console.log('-'.repeat(60));
    const soapResult = await pool.query(`
      SELECT 
        id,
        template_type,
        soap
      FROM phi.encounters
      WHERE soap IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (soapResult.rows.length > 0) {
      const encounter = soapResult.rows[0];
      console.log(`Encounter ID: ${encounter.id}`);
      console.log(`Template: ${encounter.template_type}`);
      console.log('\nSOAP Structure:');
      
      if (encounter.soap) {
        const soap = encounter.soap;
        console.log(`  ✓ Subjective: ${soap.subjective ? 'Present' : 'Missing'}`);
        console.log(`  ✓ Objective: ${soap.objective ? 'Present' : 'Missing'}`);
        console.log(`  ✓ Assessment: ${soap.assessment ? 'Present' : 'Missing'}`);
        console.log(`  ✓ Plan: ${soap.plan ? 'Present' : 'Missing'}`);
        
        // Show objective table rows
        if (soap.objective && soap.objective.rows) {
          console.log(`\n  Objective Table Rows: ${soap.objective.rows.length}`);
          if (soap.objective.rows.length > 0) {
            console.log('  Sample rows:');
            soap.objective.rows.slice(0, 3).forEach((row, i) => {
              console.log(`    ${i + 1}. ${row.test || row.measurement || 'N/A'}: ${row.result || 'N/A'}`);
            });
          }
        }
        
        // Show subjective preview
        if (soap.subjective && soap.subjective.content) {
          const preview = soap.subjective.content.substring(0, 100);
          console.log(`\n  Subjective Preview: ${preview}...`);
        }
      }
    } else {
      console.log('❌ No encounters with SOAP data found');
    }
    console.log('\n');

    // 4. Audit trail
    console.log('📝 4. AUDIT TRAIL (Last 5 Events)');
    console.log('-'.repeat(60));
    const auditResult = await pool.query(`
      SELECT 
        ae.event,
        ae.created_at,
        e.template_type,
        e.session_title
      FROM phi.audit_events ae
      LEFT JOIN phi.encounters e ON ae.encounter_id = e.id
      ORDER BY ae.created_at DESC
      LIMIT 5
    `);

    if (auditResult.rows.length === 0) {
      console.log('No audit events found');
    } else {
      auditResult.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.event} - ${row.template_type || 'N/A'} - ${new Date(row.created_at).toLocaleString()}`);
      });
    }
    console.log('\n');

    // 5. Template distribution
    console.log('📊 5. ENCOUNTERS BY TEMPLATE TYPE');
    console.log('-'.repeat(60));
    const templateResult = await pool.query(`
      SELECT 
        template_type,
        COUNT(*) as count
      FROM phi.encounters
      GROUP BY template_type
      ORDER BY count DESC
    `);

    if (templateResult.rows.length === 0) {
      console.log('No data');
    } else {
      templateResult.rows.forEach(row => {
        console.log(`${row.template_type}: ${row.count}`);
      });
    }
    console.log('\n');

    // 6. Full SOAP data sample
    console.log('📄 6. FULL SOAP DATA SAMPLE (Most Recent)');
    console.log('-'.repeat(60));
    const fullSoapResult = await pool.query(`
      SELECT 
        id,
        template_type,
        session_title,
        soap
      FROM phi.encounters
      WHERE soap IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (fullSoapResult.rows.length > 0) {
      const encounter = fullSoapResult.rows[0];
      console.log(`Session: ${encounter.session_title}`);
      console.log(`Template: ${encounter.template_type}`);
      console.log('\nFull SOAP Data:');
      console.log(JSON.stringify(encounter.soap, null, 2));
    } else {
      console.log('No SOAP data available');
    }
    console.log('\n');

    console.log('=' .repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nConnection Details:');
    console.error('Host:', process.env.PGHOST);
    console.error('Database:', process.env.PGDATABASE);
    console.error('User:', process.env.PGUSER);
  } finally {
    await pool.end();
  }
}

runVerification().catch(console.error);
