import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Clock, Star, Camera, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
  tasks: QuestTask[];
}

interface QuestTask {
  id: string;
  quest_id: string;
  title: string;
  description: string;
  type: 'text' | 'photo' | 'location';
  location: [number, number];
  points: number;
  order: number;
}

export const QuestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [currentTask, setCurrentTask] = useState<QuestTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const { data: questData, error: questError } = await supabase
          .from('quests')
          .select('*')
          .eq('id', id)
          .single();

        if (questError) throw questError;

        const { data: tasksData, error: tasksError } = await supabase
          .from('quest_tasks')
          .select('*')
          .eq('quest_id', id)
          .order('order', { ascending: true });

        if (tasksError) throw tasksError;

        setQuest({ ...questData, tasks: tasksData });
        setCurrentTask(tasksData[0]);
      } catch (error) {
        console.error('Error fetching quest:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuest();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!currentTask || !user) return;

    try {
      let isCorrect = false;

      switch (currentTask.type) {
        case 'text':
          isCorrect = answer.toLowerCase() === currentTask.answer.toLowerCase();
          break;
        case 'photo':
          if (photo) {
            const { error: uploadError } = await supabase.storage
              .from('quest-photos')
              .upload(`${user.id}/${quest?.id}/${currentTask.id}`, photo);
            
            if (uploadError) throw uploadError;
            isCorrect = true;
          }
          break;
        case 'location':
          // Здесь должна быть проверка геолокации
          break;
      }

      if (isCorrect) {
        await supabase.from('user_progress').insert({
          user_id: user.id,
          quest_id: quest?.id,
          task_id: currentTask.id,
          completed_at: new Date().toISOString(),
        });

        const nextTask = quest?.tasks.find(t => t.order === currentTask.order + 1);
        if (nextTask) {
          setCurrentTask(nextTask);
          setAnswer('');
          setPhoto(null);
        } else {
          // Квест завершен
          await supabase.from('user_completed_quests').insert({
            user_id: user.id,
            quest_id: quest?.id,
            completed_at: new Date().toISOString(),
            points_earned: quest?.points,
          });
          navigate('/profile');
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!quest) {
    return <div>Квест не найден</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64">
          <img
            src={quest.image_url}
            alt={quest.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{quest.title}</h1>
          
          <div className="flex items-center space-x-4 mb-6 text-gray-600">
            <div className="flex items-center">
              <Clock size={20} className="mr-2" />
              {quest.duration} мин
            </div>
            <div className="flex items-center">
              <Star size={20} className="mr-2" />
              {quest.points} баллов
            </div>
            <div className="flex items-center">
              <MapPin size={20} className="mr-2" />
              Новосибирск
            </div>
          </div>

          <p className="text-gray-700 mb-8">{quest.description}</p>

          {currentTask && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Задание {currentTask.order} из {quest.tasks.length}
              </h2>
              
              <p className="text-gray-700 mb-6">{currentTask.description}</p>

              {currentTask.location && (
                <div className="mb-6 h-64">
                  <MapContainer
                    center={currentTask.location}
                    zoom={15}
                    className="h-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={currentTask.location}>
                      <Popup>{currentTask.title}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              <div className="space-y-4">
                {currentTask.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваш ответ
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Введите ответ..."
                      />
                      <button
                        onClick={handleSubmitAnswer}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                      >
                        <MessageSquare size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {currentTask.type === 'photo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Загрузите фото
                    </label>
                    <div className="flex space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!photo}
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                      >
                        <Camera size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 