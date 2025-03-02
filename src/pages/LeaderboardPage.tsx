import React, { useEffect } from 'react';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useAuthStore } from '../store/authStore';
import LeaderboardTable from '../components/LeaderboardTable';

const LeaderboardPage: React.FC = () => {
  const { entries, period, sortBy, fetchLeaderboard, setPeriod, setSortBy, isLoading } = useLeaderboardStore();
  const { user } = useAuthStore();
  
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Рейтинг игроков</h1>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Период
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <option value="all-time">За все время</option>
              <option value="monthly">За месяц</option>
              <option value="weekly">За неделю</option>
              <option value="daily">За день</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сортировка
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="points">По очкам</option>
              <option value="quests_completed">По количеству квестов</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : entries.length > 0 ? (
        <LeaderboardTable entries={entries} currentUserId={user?.id} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Данные не найдены</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;