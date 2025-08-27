/**
 * Template Hook System Test Runner
 * 
 * This utility provides programmatic testing of the new template hook system.
 * Use this to verify all templates work correctly before running final migrations.
 */

import { TEMPLATE_REGISTRY } from '../hooks/templates';
import { structuredAI } from '../services/structuredAI';

// Test transcripts for each template type
const TEST_TRANSCRIPTS = {
  knee: `Patient reports right knee pain for 3 weeks after increasing running mileage. Pain is 6/10 with activity, 2/10 at rest. Located medially, worsens with stairs. Examination shows mild swelling, ROM 5-135 degrees, McMurray negative, valgus stress shows mild laxity. Strength shows 4/5 hip abductors, 4+/5 quads. Assessment: patellofemoral dysfunction with hip weakness. Plan: strengthening program, activity modification.`,
  
  shoulder: `42-year-old with 6 weeks right shoulder pain, 7/10 overhead, 3/10 rest. Forward head posture noted. ROM: flexion 120, abduction 110, ER 45 degrees. Hawkins positive, Neer positive, empty can positive. Strength: 4-/5 ER, scapular winging present. Assessment: impingement syndrome with scapular dyskinesis. Plan: manual therapy, strengthening, posture education.`,
  
  back: `28-year-old construction worker with 5 days acute low back pain after lifting. 8/10 with movement, 5/10 rest. Central lumbar with right buttock radiation. Antalgic gait, lateral shift left. Flexion 30 degrees, SLR positive 45 degrees right. Assessment: acute lumbar strain with possible disc involvement. Plan: pain management, gentle mobility, core stabilization.`,
  
  neck: `45-year-old programmer with 3 weeks neck pain and headaches, 6/10. Forward head posture, ROM limited. Upper cervical flexion test 12 seconds. Trigger points in upper traps, levator scapulae. Assessment: cervical dysfunction with postural syndrome. Plan: manual therapy, trigger point release, postural correction.`,
  
  hip: `55-year-old golfer with 8 weeks right hip pain, 7/10 activity, 2/10 rest. Anterior hip/groin pain with golf swing. ROM: flexion 95, extension -5, IR 20 degrees. FABER positive, FADIR positive. Strength: 4-/5 abductors. Assessment: hip impingement with flexor tightness. Plan: mobilization, stretching, strengthening.`,
  
  ankle_foot: `30-year-old runner with 4 weeks right ankle pain, 5/10 running, lateral aspect. History of sprain 6 months ago. Mild lateral swelling, ROM: DF 5 degrees. Anterior drawer positive, single leg balance 5 seconds. Strength: 4-/5 peroneals. Assessment: chronic ankle instability. Plan: proprioceptive training, strengthening.`
};

/**
 * Test individual template hook
 */
export async function testTemplateHook(templateType) {
  console.log(`🧪 Testing ${templateType} template hook...`);
  
  try {
    // Get template hook
    const TemplateHook = TEMPLATE_REGISTRY[templateType];
    if (!TemplateHook) {
      throw new Error(`Template hook not found for type: ${templateType}`);
    }
    
    // Initialize template (simulate React hook usage)
    const template = new TemplateHook();
    
    // Test transcript
    const transcript = TEST_TRANSCRIPTS[templateType];
    if (!transcript) {
      throw new Error(`Test transcript not found for type: ${templateType}`);
    }
    
    // Test AI generation
    const startTime = Date.now();
    const result = await template.generateFromTranscript(transcript);
    const endTime = Date.now();
    
    // Validate result structure
    const validation = template.validateSOAPData(result.soapData);
    
    return {
      templateType,
      success: true,
      duration: endTime - startTime,
      hasStructuredData: !!result.soapData,
      validation: validation.isValid,
      validationErrors: validation.errors,
      confidence: result.confidence || {},
      sampleData: {
        subjective: result.soapData?.subjective?.substring(0, 100) + '...',
        objectiveTests: Array.isArray(result.soapData?.objective?.tests) ? result.soapData.objective.tests.length : 0
      }
    };
    
  } catch (error) {
    console.error(`❌ ${templateType} test failed:`, error);
    return {
      templateType,
      success: false,
      error: error.message,
      duration: 0
    };
  }
}

/**
 * Run comprehensive test suite for all templates
 */
export async function runFullTestSuite() {
  console.log('🚀 Starting comprehensive template hook test suite...');
  
  const results = {};
  const templateTypes = Object.keys(TEST_TRANSCRIPTS);
  
  for (const templateType of templateTypes) {
    results[templateType] = await testTemplateHook(templateType);
    
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate summary
  const summary = {
    totalTests: templateTypes.length,
    passed: Object.values(results).filter(r => r.success).length,
    failed: Object.values(results).filter(r => !r.success).length,
    averageDuration: Object.values(results)
      .filter(r => r.success)
      .reduce((sum, r) => sum + r.duration, 0) / Object.values(results).filter(r => r.success).length,
    results
  };
  
  console.log('📊 Test Suite Summary:', summary);
  return summary;
}

/**
 * Test AI service directly
 */
export async function testAIService() {
  console.log('🤖 Testing AI service...');
  
  try {
    const testPrompt = "Generate a simple test response in JSON format with a 'message' field.";
    const result = await structuredAI.generateCompletion(testPrompt);
    
    return {
      success: true,
      hasResponse: !!result,
      canParseJSON: typeof result === 'object'
    };
    
  } catch (error) {
    console.error('❌ AI service test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test export functionality
 */
export async function testExportService() {
  console.log('📄 Testing export service...');
  
  try {
    // Import export service
    const { exportService } = await import('../services/exportService');
    
    // Test data
    const testSOAPData = {
      subjective: "Test subjective data",
      objective: {
        tests: [
          { name: "Test 1", result: "Positive" },
          { name: "Test 2", result: "Negative" }
        ]
      },
      assessment: "Test assessment",
      plan: "Test plan"
    };
    
    // Test text export
    const textExport = exportService.exportToText(testSOAPData);
    
    return {
      success: true,
      hasTextExport: !!textExport && textExport.length > 0,
      textLength: textExport?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Export service test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run all system tests
 */
export async function runSystemTests() {
  console.log('🔧 Running complete system tests...');
  
  const results = {
    timestamp: new Date().toISOString(),
    aiService: await testAIService(),
    exportService: await testExportService(),
    templateHooks: await runFullTestSuite()
  };
  
  // Overall system health
  results.systemHealth = {
    aiWorking: results.aiService.success,
    exportWorking: results.exportService.success,
    templatesWorking: results.templateHooks.passed === results.templateHooks.totalTests,
    overallStatus: results.aiService.success && 
                   results.exportService.success && 
                   results.templateHooks.passed === results.templateHooks.totalTests ? 'HEALTHY' : 'ISSUES_DETECTED'
  };
  
  console.log('🎯 System Test Results:', results);
  return results;
}

// Export for use in components or direct testing
export default {
  testTemplateHook,
  runFullTestSuite,
  testAIService,
  testExportService,
  runSystemTests,
  TEST_TRANSCRIPTS
};
