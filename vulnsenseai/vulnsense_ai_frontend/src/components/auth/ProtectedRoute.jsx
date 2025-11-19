
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './Authcontext';

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user, loadingUser } = useUser();

  if (loadingUser) {
   
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user) {
   
    if (!allowedRoles.includes(user.role)) {
     
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
