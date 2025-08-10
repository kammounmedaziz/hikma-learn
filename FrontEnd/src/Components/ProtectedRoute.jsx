import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
      navigate('/unauthorized');
    }
  }, [user, navigate, allowedRoles]);

  if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type))) {
    return null; // or a loading spinner
  }

  return children;
};

export default ProtectedRoute;