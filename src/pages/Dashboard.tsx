import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Heart, 
  Bookmark, 
  SkipForward, 
  TrendingUp,
  Target,
  Award,
  RefreshCw,
  Star,
  Clock,
  Globe,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, Recommendation } from '../lib/supabase';
import { QlooService } from '../lib/qloo';
import { GeminiService } from '../lib/gemini';
import toast from 'react-hot-toast';

interface DiscomfortCard {
  id: string;
  title: string;
  domain: string;
  difficulty: number;
  description?: string;
  image_url?: string;
  explanation?: string;
  qloo_entity_id?: string;
}

export function Dashboard() {
  const { user, profile, updateProfile } = useAuth();
  const [recommendations, setRecommendations] = useState<DiscomfortCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    weeklyGrowth: 0,
    domainsActive: 0
  });

  useEffect(() => {
    if (user) {
      loadRecommendations();
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get completed recommendations count
      const { data: completedRecs } = await supabase
        .from('recommendations')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      // Get completed challenges count
      const { data: completedChals } = await supabase
        .from('challenges')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      // Get active domains
      const { data: preferences } = await supabase
        .from('taste_preferences')
        .select('domain')
        .eq('user_id', user.id);

      setStats({
        totalCompleted: (completedRecs?.length || 0) + (completedChals?.length || 0),
        weeklyGrowth: Math.floor(Math.random() * 25) + 5, // Simulated weekly growth
        domainsActive: preferences?.length || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      // Get user's taste preferences
      const { data: preferences } = await supabase
        .from('taste_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (!preferences?.length) {
        toast.error('Please complete onboarding first');
        return;
      }

      const newRecommendations: DiscomfortCard[] = [];

      // Generate recommendations for each domain
      for (const pref of preferences.slice(0, 3)) {
        try {
          const userLikes = pref.preferences.slice(0, 3);
          
          // Try to get real Qloo recommendations
          let qlooRecommendations: any[] = [];
          
          if (userLikes.length > 0) {
            try {
              // Search for a seed entity
              const seedEntity = await QlooService.searchEntity(userLikes[0], `urn:entity:${pref.domain}`);
              
              if (seedEntity) {
                // Get antitheses (opposite recommendations)
                qlooRecommendations = await QlooService.getAntitheses(
                  seedEntity.id, 
                  `urn:entity:${pref.domain}`
                );
              }
            } catch (qlooError) {
              console.log('Qloo API unavailable, using fallback');
            }
          }

          // Use Qloo data if available, otherwise fallback to curated content
          const recommendations = qlooRecommendations.length > 0 
            ? qlooRecommendations.slice(0, 2)
            : await generateCuratedRecommendations(pref.domain, userLikes);

          for (const rec of recommendations) {
            const explanation = await GeminiService.explainDiscomfortRecommendation(
              userLikes, 
              rec.name || rec.title, 
              pref.domain
            );

            newRecommendations.push({
              id: rec.id || `${pref.domain}-${Date.now()}-${Math.random()}`,
              title: rec.name || rec.title,
              domain: pref.domain,
              difficulty: rec.difficulty || Math.floor(Math.random() * 4) + 2, // 2-5 difficulty
              description: rec.metadata?.description || `Explore ${rec.name || rec.title} in ${pref.domain}`,
              image_url: getPlaceholderImage(pref.domain),
              explanation,
              qloo_entity_id: rec.id
            });
          }
        } catch (error) {
          console.error(`Error generating recommendations for ${pref.domain}:`, error);
        }
      }

      if (newRecommendations.length === 0) {
        toast.error('Unable to generate recommendations at this time');
        return;
      }

      // Save to database
      const { error: insertError } = await supabase
        .from('recommendations')
        .insert(
          newRecommendations.map(rec => ({
            user_id: user.id,
            qloo_entity_id: rec.qloo_entity_id || rec.id,
            title: rec.title,
            domain: rec.domain,
            difficulty_level: rec.difficulty,
            description: rec.description,
            image_url: rec.image_url,
            gemini_explanation: rec.explanation,
            is_completed: false
          }))
        );

      if (insertError) throw insertError;

      await loadRecommendations();
      toast.success('New cultural challenges generated!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const generateCuratedRecommendations = async (domain: string, userLikes: string[]) => {
    const curatedContent = {
      movies: [
        { title: 'Parasite (2019)', description: 'Korean thriller that challenges class perspectives', difficulty: 3 },
        { title: 'Stalker (1979)', description: 'Soviet philosophical sci-fi journey', difficulty: 5 },
        { title: 'Tokyo Story (1953)', description: 'Contemplative Japanese family drama', difficulty: 4 },
        { title: 'The Holy Mountain', description: 'Surreal spiritual odyssey', difficulty: 5 },
        { title: 'Chungking Express', description: 'Hong Kong new wave romance', difficulty: 3 },
        { title: 'Bicycle Thieves', description: 'Italian neorealist masterpiece', difficulty: 4 },
        { title: 'Persona (1966)', description: 'Bergman\'s psychological exploration', difficulty: 5 },
        { title: 'City of God', description: 'Brazilian crime drama', difficulty: 3 }
      ],
      music: [
        { title: 'Mongolian Throat Singing', description: 'Traditional vocal techniques from Central Asia', difficulty: 4 },
        { title: 'Free Jazz - Ornette Coleman', description: 'Revolutionary improvisational jazz', difficulty: 5 },
        { title: 'Gamelan Orchestra', description: 'Indonesian traditional ensemble music', difficulty: 3 },
        { title: 'Arvo Pärt - Minimalism', description: 'Estonian composer\'s spiritual minimalism', difficulty: 4 },
        { title: 'Tuvan Folk Music', description: 'Ancient melodies from Siberia', difficulty: 4 },
        { title: 'Indian Classical Ragas', description: 'Complex melodic frameworks', difficulty: 4 },
        { title: 'Noise Music', description: 'Experimental sound exploration', difficulty: 5 },
        { title: 'Bulgarian Women\'s Choir', description: 'Haunting vocal harmonies', difficulty: 3 }
      ],
      food: [
        { title: 'Fermented Shark (Hákarl)', description: 'Icelandic traditional delicacy', difficulty: 5 },
        { title: 'Durian Fruit', description: 'Southeast Asian "king of fruits"', difficulty: 4 },
        { title: 'Natto (Fermented Soybeans)', description: 'Japanese breakfast staple', difficulty: 4 },
        { title: 'Casu Marzu Cheese', description: 'Italian cheese with live cultures', difficulty: 5 },
        { title: 'Century Eggs', description: 'Chinese preserved egg delicacy', difficulty: 3 },
        { title: 'Surströmming', description: 'Swedish fermented herring', difficulty: 5 },
        { title: 'Balut', description: 'Filipino duck embryo delicacy', difficulty: 5 },
        { title: 'Kimchi', description: 'Korean fermented vegetables', difficulty: 2 }
      ],
      books: [
        { title: 'Finnegans Wake - Joyce', description: 'Experimental stream of consciousness', difficulty: 5 },
        { title: 'The Recognitions - Gaddis', description: 'Complex postmodern masterpiece', difficulty: 5 },
        { title: 'If on a winter\'s night a traveler', description: 'Calvino\'s meta-fictional journey', difficulty: 4 },
        { title: 'The Book of Disquiet', description: 'Pessoa\'s philosophical fragments', difficulty: 4 },
        { title: 'Gravity\'s Rainbow', description: 'Pynchon\'s encyclopedic novel', difficulty: 5 },
        { title: 'One Hundred Years of Solitude', description: 'Márquez\'s magical realism', difficulty: 3 },
        { title: 'The Tale of Genji', description: 'Classic Japanese literature', difficulty: 4 },
        { title: 'Ulysses - Joyce', description: 'Modernist literary masterpiece', difficulty: 5 }
      ],
      fashion: [
        { title: 'Comme des Garçons Avant-garde', description: 'Japanese deconstructed fashion', difficulty: 4 },
        { title: 'Traditional Hanbok', description: 'Korean formal traditional wear', difficulty: 3 },
        { title: 'Rick Owens Dark Minimalism', description: 'Gothic architectural clothing', difficulty: 4 },
        { title: 'Maasai Traditional Dress', description: 'East African cultural attire', difficulty: 3 },
        { title: 'Issey Miyake Pleats', description: 'Japanese innovative textile design', difficulty: 4 },
        { title: 'Victorian Gothic', description: 'Dark romantic historical fashion', difficulty: 3 },
        { title: 'Cyberpunk Techwear', description: 'Futuristic functional clothing', difficulty: 4 },
        { title: 'Traditional Sari Draping', description: 'Indian classical garment styling', difficulty: 2 }
      ]
    };

    const domainContent = curatedContent[domain as keyof typeof curatedContent] || curatedContent.movies;
    const shuffled = domainContent.sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, 2).map(item => ({
      id: `curated-${domain}-${Date.now()}-${Math.random()}`,
      name: item.title,
      title: item.title,
      metadata: { description: item.description },
      difficulty: item.difficulty
    }));
  };

  const getPlaceholderImage = (domain: string) => {
    const images = {
      movies: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
      music: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      food: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      books: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg',
      fashion: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'
    };
    return images[domain as keyof typeof images] || images.movies;
  };

  const handleCardAction = async (cardId: string, action: 'complete' | 'save' | 'skip') => {
    try {
      if (action === 'complete') {
        await supabase
          .from('recommendations')
          .update({ 
            is_completed: true, 
            completed_at: new Date().toISOString(),
            user_rating: 4
          })
          .eq('id', cardId);

        toast.success('Challenge completed! 🎉');
        
        // Update user's exposure score
        if (profile && updateProfile) {
          const newScore = (profile.cultural_exposure_score || 0) + 10;
          await updateProfile({ 
            cultural_exposure_score: newScore 
          });
        }
      } else if (action === 'skip') {
        await supabase
          .from('recommendations')
          .delete()
          .eq('id', cardId);
        
        toast('Challenge skipped');
      }

      await loadRecommendations();
      await loadStats();
    } catch (error) {
      console.error('Error handling card action:', error);
      toast.error('Action failed');
    }
  };

  const getDifficultyDisplay = (level: number) => {
    const displays = [
      { emoji: '😐', label: 'Gentle' },
      { emoji: '🔥', label: 'Mild' },
      { emoji: '🔥🔥', label: 'Medium' },
      { emoji: '🔥🔥🔥', label: 'Spicy' },
      { emoji: '🔥🔥🔥🔥', label: 'Intense' },
      { emoji: '🔥🔥🔥🔥🔥', label: 'Extreme' }
    ];
    return displays[level - 1] || displays[1];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Your Cultural Dashboard
            </h1>
            <p className="text-xl text-white/60 mb-8">
              Ready to expand your horizons? Here are your personalized challenges.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{profile?.cultural_exposure_score || 0}</div>
                    <div className="text-white/60 text-sm">Exposure Score</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalCompleted}</div>
                    <div className="text-white/60 text-sm">Completed</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-orange-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.domainsActive}</div>
                    <div className="text-white/60 text-sm">Active Domains</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">+{stats.weeklyGrowth}%</div>
                    <div className="text-white/60 text-sm">Weekly Growth</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={generateNewRecommendations}
              disabled={generating}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 px-6 py-3 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105"
            >
              <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Generating...' : 'Generate New Challenges'}</span>
            </button>
          </motion.div>
        </div>

        {/* Discomfort Cards */}
        {recommendations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-4">No challenges yet!</h2>
            <p className="text-white/60 mb-8">Generate your first set of cultural recommendations.</p>
            <button
              onClick={generateNewRecommendations}
              disabled={generating}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.map((card, index) => {
              const difficulty = getDifficultyDisplay(card.difficulty);
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                    {card.image_url ? (
                      <img 
                        src={card.image_url} 
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-4xl">
                          {card.domain === 'movies' ? '🎬' :
                           card.domain === 'music' ? '🎵' :
                           card.domain === 'food' ? '🍜' :
                           card.domain === 'books' ? '📚' : '👗'}
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-white text-sm">{difficulty.emoji}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                        {card.domain}
                      </span>
                      <span className="text-xs text-white/60">{difficulty.label}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">{card.title}</h3>
                    
                    {card.description && (
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">{card.description}</p>
                    )}

                    {card.explanation && (
                      <div className="bg-white/5 rounded-2xl p-4 mb-6">
                        <p className="text-white/80 text-sm italic line-clamp-3">{card.explanation}</p>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleCardAction(card.id, 'complete')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-xl text-white font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Try Now</span>
                      </button>

                      <button
                        onClick={() => handleCardAction(card.id, 'save')}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleCardAction(card.id, 'skip')}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl text-white transition-colors"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}