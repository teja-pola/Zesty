import React from 'react';
import { Compass, Sparkles, Brain, Target, TrendingUp, Film, Music, ChefHat, BookOpen, Shirt, Globe, ArrowRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

const culturalDomains = [
  { icon: Film, name: 'Cinema', color: 'text-red-400' },
  { icon: Music, name: 'Music', color: 'text-purple-400' },
  { icon: ChefHat, name: 'Cuisine', color: 'text-orange-400' },
  { icon: BookOpen, name: 'Literature', color: 'text-green-400' },
  { icon: Shirt, name: 'Fashion', color: 'text-pink-400' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Taste Analysis',
    description: 'Our advanced AI understands your cultural preferences and creates personalized journeys that gradually expand your horizons.',
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    icon: Target,
    title: 'Discomfort-Based Challenges',
    description: 'Carefully curated recommendations that push your boundaries while remaining accessible and culturally enriching.',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: TrendingUp,
    title: 'Cultural Growth Tracking',
    description: 'Monitor your cultural expansion with detailed analytics, progress insights, and personalized feedback on your evolving taste.',
    gradient: 'from-pink-500 to-orange-500'
  }
];

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 15 },
  },
};

export default function About() {
  return (
    <div className="relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-transparent">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(192,132,252,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(34,211,238,0.15),rgba(255,255,255,0))]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-24 pb-16 z-10 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2"
          >
            <Compass className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">About Zesty</span>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tighter"
          >
            The Unrecommendation Engine
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto"
          >
            Zesty is your AI-powered guide to breaking out of your cultural comfort zone. We challenge your taste across movies, music, food, books, and fashion—expanding your horizons through carefully curated discomfort.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Our Mission</h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Like a wise grandmother who makes you try bitter gourd for your health, Zesty believes true growth comes from stepping outside your comfort zone. Our mission is to help you discover new dimensions of taste, creativity, and human expression—one challenge at a time.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-blue-400" /><span>Personalized, AI-driven taste analysis</span></li>
              <li className="flex items-center gap-3"><Target className="w-5 h-5 text-purple-400" /><span>Discomfort-based recommendations</span></li>
              <li className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-pink-400" /><span>Progress tracking and analytics</span></li>
            </ul>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-center gap-5 p-5 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl"
              >
                <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{feature.title}</h4>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-24 px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-bold text-white mb-4">Five Cultural Dimensions</motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-white/70 mb-12 max-w-3xl mx-auto">We challenge you across a comprehensive set of domains to ensure holistic growth.</motion.p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {culturalDomains.map((domain) => (
              <motion.div
                key={domain.name}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                className="p-8 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl"
              >
                <div className={`inline-flex p-4 rounded-xl mb-4 bg-gray-900/50`}>
                  <domain.icon className={`w-8 h-8 ${domain.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white">{domain.name}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center space-y-8 p-12 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-3xl"
        >
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">
            Begin Your Journey
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Join thousands of cultural explorers discovering new dimensions of taste, creativity, and human expression.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
