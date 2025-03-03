-- Добавляем поле updated_at, если его нет
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Обновляем тип поля avatar_url, чтобы оно могло быть NULL
ALTER TABLE user_profiles
ALTER COLUMN avatar_url DROP NOT NULL;

-- Обновляем тип поля username, добавляем ограничения
ALTER TABLE user_profiles
ADD CONSTRAINT username_length CHECK (char_length(username) >= 2 AND char_length(username) <= 30),
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Zа-яА-Я0-9_-]+$'); 