import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Car, LayoutDashboard, LogOut, Users, Tags, CalendarCheck, Menu, X, Home, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setOpen(false);
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const pillClass = (path) =>
    `px-3.5 py-2 rounded-full text-[12px] font-black tracking-wide transition-all flex items-center gap-1.5 ${
      isActive(path)
      ? 'bg-[#0a1931] text-white shadow-md'
        : 'text-slate-600 hover:bg-white hover:text-[#0a1931]'
    }`;

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(10,25,49,0.08)] border-b border-slate-200/60 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[64px] flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="bg-[#0a1931] text-white p-2 rounded-xl shadow-lg">
              <Car size={16} />
            </div>
            <span className="font-black text-[20px] tracking-tight text-[#0a1931]">VehicleRental</span>
            {isAdmin && <span className="hidden md:inline bg-blue-50 text-[#0a1931] border border-blue-200 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest ml-1">ADMIN</span>}
          </Link>

          {/* DESKTOP */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/" className={pillClass('/')}>
              <Home size={14} /> Home
            </Link>

            {user? (
              <>
                {!isAdmin && (
                  <>
                    <Link to="/mybookings" className={pillClass('/mybookings')}>
                      <CalendarCheck size={14} /> My Bookings
                    </Link>
                    <Link to="/profile" className={pillClass('/profile')}>
                      <User size={14} /> My Profile
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-1 bg-[#f6f7f9] border border-slate-200 px-1.5 py-1 rounded-full ml-2">
                    <Link to="/admin/dashboard" className={pillClass('/admin/dashboard')}>
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link to="/admin/vehicles" className={pillClass('/admin/vehicles')}>
                      <Car size={14} /> Vehicles
                    </Link>
                    <Link to="/admin/bookings" className={pillClass('/admin/bookings')}>
                      <CalendarCheck size={14} /> Bookings
                    </Link>
                    <Link to="/admin/customers" className={pillClass('/admin/customers')}>
                      <Users size={14} /> Customers
                    </Link>
                    <Link to="/admin/categories" className={pillClass('/admin/categories')}>
                      <Tags size={14} /> Categories
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-2.5 ml-3 pl-3 border-l border-slate-200">
                  <div className="hidden xl:flex flex-col items-end leading-none">
                    <span className="text-[12px] font-black text-slate-900">Hi, {user.name.split(' ')[0]} {isAdmin && '👑'}</span>
                    <span className="text-[10px] text-slate-500">{user.email}</span>
                  </div>
                  <Link to="/profile" className="w-8 h-8 rounded-full bg-[#0a1931] text-white flex items-center justify-center font-black text-xs hover:bg-black transition">
                    {user.name.charAt(0).toUpperCase()}
                  </Link>
                  <button onClick={handleLogout} className="bg-[#0a1931] hover:bg-black text-white px-4 py-2 rounded-full font-black text-[11px] flex items-center gap-1.5 shadow-lg transition">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 rounded-full font-bold text-[13px] text-slate-700 hover:bg-slate-100">Login</Link>
                <Link to="/register" className="bg-[#0a1931] text-white px-5 py-2.5 rounded-full font-black text-[12px] shadow-lg hover:bg-black">Register</Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2.5 rounded-xl bg-[#f6f7f9] border border-slate-200 text-[#0a1931]">
            {open? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <Link onClick={() => setOpen(false)} to="/" className={`block py-3 px-5 rounded-full text-[13px] font-black ${isActive('/')? 'bg-[#0a1931] text-white' : 'bg-[#f6f7f9]'}`}>
              Home
            </Link>

            {user &&!isAdmin && (
              <>
                <Link onClick={() => setOpen(false)} to="/mybookings" className={`block py-3 px-5 rounded-full text-[13px] font-black ${isActive('/mybookings')? 'bg-[#0a1931] text-white' : 'bg-slate-50'}`}>
                  My Bookings
                </Link>
                <Link onClick={() => setOpen(false)} to="/profile" className={`block py-3 px-5 rounded-full text-[13px] font-black flex items-center gap-2 ${isActive('/profile')? 'bg-[#0a1931] text-white' : 'bg-slate-50'}`}>
                  <User size={14}/> My Profile
                </Link>
              </>
            )}

            {isAdmin && (
              <div className="bg-[#f6f7f9] p-3 rounded-[20px] border border-slate-200">
                <p className="text-[10px] font-black tracking-widest text-slate-500 mb-2 px-2">ADMIN PANEL</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link onClick={() => setOpen(false)} to="/admin/dashboard" className={`${isActive('/admin/dashboard')? 'bg-[#0a1931] text-white' : 'bg-white'} border border-slate-200 rounded-full p-3 text-[12px] font-black text-center`}>Dashboard</Link>
                  <Link onClick={() => setOpen(false)} to="/admin/vehicles" className={`${isActive('/admin/vehicles')? 'bg-[#0a1931] text-white' : 'bg-white'} border border-slate-200 rounded-full p-3 text-[12px] font-black text-center`}>Vehicles</Link>
                  <Link onClick={() => setOpen(false)} to="/admin/bookings" className={`${isActive('/admin/bookings')? 'bg-[#0a1931] text-white' : 'bg-white'} border border-slate-200 rounded-full p-3 text-[12px] font-black text-center`}>Bookings</Link>
                  <Link onClick={() => setOpen(false)} to="/admin/customers" className={`${isActive('/admin/customers')? 'bg-[#0a1931] text-white' : 'bg-white'} border border-slate-200 rounded-full p-3 text-[12px] font-black text-center`}>Customers</Link>
                  <Link onClick={() => setOpen(false)} to="/admin/categories" className={`${isActive('/admin/categories')? 'bg-[#0a1931] text-white' : 'bg-white'} border border-slate-200 rounded-full p-3 text-[12px] font-black text-center col-span-2`}>Categories</Link>
                </div>
              </div>
            )}

            {user? (
              <>
                <Link onClick={() => setOpen(false)} to="/profile" className={`block py-3 px-5 rounded-full text-[13px] font-black text-center border ${isActive('/profile')? 'bg-[#0a1931] text-white' : 'bg-white border-slate-200'}`}>
                  My Profile
                </Link>
                <button onClick={handleLogout} className="w-full bg-[#0a1931] text-white py-3.5 rounded-full font-black text-[13px]">Logout - {user.name} ({user.role})</button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link onClick={() => setOpen(false)} to="/login" className="flex-1 bg-white border border-slate-200 py-3 rounded-full text-center font-black text-[13px]">Login</Link>
                <Link onClick={() => setOpen(false)} to="/register" className="flex-1 bg-[#0a1931] text-white py-3 rounded-full text-center font-black text-[13px]">Register</Link>
              </div>
            )}
          </div>
        )}
      </nav>
      <div className="h-[64px]"></div>
    </>
  );
}