import { useEffect, useState } from 'react';
import API from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Sahi endpoint
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (err) {
        setError('Not authorized, token failed: jwt malformed - ' + (err.response?.data?.message || ''));
      }
    };
    fetchStats();
  }, []);

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!stats) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 shadow rounded">Total Vehicles: {stats.totalVehicles || 0}</div>
        <div className="bg-white p-6 shadow rounded">Total Bookings: {stats.totalBookings || 0}</div>
        <div className="bg-white p-6 shadow rounded">Total Users: {stats.totalUsers || 0}</div>
      </div>
    </div>
  );
};
export default AdminDashboard;