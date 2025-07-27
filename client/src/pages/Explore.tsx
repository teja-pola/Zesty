import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Share2, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface CardData {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number;
  culturalContext: string;
  imageUrl?: string;
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
    setLoading(true);
    
    try {
      // Get user's taste preferences from localStorage (primary source)
      const localPrefs = localStorage.getItem('zesty_preferences');
      if (!localPrefs) {
        console.log('No preferences found, using fallback cards');
        generateFallbackCards({});
        return;
      }

      const preferences = JSON.parse(localPrefs);
      console.log('Using preferences for card generation:', preferences);

      // Always use fallback cards for now to avoid API timeout issues
      console.log('Using fallback cards for reliable experience');
      generateFallbackCards(preferences);
      
      // Optional: Try API in background but don't block UI
      /*
      try {
        const generatedCards = await Promise.race([
          ApiService.generateDiscomfortCards(preferences),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
        ]);
        
        if (generatedCards && generatedCards.length > 0) {
          setCards(generatedCards);
          setCurrentIndex(0);
          toast.success(`Generated ${generatedCards.length} discomfort challenges!`);
        }
      } catch (apiError) {
        console.log('API call failed or timed out, keeping fallback cards');
      }
      */
      
    } catch (error) {
      console.error('Card generation error:', error);
      // Always provide fallback cards even if there's an error
      generateFallbackCards({});
    }
    
    // Ensure loading is always turned off
    setLoading(false);
  };

  const generateFallbackCards = (preferences: any) => {
    console.log('Generating fallback cards with preferences:', preferences);
    
    const fallbackCards: CardData[] = [];
    const domains = ['music', 'movie', 'book', 'food', 'fashion'];
    
    domains.forEach((domain, domainIndex) => {
      const userPrefs = preferences[domain] || [];
      
      // Generate 2-3 cards per domain
      for (let i = 0; i < 2; i++) {
        const cardId = `fallback-${domain}-${i}`;
        const oppositeGenres = getOppositeGenres(domain);
        const selectedOpposite = oppositeGenres[i % oppositeGenres.length];
        const userPrefText = userPrefs.length > 0 ? userPrefs.slice(0, 2).join(' and ') : 'your current preferences';
        
        fallbackCards.push({
          id: cardId,
          title: `Try ${selectedOpposite}`,
          description: `Since you enjoy ${userPrefText}, challenge yourself with ${selectedOpposite}. This will expand your ${domain} horizons and push you out of your comfort zone.`,
          domain: domain,
          difficulty: Math.floor(Math.random() * 3) + 1,
          culturalContext: `${selectedOpposite} represents a different cultural perspective in ${domain}`,
          imageUrl: `https://picsum.photos/400/300?random=${domainIndex * 10 + i}`,
          geminiExplanation: `This challenge is designed to broaden your ${domain} taste by introducing you to ${selectedOpposite}, which contrasts with your current preferences.`
        });
      }
    });
    
    // Shuffle the cards for variety
    const shuffledCards = fallbackCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentIndex(0);
    toast.success(`Generated ${shuffledCards.length} discomfort challenges!`);
  };

  const getOppositeGenres = (domain: string) => {
    const opposites: { [key: string]: string[] } = {
      music: ['Death Metal', 'Opera', 'Experimental Jazz', 'Noise Music', 'Gregorian Chant', 'Avant-garde', 'Drone Music'],
      movie: ['Art House Cinema', 'Silent Films', 'Foreign Language Films', 'Experimental Cinema', 'Documentary', 'Film Noir'],
      book: ['Philosophy', 'Academic Papers', 'Poetry', 'Experimental Literature', 'Non-fiction', 'Technical Manuals'],
      food: ['Fermented Foods', 'Organ Meats', 'Insects', 'Molecular Gastronomy', 'Raw Foods', 'Bitter Herbs'],
      fashion: ['Avant-garde Fashion', 'Minimalist Style', 'Vintage Clothing', 'Sustainable Fashion', 'Gender-neutral Clothing']
    };
    
    return opposites[domain] || ['Something New'];
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!user || swiping) return;
    
    setSwiping(true);
    
    try {
      const currentCard = cards[currentIndex];
      
      if (direction === 'right') {
        // Add to challenges
        const existingChallenges = JSON.parse(localStorage.getItem('zesty_challenges') || '[]');
        const newChallenge = {
          id: currentCard.id,
          title: currentCard.title,
          description: currentCard.description,
          domain: currentCard.domain,
          difficulty: currentCard.difficulty,
          status: 'active',
          addedAt: new Date().toISOString(),
          completedAt: null
        };
        
        existingChallenges.push(newChallenge);
        localStorage.setItem('zesty_challenges', JSON.stringify(existingChallenges));
        
        toast.success('Challenge added!');
      } else {
        toast('Card discarded');
      }
      
      // Move to next card
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Swipe error:', error);
      toast.error('Failed to process swipe');
    } finally {
      setSwiping(false);
    }
  };

  const handleShare = async () => {
    try {
      const currentCard = cards[currentIndex];
      if (navigator.share) {
        await navigator.share({
          title: currentCard.title,
          text: currentCard.description,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(`${currentCard.title}: ${currentCard.description}`);
        toast.success('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-white text-lg">Generating your discomfort challenges...</p>
          <p className="text-gray-400 text-sm mt-2">Using your cultural preferences to create personalized challenges</p>
        </div>
      </div>
    );
  }

  if (!cards.length || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white/5 rounded-lg p-6 shadow border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-3">No More Challenges</h2>
            <p className="text-white/70 text-sm mb-4">You've completed all available challenges! Generate more to continue your growth journey.</p>
            <button
              onClick={generateCards}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-lg font-medium transition-all"
            >
              Generate More Challenges
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">You've completed all challenges!</p>
          <button
            onClick={generateCards}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Generate More Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Discomfort Challenges</h1>
          <p className="text-gray-400">Swipe right to accept challenge, left to skip</p>
          <div className="text-sm text-gray-500 mt-2">
            Card {currentIndex + 1} of {cards.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Card Container */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentCard.id}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 rounded-lg p-6 shadow border border-white/10"
          >
          {/* Card Image */}
          {currentCard.imageUrl && (
            <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 overflow-hidden">
              <img
                src={currentCard.imageUrl}
                alt={currentCard.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

            {/* Card Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{currentCard.title}</h2>
                <div className="flex items-center gap-1">
                  {[...Array(currentCard.difficulty)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold inline-block">
                {currentCard.domain.charAt(0).toUpperCase() + currentCard.domain.slice(1)}
              </div>

              <p className="text-white/70 text-sm leading-relaxed">
                {currentCard.description}
              </p>

              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-white/60 text-xs">
                  <strong>Cultural Context:</strong> {currentCard.culturalContext}
                </p>
              </div>

              {currentCard.geminiExplanation && (
                <div className="bg-purple-500/20 rounded-lg p-3">
                  <p className="text-purple-200 text-xs">
                    <strong>Why this challenge?</strong> {currentCard.geminiExplanation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => handleSwipe('left')}
              disabled={swiping}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Skip
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSwipe('right')}
              disabled={swiping}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            >
              <Heart className="w-4 h-4" />
              Accept Challenge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
