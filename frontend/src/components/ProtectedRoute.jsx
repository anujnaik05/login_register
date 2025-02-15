import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/user-dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 