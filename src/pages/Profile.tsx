import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, MapPin, Star, Shield } from 'lucide-react';
import { USER_STATUS, getStatusByPoints } from '../constants/userStatus';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
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
  const [nextStatusProgress, setNextStatusProgress] = useState<{
    current: number;
    next: number;
    progress: number;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        // Получаем профиль пользователя
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

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

        if (questsError) throw questsError;

        // Получаем ранг пользователя
        const { data: rankData, error: rankError } = await supabase
          .rpc('get_user_rank', { user_id: user.id });

        if (rankError) throw rankError;

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

        setCompletedQuests(questsData.map((q: any) => ({
          id: q.id,
          title: q.quests.title,
          points_earned: q.points_earned,
          completed_at: q.completed_at,
          image_url: q.quests.image_url,
        })));
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getStatusIcon = (points: number) => {
    const status = getStatusByPoints(points);
    return <Award className={`text-${status.color}-500`} size={24} />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return <div>Профиль не найден</div>;
  }

  const currentStatus = getStatusByPoints(profile.total_points);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={profile.avatar_url || '/default-avatar.png'}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover"
            />
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
                {getStatusIcon(profile.total_points)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="text-yellow-500" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Всего баллов</div>
                  <div className="text-xl font-bold">{profile.total_points}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="text-blue-500" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Место в рейтинге</div>
                  <div className="text-xl font-bold">#{profile.rank}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="text-green-500" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Пройдено квестов</div>
                  <div className="text-xl font-bold">{completedQuests.length}</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Завершённые квесты</h2>
          {completedQuests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="bg-gray-50 rounded-lg overflow-hidden"
                >
                  <img
                    src={quest.image_url || '/default-quest.png'}
                    alt={quest.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{quest.title}</h3>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>{new Date(quest.completed_at).toLocaleDateString()}</div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {quest.points_earned}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Вы еще не завершили ни одного квеста
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 