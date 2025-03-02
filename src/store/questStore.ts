import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Quest, Task, QuestProgress } from '../types';

interface QuestState {
  quests: Quest[];
  currentQuest: Quest | null;
  questProgress: QuestProgress | null;
  isLoading: boolean;
  error: string | null;
  
  fetchQuests: () => Promise<void>;
  fetchQuestById: (id: string) => Promise<void>;
  startQuest: (questId: string) => Promise<void>;
  completeTask: (taskId: string, answer?: string | File) => Promise<boolean>;
  submitQuest: () => Promise<void>;
  resetQuestProgress: () => void;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  currentQuest: null,
  questProgress: null,
  isLoading: false,
  error: null,
  
  fetchQuests: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('quests')
        .select('*');
        
      if (error) throw error;
      
      // For each quest, fetch its tasks
      const questsWithTasks = await Promise.all(
        data.map(async (quest) => {
          const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('quest_id', quest.id)
            .order('order', { ascending: true });
            
          if (tasksError) throw tasksError;
          
          return { ...quest, tasks } as Quest;
        })
      );
      
      set({ quests: questsWithTasks });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchQuestById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: quest, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single();
        
      if (questError) throw questError;
      
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('quest_id', id)
        .order('order', { ascending: true });
        
      if (tasksError) throw tasksError;
      
      set({ currentQuest: { ...quest, tasks } as Quest });
      
      // Check if there's an ongoing progress for this quest
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ questProgress: null });
        return;
      }
      
      // Use a direct query instead of maybeSingle to avoid 406 errors
      const { data: progressData, error: progressError } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('quest_id', id)
        .eq('user_id', user.id);
        
      if (progressError) {
        console.error('Error fetching quest progress:', progressError);
        set({ questProgress: null });
        return;
      }
      
      // If we have progress data, use the first item
      if (progressData && progressData.length > 0) {
        set({ questProgress: progressData[0] as QuestProgress });
      } else {
        set({ questProgress: null });
      }
    } catch (error) {
      console.error('Error fetching quest by ID:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  startQuest: async (questId) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Create a new progress entry
      const progress: QuestProgress = {
        quest_id: questId,
        current_task_index: 0,
        started_at: new Date().toISOString(),
        tasks_completed: [],
        points_earned: 0
      };
      
      const { error } = await supabase
        .from('quest_progress')
        .upsert({
          user_id: user.id,
          ...progress
        });
        
      if (error) throw error;
      
      set({ questProgress: progress });
    } catch (error) {
      console.error('Error starting quest:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  completeTask: async (taskId, answer) => {
    const { currentQuest, questProgress } = get();
    if (!currentQuest || !questProgress) return false;
    
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const currentTask = currentQuest.tasks[questProgress.current_task_index];
      
      // Validate the task completion based on task type
      let isCompleted = false;
      
      switch (currentTask.type) {
        case 'multiple_choice':
          isCompleted = answer === currentTask.correct_answer;
          break;
          
        case 'location_checkin':
          // In a real app, we would validate the user's GPS position
          // For this demo, we'll assume it's valid
          isCompleted = true;
          break;
          
        case 'photo_submission':
          // In a real app, we would upload the photo to storage
          // For this demo, we'll assume it's valid if a file was provided
          isCompleted = !!answer && answer instanceof File;
          break;
          
        case 'partner_visit':
          // Similar to location checkin
          isCompleted = true;
          break;
      }
      
      if (!isCompleted) {
        set({ error: 'Task validation failed' });
        return false;
      }
      
      // Update progress
      const updatedProgress = {
        ...questProgress,
        current_task_index: questProgress.current_task_index + 1,
        tasks_completed: [...questProgress.tasks_completed, currentTask.id],
        points_earned: questProgress.points_earned + currentTask.points
      };
      
      const { error } = await supabase
        .from('quest_progress')
        .update(updatedProgress)
        .eq('user_id', user.id)
        .eq('quest_id', currentQuest.id);
        
      if (error) throw error;
      
      set({ questProgress: updatedProgress });
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      set({ error: (error as Error).message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  submitQuest: async () => {
    const { currentQuest, questProgress } = get();
    if (!currentQuest || !questProgress) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Calculate time taken
      const startedAt = new Date(questProgress.started_at);
      const completedAt = new Date();
      const timeTakenMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);
      
      // Create completion record
      const { error: completionError } = await supabase
        .from('quest_completions')
        .insert({
          user_id: user.id,
          quest_id: currentQuest.id,
          completed_at: completedAt.toISOString(),
          points_earned: questProgress.points_earned,
          time_taken: timeTakenMinutes,
          tasks_completed: questProgress.tasks_completed.length
        });
        
      if (completionError) {
        console.error('Error creating completion record:', completionError);
        throw completionError;
      }
      
      // Update user points
      const { error: profileError } = await supabase.rpc(
        'increment_user_points',
        { user_id: user.id, points_to_add: questProgress.points_earned }
      );
      
      if (profileError) {
        console.error('Error updating user points:', profileError);
        throw profileError;
      }
      
      // Delete progress
      const { error: deleteError } = await supabase
        .from('quest_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('quest_id', currentQuest.id);
        
      if (deleteError) {
        console.error('Error deleting progress:', deleteError);
        // Don't throw here, as the quest is already completed
      }
        
      // Reset state
      set({ questProgress: null });
      
      // Refresh the user profile to get updated points
      await supabase.auth.refreshSession();
    } catch (error) {
      console.error('Error submitting quest:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetQuestProgress: () => {
    set({ questProgress: null });
  }
}));