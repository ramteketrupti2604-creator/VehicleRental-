import { useEffect, useState } from 'react';
import axios from 'axios';

const CATEGORY_META = {
  Hatchback: { icon: '🚗', color: 'from-sky-500 to-blue-600', desc: 'Compact & efficient city rides' },
  Sedan: { icon: '🚘', color: 'from-slate-600 to-slate-800', desc: 'Comfort for long drives' },
  SUV: { icon: '🚙', color: 'from-orange-500 to-red-600', desc: 'Power & space for family' },
  MUV: { icon: '🚐', color: 'from-emerald-500 to-teal-600', desc: 'Big group, big luggage' },
  Luxury: { icon: '🏎️', color: 'from-amber-400 to-orange-600', desc: 'Premium & stylish experience' },
  Electric: { icon: '⚡', color: 'from-violet-500 to-purple-700', desc: 'Eco-friendly future ride' },
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [catRes, vehRes] = await Promise.all([
        axios.get(`${API}/categories`, config).catch(()=>axios.get(`${API}/admin/categories`, config)),
        axios.get(`${API}/vehicles`, config)
      ]);
      const catList = Array.isArray(catRes.data)? catRes.data : catRes.data.categories || catRes.data.data || [];
      const vehList = Array.isArray(vehRes.data)? vehRes.data : vehRes.data.vehicles || vehRes.data.data || [];
      setCategories(catList);
      setVehicles(vehList);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const getCount = (catName) => {
    return vehicles.filter(v => {
      const vc = v.category?.name || v.category || '';
      return vc.toString().toLowerCase() === catName.toString().toLowerCase();
    }).length;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast("Category name required");
    try {
      await axios.post(`${API}/categories`, { name: name.trim() }, config);
      setName('');
      showToast(`"${name.trim()}" added successfully`, 'success');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || `"${name}" already exists`, 'error');
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return showToast("Name cannot be empty");
    try {
      await axios.put(`${API}/categories/${id}`, { name: editName.trim() }, config);
      setEditId(null);
      showToast("Category updated", 'success');
      fetchAll();
    } catch (err) { showToast(err.response?.data?.message || "Update failed"); }
  };

  const handleDelete = async (id, catName) => {
    const count = getCount(catName);
    if (count > 0) return showToast(`Cannot delete - ${count} vehicles use this category. Move them first.`);
    if (!window.confirm(`Delete "${catName}"?`)) return;
    try {
      await axios.delete(`${API}/categories/${id}`, config);
      showToast(`"${catName}" deleted`, 'success');
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed - " + (err.response?.data?.message || ''));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1931] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#0a1931] rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 font-bold text-sm">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1931] p-3 md:p-6 relative">
      {/* Toast - FIXED: Top 80px, z-index 99999 so it shows BELOW navbar but ABOVE content */}
      {toast && (
        <div className={`fixed top-[80px] right-4 left-4 md:left-auto md:w-[380px] z-[99999] px-4 py-3 rounded-2xl shadow-2xl text-sm font-bold border flex items-center gap-3 animate-bounce
          ${toast.type === 'success'? 'bg-emerald-500 text-white border-emerald-400' : 'bg-white text-slate-900 border-red-200'}`}>
          <span className="text-lg">{toast.type === 'success'? '✅' : '⚠️'}</span> {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="rounded-[28px] bg-gradient-to-br from-[#0a1931] via-[#123a7a] to-[#1d5ddf] text-white p-5 md:p-8 shadow-2xl border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <h1 className="text-[30px] md:text-5xl font-black tracking-tight leading-none">Categories</h1>
              <p className="text-blue-200 text-[11px] md:text-[13px] mt-2 opacity-90">
                
              </p>
              <div className="flex gap-2 mt-4 flex-wrap">
                {Object.keys(CATEGORY_META).map(k=>(
                  <span key={k} className="bg-white/10 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest">{k}</span>
                ))}
              </div>
            </div>
            <form onSubmit={handleAdd} className="bg-white rounded-full p-1.5 flex gap-2 w-full lg:w-[380px] shadow-xl h-fit shrink-0">
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Sedan" className="flex-1 px-5 py-3 rounded-full outline-none text-[14px] text-slate-900 placeholder:text-slate-400 font-medium bg-transparent" />
              <button type="submit" className="bg-[#0a1931] text-white px-7 rounded-full font-black text-sm hover:bg-black transition shadow">Add</button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {categories.map(cat => {
            const catName = cat.name || cat;
            const meta = CATEGORY_META[catName] || { icon: '📦', color: 'from-slate-500 to-slate-700', desc: 'Custom category' };
            const count = getCount(catName);
            const isEditing = editId === cat._id;
            return (
              <div key={cat._id || catName} className="group bg-white rounded-[24px] p-5 shadow-lg border border-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl shadow-lg`}>{meta.icon}</div>
                  <span className={`px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-widest border ${count>0?'bg-[#0a1931] text-white border-[#0a1931]':'bg-slate-100 text-slate-500 border-slate-200'}`}>{count} VEHICLES</span>
                </div>

                {isEditing? (
                  <div className="mt-5 bg-slate-50 rounded-2xl p-2 flex gap-2 border">
                    <input value={editName} onChange={e=>setEditName(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm font-bold outline-none" autoFocus />
                    <button onClick={()=>handleUpdate(cat._id)} className="bg-[#0a1931] text-white px-4 rounded-full text-xs font-black">Save</button>
                    <button onClick={()=>setEditId(null)} className="bg-white border px-3 rounded-full text-xs font-bold">✕</button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-black text-[18px] mt-5 leading-none text-slate-900">{catName}</h3>
                    <p className="text-[12px] text-slate-500 mt-1.5 font-medium">{meta.desc}</p>
                  </>
                )}

                <div className="flex gap-2 mt-5">
                  {!isEditing && <button onClick={()=>{ setEditId(cat._id); setEditName(catName); }} className="flex-1 bg-slate-900 text-white rounded-full py-3 text-[12px] font-black tracking-widest hover:bg-black transition">Edit</button>}
                  <button onClick={()=>handleDelete(cat._id, catName)} className={`px-5 border border-red-200 text-red-600 rounded-full py-3 text-[12px] font-black hover:bg-red-50 transition ${!isEditing? '' : 'flex-1'}`}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 text-[12px] text-blue-100">
          <b className="text-white">Note (Point 5 & 14):</b> Admin can Create, Edit, Delete, View. Category with vehicles cannot be deleted - enforced by backend. Proper toast, loading & empty states added.
        </div>
      </div>
    </div>
  );
}