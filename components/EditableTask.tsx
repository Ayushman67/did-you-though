'use client';

import { useState } from 'react';
import { Task, useData } from '@/lib/data-context';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Calendar, 
  Pencil, 
  Trash2, 
  X, 
  Check,
  Flag,
  Folder,
  ChevronDown,
  ChevronUp,
  Quote,
  FileText
} from 'lucide-react';

interface EditableTaskProps {
  task: Task;
  showOwner?: boolean;
}

export default function EditableTask({ task, showOwner = true }: EditableTaskProps) {
  const { updateTask, deleteTask, toggleTaskStatus } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    description: task.description,
    owner: task.owner,
    dueDate: task.dueDate,
    priority: task.priority,
    initiative: task.initiative,
  });

  const handleSave = () => {
    updateTask(task.id, editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      description: task.description,
      owner: task.owner,
      dueDate: task.dueDate,
      priority: task.priority,
      initiative: task.initiative,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  const priorityStyles = {
    High: 'badge-danger',
    Med: 'badge-warning',
    Low: 'badge-success',
  };

  const priorityOptions: Task['priority'][] = ['High', 'Med', 'Low'];

  // Delete confirmation modal
  if (showDeleteConfirm) {
    return (
      <div className="p-4 rounded-lg border-2 border-danger bg-danger-light">
        <p className="text-sm text-danger font-medium mb-3">Delete this task?</p>
        <p className="text-xs text-text-secondary mb-4 line-clamp-2">{task.description}</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-danger text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-border text-text-secondary hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="p-4 rounded-lg border-2 border-accent bg-accent-light/30">
        {/* Description */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-text-secondary mb-1">Task</label>
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={2}
            className="input text-sm resize-none"
            placeholder="Task description"
          />
        </div>

        {/* Two column layout for other fields */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Owner */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              <User className="w-3 h-3 inline mr-1" />
              Owner
            </label>
            <input
              type="text"
              value={editForm.owner}
              onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
              className="input text-sm"
              placeholder="Owner name"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={editForm.dueDate !== 'TBD' ? editForm.dueDate : ''}
              onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value || 'TBD' })}
              className="input text-sm"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              <Flag className="w-3 h-3 inline mr-1" />
              Priority
            </label>
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as Task['priority'] })}
              className="input text-sm"
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Initiative */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              <Folder className="w-3 h-3 inline mr-1" />
              Initiative
            </label>
            <input
              type="text"
              value={editForm.initiative}
              onChange={(e) => setEditForm({ ...editForm, initiative: e.target.value })}
              className="input text-sm"
              placeholder="Project/Initiative"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-dark transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white border border-border text-text-secondary hover:bg-gray-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 rounded-md text-xs font-medium text-danger hover:bg-danger-light transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Normal view mode
  const hasSource = task.sourceQuote || task.sourceMeeting;
  
  return (
    <div
      className={`
        rounded-lg border transition-all duration-150
        ${task.status === 'Done'
          ? 'bg-gray-50 border-transparent'
          : 'border-border hover:border-accent hover:shadow-sm'
        }
      `}
    >
      {/* Main task row */}
      <div className="group flex items-start gap-3 p-3">
        {/* Checkbox */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskStatus(task.id);
          }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.status === 'Done' ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-success" />
          ) : (
            <Circle className="w-4.5 h-4.5 text-text-muted hover:text-accent transition-colors" />
          )}
        </button>

        {/* Content - clickable to expand */}
        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => hasSource && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start gap-2">
            <p className={`text-sm flex-1 ${
              task.status === 'Done' 
                ? 'text-text-muted line-through' 
                : 'text-text-primary'
            }`}>
              {task.description}
            </p>
            {hasSource && (
              <button className="flex-shrink-0 p-0.5 text-text-muted hover:text-accent transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
            {showOwner && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.owner}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
            </span>
            <span className="flex items-center gap-1 text-text-muted/70">
              <Folder className="w-3 h-3" />
              {task.initiative}
            </span>
            {task.sourceQuote && (
              <span className="flex items-center gap-1 text-accent/70">
                <Quote className="w-3 h-3" />
                Has source
              </span>
            )}
          </div>
        </div>

        {/* Priority badge */}
        <span className={priorityStyles[task.priority]}>
          {task.priority}
        </span>

        {/* Edit button - visible on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-text-muted hover:text-accent hover:bg-accent-light transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded source context */}
      {isExpanded && hasSource && (
        <div className="px-3 pb-3 pt-0 animate-fade-in">
          <div className="ml-8 p-3 bg-gray-50 rounded-lg border border-border/50">
            {task.sourceQuote && (
              <div className="mb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5">
                  <Quote className="w-3.5 h-3.5 text-accent" />
                  Source Quote
                </div>
                <p className="text-sm text-text-primary italic pl-3 border-l-2 border-accent/30">
                  "{task.sourceQuote}"
                </p>
                {task.sourceSpeaker && (
                  <p className="text-xs text-text-muted mt-1 pl-3">
                    — {task.sourceSpeaker}
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <FileText className="w-3 h-3" />
              From: {task.sourceMeeting}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
