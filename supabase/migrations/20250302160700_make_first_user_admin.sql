-- Делаем первого пользователя администратором
UPDATE user_profiles
SET is_admin = true
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'fred89059599296@gmail.com'
); 