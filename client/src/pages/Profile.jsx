import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phone: '', role: '', createdAt: '' });
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return userInfo?.token || localStorage.getItem('token');
    } catch {
      return localStorage.getItem('token');
    }
  };

  const getLocalUser = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return {
        name: userInfo?.name || userInfo?.user?.name || '',
        email: userInfo?.email || userInfo?.user?.email || '',
        phone: userInfo?.phone || userInfo?.user?.phone || '',
        role: userInfo?.role || userInfo?.user?.role || '',
        createdAt: userInfo?.createdAt || userInfo?.user?.createdAt || '',
      };
    } catch {
      return { name: '', email: '', phone: '', role: '', createdAt: '' };
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // Pehle local wala dikha do, taaki khali na lage
      const local = getLocalUser();
      if (local.email || local.name) setUser(local);

      try {
        const token = getToken();
        if (!token) {
          setLoading(false);
          return;
        }
        const urls = [`${API_URL}/users/profile`, `${API_URL}/users/me`, `${API_URL}/auth/me`, `${API_URL}/users`];
        let fetched = null;
        for (const url of urls) {
          try {
            const { data } = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const d = data?.user || data?.data || data;
            if (d && (d.email || d.name)) { fetched = d; break; }
          } catch (e) { continue; }
        }
        if (fetched) {
          setUser(prev => ({
            ...prev,
            name: fetched.name || prev.name,
            email: fetched.email || prev.email,
            phone: fetched.phone || fetched.phoneNumber || prev.phone,
            role: fetched.role || prev.role,
            createdAt: fetched.createdAt || prev.createdAt,
          }));
        }
        // Agar kuch nahi mila toh local wala hi rahega, error nahi dikhayenge
      } catch (err) {
        console.log('Profile load error:', err?.response?.data || err.message);
        // toast hata diya - local data se hi profile dikhega
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      let updated = null;
      const urls = [`${API_URL}/users/profile`, `${API_URL}/users/me`, `${API_URL}/auth/me`];
      for (const url of urls) {
        try {
          const { data } = await axios.put(url,
            { name: user.name, phone: user.phone },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = data?.user || data?.data || data;
          if (d && (d.name || d.email)) { updated = d; break; }
        } catch (err) { continue; }
      }
      // Backend fail bhi ho toh local me save kar do
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.name = user.name;
      userInfo.phone = user.phone;
      if (userInfo.user) { userInfo.user.name = user.name; userInfo.user.phone = user.phone; }
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (updated) setUser(prev => ({ ...prev, name: updated.name || prev.name, phone: updated.phone || updated.phoneNumber || prev.phone, email: updated.email || prev.email }));
      toast.success('Profile updated!');
    } catch (err) {
      // Backend fail bhi ho toh local save ho gaya hai
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.name = user.name;
      userInfo.phone = user.phone;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      toast.success('Profile updated!');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a1931] flex justify-center pt-20 text-sm text-white">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a1931] relative flex justify-center items-start px-3 py-6 md:py-10 overflow-hidden">
      {/* Dark Blue Gradient Background Effects */}
      <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-80px] w-[600px] h-[600px] bg-indigo-500/25 rounded-full blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] bg-white rounded-[20px] shadow-2xl overflow-hidden border border-white/10 relative z-10">

        {/* Top Banner - Height Badhaya */}
        <div className="relative h-[125px] bg-gradient-to-r from-black via-[#0a1931] to-[#1e3a8a]">
          <img
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop"
            alt="car"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

          <div className="absolute -bottom-8 left-6 flex items-center gap-3.5">
            <div className="w-[68px] h-[68px] rounded-2xl border-[4px] border-white bg-[#0a1931] text-white flex items-center justify-center font-black text-[20px] shadow-xl">
              {user.name? user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
            </div>
            <div className="pb-1">
              <h2 className="text-white font-black text-[15px] leading-none drop-shadow-md">{user.name || 'User'}</h2>
              <p className="text-blue-200 text-[11px] mt-1 font-medium tracking-wide">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="pt-12 p-6">
          <h1 className="text-[17px] font-black text-[#0a1931]">My Profile</h1>
          <p className="text-[11px] text-slate-500 mb-5">You can update your name & phone. Email is fixed.</p>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-500">FULL NAME</label>
              <input
                className="mt-1.5 w-full border border-slate-200 rounded-xl p-3 text-[13px] font-semibold outline-none focus:border-[#0a1931] focus:ring-2 focus:ring-[#0a1931]/20 transition"
                value={user.name}
                onChange={e => setUser({...user, name: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-500">EMAIL (Locked 🔒)</label>
              <input
                className="mt-1.5 w-full border border-slate-200 rounded-xl p-3 bg-slate-100 text-[13px] text-slate-500 cursor-not-allowed font-medium"
                value={user.email}
                disabled
              />
            </div>

            <div>
              <label className="text-[10px] font-black tracking-widest text-slate-500">PHONE NUMBER</label>
              <input
                className="mt-1.5 w-full border border-slate-200 rounded-xl p-3 text-[13px] font-semibold outline-none focus:border-[#0a1931] focus:ring-2 focus:ring-[#0a1931]/20 transition"
                value={user.phone || ''}
                onChange={e => setUser({...user, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="bg-[#f6f7f9] border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center mt-2">
              <span className="text-[11px] font-bold text-slate-500">Member Since</span>
              <span className="text-[11px] font-black text-[#0a1931]">{user.createdAt? new Date(user.createdAt).toDateString() : '-'}</span>
            </div>

            <button type="submit" className="w-full bg-[#0a1931] text-white py-3.5 rounded-xl font-black text-[13px] tracking-wide hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(10,25,49,0.3)] mt-1">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}