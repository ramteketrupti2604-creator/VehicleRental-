import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PrivateRoute = ({ children, admin = false }) => {
  const { user, loading } = useAuth();

  // 1. Agar abhi user load ho raha hai to loading dikhao
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // 2. Agar user login hi nahi hai to login page pe bhej do
  if (!user) {
    toast.error("Please login first");
    return <Navigate to="/login" replace />;
  }

  // 3. Agar admin route hai aur user admin nahi hai to home pe bhej do
  if (admin && user.role !== 'admin') {
    toast.error("You don't have admin access");
    return <Navigate to="/" replace />;
  }

  // 4. Sab thik hai to page dikha do
  return children;
};

export default PrivateRoute;