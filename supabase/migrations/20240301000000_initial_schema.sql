-- Create tables
create table public.user_profiles (
  id uuid references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  total_points integer default 0,
  status text default 'novice',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

create table public.quests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  duration integer not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  points integer not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.quest_tasks (
  id uuid default uuid_generate_v4() primary key,
  quest_id uuid references public.quests on delete cascade,
  title text not null,
  description text not null,
  type text not null check (type in ('text', 'photo', 'location')),
  answer text,
  location point,
  points integer not null,
  order_num integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles on delete cascade,
  quest_id uuid references public.quests on delete cascade,
  task_id uuid references public.quest_tasks on delete cascade,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, quest_id, task_id)
);

create table public.completed_quests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles on delete cascade,
  quest_id uuid references public.quests on delete cascade,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  points_earned integer not null,
  unique(user_id, quest_id)
);

create table public.achievements (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  icon text not null,
  requirement_type text not null check (requirement_type in ('quests_completed', 'points_earned', 'specific_quest')),
  requirement_value integer not null,
  quest_id uuid references public.quests on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.partners (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null,
  logo_url text,
  location jsonb,
  address text not null,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create functions and triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.user_profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.quests
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.quest_tasks
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.achievements
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.partners
  for each row
  execute procedure public.handle_updated_at();

create or replace function public.get_user_rank(user_id uuid)
returns integer as $$
begin
  return (
    select rank
    from (
      select id, rank() over (order by total_points desc) as rank
      from public.user_profiles
    ) as rankings
    where id = user_id
  );
end;
$$ language plpgsql;

create or replace function public.update_user_status()
returns trigger as $$
begin
  new.status = case
    when new.total_points >= 10000 then 'legend'
    when new.total_points >= 5000 then 'master'
    when new.total_points >= 1000 then 'explorer'
    else 'novice'
  end;
  return new;
end;
$$ language plpgsql;

create trigger update_user_status
  before update of total_points on public.user_profiles
  for each row
  execute procedure public.update_user_status(); 