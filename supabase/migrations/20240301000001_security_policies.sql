-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "view_own_profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "update_own_profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "admin_manage_profiles"
ON public.user_profiles
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create policies for quests
CREATE POLICY "view_quests"
ON public.quests
FOR SELECT
USING (true);

CREATE POLICY "admin_manage_quests"
ON public.quests
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create policies for quest_tasks
CREATE POLICY "view_tasks"
ON public.quest_tasks
FOR SELECT
USING (true);

CREATE POLICY "admin_manage_tasks"
ON public.quest_tasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create policies for user_progress
CREATE POLICY "view_own_progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "update_own_progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "admin_view_progress"
ON public.user_progress
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create policies for completed_quests
CREATE POLICY "view_own_completed"
ON public.completed_quests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "mark_completed"
ON public.completed_quests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admin_view_completed"
ON public.completed_quests
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create policies for achievements
CREATE POLICY "view_achievements"
ON public.achievements
FOR SELECT
USING (true);

CREATE POLICY "admin_manage_achievements"
ON public.achievements
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
);

-- Create policies for partners
CREATE POLICY "view_partners"
ON public.partners
FOR SELECT
USING (true);

CREATE POLICY "admin_manage_partners"
ON public.partners
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'admin'
    )
); 