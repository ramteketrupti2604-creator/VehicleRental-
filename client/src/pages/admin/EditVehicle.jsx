import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState({
    name:'', brand:'', pricePerDay:'', location:'', description:'',
    registrationNumber:'', year:'', seats:'', fuelType:'Petrol',
    transmission:'Manual', status:'AVAILABLE'
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/vehicles/${id}`).then(res=>{
      const d=res.data;
      setVehicle({
        name:d.name||'', brand:d.brand||'', pricePerDay:d.pricePerDay||'',
        location:d.location||'', description:d.description||'',
        registrationNumber:d.registrationNumber||'', year:d.year||'',
        seats:d.seats||'', fuelType:d.fuelType||'Petrol',
        transmission:d.transmission||'Manual', status:d.status||'AVAILABLE'
      });
      setLoading(false);
    });
  }, [id]);

  const onChange = e => setVehicle({...vehicle, [e.target.name]: e.target.value});

  const handleUpdate = async e => {
    e.preventDefault();
    try{
      await axios.put(`http://localhost:5000/api/vehicles/${id}`, {
        name: vehicle.name, brand: vehicle.brand,
        pricePerDay: Number(vehicle.pricePerDay),
        location: vehicle.location, description: vehicle.description,
        registrationNumber: vehicle.registrationNumber,
        year: Number(vehicle.year), seats: Number(vehicle.seats),
        fuelType: vehicle.fuelType, transmission: vehicle.transmission, status: vehicle.status
      }, { headers:{ Authorization:`Bearer ${token}` }});
      toast.success('Updated!');
      navigate('/admin/vehicles');
    }catch(err){ toast.error('Update Failed'); }
  };

  if(loading) return <div className="min-h-screen bg-blue-600 flex items-center justify-center text-white font-black">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-[#2563eb] flex justify-center p-3"
      style={{background: `radial-gradient(800px at 0% 0%, #60a5fa, transparent), #2563eb`}}>

      <div className="w-full max-w-[700px]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={()=>navigate('/admin/vehicles')} className="w-9 h-9 bg-white rounded-full font-bold shadow-md text-[14px]">←</button>
          <h1 className="text-white font-black text-[18px]">Edit Vehicle <span className="font-bold text-blue-100 text-[11px] ml-2">{vehicle.brand} {vehicle.name}</span></h1>
        </div>

        <div className="bg-white rounded-[20px] shadow-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
          <form onSubmit={handleUpdate} className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">BRAND</label><input name="brand" value={vehicle.brand} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none focus:border-blue-500 focus:bg-white" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">MODEL NAME</label><input name="name" value={vehicle.name} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none focus:border-blue-500 focus:bg-white" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">REGISTRATION NO</label><input name="registrationNumber" value={vehicle.registrationNumber} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">YEAR</label><input name="year" value={vehicle.year} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-blue-600 ml-1">PRICE / DAY ₹</label><input name="pricePerDay" value={vehicle.pricePerDay} onChange={onChange} className="mt-1 w-full bg-blue-50 border-2 border-blue-100 rounded-xl px-3 py-2.5 text-[13px] font-black text-blue-700 outline-none" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">SEATS</label><input name="seats" value={vehicle.seats} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">LOCATION</label><input name="location" value={vehicle.location} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none" /></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">FUEL TYPE</label><select name="fuelType" value={vehicle.fuelType} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none"><option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option></select></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">TRANSMISSION</label><select name="transmission" value={vehicle.transmission} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none"><option>Manual</option><option>Automatic</option></select></div>
              <div><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">STATUS</label><select name="status" value={vehicle.status} onChange={onChange} className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2.5 text-[13px] font-black outline-none"><option>AVAILABLE</option><option>UNAVAILABLE</option><option>MAINTENANCE</option></select></div>
              <div className="sm:col-span-2"><label className="text-[9px] font-black tracking-widest text-slate-400 ml-1">DESCRIPTION</label><textarea name="description" value={vehicle.description} onChange={onChange} rows="1" className="mt-1 w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-[13px] outline-none resize-none"></textarea></div>
            </div>

            <div className="mt-5 flex justify-center">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-2.5 rounded-full font-black text-[13px] tracking-wide shadow-[0_8px_20px_rgba(37,99,235,0.4)] active:scale-[0.95] transition-all">
                Update Vehicle
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}