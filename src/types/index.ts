export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  points: number;
  rank: number;
  status_level: string;
  created_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number; // in minutes
  points_reward: number;
  tasks: Task[];
  created_at: string;
  created_by: string;
}

export interface Task {
  id: string;
  quest_id: string;
  title: string;
  description: string;
  type: 'multiple_choice' | 'photo_submission' | 'location_checkin' | 'partner_visit';
  location: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  options?: string[]; // for multiple choice
  correct_answer?: string; // for multiple choice
  partner_id?: string; // for partner visit
  points: number;
  order: number;
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: string;
  points_earned: number;
  time_taken: number; // in minutes
  tasks_completed: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement_type: 'quests_completed' | 'points_earned' | 'specific_quest';
  requirement_value: number;
  quest_id?: string; // for specific quest achievements
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

export interface Partner {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  website?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  points: number;
  quests_completed: number;
  rank: number;
}

export interface QuestProgress {
  quest_id: string;
  current_task_index: number;
  started_at: string;
  tasks_completed: Task['id'][];
  points_earned: number;
}