import React, { useState, useEffect } from 'react';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import SOAPEditor from '../soap/SOAPEditor';
import exportService from '../../services/exportService';
import { createAIService } from '../../services/structuredAI';
import { initializeAI, isAIInitialized } from '../../services/aiClient';

/**
 * Test Mode Component for Template Hook System
 * 
 * This component provides a comprehensive testing interface for the new template hook system.
 * It includes sample transcripts for each body region and allows testing the complete flow:
 * 1. Template selection
 * 2. AI SOAP generation from transcript
 * 3. SOAP editing interface
 * 4. Export functionality
 * 
 * Use this to verify the new system works before running final database migrations.
 */

// Sample test transcripts for each template type
const TEST_TRANSCRIPTS = {
  knee: `
Patient is a 35-year-old recreational runner who reports right knee pain that started 3 weeks ago after increasing mileage. 
Pain is located on the medial aspect of the knee, rated 6 out of 10 during activity, 2 out of 10 at rest. 
Pain worsens with running, stairs, and prolonged sitting. No swelling or locking reported.

On examination, patient ambulates with slight antalgic gait favoring right leg. 
Right knee shows mild swelling compared to left. Range of motion is 5 to 135 degrees, limited by pain at end range flexion.
McMurray test negative bilaterally. Valgus stress test shows mild laxity at 30 degrees flexion.
Patellar apprehension test negative. Single leg squat shows knee valgus on right.

Strength testing shows 4/5 hip abductors, 4+/5 quadriceps, 5/5 hamstrings.
Patient demonstrates poor single leg balance on right, lasting only 8 seconds compared to 25 seconds on left.

Assessment is medial knee pain likely related to patellofemoral dysfunction and hip weakness.
Plan includes strengthening program focusing on hip abductors and quadriceps, activity modification, 
and follow-up in 2 weeks to assess progress.
  `,
  
  shoulder: `
Patient is a 42-year-old office worker presenting with right shoulder pain for 6 weeks.
Pain started gradually without specific injury, located in anterior and lateral shoulder.
Pain is 7 out of 10 with overhead activities, 3 out of 10 at rest.
Reports difficulty reaching overhead and behind back. Sleep is disrupted when lying on right side.

Observation shows forward head posture and rounded shoulders bilaterally.
Active range of motion: flexion 120 degrees, abduction 110 degrees, external rotation 45 degrees, internal rotation to L3.
Passive range of motion gains 10-15 degrees in all planes.
Hawkins-Kennedy test positive, Neer impingement sign positive, Empty can test positive.
Apprehension test negative, sulcus sign negative.

Strength testing shows 4-/5 external rotators, 4/5 middle trapezius, 3+/5 lower trapezius.
Scapular dyskinesis present with winging during arm elevation.

Assessment is shoulder impingement syndrome with scapular dyskinesis.
Plan includes manual therapy for joint mobility, strengthening program for rotator cuff and scapular stabilizers,
posture education, and activity modification. Follow-up in 3 weeks.
  `,
  
  back: `
Patient is a 28-year-old construction worker with acute low back pain for 5 days.
Pain started when lifting heavy materials at work. Located in central lumbar region with radiation to right buttock.
Pain is 8 out of 10 with movement, 5 out of 10 at rest. Sitting and forward bending worsen symptoms.

Patient presents with antalgic gait and lateral shift to left. 
Lumbar flexion limited to 30 degrees, extension limited to 10 degrees, both limited by pain.
Side bending right reproduces leg symptoms. Straight leg raise positive at 45 degrees on right.
Neurological screening shows intact reflexes, 5/5 strength throughout, sensation intact.

Lumbar spring test reproduces central pain. Hip flexor length test shows bilateral tightness.
Core stability testing reveals poor endurance with modified plank lasting only 15 seconds.

Assessment is acute lumbar strain with possible disc involvement and core weakness.
Plan includes pain management with ice and positioning, gentle mobility exercises,
core stabilization program progression, and work modification. Return to work assessment in 1 week.
  `,
  
  neck: `
Patient is a 45-year-old computer programmer with neck pain and headaches for 3 weeks.
Pain located in posterior neck and suboccipital region, rated 6 out of 10.
Headaches occur daily, described as tension-type. Symptoms worsen with prolonged computer work.

Posture assessment shows forward head posture and upper crossed syndrome pattern.
Cervical range of motion: flexion 35 degrees, extension 45 degrees, rotation 60 degrees bilaterally.
Upper cervical flexion test shows poor deep neck flexor endurance at 12 seconds.
Spurling test negative bilaterally, distraction test provides relief.

Palpation reveals trigger points in upper trapezius, levator scapulae, and suboccipitals bilaterally.
Muscle length testing shows short upper trapezius and levator scapulae.
Strength testing reveals 4-/5 deep neck flexors, 4/5 middle and lower trapezius.

Assessment is cervical dysfunction with postural syndrome and myofascial trigger points.
Plan includes manual therapy for joint mobility, trigger point release, postural correction exercises,
ergonomic assessment, and strengthening program. Follow-up in 2 weeks.
  `,
  
  hip: `
Patient is a 55-year-old avid golfer presenting with right hip pain for 8 weeks.
Pain is located in anterior hip and groin, rated 7 out of 10 with activity, 2 out of 10 at rest.
Pain worsens with golf swing, getting out of car, and prolonged walking.
Reports morning stiffness lasting 20 minutes.

Gait analysis shows shortened stride length on right and slight Trendelenburg sign.
Hip range of motion: flexion 95 degrees, extension -5 degrees, internal rotation 20 degrees, external rotation 35 degrees.
FABER test positive on right reproducing groin pain. FADIR test positive.
Thomas test shows hip flexor tightness bilaterally.

Strength testing reveals 4-/5 hip abductors, 4/5 hip extensors, 4+/5 hip flexors.
Single leg stance shows poor balance control on right lasting 8 seconds.
Functional squat shows limited depth with hip hiking on right.

Assessment is hip impingement syndrome with hip flexor tightness and weakness.
Plan includes hip mobilization, stretching program for hip flexors, strengthening for hip abductors and extensors,
activity modification for golf, and follow-up in 3 weeks.
  `,
  
  ankle_foot: `
Patient is a 30-year-old marathon runner with right ankle pain for 4 weeks.
Pain started gradually during training, located on lateral aspect of ankle.
Pain is 5 out of 10 with running, 1 out of 10 at rest. Reports feeling of instability.
History of ankle sprain 6 months ago that was not properly rehabilitated.

Observation shows mild swelling on lateral ankle. Gait shows slight inversion during stance phase.
Ankle range of motion: dorsiflexion 5 degrees, plantarflexion 40 degrees, inversion 25 degrees, eversion 15 degrees.
Anterior drawer test shows moderate laxity, talar tilt test positive.
Single leg balance test shows poor control lasting only 5 seconds on right vs 30 seconds on left.

Strength testing reveals 4-/5 peroneals, 4/5 tibialis posterior, 5/5 gastrocnemius.
Functional hop test shows 85% compared to left leg.
Running analysis shows excessive pronation and delayed peroneal activation.

Assessment is chronic ankle instability with peroneal weakness and proprioceptive deficits.
Plan includes proprioceptive training, peroneal strengthening, ankle mobilization,
running gait retraining, and gradual return to running program. Follow-up in 2 weeks.
  `
};

export const TemplateTestMode = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('knee');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSOAP, setGeneratedSOAP] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const [aiInitialized, setAiInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  // Initialize AI service on component mount
  useEffect(() => {
    const initializeAIService = () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        
        if (!apiKey) {
          throw new Error('OpenAI API key not found. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.');
        }

        if (!isAIInitialized()) {
          initializeAI(apiKey);
          console.log('✅ AI service initialized for test mode');
        }
        
        setAiInitialized(true);
        setInitError(null);
      } catch (error) {
        console.error('❌ Failed to initialize AI service:', error);
        setInitError(error.message);
        setAiInitialized(false);
      }
    };

    initializeAIService();
  }, []);

  // Create AI service instance
  const aiService = createAIService();

  const { 
    currentTemplate, 
    switchTemplate, 
    generateSOAP,
    getAvailableTemplates 
  } = useTemplateManager();

  // Test AI generation for selected template
  const testGeneration = async () => {
    if (!aiInitialized) {
      setTestResults({
        success: false,
        error: 'AI service not initialized. Please check your API key configuration.',
        templateUsed: selectedTemplate
      });
      return;
    }

    setIsGenerating(true);
    setTestResults({});
    
    try {
      const startTime = Date.now();
      
      // Switch to selected template
      await switchTemplate(selectedTemplate);
      
      // Generate SOAP from test transcript
      const transcript = TEST_TRANSCRIPTS[selectedTemplate];
      const result = await generateSOAP(transcript, aiService);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setGeneratedSOAP(result);
      setTestResults({
        success: true,
        duration: `${duration}ms`,
        templateUsed: selectedTemplate,
        confidenceScores: result.confidence || {},
        dataStructure: Object.keys(result.soapData || {}).length > 0
      });
      
      setShowEditor(true);
      
    } catch (error) {
      console.error('Test generation failed:', error);
      setTestResults({
        success: false,
        error: error.message,
        templateUsed: selectedTemplate
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Test export functionality
  const testExport = async (format) => {
    if (!generatedSOAP) return;
    
    try {
      if (format === 'pdf') {
        await exportService.exportToPDF(generatedSOAP.soapData, `test-${selectedTemplate}-soap`);
      } else if (format === 'clipboard') {
        await exportService.copyToClipboard(generatedSOAP.soapData);
        alert('SOAP note copied to clipboard!');
      }
    } catch (error) {
      console.error(`Export ${format} failed:`, error);
      alert(`Export ${format} failed: ${error.message}`);
    }
  };

  // Run comprehensive test suite
  const runFullTestSuite = async () => {
    const results = {};
    
    for (const templateType of Object.keys(TEST_TRANSCRIPTS)) {
      try {
        console.log(`Testing ${templateType} template...`);
        
        await switchTemplate(templateType);
        const transcript = TEST_TRANSCRIPTS[templateType];
        const startTime = Date.now();
        const result = await generateSOAP(transcript, aiService);
        const endTime = Date.now();
        
        results[templateType] = {
          success: true,
          duration: endTime - startTime,
          hasStructuredData: !!result.soapData,
          confidenceScores: result.confidence || {}
        };
        
      } catch (error) {
        results[templateType] = {
          success: false,
          error: error.message
        };
      }
    }
    
    setTestResults(results);
    console.log('Full test suite results:', results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-grey-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg">
          <h1 className="text-3xl font-light text-grey-900 mb-2">
            🧪 Template Hook System Test Mode
          </h1>
          <p className="text-grey-600">
            Test the new template hook system with sample transcripts before running final migrations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Test Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg">
            <h2 className="text-xl font-medium text-grey-900 mb-4">Test Controls</h2>
            
            {/* AI Status Indicator */}
            <div className="mb-6 p-3 rounded-8 border">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${aiInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  AI Service: {aiInitialized ? 'Ready' : 'Not Ready'}
                </span>
              </div>
              {initError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-6">
                  <strong>Error:</strong> {initError}
                  <br />
                  <span className="text-red-500">
                    Add your OpenAI API key to .env.local file:
                    <br />
                    <code className="bg-red-100 px-1 rounded text-xs">
                      NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key-here
                    </code>
                  </span>
                </div>
              )}
              {aiInitialized && (
                <div className="text-xs text-green-600">
                  ✅ OpenAI API key configured correctly
                </div>
              )}
            </div>
            
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Select Template to Test
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-white/18 backdrop-blur-12 border border-white/20 rounded-8 text-grey-900"
              >
                {Object.keys(TEST_TRANSCRIPTS).map(template => (
                  <option key={template} value={template}>
                    {template.charAt(0).toUpperCase() + template.slice(1)} Evaluation
                  </option>
                ))}
              </select>
            </div>

            {/* Test Buttons */}
            <div className="space-y-3">
              <button
                onClick={testGeneration}
                disabled={isGenerating || !aiInitialized}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-primary to-blue-600 text-white rounded-8 font-medium hover:shadow-lg transform hover:translateY(-1px) transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '🔄 Generating...' : !aiInitialized ? '⚠️ AI Not Ready' : '🚀 Test AI Generation'}
              </button>
              
              <button
                onClick={runFullTestSuite}
                disabled={!aiInitialized}
                className="w-full px-4 py-2 bg-white/18 backdrop-blur-12 border border-white/20 text-grey-700 rounded-8 hover:bg-white/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!aiInitialized ? '⚠️ AI Required' : '🧪 Run Full Test Suite'}
              </button>
            </div>

            {/* Export Tests */}
            {generatedSOAP && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="text-sm font-medium text-grey-700 mb-3">Test Export Functions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => testExport('pdf')}
                    className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-6 text-sm hover:bg-red-100 transition-colors"
                  >
                    📄 Test PDF Export
                  </button>
                  <button
                    onClick={() => testExport('clipboard')}
                    className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-6 text-sm hover:bg-green-100 transition-colors"
                  >
                    📋 Test Clipboard Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="mt-6 bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg">
              <h3 className="text-lg font-medium text-grey-900 mb-4">Test Results</h3>
              
              {testResults.success !== undefined ? (
                // Single test result
                <div className={`p-4 rounded-8 ${testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">
                      {testResults.success ? '✅' : '❌'}
                    </span>
                    <span className={`font-medium ${testResults.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResults.success ? 'Test Passed' : 'Test Failed'}
                    </span>
                  </div>
                  
                  {testResults.success && (
                    <div className="text-sm text-green-700 space-y-1">
                      <p>⏱️ Duration: {testResults.duration}</p>
                      <p>📋 Template: {testResults.templateUsed}</p>
                      <p>📊 Structured Data: {testResults.dataStructure ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  
                  {testResults.error && (
                    <p className="text-sm text-red-700 mt-2">
                      Error: {testResults.error}
                    </p>
                  )}
                </div>
              ) : (
                // Full test suite results
                <div className="space-y-3">
                  {Object.entries(testResults).map(([template, result]) => (
                    <div key={template} className={`p-3 rounded-6 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{template}</span>
                        <span>{result.success ? '✅' : '❌'}</span>
                      </div>
                      {result.success && (
                        <div className="text-xs text-green-600 mt-1">
                          {result.duration}ms
                        </div>
                      )}
                      {result.error && (
                        <div className="text-xs text-red-600 mt-1">
                          {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sample Transcript */}
        <div className="lg:col-span-1">
          <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg">
            <h3 className="text-lg font-medium text-grey-900 mb-4">
              Sample Transcript: {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
            </h3>
            <div className="bg-grey-50/50 rounded-8 p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-grey-700 whitespace-pre-wrap font-mono">
                {TEST_TRANSCRIPTS[selectedTemplate]}
              </pre>
            </div>
          </div>
        </div>

        {/* SOAP Editor */}
        <div className="lg:col-span-1">
          {showEditor && generatedSOAP ? (
            <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg">
              <h3 className="text-lg font-medium text-grey-900 mb-4">Generated SOAP Note</h3>
              <div className="max-h-96 overflow-y-auto">
                <SOAPEditor
                  soapData={generatedSOAP.soapData}
                  onSoapChange={(data) => console.log('SOAP changed:', data)}
                  onSave={(data) => console.log('SOAP saved:', data)}
                  onExport={(data, format) => console.log('SOAP exported:', format)}
                  confidenceScores={generatedSOAP.confidence}
                  isLoading={false}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/25 backdrop-blur-16 border border-white/20 rounded-16 p-6 shadow-lg flex items-center justify-center min-h-96">
              <div className="text-center text-grey-500">
                <div className="text-4xl mb-4">📝</div>
                <p>Generated SOAP note will appear here</p>
                <p className="text-sm mt-2">Click "Test AI Generation" to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
