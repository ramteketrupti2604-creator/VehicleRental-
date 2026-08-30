import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState({ name: '', email: '', phone: '', role: '', createdAt: '' });
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo?.token || localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        const { data } = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Profile load failed');
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
      const { data } = await axios.put('http://localhost:5000/api/users/profile',
        { name: user.name, phone: user.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.name = data.name;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
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
              <h2 className="text-white font-black text-[15px] leading-none drop-shadow-md">{user.name}</h2>
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