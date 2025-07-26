import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Phone, Share2, Heart, Zap, Target, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiService } from '../lib/api';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Nemesis {
  id: string;
  name: string;
  avatar_url?: string;
  taste_profile: {
    music: string[];
    movies: string[];
    books: string[];
    food: string[];
    fashion: string[];
  };
  cultural_exposure_score: number;
  discomfort_level: number;
  compatibility_score: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number;
  created_by: string;
  accepted_by?: string;
  completed_by?: string[];
}

export function Connect() {
  const { user, profile } = useAuth();
  const [nemesis, setNemesis] = useState<Nemesis | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nemesis' | 'challenges'>('nemesis');

  useEffect(() => {
    if (user) {
      loadNemesis();
      loadChallenges();
    }
  }, [user]);

  const loadNemesis = async () => {
    try {
      // Find a nemesis based on opposite taste preferences
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(10);

      if (users && users.length > 0) {
        // Simple nemesis selection (in real app, use more sophisticated matching)
        const selectedNemesis = users[Math.floor(Math.random() * users.length)];
        
        // Get their taste preferences
        const { data: preferences } = await supabase
          .from('taste_preferences')
          .select('preferences')
          .eq('user_id', selectedNemesis.id)
          .single();

        const nemesisData: Nemesis = {
          id: selectedNemesis.id,
          name: selectedNemesis.full_name || 'Cultural Nemesis',
          avatar_url: selectedNemesis.avatar_url,
          taste_profile: preferences?.preferences || {
            music: [],
            movies: [],
            books: [],
            food: [],
            fashion: [],
          },
          cultural_exposure_score: selectedNemesis.cultural_exposure_score,
          discomfort_level: selectedNemesis.discomfort_level,
          compatibility_score: Math.floor(Math.random() * 30) + 70, // Opposite tastes = high compatibility for challenges
        };

        setNemesis(nemesisData);
      }
    } catch (error) {
      console.error('Error loading nemesis:', error);
    }
  };

  const loadChallenges = async () => {
    try {
      const { data } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (data) {
        setChallenges(data);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeNemesis = async () => {
    if (!nemesis || !user) return;

    try {
      // Generate a challenge for the nemesis
      const challenge = await ApiService.generateChallengeTask('music', 4);
      
      const { error } = await supabase
        .from('recommendations')
        .insert({
          user_id: nemesis.id,
          title: `Challenge from ${profile?.full_name || 'Your Nemesis'}`,
          description: challenge.description,
          domain: 'music',
          difficulty_level: 4,
          gemini_explanation: challenge.culturalContext,
          is_completed: false,
        });

      if (error) throw error;

      toast.success('Challenge sent to your nemesis!');
    } catch (error) {
      console.error('Error challenging nemesis:', error);
      toast.error('Failed to send challenge');
    }
  };

  const handleShareProgress = async (challenge: Challenge) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Zesty Challenge Completed: ${challenge.title}`,
          text: `I just completed this cultural challenge: ${challenge.description}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(
          `Zesty Challenge Completed: ${challenge.title}\n${challenge.description}`
        );
        toast.success('Progress copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-white/60">Finding your cultural nemesis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Connect</span>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/5 rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab('nemesis')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'nemesis'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Your Nemesis
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'challenges'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Shared Challenges
            </button>
          </div>

          {activeTab === 'nemesis' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Nemesis Card */}
              {nemesis && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{nemesis.name}</h2>
                        <p className="text-white/60">Your Cultural Nemesis</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{nemesis.compatibility_score}%</div>
                      <div className="text-sm text-white/60">Compatibility</div>
                    </div>
                  </div>

                  {/* Taste Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Your Tastes</h3>
                      <div className="space-y-3">
                        {Object.entries(profile?.taste_profile || {}).map(([domain, items]) => (
                          <div key={domain} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-white/80 capitalize">{domain}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {items?.slice(0, 3).map((item: string, index: number) => (
                                <span key={index} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Nemesis Tastes</h3>
                      <div className="space-y-3">
                        {Object.entries(nemesis.taste_profile).map(([domain, items]) => (
                          <div key={domain} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Zap className="w-4 h-4 text-orange-400" />
                              <span className="text-sm font-medium text-white/80 capitalize">{domain}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {items?.slice(0, 3).map((item: string, index: number) => (
                                <span key={index} className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={handleChallengeNemesis}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 px-6 rounded-xl font-medium transition-all duration-200"
                    >
                      Challenge Nemesis
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 py-3 px-6 rounded-xl font-medium transition-all duration-200">
                      <MessageCircle className="w-5 h-5 inline mr-2" />
                      Chat
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {challenges.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Shared Challenges Yet</h3>
                  <p className="text-white/60">Complete some challenges to see them here!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                          <p className="text-white/60 text-sm capitalize">{challenge.domain}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleShareProgress(challenge)}
                            className="p-2 text-white/60 hover:text-white transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-white/80 mb-4">{challenge.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-3 h-3 rounded-full ${
                                  level <= challenge.difficulty
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                    : 'bg-white/20'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-white/60">Difficulty</span>
                        </div>
                        
                        <button className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium transition-all duration-200">
                          <Heart className="w-4 h-4 inline mr-2" />
                          Completed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 