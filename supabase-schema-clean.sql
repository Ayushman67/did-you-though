-- =============================================
-- DidYouThough Database Schema (CLEAN INSTALL)
-- Run this in Supabase SQL Editor
-- =============================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.meetings CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tasks_updated_at ON public.tasks;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- TEAMS TABLE (for Level 3 - ready but unused)
-- =============================================
CREATE TABLE public.teams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TEAM MEMBERS TABLE (for Level 3)
-- =============================================
CREATE TABLE public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team members can view their teams
CREATE POLICY "Users can view teams they belong to"
  ON public.teams FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view team members of their teams"
  ON public.team_members FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- MEETINGS TABLE
-- =============================================
CREATE TABLE public.meetings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  date date NOT NULL,
  type text CHECK (type IN ('text', 'audio')) NOT NULL,
  decisions text[] DEFAULT '{}',
  risks text[] DEFAULT '{}',
  transcript text,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Users can view their own meetings or team meetings
CREATE POLICY "Users can view their own meetings"
  ON public.meetings FOR SELECT
  USING (
    created_by = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own meetings"
  ON public.meetings FOR DELETE
  USING (created_by = auth.uid());

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE public.tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  description text NOT NULL,
  owner text NOT NULL DEFAULT 'Unassigned',
  due_date text NOT NULL DEFAULT 'TBD',
  priority text CHECK (priority IN ('High', 'Med', 'Low')) NOT NULL DEFAULT 'Med',
  initiative text NOT NULL DEFAULT 'General',
  status text CHECK (status IN ('Open', 'Done')) NOT NULL DEFAULT 'Open',
  source_meeting text,
  source_quote text,
  source_speaker text,
  meeting_id uuid REFERENCES public.meetings(id) ON DELETE SET NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tasks or team tasks
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (
    created_by = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own tasks"
  ON public.tasks FOR UPDATE
  USING (
    created_by = auth.uid()
    OR team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own tasks"
  ON public.tasks FOR DELETE
  USING (created_by = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX tasks_created_by_idx ON public.tasks(created_by);
CREATE INDEX tasks_team_id_idx ON public.tasks(team_id);
CREATE INDEX tasks_status_idx ON public.tasks(status);
CREATE INDEX meetings_created_by_idx ON public.meetings(created_by);
CREATE INDEX meetings_team_id_idx ON public.meetings(team_id);
CREATE INDEX team_members_user_id_idx ON public.team_members(user_id);
CREATE INDEX team_members_team_id_idx ON public.team_members(team_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- =============================================
-- DONE!
-- =============================================
SELECT 'Schema created successfully!' as status;
