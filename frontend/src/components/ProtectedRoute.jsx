import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Log for debugging
  console.log('Protected Route Check:', { token, user, requireAdmin });

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 