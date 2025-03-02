import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Clock, Star } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Quest {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  image_url: string;
  created_at: string;
}

export const QuestCatalog = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const { data, error } = await supabase
          .from('quests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuests(data || []);
      } catch (error) {
        console.error('Error fetching quests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Городские квесты Новосибирска</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map((quest) => (
          <Link
            key={quest.id}
            to={`/quests/${quest.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <img
                src={quest.image_url}
                alt={quest.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium">
                {quest.points} баллов
              </div>
            </div>
            
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{quest.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{quest.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  {quest.duration} мин
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  Новосибирск
                </div>
                <div className="flex items-center">
                  <Star size={16} className="mr-1" />
                  {quest.difficulty === 'easy' && 'Легкий'}
                  {quest.difficulty === 'medium' && 'Средний'}
                  {quest.difficulty === 'hard' && 'Сложный'}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}; 