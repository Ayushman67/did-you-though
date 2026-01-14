'use client';

import { useData } from '@/lib/data-context';


export default function Header() {
  const { tasks } = useData();
  
  const openTasks = tasks.filter(t => t.status === 'Open').length;
  const highPriority = tasks.filter(t => t.priority === 'High' && t.status === 'Open').length;

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-light">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              <span className="text-xs font-medium text-accent">Live</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            Good {getTimeOfDay()}
          </h1>
          <p className="text-sm text-text-secondary">
            {openTasks === 0 
              ? "You're all caught up! No open tasks."
              : `You have ${openTasks} open task${openTasks === 1 ? '' : 's'}${highPriority > 0 ? `, ${highPriority} high priority` : ''}.`
            }
          </p>
        </div>


      </div>
    </header>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
