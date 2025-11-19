/**
 * TemplateSelector - Template selection buttons
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, User, Heart, Zap, Footprints, Wind, Loader2, Calendar, CheckCircle, Sparkles, FileText, Star } from 'lucide-react';
import { useAppState, APP_STATES } from './StateManager';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import { useCustomTemplates } from '../../hooks/useCustomTemplates';
import { createAIService } from '../../services/structuredAI';
import { sampleTranscriptions } from '../../utils/testData';
import { authenticatedFetch } from '../../lib/authHeaders';

import GenerationProgress from '../recording/GenerationProgress';
import SpotlightCard from '../ui/SpotlightCard';

const TEMPLATES = [
  // Universal Templates
  { id: 'daily-note', name: 'Daily Note', icon: Calendar, description: 'Routine follow-up', category: 'universal' },
  { id: 'discharge', name: 'Discharge', icon: CheckCircle, description: 'Final visit', category: 'universal' },

  // Body-Part Specific Templates
  { id: 'knee', name: 'Knee', icon: Activity, description: 'Lower extremity', category: 'bodyPart' },
  { id: 'shoulder', name: 'Shoulder', icon: User, description: 'Upper extremity', category: 'bodyPart' },
  { id: 'back', name: 'Back', icon: Heart, description: 'Spine & posture', category: 'bodyPart' },
  { id: 'hip', name: 'Hip', icon: Zap, description: 'Hip joint', category: 'bodyPart' },
  { id: 'ankle-foot', name: 'Ankle/Foot', icon: Footprints, description: 'Foot & ankle', category: 'bodyPart' },
  { id: 'neck', name: 'Neck', icon: Wind, description: 'Cervical spine', category: 'bodyPart' }
];

// Using CSS variable for blue-primary instead of hardcoded value

export default function TemplateSelector() {
  const { appState, selectedTemplate, selectTemplate, finishProcessing } = useAppState();
  const [generatingTemplateId, setGeneratingTemplateId] = useState(null);

  // Initialize all template managers at component level
  const kneeManager = useTemplateManager('knee');
  const dailyNoteManager = useTemplateManager('daily-note');
  const dischargeManager = useTemplateManager('discharge');

  // Fetch custom templates
  const { templates: customTemplates, loading: loadingCustomTemplates } = useCustomTemplates();
  const [testingCustomTemplateId, setTestingCustomTemplateId] = useState(null);

  if (appState !== APP_STATES.IDLE && appState !== APP_STATES.TEMPLATE_SELECTED) {
    return null;
  }

  // Show generation progress when generating
  if (generatingTemplateId) {
    return (
      <GenerationProgress
        onComplete={() => {
          // Component will handle its own cleanup
        }}
      />
    );
  }

  const handleTestMode = async () => {
    setGeneratingTemplateId('knee');

    try {
      console.log('🧪 Generating test SOAP note with template manager...');

      // Get test transcript
      const transcript = sampleTranscriptions.knee_evaluation;
      console.log('📄 Using test transcript:', transcript.substring(0, 200) + '...');

      // Create AI service
      const aiService = createAIService();

      // Use template manager to generate SOAP (this uses the proper template structure)
      console.log('🤖 Calling templateManager.generateSOAP...');
      const soapResult = await kneeManager.generateSOAP(transcript, aiService);

      if (!soapResult.success) {
        throw new Error(soapResult.error || 'SOAP generation failed');
      }

      console.log('✅ SOAP generated successfully:', soapResult.data);

      // Save to Azure PostgreSQL
      console.log('💾 Saving to Azure database...');
      const saveResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'POST',
        body: JSON.stringify({
          templateType: 'knee',
          sessionTitle: 'AI Generated Knee Evaluation'
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save encounter to database');
      }

      const encounter = await saveResponse.json();

      // Now update it with the SOAP data
      const updateResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'PUT',
        body: JSON.stringify({
          id: encounter.id,
          soap: soapResult.data,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update encounter with SOAP data');
      }

      const updatedEncounter = await updateResponse.json();

      console.log('📋 Encounter saved to Azure:', updatedEncounter);
      finishProcessing(updatedEncounter);

    } catch (error) {
      console.error('❌ Failed to generate SOAP note:', error);
      alert(`Failed to generate SOAP note: ${error.message}\n\nMake sure you have set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.`);
    } finally {
      setGeneratingTemplateId(null);
    }
  };

  const handleTestDailyNote = async () => {
    setGeneratingTemplateId('daily-note');

    try {
      console.log('📅 Generating Daily Note with sample data...');

      const transcript = sampleTranscriptions.daily_note;

      if (!transcript) {
        throw new Error('Daily note test transcript not found in test data');
      }

      console.log('📄 Using daily note transcript:', transcript.substring(0, 150) + '...');

      const aiService = createAIService();
      const soapResult = await dailyNoteManager.generateSOAP(transcript, aiService);

      if (!soapResult.success) {
        throw new Error(soapResult.error || 'Daily Note generation failed');
      }

      const saveResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'POST',
        body: JSON.stringify({
          templateType: 'daily-note',
          sessionTitle: 'AI Generated Daily Note'
        })
      });

      if (!saveResponse.ok) throw new Error('Failed to save encounter');

      const encounter = await saveResponse.json();

      const updateResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'PUT',
        body: JSON.stringify({
          id: encounter.id,
          soap: soapResult.data,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) throw new Error('Failed to update encounter');

      const updatedEncounter = await updateResponse.json();
      finishProcessing(updatedEncounter);

    } catch (error) {
      console.error('❌ Failed to generate Daily Note:', error);
      alert(`Failed to generate Daily Note: ${error.message}`);
    } finally {
      setGeneratingTemplateId(null);
    }
  };

  const handleTestDischarge = async () => {
    setGeneratingTemplateId('discharge');

    try {
      console.log('✅ Generating Discharge Note with sample data...');

      const transcript = sampleTranscriptions.discharge_note;

      if (!transcript) {
        throw new Error('Discharge note test transcript not found in test data');
      }

      console.log('📄 Using discharge note transcript:', transcript.substring(0, 150) + '...');

      const aiService = createAIService();
      const soapResult = await dischargeManager.generateSOAP(transcript, aiService);

      if (!soapResult.success) {
        throw new Error(soapResult.error || 'Discharge Note generation failed');
      }

      const saveResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'POST',
        body: JSON.stringify({
          templateType: 'discharge',
          sessionTitle: 'AI Generated Discharge Note'
        })
      });

      if (!saveResponse.ok) throw new Error('Failed to save encounter');

      const encounter = await saveResponse.json();

      const updateResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'PUT',
        body: JSON.stringify({
          id: encounter.id,
          soap: soapResult.data,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) throw new Error('Failed to update encounter');

      const updatedEncounter = await updateResponse.json();
      finishProcessing(updatedEncounter);

    } catch (error) {
      console.error('❌ Failed to generate Discharge Note:', error);
      alert(`Failed to generate Discharge Note: ${error.message}`);
    } finally {
      setGeneratingTemplateId(null);
    }
  };

  const handleTestCustomTemplate = async (customTemplateId, customTemplate) => {
    setTestingCustomTemplateId(customTemplateId);
    setGeneratingTemplateId(`custom-${customTemplateId}`);

    try {
      console.log('🧪 Generating SOAP with custom template...');

      // Use ACL post-surgical transcript for custom template testing
      const transcript = sampleTranscriptions.acl_postsurgical;

      if (!transcript) {
        throw new Error('ACL postsurgical test transcript not found in test data');
      }

      console.log('📄 Using ACL postsurgical transcript:', transcript.substring(0, 150) + '...');

      // Fetch custom template configuration
      const templateResponse = await authenticatedFetch(`/api/phi/custom-templates?id=${customTemplateId}`);

      if (!templateResponse.ok) {
        throw new Error('Failed to load custom template configuration');
      }

      const templateData = await templateResponse.json();
      console.log('📋 Loaded custom template:', templateData);

      // Use custom template generation directly
      const { buildCustomPrompt } = await import('../../hooks/templates/useCustomTemplate');

      const aiService = createAIService();
      const prompt = buildCustomPrompt(transcript, templateData.template_config);

      console.log('🤖 Generating with custom prompt...');
      const aiResponse = await aiService.generateCompletion(prompt);

      // Parse the JSON response
      let soapData;
      try {
        soapData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        throw new Error('AI returned invalid JSON: ' + parseError.message);
      }

      console.log('✅ SOAP generated successfully:', soapData);

      // Save to Azure PostgreSQL
      console.log('💾 Saving to Azure database...');
      const saveResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'POST',
        body: JSON.stringify({
          templateType: `custom-${customTemplateId}`,
          sessionTitle: `AI Generated ${customTemplate.name}`,
          customTemplateId: customTemplateId
        })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save encounter to database');
      }

      const encounter = await saveResponse.json();

      // Now update it with the SOAP data
      const updateResponse = await authenticatedFetch('/api/phi/encounters', {
        method: 'PUT',
        body: JSON.stringify({
          id: encounter.id,
          soap: soapData,
          status: 'draft'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update encounter with SOAP data');
      }

      const updatedEncounter = await updateResponse.json();

      console.log('📋 Encounter saved to Azure:', updatedEncounter);
      finishProcessing(updatedEncounter);

    } catch (error) {
      console.error('❌ Failed to generate SOAP with custom template:', error);
      alert(`Failed to generate SOAP note: ${error.message}\n\nMake sure you have set NEXT_PUBLIC_OPENAI_API_KEY in your .env.local file.`);
    } finally {
      setGeneratingTemplateId(null);
      setTestingCustomTemplateId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <h2 className="text-2xl font-semibold text-grey-900 dark:text-grey-100 mb-2">
          {selectedTemplate ? 'Template Selected' : 'Select Template to Begin'}
        </h2>
        <p className="text-base text-grey-600 dark:text-grey-400">
          {selectedTemplate
            ? 'Ready to start recording'
            : 'Choose the body region for this evaluation'}
        </p>
      </motion.div>

      {/* Universal Templates Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-grey-500 dark:text-grey-400 uppercase tracking-wide mb-4">Universal Templates</h3>
        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.filter(t => t.category === 'universal').map((template, index) => {
            const isSelected = selectedTemplate === template.id;
            const Icon = template.icon;

            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectTemplate(template.id)}
                className="relative text-left w-full group"
              >
                <SpotlightCard
                  className={`
                    h-full transition-all duration-300
                    ${isSelected
                      ? 'bg-blue-50/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}
                  `}
                  spotlightColor={isSelected ? "rgba(37, 99, 235, 0.2)" : "rgba(255, 255, 255, 0.1)"}
                >
                  <div className="p-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-white/20 group-hover:text-white'}
                        `}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className={`text-base font-semibold transition-colors ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {template.name}
                      </div>
                    </div>
                  </div>
                  <div className={`h-px w-full transition-colors ${isSelected ? 'bg-blue-500/20' : 'bg-gray-200/10 dark:bg-white/5'}`} />
                  <div className="p-5 pt-4">
                    <div className={`text-sm transition-colors ${isSelected ? 'text-blue-400/80' : 'text-gray-600 dark:text-gray-400'}`}>
                      {template.description}
                    </div>

                    {/* Try Example Link for templates with test data */}
                    {(template.id === 'daily-note' || template.id === 'discharge') && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!generatingTemplateId) {
                            if (template.id === 'daily-note') {
                              handleTestDailyNote();
                            } else if (template.id === 'discharge') {
                              handleTestDischarge();
                            }
                          }
                        }}
                        className={`mt-3 text-xs font-medium flex items-center gap-1 transition-colors hover:gap-2 ${generatingTemplateId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        style={{ color: 'rgb(var(--blue-primary-rgb))' }}
                      >
                        {generatingTemplateId === template.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Try Example
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-600/40"
                    >
                      ✓
                    </motion.div>
                  )}
                </SpotlightCard>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Body-Part Specific Templates Section */}
      <div>
        <h3 className="text-sm font-semibold text-grey-500 dark:text-grey-400 uppercase tracking-wide mb-4">Body-Part Evaluations</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {TEMPLATES.filter(t => t.category === 'bodyPart').map((template, index) => {
            const isSelected = selectedTemplate === template.id;
            const Icon = template.icon;

            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectTemplate(template.id)}
                className="relative text-left w-full group"
              >
                <SpotlightCard
                  className={`
                    h-full transition-all duration-300
                    ${isSelected
                      ? 'bg-blue-50/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}
                  `}
                  spotlightColor={isSelected ? "rgba(37, 99, 235, 0.2)" : "rgba(255, 255, 255, 0.1)"}
                >
                  <div className="p-5 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                          ${isSelected
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-white/20 group-hover:text-white'}
                        `}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div className={`text-base font-semibold transition-colors ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {template.name}
                      </div>
                    </div>
                  </div>
                  <div className={`h-px w-full transition-colors ${isSelected ? 'bg-blue-500/20' : 'bg-gray-200/10 dark:bg-white/5'}`} />
                  <div className="p-5 pt-4">
                    <div className={`text-sm transition-colors ${isSelected ? 'text-blue-400/80' : 'text-gray-600 dark:text-gray-400'}`}>
                      {template.description}
                    </div>

                    {/* Try Example Link for Knee template */}
                    {template.id === 'knee' && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!generatingTemplateId) {
                            handleTestMode();
                          }
                        }}
                        className={`mt-3 text-xs font-medium flex items-center gap-1 transition-colors hover:gap-2 ${generatingTemplateId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        style={{ color: 'rgb(var(--blue-primary-rgb))' }}
                      >
                        {generatingTemplateId === template.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Try Example
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-600/40"
                    >
                      ✓
                    </motion.div>
                  )}
                </SpotlightCard>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Templates Section */}
      {customTemplates && customTemplates.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-grey-500 dark:text-grey-400 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" />
            My Custom Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {customTemplates.map((template, index) => {
              const isSelected = selectedTemplate === `custom-${template.id}`;
              const Icon = FileText;

              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectTemplate(`custom-${template.id}`)}
                  className="relative text-left w-full group"
                >
                  <SpotlightCard
                    className={`
                      h-full transition-all duration-300
                      ${isSelected
                        ? 'bg-blue-50/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'}
                    `}
                    spotlightColor={isSelected ? "rgba(37, 99, 235, 0.2)" : "rgba(255, 255, 255, 0.1)"}
                  >
                    <div className="p-5 pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                            ${isSelected
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                              : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 group-hover:bg-white/20 group-hover:text-white'}
                          `}
                        >
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-base font-semibold truncate transition-colors ${isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {template.name}
                          </div>
                          {template.is_favorite && (
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`h-px w-full transition-colors ${isSelected ? 'bg-blue-500/20' : 'bg-gray-200/10 dark:bg-white/5'}`} />
                    <div className="p-5 pt-4">
                      <div className={`text-sm line-clamp-2 transition-colors ${isSelected ? 'text-blue-400/80' : 'text-gray-600 dark:text-gray-400'}`}>
                        {template.description || 'Custom template'}
                      </div>
                      {template.body_region && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {template.body_region.replace('-', '/')}
                        </div>
                      )}

                      {/* Try Example Link */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!generatingTemplateId && !testingCustomTemplateId) {
                            handleTestCustomTemplate(template.id, template);
                          }
                        }}
                        className={`mt-3 text-xs font-medium flex items-center gap-1 transition-colors hover:gap-2 ${testingCustomTemplateId === template.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        style={{ color: 'rgb(var(--blue-primary-rgb))' }}
                      >
                        {testingCustomTemplateId === template.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Try Example
                          </>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-blue-600 text-white text-xs font-medium shadow-lg shadow-blue-600/40"
                      >
                        ✓
                      </motion.div>
                    )}
                  </SpotlightCard>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
