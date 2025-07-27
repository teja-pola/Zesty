import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 

  ArrowRight, 
  CheckCircle, 
  Clock,
  Star,
  Target
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { GeminiService } from '../lib/gemini';

interface CurriculumStep {
  step: number;
  title: string;
  description: string;
  difficulty: number;
  completed: boolean;
  current?: boolean;
}

interface CurriculumPath {
  id: string;
  domain: string;
  current_step: number;
  total_steps: number;
  path_data: CurriculumStep[];
  gemini_plan?: string;
}

export function Curriculum() {
  const { user } = useAuth();
  const [curriculums, setCurriculums] = useState<CurriculumPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCurriculums();
    }
  }, [user]);

  const loadCurriculums = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('curriculum_paths')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setCurriculums(data || []);
    } catch (error) {
      console.error('Error loading curriculums:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCurriculum = async (domain: string) => {
    if (!user) return;
    setGenerating(domain);

    try {
      // Get user's taste preferences for this domain
      const { data: prefs } = await supabase
        .from('taste_preferences')
        .select('*')
        .eq('user_id', user.id)
        .eq('domain', domain)
        .single();

      if (!prefs) {
        throw new Error('No preferences found for this domain');
      }

      // Generate curriculum steps (mock implementation)
      const steps: CurriculumStep[] = await generateMockCurriculumSteps(domain, prefs.preferences);

      // Generate Gemini plan
      const geminiPlan = await GeminiService.generateCurriculumPlan(
        prefs.preferences,
        steps.map(s => s.title),
        domain
      );

      // Save to database
      const { error } = await supabase
        .from('curriculum_paths')
        .insert({
          user_id: user.id,
          domain,
          current_step: 0,
          total_steps: steps.length,
          path_data: steps,
          gemini_plan: geminiPlan
        });

      if (error) throw error;

      await loadCurriculums();
    } catch (error) {
      console.error('Error generating curriculum:', error);
    } finally {
      setGenerating(null);
    }
  };

  const generateMockCurriculumSteps = async (domain: string, currentTastes: string[]): Promise<CurriculumStep[]> => {
    // Generate more personalized curriculum based on user's current tastes
    const getPersonalizedCurriculum = (domain: string, _tastes: string[]) => {
      const baseCurricula = {
      movies: [
        { title: 'Genre Bridge Films', description: 'Films that blend your favorite genres with new elements', difficulty: 1 },
        { title: 'International Perspectives', description: 'Stories from different cultures with universal themes', difficulty: 2 },
        { title: 'Auteur Cinema', description: 'Director-driven films with unique visual styles', difficulty: 3 },
        { title: 'Experimental Narratives', description: 'Films that challenge traditional storytelling', difficulty: 4 },
        { title: 'Pure Cinema Art', description: 'Visual poetry and abstract film experiences', difficulty: 5 }
      ],
      music: [
        { title: 'Adjacent Genres', description: 'Explore genres closely related to your favorites', difficulty: 1 },
        { title: 'Cultural Crossroads', description: 'Music that blends different cultural traditions', difficulty: 2 },
        { title: 'Instrumental Mastery', description: 'Focus on pure musical composition and skill', difficulty: 3 },
        { title: 'Experimental Boundaries', description: 'Artists pushing the limits of their genres', difficulty: 4 },
        { title: 'Sound as Art', description: 'Abstract and ambient musical experiences', difficulty: 5 }
      ],
      food: [
        { title: 'Spice Level Progression', description: 'Gradually increase heat and complexity', difficulty: 1 },
        { title: 'Regional Specialties', description: 'Authentic dishes from specific regions', difficulty: 2 },
        { title: 'Texture Adventures', description: 'Foods with unusual mouthfeel and preparation', difficulty: 3 },
        { title: 'Fermentation Journey', description: 'Aged and cultured foods from around the world', difficulty: 4 },
        { title: 'Acquired Tastes', description: 'Foods that challenge Western palates', difficulty: 5 }
      ],
      books: [
        { title: 'Cross-Genre Exploration', description: 'Books that blend familiar and new genres', difficulty: 1 },
        { title: 'Cultural Narratives', description: 'Stories from different cultural perspectives', difficulty: 2 },
        { title: 'Complex Structures', description: 'Books with innovative narrative techniques', difficulty: 3 },
        { title: 'Philosophical Literature', description: 'Works that challenge your worldview', difficulty: 4 },
        { title: 'Experimental Forms', description: 'Books that redefine what literature can be', difficulty: 5 }
      ],
      fashion: [
        { title: 'Style Fusion', description: 'Blend your current style with new elements', difficulty: 1 },
        { title: 'Cultural Appreciation', description: 'Respectfully explore traditional garments', difficulty: 2 },
        { title: 'Designer Philosophy', description: 'Understand fashion as artistic expression', difficulty: 3 },
        { title: 'Avant-garde Aesthetics', description: 'Fashion that challenges conventional beauty', difficulty: 4 },
        { title: 'Wearable Concepts', description: 'Clothing as pure artistic statement', difficulty: 5 }
      ]
      };
      
      return baseCurricula[domain as keyof typeof baseCurricula] || baseCurricula.movies;
    };

    const domainSteps = getPersonalizedCurriculum(domain, currentTastes);
    
    return domainSteps.map((step, index) => ({
      step: index + 1,
      title: step.title,
      description: step.description,
      difficulty: step.difficulty,
      completed: false,
      current: index === 0
    }));
  };

  const domains = [
    { name: 'movies', icon: '🎬', label: 'Movies', gradient: 'from-red-500 to-pink-500' },
    { name: 'music', icon: '🎵', label: 'Music', gradient: 'from-purple-500 to-indigo-500' },
    { name: 'food', icon: '🍜', label: 'Food', gradient: 'from-orange-500 to-yellow-500' },
    { name: 'books', icon: '📚', label: 'Books', gradient: 'from-green-500 to-teal-500' },
    { name: 'fashion', icon: '👗', label: 'Fashion', gradient: 'from-pink-500 to-purple-500' }
  ];

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Cultural Curriculum
          </h1>
          <p className="text-xl text-white/60">
            Progressive learning paths to expand your taste in every domain
          </p>
        </motion.div>

        {/* Generate New Curriculums */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Learning Path</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {domains.map(domain => {
              const existingCurriculum = curriculums.find(c => c.domain === domain.name);
              return (
                <motion.button
                  key={domain.name}
                  onClick={() => !existingCurriculum && generateCurriculum(domain.name)}
                  disabled={generating === domain.name || !!existingCurriculum}
                  className={`relative p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                    existingCurriculum
                      ? 'bg-green-500/20 border-green-400 cursor-default'
                      : generating === domain.name
                      ? 'bg-white/5 border-white/10 cursor-wait'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: domains.indexOf(domain) * 0.1 }}
                >
                  <div className="text-3xl mb-3">{domain.icon}</div>
                  <div className="text-white font-medium">{domain.label}</div>
                  {existingCurriculum && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                  {generating === domain.name && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Existing Curriculums */}
        {curriculums.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-white mb-4">No learning paths yet!</h2>
            <p className="text-white/60">Create your first curriculum to start your cultural journey.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {curriculums.map((curriculum, index) => (
              <motion.div
                key={curriculum.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">
                      {domains.find(d => d.name === curriculum.domain)?.icon || '🎯'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white capitalize">
                        {curriculum.domain} Journey
                      </h2>
                      <p className="text-white/60">
                        Step {curriculum.current_step + 1} of {curriculum.total_steps}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-white/10 px-4 py-2 rounded-xl">
                      <span className="text-white font-medium">
                        {Math.round(((curriculum.current_step + 1) / curriculum.total_steps) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Path */}
                <div className="relative">
                  <div className="flex items-center space-x-6 overflow-x-auto pb-4">
                    {curriculum.path_data.map((step, stepIndex) => (
                      <div key={step.step} className="flex items-center space-x-6 flex-shrink-0">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                            step.completed
                              ? 'bg-green-500/20 border-green-400'
                              : step.current
                              ? 'bg-purple-500/20 border-purple-400'
                              : 'bg-white/5 border-white/20'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="w-8 h-8 text-green-400" />
                            ) : step.current ? (
                              <Target className="w-8 h-8 text-purple-400" />
                            ) : (
                              <Clock className="w-8 h-8 text-white/40" />
                            )}
                          </div>
                          <div className="absolute -top-2 -right-2 bg-white/10 rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{step.step}</span>
                          </div>
                        </div>
                        
                        {stepIndex < curriculum.path_data.length - 1 && (
                          <ArrowRight className="w-6 h-6 text-white/40" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step Details */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {curriculum.path_data.map((step) => (
                      <div
                        key={step.step}
                        className={`p-6 rounded-2xl border ${
                          step.completed
                            ? 'bg-green-500/10 border-green-400/50'
                            : step.current
                            ? 'bg-purple-500/10 border-purple-400/50'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-white">{step.title}</h3>
                          <div className="flex">
                            {Array.from({ length: step.difficulty }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/60 text-sm">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Plan */}
                {curriculum.gemini_plan && (
                  <div className="mt-8 bg-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">AI-Generated Learning Plan</h3>
                    <p className="text-white/80 leading-relaxed whitespace-pre-line">
                      {curriculum.gemini_plan}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}