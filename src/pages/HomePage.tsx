import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useQuestStore } from '../store/questStore';
import QuestCard from '../components/QuestCard';
import type { Quest } from '../types';

const HomePage: React.FC = () => {
  const { quests, fetchQuests, isLoading } = useQuestStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Quest['difficulty'] | 'all'>('all');
  
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);
  
  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || quest.difficulty === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Исследуйте Новосибирск</h1>
      
      {/* Search and filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск квестов..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Quest['difficulty'] | 'all')}
            >
              <option value="all">Все уровни</option>
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Quests grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.map(quest => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Квесты не найдены</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;