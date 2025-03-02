import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Map, Trophy, User, Compass, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <Compass className="mr-2" size={28} />
            <span>Новосибирск Квест</span>
          </Link>
          
          {user && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">{user.email}</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      {/* Footer navigation */}
      {user && (
        <footer className="bg-white border-t border-gray-200 py-2 shadow-lg">
          <nav className="container mx-auto">
            <ul className="flex justify-around">
              <li>
                <Link 
                  to="/" 
                  className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  <Map size={24} />
                  <span className="text-xs mt-1">Квесты</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/leaderboard" 
                  className={`flex flex-col items-center p-2 ${isActive('/leaderboard') ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  <Trophy size={24} />
                  <span className="text-xs mt-1">Рейтинг</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className={`flex flex-col items-center p-2 ${isActive('/profile') ? 'text-blue-600' : 'text-gray-600'}`}
                >
                  <User size={24} />
                  <span className="text-xs mt-1">Профиль</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => signOut()}
                  className="flex flex-col items-center p-2 text-gray-600"
                >
                  <LogOut size={24} />
                  <span className="text-xs mt-1">Выход</span>
                </button>
              </li>
            </ul>
          </nav>
        </footer>
      )}
    </div>
  );
};

export default Layout;