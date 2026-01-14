'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { createClient, DbTask, DbMeeting } from './supabase';
import { useAuth } from './auth-context';

// App-level types (matching existing interface)
export interface Task {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  priority: 'High' | 'Med' | 'Low';
  initiative: string;
  status: 'Open' | 'Done';
  sourceMeeting: string;
  sourceQuote?: string;
  sourceSpeaker?: string;
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

interface DataContextType {
  tasks: Task[];
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
  addTasks: (tasks: Task[]) => Promise<void>;
  addMeeting: (meeting: Meeting) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Convert DB format to App format
function dbTaskToApp(dbTask: DbTask): Task {
  return {
    id: dbTask.id,
    description: dbTask.description,
    owner: dbTask.owner,
    dueDate: dbTask.due_date,
    priority: dbTask.priority,
    initiative: dbTask.initiative,
    status: dbTask.status,
    sourceMeeting: dbTask.source_meeting || '',
    sourceQuote: dbTask.source_quote || undefined,
    sourceSpeaker: dbTask.source_speaker || undefined,
    createdAt: dbTask.created_at,
  };
}

function dbMeetingToApp(dbMeeting: DbMeeting): Meeting {
  return {
    id: dbMeeting.id,
    date: dbMeeting.date,
    name: dbMeeting.name,
    type: dbMeeting.type,
    decisions: dbMeeting.decisions || [],
    risks: dbMeeting.risks || [],
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch all data for current user
  const refreshData = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setMeetings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Tasks fetch error:', tasksError);
        // Don't throw, just log and continue with empty data
        setTasks([]);
      } else {
        setTasks((tasksData || []).map(dbTaskToApp));
      }

      // Fetch meetings
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (meetingsError) {
        console.error('Meetings fetch error:', meetingsError);
        // Don't throw, just log and continue with empty data
        setMeetings([]);
      } else {
        setMeetings((meetingsData || []).map(dbMeetingToApp));
      }
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Set empty arrays so UI doesn't hang
      setTasks([]);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `created_by=eq.${user.id}`,
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    const meetingsSubscription = supabase
      .channel('meetings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
          filter: `created_by=eq.${user.id}`,
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(meetingsSubscription);
    };
  }, [user, supabase, refreshData]);

  const addTasks = async (newTasks: Task[]) => {
    if (!user) {
      console.error('addTasks: No user logged in');
      return;
    }

    console.log('addTasks: Adding', newTasks.length, 'tasks for user', user.id);

    const dbTasks = newTasks.map(task => ({
      description: task.description,
      owner: task.owner,
      due_date: task.dueDate,
      priority: task.priority,
      initiative: task.initiative,
      status: task.status,
      source_meeting: task.sourceMeeting || null,
      source_quote: task.sourceQuote || null,
      source_speaker: task.sourceSpeaker || null,
      created_by: user.id,
    }));

    console.log('addTasks: Inserting to Supabase:', dbTasks);

    const { data, error } = await supabase.from('tasks').insert(dbTasks).select();
    
    if (error) {
      console.error('addTasks: Supabase error:', error);
      setError(error.message);
      throw error;
    }

    console.log('addTasks: Success, inserted:', data);
    await refreshData();
  };

  const addMeeting = async (meeting: Meeting) => {
    if (!user) {
      console.error('addMeeting: No user logged in');
      return;
    }

    console.log('addMeeting: Adding meeting for user', user.id);

    const dbMeeting = {
      name: meeting.name,
      date: meeting.date,
      type: meeting.type,
      decisions: meeting.decisions,
      risks: meeting.risks,
      created_by: user.id,
    };

    const { data, error } = await supabase.from('meetings').insert(dbMeeting).select();
    
    if (error) {
      console.error('addMeeting: Supabase error:', error);
      setError(error.message);
      throw error;
    }

    console.log('addMeeting: Success, inserted:', data);
    await refreshData();
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.owner !== undefined) dbUpdates.owner = updates.owner;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.initiative !== undefined) dbUpdates.initiative = updates.initiative;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .eq('created_by', user.id);
    
    if (error) {
      setError(error.message);
      throw error;
    }

    await refreshData();
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('created_by', user.id);
    
    if (error) {
      setError(error.message);
      throw error;
    }

    await refreshData();
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'Open' ? 'Done' : 'Open';
    await updateTask(taskId, { status: newStatus });
  };

  const clearAllData = async () => {
    if (!user) return;

    // Delete all tasks
    await supabase.from('tasks').delete().eq('created_by', user.id);
    // Delete all meetings
    await supabase.from('meetings').delete().eq('created_by', user.id);
    
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        meetings,
        isLoading,
        error,
        addTasks,
        addMeeting,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        clearAllData,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
