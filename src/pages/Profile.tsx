import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Award, MapPin, Star, Shield, Edit2 } from 'lucide-react';
import { USER_STATUS, getStatusByPoints } from '../constants/userStatus';
import { EditProfileModal } from '../components/EditProfileModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  total_points: number;
  rank: number;
  is_admin: boolean;
}

interface CompletedQuest {
  id: string;
  title: string;
  points_earned: number;
  completed_at: string;
  image_url: string;
}

export const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nextStatusProgress, setNextStatusProgress] = useState<{
    current: number;
    next: number;
    progress: number;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Получаем профиль пользователя
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      // Получаем завершенные квесты
      const { data: questsData, error: questsError } = await supabase
        .from('user_completed_quests')
        .select(`
          id,
          points_earned,
          completed_at,
          quests (
            title,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (questsError) {
        console.error('Error fetching quests:', questsError);
        return;
      }

      // Получаем ранг пользователя
      const { data: rankData, error: rankError } = await supabase
        .rpc('get_user_rank', { user_id: user.id });

      if (rankError) {
        console.error('Error fetching rank:', rankError);
        return;
      }

      const userProfile = {
        ...profileData,
        rank: rankData,
      };

      setProfile(userProfile);

      // Вычисляем прогресс до следующего статуса
      const currentStatus = getStatusByPoints(userProfile.total_points);
      const statusValues = Object.values(USER_STATUS);
      const currentStatusIndex = statusValues.findIndex(s => s.name === currentStatus.name);
      
      if (currentStatusIndex < statusValues.length - 1) {
        const nextStatus = statusValues[currentStatusIndex + 1];
        const progress = ((userProfile.total_points - currentStatus.minPoints) /
          (nextStatus.minPoints - currentStatus.minPoints)) * 100;
        
        setNextStatusProgress({
          current: currentStatus.minPoints,
          next: nextStatus.minPoints,
          progress: Math.min(progress, 100)
        });
      }

      setCompletedQuests(questsData?.map((q: any) => ({
        id: q.id,
        title: q.quests.title,
        points_earned: q.points_earned,
        completed_at: q.completed_at,
        image_url: q.quests.image_url,
      })) || []);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8">Профиль не найден</div>;
  }

  const currentStatus = getStatusByPoints(profile.total_points);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <img
                src={profile.avatar_url || '/default-avatar.png'}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              {user && user.id === profile.id && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold">{profile.username}</h1>
                {profile.is_admin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Shield className="w-4 h-4 mr-1" />
                    Администратор
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Award className={`text-${currentStatus.color}-500`} size={24} />
                <span className={`text-${currentStatus.color}-500 font-medium`}>
                  {currentStatus.label}
                </span>
              </div>
              
              {nextStatusProgress && (
                <div className="mt-2">
                  <div className="text-sm text-gray-500 mb-1">
                    До следующего уровня: {nextStatusProgress.next - profile.total_points} очков
                  </div>
                  <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${currentStatus.color}-500 transition-all duration-500`}
                      style={{ width: `${nextStatusProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="text-yellow-500" size={20} />
                <span className="text-xl font-bold">{profile.total_points}</span>
              </div>
              <p className="text-sm text-gray-600">Всего баллов</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Trophy className="text-blue-500" size={20} />
                <span className="text-xl font-bold">#{profile.rank}</span>
              </div>
              <p className="text-sm text-gray-600">Место в рейтинге</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <MapPin className="text-green-500" size={20} />
                <span className="text-xl font-bold">{completedQuests.length}</span>
              </div>
              <p className="text-sm text-gray-600">Пройдено квестов</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Завершённые квесты</h2>
            {completedQuests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedQuests.map((quest) => (
                  <div key={quest.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={quest.image_url || '/default-quest.png'}
                      alt={quest.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{quest.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(quest.completed_at).toLocaleDateString('ru-RU')}
                      </p>
                      <p className="text-sm text-yellow-600">
                        +{quest.points_earned} очков
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Пока нет завершённых квестов
              </p>
            )}
          </div>
        </div>
      </div>

      {user && user.id === profile.id && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUsername={profile.username}
          currentAvatarUrl={profile.avatar_url || ''}
          userId={profile.id}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}; 