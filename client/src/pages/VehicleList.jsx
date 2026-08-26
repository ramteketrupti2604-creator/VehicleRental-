import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Users, Fuel, Settings, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', location: '', minPrice: '', maxPrice: '', sort: 'newest' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories').then(res => setCategories(res.data.categories || res.data));
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`http://localhost:5000/api/vehicles?${query}`);
      setVehicles(data.vehicles || data);
    } catch {
      toast.error('Failed to fetch vehicles');
    }
    setLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Find Your Perfect Ride</h1>

      {/* FILTER BAR - Gradient + Sticky */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 rounded-2xl shadow-lg mb-8 sticky top-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input placeholder="Search Brand/Model" value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} className="border-0 p-3 rounded-lg focus:ring-2 focus:ring-accent"/>

          <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="border-0 p-3 rounded-lg">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)} {/* FIX: name bhejo, _id nahi */}
          </select>

          <input placeholder="Location" value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} className="border-0 p-3 rounded-lg"/>

          <select value={filters.sort} onChange={e => setFilters({...filters, sort: e.target.value})} className="border-0 p-3 rounded-lg">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button onClick={fetchVehicles} className="bg-accent hover:bg-orange-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition">
            <Search size={18}/> Search
          </button>
        </div>
      </div>

      {/* VEHICLE GRID */}
      {loading? <p className="text-center">Loading...</p> :
      vehicles.length === 0?
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No Vehicles Found 😔</p>
          <p>Try changing your filters</p>
        </div>
      :
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vehicles.map((v, i) => (
          <motion.div
            key={v._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/vehicle/${v._id}`} className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all overflow-hidden block group">
              <div className="relative">
                <img src={v.images?.[0] || 'https://via.placeholder.com/400'} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"/>
                <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${v.status === 'AVAILABLE'? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {v.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800">{v.brand} {v.name}</h3> {/* FIX: Double name hataya */}
                <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14}/> {v.location}</p>

                <div className="flex gap-3 text-xs text-gray-600 my-3">
                  <span className="flex items-center gap-1"><Users size={14}/>{v.seats}</span>
                  <span className="flex items-center gap-1"><Settings size={14}/>{v.transmission}</span>
                  <span className="flex items-center gap-1"><Fuel size={14}/>{v.fuelType}</span>
                </div>

                <p className="text-2xl font-bold text-primary">₹{v.pricePerDay}<span className="text-sm font-normal text-gray-500">/day</span></p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      }
    </div>
  )
}
export default VehicleList;