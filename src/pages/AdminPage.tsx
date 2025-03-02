import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Edit, Trash, Users, Map, BarChart } from 'lucide-react';
import type { Quest, User } from '../types';

enum AdminTab {
  Quests = 'quests',
  Users = 'users',
  Analytics = 'analytics'
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>(AdminTab.Quests);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalQuests: 0,
    totalCompletions: 0,
    averageCompletionTime: 0,
    mostPopularQuest: '',
    mostActiveUser: ''
  });
  
  useEffect(() => {
    checkAdminStatus();
  }, []);
  
  const checkAdminStatus = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }
      
      // Check if user is admin
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (error || !data || !data.is_admin) {
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
      fetchData(activeTab);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchData = async (tab: AdminTab) => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      
      switch (tab) {
        case AdminTab.Quests:
          const { data: questsData, error: questsError } = await supabase
            .from('quests')
            .select('*');
            
          if (questsError) throw questsError;
          setQuests(questsData);
          break;
          
        case AdminTab.Users:
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('*');
            
          if (usersError) throw usersError;
          setUsers(usersData);
          break;
          
        case AdminTab.Analytics:
          // Fetch analytics data
          const { data: analyticsData, error: analyticsError } = await supabase
            .rpc('get_admin_analytics');
            
          if (analyticsError) throw analyticsError;
          setAnalytics(analyticsData);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    fetchData(tab);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Панель администратора</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleTabChange(AdminTab.Quests)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === AdminTab.Quests
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Map className="inline-block mr-2 h-5 w-5" />
              Квесты
            </button>
            <button
              onClick={() => handleTabChange(AdminTab.Users)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === AdminTab.Users
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="inline-block mr-2 h-5 w-5" />
              Пользователи
            </button>
            <button
              onClick={() => handleTabChange(AdminTab.Analytics)}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === AdminTab.Analytics
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart className="inline-block mr-2 h-5 w-5" />
              Аналитика
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === AdminTab.Quests && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Управление квестами</h2>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Создать квест
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Сложность
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Время
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Очки
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата создания
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quests.map((quest) => (
                      <tr key={quest.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quest.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quest.difficulty}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quest.estimated_time} мин</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{quest.points_reward}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(quest.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === AdminTab.Users && (
            <div>
              <h2 className="text-lg font-medium mb-4">Управление пользователями</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Пользователь
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Очки
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата регистрации
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={user.avatar_url} 
                                  alt={user.username} 
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 font-medium">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.status_level}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.points}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === AdminTab.Analytics && (
            <div>
              <h2 className="text-lg font-medium mb-6">Аналитика</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-blue-500 text-xl font-bold mb-2">{analytics.totalUsers}</div>
                  <div className="text-blue-800">Пользователей</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-green-500 text-xl font-bold mb-2">{analytics.totalQuests}</div>
                  <div className="text-green-800">Квестов</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="text-purple-500 text-xl font-bold mb-2">{analytics.totalCompletions}</div>
                  <div className="text-purple-800">Завершений</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium mb-4">Популярные квесты</h3>
                  <div className="text-gray-700">
                    <p>Самый популярный квест: <span className="font-medium">{analytics.mostPopularQuest}</span></p>
                    <p className="mt-2">Среднее время прохождения: <span className="font-medium">{analytics.averageCompletionTime} мин</span></p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-medium mb-4">Активность пользователей</h3>
                  <div className="text-gray-700">
                    <p>Самый активный пользователь: <span className="font-medium">{analytics.mostActiveUser}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;