import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If onboarding is not complete, redirect to /onboarding (unless already there or on /settings)
  if (
    profile &&
    !profile.onboarding_complete &&
    location.pathname !== '/onboarding' &&
    location.pathname !== '/settings'
  ) {
    return <Navigate to="/onboarding" replace />;
  }
  // If onboarding is complete and user tries to access onboarding, redirect to /explore
  if (profile && profile.onboarding_complete && location.pathname === '/onboarding') {
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
}