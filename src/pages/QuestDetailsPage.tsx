import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Award, ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import { useQuestStore } from '../store/questStore';
import QuestMap from '../components/QuestMap';
import TaskCard from '../components/TaskCard';

const QuestDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentQuest, 
    questProgress, 
    fetchQuestById, 
    startQuest, 
    completeTask, 
    submitQuest,
    isLoading 
  } = useQuestStore();
  
  const [showMap, setShowMap] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchQuestById(id);
    }
  }, [id, fetchQuestById]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!currentQuest) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Квест не найден</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Вернуться к списку
        </button>
      </div>
    );
  }
  
  const isQuestInProgress = !!questProgress;
  const isQuestCompleted = questProgress && questProgress.current_task_index >= currentQuest.tasks.length;
  
  const handleStartQuest = () => {
    startQuest(currentQuest.id);
  };
  
  const handleCompleteTask = async (taskId: string, answer?: string | File) => {
    const success = await completeTask(taskId, answer);
    
    if (success && questProgress && questProgress.current_task_index >= currentQuest.tasks.length) {
      // Quest is completed
      await submitQuest();
    }
  };
  
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легкий';
      case 'medium': return 'Средний';
      case 'hard': return 'Сложный';
      default: return 'Неизвестно';
    }
  };
  
  return (
    <div>
      <div className="mb-4">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Назад к списку
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="h-48 bg-blue-100 relative">
          <img 
            src={`https://source.unsplash.com/random/800x400/?novosibirsk,${currentQuest.title}`} 
            alt={currentQuest.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{currentQuest.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {getDifficultyText(currentQuest.difficulty)}
            </span>
            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {currentQuest.estimated_time} минут
            </span>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <Award className="mr-1 h-3 w-3" />
              {currentQuest.points_reward} очков
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              {currentQuest.tasks.length} заданий
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{currentQuest.description}</p>
          
          {!isQuestInProgress && !isQuestCompleted && (
            <button
              onClick={handleStartQuest}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Начать квест
            </button>
          )}
          
          {isQuestCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
              <CheckCircle className="text-green-500 mr-3 h-6 w-6" />
              <div>
                <h3 className="font-medium text-green-800">Квест завершен!</h3>
                <p className="text-green-700">
                  Вы заработали {questProgress?.points_earned} очков
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isQuestInProgress && !isQuestCompleted && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Задания</h2>
            <button
              onClick={() => setShowMap(!showMap)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
            >
              {showMap ? 'Скрыть карту' : 'Показать карту'}
            </button>
          </div>
          
          {showMap && (
            <div className="h-64 mb-4 rounded-lg overflow-hidden shadow-md">
              <QuestMap 
                tasks={currentQuest.tasks} 
                currentTaskIndex={questProgress?.current_task_index}
              />
            </div>
          )}
          
          <div>
            {currentQuest.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={(answer) => handleCompleteTask(task.id, answer)}
                isActive={index === questProgress?.current_task_index}
                isCompleted={questProgress?.tasks_completed.includes(task.id) || false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestDetailsPage;