import React, { useState } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Clock, Calendar, FileText, PlusCircle, LineChart, CheckCircle2 } from 'lucide-react';
import FloatingActionButton from '../components/ui/FloatingActionButton';
import RecordingModal from '../components/ui/RecordingModal';

/**
 * Dashboard page component
 * Main landing page for authenticated therapists
 * Displays session overview and quick access to key features
 */
function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'there';
  
  // State for recording modal
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [nextSessionNumber, setNextSessionNumber] = useState(2); // For demo, assuming we have 1 session already
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Welcome Section - Glassmorphic card */}
        <section className="mb-8">
          <div className="bg-[rgba(255,255,255,0.25)] backdrop-blur rounded-xl shadow-sm border border-[#f1f1ef] p-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-[#111827] mb-2">
              Welcome back, <span className="text-[#2563eb]">{firstName}</span>
            </h1>
            <p className="text-muted-foreground mt-2">Your documentation assistant is ready.</p>
            
            {/* AI Status Indicator */}
            <div className="flex items-center mt-4 p-3 bg-glass-medium backdrop-blur rounded-lg max-w-md border border-grey-100/40">
              <div className="relative h-8 w-8 mr-3">
                <div className="absolute inset-0 rounded-full bg-blue-light backdrop-blur"></div>
                <div className="absolute inset-1 rounded-full bg-blue-gradient opacity-80"></div>
                <div className="absolute inset-2 rounded-full bg-glass-light backdrop-blur flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-primary">AI</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-grey-900">AI Processing Ready</p>
                <p className="text-xs text-grey-500">Voice transcription and SOAP generation active</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sessions Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-foreground">Today's Sessions</h2>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Today</span>
              <Calendar size={16} className="text-muted-foreground" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Session Card */}
            <div className="bg-[#fbfbfa] rounded-xl shadow-sm border-l-4 border-[#007AFF] border-[#f1f1ef] hover:shadow-md transition-shadow p-5 cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg bg-[rgba(0,122,255,0.1)] flex items-center justify-center text-[#007AFF] mr-3">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">Session #1</h3>
                    <p className="text-sm text-muted-foreground">Shoulder Evaluation</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex items-center">
                  <Clock size={12} className="mr-1" /> 10:30 AM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-success mr-2"></span>
                  <span className="text-xs text-muted-foreground">Completed</span>
                </div>
                <button className="text-xs text-blue-primary hover:text-blue-dark transition-colors font-medium">
                  View Note
                </button>
              </div>
            </div>
            
            {/* Empty Session Card with Add Button */}
            <div className="bg-[rgba(255,255,255,0.18)] backdrop-blur rounded-xl shadow-sm border border-[#f1f1ef]/50 hover:shadow-md transition-shadow p-5 flex flex-col items-center justify-center h-[124px]">
              <button 
                className="flex flex-col items-center text-[#a8a29e] hover:text-[#2563eb] transition-colors"
                onClick={() => setIsRecordingModalOpen(true)}
                aria-label="Start new session"
              >
                <PlusCircle size={24} className="mb-2" />
                <span className="text-sm font-medium">New Session</span>
              </button>
            </div>
          </div>
        </section>
        
        {/* Stats and Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-[#fbfbfa] rounded-xl shadow-sm border border-[#f1f1ef] p-5 col-span-2">
            <h3 className="text-lg font-medium mb-4">Monthly Overview</h3>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Sessions completed</span>
              <span className="font-medium">12</span>
            </div>
            <div className="h-3 bg-[#f1f1ef] rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] rounded-full" style={{width: '60%'}}></div>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="flex items-center text-sm mb-1">
                  <CheckCircle2 size={14} className="mr-1 text-success" />
                  <span>Notes Generated</span>
                </div>
                <p className="text-2xl font-semibold">8</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center text-sm mb-1">
                  <LineChart size={14} className="mr-1 text-[#007AFF]" />
                  <span>Avg. Completion</span>
                </div>
                <p className="text-2xl font-semibold">2.3<span className="text-sm text-muted-foreground"> min</span></p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-[rgba(255,255,255,0.25)] backdrop-blur rounded-xl shadow-sm border border-[#f1f1ef] p-5">
            {/* Color Test Boxes */}
            <div className="mb-4 flex space-x-2">
              <div style={{ backgroundColor: '#007AFF', width: '30px', height: '30px', borderRadius: '4px' }}></div>
              <div className="bg-[#007AFF] w-[30px] h-[30px] rounded">
              </div>
              <div className="bg-[#2563eb] w-[30px] h-[30px] rounded">
              </div>
              <div className="bg-[#1d4ed8] w-[30px] h-[30px] rounded">
              </div>
            </div>
            <h3 className="text-lg font-medium mb-4 text-[#1f1f1f]">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-between bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] hover:shadow-md text-white rounded-lg p-3 transition-all duration-200"
                onClick={() => setIsRecordingModalOpen(true)}
                aria-label="Start new recording session"
              >
                <span className="font-medium">New Session</span>
                <PlusCircle size={18} />
              </button>
              <button className="w-full flex items-center justify-between bg-[rgba(255,255,255,0.18)] hover:bg-[rgba(0,0,0,0.05)] text-[#1f1f1f] border border-[#f1f1ef] rounded-lg p-3 transition-colors">
                <span className="font-medium">Templates</span>
                <FileText size={18} className="text-[#454440]" />
              </button>
            </div>
          </div>
        </section>
        {/* Recording Modal */}
        <RecordingModal 
          isOpen={isRecordingModalOpen} 
          onClose={() => setIsRecordingModalOpen(false)} 
          sessionId={nextSessionNumber}
        />
        
        {/* Floating Action Button */}
        <FloatingActionButton onClick={() => setIsRecordingModalOpen(true)} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default Dashboard;
