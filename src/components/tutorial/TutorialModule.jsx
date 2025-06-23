import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ChevronRight, ChevronLeft, Check, Home, FileText, Settings, Mic, Template, Calendar, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';

/**
 * Tutorial Module Component
 * Provides step-by-step guidance for new users on how to use the PT SOAP Generator
 */
const TutorialModule = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const router = useRouter();

  // Tutorial steps with content and actions
  const tutorialSteps = [
    {
      title: "Welcome to PT SOAP Generator",
      description: "This quick tutorial will show you how to use the app to create professional SOAP notes in minutes without storing any patient identifiable information.",
      icon: <BookOpen size={40} className="text-blue-primary" />,
      details: [
        "Create SOAP notes in under 2 minutes",
        "Zero patient data storage for complete privacy",
        "Professional-quality documentation",
        "Simple voice-to-note workflow"
      ],
      action: null
    },
    {
      title: "Privacy-First Design",
      description: "We never store patient names or identifiable information. Sessions are identified by numbers and auto-delete after 12 hours.",
      icon: <X size={40} className="text-blue-primary" />,
      details: [
        "No patient names or identifiers ever stored",
        "All sessions auto-delete after 12 hours",
        "No HIPAA infrastructure required",
        "Add patient info only when exporting to your EMR"
      ],
      action: null
    },
    {
      title: "Dashboard Overview",
      description: "Your dashboard shows today's sessions and quick stats. Use the floating button to start a new recording session.",
      icon: <Home size={40} className="text-blue-primary" />,
      details: [
        "View today's sessions at a glance",
        "Track your documentation efficiency",
        "Quick access to recent notes",
        "Use the + button to start a new session"
      ],
      action: {
        label: "View Dashboard",
        path: "/dashboard"
      }
    },
    {
      title: "Recording a Session",
      description: "Select a body region and session type, then record your observations. Speak naturally about what happened during the session.",
      icon: <Mic size={40} className="text-blue-primary" />,
      details: [
        "Choose body region (shoulder, knee, etc.)",
        "Select session type (evaluation, follow-up, etc.)",
        "Record your voice observations naturally",
        "AI processes your recording into a structured note"
      ],
      action: {
        label: "Try Recording",
        path: "/record"
      }
    },
    {
      title: "Templates",
      description: "Choose from pre-built templates or create your own custom templates for different body regions and session types.",
      icon: <FileText size={40} className="text-blue-primary" />,
      details: [
        "Use specialized templates for different body regions",
        "Customize templates to match your documentation style",
        "Templates guide AI processing for better results",
        "Save your favorite templates for quick access"
      ],
      action: {
        label: "Explore Templates",
        path: "/templates"
      }
    },
    {
      title: "Managing Sessions",
      description: "View, edit, and export your session notes. Remember, all sessions auto-delete after 12 hours for privacy.",
      icon: <Calendar size={40} className="text-blue-primary" />,
      details: [
        "Review and edit generated SOAP notes",
        "Export notes as PDF or copy text",
        "Filter sessions by date and body region",
        "All data automatically purged after 12 hours"
      ],
      action: {
        label: "See Sessions",
        path: "/sessions"
      }
    },
    {
      title: "You're All Set!",
      description: "You now know the basics of using PT SOAP Generator. You can revisit this tutorial anytime from the sidebar.",
      icon: <Check size={40} className="text-blue-primary" />,
      details: [
        "Access this tutorial anytime from the sidebar",
        "Check out Settings for account preferences",
        "Contact support if you need any help",
        "Start creating efficient, private SOAP notes now!"
      ],
      action: {
        label: "Start Using the App",
        path: "/dashboard"
      }
    }
  ];

  // Mark current step as completed when navigating
  useEffect(() => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
  }, [currentStep]);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentStep < tutorialSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [currentStep, tutorialSteps.length, onClose]);
  
  // Add and remove keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Handle navigation to next step
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  // Handle navigation to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle action button click
  const handleAction = () => {
    const action = tutorialSteps[currentStep].action;
    if (action && action.path) {
      router.push(action.path);
      onClose();
    }
  };

  // Skip tutorial and mark as completed
  const handleSkip = () => {
    // Mark all steps as completed
    setCompletedSteps([...Array(tutorialSteps.length).keys()]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl overflow-hidden shadow-xl max-w-lg w-full"
          style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
        >
          {/* Header with title and close button */}
          <div className="bg-[#2563eb] px-6 py-4 flex justify-between items-center">
            <h2 className="text-white font-medium flex items-center">
              <BookOpen size={20} className="mr-2.5" />
              PT SOAP Generator Tutorial
            </h2>
            
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
              aria-label="Close tutorial"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Progress indicator */}
            <div className="flex justify-center mb-6">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full mx-1 transition-all duration-300 ${
                    index === currentStep
                      ? "w-8 bg-blue-primary"
                      : completedSteps.includes(index)
                      ? "w-4 bg-blue-primary bg-opacity-70"
                      : "w-4 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Step content */}
            <div className="text-center px-4">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {tutorialSteps[currentStep].title}
              </h3>
              
              {/* Tutorial icon and details */}
              <div className="my-6">
                <div className="flex justify-center mb-5">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center shadow-md"
                  >
                    {tutorialSteps[currentStep].icon}
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-gray-50 rounded-xl p-5 mb-5 shadow-sm border border-gray-100"
                >
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs mr-2 font-medium">{currentStep + 1}</span>
                    Key Points
                  </h4>
                  <ul className="space-y-3">
                    {tutorialSteps[currentStep].details.map((detail, index) => (
                      <motion.li 
                        key={index} 
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                        className="flex items-start"
                      >
                        <ArrowRight size={16} className="text-blue-primary mt-1 mr-2.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-tight">{detail}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                {tutorialSteps[currentStep].description}
              </p>
            </div>
          </div>

          {/* Footer with navigation */}
          <div className="p-6 bg-gray-50 flex justify-between items-center relative">
            <div>
              {currentStep > 0 ? (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center border border-gray-200"
                >
                  <ChevronLeft size={20} className="text-blue-primary" />
                  <span>Previous</span>
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
                >
                  Skip Tutorial
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              {tutorialSteps[currentStep].action && (
                <motion.button
                  onClick={handleAction}
                  className="px-4 py-2.5 bg-white border border-blue-primary text-blue-primary rounded-lg hover:bg-blue-50 transition-colors flex items-center font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tutorialSteps[currentStep].action.label}
                </motion.button>
              )}
              
              <motion.button
                onClick={handleNext}
                className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-primary hover:border-blue-primary transition-colors flex items-center shadow-sm font-medium"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    <span>Next</span>
                    <ChevronRight size={20} className="ml-1" />
                  </>
                ) : (
                  <>
                    <span>Finish</span>
                    <Check size={20} className="ml-1" />
                  </>
                )}
              </motion.button>
            </div>
            
            {/* Step navigation dots */}
            <div className="absolute left-0 right-0 -top-10 flex justify-center">
              <div className="flex items-center bg-white px-5 py-2.5 rounded-full shadow-sm">
                {tutorialSteps.map((step, index) => (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => setCurrentStep(index)}
                      className={`w-3.5 h-3.5 rounded-full transition-all flex-shrink-0 ${index === currentStep ? 'bg-blue-primary scale-110 ring-2 ring-blue-100' : completedSteps.includes(index) ? 'bg-blue-300' : 'bg-gray-200'}`}
                      aria-label={`Go to step ${index + 1}: ${step.title}`}
                      title={step.title}
                    />
                    {index < tutorialSteps.length - 1 && (
                      <div className="w-5 h-0.5 bg-gray-200 mx-1" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialModule;
