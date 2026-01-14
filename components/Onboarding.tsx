'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Pencil, 
  Users, 
  ArrowRight,
  Flame,
  Quote,
  ChevronRight
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to DidYouThough! 🎉",
    description: "Turn meeting chaos into clear accountability. Let's show you how it works.",
    icon: Flame,
    color: 'bg-accent',
  },
  {
    id: 2,
    title: "Process Your First Meeting",
    description: "Paste meeting notes or upload audio. Our AI will extract tasks, decisions, and risks automatically.",
    icon: Sparkles,
    color: 'bg-purple-500',
    highlight: 'meeting-input',
  },
  {
    id: 3,
    title: "Your Tasks Are Ready! ✨",
    description: "Click on any task to see where it came from in the transcript. This builds trust in the AI extraction.",
    icon: Quote,
    color: 'bg-cyan-500',
    highlight: 'task-list',
  },
  {
    id: 4,
    title: "Edit & Complete Tasks",
    description: "Hover over a task and click the pencil to edit. Click the checkbox to mark it done. You're in control!",
    icon: Pencil,
    color: 'bg-amber-500',
    highlight: 'task-list',
  },
  {
    id: 5,
    title: "Track Your Team",
    description: "Switch to the People tab to see who owns what, and generate follow-up emails with one click.",
    icon: Users,
    color: 'bg-emerald-500',
    highlight: 'people-tab',
  },
];

export default function Onboarding() {
  const { tasks } = useData();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  // Check localStorage for onboarding state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('didyouthough-onboarding-complete');
      if (!seen && user) {
        setHasSeenOnboarding(false);
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Auto-advance when tasks are created
  useEffect(() => {
    if (currentStepIndex === 1 && tasks.length > 0) {
      setCurrentStepIndex(2);
    }
  }, [tasks.length, currentStepIndex]);

  const handleStart = () => {
    setCurrentStepIndex(1);
  };

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('didyouthough-onboarding-complete', 'true');
    setHasSeenOnboarding(true);
    setIsVisible(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Don't render if onboarding is complete or not logged in
  if (hasSeenOnboarding || !user) return null;

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  return (
    <>
      {/* Welcome Modal */}
      {isVisible && currentStepIndex === 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="bg-gradient-to-br from-accent to-purple-600 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to DidYouThough!
              </h2>
              <p className="text-white/80 text-sm">
                Your AI-powered meeting accountability engine
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Extract tasks automatically</p>
                    <p className="text-xs text-text-muted">Paste notes or upload audio - AI does the rest</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-success-light flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Track & complete tasks</p>
                    <p className="text-xs text-text-muted">See who owns what and close the loop</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Quote className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Source transparency</p>
                    <p className="text-xs text-text-muted">Click any task to see where it came from</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-100 transition-colors"
                >
                  Skip tour
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-dark transition-colors"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Tooltips */}
      {isVisible && currentStepIndex > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-surface rounded-xl shadow-2xl border border-border max-w-sm w-full overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <div 
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(currentStepIndex / (ONBOARDING_STEPS.length - 1)) * 100}%` }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${currentStep.color} flex items-center justify-center flex-shrink-0`}>
                  <currentStep.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    {currentStep.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>
                <button
                  onClick={handleSkip}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {ONBOARDING_STEPS.slice(1).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i + 1 <= currentStepIndex ? 'bg-accent' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:bg-accent-dark transition-colors"
                >
                  {currentStepIndex === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
