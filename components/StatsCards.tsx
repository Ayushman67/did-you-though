'use client';

import { useData } from '@/lib/data-context';
import { Clock, AlertTriangle, CheckCircle2, Layers } from 'lucide-react';

export default function StatsCards() {
  const { tasks } = useData();

  const openTasks = tasks.filter(t => t.status === 'Open').length;
  const highPriority = tasks.filter(t => t.priority === 'High' && t.status === 'Open').length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const initiatives = Array.from(new Set(tasks.map(t => t.initiative))).length;

  const stats = [
    {
      label: 'Open Tasks',
      value: openTasks,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning-light',
    },
    {
      label: 'High Priority',
      value: highPriority,
      icon: AlertTriangle,
      color: 'text-danger',
      bgColor: 'bg-danger-light',
    },
    {
      label: 'Completed',
      value: doneTasks,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success-light',
    },
    {
      label: 'Initiatives',
      value: initiatives,
      icon: Layers,
      color: 'text-accent',
      bgColor: 'bg-accent-light',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
              {stat.label}
            </span>
            <div className={`w-7 h-7 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
          </div>
          <div className="text-2xl font-semibold text-text-primary">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
