import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, currentUserId }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="bg-yellow-100 text-yellow-800 p-1 rounded-full">
          <Trophy size={20} />
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="bg-gray-100 text-gray-600 p-1 rounded-full">
          <Medal size={20} />
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="bg-amber-100 text-amber-800 p-1 rounded-full">
          <Medal size={20} />
        </div>
      );
    } else {
      return <span className="font-medium">{rank}</span>;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Место
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Пользователь
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Очки
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Квесты
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr 
              key={entry.user_id} 
              className={currentUserId === entry.user_id ? 'bg-blue-50' : ''}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  {getRankBadge(entry.rank)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {entry.avatar_url ? (
                      <img 
                        className="h-10 w-10 rounded-full" 
                        src={entry.avatar_url} 
                        alt={entry.username} 
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {entry.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.username}
                    </div>
                    {currentUserId === entry.user_id && (
                      <div className="text-xs text-blue-600">
                        Вы
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{entry.points}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{entry.quests_completed}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;