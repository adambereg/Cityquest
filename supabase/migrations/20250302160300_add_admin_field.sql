-- Добавляем поле is_admin в таблицу user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Создаем политику безопасности для поля is_admin
CREATE POLICY "Only admins can update admin status"
    ON user_profiles
    FOR UPDATE
    USING (
        is_admin = true
    )
    WITH CHECK (
        is_admin = true
    ); 