'use client';

import { useState } from 'react';
import { useData } from '@/lib/data-context';
import { Calendar, FileText, Mic, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';

export default function MeetingLog() {
  const { meetings } = useData();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (meetings.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <p className="text-text-secondary">No meetings processed yet</p>
        <p className="text-sm text-text-muted mt-1">Process a meeting to see it here</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Meeting Log</h2>
            <p className="text-xs text-text-muted">{meetings.length} meetings processed</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {meetings.map((meeting) => (
          <div key={meeting.id}>
            {/* Meeting Header */}
            <button
              onClick={() => setExpandedId(expandedId === meeting.id ? null : meeting.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  meeting.type === 'audio'
                    ? 'bg-purple-50'
                    : 'bg-cyan-50'
                }`}>
                  {meeting.type === 'audio' ? (
                    <Mic className="w-5 h-5 text-purple-500" />
                  ) : (
                    <FileText className="w-5 h-5 text-cyan-500" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-medium text-text-primary">{meeting.name}</h3>
                  <p className="text-xs text-text-muted">{meeting.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    {meeting.decisions.length} decisions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                    {meeting.risks.length} risks
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-text-muted transition-transform ${
                  expandedId === meeting.id ? 'rotate-180' : ''
                }`} />
              </div>
            </button>

            {/* Expanded Content */}
            {expandedId === meeting.id && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  {/* Decisions */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-success uppercase tracking-wide mb-3">
                      <CheckCircle className="w-4 h-4" />
                      Decisions Made
                    </h4>
                    {meeting.decisions.length > 0 ? (
                      <ul className="space-y-2">
                        {meeting.decisions.map((decision, i) => (
                          <li
                            key={i}
                            className="text-sm text-text-secondary pl-4 border-l-2 border-success/30"
                          >
                            {decision}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-text-muted">No decisions captured</p>
                    )}
                  </div>

                  {/* Risks */}
                  <div>
                    <h4 className="flex items-center gap-2 text-xs font-semibold text-warning uppercase tracking-wide mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Risks Identified
                    </h4>
                    {meeting.risks.length > 0 ? (
                      <ul className="space-y-2">
                        {meeting.risks.map((risk, i) => (
                          <li
                            key={i}
                            className="text-sm text-text-secondary pl-4 border-l-2 border-warning/30"
                          >
                            {risk}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-text-muted">No risks identified</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
