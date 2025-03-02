import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';

type LeaderboardPeriod = 'all-time' | 'monthly' | 'weekly' | 'daily';
type LeaderboardSort = 'points' | 'quests_completed';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  sortBy: LeaderboardSort;
  isLoading: boolean;
  error: string | null;
  
  fetchLeaderboard: () => Promise<void>;
  setPeriod: (period: LeaderboardPeriod) => void;
  setSortBy: (sortBy: LeaderboardSort) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  entries: [],
  period: 'all-time',
  sortBy: 'points',
  isLoading: false,
  error: null,
  
  fetchLeaderboard: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { period, sortBy } = get();
      
      // Use the new database function to get leaderboard data
      const { data, error } = await supabase
        .rpc('get_leaderboard', { 
          period: period,
          sort_by: sortBy
        });
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        throw error;
      }
      
      // Transform the data to match our LeaderboardEntry type
      const transformedData: LeaderboardEntry[] = data.map((entry: any) => ({
        user_id: entry.user_id,
        username: entry.username,
        avatar_url: entry.avatar_url,
        points: entry.points,
        quests_completed: entry.quests_completed,
        rank: entry.rank
      }));
      
      set({ entries: transformedData });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setPeriod: (period) => {
    set({ period });
    get().fetchLeaderboard();
  },
  
  setSortBy: (sortBy) => {
    set({ sortBy });
    get().fetchLeaderboard();
  }
}));