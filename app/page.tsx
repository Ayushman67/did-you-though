'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import MeetingInput from '@/components/MeetingInput';
import TaskList from '@/components/TaskList';
import StatsCards from '@/components/StatsCards';
import Charts from '@/components/Charts';
import PeopleView from '@/components/PeopleView';
import MeetingLog from '@/components/MeetingLog';
import CompletionToast from '@/components/CompletionToast';
import Onboarding from '@/components/Onboarding';
import AuthModal from '@/components/AuthModal';
import { Flame, Loader2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'people' | 'meetings'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  // Loading state
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
        </div>
      </div>
    );
  }

  // Not logged in - show landing
  if (!user) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-3">
              DidYouThough?
            </h1>
            <p className="text-lg text-text-secondary mb-2">
              AI Meeting Accountability Engine
            </p>
            <p className="text-text-muted mb-8">
              Turn "I'll take care of it" into a visible, trackable graph of tasks, decisions, and risks from meetings.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary text-base px-8 py-3"
            >
              Get Started
            </button>
            <p className="text-xs text-text-muted mt-4">
              Free to use · No credit card required
            </p>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <Header />
          
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fade-in">
              <StatsCards />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MeetingInput />
                <TaskList />
              </div>
              
              <Charts />
            </div>
          )}
          
          {activeTab === 'people' && (
            <div className="animate-fade-in">
              <PeopleView />
            </div>
          )}
          
          {activeTab === 'meetings' && (
            <div className="animate-fade-in">
              <MeetingLog />
            </div>
          )}
        </div>
      </main>
      
      <CompletionToast />
      <Onboarding />
    </div>
  );
}
