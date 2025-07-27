import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Share2, Star, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiService, QlooEntity } from '../lib/api';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface CardData {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number;
  culturalContext: string;
  imageUrl?: string;
  qlooEntity?: QlooEntity;
  geminiExplanation?: string;
}

export function Explore() {
  const { user, profile } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check onboarding completion from localStorage (fallback for Supabase issues)
    const onboardingComplete = localStorage.getItem('zesty_onboarding_complete') === 'true';
    const profileComplete = profile?.onboarding_complete;
    
    if (!onboardingComplete && !profileComplete) {
      // If onboarding not complete, redirect to onboarding
      window.location.replace('/onboarding');
      return;
    }
    
    if (user && (onboardingComplete || profileComplete)) {
      generateCards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  const generateCards = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      // Get user's taste preferences (try Supabase first, fallback to localStorage)
      let preferences = null;
      
      try {
        const { data } = await supabase
          .from('taste_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();
        preferences = data;
      } catch (supabaseError) {
        console.log('Supabase failed, using localStorage fallback');
        // Fallback to localStorage
        const localPrefs = localStorage.getItem('zesty_preferences');
        if (localPrefs) {
          preferences = { preferences: JSON.parse(localPrefs) };
        }
      }

      if (!preferences) {
        toast.error('Please complete onboarding first');
        return;
      }

      // Convert user preferences to the format expected by backend
      const userPrefs = Object.entries(preferences.preferences || {})
        .flatMap(([type, items]) => 
          (items as string[]).map((name, index) => ({
            id: `${type}-${index}`,
            name,
            type: type === 'movies' ? 'movie' : type === 'books' ? 'book' : type.slice(0, -1) // Remove 's' from plural
          }))
        );

      // Call our new backend API
      const response = await ApiService.generateDiscomfortCards(userPrefs, ['movie', 'music', 'book', 'restaurant']);
      
      // Convert backend response to frontend format
      const generatedCards: CardData[] = response.cards.map((card: any) => ({
        id: card.id,
        title: card.name,
        description: card.explanation,
        domain: card.type,
        difficulty: card.discomfort_level,
        culturalContext: card.growth_benefit,
        imageUrl: card.image,
        qlooEntity: {
          id: card.id,
          name: card.name,
          type: card.type,
          metadata: card.metadata
        },
        geminiExplanation: card.explanation
      }));

      // Shuffle cards for variety
      const shuffledCards = generatedCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
    } catch (error) {
      console.error('Error generating cards:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', card: CardData) => {
    if (!user) return;

    setSwiping(true);
    
    try {
      if (direction === 'right') {
        // Accept challenge
        const { error } = await supabase
          .from('recommendations')
          .insert({
            user_id: user.id,
            qloo_entity_id: card.qlooEntity?.id || '',
            title: card.title,
            domain: card.domain,
            difficulty_level: card.difficulty,
            description: card.description,
            gemini_explanation: card.geminiExplanation,
            is_completed: false,
          });

        if (error) throw error;

        toast.success('Challenge accepted! Check your Challenges tab.');
      }

      // Move to next card
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Failed to process challenge');
    } finally {
      setSwiping(false);
    }
  };

  const handleShare = async (card: CardData) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Zesty Challenge: ${card.title}`,
          text: `I just discovered this cultural challenge: ${card.description}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Zesty Challenge: ${card.title}\n${card.description}`
        );
        toast.success('Challenge copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
          <p className="text-white/60">Generating your cultural challenges...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">No More Challenges</h2>
          <p className="text-white/60 max-w-md">
            You've seen all available challenges for now. Check back later for new cultural discoveries!
          </p>
          <button
            onClick={generateCards}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl font-medium transition-all duration-200"
          >
            Refresh Challenges
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="font-medium">Explore</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <span className="text-sm text-white/60">
              {currentIndex + 1} of {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <motion.div
            key={currentCard.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Card */}
            <motion.div
              drag="x"
              dragConstraints={{ left: -100, right: 100 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  handleSwipe('right', currentCard);
                } else if (info.offset.x < -100) {
                  handleSwipe('left', currentCard);
                }
              }}
              whileDrag={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 cursor-grab active:cursor-grabbing"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/80 capitalize">
                    {currentCard.domain}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShare(currentCard)}
                    className="p-2 text-white/60 hover:text-white transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">{currentCard.title}</h3>
                <p className="text-white/80 leading-relaxed">{currentCard.description}</p>
                
                {/* Cultural Context */}
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-white/60 mb-2">Why This Matters</h4>
                  <p className="text-sm text-white/80">{currentCard.culturalContext}</p>
                </div>

                {/* Difficulty */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/60">Difficulty:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full ${
                          level <= currentCard.difficulty
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Gemini Explanation */}
                {currentCard.geminiExplanation && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-purple-400 mb-2">AI Insight</h4>
                    <p className="text-sm text-white/80">{currentCard.geminiExplanation}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Swipe Instructions */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2 text-red-400">
                  <X className="w-5 h-5" />
                  <span className="text-sm">Skip</span>
                </div>
                <div className="flex items-center space-x-2 text-green-400">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Accept</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleSwipe('left', currentCard)}
            disabled={swiping}
            className="w-16 h-16 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-8 h-8 text-red-400" />
          </button>
          
          <button
            onClick={() => handleSwipe('right', currentCard)}
            disabled={swiping}
            className="w-16 h-16 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          >
            <Heart className="w-8 h-8 text-green-400" />
          </button>
        </div>
      </div>
    </div>
  );
} 