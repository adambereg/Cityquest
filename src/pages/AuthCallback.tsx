import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Если пользователь авторизован, перенаправляем на профиль
    if (user) {
      navigate('/profile');
    } else {
      // Если нет, возвращаем на страницу авторизации с сообщением об успешном подтверждении
      navigate('/auth', { 
        state: { 
          message: 'Email успешно подтвержден. Теперь вы можете войти в систему.' 
        } 
      });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}; 