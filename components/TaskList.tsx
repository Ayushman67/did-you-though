'use client';

import { useState } from 'react';
import { useData, Task } from '@/lib/data-context';
import { CheckCircle2, User, ChevronDown, Plus } from 'lucide-react';
import EditableTask from './EditableTask';

export default function TaskList() {
  const { tasks, addTasks } = useData();
  const [statusFilter, setStatusFilter] = useState<'Open' | 'Done' | 'all'>('Open');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    description: '',
    owner: '',
    dueDate: '',
    priority: 'Med' as const,
    initiative: 'General',
  });

  const owners = Array.from(new Set(tasks.map(t => t.owner)));

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (ownerFilter !== 'all' && t.owner !== ownerFilter) return false;
    return true;
  });

  const handleAddTask = () => {
    if (!newTask.description.trim()) return;
    
    addTasks([{
      id: `T-${Date.now()}`,
      description: newTask.description,
      owner: newTask.owner || 'Unassigned',
      dueDate: newTask.dueDate || 'TBD',
      priority: newTask.priority,
      initiative: newTask.initiative || 'General',
      status: 'Open',
      sourceMeeting: 'Manual',
      createdAt: new Date().toISOString(),
    }]);
    
    setNewTask({
      description: '',
      owner: '',
      dueDate: '',
      priority: 'Med',
      initiative: 'General',
    });
    setIsAddingTask(false);
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Tasks</h2>
            <p className="text-xs text-text-muted">{filteredTasks.length} items</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        {/* Status Filter */}
        <div className="flex gap-1 p-1 bg-gray-50 rounded-lg">
          {(['Open', 'Done', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {/* Owner Filter */}
        <div className="relative">
          <button
            onClick={() => setShowOwnerDropdown(!showOwnerDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-text-secondary hover:bg-gray-50 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            {ownerFilter === 'all' ? 'All owners' : ownerFilter}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showOwnerDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg z-10 py-1">
              {owners.map((owner) => (
                <button
                  key={owner}
                  onClick={() => {
                    setOwnerFilter(owner);
                    setShowOwnerDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                    ownerFilter === owner ? 'text-accent font-medium' : 'text-text-secondary'
                  }`}
                >
                  {owner === 'all' ? 'All owners' : owner}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Task Button */}
      {!isAddingTask && (
        <button
          onClick={() => setIsAddingTask(true)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-border text-xs font-medium text-text-muted hover:border-accent hover:text-accent hover:bg-accent-light/30 transition-colors mb-3"
        >
          <Plus className="w-4 h-4" />
          Add Task Manually
        </button>
      )}

      {/* New Task Form */}
      {isAddingTask && (
        <div className="p-4 rounded-lg border-2 border-accent bg-accent-light/30 mb-3">
          <div className="mb-3">
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows={2}
              className="input text-sm resize-none"
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newTask.owner}
              onChange={(e) => setNewTask({ ...newTask, owner: e.target.value })}
              className="input text-sm"
              placeholder="Owner"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="input text-sm"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'High' | 'Med' | 'Low' })}
              className="input text-sm"
            >
              <option value="High">High</option>
              <option value="Med">Med</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="text"
              value={newTask.initiative}
              onChange={(e) => setNewTask({ ...newTask, initiative: e.target.value })}
              className="input text-sm"
              placeholder="Initiative"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={!newTask.description.trim()}
              className="flex-1 px-3 py-2 rounded-md text-xs font-medium bg-accent text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              Add Task
            </button>
            <button
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-2 rounded-md text-xs font-medium bg-white border border-border text-text-secondary hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">No tasks yet</p>
            <p className="text-xs text-text-muted mt-1">Process a meeting to extract tasks</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <EditableTask key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}
