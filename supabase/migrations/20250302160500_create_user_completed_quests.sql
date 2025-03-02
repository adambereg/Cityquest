-- Создаем таблицу для завершенных квестов
CREATE TABLE IF NOT EXISTS user_completed_quests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
    points_earned integer NOT NULL DEFAULT 0,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    time_taken integer, -- время в минутах
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    
    UNIQUE(user_id, quest_id)
);

-- Включаем RLS
ALTER TABLE user_completed_quests ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view their own completed quests"
    ON user_completed_quests
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed quests"
    ON user_completed_quests
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS user_completed_quests_user_id_idx ON user_completed_quests(user_id);
CREATE INDEX IF NOT EXISTS user_completed_quests_quest_id_idx ON user_completed_quests(quest_id); 