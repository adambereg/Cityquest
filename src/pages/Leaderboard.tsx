import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Trophy, Medal, Award } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string;
  total_points: number;
  quests_completed: number;
  status: string;
  rank: number;
}

type TimeRange = 'all' | 'month' | 'week' | 'today';

export const Leaderboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let query = supabase
          .from('user_profiles')
          .select(`
            id,
            username,
            avatar_url,
            total_points,
            status,
            (
              SELECT count(*)
              FROM user_completed_quests
              WHERE user_id = user_profiles.id
            ) as quests_completed
          `)
          .order('total_points', { ascending: false });

        if (timeRange !== 'all') {
          const now = new Date();
          let startDate = new Date();

          switch (timeRange) {
            case 'month':
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'week':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'today':
              startDate.setHours(0, 0, 0, 0);
              break;
          }

          query = query.gte('updated_at', startDate.toISOString());
        }

        const { data, error } = await query;

        if (error) throw error;

        setLeaders(
          data.map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }))
        );
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeRange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novice':
        return <Award className="text-gray-500" size={20} />;
      case 'explorer':
        return <Award className="text-blue-500" size={20} />;
      case 'master':
        return <Award className="text-yellow-500" size={20} />;
      case 'legend':
        return <Award className="text-purple-500" size={20} />;
      default:
        return <Award className="text-gray-500" size={20} />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={24} />;
      case 2:
        return <Medal className="text-gray-400" size={24} />;
      case 3:
        return <Medal className="text-yellow-600" size={24} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Таблица лидеров</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                За всё время
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                За месяц
              </button>
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                За неделю
              </button>
              <button
                onClick={() => setTimeRange('today')}
                className={`px-4 py-2 rounded-md ${
                  timeRange === 'today'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                За сегодня
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Место</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Игрок</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Статус</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Квестов пройдено</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Баллов</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader) => (
                  <tr
                    key={leader.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(leader.rank)}
                        <span className="ml-2">{leader.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={leader.avatar_url || '/default-avatar.png'}
                          alt={leader.username}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span className="font-medium">{leader.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(leader.status)}
                        <span className="ml-2">{leader.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {leader.quests_completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      {leader.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 