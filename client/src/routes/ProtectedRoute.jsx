import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const role = user?.role?.toLowerCase();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on role if trying to access unauthorized route
    if (role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    if (role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    if (role === 'agent_manager') return <Navigate to="/manager/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};
