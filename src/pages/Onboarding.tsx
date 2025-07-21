import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const domains = [
  {
    name: 'Movies',
    icon: '🎬',
    description: 'What films do you usually enjoy?',
    options: [
      'Action & Adventure', 'Comedy', 'Drama', 'Horror', 'Romance',
      'Sci-Fi', 'Documentary', 'Animation', 'Thriller', 'Fantasy',
      'Bollywood', 'Hollywood Blockbusters', 'Korean Cinema', 'European Art Films',
      'Marvel/DC Superhero', 'Independent Films', 'Classic Cinema', 'Musicals',
      'Crime & Noir', 'War Films', 'Biographical', 'Experimental Cinema'
    ]
  },
  {
    name: 'Music',
    icon: '🎵',
    description: 'What genres move your soul?',
    options: [
      'Pop Music', 'Rock & Alternative', 'Hip Hop & Rap', 'Electronic & EDM', 'Jazz', 'Classical',
      'Country & Folk', 'R&B & Soul', 'Indie Music', 'Metal & Hard Rock', 'Reggae & Caribbean',
      'K-Pop & Asian Pop', 'Bollywood & Indian', 'World Music', 'Blues & Gospel',
      'Punk & Hardcore', 'Ambient & Experimental', 'Traditional & Cultural', 'Latin Music'
    ]
  },
  {
    name: 'Food',
    icon: '🍜',
    description: 'What flavors comfort you?',
    options: [
      'Italian Cuisine', 'Chinese Food', 'Indian Spices', 'Mexican Flavors', 'Japanese Cuisine', 'French Cooking',
      'Thai Food', 'Mediterranean Diet', 'Korean Dishes', 'American Comfort Food', 'Middle Eastern',
      'African Cuisine', 'Vietnamese Pho', 'Street Food Culture', 'Vegetarian/Vegan', 'Fine Dining',
      'Fast Food', 'Spicy & Hot', 'Sweet Desserts', 'Fermented & Pickled', 'Seafood & Fish'
    ]
  },
  {
    name: 'Books',
    icon: '📚',
    description: 'What stories captivate you?',
    options: [
      'Literary Fiction', 'Non-Fiction Essays', 'Mystery & Crime', 'Romance Novels', 'Fantasy Worlds', 'Science Fiction',
      'Biographies', 'Historical Books', 'Philosophy', 'Poetry Collections', 'Self-Help & Growth',
      'Travel Writing', 'Graphic Novels', 'Classic Literature', 'Contemporary Fiction',
      'Memoirs & Autobiographies', 'Business & Economics', 'Science & Nature', 'Spiritual & Religious'
    ]
  },
  {
    name: 'Fashion',
    icon: '👗',
    description: 'How do you express yourself?',
    options: [
      'Casual Everyday', 'Formal Business', 'Streetwear Urban', 'Vintage Retro', 'Minimalist Clean', 'Bohemian Free',
      'Punk & Alternative', 'Preppy Classic', 'Artistic Creative', 'Athletic Sporty', 'Luxury Designer', 'Sustainable Eco',
      'Korean Fashion', 'Traditional Cultural', 'Avant-garde Experimental', 'Trendy Seasonal',
      'Ethnic & Cultural Wear', 'Gothic Dark', 'Y2K Nostalgic', 'Futuristic Tech'
    ]
  }
];

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const currentDomain = domains[currentStep];

  const togglePreference = (option: string) => {
    const domainPrefs = preferences[currentDomain.name] || [];
    const updated = domainPrefs.includes(option)
      ? domainPrefs.filter(p => p !== option)
      : [...domainPrefs, option];
    
    setPreferences({
      ...preferences,
      [currentDomain.name]: updated
    });
  };

  const handleNext = () => {
    if (currentStep < domains.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save taste preferences to database
      const preferencePromises = Object.entries(preferences).map(([domain, prefs]) => {
        if (prefs.length > 0) {
          return supabase.from('taste_preferences').upsert({
            user_id: user.id,
            domain: domain.toLowerCase(),
            preferences: prefs,
            dislikes: []
          });
        }
        return Promise.resolve();
      });

      await Promise.all(preferencePromises);

      // Update profile with onboarding completion
      if (updateProfile) {
        await updateProfile({
          domains_unlocked: Object.keys(preferences).map(d => d.toLowerCase())
        });
      }

      toast.success('Welcome to Zesty! Your taste profile has been created.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = preferences[currentDomain?.name]?.length || 0;
  const progress = ((currentStep + 1) / domains.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/5 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/60 text-center">
            Step {currentStep + 1} of {domains.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentDomain?.icon}</div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {currentDomain?.description}
              </h1>
              <p className="text-white/60">
                Select all that resonate with you. We'll use this to craft your perfect cultural challenges.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {currentDomain?.options.map((option, index) => {
                const isSelected = preferences[currentDomain.name]?.includes(option);
                return (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    onClick={() => togglePreference(option)}
                    className={`relative p-4 rounded-2xl border transition-all duration-300 hover:scale-105 text-left ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="font-medium text-sm">{option}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-2 text-white/60">
                <Sparkles className="w-4 h-4" />
                <span>{selectedCount} selected</span>
              </div>

              <button
                onClick={handleNext}
                disabled={selectedCount === 0 || loading}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105"
              >
                <span>
                  {currentStep === domains.length - 1 
                    ? (loading ? 'Creating Profile...' : 'Complete Journey') 
                    : 'Continue'
                  }
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}