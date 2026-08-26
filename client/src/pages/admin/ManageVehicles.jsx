import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVehicles, deleteVehicle } from '../../services/vehicleService';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ManageVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles({ admin: 'true', limit: 100 });
      setVehicles(data.vehicles || data || []);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      if(token){
        await axios.delete(`http://localhost:5000/api/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await deleteVehicle(id);
      }
      toast.success(`${name} deleted`);
      setVehicles(prev => prev.filter(v => v._id!== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed - Login again');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/vehicles/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Status -> ${newStatus}`);
      setVehicles(prev => prev.map(v => v._id === id? {...v, status: newStatus} : v));
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const filtered = vehicles.filter(v => {
    const s = search.toLowerCase();
    const match = (v.name + ' ' + v.brand + ' ' + (v.model||'')).toLowerCase().includes(s);
    if (statusFilter === 'ALL') return match;
    if (statusFilter === 'RENTED') return match && (v.status === 'UNAVAILABLE' || v.status === 'BOOKED' || v.status === 'RENTED');
    return match && v.status === statusFilter;
  });

  const availableCount = vehicles.filter(v=>v.status==='AVAILABLE').length;
  const rentedCount = vehicles.filter(v=>v.status==='UNAVAILABLE' || v.status==='BOOKED' || v.status==='RENTED').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background:'linear-gradient(135deg,#1e3a8a,#2563eb)'}}>
        <div className="text-white font-black text-xl animate-pulse">Loading Vehicles...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: '#1e40af',
        backgroundImage: `radial-gradient(800px 400px at 0% 0%, #60a5fa 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #22d3ee 0%, transparent 60%), radial-gradient(700px 400px at 50% 100%, #3b82f6 0%, transparent 70%), linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Manage Vehicles</h1>
              <p className="text-white/90 mt-2 text-sm font-medium bg-white/15 backdrop-blur-md inline-flex px-4 py-2 rounded-full border border-white/30">
                <span className="font-black text-white">{vehicles.length} total</span>
                <span className="mx-2">•</span>
                <span className="text-emerald-200 font-black">{availableCount} available</span>
                <span className="mx-2">•</span>
                <span className="text-red-200 font-black">{rentedCount} rented</span>
              </p>
            </div>
            <Link to="/admin/vehicles/new" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-7 py-4 rounded-2xl font-black text-sm shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-yellow-300 hover:text-slate-900 hover:scale-105 transition-all duration-300">
              + Add Vehicle
            </Link>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.35)] p-5 mb-8 border-4 border-white">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex items-center gap-3 bg-blue-50 border-2 border-blue-100 rounded-2xl px-5 py-3.5 flex-1 focus-within:border-blue-600 focus-within:bg-white transition-all">
                <span className="text-xl">🔍</span>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Thar, Tata, Maruti, Venue..." className="bg-transparent outline-none w-full text-sm font-bold text-slate-900 placeholder:text-slate-400" />
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {['ALL','AVAILABLE','RENTED','MAINTENANCE'].map(f=>(
                  <button key={f} onClick={()=>setStatusFilter(f)} className={`px-6 py-3.5 rounded-2xl text-xs font-black tracking-widest border-2 transition-all whitespace-nowrap ${statusFilter===f? 'bg-blue-600 text-white border-blue-600 shadow-[0_10px_20px_rgba(37,99,235,0.4)] scale-105' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-600 hover:text-blue-600'}`}>
                    {f === 'RENTED'? 'UNAVAILABLE' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.35)] overflow-hidden border-4 border-white">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900">
                  <th className="p-5 text-left text-[11px] font-black tracking-[2px] text-white/70">VEHICLE</th>
                  <th className="p-5 text-left text-[11px] font-black tracking-[2px] text-white/70">BRAND</th>
                  <th className="p-5 text-left text-[11px] font-black tracking-[2px] text-white/70">PRICE / DAY</th>
                  <th className="p-5 text-left text-[11px] font-black tracking-[2px] text-white/70">STATUS</th>
                  <th className="p-5 text-right text-[11px] font-black tracking-[2px] text-white/70">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v=>(
                  <tr key={v._id} className="border-b border-slate-100 hover:bg-blue-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img src={v.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=2563eb&color=fff&bold=true`} className="w-14 h-14 rounded-2xl object-cover shadow-lg" alt="" />
                        <div>
                          <div className="font-black text-slate-900 text-[15px]">{v.name}</div>
                          <div className="text-xs text-slate-500 font-bold">{v.model} • {v.year || 2024}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="bg-blue-600 text-white px-3.5 py-1.5 rounded-full text-xs font-black">{v.brand}</span></td>
                    <td className="p-4 font-black text-slate-900 text-[16px]">₹{Number(v.pricePerDay).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <select value={v.status === 'BOOKED'? 'UNAVAILABLE' : v.status} onChange={(e)=>handleStatusChange(v._id, e.target.value)} className="px-4 py-2 rounded-full text-[11px] font-black border-2 bg-white cursor-pointer outline-none">
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="UNAVAILABLE">UNAVAILABLE</option>
                        <option value="MAINTENANCE">MAINTENANCE</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={()=>navigate(`/admin/editvehicle/${v._id}`)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-black transition">Edit</button>
                      <button onClick={()=>handleDelete(v._id, v.name)} className="px-5 py-2.5 bg-slate-100 text-slate-900 rounded-xl text-xs font-black hover:bg-red-600 hover:text-white transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && (
              <div className="p-20 text-center bg-slate-50">
                <div className="text-6xl mb-4">🚙</div>
                <div className="font-black text-slate-900">No vehicles found</div>
                <div className="text-sm text-slate-500 mt-1">Try changing filter to ALL</div>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {filtered.map(v=>(
              <div key={v._id} className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-5 border-2 border-white">
                <div className="flex gap-4">
                  <img src={v.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=2563eb&color=fff&bold=true`} className="w-20 h-20 rounded-2xl object-cover shadow-lg" alt="" />
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900">{v.name}</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1">{v.brand} • ₹{Number(v.pricePerDay).toLocaleString('en-IN')}/day</p>
                    <select value={v.status === 'BOOKED'? 'UNAVAILABLE' : v.status} onChange={(e)=>handleStatusChange(v._id, e.target.value)} className="mt-2 px-3 py-1.5 rounded-full text-[10px] font-black border-2">
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="UNAVAILABLE">UNAVAILABLE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button onClick={()=>navigate(`/admin/editvehicle/${v._id}`)} className="py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm">Edit</button>
                  <button onClick={()=>handleDelete(v._id, v.name)} className="py-3.5 rounded-2xl bg-red-50 text-red-600 border-2 border-red-100 font-black text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageVehicles;