import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Trophy,
  Star,
  RotateCcw,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: number;
  isCompleted: boolean;
  dateAdded: string;
  dateCompleted?: string;
}

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    setLoading(true);
    try {
      const storedChallenges = localStorage.getItem('zesty_challenges');
      if (storedChallenges) {
        const parsedChallenges = JSON.parse(storedChallenges);
        setChallenges(parsedChallenges);
      } else {
        setChallenges([]);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      setChallenges([]);
      toast.error('Failed to load challenges');
    }
    setLoading(false);
  };

  const saveChallenges = (updatedChallenges: Challenge[]) => {
    try {
      localStorage.setItem('zesty_challenges', JSON.stringify(updatedChallenges));
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Error saving challenges:', error);
      toast.error('Failed to save changes');
    }
  };

  const markAsCompleted = (challengeId: string) => {
    const updatedChallenges = challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, isCompleted: true, dateCompleted: new Date().toISOString() }
        : challenge
    );
    saveChallenges(updatedChallenges);
    toast.success('Challenge completed! 🎉');
  };

  const markAsActive = (challengeId: string) => {
    const updatedChallenges = challenges.map(challenge =>
      challenge.id === challengeId
        ? { ...challenge, isCompleted: false, dateCompleted: undefined }
        : challenge
    );
    saveChallenges(updatedChallenges);
    toast.success('Challenge reactivated!');
  };

  const removeChallenge = (challengeId: string) => {
    const updatedChallenges = challenges.filter(challenge => challenge.id !== challengeId);
    saveChallenges(updatedChallenges);
    toast.success('Challenge removed');
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < level ? 'text-yellow-400 fill-current' : 'text-gray-600'
        }`}
      />
    ));
  };

  const getDomainIcon = (domain: string) => {
    const icons: Record<string, string> = {
      movies: '🎬',
      music: '🎵',
      food: '🍜',
      books: '📚',
      fashion: '👗',
      default: '🎯'
    };
    return icons[domain] || icons.default;
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'active') return !challenge.isCompleted;
    if (activeTab === 'completed') return challenge.isCompleted;
    return true;
  });

  const stats = {
    total: challenges.length,
    active: challenges.filter(c => !c.isCompleted).length,
    completed: challenges.filter(c => c.isCompleted).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Challenges
          </h1>
          <p className="text-xl text-white/60">
            Track your cultural exploration journey
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-white/60">Total</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.active}</div>
            <div className="text-white/60">Active</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.completed}</div>
            <div className="text-white/60">Completed</div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex">
            {(['all', 'active', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-16"
          >
            <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              {activeTab === 'all' ? 'No challenges yet' : `No ${activeTab} challenges`}
            </h3>
            <p className="text-white/60 mb-6">
              {activeTab === 'all' 
                ? 'Start exploring to add challenges to your journey!'
                : `You don't have any ${activeTab} challenges at the moment.`
              }
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => window.location.href = '/explore'}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                Explore Challenges
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 ${
                  challenge.isCompleted ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getDomainIcon(challenge.domain)}</div>
                    <div>
                      <div className="text-sm text-white/60 capitalize">{challenge.domain}</div>
                      <div className="flex">{getDifficultyStars(challenge.difficulty)}</div>
                    </div>
                  </div>
                  {challenge.isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{challenge.title}</h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-3">{challenge.description}</p>

                <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Added {new Date(challenge.dateAdded).toLocaleDateString()}</span>
                  </div>
                  {challenge.isCompleted && challenge.dateCompleted && (
                    <div className="flex items-center space-x-1">
                      <Trophy className="w-3 h-3" />
                      <span>Completed {new Date(challenge.dateCompleted).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {!challenge.isCompleted ? (
                    <button
                      onClick={() => markAsCompleted(challenge.id)}
                      className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl font-medium hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => markAsActive(challenge.id)}
                      className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-xl font-medium hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reactivate</span>
                    </button>
                  )}
                  <button
                    onClick={() => removeChallenge(challenge.id)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
