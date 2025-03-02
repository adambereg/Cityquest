-- Обновляем таблицу user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rank integer DEFAULT 0;

-- Создаем функцию для подсчета ранга пользователя
CREATE OR REPLACE FUNCTION get_user_rank(user_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    user_rank integer;
BEGIN
    SELECT rank
    INTO user_rank
    FROM (
        SELECT id,
               RANK() OVER (ORDER BY total_points DESC) as rank
        FROM user_profiles
    ) rankings
    WHERE id = user_id;
    
    RETURN user_rank;
END;
$$;

-- Создаем функцию для обновления общего количества очков пользователя
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE user_profiles
    SET total_points = (
        SELECT COALESCE(SUM(points_earned), 0)
        FROM user_completed_quests
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$;

-- Создаем триггер для автоматического обновления очков
DROP TRIGGER IF EXISTS update_points_trigger ON user_completed_quests;
CREATE TRIGGER update_points_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON user_completed_quests
    FOR EACH ROW
    EXECUTE FUNCTION update_user_total_points(); 