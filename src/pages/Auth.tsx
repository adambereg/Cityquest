import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

export const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    // Проверяем, есть ли сообщение об успешном подтверждении
    const state = location.state as { message?: string };
    if (state?.message) {
      setSuccess(state.message);
      // Очищаем state, чтобы сообщение не появлялось после обновления страницы
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/profile');
      } else {
        const { error, emailSent } = await signUp(email, password);
        if (error) throw error;
        if (emailSent) {
          setVerificationSent(true);
          setVerificationEmail(email);
        } else {
          navigate('/profile');
        }
      }
    } catch (error: any) {
      setError(
        isLogin
          ? 'Неверный email или пароль'
          : error.message || 'Ошибка при регистрации. Попробуйте другой email'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Подтверждение email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Мы отправили ссылку для подтверждения на {verificationEmail}
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              Пожалуйста, проверьте вашу почту и перейдите по ссылке для подтверждения регистрации.
              Если письмо не пришло, проверьте папку "Спам".
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={() => setVerificationSent(false)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Вернуться к форме входа
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center p-4 text-red-700 bg-red-100 rounded-lg">
              <AlertCircle className="mr-2" size={20} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center p-4 text-green-700 bg-green-100 rounded-lg">
              <CheckCircle className="mr-2" size={20} />
              {success}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Имя пользователя
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Имя пользователя"
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isLogin && !username ? 'rounded-t-md' : ''
                } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? (
                    <LogIn className="mr-2" size={20} />
                  ) : (
                    <UserPlus className="mr-2" size={20} />
                  )}
                  {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};