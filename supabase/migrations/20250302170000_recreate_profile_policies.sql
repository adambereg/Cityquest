-- Сначала удаляем все существующие политики
DROP POLICY IF EXISTS "Users can view any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Отключаем RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Сбрасываем все права
REVOKE ALL ON user_profiles FROM authenticated;
REVOKE ALL ON user_profiles FROM anon;
REVOKE ALL ON user_profiles FROM service_role;

-- Даем базовые права
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT, UPDATE ON user_profiles TO service_role;

-- Даем права на обновление конкретных колонок
GRANT UPDATE (
    username,
    avatar_url,
    updated_at
) ON user_profiles TO authenticated;

-- Включаем RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения (доступно всем)
CREATE POLICY "Allow read access for all users"
ON user_profiles FOR SELECT
USING (true);

-- Создаем политику для обновления своего профиля
CREATE POLICY "Allow users to update their own profile"
ON user_profiles 
FOR UPDATE
USING (auth.uid() = id::uuid)
WITH CHECK (auth.uid() = id::uuid);

-- Проверяем и обновляем владельца таблицы
ALTER TABLE user_profiles OWNER TO authenticated;

-- Обновляем последовательность для автоинкремента, если она есть
SELECT setval('user_profiles_id_seq', COALESCE((SELECT MAX(id::text::bigint) FROM user_profiles), 1), false); 