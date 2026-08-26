import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/bookings`, config);
      const list = Array.isArray(res.data)? res.data : res.data.bookings || res.data.data || [];
      setBookings(list);
    } catch (err) {
      toast.error('Backend not running on 5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    if (!window.confirm(`${status} this booking?`)) return;
    try {
      await axios.put(`${API}/bookings/${id}/status`, { status }, config);
      toast.success(`Booking ${status}`);
      setBookings(p => p.map(b => b._id === id? {...b, status } : b));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed - backend route check karo');
    }
  };

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const okStatus = filter === 'ALL' || b.status === filter;
      const q = search.toLowerCase();
      const okSearch = (b.bookingNumber + ' ' + (b.user?.name||'') + ' ' + (b.vehicle?.name||'') + ' ' + (b.user?.email||'')).toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [bookings, filter, search]);

  const counts = {
    ALL: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const totalRevenue = bookings.filter(b=>b.status!=='CANCELLED').reduce((s,b)=> s + Number(b.totalAmount||0),0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:'linear-gradient(135deg,#1e3a8a,#2563eb,#1d4ed8)'}}>
      <div className="bg-white px-5 py-2.5 rounded-full font-black text-[12px] animate-pulse shadow-xl">Loading Bookings...</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full -mt-6 -mx-4 sm:mx-0 sm:-mt-4 p-3 sm:p-5"
      style={{
        backgroundColor: '#1e40af',
        backgroundImage: `radial-gradient(600px 300px at 0% 0%, #60a5fa 0%, transparent 60%), radial-gradient(700px 350px at 100% 0%, #22d3ee 0%, transparent 60%), linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)`,
        backgroundAttachment: 'fixed'
      }}>
      <div className="max-w-7xl mx-auto space-y-3">

        {/* Header - Blue Attractive + Compact Search */}
        <div className="rounded-[20px] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-4 md:p-5 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,.4)] border border-white/20">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/15 rounded-full blur-[80px] -ml-24 -mb-24"></div>
          <div className="relative flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h1 className="text-[22px] md:text-[28px] font-black tracking-tight leading-none">All Bookings</h1>
              <p className="text-blue-200 mt-1.5 text-[11px] md:text-[12px] font-bold">Track {counts.ALL} bookings • ₹{totalRevenue.toLocaleString('en-IN')} total revenue</p>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                <span className="bg-white/10 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-black border border-white/10">{counts.PENDING} Pending</span>
                <span className="bg-emerald-400/20 text-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-black border border-emerald-400/20">{counts.CONFIRMED} Confirmed ✓</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-black border border-white/10">{counts.COMPLETED} Completed</span>
              </div>
            </div>
            {/* Search Bar - Height Kam - 40px */}
            <div className="flex items-center bg-white rounded-xl px-3 h-[40px] w-full md:w-[300px] shadow-[0_8px_20px_rgba(0,0,0,.2)] border-2 border-white self-start md:self-center">
              <span className="text-[13px]">🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search VR-2026, customer, Thar..." className="ml-2 bg-transparent outline-none w-full text-slate-800 text-[12px] font-bold placeholder:text-slate-400 placeholder:font-medium" />
              {search && <button onClick={()=>setSearch('')} className="text-slate-400 font-black text-[12px]">✕</button>}
            </div>
          </div>
        </div>

        {/* Filter Pills - Compact */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            {k:'ALL', label:'All', c: counts.ALL},
            {k:'PENDING', label:'Pending', c: counts.PENDING, dot:'bg-amber-500'},
            {k:'CONFIRMED', label:'Confirmed', c: counts.CONFIRMED, dot:'bg-emerald-500'},
            {k:'COMPLETED', label:'Completed', c: counts.COMPLETED, dot:'bg-blue-500'},
            {k:'CANCELLED', label:'Cancelled', c: counts.CANCELLED, dot:'bg-red-500'},
          ].map(f=>(
            <button key={f.k} onClick={()=>setFilter(f.k)} className={`flex items-center gap-1.5 px-4 h-[38px] rounded-xl text-[11px] font-black tracking-wide border-2 whitespace-nowrap transition ${filter===f.k? 'bg-white text-blue-700 border-white shadow-[0_8px_20px_rgba(0,0,0,.2)] scale-105' : 'bg-white/15 backdrop-blur text-white border-white/20 hover:bg-white hover:text-blue-700'}`}>
              {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`}></span>}
              {f.label} <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filter===f.k? 'bg-blue-100 text-blue-700' : 'bg-white/20'}`}>{f.c}</span>
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,.25)] border-2 border-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['BOOKING NO','CUSTOMER','VEHICLE','DATES & DAYS','AMOUNT','STATUS','ACTIONS'].map(h=>(
                    <th key={h} className="p-3.5 text-left text-[10px] font-black tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b=>(
                  <tr key={b._id} className="border-b border-slate-50 hover:bg-blue-50/50 transition">
                    <td className="p-3.5">
                      <div className="font-mono text-[11px] font-black text-white bg-slate-900 px-2.5 py-1 rounded-full inline-block">{b.bookingNumber || b._id.slice(-8).toUpperCase()}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{new Date(b.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-[11px]">{(b.user?.name||'U')[0]}</div>
                        <div>
                          <div className="font-black text-slate-900 text-[12px]">{b.user?.name || 'Guest User'}</div>
                          <div className="text-[11px] text-slate-500">{b.user?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5"><div className="font-black text-[12px] text-slate-900">{b.vehicle?.name || 'Vehicle'}</div><div className="text-[10px] text-slate-500">{b.vehicle?.brand}</div></td>
                    <td className="p-3.5"><div className="text-[11px] font-bold text-slate-800">{b.pickupDate? new Date(b.pickupDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : '--'} → {b.returnDate? new Date(b.returnDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : '--'}</div><div className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-1 font-black border border-blue-100">{b.rentalDays || 1} days</div></td>
                    <td className="p-3.5"><div className="text-[13px] font-black text-slate-900">₹{Number(b.totalAmount||0).toLocaleString('en-IN')}</div><div className="text-[10px] text-slate-400">₹{Number(b.pricePerDay||0)}/day</div></td>
                    <td className="p-3.5"><span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${b.status==='PENDING'?'bg-amber-50 text-amber-700 border-amber-200': b.status==='CONFIRMED'?'bg-emerald-50 text-emerald-700 border-emerald-200': b.status==='COMPLETED'?'bg-blue-50 text-blue-700 border-blue-200':'bg-red-50 text-red-700 border-red-200'}`}>{b.status}</span></td>
                    <td className="p-3.5">
                      <div className="flex gap-1 justify-end">
                        {b.status==='PENDING' && <><button onClick={()=>updateStatus(b._id,'CONFIRMED')} className="h-7 px-3 rounded-full bg-slate-900 text-white text-[10px] font-black hover:bg-black">Confirm</button><button onClick={()=>updateStatus(b._id,'CANCELLED')} className="h-7 w-7 rounded-full bg-slate-100 hover:bg-red-100">✕</button></>}
                        {b.status==='CONFIRMED' && <><button onClick={()=>updateStatus(b._id,'COMPLETED')} className="h-7 px-3 rounded-full bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700">Complete</button><button onClick={()=>updateStatus(b._id,'CANCELLED')} className="h-7 w-7 rounded-full bg-slate-100 hover:bg-red-100">✕</button></>}
                        {(b.status==='COMPLETED'||b.status==='CANCELLED') && <span className="text-[10px] text-slate-400 font-bold">No action</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length===0 && <div className="p-12 text-center"><div className="text-4xl mb-2">🔍</div><p className="font-black text-slate-600 text-[13px]">No bookings in {filter}</p></div>}
        </div>

        {/* Mobile Cards - Eye-catching */}
        <div className="lg:hidden grid gap-3">
          {filtered.map(b=>(
            <div key={b._id} className="bg-white rounded-[18px] border-2 border-white shadow-[0_12px_30px_rgba(0,0,0,.2)] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
              <div className="flex justify-between items-center">
                <div className="font-mono text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-full">{b.bookingNumber || b._id.slice(-6)}</div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black border ${b.status==='CONFIRMED'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700'}`}>{b.status}</span>
              </div>
              <div className="mt-3 flex gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-[13px] shadow">{(b.vehicle?.name||'V')[0]}</div>
                <div className="flex-1">
                  <div className="font-black text-[13px] text-slate-900">{b.vehicle?.name || 'Vehicle'}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{b.user?.name} • {b.rentalDays||1} days</div>
                </div>
                <div className="text-right"><div className="font-black text-[14px]">₹{Number(b.totalAmount||0).toLocaleString()}</div><div className="text-[10px] text-slate-400">₹{b.pricePerDay}/d</div></div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {b.status==='PENDING' && <><button onClick={()=>updateStatus(b._id,'CONFIRMED')} className="py-2.5 rounded-xl bg-slate-900 text-white font-black text-[11px]">✓ Confirm</button><button onClick={()=>updateStatus(b._id,'CANCELLED')} className="py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 font-black text-[11px]">Cancel</button></>}
                {b.status==='CONFIRMED' && <><button onClick={()=>updateStatus(b._id,'COMPLETED')} className="py-2.5 rounded-xl bg-blue-600 text-white font-black text-[11px]">Complete</button><button onClick={()=>updateStatus(b._id,'CANCELLED')} className="py-2.5 rounded-xl bg-white border-2 border-slate-200 font-black text-[11px]">Cancel</button></>}
                {(b.status==='COMPLETED'||b.status==='CANCELLED') && <div className="col-span-2 text-center py-2 text-[11px] font-bold text-slate-400 bg-slate-50 rounded-xl">{b.status} - No action</div>}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}