import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { UserRole } from '../types/index.js';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, user, isInitializing } = useAuthStore();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Securing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // When mustChangePassword is true, allow ONLY /change-password
  if (user?.mustChangePassword) {
    if (location.pathname !== '/change-password') {
      return <Navigate to="/change-password" replace />;
    }
    return <Outlet />;
  }


  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'mentor') return <Navigate to="/mentor" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
