import React from 'react';
import { Compass, Sparkles, Brain, Target, TrendingUp, Film, Music, ChefHat, BookOpen, Shirt, Globe, Zap, Heart, Eye, Palette, Coffee, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const culturalDomains = [
  { icon: Film, name: 'Cinema', color: 'text-red-400', description: 'From blockbusters to art house' },
  { icon: Music, name: 'Music', color: 'text-purple-400', description: 'Explore global soundscapes' },
  { icon: ChefHat, name: 'Cuisine', color: 'text-orange-400', description: 'Taste the world\'s flavors' },
  { icon: BookOpen, name: 'Literature', color: 'text-green-400', description: 'Stories across cultures' },
  { icon: Shirt, name: 'Fashion', color: 'text-pink-400', description: 'Style beyond borders' },
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

export default function About() {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-5 pointer-events-none"></div>
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3">
            <Compass className="w-5 h-5 text-purple-400" />
            <span className="text-white/80 text-sm">About Zesty</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            The Unrecommendation Engine
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Zesty is your AI-powered guide to breaking out of your cultural comfort zone. We challenge your taste across movies, music, food, books, and fashion—expanding your horizons through carefully curated discomfort.
          </p>
        </div>
      </section>

      {/* Mission & Features Section (Unified) */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mission Block */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Like a wise grandmother who makes you try bitter gourd for your health, Zesty believes true growth comes from stepping outside your comfort zone. Our mission is to help you discover new dimensions of taste, creativity, and human expression—one challenge at a time.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start space-x-4">
                <span className="bg-blue-500/20 p-3 rounded-xl flex-shrink-0"><Brain className="w-6 h-6 text-blue-400" /></span>
                <span className="text-white/60 text-base">Personalized, AI-driven taste analysis</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="bg-purple-500/20 p-3 rounded-xl flex-shrink-0"><Target className="w-6 h-6 text-purple-400" /></span>
                <span className="text-white/60 text-base">Discomfort-based recommendations</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="bg-pink-500/20 p-3 rounded-xl flex-shrink-0"><TrendingUp className="w-6 h-6 text-pink-400" /></span>
                <span className="text-white/60 text-base">Progress tracking and analytics</span>
              </li>
              <li className="flex items-start space-x-4">
                <span className="bg-orange-500/20 p-3 rounded-xl flex-shrink-0"><Globe className="w-6 h-6 text-orange-400" /></span>
                <span className="text-white/60 text-base">Global cultural domains</span>
              </li>
            </ul>
            <div className="flex flex-col items-start space-y-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8 text-blue-400" />
                <span className="text-white/80 text-lg">Expand your taste. Embrace discomfort.</span>
              </div>
              <div className="text-white/60 text-base">Become a true cultural explorer.</div>
            </div>
          </motion.div>

          {/* Features Block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-8 text-center lg:text-left">Key Features</h3>
            <div className="space-y-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="flex items-start space-x-6 hover:bg-white/10 rounded-2xl p-4 transition-all duration-300"
                  >
                    <div className={`bg-gradient-to-br ${feature.gradient} p-4 rounded-2xl w-16 h-16 flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-white/60 leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Domains Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Cultural Domains</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {culturalDomains.map((domain) => {
              const Icon = domain.icon;
              return (
                <div key={domain.name} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                  <div className="bg-white/10 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-8 h-8 ${domain.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{domain.name}</h3>
                  <p className="text-white/60 text-sm mb-2">{domain.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">15k+</div>
              <div className="text-white/60">Cultural Explorers</div>
              <div className="text-white/40 text-sm mt-1">Active monthly users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">89%</div>
              <div className="text-white/60">Taste Expansion</div>
              <div className="text-white/40 text-sm mt-1">Average growth rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-white/60">Countries & Cultures</div>
              <div className="text-white/40 text-sm mt-1">Represented in our database</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Challenge
            <span className="block bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
              Your Cultural Boundaries?
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Join thousands of cultural explorers discovering new dimensions of taste, creativity, and human expression.
          </p>
        </div>
      </section>
    </div>
  );
} 