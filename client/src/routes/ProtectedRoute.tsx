import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If student needs onboarding
  if (role === 'student' && user?.isFirstLogin && !window.location.pathname.includes('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their appropriate home
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'mentor') return <Navigate to="/mentor" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
