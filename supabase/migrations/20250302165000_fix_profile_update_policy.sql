-- Удаляем все существующие политики для таблицы user_profiles
DROP POLICY IF EXISTS "Users can view any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Отключаем RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Включаем RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Создаем базовую политику для чтения
CREATE POLICY "Enable read access for all users"
ON user_profiles FOR SELECT
USING (true);

-- Создаем политику для обновления
CREATE POLICY "Enable update for users based on id"
ON user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Предоставляем права на обновление для аутентифицированных пользователей
GRANT UPDATE (username, avatar_url, updated_at) ON user_profiles TO authenticated; 