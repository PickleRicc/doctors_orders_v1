import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import useSessions from '../hooks/useSessions';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Clock, Calendar, FileText, PlusCircle, LineChart, CheckCircle2, AlertCircle, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ShimmerButton } from "../components/magicui/shimmer-button";
import { AuroraText } from "../components/magicui/aurora-text";
import { DashboardCard } from "../components/ui/dashboard-card";

/**
 * Dashboard page component
 * Main landing page for authenticated therapists
 * Displays session overview and quick access to key features
 */
function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'there';
  const router = useRouter();
  const { sessions, isLoading, error, fetchSessionsByDate } = useSessions();
  const [recentSessions, setRecentSessions] = useState([]);
  const [statsData, setStatsData] = useState({
    completed: 0,
    notesGenerated: 0,
    avgCompletionTime: 0,
    weeklyChange: 0 // tracks week-over-week change
  });
  
  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  
  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    // Update greeting every hour
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Fetch recent sessions when component mounts
  useEffect(() => {
    const loadRecentSessions = async () => {
      // Fetch last 7 days of sessions
      const today = new Date();
      const sessionsData = await fetchSessionsByDate(today);
      setRecentSessions(sessionsData.slice(0, 3)); // Get most recent 3 sessions
      
      // Update stats
      if (sessionsData.length) {
        // This weekly change would ideally be calculated from historical data
        const mockWeeklyChange = Math.random() > 0.5 ? Math.round(Math.random() * 20) : -Math.round(Math.random() * 10);
        
        setStatsData({
          completed: sessionsData.length,
          notesGenerated: sessionsData.filter(s => s.soap_note).length,
          avgCompletionTime: 2.3, // This would ideally be calculated from actual data
          weeklyChange: mockWeeklyChange // Simulated week-over-week change
        });
      }
    };
    
    loadRecentSessions();
  }, [fetchSessionsByDate]);
  
  const handleNewSession = () => {
    router.push('/record');
  };
  
  // Format session time from ISO string
  const formatSessionTime = (dateString) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (error) {
      return 'Time unavailable';
    }
  };
  
  // Get friendly display name for body region
  const getBodyRegionDisplay = (bodyRegion) => {
    const regionMap = {
      'ankle_foot': 'Ankle/Foot',
      'knee': 'Knee',
      'hip': 'Hip',
      'lumbar': 'Low Back',
      'cervical': 'Neck',
      'shoulder': 'Shoulder',
      'elbow': 'Elbow',
      'wrist_hand': 'Wrist/Hand',
      'general': 'General'
    };
    return regionMap[bodyRegion] || bodyRegion;
  };
  
  // Get friendly display name for session type
  const getSessionTypeDisplay = (sessionType) => {
    const typeMap = {
      'evaluation': 'Evaluation',
      'follow_up': 'Follow-up',
      're_evaluation': 'Re-evaluation',
      'falls_balance': 'Falls & Balance',
      'neurologic': 'Neurologic',
      'weakness': 'General Weakness'
    };
    return typeMap[sessionType] || sessionType;
  };
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Welcome Section - Enhanced with animation */}
        <section className="mb-8">
          <motion.div 
            className="bg-transparent rounded-xl p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold mb-2"
                >
                  <AuroraText 
                    colors={["#000000", "#2563eb", "#000000", "#2563eb"]} 
                    speed={0.8}
                  >
                    {greeting}, {firstName}!
                  </AuroraText>
                </motion.h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
                  <p>Here's an overview of your sessions</p>
                  <span className="hidden sm:inline">•</span>
                  <p className="text-[#2563eb] font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>
              
              {/* AI Status Indicator */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="relative mt-4 md:mt-0 cursor-default group inline-flex"
              >
                <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-[#007AFF]/20">
                  {/* AI Icon with small border */}
                  <div className="flex items-center justify-center mr-2.5 p-0.5 rounded-full bg-[#007AFF]/10">
                    <Zap size={14} className="text-[#007AFF]" />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <p className="text-sm font-medium text-gray-800">AI Processing Ready</p>
                    <div className="flex items-center mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                      <p className="text-xs text-gray-500">Voice recording enabled</p>
                    </div>
                  </div>
                </div>
                
                {/* Subtle hover effect */}
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md -z-10"></div>
              </motion.div>
            </div>
            
            {/* Motivational message with animation */}
            <motion.div 
              className="mt-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <p className="p-4 bg-[#f0f9ff] border-l-4 border-[#2563eb] rounded-r-md text-sm">
                <span className="font-medium">Tip:</span> Regular recording of session notes improves patient outcomes by 27%.
              </p>
            </motion.div>
          </motion.div>
        </section>
        
        {/* Sessions Overview - Enhanced with better accessibility and empty states */}
        <section className="mb-8" aria-labelledby="recent-sessions-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="recent-sessions-heading" className="text-xl font-medium text-foreground">Recent Sessions</h2>
            <div className="flex items-center gap-2 bg-[#f8fafc] px-3 py-1 rounded-full" role="status">
              <span className="text-sm font-medium text-[#2563eb]">Last 7 days</span>
              <Calendar size={16} className="text-[#2563eb]" aria-hidden="true" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Enhanced loading state with animation
              <div className="col-span-full py-12 px-4 flex flex-col items-center justify-center text-muted-foreground rounded-xl border border-dashed border-[#e5e7eb] bg-[#f9fafb]">
                <div className="w-12 h-12 rounded-full border-4 border-[#e5e7eb] border-t-[#2563eb] animate-spin mb-4" role="status" aria-label="Loading sessions">
                  <span className="sr-only">Loading sessions...</span>
                </div>
                <p className="text-sm font-medium">Loading your recent sessions...</p>
              </div>
            ) : error ? (
              // Enhanced error state with better visual feedback
              <div className="col-span-full py-12 px-4 flex flex-col items-center justify-center text-red-500 rounded-xl border border-red-200 bg-red-50" role="alert" aria-live="assertive">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <AlertCircle size={24} aria-hidden="true" />
                </div>
                <p className="font-medium mb-1">Unable to load sessions</p>
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => loadRecentSessions()} 
                  className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
                  aria-label="Try loading sessions again"
                >
                  Try Again
                </button>
              </div>
            ) : recentSessions.length === 0 ? (
              // Enhanced empty state with illustration and clear CTA
              <motion.div 
                className="col-span-full py-12 px-4 flex flex-col items-center justify-center text-muted-foreground rounded-xl border border-dashed border-[#e5e7eb] bg-[#f9fafb]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#f0f9ff] flex items-center justify-center mb-4">
                  <FileText size={30} className="text-[#2563eb]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No sessions yet</h3>
                <p className="text-sm text-center max-w-md mb-6">You haven't created any sessions recently. Start recording a new session to begin documenting patient care.</p>
                <button
                  onClick={handleNewSession}
                  className="px-5 py-2.5 text-sm font-medium flex items-center gap-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg transition-colors"
                  aria-label="Create your first session"
                >
                  <PlusCircle size={18} aria-hidden="true" />
                  <span>Create your first session</span>
                </button>
              </motion.div>
            ) : (
              // Enhanced session cards with better accessibility and animations
              recentSessions.map((session, index) => (
                <motion.div 
                  key={session.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 cursor-pointer relative overflow-hidden group focus-within:ring-2 focus-within:ring-[#2563eb] focus-within:ring-offset-2"
                  onClick={() => router.push(`/sessions/${session.id}`)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  tabIndex={0}
                  role="link"
                  aria-label={`View ${getBodyRegionDisplay(session.body_region)} ${getSessionTypeDisplay(session.session_type)} session from ${formatSessionTime(session.created_at)}`}
                >
                  {/* Add a colored left border based on completion status */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${session.soap_note ? 'bg-green-500' : 'bg-amber-400'}`} 
                    aria-hidden="true"
                  ></div>
                  
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-[rgba(0,122,255,0.1)] flex items-center justify-center text-[#007AFF] mr-3 group-hover:bg-[rgba(0,122,255,0.2)] transition-colors">
                        <FileText size={24} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{getBodyRegionDisplay(session.body_region)}</h3>
                        <p className="text-sm text-muted-foreground">{getSessionTypeDisplay(session.session_type)}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center text-gray-600 font-medium">
                      <Clock size={12} className="mr-1" aria-hidden="true" /> {formatSessionTime(session.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-2">
                    <div className="flex items-center">
                      <span 
                        className={`h-2.5 w-2.5 rounded-full ${session.soap_note ? 'bg-green-500' : 'bg-amber-400'} mr-2 ${!session.soap_note && 'animate-pulse'}`}
                        aria-hidden="true"
                      ></span>
                      <span 
                        className={`text-sm ${session.soap_note ? 'text-green-700' : 'text-amber-700'} font-medium`}
                      >
                        {session.soap_note ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    
                    {/* Quick action icon that appears on hover/focus */}
                    <div className="opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/sessions/${session.id}/edit`);
                        }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
                        aria-label={`Edit ${getBodyRegionDisplay(session.body_region)} session`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Magic UI Shimmer Button for "New Session" */}
            {recentSessions.length > 0 && (
              <motion.div 
                className="bg-[#f9fafb] rounded-xl p-5 flex flex-col items-center justify-center h-full min-h-[150px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <ShimmerButton
                  onClick={handleNewSession}
                  className="w-full py-4 font-medium"
                  background="linear-gradient(to right, #2563eb, #7c3aed)"
                  shimmerColor="rgba(255, 255, 255, 0.4)"
                  shimmerSize="0.1em"
                  shimmerDuration="2s"
                  borderRadius="12px"
                  aria-label="Start new session"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <PlusCircle size={24} aria-hidden="true" />
                    <span className="text-sm font-medium">New Session</span>
                  </div>
                </ShimmerButton>
              </motion.div>
            )}
          </div>
        </section>
        
        {/* Quick Stats Summary - Enhanced with animation and better visualization */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-foreground">Analytics Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">This Week</span>
            </div>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Sessions Completed Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ aspectRatio: '640/400' }}
            >
              <DashboardCard
                icon={<Calendar size={20} />}
                title="Sessions"
                value={statsData.completed}
                subtitle="This week"
                trend={{
                  value: `${Math.abs(statsData.weeklyChange)}% from last week`,
                  isPositive: statsData.weeklyChange > 0
                }}
              />
            </motion.div>
            
            {/* Notes Generated Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ aspectRatio: '640/400' }}
            >
              <DashboardCard
                icon={<FileText size={20} />}
                title="Notes"
                value={statsData.notesGenerated}
                subtitle="Completion rate"
                trend={{
                  value: `${statsData.completionRate || 0}%`,
                  isPositive: true
                }}
              >
                {statsData.completionRate && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-primary rounded-full"
                        style={{ width: `${statsData.completionRate}%` }}
                      />
                    </div>
                  </div>
                )}
              </DashboardCard>
            </motion.div>
            
            {/* Avg Completion Time Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ aspectRatio: '640/400' }}
            >
              <DashboardCard
                icon={<Clock size={20} />}
                title="Avg. Time"
                value={`${statsData.avgCompletionTime} min`}
                subtitle="Efficient below industry avg of 5 min"
                trend={{ value: "Stable", isPositive: true }}
              />
            </motion.div>
            
            {/* AI Processing Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ aspectRatio: '640/400' }}
            >
              <DashboardCard
                icon={<Zap size={20} />}
                title="Processing"
                value="Active"
                subtitle="Status"
              >
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 flex items-center">
                    <span className="size-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Voice processing ready
                  </p>
                </div>
              </DashboardCard>
            </motion.div>
          </div>
          
          {/* Data Visualization Chart */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <DashboardCard>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Sessions Activity</h3>
                <div className="text-xs text-gray-600 bg-gray-100 rounded-lg px-2 py-1">
                  Last 7 days
                </div>
              </div>
              {/* Simple bar chart for session activity */}
              <div className="h-[100px] flex items-end justify-between gap-1">
                {/* We'll create a simple 7-day bar chart */}
                {Array(7).fill(0).map((_, i) => {
                  // Generate random data for demonstration
                  const height = Math.max(15, Math.random() * 80);
                  const today = new Date();
                  const day = new Date(today);
                  day.setDate(today.getDate() - (6 - i));
                  const isToday = i === 6;
                  
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <motion.div 
                        className={`w-full rounded-t-md ${isToday ? 'bg-blue-primary' : 'bg-blue-primary/50'}`}
                        style={{ height: `${height}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: 0.7 + (i * 0.1) }}
                      />
                      <span className="text-xs mt-1 text-gray-500">
                        {format(day, 'EEE')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </DashboardCard>
          </motion.div>
        </section>
        {/* Floating Action Button */}
        <FloatingActionButton />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Dashboard;
