import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award } from 'lucide-react';

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
  status: string;
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

        setProfile({
          ...profileData,
          rank: rankData,
        });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'novice':
        return <Award className="text-gray-500" size={24} />;
      case 'explorer':
        return <Award className="text-blue-500" size={24} />;
      case 'master':
        return <Award className="text-yellow-500" size={24} />;
      case 'legend':
        return <Award className="text-purple-500" size={24} />;
      default:
        return <Award className="text-gray-500" size={24} />;
    }
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
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <div className="flex items-center space-x-2 text-gray-600">
                {getStatusIcon(profile.status)}
                <span>{profile.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="text-yellow-500" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Всего баллов</div>
                  <div className="text-xl font-bold">{profile.total_points}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Medal className="text-blue-500" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Место в рейтинге</div>
                  <div className="text-xl font-bold">#{profile.rank}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="text-green-500" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Пройдено квестов</div>
                  <div className="text-xl font-bold">{completedQuests.length}</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Завершённые квесты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="bg-gray-50 rounded-lg overflow-hidden"
              >
                <img
                  src={quest.image_url}
                  alt={quest.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{quest.title}</h3>
                  <div className="flex justify-between text-sm text-gray-600">
                    <div>{new Date(quest.completed_at).toLocaleDateString()}</div>
                    <div>{quest.points_earned} баллов</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 