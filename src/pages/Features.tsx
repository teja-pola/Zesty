import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Map, Target, BarChart3, CheckCircle, Star, Award, Sparkles, UserCheck, Zap, Eye, PieChart, Activity, Users, Compass } from 'lucide-react';

const features = [
  {
    icon: UserCheck,
    title: 'Personalized Onboarding',
    description: 'Start your journey with a beautiful, animated onboarding flow that builds your unique taste profile across movies, music, food, books, and fashion.',
    details: [
      'Step-by-step animated onboarding',
      'Select preferences in each domain',
      'Progress bar and interactive UI',
      'Profile tailored to your tastes',
    ],
    color: 'from-blue-400 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Taste Analysis',
    description: 'Advanced AI (Gemini) and cultural graph (Qloo) integrations analyze your preferences and generate personalized, discomfort-based recommendations.',
    details: [
      'Gemini AI for explanations and plans',
      'Qloo for cross-domain recommendations',
      'Smart challenge/task generation',
      'Conversational, inspiring feedback',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Dashboard',
    description: 'Your cultural hub. Track your exposure score, completed challenges, and active domains. Instantly access your latest recommendations and see your growth at a glance.',
    details: [
      'Exposure Score & Weekly Growth',
      'Completed Challenges & Recommendations',
      'Active Domains Overview',
      'Quick Actions for New Challenges',
    ],
    color: 'from-blue-500 to-purple-500',
  },
  {
    icon: Map,
    title: 'Curriculum',
    description: 'Structured learning paths for every cultural domain. Each curriculum is tailored to your tastes and comfort level, guiding you step-by-step through new experiences.',
    details: [
      'Personalized, domain-specific paths',
      'Progressive steps with increasing challenge',
      'Track completion and revisit steps',
      'AI-generated plans and recommendations',
    ],
    color: 'from-green-400 to-blue-500',
  },
  {
    icon: Target,
    title: 'Challenges',
    description: 'Push your boundaries with curated cultural tasks. Challenges are generated based on your profile and preferences, and span movies, music, food, books, and fashion.',
    details: [
      'Domain-based challenge creation',
      'Difficulty levels from Gentle to Extreme',
      'Completion tracking and proof upload',
      'Earn awards for progress',
    ],
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Progress & Analytics',
    description: 'Visualize your journey with detailed analytics. See your growth over time, domain mastery, and completion rates with beautiful charts and stats.',
    details: [
      'Exposure score analytics',
      'Domain progress breakdown',
      'Growth trends and completion rates',
      'Motivational stats and awards',
    ],
    color: 'from-pink-500 to-orange-500',
  },
  
];

const processSteps = [
  {
    icon: Compass,
    title: '1. Onboard',
    text: 'Share your tastes in movies, music, food, books, and fashion through a playful, animated onboarding flow.'
  },
  {
    icon: Eye,
    title: '2. Analyze',
    text: 'AI and cultural graph integrations analyze your profile to map your comfort zone and suggest new experiences.'
  },
  {
    icon: Zap,
    title: '3. Challenge',
    text: 'Receive personalized, discomfort-based challenges and curriculum steps that push your boundaries.'
  },
  {
    icon: Activity,
    title: '4. Track & Grow',
    text: 'Visualize your progress, unlock new domains, and celebrate your cultural growth with awards and analytics.'
  },
];

export default function Features() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none z-0"></div>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center px-4 pt-24 pb-12 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3"
          >
            <Star className="w-5 h-5 text-yellow-400 animate-bounce" />
            <span className="text-white/80 text-sm">Features</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-white leading-tight"
          >
            Explore Zesty's Core Features
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Everything you need to break your cultural comfort zone—personalized, gamified, and beautifully visualized.
          </motion.p>
        </motion.div>
      </section>

      {/* Process Flow Section */}
      <section className="py-16 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2 } },
          }}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
        >
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="bg-gradient-to-br from-blue-400 to-pink-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-4 animate-pulse">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm">{step.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
          }}
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(80,80,255,0.10)' }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all duration-300 flex flex-col shadow-lg"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 mx-auto animate-fadeIn`}> 
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 text-center">{feature.title}</h2>
                <p className="text-white/60 leading-relaxed mb-6 text-center">{feature.description}</p>
                <ul className="space-y-3 mx-auto text-left max-w-xs">
                  {feature.details.map((detail, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 animate-fadeIn" />
                      <span className="text-white/80 text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
} 