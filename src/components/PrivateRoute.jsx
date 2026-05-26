import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (
    currentUser?.role === 'patient' &&
    !currentUser?.onboardingComplete &&
    location.pathname !== '/patient/onboarding'
  ) {
    return <Navigate to="/patient/onboarding" replace />;
  }

  return <Outlet />;
}
