import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PrivateRoute = ({ children, admin = false }) => {
  const { user, loading } = useAuth();

  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  
  if (!user) {
    toast.error("Please login first");
    return <Navigate to="/login" replace />;
  }

  
  if (admin && user.role !== 'admin') {
    toast.error("You don't have admin access");
    return <Navigate to="/" replace />;
  }

  
  return children;
};

export default PrivateRoute;