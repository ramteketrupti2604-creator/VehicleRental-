import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/users`, config);
      const list = Array.isArray(res.data)? res.data : res.data.users || res.data.data || [];
      const cleanList = list.filter(u =>!u.email?.includes('cpom'));
      setCustomers(cleanList);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = useMemo(() => {
    return customers.filter(c =>
      (c.name + c.email + (c.phone || '')).toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const totalRevenue = customers.reduce((s, c) => s + Number(c.totalSpent || 0), 0);
  const totalBookings = customers.reduce((s, c) => s + Number(c.totalBookings || c.bookingsCount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1931] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 font-bold text-sm">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1931] p-3 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* BLUE BACKGROUND HEADER */}
        <div className="rounded-[24px] bg-[#0b4db3] text-white p-5 md:p-7 shadow-2xl border border-blue-400/20">
          {/* Title + Search in one row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-[28px] md:text-4xl font-black tracking-tight leading-none">Customers</h1>
              <p className="text-blue-200 text-[11px] md:text-sm mt-2">
               
              </p>
            </div>

            <div className="w-full md:w-[340px] shrink-0">
              <div className="bg-white rounded-full px-4 py-3 flex items-center shadow-lg">
                <span className="text-slate-400">🔍</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="ml-3 outline-none w-full text-[13px] text-slate-800 bg-transparent placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mt-6">
            <div className="bg-[#123a7a]/60 border border-white/10 rounded-2xl px-5 py-3 min-w-[90px]">
              <div className="text-xl font-black leading-none">{customers.length}</div>
              <div className="text-[10px] text-blue-200 tracking-widest mt-1">USERS</div>
            </div>
            <div className="bg-[#123a7a]/60 border border-white/10 rounded-2xl px-5 py-3 min-w-[90px]">
              <div className="text-xl font-black leading-none">{totalBookings}</div>
              <div className="text-[10px] text-blue-200 tracking-widest mt-1">BOOKINGS</div>
            </div>
            <div className="bg-white text-[#0a1931] rounded-2xl px-5 py-3 shadow-lg min-w-[115px]">
              <div className="text-[17px] font-black leading-none">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="text-[10px] font-bold tracking-widest opacity-60 mt-1">REVENUE</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="hidden md:block bg-white rounded-[20px] mt-6 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-[11px] font-black tracking-widest text-slate-500 text-left">
                <th className="p-4 pl-6">CUSTOMER</th>
                <th className="p-4">CONTACT</th>
                <th className="p-4">BOOKINGS</th>
                <th className="p-4">TOTAL SPENT</th>
                <th className="p-4">JOINED</th>
                <th className="p-4 pr-6">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id} className="border-b last:border-0 hover:bg-blue-50/50">
                  <td className="p-4 pl-6 flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0b4db3] text-white flex items-center justify-center font-black text-[13px]">{c.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="font-bold text-[13px]">{c.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {c._id.toString().slice(-6).toUpperCase()}</div>
                    </div>
                  </td>
                  <td className="p-4 text-[13px]">{c.email}<div className="text-[11px] text-slate-500">{c.phone}</div></td>
                  <td className="p-4"><span className="bg-[#0a1931] text-white px-3 py-1.5 rounded-full text-[11px] font-black">{c.totalBookings?? 0} rides</span></td>
                  <td className="p-4 font-black text-[13px]">₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}</td>
                  <td className="p-4 text-[11px]">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="p-4 pr-6"><span className="bg-emerald-50 text-emerald-700 border px-3 py-1 rounded-full text-[10px] font-black">ACTIVE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden grid gap-3 mt-4">
          {filtered.map(c => (
            <div key={c._id} className="bg-white rounded-[18px] p-4 shadow-lg">
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#0b4db3] text-white flex items-center justify-center font-black">{c.name?.[0]?.toUpperCase()}</div>
                  <div><div className="font-black text-[13px]">{c.name}</div><div className="text-[11px] text-slate-500">{c.email}</div></div>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border px-2.5 py-1 rounded-full text-[9px] font-black">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}