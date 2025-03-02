-- Создаем enum для сложности квеста
CREATE TYPE quest_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Создаем таблицу квестов
CREATE TABLE IF NOT EXISTS quests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    difficulty quest_difficulty NOT NULL DEFAULT 'medium',
    points_reward integer NOT NULL DEFAULT 0,
    estimated_time integer, -- предполагаемое время прохождения в минутах
    image_url text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Включаем RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Quests are viewable by everyone"
    ON quests
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can insert quests"
    ON quests
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

CREATE POLICY "Only admins can update quests"
    ON quests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

CREATE POLICY "Only admins can delete quests"
    ON quests
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND is_admin = true
        )
    );

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS quests_created_by_idx ON quests(created_by);
CREATE INDEX IF NOT EXISTS quests_difficulty_idx ON quests(difficulty);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quests_updated_at
    BEFORE UPDATE
    ON quests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 