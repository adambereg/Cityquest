import { useState, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, Upload } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentAvatarUrl: string;
  userId: string;
  onProfileUpdate: () => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
  currentUsername,
  currentAvatarUrl,
  userId,
  onProfileUpdate
}: EditProfileModalProps) => {
  const [username, setUsername] = useState(currentUsername);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Добавляем логирование при монтировании компонента
  useEffect(() => {
    console.log('EditProfileModal mounted with props:', {
      currentUsername,
      currentAvatarUrl,
      userId
    });
  }, [currentUsername, currentAvatarUrl, userId]);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Проверяем размер файла (максимум 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Размер файла не должен превышать 2MB');
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        throw new Error('Пожалуйста, загрузите изображение');
      }

      // Удаляем старый аватар, если он существует и не является дефолтным
      if (avatarUrl && !avatarUrl.includes('default-avatar.png')) {
        try {
          const oldFileName = avatarUrl.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('avatars')
              .remove([oldFileName]);
          }
        } catch (error) {
          console.error('Error removing old avatar:', error);
          // Продолжаем выполнение, даже если не удалось удалить старый аватар
        }
      }

      // Загружаем новый файл
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      console.log('Uploading new avatar:', { fileName });

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Avatar uploaded successfully:', { publicUrl });

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке аватара');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Получаем текущую сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Ошибка авторизации: ' + sessionError.message);
      }

      if (!session) {
        throw new Error('Пользователь не авторизован');
      }

      console.log('Current session:', session);

      // Проверяем, что userId совпадает с id текущего пользователя
      if (session.user.id !== userId) {
        throw new Error('Нет прав для редактирования этого профиля');
      }

      // Проверяем длину имени пользователя
      if (username.length < 2 || username.length > 30) {
        throw new Error('Имя пользователя должно содержать от 2 до 30 символов');
      }

      // Проверяем, что имя содержит только допустимые символы
      if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(username)) {
        throw new Error('Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание');
      }

      console.log('Updating profile:', {
        username,
        avatar_url: avatarUrl,
        userId,
        sessionUserId: session.user.id
      });

      // Обновляем профиль через RPC
      const { data, error: updateError } = await supabase
        .rpc('update_user_profile', {
          profile_username: username,
          profile_avatar_url: avatarUrl
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(updateError.message);
      }

      console.log('Profile updated successfully:', data);

      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Ошибка при обновлении профиля. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Редактировать профиль</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div
              className="relative w-32 h-32 mx-auto mb-2 cursor-pointer group"
              onClick={handleAvatarClick}
            >
              <img
                src={avatarUrl || '/default-avatar.png'}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="text-white" size={24} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />
            <p className="text-sm text-center text-gray-500">
              Нажмите на аватар, чтобы изменить
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя пользователя
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={2}
              maxLength={30}
              pattern="[a-zA-Zа-яА-Я0-9_-]+"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              От 2 до 30 символов, допустимы буквы, цифры, дефис и подчеркивание
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 