-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create rooms table
create table public.rooms (
  id uuid default uuid_generate_v4() primary key,
  token text unique not null,
  video_url text,
  is_playing boolean default false,
  playback_time double precision default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_name text not null,
  device_id text,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.rooms enable row level security;
alter table public.messages enable row level security;

-- Create open policies for anonymous access (Since this is a simple room-code app)
create policy "Allow anonymous read access to rooms"
  on public.rooms for select
  using (true);

create policy "Allow anonymous insert access to rooms"
  on public.rooms for insert
  with check (true);

create policy "Allow anonymous update access to rooms"
  on public.rooms for update
  using (true);

create policy "Allow anonymous read access to messages"
  on public.messages for select
  using (true);

create policy "Allow anonymous insert access to messages"
  on public.messages for insert
  with check (true);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.rooms
  for each row
  execute procedure public.handle_updated_at();

-- Note: We are primarily using Supabase Realtime Channels (api broadcasts) so these tables 
-- are only strictly necessary if you want persistent history instead of ephemeral rooms.
