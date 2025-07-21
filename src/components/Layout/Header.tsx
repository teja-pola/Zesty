import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, User, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false); // Close mobile menu
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Zesty</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/dashboard') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/curriculum" 
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/curriculum') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  Curriculum
                </Link>
                <Link 
                  to="/challenges" 
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/challenges') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  Challenges
                </Link>
                <Link 
                  to="/progress" 
                  className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/progress') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  Progress
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/features" 
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link 
                  to="/about" 
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link 
                  to="/auth" 
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10">
            <nav className="flex flex-col space-y-3">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/curriculum" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Curriculum
                  </Link>
                  <Link 
                    to="/challenges" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Challenges
                  </Link>
                  <Link 
                    to="/progress" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Progress
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 transition-colors py-2 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/features" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link 
                    to="/about" 
                    className="text-white/80 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    to="/auth" 
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}