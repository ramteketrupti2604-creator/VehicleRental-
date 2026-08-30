import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Users, Fuel, Cog, ArrowRight, IndianRupee, RotateCcw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (location) params.location = location;
      if (fuelType) params.fuelType = fuelType;
      if (transmission) params.transmission = transmission;
      if (sort) params.sort = sort;
      if (category) params.category = category;
      if (minPrice!== '') params.minPrice = Number(minPrice);
      if (maxPrice!== '') params.maxPrice = Number(maxPrice);

      const { data } = await axios.get(`${API_URL}/api/vehicles`, { params });
      setVehicles(data.vehicles || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/categories`);
      setCategories(Array.isArray(data)? data : data.categories || []);
    } catch {}
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    fetchVehicles();
  }, [page, category, location, fuelType, transmission, sort]);

  const handleSearchClick = () => {
    setPage(1);
    fetchVehicles();
  }

  const handlePriceSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchVehicles();
    }
  }

  const handleReset = () => {
    setSearch(''); setCategory(''); setLocation(''); setFuelType('');
    setTransmission(''); setMinPrice(''); setMaxPrice(''); setSort(''); setPage(1);
    setTimeout(() => { window.location.reload(); }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="bg-[#0a1931] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#08152f] via-[#0f2a64] to-[#1e4bd8]"></div>
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 py-7">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-white leading-none">
                Rent Your <span className="text-[#4ecbff]">Dream Car</span>
              </h1>
              <p className="text-[#8aa0d6] text-[11px] md:text-[12px] mt-2 font-medium tracking-wide">
                12+ premium cars • Wardha • Nagpur • Mumbai • Instant booking
              </p>
            </div>
            <div className="bg-white/10 border border-white/10 backdrop-blur-md rounded-xl px-3 py-2 text-center hidden md:block">
              <p className="text-white font-black text-[14px] leading-none">12+</p>
              <p className="text-white/60 text-[8px] tracking-widest mt-1 font-bold">CARS</p>
            </div>
          </div>

          <div className="bg-white rounded-[18px] shadow-[0_10px_40px_rgba(0,0,0,0.25)] p-3 mt-6">
            <div className="flex flex-col md:flex-row gap-2.5 items-center">
              <div className="relative w-full md:flex-1">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchClick()}
                  placeholder="Search Thar, Swift, BMW..."
                  className="w-full bg-[#f1f4f9] rounded-full pl-4 pr-12 py-3 text-[13px] font-medium outline-none"
                />
                <button onClick={handleSearchClick} className="absolute right-1.5 top-1.5 w-8 h-8 bg-[#0a1931] rounded-full flex items-center justify-center text-white">
                  <Search size={14} />
                </button>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="bg-[#f1f4f9] rounded-full px-4 text-[12px] font-bold h-10 outline-none flex-1 md:w-[140px]">
                  <option value="">All Category</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="bg-[#0a1931] text-white rounded-full px-4 text-[12px] font-bold h-10 outline-none flex-1 md:w-[110px]">
                  <option value="">Sort</option><option value="price_low">Low to High</option><option value="price_high">High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2.5 items-center">
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={location} onChange={e => { setLocation(e.target.value); setPage(1); }} placeholder="Location" className="bg-[#f1f4f9] rounded-full pl-8 pr-3 text-[12px] font-bold h-9 w-[115px] outline-none" />
              </div>

              <select value={fuelType} onChange={e => { setFuelType(e.target.value); setPage(1); }} className="bg-[#f1f4f9] rounded-full px-3 text-[12px] font-bold h-9 outline-none">
                <option value="">All Fuel</option><option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option>
              </select>

              <select value={transmission} onChange={e => { setTransmission(e.target.value); setPage(1); }} className="bg-[#f1f4f9] rounded-full px-3 text-[12px] font-bold h-9 outline-none">
                <option value="">All Transmission</option><option value="Manual">Manual</option><option value="Automatic">Automatic</option>
              </select>

              <div className="flex items-center bg-[#f1f4f9] rounded-full px-3 h-9 gap-1 border-2 focus-within:border-blue-500">
                <IndianRupee size={11} className="text-slate-500" />
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} onKeyDown={handlePriceSearch} placeholder="Min" className="bg-transparent w-[45px] text-[12px] font-bold outline-none" />
                <span className="text-slate-300 text-[10px]">-</span>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} onKeyDown={handlePriceSearch} placeholder="Max" className="bg-transparent w-[45px] text-[12px] font-bold outline-none" />
                <button onClick={handleSearchClick} className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center ml-1 hover:bg-blue-600"><Search size={10}/></button>
              </div>

              <button onClick={handleReset} className="ml-auto md:ml-2 flex items-center gap-1 text-[11px] font-black text-slate-600 hover:text-black">
                <RotateCcw size={11} /> RESET
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-5">
        <p className="text-[11px] font-bold tracking-widest text-slate-400 mb-4">{vehicles.length} CARS • PAGE {page}/{totalPages} {minPrice || maxPrice? `• ₹${minPrice||0} - ₹${maxPrice||'∞'}` : ''}</p>

        {loading? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="h-[300px] bg-white rounded-[18px] animate-pulse border"></div>)}
          </div>
        ) : vehicles.length === 0? (
          <div className="text-center py-10">
            <p className="font-bold text-slate-600">No cars found in this price range. RESET dabao.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {vehicles.map(v => (
              <div key={v._id} className="group bg-white rounded-[18px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-[185px] bg-slate-100 overflow-hidden">
                  <img
                    src={v.images?.[0]}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    onError={(e) => {
                      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#0a1931'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Arial' font-size='40' font-weight='bold'>${v.name}</text></svg>`;
                      e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <span className="absolute top-3 left-3 bg-[#22c55e] text-white text-[8px] font-black px-2.5 py-1 rounded-full tracking-widest">{v.status || 'Available'}</span>
                  <span className="absolute top-3 right-3 bg-white text-black text-[9px] font-black px-2.5 py-1 rounded-full">{v.category?.name || 'SUV'}</span>
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <h3 className="font-bold text-white text-[15px] leading-none">{v.name}</h3>
                    <p className="text-white/60 text-[10px] mt-1">{v.brand} • {v.year} • {v.registrationNumber}</p>
                  </div>
                </div>

                <div className="p-3">
                  <div className="grid grid-cols-2 gap-1.5">
                    <span className="bg-[#f8fafc] border border-slate-100 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-slate-600 flex items-center gap-1"><Users size={11} />{v.seats} Seats</span>
                    <span className="bg-[#f8fafc] border border-slate-100 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-slate-600 flex items-center gap-1"><Fuel size={11} />{v.fuelType}</span>
                    <span className="bg-[#f8fafc] border border-slate-100 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-slate-600 flex items-center gap-1"><Cog size={11} />{v.transmission}</span>
                    <span className="bg-[#f8fafc] border border-slate-100 rounded-full px-2.5 py-1.5 text-[10px] font-bold text-slate-600 flex items-center gap-1"><MapPin size={11} />{v.location}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <p className="font-extrabold text-[16px]">₹{v.pricePerDay?.toLocaleString()}</p>
                    <Link to={`/vehicles/${v._id}`} className="bg-black text-white px-4 py-2 rounded-full text-[11px] font-bold flex items-center gap-1">View <ArrowRight size={11} /></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-full bg-white border text-xs font-bold disabled:opacity-40">Prev</button>
            <span className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold">Page {page}/{totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-full bg-white border text-xs font-bold disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}