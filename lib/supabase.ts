import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Types for database tables
export interface DbTask {
  id: string;
  description: string;
  owner: string;
  due_date: string;
  priority: 'High' | 'Med' | 'Low';
  initiative: string;
  status: 'Open' | 'Done';
  source_meeting: string | null;
  source_quote: string | null;
  source_speaker: string | null;
  meeting_id: string | null;
  team_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbMeeting {
  id: string;
  name: string;
  date: string;
  type: 'text' | 'audio';
  decisions: string[];
  risks: string[];
  transcript: string | null;
  team_id: string | null;
  created_by: string;
  created_at: string;
}

export interface DbProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTeam {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

export interface DbTeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}
