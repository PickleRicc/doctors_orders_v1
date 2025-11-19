'use client';

/**
 * Landing Page - Modern dark theme inspired design
 * Sleek, professional landing page for PT SOAP Generator
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Mic, Zap, Shield, ArrowRight, Sparkles, FileText, Clock, Target, CheckCircle2, Play, Activity, HeartPulse, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import authService from '../../services/supabase';
import HeroBackground from '../../components/landing/HeroBackground';
import MagneticButton from '../../components/ui/MagneticButton';
import SpotlightCard from '../../components/ui/SpotlightCard';
import TiltContainer from '../../components/ui/TiltContainer';
import InfiniteMarquee from '../../components/ui/InfiniteMarquee';

export default function LandingPage() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

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
      description: 'Capture patient sessions with crystal-clear audio quality using advanced noise cancellation.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'AI Generation',
      description: 'Get actionable SOAP notes in under 60 seconds with our fine-tuned medical LLM.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Enterprise-grade security with Azure infrastructure and end-to-end encryption.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Sparkles,
      title: 'Custom Templates',
      description: 'Create personalized SOAP note templates for any body region or session type.',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const partners = [
    "Apex Physical Therapy", "MovementX", "Select Medical", "Athletico", "ATI Physical Therapy", "Concentra"
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-x-hidden selection:bg-blue-500/30">
      <HeroBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px]">
                <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                  <Image
                    src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                    alt="Doctors Orders Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Doctors Orders</span>
            </div>
            <MagneticButton
              onClick={() => router.push('/auth')}
              className="px-6 py-2.5 bg-white text-black rounded-full hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Login
            </MagneticButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-blue-400 backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered SOAP Optimization</span>
              </motion.div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
                Focus on <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 animate-gradient-x">
                  Patients
                </span>
                <br />
                Not Paperwork.
              </h1>

              <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
                Automatically scan, analyze, and enhance your patient sessions with AI-generated SOAP notes. Save hours every week.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <MagneticButton
                  onClick={() => router.push('/auth')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-semibold text-lg flex items-center gap-2 shadow-lg shadow-blue-600/25"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>

                <MagneticButton
                  onClick={() => { }}
                  className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 transition-all font-semibold text-lg flex items-center gap-2 backdrop-blur-sm"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Demo
                </MagneticButton>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-xs font-bold text-gray-400">
                      {i}
                    </div>
                  ))}
                </div>
                <p>Trusted by 500+ Physical Therapists</p>
              </div>
            </motion.div>

            <motion.div
              style={{ y: y1 }}
              className="relative hidden lg:block perspective-1000"
            >
              <TiltContainer>
                <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl transform scale-110" />

                  {/* Main UI Mockup */}
                  <div className="relative h-full bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                    {/* Mockup Header */}
                    <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                      </div>
                      <div className="ml-4 h-2 w-32 bg-white/10 rounded-full" />
                    </div>

                    {/* Mockup Body */}
                    <div className="flex-1 p-6 space-y-6">
                      <div className="flex gap-4">
                        <div className="w-1/3 space-y-3">
                          <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                          <div className="h-24 bg-white/5 rounded-xl border border-white/5" />
                        </div>
                        <div className="w-2/3 space-y-4">
                          <div className="h-8 w-3/4 bg-blue-500/20 rounded-lg" />
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-white/10 rounded-full" />
                            <div className="h-2 w-5/6 bg-white/10 rounded-full" />
                            <div className="h-2 w-4/6 bg-white/10 rounded-full" />
                          </div>
                          <div className="h-32 bg-white/5 rounded-xl border border-white/5 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-blue-400" />
                              <div className="text-xs text-blue-400 font-medium">AI Analysis</div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-full bg-blue-500/10 rounded-full" />
                              <div className="h-2 w-full bg-blue-500/10 rounded-full" />
                              <div className="h-2 w-3/4 bg-blue-500/10 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute bottom-8 left-8 bg-gray-900/90 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">SOAP Note Ready</div>
                        <div className="text-xs text-gray-400">Generated in 45s</div>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute top-20 right-8 bg-gray-900/90 backdrop-blur-xl p-4 rounded-xl border border-white/10 shadow-xl"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-medium text-gray-300">Efficiency</span>
                      </div>
                      <div className="text-2xl font-bold text-white">+145%</div>
                    </motion.div>
                  </div>
                </div>
              </TiltContainer>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Marquee */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <InfiniteMarquee items={partners} />
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to <br />
              <span className="text-blue-500">streamline documentation</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed specifically for physical therapists, built to save you time and improve accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="md:col-span-2">
              <SpotlightCard className="h-full p-8 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Save Hours Every Week</h3>
                  <p className="text-gray-400 text-lg max-w-md mb-8">
                    Transform voice recordings into comprehensive SOAP notes in under 60 seconds. Spend more time with patients, less time on paperwork.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-sm">
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="text-3xl font-bold text-blue-400 mb-1">75%</div>
                      <div className="text-sm text-gray-500">Time Saved</div>
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                      <div className="text-3xl font-bold text-blue-400 mb-1">&lt;60s</div>
                      <div className="text-sm text-gray-500">Generation Time</div>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>

            {/* Tall Card */}
            <div className="h-full">
              <SpotlightCard className="h-full p-8" spotlightColor="rgba(168, 85, 247, 0.25)">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Intelligent Analysis</h3>
                <p className="text-gray-400 mb-6">
                  Advanced AI extracts key information, suggests goals, and generates evidence-based treatment plans.
                </p>
                <ul className="space-y-3">
                  {['Clinical impression', 'Smart goals', 'Interventions'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </div>

            {/* Small Cards */}
            {features.map((feature, index) => (
              <SpotlightCard key={feature.title} className="p-8" spotlightColor="rgba(59, 130, 246, 0.15)">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} opacity-80`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

            <div className="relative z-10 px-8 py-20 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Join hundreds of physical therapists saving hours every week with AI-powered documentation.
              </p>
              <MagneticButton
                onClick={() => router.push('/auth')}
                className="px-10 py-5 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-all font-bold text-lg shadow-xl shadow-black/20"
              >
                Start Free Trial
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 p-1">
                <Image
                  src="/u9354481378_Modern_logo_design_compact_robot_head_in_circular_98ac6e0b-5d09-4f6a-980b-cfc4d4af2c9c_3 - Edited.png"
                  alt="Doctors Orders Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-semibold text-gray-300">Doctors Orders</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="text-gray-600 text-sm">
              &copy; 2025 Doctors Orders.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
