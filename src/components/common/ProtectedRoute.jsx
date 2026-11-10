import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F1F5] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="relative p-6 rounded-2xl bg-white shadow-2xl border border-[#D9DDE3] flex items-center justify-center transform transition-all duration-700 animate-bounce">
            <img
              src="/logo-rg.png"
              alt="Revati Global"
              className="h-12 w-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
