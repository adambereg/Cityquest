import React, { useState } from 'react';
import { Camera, MapPin, HelpCircle, Building } from 'lucide-react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (answer?: string | File) => Promise<void>;
  isActive: boolean;
  isCompleted: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, isActive, isCompleted }) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  
  const getTaskIcon = () => {
    switch (task.type) {
      case 'multiple_choice':
        return <HelpCircle className="text-blue-500" size={24} />;
      case 'photo_submission':
        return <Camera className="text-green-500" size={24} />;
      case 'location_checkin':
        return <MapPin className="text-red-500" size={24} />;
      case 'partner_visit':
        return <Building className="text-purple-500" size={24} />;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (task.type) {
      case 'multiple_choice':
        await onComplete(selectedOption);
        break;
      case 'photo_submission':
        if (photo) {
          await onComplete(photo);
        }
        break;
      default:
        await onComplete();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-4 ${isActive ? 'border-2 border-blue-500' : ''} ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-1">
          {getTaskIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-1">{task.title}</h3>
          <p className="text-gray-600 mb-4">{task.description}</p>
          
          {isActive && !isCompleted && (
            <form onSubmit={handleSubmit}>
              {task.type === 'multiple_choice' && task.options && (
                <div className="mb-4">
                  {task.options.map((option, index) => (
                    <div key={index} className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="option"
                          value={option}
                          checked={selectedOption === option}
                          onChange={() => setSelectedOption(option)}
                          className="mr-2"
                        />
                        <span>{option}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              
              {task.type === 'photo_submission' && (
                <div className="mb-4">
                  <label className="block mb-2">
                    Загрузите фото:
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1 block w-full"
                    />
                  </label>
                  
                  {photo && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Preview"
                        className="max-h-40 rounded"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={
                  (task.type === 'multiple_choice' && !selectedOption) ||
                  (task.type === 'photo_submission' && !photo)
                }
              >
                Подтвердить
              </button>
            </form>
          )}
          
          {isCompleted && (
            <div className="text-green-600 font-medium">
              Задание выполнено ✓
            </div>
          )}
          
          {!isActive && !isCompleted && (
            <div className="text-gray-500">
              Задание будет доступно после выполнения предыдущих заданий
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;