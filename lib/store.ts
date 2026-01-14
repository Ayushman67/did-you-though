import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: 'High' | 'Med' | 'Low';
  initiative: string;
  status: 'Open' | 'Done';
  sourceMeeting: string;
  sourceQuote?: string;  // The exact quote from transcript that generated this task
  sourceSpeaker?: string; // Who said it
  createdAt: string;
}

export interface Meeting {
  id: string;
  date: string;
  name: string;
  type: 'text' | 'audio';
  decisions: string[];
  risks: string[];
}

export interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCreatedFirstTask: boolean;
  hasCompletedFirstTask: boolean;
  hasEditedTask: boolean;
  currentStep: number; // 0 = not started, 1-4 = steps, 5 = complete
}

interface AppState {
  tasks: Task[];
  meetings: Meeting[];
  justCompleted: string | null;
  onboarding: OnboardingState;
  addTasks: (tasks: Task[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'sourceMeeting'>>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  clearJustCompleted: () => void;
  clearAllData: () => void;
  advanceOnboarding: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      tasks: [],
      meetings: [],
      justCompleted: null,
      onboarding: {
        hasSeenWelcome: false,
        hasCreatedFirstTask: false,
        hasCompletedFirstTask: false,
        hasEditedTask: false,
        currentStep: 0,
      },

      addTasks: (newTasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
          onboarding: state.onboarding.hasCreatedFirstTask 
            ? state.onboarding 
            : { 
                ...state.onboarding, 
                hasCreatedFirstTask: true,
                currentStep: state.onboarding.currentStep === 1 ? 2 : state.onboarding.currentStep
              },
        })),

      addMeeting: (meeting) =>
        set((state) => ({
          meetings: [meeting, ...state.meetings],
        })),

      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),

      toggleTaskStatus: (taskId) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          const wasOpen = task?.status === 'Open';
          return {
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? { ...t, status: t.status === 'Open' ? 'Done' : 'Open' }
                : t
            ),
            justCompleted: wasOpen ? task?.description || null : null,
            onboarding: wasOpen && !state.onboarding.hasCompletedFirstTask
              ? {
                  ...state.onboarding,
                  hasCompletedFirstTask: true,
                  currentStep: state.onboarding.currentStep === 2 ? 3 : state.onboarding.currentStep
                }
              : state.onboarding,
          };
        }),

      clearJustCompleted: () => set({ justCompleted: null }),

      clearAllData: () => set({ 
        tasks: [], 
        meetings: [], 
        justCompleted: null,
      }),

      advanceOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            hasSeenWelcome: true,
            currentStep: state.onboarding.currentStep === 0 ? 1 : state.onboarding.currentStep,
          },
        })),

      completeOnboarding: () =>
        set((state) => ({
          onboarding: {
            ...state.onboarding,
            currentStep: 5,
          },
        })),

      resetOnboarding: () =>
        set({
          onboarding: {
            hasSeenWelcome: false,
            hasCreatedFirstTask: false,
            hasCompletedFirstTask: false,
            hasEditedTask: false,
            currentStep: 0,
          },
        }),
    }),
    {
      name: 'didyouthough-storage',
    }
  )
);
