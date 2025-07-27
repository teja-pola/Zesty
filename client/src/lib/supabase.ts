import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

export type Profile = {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  cultural_exposure_score: number;
  discomfort_level: number;
  domains_unlocked: string[];
  onboarding_complete?: boolean;
  preferences?: {
    music: string[];
    movies: string[];
    books: string[];
    food: string[];
    fashion: string[];
  };
  username?: string;
  bio?: string;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type TastePreference = {
  id: string;
  user_id: string;
  domain: string;
  preferences: string[];
  dislikes: string[];
  created_at: string;
  updated_at: string;
};

export type Recommendation = {
  id: string;
  user_id: string;
  qloo_entity_id: string;
  title: string;
  domain: string;
  difficulty_level: number;
  description?: string;
  image_url?: string;
  gemini_explanation?: string;
  is_completed: boolean;
  user_rating?: number;
  created_at: string;
  completed_at?: string;
};