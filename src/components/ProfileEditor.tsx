import React, { useState, useRef } from 'react';
import { User, Upload, X, Camera } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface ProfileEditorProps {
  onCancel: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onCancel }) => {
  const { user, updateUserProfile, uploadAvatar, deleteAvatar, isLoading, error } = useAuthStore();
  
  const [username, setUsername] = useState(user?.username || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = async () => {
    try {
      setLocalError(null);
      
      // Validate username
      if (!username.trim()) {
        setLocalError('Имя пользователя не может быть пустым');
        return;
      }
      
      // First update the username if changed
      if (username !== user?.username) {
        await updateUserProfile({ username });
      }
      
      // Then upload the new avatar if selected
      if (newAvatar) {
        const result = await uploadAvatar(newAvatar);
        if (!result) {
          setLocalError('Не удалось загрузить аватар. Пожалуйста, попробуйте другое изображение.');
          return;
        }
      }
      
      onCancel(); // Close the editor
    } catch (err) {
      console.error('Error saving profile:', err);
      setLocalError('Произошла ошибка при сохранении профиля');
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setLocalError('Размер файла не должен превышать 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setLocalError('Пожалуйста, выберите изображение');
        return;
      }
      
      setNewAvatar(file);
      setLocalError(null);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };
  
  const handleRemoveAvatar = async () => {
    setLocalError(null);
    
    if (user?.avatar_url) {
      await deleteAvatar();
    }
    
    setAvatarPreview(null);
    setNewAvatar(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Display either local error or store error
  const displayError = localError || error;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Редактирование профиля</h2>
      
      {displayError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {displayError}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex flex-col items-center mb-4">
          <div 
            className="w-24 h-24 rounded-full mb-2 relative cursor-pointer overflow-hidden bg-gray-100 flex items-center justify-center"
            onClick={handleAvatarClick}
          >
            {avatarPreview ? (
              <img 
                src={avatarPreview} 
                alt="Avatar preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-gray-400" />
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleAvatarClick}
              className="text-sm text-blue-600 flex items-center"
            >
              <Upload className="h-3 w-3 mr-1" />
              Загрузить фото
            </button>
            
            {avatarPreview && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-sm text-red-600 flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Удалить
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Имя пользователя
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;