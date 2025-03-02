import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string | null>;
  deleteAvatar: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      await get().fetchUserProfile();
    } catch (error) {
      console.error('Sign in error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, username) => {
    try {
      set({ isLoading: true, error: null });
      
      // Create auth user with metadata including username
      const { error: signUpError, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Sign in the user after registration
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) throw signInError;
      }
      
      // Fetch the profile
      await get().fetchUserProfile();
    } catch (error) {
      console.error('Sign up error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ user: null });
        return;
      }
      
      // Try multiple times if needed (to handle race conditions with profile creation)
      let attempts = 0;
      let profileData = null;
      let profileError = null;
      
      while (attempts < 5 && !profileData) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          profileData = data;
          break;
        }
        
        profileError = error;
        attempts++;
        
        // Wait before retrying
        if (attempts < 5) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
      
      if (!profileData) {
        console.error('Failed to fetch profile after multiple attempts:', profileError);
        
        // Try to create the profile manually as a fallback
        try {
          const username = user.user_metadata?.username || `user_${user.id.substring(0, 8)}`;
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: username,
              email: user.email,
              points: 0,
              rank: 0,
              status_level: 'Beginner'
            })
            .select('*')
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          if (newProfile) {
            profileData = newProfile;
          }
        } catch (createError) {
          console.error('Failed to create profile manually:', createError);
          set({ user: null, error: 'Failed to load or create user profile. Please try again.' });
          return;
        }
      }
      
      if (profileData) {
        set({ user: profileData as User });
      } else {
        set({ user: null, error: 'Failed to load user profile. Please try again.' });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ error: (error as Error).message, user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ user: { ...user, ...updates } });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAvatar: async (file) => {
    const { user } = get();
    if (!user) return null;
    
    try {
      set({ isLoading: true, error: null });
      
      // Create a unique file path for the avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      const avatarUrl = data.publicUrl;
      
      // Update the user profile with the new avatar URL
      await get().updateUserProfile({ avatar_url: avatarUrl });
      
      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to upload avatar' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAvatar: async () => {
    const { user } = get();
    if (!user || !user.avatar_url) return;
    
    try {
      set({ isLoading: true, error: null });
      
      // Extract the file path from the URL
      const urlParts = user.avatar_url.split('/');
      const fileName = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
      
      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);
        
      if (deleteError) throw deleteError;
      
      // Update the user profile to remove the avatar URL
      await get().updateUserProfile({ avatar_url: null });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete avatar' });
    } finally {
      set({ isLoading: false });
    }
  }
}));