import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Award } from 'lucide-react';
import type { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getDifficultyText = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };
  
  return (
    <Link to={`/quest/${quest.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-40 bg-blue-100 relative">
          <img 
            src={`https://source.unsplash.com/random/400x200/?novosibirsk,${quest.title}`} 
            alt={quest.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
              {getDifficultyText(quest.difficulty)}
            </span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{quest.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quest.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock size={16} className="mr-1" />
              <span>{quest.estimated_time} мин</span>
            </div>
            
            <div className="flex items-center">
              <MapPin size={16} className="mr-1" />
              <span>{quest.tasks.length} мест</span>
            </div>
            
            <div className="flex items-center">
              <Award size={16} className="mr-1" />
              <span>{quest.points_reward} очков</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuestCard;