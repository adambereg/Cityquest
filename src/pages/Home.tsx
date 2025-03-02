import { Link } from 'react-router-dom';
import { MapPin, Trophy, Users } from 'lucide-react';

export const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero секция */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="max-w-4xl mx-auto px-6 py-16 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Исследуйте Новосибирск через увлекательные квесты
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Откройте для себя уникальные места, узнайте интересные факты и историю города,
            выполняйте задания и получайте награды
          </p>
          <Link
            to="/quests"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Начать приключение
          </Link>
        </div>
      </div>

      {/* Преимущества */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <MapPin className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold ml-3">Уникальные места</h3>
          </div>
          <p className="text-gray-600">
            Посетите самые интересные и необычные места Новосибирска, 
            о которых знают не все местные жители
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Trophy className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold ml-3">Награды и достижения</h3>
          </div>
          <p className="text-gray-600">
            Зарабатывайте баллы за выполнение заданий, получайте статусы
            и соревнуйтесь с другими игроками
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Users className="text-blue-500" size={24} />
            <h3 className="text-xl font-semibold ml-3">Сообщество</h3>
          </div>
          <p className="text-gray-600">
            Присоединяйтесь к сообществу увлеченных исследователей города,
            делитесь впечатлениями и находками
          </p>
        </div>
      </div>

      {/* Призыв к действию */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Готовы начать свое городское приключение?
        </h2>
        <p className="text-gray-600 mb-6">
          Регистрируйтесь, выбирайте квест и отправляйтесь исследовать город!
        </p>
        <Link
          to="/auth"
          className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}; 