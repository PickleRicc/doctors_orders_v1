/**
 * TemplateSelector - Template selection buttons
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, User, Heart, Zap, Footprints, Wind, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { useAppState, APP_STATES } from './StateManager';
import { useTemplateManager } from '../../hooks/templates/useTemplateManager';
import { createAIService } from '../../services/structuredAI';
import { sampleTranscriptions } from '../../utils/testData';

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

const BLUE_PRIMARY = '#007AFF';

export default function TemplateSelector() {
  const { appState, selectedTemplate, selectTemplate, finishProcessing } = useAppState();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize all template managers at component level
  const kneeManager = useTemplateManager('knee');
  const dailyNoteManager = useTemplateManager('daily-note');
  const dischargeManager = useTemplateManager('discharge');

  if (appState !== APP_STATES.IDLE && appState !== APP_STATES.TEMPLATE_SELECTED) {
    return null;
  }

  const handleTestMode = async () => {
    setIsGenerating(true);
    
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
      const saveResponse = await fetch('/api/phi/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const updateResponse = await fetch('/api/phi/encounters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      setIsGenerating(false);
    }
  };

  const handleTestDailyNote = async () => {
    setIsGenerating(true);
    
    try {
      console.log('📅 Generating Daily Note with sample data...');
      
      const transcript = sampleTranscriptions.daily_note;
      const aiService = createAIService();
      
      const soapResult = await dailyNoteManager.generateSOAP(transcript, aiService);
      
      if (!soapResult.success) {
        throw new Error(soapResult.error || 'Daily Note generation failed');
      }
      
      const saveResponse = await fetch('/api/phi/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: 'daily-note',
          sessionTitle: 'AI Generated Daily Note'
        })
      });
      
      if (!saveResponse.ok) throw new Error('Failed to save encounter');
      
      const encounter = await saveResponse.json();
      
      const updateResponse = await fetch('/api/phi/encounters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      setIsGenerating(false);
    }
  };

  const handleTestDischarge = async () => {
    setIsGenerating(true);
    
    try {
      console.log('✅ Generating Discharge Note with sample data...');
      
      const transcript = sampleTranscriptions.discharge_note;
      const aiService = createAIService();
      
      const soapResult = await dischargeManager.generateSOAP(transcript, aiService);
      
      if (!soapResult.success) {
        throw new Error(soapResult.error || 'Discharge Note generation failed');
      }
      
      const saveResponse = await fetch('/api/phi/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: 'discharge',
          sessionTitle: 'AI Generated Discharge Note'
        })
      });
      
      if (!saveResponse.ok) throw new Error('Failed to save encounter');
      
      const encounter = await saveResponse.json();
      
      const updateResponse = await fetch('/api/phi/encounters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      setIsGenerating(false);
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
        <h2 className="text-2xl font-semibold text-grey-900 mb-2">
          {selectedTemplate ? 'Template Selected' : 'Select Template to Begin'}
        </h2>
        <p className="text-base text-grey-600">
          {selectedTemplate
            ? 'Ready to start recording'
            : 'Choose the body region for this evaluation'}
        </p>
        
        {/* Test Mode Buttons */}
        <div className="mt-4 flex flex-col gap-2 items-center">
          <button
            onClick={handleTestMode}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#007AFF' }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>🧪 Test with Sample Data</>
            )}
          </button>
          
          <button
            onClick={() => handleTestDailyNote()}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#10b981' }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>📅 Test Daily Note</>
            )}
          </button>
          
          <button
            onClick={() => handleTestDischarge()}
            disabled={isGenerating}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#8b5cf6' }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>✅ Test Discharge Note</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Universal Templates Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-4">Universal Templates</h3>
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
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectTemplate(template.id)}
                className={`
                  relative rounded-xl transition-all text-left overflow-hidden
                  ${isSelected
                    ? 'bg-white shadow-lg ring-2'
                    : 'bg-white hover:shadow-md border border-grey-100'
                  }
                `}
                style={isSelected ? { borderColor: BLUE_PRIMARY } : {}}
              >
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        backgroundColor: isSelected ? `${BLUE_PRIMARY}15` : '#F9FAFB',
                        color: isSelected ? BLUE_PRIMARY : '#6B7280'
                      }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="text-base font-semibold text-grey-900">
                      {template.name}
                    </div>
                  </div>
                </div>
                <div className="h-px bg-grey-100" />
                <div className="p-5 pt-4">
                  <div className="text-sm text-grey-600">
                    {template.description}
                  </div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm"
                    style={{ backgroundColor: BLUE_PRIMARY }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Body-Part Specific Templates Section */}
      <div>
        <h3 className="text-sm font-semibold text-grey-500 uppercase tracking-wide mb-4">Body-Part Evaluations</h3>
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
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectTemplate(template.id)}
              className={`
                relative rounded-xl transition-all text-left overflow-hidden
                ${isSelected
                  ? 'bg-white shadow-lg ring-2'
                  : 'bg-white hover:shadow-md border border-grey-100'
                }
              `}
              style={isSelected ? { borderColor: BLUE_PRIMARY } : {}}
            >
              {/* Icon & Name Section */}
              <div className="p-5 pb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      backgroundColor: isSelected ? `${BLUE_PRIMARY}15` : '#F9FAFB',
                      color: isSelected ? BLUE_PRIMARY : '#6B7280'
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="text-base font-semibold text-grey-900">
                    {template.name}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-grey-100" />

              {/* Description Section */}
              <div className="p-5 pt-4">
                <div className="text-sm text-grey-600">
                  {template.description}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-sm"
                  style={{ backgroundColor: BLUE_PRIMARY }}
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
