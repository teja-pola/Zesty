import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Music, Film, BookOpen, Utensils, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const domains = [
  { key: 'music', label: 'Music', icon: Music, color: 'from-purple-500 to-pink-500' },
  { key: 'movies', label: 'Movies & TV', icon: Film, color: 'from-blue-500 to-cyan-500' },
  { key: 'books', label: 'Books', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
  { key: 'food', label: 'Food & Cuisine', icon: Utensils, color: 'from-orange-500 to-red-500' },
  { key: 'fashion', label: 'Fashion & Style', icon: ShoppingBag, color: 'from-indigo-500 to-purple-500' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    music: [],
    movies: [],
    books: [],
    food: [],
    fashion: [],
  });
  const [currentDomain, setCurrentDomain] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddPreference = (domain: keyof typeof preferences, item: string) => {
    if (item.trim() && !preferences[domain].includes(item.trim())) {
      setPreferences(prev => ({
        ...prev,
        [domain]: [...prev[domain], item.trim()]
      }));
      setCurrentInput('');
    }
  };

  const handleRemovePreference = (domain: keyof typeof preferences, item: string) => {
    setPreferences(prev => ({
      ...prev,
      [domain]: prev[domain].filter(p => p !== item)
    }));
  };

  const handleNext = () => {
    if (currentDomain < domains.length - 1) {
      setCurrentDomain(prev => prev + 1);
    } else {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    setLoading(true);
    try {
      // Calculate initial cultural exposure score based on preferences
      const totalPreferences = Object.values(preferences).reduce((sum, items) => sum + items.length, 0);
      const culturalExposureScore = Math.max(20, Math.min(50, 20 + totalPreferences * 2));
      
      // Update user profile with processed data
      await updateProfile({
        cultural_exposure_score: culturalExposureScore,
        discomfort_level: 1,
        domains_unlocked: ['music', 'movies', 'books', 'food', 'fashion'],
      });

      // Store taste preferences in Supabase
      const { error } = await supabase
        .from('taste_preferences')
        .upsert({
          user_id: user.id,
          preferences: preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Onboarding completed! Welcome to Zesty!');
      navigate('/explore');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentDomainData = domains[currentDomain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Welcome to Zesty</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/60">Step {currentStep + 1} of 2</span>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep * domains.length + currentDomain + 1) / (domains.length + 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {currentStep === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Domain Header */}
              <div className="text-center space-y-4">
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <currentDomainData.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold">What {currentDomainData.label} do you love?</h2>
                <p className="text-white/60 max-w-md mx-auto">
                  Tell us about your favorite {currentDomainData.label.toLowerCase()} so we can help you discover new cultural experiences.
                </p>
              </div>

              {/* Input Section */}
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPreference(currentDomainData.key as keyof typeof preferences, currentInput);
                      }
                    }}
                    placeholder={`Add your favorite ${currentDomainData.label.toLowerCase()}...`}
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => handleAddPreference(currentDomainData.key as keyof typeof preferences, currentInput)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Add
                  </button>
                </div>

                {/* Preferences List */}
                <div className="space-y-2">
                  {preferences[currentDomainData.key as keyof typeof preferences].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    >
                      <span className="text-white">{item}</span>
                      <button
                        onClick={() => handleRemovePreference(currentDomainData.key as keyof typeof preferences, item)}
                        className="text-white/40 hover:text-white/80 transition-colors"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-8">
                  <button
                    onClick={() => setCurrentDomain(prev => Math.max(0, prev - 1))}
                    disabled={currentDomain === 0}
                    className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <span>{currentDomain === domains.length - 1 ? 'Continue' : 'Next'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold">Perfect! 🎉</h2>
                <p className="text-white/60 max-w-md mx-auto">
                  We've analyzed your taste preferences and created a personalized cultural journey just for you.
                </p>
              </div>

              {/* Summary */}
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {domains.map((domain) => (
                    <div key={domain.key} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <domain.icon className="w-4 h-4 text-white/60" />
                        <span className="text-sm font-medium">{domain.label}</span>
                      </div>
                      <p className="text-xs text-white/40">
                        {preferences[domain.key as keyof typeof preferences].length} preferences
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-4 rounded-xl font-medium text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Setting up your journey...' : 'Start Your Cultural Journey'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}