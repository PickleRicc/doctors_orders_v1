'use client';

/**
 * Landing Page - Modern dark theme inspired design
 * Sleek, professional landing page for PT SOAP Generator
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Zap, Shield, ArrowRight, Sparkles, FileText, Clock, Target } from 'lucide-react';
import Image from 'next/image';
import authService from '../../services/supabase';

export default function LandingPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { session } = await authService.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkSession();
  }, [router]);

  const features = [
    {
      icon: Mic,
      title: 'Voice Recording',
      description: 'Capture patient sessions with crystal-clear audio quality'
    },
    {
      icon: Zap,
      title: 'AI Generation',
      description: 'Get actionable SOAP notes in under 60 seconds'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with Azure infrastructure'
    },
    {
      icon: Sparkles,
      title: 'Custom Templates',
      description: 'Create personalized SOAP note templates for any body region or session type'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#007AFF]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#007AFF]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="border-b border-[#007AFF]/20 bg-gradient-to-br from-[#007AFF]/15 via-[#007AFF]/10 to-[#007AFF]/15 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-[#007AFF]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#007AFF]/20 p-1">
                <Image 
                  src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                  alt="Doctors Orders Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold text-white">Doctors Orders</span>
            </div>
            <button
              onClick={() => router.push('/auth')}
              className="px-6 py-2.5 bg-[#007AFF] text-white rounded-lg hover:bg-[#0056b3] transition-all font-medium shadow-lg shadow-[#007AFF]/20 hover:shadow-[#007AFF]/40"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Logo with animated glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-[#007AFF]/40 rounded-full blur-2xl"
                />
                {/* Logo */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#007AFF]/20 to-[#007AFF]/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-2xl">
                  <Image 
                    src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                    alt="Doctors Orders Logo"
                    width={128}
                    height={128}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </motion.div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-full text-sm font-medium text-[#007AFF] backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered SOAP Optimization
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Transform Your </span>
              <span className="bg-gradient-to-r from-[#007AFF] via-[#0095FF] to-[#007AFF] bg-clip-text text-transparent">
                Documentation
              </span>
              <br />
              <span className="text-white">with AI</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Automatically scan, analyze, and enhance your patient sessions with AI-generated SOAP notes and optimization insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => router.push('/auth')}
                className="px-8 py-4 bg-[#007AFF] text-white rounded-lg hover:bg-[#0056b3] transition-all font-semibold text-lg flex items-center gap-2 shadow-lg shadow-[#007AFF]/30 hover:shadow-[#007AFF]/50 hover:scale-105 transform"
              >
                <ArrowRight className="w-5 h-5" />
                Get Started
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-all font-semibold text-lg backdrop-blur-sm"
              >
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to <span className="text-[#007AFF]">Streamline Documentation</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Powerful features designed specifically for physical therapists
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Custom Templates Feature */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#007AFF]/10 via-[#007AFF]/5 to-transparent backdrop-blur-xl border border-[#007AFF]/20 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#007AFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Custom Templates</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Build personalized SOAP note templates for any body region, session type, or specialty. Define your own fields, measurements, and assessment criteria.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Post-surgical protocols
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Sport-specific evaluations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Discharge summaries
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Time Saving Feature */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-[#007AFF]/10 via-[#007AFF]/5 to-transparent backdrop-blur-xl border border-[#007AFF]/20 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#007AFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Save Hours Every Week</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Transform voice recordings into comprehensive SOAP notes in under 60 seconds. Spend more time with patients, less time on paperwork.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-[#007AFF] mb-1">75%</div>
                    <div className="text-sm text-gray-400">Time Saved</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-2xl font-bold text-[#007AFF] mb-1">&lt;60s</div>
                    <div className="text-sm text-gray-400">Generation Time</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Smart AI Feature */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-[#007AFF]/10 via-[#007AFF]/5 to-transparent backdrop-blur-xl border border-[#007AFF]/20 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#007AFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Intelligent Analysis</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  Advanced AI extracts key information, suggests goals, and generates evidence-based treatment plans tailored to your patient's needs.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Automatic clinical impression
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Smart goal generation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Evidence-based interventions
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Security Feature */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-[#007AFF]/10 via-[#007AFF]/5 to-transparent backdrop-blur-xl border border-[#007AFF]/20 rounded-2xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#007AFF]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#007AFF]" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Enterprise Security</h3>
                <p className="text-gray-400 mb-4 leading-relaxed">
                  HIPAA-compliant infrastructure with Azure-backed security. Your data is encrypted, secure, and never shared.
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    End-to-end encryption
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    HIPAA compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#007AFF] rounded-full"></div>
                    Azure infrastructure
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gradient-to-br from-[#007AFF]/10 via-[#007AFF]/5 to-[#007AFF]/10 backdrop-blur-xl border border-[#007AFF]/20 rounded-2xl p-8 hover:from-[#007AFF]/20 hover:via-[#007AFF]/15 hover:to-[#007AFF]/20 transition-all group"
            >
              <div className="w-14 h-14 bg-[#007AFF]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#007AFF]/20 transition-colors">
                <feature.icon className="w-7 h-7 text-[#007AFF]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-[#007AFF]/15 via-[#007AFF]/10 to-[#007AFF]/15 backdrop-blur-xl border border-[#007AFF]/30 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#007AFF]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#007AFF]/15 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of physical therapists saving hours every week with AI-powered documentation
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="px-10 py-4 bg-[#007AFF] text-white rounded-lg hover:bg-[#0056b3] transition-all font-semibold text-lg shadow-lg shadow-[#007AFF]/30 hover:shadow-[#007AFF]/50 hover:scale-105 transform inline-flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#007AFF]/20 p-1">
                <Image 
                  src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                  alt="Doctors Orders Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg font-semibold text-white">Doctors Orders</span>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; 2025 Doctors Orders. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
