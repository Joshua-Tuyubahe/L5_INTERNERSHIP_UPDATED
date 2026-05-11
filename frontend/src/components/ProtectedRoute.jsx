import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      if (userRole !== 'admin') {
        return <Navigate to="/user-dashboard" replace />;
      }
    } catch (error) {
      console.error('Token parsing error:', error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
