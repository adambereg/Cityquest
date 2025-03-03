-- Сначала удалим существующие политики
DROP POLICY IF EXISTS "Users can view any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Создаем политики заново
CREATE POLICY "Users can view any profile"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Включаем RLS, если вдруг она была выключена
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY; 