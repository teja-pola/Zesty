import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Film, BookOpen, Utensils, ShoppingBag, ArrowRight, Check, X, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiService } from '../lib/api';
import toast from 'react-hot-toast';

const domains = [
  { key: 'music', label: 'Music', icon: Music, color: 'from-purple-500 to-pink-500', placeholder: 'Pop, Rock, Jazz...' },
  { key: 'movies', label: 'Movies & TV', icon: Film, color: 'from-blue-500 to-cyan-500', placeholder: 'Action, Comedy, Drama...' },
  { key: 'books', label: 'Books', icon: BookOpen, color: 'from-green-500 to-emerald-500', placeholder: 'Fiction, Mystery, Sci-Fi...' },
  { key: 'food', label: 'Food & Cuisine', icon: Utensils, color: 'from-orange-500 to-red-500', placeholder: 'Italian, Asian, Mexican...' },
  { key: 'fashion', label: 'Fashion & Style', icon: ShoppingBag, color: 'from-indigo-500 to-purple-500', placeholder: 'Casual, Formal, Streetwear...' },
];

// Dynamic suggestions that unlock based on selections (Spotify-style)
const dynamicSuggestions = {
  music: {
    base: ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B'],
    unlocked: {
      'Pop': ['Taylor Swift', 'Ariana Grande', 'Ed Sheeran', 'Billie Eilish', 'The Weeknd'],
      'Rock': ['Queen', 'The Beatles', 'Led Zeppelin', 'Foo Fighters', 'Arctic Monkeys'],
      'Hip Hop': ['Drake', 'Kendrick Lamar', 'Travis Scott', 'J. Cole', 'Kanye West'],
      'Electronic': ['Daft Punk', 'Calvin Harris', 'Skrillex', 'Deadmau5', 'Avicii'],
      'Jazz': ['Miles Davis', 'John Coltrane', 'Ella Fitzgerald', 'Louis Armstrong', 'Bill Evans']
    }
  },
  movies: {
    base: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary'],
    unlocked: {
      'Action': ['Marvel Movies', 'Fast & Furious', 'John Wick', 'Mission Impossible', 'Die Hard'],
      'Comedy': ['The Office', 'Friends', 'Brooklyn Nine-Nine', 'Parks and Recreation', 'Seinfeld'],
      'Drama': ['Breaking Bad', 'The Godfather', 'Shawshank Redemption', 'Game of Thrones', 'Better Call Saul'],
      'Horror': ['The Conjuring', 'Get Out', 'A Quiet Place', 'Hereditary', 'The Exorcist'],
      'Sci-Fi': ['Star Wars', 'Blade Runner', 'The Matrix', 'Interstellar', 'Dune']
    }
  },
  books: {
    base: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'Self-Help'],
    unlocked: {
      'Fiction': ['Harry Potter', 'To Kill a Mockingbird', '1984', 'Pride and Prejudice', 'The Great Gatsby'],
      'Mystery': ['Sherlock Holmes', 'Agatha Christie', 'Gone Girl', 'The Girl with the Dragon Tattoo', 'Big Little Lies'],
      'Sci-Fi': ['Dune', 'Foundation', 'The Martian', 'Ender\'s Game', 'Neuromancer'],
      'Fantasy': ['Lord of the Rings', 'Game of Thrones', 'The Hobbit', 'The Chronicles of Narnia', 'The Witcher'],
      'Romance': ['The Notebook', 'Pride and Prejudice', 'Me Before You', 'The Fault in Our Stars', 'Outlander']
    }
  },
  food: {
    base: ['Italian', 'Asian', 'Mexican', 'American', 'Indian', 'Mediterranean', 'French', 'Thai'],
    unlocked: {
      'Italian': ['Pizza', 'Pasta', 'Risotto', 'Gelato', 'Tiramisu'],
      'Asian': ['Sushi', 'Ramen', 'Dim Sum', 'Pad Thai', 'Pho'],
      'Mexican': ['Tacos', 'Burritos', 'Quesadillas', 'Guacamole', 'Enchiladas'],
      'American': ['Burgers', 'BBQ', 'Mac and Cheese', 'Fried Chicken', 'Apple Pie'],
      'Indian': ['Curry', 'Biryani', 'Naan', 'Samosas', 'Tandoori']
    }
  },
  fashion: {
    base: ['Casual', 'Formal', 'Streetwear', 'Vintage', 'Minimalist', 'Bohemian', 'Athletic', 'Luxury'],
    unlocked: {
      'Casual': ['Jeans', 'T-Shirts', 'Sneakers', 'Hoodies', 'Denim Jackets'],
      'Formal': ['Suits', 'Dress Shirts', 'Blazers', 'Dress Shoes', 'Ties'],
      'Streetwear': ['Supreme', 'Off-White', 'Yeezy', 'Nike', 'Adidas'],
      'Vintage': ['Thrift Store Finds', 'Band T-Shirts', 'Leather Jackets', 'High-Waisted Jeans', 'Vintage Accessories'],
      'Minimalist': ['Neutral Colors', 'Clean Lines', 'Quality Basics', 'Monochrome', 'Simple Silhouettes']
    }
  }
};

export function OnboardingNew() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, string[]>>({
    music: [],
    movies: [],
    books: [],
    food: [],
    fashion: [],
  });
  const [availableSuggestions, setAvailableSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const currentDomain = domains[currentStep];

  // Update suggestions based on current selections (Spotify-style)
  useEffect(() => {
    if (!currentDomain) return;
    
    const domainKey = currentDomain.key as keyof typeof dynamicSuggestions;
    const domainSuggestions = dynamicSuggestions[domainKey];
    
    let suggestions = [...domainSuggestions.base];
    
    // Add unlocked suggestions based on current selections
    preferences[domainKey]?.forEach(selection => {
      const unlockedItems = (domainSuggestions.unlocked as any)[selection];
      if (unlockedItems) {
        suggestions = [...suggestions, ...unlockedItems];
      }
    });
    
    // Remove already selected items
    suggestions = suggestions.filter(s => !preferences[domainKey]?.includes(s));
    
    setAvailableSuggestions(suggestions);
  }, [currentStep, preferences, currentDomain]);

  const handleAddPreference = (item: string) => {
    if (!currentDomain) return;
    
    const domainKey = currentDomain.key;
    if (item.trim() && !preferences[domainKey]?.includes(item.trim())) {
      setPreferences(prev => ({
        ...prev,
        [domainKey]: [...(prev[domainKey] || []), item.trim()]
      }));
      setInputValue('');
    }
  };

  const handleRemovePreference = (item: string) => {
    if (!currentDomain) return;
    
    const domainKey = currentDomain.key;
    setPreferences(prev => ({
      ...prev,
      [domainKey]: prev[domainKey]?.filter(p => p !== item) || []
    }));
  };

  const handleNext = () => {
    if (currentStep < domains.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue('');
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save preferences to localStorage as fallback (since Supabase is having issues)
      localStorage.setItem('zesty_preferences', JSON.stringify(preferences));
      localStorage.setItem('zesty_onboarding_complete', 'true');
      
      // Try to save to Supabase, but don't fail if it doesn't work
      try {
        await updateProfile({ onboarding_complete: true });
      } catch (error) {
        console.log('Supabase update failed, using localStorage fallback');
      }
      
      // Generate onboarding report
      try {
        const report = await ApiService.generateOnboardingReport(preferences, user.email || 'User');
        localStorage.setItem('zesty_onboarding_report', JSON.stringify(report));
      } catch (error) {
        console.log('Failed to generate onboarding report');
      }
      
      toast.success('Onboarding completed! Welcome to Zesty!');
      navigate('/explore');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleAddPreference(inputValue);
    }
  };

  if (!currentDomain) return null;

  const Icon = currentDomain.icon;
  const progress = ((currentStep + 1) / domains.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Discover Your Taste</h1>
            <span className="text-sm text-gray-400">{currentStep + 1} of {domains.length}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${currentDomain.color} mb-4`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">What {currentDomain.label} do you enjoy?</h2>
            <p className="text-gray-400">Select your favorites to help us understand your taste</p>
          </motion.div>

          {/* Input Field */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentDomain.placeholder}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {inputValue.trim() && (
                <button
                  onClick={() => handleAddPreference(inputValue)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-purple-500 rounded-full hover:bg-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Selected Preferences */}
          {preferences[currentDomain.key]?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Your Selections:</h3>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {preferences[currentDomain.key]?.map((item, _idx) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm"
                    >
                      <Check className="w-3 h-3 text-purple-400" />
                      <span>{item}</span>
                      <button
                        onClick={() => handleRemovePreference(item)}
                        className="text-purple-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {availableSuggestions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Suggestions for you:
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.slice(0, 12).map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.random() * 0.3 }}
                    onClick={() => handleAddPreference(suggestion)}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-purple-500 rounded-full text-sm transition-all duration-200 hover:scale-105"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={loading || preferences[currentDomain.key]?.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {currentStep === domains.length - 1 ? 'Complete' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
