'use client';

import { useData } from '@/lib/data-context';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export default function Charts() {
  const { tasks } = useData();

  if (tasks.length === 0) {
    return null;
  }

  // Workload by owner
  const workloadData = Object.entries(
    tasks.reduce((acc, t) => ({ ...acc, [t.owner]: (acc[t.owner] || 0) + 1 }), {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.split(' ')[0], value }));

  // Priority distribution (open tasks only)
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'High' && t.status === 'Open').length, color: '#EF4444' },
    { name: 'Med', value: tasks.filter(t => t.priority === 'Med' && t.status === 'Open').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'Low' && t.status === 'Open').length, color: '#10B981' },
  ].filter(d => d.value > 0);

  // Initiative breakdown
  const initiativeData = Object.entries(
    tasks.reduce((acc, t) => ({ ...acc, [t.initiative]: (acc[t.initiative] || 0) + 1 }), {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).slice(0, 5);

  // Timeline data (cumulative tasks by date)
  const timelineData = Object.entries(
    tasks.reduce((acc, t) => {
      const date = t.createdAt.split('T')[0];
      return { ...acc, [date]: (acc[date] || 0) + 1 };
    }, {} as Record<string, number>)
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [date, count], i) => {
      const prev = i > 0 ? acc[i - 1].cumulative : 0;
      return [...acc, { 
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        cumulative: prev + count 
      }];
    }, [] as { date: string; cumulative: number }[]);

  return (
    <div className="space-y-4">
      {/* Timeline Chart */}
      {timelineData.length > 1 && (
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
            Tasks Over Time
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fill: '#9CA3AF', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false} 
                  width={30} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCumulative)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workload Distribution */}
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
            Workload
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {workloadData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 justify-center">
            {workloadData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-text-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
            Priority (Open)
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By Initiative */}
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-4">
            By Initiative
          </h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={initiativeData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#6B7280', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
