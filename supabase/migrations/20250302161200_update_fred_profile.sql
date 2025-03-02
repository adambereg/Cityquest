-- Обновляем профиль пользователя
INSERT INTO user_profiles (id, username, total_points, is_admin)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'fred89059599296@gmail.com'),
    'fred',
    0,
    true
)
ON CONFLICT (id) DO UPDATE
SET username = 'fred',
    is_admin = true,
    total_points = 0; 