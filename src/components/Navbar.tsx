import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Trophy, User, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Новосибирск Квест
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/quests"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <MapPin size={20} />
              <span>Квесты</span>
            </Link>

            <Link
              to="/leaderboard"
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <Trophy size={20} />
              <span>Рейтинг</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <User size={20} />
                  <span>Профиль</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut size={20} />
                  <span>Выйти</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 