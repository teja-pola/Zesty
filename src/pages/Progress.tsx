import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

interface ProgressEntry {
  id: string;
  metric_type: string;
  metric_value: number;
  domain?: string;
  recorded_at: string;
}

interface DomainProgress {
  domain: string;
  completed: number;
  total: number;
  percentage: number;
}

export function Progress() {
  const { user, profile } = useAuth();
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [domainProgress, setDomainProgress] = useState<DomainProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
      loadDomainProgress();
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: true });

      if (error) throw error;
      setProgressData(data || []);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const loadDomainProgress = async () => {
    if (!user) return;

    try {
      // Get completed recommendations by domain
      const { data: recommendations, error: recError } = await supabase
        .from('recommendations')
        .select('domain, is_completed')
        .eq('user_id', user.id);

      if (recError) throw recError;

      // Get completed challenges by domain
      const { data: challenges, error: chalError } = await supabase
        .from('challenges')
        .select('domain, is_completed')
        .eq('user_id', user.id);

      if (chalError) throw chalError;

      // Calculate domain progress
      const domains = ['movies', 'music', 'food', 'books', 'fashion'];
      const progress = domains.map(domain => {
        const domainRecs = recommendations?.filter(r => r.domain === domain) || [];
        const domainChals = challenges?.filter(c => c.domain === domain) || [];
        
        const totalRecs = domainRecs.length;
        const completedRecs = domainRecs.filter(r => r.is_completed).length;
        
        const totalChals = domainChals.length;
        const completedChals = domainChals.filter(c => c.is_completed).length;
        
        const total = totalRecs + totalChals;
        const completed = completedRecs + completedChals;
        
        return {
          domain,
          completed,
          total,
          percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      });

      setDomainProgress(progress);
    } catch (error) {
      console.error('Error loading domain progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data for demonstration
  const generateChartData = () => {
    const currentScore = profile?.cultural_exposure_score || 0;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return months.map((month, index) => ({
      month,
      score: Math.max(0, currentScore - (months.length - index - 1) * 15 + Math.random() * 10)
    }));
  };

  const chartData = generateChartData();

  const pieData = domainProgress.map((domain, index) => ({
    name: domain.domain,
    value: domain.completed,
    color: ['#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'][index]
  }));

  const COLORS = ['#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

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
            Progress Analytics
          </h1>
          <p className="text-xl text-white/60">
            Track your cultural exploration journey and growth over time
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{profile?.cultural_exposure_score || 0}</div>
                <div className="text-white/60 text-sm">Exposure Score</div>
              </div>
            </div>
            <div className="text-green-400 text-sm">+15% this month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {domainProgress.reduce((sum, d) => sum + d.completed, 0)}
                </div>
                <div className="text-white/60 text-sm">Completed Tasks</div>
              </div>
            </div>
            <div className="text-green-400 text-sm">+8 this week</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-2xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{profile?.domains_unlocked?.length || 0}</div>
                <div className="text-white/60 text-sm">Domains Unlocked</div>
              </div>
            </div>
            <div className="text-green-400 text-sm">All domains active</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{profile?.discomfort_level || 1}</div>
                <div className="text-white/60 text-sm">Comfort Level</div>
              </div>
            </div>
            <div className="text-green-400 text-sm">Level up ready</div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Cultural Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Cultural Growth</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Domain Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <PieChart className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Domain Distribution</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Domain Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-8">Domain Progress</h2>
          <div className="space-y-6">
            {domainProgress.map((domain, index) => (
              <div key={domain.domain} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {domain.domain === 'movies' ? '🎬' :
                       domain.domain === 'music' ? '🎵' :
                       domain.domain === 'food' ? '🍜' :
                       domain.domain === 'books' ? '📚' : '👗'}
                    </span>
                    <span className="text-white font-medium capitalize">{domain.domain}</span>
                  </div>
                  <div className="text-white/60 text-sm">
                    {domain.completed}/{domain.total} completed ({domain.percentage}%)
                  </div>
                </div>
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${domain.percentage}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}