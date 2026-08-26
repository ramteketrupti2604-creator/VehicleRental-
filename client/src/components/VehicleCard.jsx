import { Link } from 'react-router-dom';
import { MapPin, Fuel, Users, Settings2 } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const imageUrl = vehicle.images?.[0] || vehicle.image || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600';

  // Fix: Ford Ford double name hatana
  const displayName = vehicle.name?.toLowerCase().startsWith(vehicle.brand?.toLowerCase())
   ? vehicle.name
    : `${vehicle.brand} ${vehicle.name}`;

  return (
    <div className="bg-white rounded-[22px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 group">
      <div className="relative h-[190px] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={vehicle.name}
          className="h-full w-full object-cover group-hover:scale-110 transition duration-700"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600';
          }}
        />
        <span className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-black rounded-full shadow backdrop-blur ${vehicle.status==='AVAILABLE'? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {vehicle.status}
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold bg-black/75 text-white rounded-full backdrop-blur">
          {vehicle.fuelType}
        </span>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-black truncate tracking-tight">{displayName}</h3>
        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <MapPin size={12}/> {vehicle.location} • {vehicle.category?.name || 'SUV'} • {vehicle.seats} Seats
        </p>

        <div className="flex gap-1.5 mt-3">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full"><Fuel size={11}/>{vehicle.fuelType}</span>
          <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full"><Settings2 size={11}/>{vehicle.transmission}</span>
          <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full"><Users size={11}/>{vehicle.seats}</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-[18px] font-black text-blue-600">₹{vehicle.pricePerDay?.toLocaleString()}<span className="text-[11px] font-medium text-slate-400">/day</span></p>
          <Link to={`/vehicles/${vehicle._id}`} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-full font-bold text-[11px] transition">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}