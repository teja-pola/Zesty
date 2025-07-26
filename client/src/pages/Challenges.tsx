import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Plus,
  Calendar,
  Trophy,
  Flame,
  Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  domain: string;
  task_type: string;
  difficulty_level: number;
  is_completed: boolean;
  completion_proof?: string;
  created_at: string;
  completed_at?: string;
  due_date?: string;
}

export function Challenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChallenge = async (domain: string) => {
    if (!user) return;
    setGenerating(true);

    try {
      // Get user's current comfort level from profile
      const userComfortLevel = profile?.discomfort_level || 1;
      const difficulty = Math.min(userComfortLevel + Math.floor(Math.random() * 2), 5);
      
      let challengeData;
      try {
        challengeData = await GeminiService.generateChallengeTask(domain, difficulty);
      } catch (error) {
        // Fallback challenges if Gemini fails
        challengeData = generateFallbackChallenge(domain, difficulty);
      }

      const { error } = await supabase
        .from('challenges')
        .insert({
          user_id: user.id,
          title: challengeData.title,
          description: challengeData.description,
          domain,
          task_type: 'exploration',
          difficulty_level: difficulty,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        });

      if (error) throw error;

      await loadChallenges();
      toast.success('New challenge created!');
    } catch (error) {
      console.error('Error generating challenge:', error);
      toast.error('Failed to generate challenge');
    } finally {
      setGenerating(false);
    }
  };

  const generateFallbackChallenge = (domain: string, difficulty: number) => {
    const challenges = {
      movies: [
        { title: 'Watch a Silent Film', description: 'Experience cinema without dialogue for 30 minutes', culturalContext: 'Silent films teach visual storytelling and patience' },
        { title: 'Foreign Language Film', description: 'Watch a movie with subtitles from a different culture', culturalContext: 'Expands cultural perspective and empathy' },
        { title: 'Documentary Challenge', description: 'Watch a documentary on a topic you usually avoid', culturalContext: 'Broadens knowledge and challenges assumptions' }
      ],
      music: [
        { title: 'Classical Music Hour', description: 'Listen to 1 hour of classical music without interruption', culturalContext: 'Develops appreciation for complex musical structures' },
        { title: 'World Music Exploration', description: 'Discover traditional music from 3 different countries', culturalContext: 'Connects you to global cultural heritage' },
        { title: 'Instrumental Focus', description: 'Listen to music without vocals for a full day', culturalContext: 'Enhances appreciation for pure musical composition' }
      ],
      food: [
        { title: 'Fermented Food Challenge', description: 'Try 3 different fermented foods this week', culturalContext: 'Fermentation is a cornerstone of many food cultures' },
        { title: 'Spice Level Up', description: 'Eat something spicier than your usual tolerance', culturalContext: 'Many cultures use spice for flavor complexity and health' },
        { title: 'Unfamiliar Cuisine', description: 'Order from a cuisine you\'ve never tried before', culturalContext: 'Food is a gateway to understanding different cultures' }
      ],
      books: [
        { title: 'Poetry Appreciation', description: 'Read poetry for 30 minutes daily this week', culturalContext: 'Poetry distills human experience into concentrated art' },
        { title: 'Non-Fiction Deep Dive', description: 'Read about a topic completely outside your interests', culturalContext: 'Expands intellectual horizons and empathy' },
        { title: 'Classic Literature', description: 'Start reading a classic you\'ve been avoiding', culturalContext: 'Classics endure because they capture universal human truths' }
      ],
      fashion: [
        { title: 'Color Experiment', description: 'Wear a color you never choose for a full week', culturalContext: 'Colors carry cultural meanings and psychological effects' },
        { title: 'Style Swap', description: 'Dress in a completely different style for one day', culturalContext: 'Fashion is a form of cultural expression and identity' },
        { title: 'Traditional Wear', description: 'Research and wear traditional clothing from another culture respectfully', culturalContext: 'Traditional clothing reflects cultural values and history' }
      ]
    };

    const domainChallenges = challenges[domain as keyof typeof challenges] || challenges.movies;
    const challenge = domainChallenges[Math.floor(Math.random() * domainChallenges.length)];
    
    return {
      title: challenge.title,
      description: challenge.description,
      culturalContext: challenge.culturalContext
    };
  };

  const completeChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', challengeId);

      if (error) throw error;

      await loadChallenges();
      toast.success('Challenge completed! 🎉');
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast.error('Failed to complete challenge');
    }
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < level ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const domains = [
    { name: 'movies', icon: '🎬', label: 'Movies' },
    { name: 'music', icon: '🎵', label: 'Music' },
    { name: 'food', icon: '🍜', label: 'Food' },
    { name: 'books', icon: '📚', label: 'Books' },
    { name: 'fashion', icon: '👗', label: 'Fashion' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => !c.is_completed);
  const completedChallenges = challenges.filter(c => c.is_completed);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cultural Challenges
          </h1>
          <p className="text-xl text-white/60">
            Push your boundaries with personalized cultural exploration tasks
          </p>
        </motion.div>

        {/* Generate New Challenge */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Challenge</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {domains.map(domain => (
              <motion.button
                key={domain.name}
                onClick={() => generateChallenge(domain.name)}
                disabled={generating}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: domains.indexOf(domain) * 0.1 }}
              >
                <div className="text-3xl mb-3">{domain.icon}</div>
                <div className="text-white font-medium">{domain.label}</div>
                {generating && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Target className="w-6 h-6 mr-2 text-purple-400" />
              Active Challenges ({activeChallenges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {domains.find(d => d.name === challenge.domain)?.icon || '🎯'}
                      </span>
                      <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                        {challenge.domain}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDifficultyStars(challenge.difficulty_level)}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{challenge.title}</h3>
                  <p className="text-white/60 mb-4">{challenge.description}</p>

                  {challenge.due_date && (
                    <div className="flex items-center text-white/40 text-sm mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      Due: {new Date(challenge.due_date).toLocaleDateString()}
                    </div>
                  )}

                  <button
                    onClick={() => completeChallenge(challenge.id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-3 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Mark Complete</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-green-400" />
              Completed Challenges ({completedChallenges.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {completedChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-green-500/10 backdrop-blur-xl border border-green-400/30 rounded-3xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {domains.find(d => d.name === challenge.domain)?.icon || '🎯'}
                      </span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {getDifficultyStars(challenge.difficulty_level)}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
                  <p className="text-white/60 text-sm mb-3">{challenge.description}</p>

                  {challenge.completed_at && (
                    <div className="flex items-center text-green-400 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      Completed: {new Date(challenge.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {challenges.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-4">No challenges yet!</h2>
            <p className="text-white/60 mb-8">Create your first cultural challenge to start exploring.</p>
          </div>
        )}
      </div>
    </div>
  );
}