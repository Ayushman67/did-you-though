-- =============================================
-- DidYouThough Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TEAMS TABLE (for Level 3 - ready but unused)
-- =============================================
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teams enable row level security;

-- =============================================
-- TEAM MEMBERS TABLE (for Level 3)
-- =============================================
create table public.team_members (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

alter table public.team_members enable row level security;

-- Team members can view their teams
create policy "Users can view teams they belong to"
  on public.teams for select
  using (
    id in (
      select team_id from public.team_members where user_id = auth.uid()
    )
  );

create policy "Users can view team members of their teams"
  on public.team_members for select
  using (
    team_id in (
      select team_id from public.team_members where user_id = auth.uid()
    )
  );

-- =============================================
-- MEETINGS TABLE
-- =============================================
create table public.meetings (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  date date not null,
  type text check (type in ('text', 'audio')) not null,
  decisions text[] default '{}',
  risks text[] default '{}',
  transcript text,
  team_id uuid references public.teams(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.meetings enable row level security;

-- Users can view their own meetings or team meetings
create policy "Users can view their own meetings"
  on public.meetings for select
  using (
    created_by = auth.uid() 
    or team_id in (
      select team_id from public.team_members where user_id = auth.uid()
    )
  );

create policy "Users can insert their own meetings"
  on public.meetings for insert
  with check (created_by = auth.uid());

create policy "Users can update their own meetings"
  on public.meetings for update
  using (created_by = auth.uid());

create policy "Users can delete their own meetings"
  on public.meetings for delete
  using (created_by = auth.uid());

-- =============================================
-- TASKS TABLE
-- =============================================
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  owner text not null default 'Unassigned',
  due_date text not null default 'TBD',
  priority text check (priority in ('High', 'Med', 'Low')) not null default 'Med',
  initiative text not null default 'General',
  status text check (status in ('Open', 'Done')) not null default 'Open',
  source_meeting text,
  source_quote text,
  source_speaker text,
  meeting_id uuid references public.meetings(id) on delete set null,
  team_id uuid references public.teams(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.tasks enable row level security;

-- Users can view their own tasks or team tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (
    created_by = auth.uid() 
    or team_id in (
      select team_id from public.team_members where user_id = auth.uid()
    )
  );

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (created_by = auth.uid());

create policy "Users can update their own tasks"
  on public.tasks for update
  using (
    created_by = auth.uid()
    or team_id in (
      select team_id from public.team_members where user_id = auth.uid()
    )
  );

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (created_by = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
create index tasks_created_by_idx on public.tasks(created_by);
create index tasks_team_id_idx on public.tasks(team_id);
create index tasks_status_idx on public.tasks(status);
create index meetings_created_by_idx on public.meetings(created_by);
create index meetings_team_id_idx on public.meetings(team_id);
create index team_members_user_id_idx on public.team_members(user_id);
create index team_members_team_id_idx on public.team_members(team_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();
