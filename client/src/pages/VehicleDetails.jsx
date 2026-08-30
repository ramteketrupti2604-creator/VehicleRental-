import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays } from 'date-fns';
import { Car, Fuel, Users, MapPin, Calendar, CheckCircle, Shield, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickupDate, setPickupDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([
    { name: 'Rahul Sharma', rating: 5, comment: 'Superb car, very clean and mileage awesome!' },
    { name: 'Priya Singh', rating: 4, comment: 'Good experience, driver was polite.' }
  ]);

  useEffect(() => {
    const fetchVehicleAndBookings = async () => {
      try {
        const resVehicle = await axios.get(`${API_URL}/api/vehicles/${id}`);
        setVehicle(resVehicle.data.vehicle || resVehicle.data);
      } catch { toast.error('Vehicle not found'); } finally { setLoading(false); }

      try {
        // Per vehicle API - Sirf isi gaadi ki dates
        const res = await axios.get(`${API_URL}/api/bookings/vehicle/${id}/booked-dates`);
        const dates = (res.data.bookedDates || []).map(d => {
          const date = new Date(d);
          date.setHours(0,0,0,0);
          return date;
        });
        setBookedDates(dates);
        console.log(`Car ${id} booked dates:`, dates);
      } catch (err) {
        console.log('No bookings for this car');
        setBookedDates([]);
      }
    };
    fetchVehicleAndBookings();
  }, [id]);

  const isBookedDay = (date) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    return bookedDates.some(b => {
      const bd = new Date(b); bd.setHours(0,0,0,0);
      return bd.getTime() === d.getTime();
    });
  };

  const days = pickupDate && returnDate? Math.max(differenceInDays(returnDate, pickupDate) + 1, 1) : 0;
  const total = days > 0? days * (vehicle?.pricePerDay || 0) : 0;

  const handleCheckAvailability = async () => {
    if (!pickupDate ||!returnDate) return toast.error('Please select both dates');
    if (pickupDate >= returnDate) return toast.error('Return date must be after pickup date');
    if (isBookedDay(pickupDate) || isBookedDay(returnDate)) {
      return toast.error('Selected date is already booked for this car');
    }
    toast.success("Vehicle Available ✅");
    navigate('/booking-summary', { state: { vehicle, pickupDate, returnDate, total, days } });
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>;
  if (!vehicle) return <div className="p-8 text-center">Vehicle not found</div>;

  return (
    <div className="min-h-screen relative pb-[90px] lg:pb-0">
      <style>{`
     /* Sirf booked date red hogi */
    .booked-day {
        background-color: #ef4444!important;
        color: white!important;
        text-decoration: line-through!important;
        border-radius: 50%!important;
     }
     /* Past dates grey hongi, red nahi */
    .react-datepicker__day--disabled {
        background-color: #f1f5f9!important;
        color: #94a3b8!important;
        text-decoration: none!important;
     }
     /* Agar koi date booked bhi hai aur disabled bhi, to red hi rahegi */
    .react-datepicker__day--disabled.booked-day {
        background-color: #ef4444!important;
        color: white!important;
     }
      `}</style>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]"></div>

      <div className="max-w-[1320px] mx-auto px-3 md:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-7 items-start">
          <div className="lg:col-span-8 space-y-5">
            <div className="bg-white rounded-[24px] md:rounded-[32px] overflow-hidden shadow border">
              <div className="relative h-[320px] sm:h-[420px] md:h-[520px] bg-slate-100">
                <img src={vehicle.images?.[0]} alt={vehicle.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute top-5 left-5 flex gap-2">
                  <span className="bg-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-lg"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>{vehicle.status}</span>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest shadow-lg">{vehicle.category?.name || vehicle.category}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h1 className="text-white text-[28px] md:text-[42px] font-black">{vehicle.brand} {vehicle.name}</h1>
                  <p className="text-white/90 text-[12px] md:text-[14px] mt-3 flex items-center gap-2 font-semibold bg-black/20 backdrop-blur-md w-fit px-3 py-1 rounded-full"><MapPin size={14} /> {vehicle.location} • {vehicle.model} • {vehicle.year}</p>
                </div>
              </div>
              <div className="p-5 md:p-8">
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-[#f0f6ff] to-[#e0eaff] border border-blue-100 rounded-[18px] p-4 text-center"><Users size={22} className="mx-auto mb-2 text-blue-600" /><p className="font-black text-[14px]">{vehicle.seats} Seats</p><p className="text-[10px] text-slate-500">CAPACITY</p></div>
                  <div className="bg-gradient-to-br from-[#f0f6ff] to-[#e0eaff] border border-blue-100 rounded-[18px] p-4 text-center"><Fuel size={22} className="mx-auto mb-2 text-blue-600" /><p className="font-black text-[14px]">{vehicle.fuelType}</p><p className="text-[10px] text-slate-500">FUEL</p></div>
                  <div className="bg-gradient-to-br from-[#f0f6ff] to-[#e0eaff] border border-blue-100 rounded-[18px] p-4 text-center"><Car size={22} className="mx-auto mb-2 text-blue-600" /><p className="font-black text-[14px]">{vehicle.transmission}</p><p className="text-[10px] text-slate-500">GEAR</p></div>
                </div>
                <div className="mt-8">
                  <h3 className="font-black text-[11px] tracking-[2px] text-slate-400">FEATURES</h3>
                  <div className="flex flex-wrap gap-2.5 mt-3">{vehicle.features?.map(f => <span key={f} className="bg-white border border-slate-200 px-4 py-2 rounded-full text-[11px] font-bold text-slate-700 shadow-sm hover:border-blue-300 transition">{f}</span>)}</div>
                </div>
                <div className="mt-8 bg-[#f8fafc] rounded-[18px] p-5 border border-slate-100">
                  <h3 className="font-black text-[12px] flex items-center gap-2"><Shield size={16} className="text-blue-600" /> Description</h3>
                  <p className="mt-3 text-[13px] text-slate-600 leading-[1.7]">{vehicle.description}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(37,99,235,0.25)] border border-white/60">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-black text-[12px] tracking-[2px] flex items-center gap-2">⭐ RATINGS & REVIEWS <span className="bg-blue-600 text-white text-[9px] px-3 py-1 rounded-full tracking-widest">BONUS</span></h3>
                <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-2 rounded-full border"><div className="text-[26px] font-black leading-none">4.8</div><div className="flex text-yellow-400">{[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill="currentColor" />)}</div></div>
              </div>
              <div className="mt-6 grid gap-3">{reviews.map((r, i) => <div key={i} className="bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl flex gap-3"><div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[12px]">{r.name[0]}</div><div><p className="font-bold text-[12px]">{r.name} - {r.rating}★</p><p className="text-[12px] text-slate-600 mt-1">{r.comment}</p></div></div>)}</div>
              <div className="mt-6 bg-blue-50 p-4 rounded-2xl border border-blue-100"><div className="flex gap-2">{[1, 2, 3, 4, 5].map(n => <Star key={n} onClick={() => setRating(n)} size={26} className={`cursor-pointer ${n <= rating? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />)}</div><button onClick={() => toast.success('Review Submitted!')} className="w-full mt-3 bg-slate-900 text-white py-3 rounded-full font-bold text-[12px] tracking-widest">Submit Review</button></div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <div className="bg-white p-6 md:p-7 rounded-[24px] md:rounded-[32px] shadow-[0_20px_60px_-20px_rgba(37,99,235,0.35)] border border-white/60">
              <p className="text-[36px] font-black tracking-tight leading-none">₹{vehicle.pricePerDay?.toLocaleString()} <span className="text-[14px] font-semibold text-slate-400">/day</span></p>
              <p className="text-[11px] font-bold text-green-600 flex items-center gap-1.5 mt-3 bg-green-50 w-fit px-3 py-1 rounded-full border border-green-100"><CheckCircle size={13} /> Free cancellation till 24h before</p>

              <div className="mt-7 space-y-4">
                <div>
                  <label className="font-black text-[10px] tracking-[1.5px] text-slate-500 flex items-center gap-1.5 mb-2"><Calendar size={12} /> PICKUP DATE & TIME</label>
                  <DatePicker selected={pickupDate} onChange={setPickupDate} minDate={new Date()} excludeDates={bookedDates} dayClassName={date => isBookedDay(date)? 'booked-day' : undefined} showTimeSelect timeIntervals={30} dateFormat="MMM d, yyyy h:mm aa" className="border-2 border-slate-100 bg-[#f8fafc] p-3.5 rounded-xl w-full text-[13px] font-bold focus:border-blue-500 outline-none" placeholderText="Select pickup" wrapperClassName="w-full" />
                </div>
                <div>
                  <label className="font-black text-[10px] tracking-[1.5px] text-slate-500 flex items-center gap-1.5 mb-2"><Calendar size={12} /> RETURN DATE & TIME</label>
                  <DatePicker selected={returnDate} onChange={setReturnDate} minDate={pickupDate || new Date()} excludeDates={bookedDates} dayClassName={date => isBookedDay(date)? 'booked-day' : undefined} showTimeSelect timeIntervals={30} dateFormat="MMM d, yyyy h:mm aa" className="border-2 border-slate-100 bg-[#f8fafc] p-3.5 rounded-xl w-full text-[13px] font-bold focus:border-blue-500 outline-none" placeholderText="Select return" wrapperClassName="w-full" />
                </div>

                <div className="flex gap-2 text-[11px] font-bold mt-2">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span> Booked only for this {vehicle.name}</span>
                  <span className="text-slate-500">({bookedDates.length} days booked)</span>
                </div>
                <p className="text-[10px] text-slate-400">Note: Red dates are booked only for this car. Other cars have different calendar.</p>
              </div>

              {days > 0 && <div className="mt-6 bg-slate-900 text-white rounded-2xl p-4"><div className="flex justify-between text-[12px] opacity-60"><span>{days} Days × ₹{vehicle.pricePerDay}</span><span>₹{total}</span></div><div className="flex justify-between text-[20px] font-black mt-2"><span>Total</span><span>₹{total.toLocaleString()}</span></div></div>}

              <button onClick={handleCheckAvailability} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-black hover:to-slate-900 text-white w-full py-4 rounded-xl font-black mt-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98] transition-all">Check Availability <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t p-3 rounded-t-[20px] z-50 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)]">
        <div className="flex gap-3"><div className="flex-1"><p className="font-black text-[18px]">₹{vehicle.pricePerDay}/day</p><p className="text-[11px] text-slate-500">{days > 0? `${days} Days • ₹${total}` : "Select dates"}</p></div><button onClick={handleCheckAvailability} className="bg-slate-900 text-white px-7 py-3.5 rounded-full font-black text-[13px]">Check & Rent</button></div>
      </div>
    </div>
  )
}
export default VehicleDetails;