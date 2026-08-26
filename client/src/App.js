import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import VehicleDetails from './pages/VehicleDetails';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import BookingSummary from './pages/BookingSummary';
import BookingConfirmation from './pages/BookingConfirmation';

import AdminDashboard from './pages/AdminDashboard';
import ManageVehicles from './pages/admin/ManageVehicles';
import AddVehicle from './pages/admin/AddVehicle';
import EditVehicle from './pages/admin/EditVehicle';
import AdminCustomers from './pages/AdminCustomers';
import AdminCategories from './pages/AdminCategories';
import AdminBookings from './pages/admin/AdminBookings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* FIX: Toast ko sabse upar lao - navbar se bhi upar */}
        <Toaster
          position="top-right"
          containerStyle={{
            top: '75px',
            zIndex: 9999999,
            right: '15px'
          }}
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#0f172a',
              fontWeight: '700',
              fontSize: '13px',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              padding: '12px 16px',
              zIndex: 9999999,
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' }
            },
            error: {
              style: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }
            }
          }}
        />
        <Navbar />
        <main className="pt-16 min-h-screen bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe] relative">
          <div className="fixed top-20 left-0 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-[120px] -translate-x-1/2 pointer-events-none"></div>
          <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-indigo-400/15 rounded-full blur-[120px] translate-x-1/3 pointer-events-none"></div>

          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/vehicles/:id" element={<VehicleDetails />} />

              {/* Booking Flow - Correct Order */}
              <Route path="/booking-summary" element={<PrivateRoute><BookingSummary /></PrivateRoute>} />
              <Route path="/booking-confirmation/:id" element={<PrivateRoute><BookingConfirmation /></PrivateRoute>} />
              <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
              <Route path="/mybookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
              <Route path="/booking/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
              <Route path="/bookings/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />

              {/* Admin */}
              <Route path="/admin" element={<PrivateRoute admin><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/dashboard" element={<PrivateRoute admin><AdminDashboard /></PrivateRoute>} />
              <Route path="/admin/vehicles/new" element={<PrivateRoute admin><AddVehicle /></PrivateRoute>} />
              <Route path="/admin/vehicles" element={<PrivateRoute admin><ManageVehicles /></PrivateRoute>} />
              <Route path="/admin/editvehicle/:id" element={<PrivateRoute admin><EditVehicle /></PrivateRoute>} />
              <Route path="/admin/vehicles/edit/:id" element={<PrivateRoute admin><EditVehicle /></PrivateRoute>} />
              <Route path="/admin/vehicles/:id/edit" element={<PrivateRoute admin><EditVehicle /></PrivateRoute>} />
              <Route path="/admin/customers" element={<PrivateRoute admin><AdminCustomers /></PrivateRoute>} />
              <Route path="/admin/categories" element={<PrivateRoute admin><AdminCategories /></PrivateRoute>} />
              <Route path="/admin/bookings" element={<PrivateRoute admin><AdminBookings /></PrivateRoute>} />

              <Route path="*" element={<h1 className="text-center p-8 text-2xl font-bold">404 Page Not Found</h1>} />
            </Routes>
          </div>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;