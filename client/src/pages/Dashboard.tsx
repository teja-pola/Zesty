import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Star, Zap, Award, Calendar, Users, Check } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { ApiService } from '../lib/api';
import toast from 'react-hot-toast';

interface ProgressData {
  culturalExposureScore: number;
  discomfortLevel: number;
  challengesCompleted: number;
  challengesTotal: number;
  domainsUnlocked: string[];
  weeklyProgress: number;
  monthlyProgress: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string>('');

  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
    }
  }, [user, profile]);

  const loadDashboardData = async () => {
    try {
      // Get user's challenges and progress
      const { data: challenges } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user?.id);

      const completedChallenges = challenges?.filter(c => c.is_completed) || [];
      const totalChallenges = challenges?.length || 0;

      // Calculate progress data
      const progress: ProgressData = {
        culturalExposureScore: profile?.cultural_exposure_score || 25,
        discomfortLevel: profile?.discomfort_level || 1,
        challengesCompleted: completedChallenges.length,
        challengesTotal: totalChallenges,
        domainsUnlocked: profile?.domains_unlocked || [],
        weeklyProgress: Math.floor(Math.random() * 40) + 60, // Placeholder
        monthlyProgress: Math.floor(Math.random() * 60) + 40, // Placeholder
      };

      setProgressData(progress);

      // Generate AI insight
      if (completedChallenges.length > 0) {
        const insightText = await ApiService.generateProgressInsight(
          progress.culturalExposureScore - 5,
          progress.culturalExposureScore,
          completedChallenges.map(c => c.title)
        );
        setInsight(insightText);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const weeklyData = [
    { day: 'Mon', challenges: 2, score: 65 },
    { day: 'Tue', challenges: 3, score: 72 },
    { day: 'Wed', challenges: 1, score: 68 },
    { day: 'Thu', challenges: 4, score: 78 },
    { day: 'Fri', challenges: 2, score: 75 },
    { day: 'Sat', challenges: 5, score: 82 },
    { day: 'Sun', challenges: 3, score: 79 },
  ];

  const domainData: ChartData[] = [
    { name: 'Music', value: 35, color: '#8B5CF6' },
    { name: 'Movies', value: 25, color: '#06B6D4' },
    { name: 'Books', value: 20, color: '#10B981' },
    { name: 'Food', value: 15, color: '#F59E0B' },
    { name: 'Fashion', value: 5, color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-white/60">Loading your cultural journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="font-medium">Dashboard</span>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.full_name || 'Cultural Explorer'}! 🌟
            </h1>
            <p className="text-white/60">
              Here's your cultural growth journey at a glance
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Cultural Score</p>
                  <p className="text-2xl font-bold text-white">{progressData?.culturalExposureScore || 0}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Challenges</p>
                  <p className="text-2xl font-bold text-white">
                    {progressData?.challengesCompleted || 0}/{progressData?.challengesTotal || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Weekly Progress</p>
                  <p className="text-2xl font-bold text-white">{progressData?.weeklyProgress || 0}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Discomfort Level</p>
                  <p className="text-2xl font-bold text-white">{progressData?.discomfortLevel || 1}/5</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Weekly Progress Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Domain Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Cultural Domains</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={domainData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {domainData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* AI Insight */}
          {insight && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Award className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Insight</h3>
              </div>
              <p className="text-white/80 leading-relaxed">{insight}</p>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Completed Music Challenge</p>
                  <p className="text-white/60 text-sm">Explored classical music</p>
                </div>
                <span className="text-white/40 text-sm">2h ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">New Challenge Accepted</p>
                  <p className="text-white/60 text-sm">Try international cuisine</p>
                </div>
                <span className="text-white/40 text-sm">1d ago</span>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Cultural Score Increased</p>
                  <p className="text-white/60 text-sm">+5 points for diversity</p>
                </div>
                <span className="text-white/40 text-sm">3d ago</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}