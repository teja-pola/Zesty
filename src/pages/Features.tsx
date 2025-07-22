import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { TrendingUp, Map, Target, BarChart3, CheckCircle, Star, Compass, Eye, Zap, Activity, UserCheck, Sparkles, ArrowRight } from 'lucide-react';

// --- DATA CONFIGURATION (with original color gradients) ---
const features = [
  {
    icon: UserCheck,
    title: 'Personalized Onboarding',
    description: 'Start your journey with a beautiful, animated flow that builds your unique taste profile across our five core cultural domains.',
    details: [
      'Step-by-step animated onboarding',
      'Select preferences in each domain',
      'Interactive UI with progress bar',
      'Profile tailored to your tastes',
    ],
    gradient: 'from-blue-400 to-purple-500',
    shadow: 'shadow-purple-500/20',
    glow: 'hover:border-purple-400',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Taste Analysis',
    description: 'Our system analyzes your profile to find the edges of your comfort zone, generating personalized recommendations.',
    details: [
      'Gemini AI for explanations',
      'Qloo for cross-domain suggestions',
      'Smart challenge generation',
      'Conversational, inspiring feedback',
    ],
    gradient: 'from-purple-500 to-pink-500',
    shadow: 'shadow-pink-500/20',
    glow: 'hover:border-pink-400',
  },
  {
    icon: TrendingUp,
    title: 'Dashboard',
    description: 'Your central hub to track metrics, view active challenges, and see your cultural exposure grow over time.',
    details: [
      'Exposure Score & Weekly Growth',
      'Completed Challenges Overview',
      'Active Domains & Recommendations',
      'Quick Actions for New Challenges',
    ],
    gradient: 'from-sky-400 to-cyan-400',
    shadow: 'shadow-cyan-500/20',
    glow: 'hover:border-cyan-400',
  },
  {
    icon: Map,
    title: 'Curriculum',
    description: 'Follow structured learning paths for each domain, with tailored steps that guide you to new experiences.',
    details: [
      'Personalized, domain-specific paths',
      'Progressive steps with increasing difficulty',
      'Track completion and revisit steps',
      'AI-generated learning plans',
    ],
    gradient: 'from-green-400 to-emerald-500',
    shadow: 'shadow-emerald-500/20',
    glow: 'hover:border-emerald-400',
  },
  {
    icon: Target,
    title: 'Challenges',
    description: 'Push your boundaries with curated cultural tasks generated based on your unique taste profile and preferences.',
    details: [
      'Domain-based challenge creation',
      'Difficulty levels from Gentle to Extreme',
      'Completion tracking & proof upload',
      'Earn awards for your progress',
    ],
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-orange-500/20',
    glow: 'hover:border-orange-400',
  },
  {
    icon: BarChart3,
    title: 'Progress & Analytics',
    description: 'Visualize your journey with detailed analytics, domain mastery charts, and beautiful completion stats.',
    details: [
      'Exposure score analytics charts',
      'Domain progress breakdown',
      'Growth trends and completion rates',
      'Motivational stats and awards',
    ],
    gradient: 'from-rose-500 to-red-500',
    shadow: 'shadow-red-500/20',
    glow: 'hover:border-red-400',
  },
];

const processSteps = [
  { icon: Compass, title: '1. Onboard', text: 'Map your initial taste profile.' },
  { icon: Eye, title: '2. Analyze', text: 'Our AI finds the edges of your comfort zone.' },
  { icon: Zap, title: '3. Challenge', text: 'Receive personalized, boundary-pushing tasks.' },
  { icon: Activity, title: '4. Grow', text: 'Track your progress and expand your horizons.' },
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


// --- COMPONENT ---
export default function Features() {
  return (
    <div className="relative overflow-hidden bg-gray-900 text-white">
      {/* Animated Aurora Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-transparent">
        <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(192,132,252,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(34,211,238,0.15),rgba(255,255,255,0))]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 pt-24 pb-16 z-10 text-center">
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
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">Core Features</span>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400"
          >
            Explore Your Universe
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto"
          >
            A systematic approach to cultural growth. Discover how our features work together to expand your world.
          </motion.p>
        </motion.div>
      </section>

      {/* Process Flow Section */}
      <section className="py-24 px-4 relative z-10">
        <motion.div 
          className="max-w-5xl mx-auto relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {processSteps.map((step) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="text-center p-6 bg-gray-800/40 backdrop-blur-md border border-white/10 rounded-2xl"
              >
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1 text-white">{step.title}</h3>
                <p className="text-white/60 text-sm">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
              className={`
                group relative flex flex-col p-8 rounded-3xl border border-white/10 
                bg-gray-800/40 backdrop-blur-xl shadow-xl ${feature.shadow}
                transition-colors duration-300
              `}
            >
              {/* Glowing Border on Hover */}
              <div className={`absolute -inset-px rounded-3xl border-2 border-transparent ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex-shrink-0 mb-6 flex items-center gap-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{feature.title}</h2>
                </div>
                <p className="text-white/60 leading-relaxed mb-6 flex-grow">{feature.description}</p>
                <ul className="space-y-3 text-left border-t border-white/10 pt-5">
                  {feature.details.map((detail, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 + 0.5 }}
                      viewport={{ once: true }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
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
            Ready to Challenge Your Taste?
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Join thousands of cultural explorers discovering new dimensions of creativity and human expression.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/20"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
