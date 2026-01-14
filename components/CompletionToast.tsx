'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/lib/data-context';
import { CheckCircle, X } from 'lucide-react';

export default function CompletionToast() {
  const { tasks } = useData();
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Track when a task gets completed
  useEffect(() => {
    const doneTasks = tasks.filter(t => t.status === 'Done');
    if (doneTasks.length > 0) {
      const mostRecent = doneTasks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      if (mostRecent && mostRecent.description !== lastCompleted) {
        setLastCompleted(mostRecent.description);
        setShowToast(true);
        const timer = setTimeout(() => setShowToast(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [tasks]);

  if (!showToast || !lastCompleted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 bg-surface rounded-xl shadow-lg border border-success/20 max-w-sm">
        <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-success">Task completed!</p>
          <p className="text-xs text-text-muted truncate">{lastCompleted}</p>
        </div>
        <button
          onClick={() => setShowToast(false)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-text-muted" />
        </button>
      </div>
    </div>
  );
}
