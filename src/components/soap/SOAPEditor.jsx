/**
 * SOAP Editor Component
 * Enhanced, wider editing experience for SOAP notes with session name input
 * Combines WYSIWYG editors and interactive tables in a single scroll flow
 * Follows glassmorphism design system with Notion-inspired UX
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Download, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import WYSIWYGEditor from './WYSIWYGEditor';
import ObjectiveTable from './ObjectiveTable';
import GoalsList from './GoalsList';
import InterventionsList from './InterventionsList';

const SOAPEditor = ({ 
  soapData, 
  onSoapChange, 
  onSave, 
  onExport,
  isLoading = false,
  confidenceScores = {},
  className = '',
  sessionName = '',
  onSessionNameChange
}) => {
  const [activeSection, setActiveSection] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error, copied, exported
  const [localSessionName, setLocalSessionName] = useState(sessionName || '');

  // Log received SOAP data for debugging
  useEffect(() => {
    console.log('📋 SOAPEditor received data:', {
      hasData: !!soapData,
      dataKeys: soapData ? Object.keys(soapData) : [],
      subjective: soapData?.subjective,
      objective: soapData?.objective,
      objectiveType: typeof soapData?.objective,
      objectiveKeys: soapData?.objective ? Object.keys(soapData.objective) : [],
      assessment: soapData?.assessment,
      plan: soapData?.plan,
      fullData: JSON.stringify(soapData).substring(0, 500)
    });
  }, [soapData]);

  // Handle data changes and mark as unsaved
  const handleSectionChange = (sectionType, newData) => {
    const updatedSOAP = {
      ...soapData,
      [sectionType]: newData
    };
    
    onSoapChange(updatedSOAP);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges && !localSessionName) return;
    
    setSaveStatus('saving');
    try {
      const sessionData = {
        ...soapData,
        sessionName: localSessionName || 'Untitled Session'
      };
      await onSave(sessionData);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Update parent with session name
      if (onSessionNameChange) {
        onSessionNameChange(localSessionName);
      }
      
      // Reset saved status after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  };

  const handleSessionNameChange = (newName) => {
    setLocalSessionName(newName);
    setHasUnsavedChanges(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      const soapText = formatSOAPForText(soapData);
      await navigator.clipboard.writeText(soapText);
      
      // Show success feedback
      setSaveStatus('copied');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handlePDFExport = async () => {
    try {
      // Use browser's print dialog for PDF export (works with all browsers)
      const printWindow = window.open('', '_blank');
      const soapText = formatSOAPForText(soapData);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${localSessionName || 'SOAP Note'}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              h1 { font-size: 24px; margin-bottom: 10px; }
              h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
              p { line-height: 1.6; white-space: pre-wrap; }
              .date { color: #666; font-size: 14px; margin-bottom: 30px; }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <h1>${localSessionName || 'SOAP Note'}</h1>
            <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap;">${soapText}</pre>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      // Show success feedback
      setSaveStatus('exported');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('PDF export failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleExport = async (format) => {
    try {
      if (format === 'pdf') {
        await handlePDFExport();
      } else if (format === 'copy') {
        await handleCopyToClipboard();
      } else {
        await onExport(soapData, format);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Helper functions
  const formatSOAPForText = (soap) => {
    let text = `
${localSessionName || 'SOAP Note'}
Generated: ${new Date().toLocaleDateString()}

SUBJECTIVE:
${soap.subjective?.content?.replace(/<[^>]*>/g, '') || 'No subjective data'}

OBJECTIVE:
${formatObjectiveForText(soap.objective)}

ASSESSMENT:
${formatAssessmentForText(soap.assessment)}

PLAN:
${formatPlanForText(soap.plan)}`;

    // Add billing if it exists
    if (soap.billing) {
      text += `\n\nBILLING:
${formatBillingForText(soap.billing)}`;
    }

    return text.trim();
  };

  const formatObjectiveForText = (objective) => {
    if (!objective) return 'No objective data';
    
    // Handle categorized structure
    if (objective.categories && Array.isArray(objective.categories)) {
      let text = '';
      objective.categories.forEach(category => {
        if (category.rows && category.rows.length > 0) {
          text += `\n${category.name}:\n`;
          category.rows.forEach(row => {
            const result = row.result || 'Not assessed';
            const notes = row.notes ? ` - ${row.notes}` : '';
            text += `  ${row.test}: ${result}${notes}\n`;
          });
        }
      });
      return text || 'No objective data';
    }
    
    // Fallback for old flat structure
    if (objective.rows && Array.isArray(objective.rows)) {
      let text = '';
      objective.rows.forEach(row => {
        const result = row.result || 'Not assessed';
        const notes = row.notes ? ` - ${row.notes}` : '';
        text += `${row.test}: ${result}${notes}\n`;
      });
      return text || 'No objective data';
    }
    
    return 'No objective data';
  };

  const formatObjectiveForPDF = (objective) => {
    if (!objective) return 'No objective data';
    
    // Handle categorized structure
    if (objective.categories && Array.isArray(objective.categories)) {
      let text = '';
      objective.categories.forEach(category => {
        if (category.rows && category.rows.length > 0) {
          text += `\n${category.name}:\n`;
          category.rows.forEach(row => {
            const result = row.result || 'Not assessed';
            const notes = row.notes ? ` - ${row.notes}` : '';
            text += `  ${row.test}: ${result}${notes}\n`;
          });
        }
      });
      return text || 'No objective data';
    }
    
    // Fallback for old flat structure
    if (objective.rows && Array.isArray(objective.rows)) {
      let text = '';
      objective.rows.forEach(row => {
        const result = row.result || 'Not assessed';
        const notes = row.notes ? ` - ${row.notes}` : '';
        text += `${row.test}: ${result}${notes}\n`;
      });
      return text || 'No objective data';
    }
    
    return 'No objective data';
  };

  const formatAssessmentForText = (assessment) => {
    if (!assessment) return 'No assessment data';
    
    let text = '';
    
    // Clinical Impression
    if (assessment.clinical_impression?.content) {
      text += 'Clinical Impression:\n';
      text += assessment.clinical_impression.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    // Medical Necessity
    if (assessment.medical_necessity?.content) {
      text += 'Medical Necessity:\n';
      text += assessment.medical_necessity.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    // Short-term Goals
    if (assessment.short_term_goals?.items && assessment.short_term_goals.items.length > 0) {
      text += 'Short-term Goals (2-4 weeks):\n';
      assessment.short_term_goals.items.forEach(goal => {
        text += `  • ${goal}\n`;
      });
      text += '\n';
    }
    
    // Long-term Goals
    if (assessment.long_term_goals?.items && assessment.long_term_goals.items.length > 0) {
      text += 'Long-term Goals (6-12 weeks):\n';
      assessment.long_term_goals.items.forEach(goal => {
        text += `  • ${goal}\n`;
      });
    }
    
    return text.trim() || 'No assessment data';
  };

  const formatPlanForText = (plan) => {
    if (!plan) return 'No plan data';
    
    let text = '';
    
    // Interventions
    if (plan.interventions?.items && plan.interventions.items.length > 0) {
      text += 'Interventions:\n';
      plan.interventions.items.forEach(item => {
        text += `  • ${item}\n`;
      });
      text += '\n';
    }
    
    // Progressions
    if (plan.progressions?.items && plan.progressions.items.length > 0) {
      text += 'Progressions:\n';
      plan.progressions.items.forEach(item => {
        text += `  • ${item}\n`;
      });
      text += '\n';
    }
    
    // Regressions
    if (plan.regressions?.items && plan.regressions.items.length > 0) {
      text += 'Regressions:\n';
      plan.regressions.items.forEach(item => {
        text += `  • ${item}\n`;
      });
      text += '\n';
    }
    
    // Frequency/Duration
    if (plan.frequency_duration?.content) {
      text += 'Frequency/Duration:\n';
      text += plan.frequency_duration.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    // Patient Education
    if (plan.patient_education?.content) {
      text += 'Patient Education:\n';
      text += plan.patient_education.content.replace(/<[^>]*>/g, '');
    }
    
    return text.trim() || 'No plan data';
  };

  const formatBillingForText = (billing) => {
    if (!billing) return 'No billing data';
    
    let text = '';
    
    // CPT Codes
    if (billing.cpt_codes?.items && billing.cpt_codes.items.length > 0) {
      text += 'CPT Codes:\n';
      billing.cpt_codes.items.forEach(code => {
        text += `  • ${code}\n`;
      });
      text += '\n';
    }
    
    // Units
    if (billing.units?.content) {
      text += 'Time Units:\n';
      text += billing.units.content.replace(/<[^>]*>/g, '') + '\n\n';
    }
    
    // ICD-10 Codes
    if (billing.icd10_codes?.items && billing.icd10_codes.items.length > 0) {
      text += 'ICD-10 Diagnosis Codes:\n';
      billing.icd10_codes.items.forEach(code => {
        text += `  • ${code}\n`;
      });
    }
    
    return text.trim() || 'No billing data';
  };

  const getSectionIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (confidence >= 0.6) return <CheckCircle2 className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    focused: { scale: 1.01, transition: { duration: 0.2 } }
  };

  return (
    <div className={`soap-editor max-w-7xl mx-auto ${className}`}>
      {/* Header with Session Name and Actions */}
      <motion.div 
        className="mb-8 bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-6 shadow-lg transition-colors"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Session Name Input */}
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-grey-700 dark:text-grey-300 mb-2">
              Session Name
              <span className="text-xs text-grey-500 dark:text-grey-400 block mt-1">
                Use a memorable name (no patient details)
              </span>
            </label>
            <input
              type="text"
              value={localSessionName}
              onChange={(e) => handleSessionNameChange(e.target.value)}
              placeholder="e.g., Knee eval session 1, Shoulder follow-up..."
              className="w-full px-4 py-3 bg-white dark:bg-[#1f1f1f] border border-grey-200 dark:border-white/15 rounded-xl 
                         text-grey-900 dark:text-grey-100 placeholder-grey-500 dark:placeholder-grey-400 focus:outline-none transition-all"
              onFocus={(e) => {
                e.target.style.borderColor = 'rgb(var(--blue-primary-rgb))';
                e.target.style.boxShadow = `0 0 0 3px rgba(var(--blue-primary-rgb), 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '';
                e.target.style.boxShadow = '';
              }}
            />
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-4">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(var(--blue-primary-rgb))' }} />
                  <span className="text-sm text-grey-600 dark:text-grey-400">Saving...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-grey-600 dark:text-grey-400">Saved</span>
                </>
              )}
              {saveStatus === 'copied' && (
                <>
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'rgb(var(--blue-primary-rgb))' }} />
                  <span className="text-sm text-grey-600 dark:text-grey-400">Copied!</span>
                </>
              )}
              {saveStatus === 'exported' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-grey-600 dark:text-grey-400">PDF Downloaded!</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-grey-600 dark:text-grey-400">Error</span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={(!hasUnsavedChanges && !localSessionName) || saveStatus === 'saving'}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl 
                           transition-all duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
              >
                <Save className="w-4 h-4" />
                Save Note
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl 
                           transition-all duration-200 shadow-lg hover:shadow-xl font-medium hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
              
              <button
                onClick={handlePDFExport}
                className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl 
                           transition-all duration-200 shadow-lg hover:shadow-xl font-medium hover:opacity-90"
                style={{ backgroundColor: 'rgb(var(--blue-primary-rgb))' }}
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main SOAP Content - Wider Layout */}
      <div className="px-6 py-8 space-y-8">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-8 flex items-center gap-4 transition-colors">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgb(var(--blue-primary-rgb))' }} />
                <span className="text-lg font-medium text-grey-900 dark:text-grey-100">Generating SOAP note...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subjective Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          whileHover="focused"
          className={`soap-section ${activeSection === 'subjective' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100">Subjective</h2>
              {confidenceScores.subjective && getSectionIcon(confidenceScores.subjective)}
            </div>
            {confidenceScores.subjective && (
              <div className="text-sm text-grey-500 dark:text-grey-400">
                Confidence: {Math.round(confidenceScores.subjective * 100)}%
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-6 transition-colors">
            <WYSIWYGEditor
              content={soapData.subjective?.content || ''}
              placeholder={soapData.subjective?.placeholder || 'Patient history, pain description, functional limitations...'}
              onChange={(content) => handleSectionChange('subjective', { ...soapData.subjective, content })}
              onFocus={() => setActiveSection('subjective')}
              onBlur={() => setActiveSection(null)}
            />
          </div>
        </motion.section>

        {/* Objective Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          whileHover="focused"
          className={`soap-section ${activeSection === 'objective' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100">Objective</h2>
              {confidenceScores.objective && getSectionIcon(confidenceScores.objective)}
            </div>
            {confidenceScores.objective && (
              <div className="text-sm text-grey-500 dark:text-grey-400">
                Confidence: {Math.round(confidenceScores.objective * 100)}%
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-6 transition-colors">
            <ObjectiveTable
              data={soapData.objective || { headers: [], rows: [] }}
              onChange={(objectiveData) => {
                console.log('📝 Objective changed:', objectiveData);
                handleSectionChange('objective', objectiveData);
              }}
              onFocus={() => setActiveSection('objective')}
              onBlur={() => setActiveSection(null)}
            />
          </div>
        </motion.section>

        {/* Assessment Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          whileHover="focused"
          className={`soap-section ${activeSection === 'assessment' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100">Assessment</h2>
              {confidenceScores.assessment && getSectionIcon(confidenceScores.assessment)}
            </div>
            {confidenceScores.assessment && (
              <div className="text-sm text-grey-500 dark:text-grey-400">
                Confidence: {Math.round(confidenceScores.assessment * 100)}%
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-6 space-y-6 transition-colors">
            {/* Check if assessment has the new structure (with goals) or old structure (just content) */}
            {soapData.assessment?.clinical_impression !== undefined ? (
              // New structure with goals
              <>
                {/* Clinical Impression */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Clinical Impression</h3>
                  <WYSIWYGEditor
                    content={soapData.assessment.clinical_impression?.content || ''}
                    placeholder="Clinical reasoning, diagnosis, contributing factors, prognosis..."
                    onChange={(content) => handleSectionChange('assessment', {
                      ...soapData.assessment,
                      clinical_impression: { ...soapData.assessment.clinical_impression, content }
                    })}
                    onFocus={() => setActiveSection('assessment')}
                    onBlur={() => setActiveSection(null)}
                  />
                </div>

                {/* Medical Necessity */}
                {soapData.assessment.medical_necessity !== undefined && (
                  <div>
                    <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Medical Necessity</h3>
                    <WYSIWYGEditor
                      content={soapData.assessment.medical_necessity?.content || ''}
                      placeholder="Why PT is needed: functional limitations, safety concerns, impact on ADLs..."
                      onChange={(content) => handleSectionChange('assessment', {
                        ...soapData.assessment,
                        medical_necessity: { ...soapData.assessment.medical_necessity, content }
                      })}
                      onFocus={() => setActiveSection('assessment')}
                      onBlur={() => setActiveSection(null)}
                    />
                  </div>
                )}

                {/* Short Term Goals */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Short Term Goals (2-4 weeks)</h3>
                  <GoalsList
                    goals={soapData.assessment.short_term_goals?.items || []}
                    placeholder="e.g., Reduce pain to 3/10, Improve ROM to 120°"
                    onChange={(items) => handleSectionChange('assessment', {
                      ...soapData.assessment,
                      short_term_goals: { ...soapData.assessment.short_term_goals, items }
                    })}
                  />
                </div>

                {/* Long Term Goals */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Long Term Goals (6-12 weeks)</h3>
                  <GoalsList
                    goals={soapData.assessment.long_term_goals?.items || []}
                    placeholder="e.g., Return to sport, Independent with HEP"
                    onChange={(items) => handleSectionChange('assessment', {
                      ...soapData.assessment,
                      long_term_goals: { ...soapData.assessment.long_term_goals, items }
                    })}
                  />
                </div>
              </>
            ) : (
              // Old structure (backward compatibility)
              <WYSIWYGEditor
                content={soapData.assessment?.content || ''}
                placeholder={soapData.assessment?.placeholder || 'Clinical impression, diagnosis, prognosis...'}
                onChange={(content) => handleSectionChange('assessment', { ...soapData.assessment, content })}
                onFocus={() => setActiveSection('assessment')}
                onBlur={() => setActiveSection(null)}
              />
            )}
          </div>
        </motion.section>

        {/* Plan Section */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          whileHover="focused"
          className={`soap-section ${activeSection === 'plan' ? 'active' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100">Plan</h2>
              {confidenceScores.plan && getSectionIcon(confidenceScores.plan)}
            </div>
            {confidenceScores.plan && (
              <div className="text-sm text-grey-500 dark:text-grey-400">
                Confidence: {Math.round(confidenceScores.plan * 100)}%
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-6 space-y-6 transition-colors">
            {/* Check if plan has the new structure (with interventions) or old structure (just content) */}
            {soapData.plan?.interventions !== undefined ? (
              // New structure with interventions, progressions, regressions
              <>
                {/* Interventions */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Interventions</h3>
                  <InterventionsList
                    items={soapData.plan.interventions?.items || []}
                    placeholder="e.g., Patellar mobilizations, Quad strengthening"
                    emptyMessage="No interventions added yet."
                    onChange={(items) => handleSectionChange('plan', {
                      ...soapData.plan,
                      interventions: { ...soapData.plan.interventions, items }
                    })}
                  />
                </div>

                {/* Progressions */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Progressions</h3>
                  <InterventionsList
                    items={soapData.plan.progressions?.items || []}
                    placeholder="e.g., Increase resistance, progress to single leg"
                    emptyMessage="No progressions added yet."
                    onChange={(items) => handleSectionChange('plan', {
                      ...soapData.plan,
                      progressions: { ...soapData.plan.progressions, items }
                    })}
                  />
                </div>

                {/* Regressions */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Regressions</h3>
                  <InterventionsList
                    items={soapData.plan.regressions?.items || []}
                    placeholder="e.g., Reduce ROM if pain increases"
                    emptyMessage="No regressions added yet."
                    onChange={(items) => handleSectionChange('plan', {
                      ...soapData.plan,
                      regressions: { ...soapData.plan.regressions, items }
                    })}
                  />
                </div>

                {/* Frequency & Duration */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Frequency & Duration</h3>
                  <WYSIWYGEditor
                    content={soapData.plan.frequency_duration?.content || ''}
                    placeholder="Treatment frequency, session duration, expected timeline..."
                    onChange={(content) => handleSectionChange('plan', {
                      ...soapData.plan,
                      frequency_duration: { ...soapData.plan.frequency_duration, content }
                    })}
                    onFocus={() => setActiveSection('plan')}
                    onBlur={() => setActiveSection(null)}
                  />
                </div>

                {/* Patient Education */}
                <div>
                  <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Patient Education</h3>
                  <WYSIWYGEditor
                    content={soapData.plan.patient_education?.content || ''}
                    placeholder="Home exercise program, activity modifications, precautions..."
                    onChange={(content) => handleSectionChange('plan', {
                      ...soapData.plan,
                      patient_education: { ...soapData.plan.patient_education, content }
                    })}
                    onFocus={() => setActiveSection('plan')}
                    onBlur={() => setActiveSection(null)}
                  />
                </div>
              </>
            ) : (
              // Old structure (backward compatibility)
              <WYSIWYGEditor
                content={soapData.plan?.content || ''}
                placeholder={soapData.plan?.placeholder || 'Treatment plan, goals, frequency, patient education...'}
                onChange={(content) => handleSectionChange('plan', { ...soapData.plan, content })}
                onFocus={() => setActiveSection('plan')}
                onBlur={() => setActiveSection(null)}
              />
            )}
          </div>
        </motion.section>

        {/* Billing Section */}
        {soapData.billing && (
          <motion.section
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            whileHover="focused"
            className={`soap-section ${activeSection === 'billing' ? 'active' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100">Billing</h2>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#1a1a1a] border border-grey-200 dark:border-white/10 rounded-2xl p-6 space-y-6 transition-colors">
              {/* CPT Codes */}
              <div>
                <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">CPT Codes</h3>
                <InterventionsList
                  items={soapData.billing.cpt_codes?.items || []}
                  placeholder="e.g., 97110 - Therapeutic Exercise"
                  emptyMessage="No CPT codes added yet."
                  onChange={(items) => handleSectionChange('billing', {
                    ...soapData.billing,
                    cpt_codes: { ...soapData.billing.cpt_codes, items }
                  })}
                />
              </div>

              {/* Units */}
              <div>
                <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">Time Units</h3>
                <WYSIWYGEditor
                  content={soapData.billing.units?.content || ''}
                  placeholder="Time-based units (1 unit = 15 minutes). Example: 97110 (2 units, 30 min)"
                  onChange={(content) => handleSectionChange('billing', {
                    ...soapData.billing,
                    units: { ...soapData.billing.units, content }
                  })}
                  onFocus={() => setActiveSection('billing')}
                  onBlur={() => setActiveSection(null)}
                />
              </div>

              {/* ICD-10 Codes */}
              <div>
                <h3 className="text-lg font-medium text-grey-900 dark:text-grey-100 mb-3">ICD-10 Diagnosis Codes</h3>
                <InterventionsList
                  items={soapData.billing.icd10_codes?.items || []}
                  placeholder="e.g., M25.561 - Pain in right knee"
                  emptyMessage="No ICD-10 codes added yet."
                  onChange={(items) => handleSectionChange('billing', {
                    ...soapData.billing,
                    icd10_codes: { ...soapData.billing.icd10_codes, items }
                  })}
                />
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default SOAPEditor;
