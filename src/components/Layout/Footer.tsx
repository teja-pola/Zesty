import React from 'react';
import { Compass, Heart, Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black/5 backdrop-blur-xl border-t border-white/10 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Zesty</span>
            </div>
            <p className="text-white/60 text-sm">
              The Unrecommendation Engine. Expand your cultural horizons through carefully curated discomfort.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Product</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                Features
              </a>
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                How it Works
              </a>
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                Pricing
              </a>
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                API
              </a>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Company</h3>
            <div className="space-y-2">
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                About
              </a>
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                Blog
              </a>
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                Careers
              </a>
              <a href="#" className="block text-white/60 hover:text-white transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Connect</h3>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Twitter className="w-5 h-5 text-white/60 hover:text-white" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Github className="w-5 h-5 text-white/60 hover:text-white" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <Mail className="w-5 h-5 text-white/60 hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-white/60 text-sm">
            © 2025 Zesty. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-white/60 text-sm">Made with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-white/60 text-sm">for cultural explorers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}