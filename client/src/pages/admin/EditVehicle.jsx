import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [vehicle, setVehicle] = useState({
    name: '', brand: '', model: '', pricePerDay: '',
    category: '', location: '', description: '', status: 'AVAILABLE',
    registrationNumber: '', year: '', fuelType: '', transmission: '', seats: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: catRes } = await axios.get('http://localhost:5000/api/categories');
        setCategories(catRes.categories || catRes.data || catRes);
        const { data: vehicleData } = await axios.get(`http://localhost:5000/api/vehicles/${id}`);
        setVehicle({
         ...vehicleData,
          category: vehicleData.category?._id || vehicleData.category || ''
        });
        setLoading(false);
      } catch (err) {
        toast.error('Failed to fetch data');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const onChange = (e) => {
    setVehicle({...vehicle, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/vehicles/${id}`, vehicle, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vehicle Updated Successfully');
      navigate('/admin/vehicles');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update Failed');
    }
  };

  if(loading) return <div className="min-h-screen bg-[#2563eb] flex items-center justify-center"><div className="bg-white px-6 py-3 rounded-full font-black animate-pulse">Loading...</div></div>

  return (
    <div className="min-h-screen w-full -mt-6 -mx-4 sm:mx-0 sm:-mt-4 p-3 sm:p-6 flex justify-center"
      style={{
        backgroundColor: '#1e40af',
        backgroundImage: `radial-gradient(800px 400px at 0% 0%, #60a5fa 0%, transparent 60%), radial-gradient(900px 500px at 100% 0%, #22d3ee 0%, transparent 60%), radial-gradient(700px 400px at 50% 100%, #3b82f6 0%, transparent 70%), linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #1d4ed8 100%)`,
      }}>

      <div className="max-w-4xl w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate('/admin/vehicles')} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center font-bold hover:scale-110 active:scale-90 transition">←</button>
            <div>
              <h2 className="text-[20px] sm:text-[24px] font-black text-white tracking-tight leading-none drop-shadow">Edit Vehicle</h2>
              <p className="text-[12px] font-bold text-blue-200 mt-1">{vehicle.brand} {vehicle.name} • {vehicle.registrationNumber}</p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-white text-blue-700 text-[11px] font-black tracking-widest shadow-lg">{vehicle.status}</span>
        </div>

        {/* White Card on Blue */}
        <form onSubmit={submitHandler} className="bg-white rounded-[22px] shadow-[0_25px_80px_rgba(0,0,0,.4)] border-[3px] border-white overflow-hidden">
          {/* Blue Top Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600"></div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Brand</label>
                <input type="text" name="brand" value={vehicle.brand || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition" required />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Model / Name</label>
                <input type="text" name="name" value={vehicle.name || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold focus:bg-white focus:border-blue-600 outline-none" required />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Registration No.</label>
                <input type="text" name="registrationNumber" value={vehicle.registrationNumber || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold focus:bg-white outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Year</label>
                <input type="number" name="year" value={vehicle.year || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Price Per Day ₹</label>
                <input type="number" name="pricePerDay" value={vehicle.pricePerDay || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-200 bg-blue-50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-black text-blue-700 outline-none" required />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Seats</label>
                <input type="number" name="seats" value={vehicle.seats || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Fuel Type</label>
                <select name="fuelType" value={vehicle.fuelType || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold outline-none">
                  <option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Transmission</label>
                <select name="transmission" value={vehicle.transmission || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold outline-none">
                  <option>Manual</option><option>Automatic</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Location</label>
                <input type="text" name="location" value={vehicle.location || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold outline-none" />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Category</label>
                <select name="category" value={vehicle.category || ''} onChange={onChange} className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-bold outline-none" required>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Status</label>
                <select name="status" value={vehicle.status || 'AVAILABLE'} onChange={onChange} className="mt-1 w-full sm:w-1/2 border-2 border-blue-200 bg-blue-50 rounded-xl px-3.5 py-3 sm:py-2.5 text-[15px] sm:text-[13px] font-black outline-none">
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="UNAVAILABLE">UNAVAILABLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>
            </div>

            <div className="mt-3.5">
              <label className="text-[10px] font-black tracking-widest text-blue-600 uppercase">Description</label>
              <textarea name="description" value={vehicle.description || ''} onChange={onChange} rows="2" className="mt-1 w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-3.5 py-3 text-[14px] font-medium outline-none resize-none focus:bg-white focus:border-blue-600"></textarea>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-5">
              <button type="button" onClick={()=>navigate('/admin/vehicles')} className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-black text-[14px] active:scale-95 transition">Cancel</button>
              <button type="submit" className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 text-white font-black text-[14px] shadow-[0_10px_25px_rgba(37,99,235,.4)] hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition">Update Vehicle</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditVehicle;