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

-- Даем базовые права
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT, UPDATE ON user_profiles TO authenticated;

-- Включаем RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Создаем политику для чтения (доступно всем)
CREATE POLICY "Enable read access for all users"
ON user_profiles FOR SELECT
USING (true);

-- Создаем политику для обновления своего профиля
CREATE POLICY "Enable update for users based on id"
ON user_profiles 
FOR UPDATE
USING (auth.uid() = id::uuid)
WITH CHECK (auth.uid() = id::uuid); 