-- Создаем функцию для обновления профиля
CREATE OR REPLACE FUNCTION update_user_profile(
  profile_username text,
  profile_avatar_url text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  -- Обновляем профиль текущего пользователя
  UPDATE user_profiles
  SET 
    username = profile_username,
    avatar_url = profile_avatar_url,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = auth.uid()
  RETURNING json_build_object(
    'id', id,
    'username', username,
    'avatar_url', avatar_url,
    'updated_at', updated_at
  ) INTO result;
  
  RETURN result;
END;
$$; 