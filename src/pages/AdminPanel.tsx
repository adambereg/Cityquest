import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
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
  created_at: string;
}

interface QuestTask {
  id: string;
  quest_id: string;
  title: string;
  description: string;
  type: 'text' | 'photo' | 'location';
  answer?: string;
  location?: [number, number];
  points: number;
  order: number;
}

export const AdminPanel = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedQuest) return;

      try {
        const { data, error } = await supabase
          .from('quest_tasks')
          .select('*')
          .eq('quest_id', selectedQuest.id)
          .order('order', { ascending: true });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [selectedQuest]);

  const handleCreateQuest = async () => {
    try {
      const { data, error } = await supabase
        .from('quests')
        .insert([
          {
            title: 'Новый квест',
            description: 'Описание квеста',
            duration: 60,
            difficulty: 'easy',
            points: 100,
            image_url: '/default-quest.jpg',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setQuests([data, ...quests]);
      setSelectedQuest(data);
      setIsEditing(true);
    } catch (error) {
      console.error('Error creating quest:', error);
    }
  };

  const handleUpdateQuest = async (quest: Quest) => {
    try {
      const { error } = await supabase
        .from('quests')
        .update(quest)
        .eq('id', quest.id);

      if (error) throw error;

      setQuests(quests.map(q => (q.id === quest.id ? quest : q)));
      setSelectedQuest(quest);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating quest:', error);
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    try {
      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId);

      if (error) throw error;

      setQuests(quests.filter(q => q.id !== questId));
      if (selectedQuest?.id === questId) {
        setSelectedQuest(null);
      }
    } catch (error) {
      console.error('Error deleting quest:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!selectedQuest) return;

    try {
      const { data, error } = await supabase
        .from('quest_tasks')
        .insert([
          {
            quest_id: selectedQuest.id,
            title: 'Новое задание',
            description: 'Описание задания',
            type: 'text',
            points: 10,
            order: tasks.length + 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (task: QuestTask) => {
    try {
      const { error } = await supabase
        .from('quest_tasks')
        .update(task)
        .eq('id', task.id);

      if (error) throw error;

      setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('quest_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Список квестов */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Квесты</h2>
            <button
              onClick={handleCreateQuest}
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className={`p-4 rounded-lg cursor-pointer ${
                  selectedQuest?.id === quest.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{quest.title}</h3>
                    <p className="text-sm text-gray-600">{quest.points} баллов</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteQuest(quest.id);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Детали квеста */}
        {selectedQuest && (
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {isEditing ? 'Редактирование квеста' : 'Детали квеста'}
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Edit size={20} />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      value={selectedQuest.title}
                      onChange={(e) =>
                        setSelectedQuest({ ...selectedQuest, title: e.target.value })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={selectedQuest.description}
                      onChange={(e) =>
                        setSelectedQuest({
                          ...selectedQuest,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Длительность (мин)
                      </label>
                      <input
                        type="number"
                        value={selectedQuest.duration}
                        onChange={(e) =>
                          setSelectedQuest({
                            ...selectedQuest,
                            duration: parseInt(e.target.value),
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Баллы
                      </label>
                      <input
                        type="number"
                        value={selectedQuest.points}
                        onChange={(e) =>
                          setSelectedQuest({
                            ...selectedQuest,
                            points: parseInt(e.target.value),
                          })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Сложность
                    </label>
                    <select
                      value={selectedQuest.difficulty}
                      onChange={(e) =>
                        setSelectedQuest({
                          ...selectedQuest,
                          difficulty: e.target.value as Quest['difficulty'],
                        })
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="easy">Легкий</option>
                      <option value="medium">Средний</option>
                      <option value="hard">Сложный</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdateQuest(selectedQuest)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">{selectedQuest.description}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Длительность</span>
                      <p>{selectedQuest.duration} мин</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Баллы</span>
                      <p>{selectedQuest.points}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Сложность</span>
                      <p>
                        {selectedQuest.difficulty === 'easy' && 'Легкий'}
                        {selectedQuest.difficulty === 'medium' && 'Средний'}
                        {selectedQuest.difficulty === 'hard' && 'Сложный'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Задания квеста */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Задания</h2>
                <button
                  onClick={handleCreateTask}
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">
                          Задание {task.order}
                        </span>
                        {task.type === 'location' && (
                          <MapPin size={16} className="text-blue-500" />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) =>
                          handleUpdateTask({ ...task, title: e.target.value })
                        }
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Название задания"
                      />

                      <textarea
                        value={task.description}
                        onChange={(e) =>
                          handleUpdateTask({
                            ...task,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Описание задания"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <select
                            value={task.type}
                            onChange={(e) =>
                              handleUpdateTask({
                                ...task,
                                type: e.target.value as QuestTask['type'],
                              })
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="text">Текстовый ответ</option>
                            <option value="photo">Фото</option>
                            <option value="location">Геолокация</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            value={task.points}
                            onChange={(e) =>
                              handleUpdateTask({
                                ...task,
                                points: parseInt(e.target.value),
                              })
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Баллы"
                          />
                        </div>
                      </div>

                      {task.type === 'text' && (
                        <input
                          type="text"
                          value={task.answer || ''}
                          onChange={(e) =>
                            handleUpdateTask({ ...task, answer: e.target.value })
                          }
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Правильный ответ"
                        />
                      )}

                      {task.type === 'location' && (
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            value={task.location?.[0] || ''}
                            onChange={(e) =>
                              handleUpdateTask({
                                ...task,
                                location: [
                                  parseFloat(e.target.value),
                                  task.location?.[1] || 0,
                                ],
                              })
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Широта"
                            step="0.000001"
                          />
                          <input
                            type="number"
                            value={task.location?.[1] || ''}
                            onChange={(e) =>
                              handleUpdateTask({
                                ...task,
                                location: [
                                  task.location?.[0] || 0,
                                  parseFloat(e.target.value),
                                ],
                              })
                            }
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Долгота"
                            step="0.000001"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 