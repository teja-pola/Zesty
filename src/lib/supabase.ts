import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nafcsjuicwqwbgliqpjt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZmNzanVpY3dxd2JnbGlxcGp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTY3NjksImV4cCI6MjA2ODY5Mjc2OX0.AqVRz3viHUmFWbW27-Vl7C5xk7o6-wwamIOdvJLSK4c';

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
  created_at: string;
  updated_at: string;
};

export type TastePreference = {
  id: string;
  user_id: string;
  domain: string;
  preferences: any[];
  dislikes: any[];
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