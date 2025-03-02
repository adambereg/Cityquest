import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User, Award, MapPin, Clock, Edit } from 'lucide-react';
import type { QuestCompletion, Quest, Achievement } from '../types';
import ProfileEditor from '../components/ProfileEditor';

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [completions, setCompletions] = useState<(QuestCompletion & { quest: Quest })[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);
  
  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Use the new database function to get quest completions
      const { data: completionsData, error: completionsError } = await supabase
        .rpc('get_user_quest_completions', { user_id: user.id });
        
      if (completionsError) {
        console.error('Error fetching completions:', completionsError);
        throw completionsError;
      }
      
      // Transform the data to match our expected format
      const formattedCompletions = completionsData.map((completion: any) => ({
        id: completion.id,
        user_id: user.id,
        quest_id: completion.quest_id,
        completed_at: completion.completed_at,
        points_earned: completion.points_earned,
        time_taken: completion.time_taken,
        tasks_completed: 0, // This field isn't critical for display
        quest: {
          id: completion.quest_id,
          title: completion.quest_title,
          // Add other required fields with default values
          description: '',
          difficulty: 'medium' as const,
          estimated_time: 0,
          points_reward: 0,
          tasks: [],
          created_at: '',
          created_by: ''
        }
      }));
      
      // Fetch user achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          id,
          user_id,
          achievement_id,
          earned_at,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);
        
      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        throw achievementsError;
      }
      
      setCompletions(formattedCompletions);
      setAchievements(achievementsData.map((item: any) => item.achievement));
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Пользователь не авторизован</p>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Explorer': return 'bg-blue-100 text-blue-800';
      case 'Master': return 'bg-purple-100 text-purple-800';
      case 'Legend': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {isEditing ? (
          <ProfileEditor onCancel={() => setIsEditing(false)} />
        ) : (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div 
                className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 overflow-hidden"
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.username} 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-4">
                  <h2 className="text-xl font-bold">{user.username}</h2>
                  <p className="text-gray-500">{user.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Редактировать профиль
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(user.status_level)}`}>
                    {user.status_level}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <Award className="mr-1 h-3 w-3" />
                    {user.points} очков
                  </span>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                    <MapPin className="mr-1 h-3 w-3" />
                    {completions.length} квестов
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Achievements */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Достижения</h2>
            
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="bg-white rounded-lg shadow-md p-4 flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">У вас пока нет достижений</p>
              </div>
            )}
          </div>
          
          {/* Completed Quests */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Завершенные квесты</h2>
            
            {completions && completions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {completions.map((completion) => (
                    <li key={completion.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-2 sm:mb-0">
                          <h3 className="font-medium">{completion.quest?.title || 'Неизвестный квест'}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(completion.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                            <Award className="mr-1 h-3 w-3" />
                            {completion.points_earned} очков
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {completion.time_taken} мин
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">Вы еще не завершили ни одного квеста</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;