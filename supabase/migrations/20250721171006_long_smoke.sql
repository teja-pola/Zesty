/*
  # Create Zesty App Schema

  1. New Tables
    - `profiles` - Extended user profiles with taste preferences
    - `taste_preferences` - User's taste inputs across domains
    - `recommendations` - Generated discomfort recommendations
    - `challenges` - User challenges and tasks
    - `progress_entries` - Progress tracking over time
    - `curriculum_paths` - Generated learning paths

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  cultural_exposure_score integer DEFAULT 0,
  discomfort_level integer DEFAULT 1,
  domains_unlocked text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create taste preferences table
CREATE TABLE IF NOT EXISTS taste_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL, -- movies, music, food, books, fashion
  preferences jsonb NOT NULL, -- array of liked items
  dislikes jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  qloo_entity_id text NOT NULL,
  title text NOT NULL,
  domain text NOT NULL,
  difficulty_level integer DEFAULT 1,
  description text,
  image_url text,
  gemini_explanation text,
  is_completed boolean DEFAULT false,
  user_rating integer,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  domain text NOT NULL,
  task_type text NOT NULL, -- watch, listen, try, read, wear
  difficulty_level integer DEFAULT 1,
  is_completed boolean DEFAULT false,
  completion_proof text, -- URL or text proof
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  due_date timestamptz
);

-- Create progress entries table
CREATE TABLE IF NOT EXISTS progress_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  metric_type text NOT NULL, -- exposure_score, discomfort_rating, domain_progress
  metric_value integer NOT NULL,
  domain text,
  recorded_at timestamptz DEFAULT now()
);

-- Create curriculum paths table
CREATE TABLE IF NOT EXISTS curriculum_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain text NOT NULL,
  current_step integer DEFAULT 0,
  total_steps integer DEFAULT 5,
  path_data jsonb NOT NULL, -- array of progressive recommendations
  gemini_plan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE taste_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_paths ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own taste preferences"
  ON taste_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recommendations"
  ON recommendations FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own challenges"
  ON challenges FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON progress_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own curriculum"
  ON curriculum_paths FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_taste_preferences_user_id ON taste_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user_id ON progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_curriculum_paths_user_id ON curriculum_paths(user_id);