'use client';

import { useState } from 'react';
import { Task, Meeting } from '@/lib/data-context';
import { 
  X, 
  Check, 
  Trash2, 
  Pencil,
  User,
  Calendar,
  Flag,
  Folder,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Quote,
  FileText
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tasks: Task[], meeting: Meeting) => void;
  extractedTasks: Task[];
  extractedMeeting: Meeting;
}

export default function ReviewModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  extractedTasks,
  extractedMeeting 
}: ReviewModalProps) {
  const [tasks, setTasks] = useState<Task[]>(extractedTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  if (!isOpen) return null;

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm({
      description: task.description,
      owner: task.owner,
      dueDate: task.dueDate,
      priority: task.priority,
      initiative: task.initiative,
    });
  };

  const handleSaveEdit = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, ...editForm } : t
    ));
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleConfirm = () => {
    onConfirm(tasks, extractedMeeting);
  };

  const priorityOptions: Task['priority'][] = ['High', 'Med', 'Low'];
  
  const priorityStyles = {
    High: 'bg-danger-light text-danger',
    Med: 'bg-warning-light text-warning',
    Low: 'bg-success-light text-success',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Review Extracted Items</h2>
              <p className="text-sm text-text-muted">
                {extractedMeeting.name} · {tasks.length} tasks found
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Tasks Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-text-primary">Tasks ({tasks.length})</h3>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-text-muted">No tasks extracted</p>
                <p className="text-xs text-text-muted mt-1">The AI couldn't find any action items</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    {editingId === task.id ? (
                      /* Edit Mode */
                      <div className="p-4 bg-accent-light/30">
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-text-secondary mb-1">Task</label>
                          <textarea
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={2}
                            className="input text-sm resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              <User className="w-3 h-3 inline mr-1" />Owner
                            </label>
                            <input
                              type="text"
                              value={editForm.owner || ''}
                              onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                              className="input text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              <Calendar className="w-3 h-3 inline mr-1" />Due Date
                            </label>
                            <input
                              type="date"
                              value={editForm.dueDate !== 'TBD' ? editForm.dueDate : ''}
                              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value || 'TBD' })}
                              className="input text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              <Flag className="w-3 h-3 inline mr-1" />Priority
                            </label>
                            <select
                              value={editForm.priority || 'Med'}
                              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
                              className="input text-sm"
                            >
                              {priorityOptions.map((p) => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                              <Folder className="w-3 h-3 inline mr-1" />Initiative
                            </label>
                            <input
                              type="text"
                              value={editForm.initiative || ''}
                              onChange={(e) => setEditForm({ ...editForm, initiative: e.target.value })}
                              className="input text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(task.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-dark transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white border border-border text-text-secondary hover:bg-gray-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary mb-1.5">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {task.owner}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {task.dueDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Folder className="w-3 h-3" />
                                {task.initiative}
                              </span>
                            </div>
                            {/* Source Quote */}
                            {task.sourceQuote && (
                              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-1 text-xs text-text-muted mb-1">
                                  <Quote className="w-3 h-3 text-accent" />
                                  <span>Source</span>
                                </div>
                                <p className="text-xs text-text-secondary italic">
                                  "{task.sourceQuote}"
                                  {task.sourceSpeaker && (
                                    <span className="not-italic text-text-muted"> — {task.sourceSpeaker}</span>
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityStyles[task.priority]}`}>
                            {task.priority}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(task)}
                              className="p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent-light transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger-light transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decisions Section */}
          {extractedMeeting.decisions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Decisions ({extractedMeeting.decisions.length})
                </h3>
              </div>
              <div className="space-y-2">
                {extractedMeeting.decisions.map((decision, i) => (
                  <div key={i} className="p-3 bg-success-light/50 rounded-lg border border-success/20">
                    <p className="text-sm text-text-primary">{decision}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risks Section */}
          {extractedMeeting.risks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Risks ({extractedMeeting.risks.length})
                </h3>
              </div>
              <div className="space-y-2">
                {extractedMeeting.risks.map((risk, i) => (
                  <div key={i} className="p-3 bg-warning-light/50 rounded-lg border border-warning/20">
                    <p className="text-sm text-text-primary">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-border bg-gray-50">
          <p className="text-xs text-text-muted">
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            Review and edit before saving
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={tasks.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Save {tasks.length} Task{tasks.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
