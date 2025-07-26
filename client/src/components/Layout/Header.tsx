import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, LogOut, Menu, X, Zap, Target, Users, BarChart3 } from 'lucide-react';
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
      setIsMenuOpen(false);
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
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
                  to="/explore" 
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/explore') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Explore</span>
                </Link>
                <Link 
                  to="/challenges" 
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/challenges') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Challenges</span>
                </Link>
                <Link 
                  to="/connect" 
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/connect') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Connect</span>
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-purple-400 ${
                    isActive('/dashboard') ? 'text-purple-400' : 'text-white/80'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
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
                <Link to="/features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  Features
                </Link>
                <Link to="/about" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                  About
                </Link>
                <Link to="/auth" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors">
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
                    to="/explore" 
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors py-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Explore</span>
                  </Link>
                  <Link 
                    to="/challenges" 
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors py-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Target className="w-4 h-4" />
                    <span>Challenges</span>
                  </Link>
                  <Link 
                    to="/connect" 
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors py-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Connect</span>
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors py-2" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors py-2 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/features" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Features
                  </Link>
                  <Link to="/about" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    About
                  </Link>
                  <Link to="/auth" className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
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