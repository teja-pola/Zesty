import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {  Music, Film, BookOpen, Utensils, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { QlooService, QlooEntity } from '../lib/qloo';
import { GeminiService } from '../lib/gemini';

const domains = [
  { key: 'music', label: 'Music', icon: Music, color: 'from-purple-500 to-pink-500' },
  { key: 'movies', label: 'Movies & TV', icon: Film, color: 'from-blue-500 to-cyan-500' },
  { key: 'books', label: 'Books', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
  { key: 'food', label: 'Food & Cuisine', icon: Utensils, color: 'from-orange-500 to-red-500' },
  { key: 'fashion', label: 'Fashion & Style', icon: ShoppingBag, color: 'from-indigo-500 to-purple-500' },
];

type DiscomfortCard = {
  domain: string;
  entity: QlooEntity;
  explanation: string;
};

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
  const [discomfortCards, setDiscomfortCards] = useState<DiscomfortCard[]>([]);
  const [showDiscomfort, setShowDiscomfort] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const handleAddPreference = async (domain: keyof typeof preferences, item: string) => {
    if (item.trim() && !(preferences[domain as keyof typeof preferences] as string[]).includes(item.trim())) {
      setPreferences(prev => ({
        ...prev,
        [domain]: [...prev[domain], item.trim()]
      }));
      setCurrentInput('');
      // Fetch new suggestions based on the added item
      await fetchSuggestions(domain, item.trim());
    }
  };

  const fetchSuggestions = async (domain: keyof typeof preferences, seed?: string) => {
    setSuggestLoading(true);
    try {
      let recs: QlooEntity[] = [];
      if (seed) {
        // If a seed is provided, search for the entity and get recommendations for it
        const entity = await QlooService.searchEntity(seed, domain);
        if (entity) {
          recs = await QlooService.getRecommendations(entity.id, domain);
        }
      } else {
        // If no seed, show static fallback suggestions for each domain
        const staticSuggestions: Record<string, string[]> = {
          music: ['The Beatles', 'Taylor Swift', 'Drake', 'BTS', 'Adele'],
          movies: ['Inception', 'The Godfather', 'Parasite', 'Avengers', 'Spirited Away'],
          books: ['1984', 'Harry Potter', 'The Alchemist', 'To Kill a Mockingbird', 'Sapiens'],
          food: ['Pizza', 'Sushi', 'Tacos', 'Pasta', 'Ramen'],
          fashion: ['Nike', 'Gucci', 'Zara', 'Levi’s', 'Chanel'],
        };
        setSuggestions(staticSuggestions[domain] || []);
        setSuggestLoading(false);
        return;
      }
      setSuggestions(recs.map((r) => r.name));
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  };

  useEffect(() => {
    // Fetch initial suggestions for the current domain
    fetchSuggestions(domains[currentDomain].key as keyof typeof preferences);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDomain]);

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
      // Update user profile with processed data and mark onboarding as complete
      await updateProfile({
        cultural_exposure_score: culturalExposureScore,
        discomfort_level: 1,
        domains_unlocked: ['music', 'movies', 'books', 'food', 'fashion'],
        onboarding_complete: true,
      });
      // Store taste preferences in Supabase: one row per domain, and one merged row for Settings/Explore
      const upsertRows = Object.keys(preferences)
        .filter((domain) => preferences[domain as keyof typeof preferences].length > 0)
        .map((domain) => ({
          user_id: user.id,
          domain,
          preferences: preferences[domain as keyof typeof preferences],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      // Add a merged row for all preferences (for Settings/Explore compatibility)
      const mergedRow = {
        user_id: user.id,
        domain: 'all',
        preferences: preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (upsertRows.length > 0) {
        const { error } = await supabase
          .from('taste_preferences')
          .upsert([...upsertRows, mergedRow], { onConflict: 'user_id,domain' });
        if (error) throw error;
      }
      // Fetch discomfort recommendations and explanations
      const discomforts: DiscomfortCard[] = [];
      for (const domain of Object.keys(preferences)) {
        const likes = preferences[domain as keyof typeof preferences];
        if (likes.length === 0) continue;
        // Use the first liked item as the seed
        const entity = await QlooService.searchEntity(likes[0], domain);
        if (!entity) continue;
        const antitheses = await QlooService.getAntitheses(entity.id, domain);
        for (const anti of antitheses.slice(0, 2)) { // Limit to 2 per domain for demo
          const explanation = await GeminiService.generateContent(
            `You like ${likes.join(', ')} in ${domain}. Try "${anti.name}" for a new experience. Why?`
          );
          discomforts.push({ domain, entity: anti, explanation });
        }
      }
      setDiscomfortCards(discomforts);
      setShowDiscomfort(true);
      setCardIndex(0);
      setLoading(false);
      // If no discomforts, or after showing, redirect to explore after a short delay
      if (discomforts.length === 0) {
        setTimeout(() => navigate('/explore'), 1200);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
      setShowDiscomfort(false);
    } finally {
      setLoading(false);
    }
  };

  if (showDiscomfort) {
    // If all cards are viewed, auto-redirect to explore
    if (discomfortCards.length > 0 && cardIndex >= discomfortCards.length - 1) {
      setTimeout(() => navigate('/explore'), 1500);
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-black text-white flex flex-col items-center justify-center">
        <div className="max-w-xl w-full p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">Your Discomfort Dose is Ready</h2>
          {discomfortCards.length === 0 ? (
            <div className="text-center">No discomfort recommendations found. <button className="underline" onClick={()=>navigate('/explore')}>Skip</button></div>
          ) : (
            <div className="bg-white/10 rounded-xl p-6 shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">{discomfortCards[cardIndex].entity.name}</h3>
              <p className="text-sm text-white/70 mb-2">Domain: {discomfortCards[cardIndex].domain}</p>
              <p className="mb-4">{discomfortCards[cardIndex].explanation}</p>
              <div className="flex space-x-4">
                <button onClick={()=>setCardIndex(i=>Math.max(0,i-1))} disabled={cardIndex===0} className="px-4 py-2 rounded bg-white/20">Previous</button>
                <button onClick={()=>setCardIndex(i=>Math.min(discomfortCards.length-1,i+1))} disabled={cardIndex===discomfortCards.length-1} className="px-4 py-2 rounded bg-white/20">Next</button>
                <button onClick={()=>navigate('/explore')} className="px-4 py-2 rounded bg-gradient-to-r from-orange-500 to-red-500 font-bold">Start Exploring</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentDomainData = domains[currentDomain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Progress Bar - now below header, no Welcome header */}
      <div className="w-full bg-black/20 backdrop-blur-xl border-b border-white/10 pt-4 pb-2 sticky top-20 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-end">
            <span className="text-sm text-white/60">Step {currentDomain + 1} of {domains.length}</span>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden ml-4">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentDomain + 1) / domains.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
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
                <div className="flex flex-col space-y-2">
                  {/* Suggestions */}
                  {suggestLoading ? (
                    <div className="text-white/60 text-sm">Loading suggestions...</div>
                  ) : suggestions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow hover:scale-105 hover:from-pink-500 hover:to-purple-600 transition-all border-2 border-transparent hover:border-white"
                          onClick={() => handleAddPreference(currentDomainData.key as keyof typeof preferences, s)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="mr-1">{s}</span>
                          <span className="bg-white/20 text-white/80 px-2 py-0.5 rounded-full text-[10px] ml-1">Tap for more</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
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
                    disabled={preferences[currentDomainData.key as keyof typeof preferences].length < 1}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
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