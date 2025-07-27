import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Share2, Heart, Target } from 'lucide-react';
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

// Hardcoded fallback nemeses for demo purposes
const FALLBACK_NEMESES: Nemesis[] = [
  {
    id: 'demo-nemesis-1',
    name: 'Alex Chen',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    taste_profile: {
      music: ['Death Metal', 'Noise Music', 'Experimental Jazz'],
      movies: ['Silent Films', 'Art House Cinema', 'Documentary'],
      books: ['Philosophy', 'Academic Papers', 'Poetry'],
      food: ['Fermented Foods', 'Organ Meats', 'Bitter Herbs'],
      fashion: ['Avant-garde Fashion', 'Minimalist Style']
    },
    cultural_exposure_score: 85,
    discomfort_level: 4,
    compatibility_score: 92
  },
  {
    id: 'demo-nemesis-2',
    name: 'Maya Patel',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    taste_profile: {
      music: ['Atonal Music', 'Industrial', 'Gregorian Chant'],
      movies: ['Foreign Language Films', 'Experimental Cinema'],
      books: ['Technical Manuals', 'Non-fiction', 'Academic Journals'],
      food: ['Insects', 'Raw Foods', 'Molecular Gastronomy'],
      fashion: ['Gender-neutral Clothing', 'Sustainable Fashion']
    },
    cultural_exposure_score: 78,
    discomfort_level: 5,
    compatibility_score: 88
  },
  {
    id: 'demo-nemesis-3',
    name: 'Jordan Kim',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    taste_profile: {
      music: ['Microtonal Music', 'Sound Art', 'Drone Music'],
      movies: ['Film Noir', 'Surrealist Cinema', 'Video Art'],
      books: ['Experimental Literature', 'Concrete Poetry'],
      food: ['Fermented Shark', 'Century Eggs', 'Durian'],
      fashion: ['Deconstructed Fashion', 'Wearable Art']
    },
    cultural_exposure_score: 91,
    discomfort_level: 3,
    compatibility_score: 95
  },
  {
    id: 'demo-nemesis-4',
    name: 'Sam Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    taste_profile: {
      music: ['Free Jazz', 'Harsh Noise', 'Medieval Music'],
      movies: ['Abstract Films', 'Dadaist Cinema'],
      books: ['Postmodern Literature', 'Critical Theory'],
      food: ['Offal', 'Pickled Everything', 'Unusual Textures'],
      fashion: ['Anti-fashion', 'Conceptual Clothing']
    },
    cultural_exposure_score: 82,
    discomfort_level: 4,
    compatibility_score: 89
  }
];

export function Connect() {
  const { user, profile } = useAuth();
  const [nemeses, setNemeses] = useState<Nemesis[]>([]);
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
      // Try to find real users first
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .limit(10);

      let realNemeses: Nemesis[] = [];
      
      if (users && users.length > 0) {
        // Convert real users to nemeses (limit to 2 for demo)
        const selectedUsers = users.slice(0, 2);
        
        for (const selectedUser of selectedUsers) {
          const { data: preferences } = await supabase
            .from('taste_preferences')
            .select('preferences')
            .eq('user_id', selectedUser.id)
            .single();

          const nemesisData: Nemesis = {
            id: selectedUser.id,
            name: selectedUser.full_name || 'Cultural Nemesis',
            avatar_url: selectedUser.avatar_url,
            taste_profile: preferences?.preferences || {
              music: [],
              movies: [],
              books: [],
              food: [],
              fashion: [],
            },
            cultural_exposure_score: selectedUser.cultural_exposure_score || 50,
            discomfort_level: selectedUser.discomfort_level || 1,
            compatibility_score: Math.floor(Math.random() * 30) + 70,
          };
          realNemeses.push(nemesisData);
        }
      }
      
      // Always show fallback nemeses for demo (mix real + fallback)
      const allNemeses = [...realNemeses, ...FALLBACK_NEMESES];
      setNemeses(allNemeses.slice(0, 4)); // Show max 4 nemeses
      
    } catch (error) {
      console.error('Error loading nemesis:', error);
      // If error, just show fallback nemeses
      setNemeses(FALLBACK_NEMESES);
    } finally {
      setLoading(false);
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

  const handleChallengeNemesis = async (selectedNemesis: Nemesis) => {
    if (!selectedNemesis || !user) return;

    try {
      // Generate a challenge for the nemesis
      const challenge = await ApiService.generateChallengeTask('music', 4);
      
      const { error } = await supabase
        .from('recommendations')
        .insert({
          user_id: selectedNemesis.id,
          title: `Challenge from ${profile?.full_name || 'Your Nemesis'}`,
          description: challenge.description,
          domain: 'music',
          difficulty_level: 4,
          gemini_explanation: challenge.culturalContext,
          is_completed: false,
        });

      if (error) throw error;

      toast.success(`Challenge sent to ${selectedNemesis.name}!`);
    } catch (error) {
      console.error('Error sending challenge:', error);
      toast.error('Failed to send challenge');
    }
  };

  const handleStartChat = (selectedNemesis: Nemesis) => {
    toast.success(`Starting chat with ${selectedNemesis.name}... (Demo mode)`);
  };

  const handleVideoCall = (selectedNemesis: Nemesis) => {
    const roomName = `zesty-${user?.id}-${selectedNemesis.id}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}`;
    window.open(jitsiUrl, '_blank');
    toast.success(`Starting video call with ${selectedNemesis.name}...`);
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
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your Cultural Nemeses</h2>
                <p className="text-white/60">Connect with users who have opposite tastes for challenging experiences</p>
              </div>
              
              {/* Nemeses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {nemeses.map((nemesis, index) => (
                  <motion.div
                    key={nemesis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {nemesis.avatar_url ? (
                          <img 
                            src={nemesis.avatar_url} 
                            alt={nemesis.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{nemesis.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <span>{nemesis.compatibility_score}% match</span>
                          <span>•</span>
                          <span>Level {nemesis.discomfort_level}</span>
                        </div>
                      </div>
                    </div>

                    {/* Taste Preview */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(nemesis.taste_profile).slice(0, 2).map(([domain, items]) => (
                          <div key={domain} className="text-xs">
                            {(Array.isArray(items) ? items.slice(0, 2) : []).map((item: string, idx: number) => (
                              <span key={idx} className="inline-block bg-orange-500/20 text-orange-300 px-2 py-1 rounded mr-1 mb-1">
                                {item}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleVideoCall(nemesis)}
                        className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 py-2 px-3 rounded-lg text-green-300 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4l2-2v6l-2-2v4H7V5z" clipRule="evenodd" />
                        </svg>
                        <span>Video</span>
                      </button>
                      <button
                        onClick={() => handleStartChat(nemesis)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 py-2 px-3 rounded-lg text-blue-300 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => handleChallengeNemesis(nemesis)}
                        className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 py-2 px-3 rounded-lg text-purple-300 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1"
                      >
                        <Target className="w-4 h-4" />
                        <span>Challenge</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {nemeses.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No nemeses found. Loading demo users...</p>
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