import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { MapPin, Calendar, ArrowLeft, ShieldCheck, Clock, Fuel, Users, Tag, X, ExternalLink, Navigation } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BookingSummary = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!state ||!state.vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700">
        <div className="text-center bg-white p-8 rounded-[24px] shadow-2xl">
          <p className="font-black text-lg">No booking data</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold">Go Home</button>
        </div>
      </div>
    );
  }

  const { vehicle, pickupDate, returnDate } = state;
  const days = Math.max(differenceInDays(new Date(returnDate), new Date(pickupDate)), 1);
  const subtotal = days * (vehicle.pricePerDay || 0);
  const total = Math.max(subtotal - discount, 0);
  const locationQuery = vehicle.location || "Wardha, Maharashtra";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&z=14&output=embed`;
  const gmapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;

  const applyCoupon = async () => {
    if(!couponCode.trim()) return toast.error("Enter coupon code");
    setCouponLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/coupons/validate`, {
        code: couponCode.toUpperCase(),
        totalAmount: subtotal
      }, { headers: { Authorization: `Bearer ${token}` } });
      setDiscount(res.data.discount);
      setAppliedCode(couponCode.toUpperCase());
      toast.success(`${couponCode.toUpperCase()} Applied! ₹${res.data.discount} OFF`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid coupon");
      setDiscount(0);
      setAppliedCode('');
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCode('');
    setCouponCode('');
    toast("Coupon removed");
  };

  const confirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }
      const res = await axios.post(`${API_URL}/bookings`, {
        vehicle: vehicle._id,
        pickupDate,
        returnDate,
        pickupLocation: vehicle.location,
        couponCode: appliedCode || undefined
      }, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem('lastBooking', JSON.stringify(res.data.booking || res.data));
      toast.success('Booking Confirmed! 🎉');
      const bookingId = res.data.booking?._id || res.data._id;
      navigate(`/booking-confirmation/${bookingId}`, { state: res.data.booking || res.data });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed - Dates overlapping');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#1e40af]"></div>
      <div className="absolute top-[-100px] left-[-80px] w-[400px] h-[400px] bg-blue-300 rounded-full blur-[80px] opacity-40"></div>
      <div className="absolute bottom-[-120px] right-[-60px] w-[500px] h-[500px] bg-indigo-400 rounded-full blur-[90px] opacity-40"></div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white text-[13px] font-bold mb-4 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/20">
          <ArrowLeft size={16}/> Back
        </button>

        <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-4 md:gap-6">
          <div className="bg-white/95 backdrop-blur-xl rounded-[24px] md:rounded-[32px] border border-white/50 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="relative h-[220px] md:h-[320px]">
              <img src={vehicle.images?.[0]} className="w-full h-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="absolute top-4 left-4 bg-white text-slate-900 text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full">AVAILABLE</div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h1 className="text-[22px] md:text-[28px] font-black leading-tight">{vehicle.brand} {vehicle.name}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full"><MapPin size={12}/>{vehicle.location}</span>
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full"><Users size={12}/>{vehicle.seats} Seats</span>
                  <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full"><Fuel size={12}/>{vehicle.fuelType}</span>
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#f1f5ff] border border-blue-100 rounded-[16px] p-3.5">
                  <p className="text-[9px] font-black tracking-widest text-blue-600 flex items-center gap-1"><Calendar size={10}/> PICKUP</p>
                  <p className="font-bold text-[14px] mt-1">{format(new Date(pickupDate), 'MMM d, yyyy')}</p>
                  <p className="text-[11px] text-gray-500">{format(new Date(pickupDate), 'h:mm aa')}</p>
                </div>
                <div className="bg-[#f1f5ff] border border-blue-100 rounded-[16px] p-3.5">
                  <p className="text-[9px] font-black tracking-widest text-blue-600">RETURN</p>
                  <p className="font-bold text-[14px] mt-1">{format(new Date(returnDate), 'MMM d, yyyy')}</p>
                  <p className="text-[11px] text-gray-500">{format(new Date(returnDate), 'h:mm aa')}</p>
                </div>
                <div className="bg-slate-900 text-white rounded-[16px] p-3.5">
                  <p className="text-[9px] font-black tracking-widest opacity-60">DURATION</p>
                  <p className="font-black text-[18px] mt-1">{days} Days</p>
                  <p className="text-[11px] opacity-70">₹{vehicle.pricePerDay?.toLocaleString()}/day</p>
                </div>
              </div>

              {/* GOOGLE MAPS SECTION ADDED */}
              <div className="mt-5 rounded-[20px] overflow-hidden border border-slate-200 shadow-sm">
                <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center">
                  <p className="text-[11px] font-black tracking-widest flex items-center gap-2"><Navigation size={14} className="text-blue-400"/> PICKUP LOCATION - {locationQuery.toUpperCase()}</p>
                  <a href={gmapLink} target="_blank" rel="noreferrer" className="bg-white text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-slate-100"><ExternalLink size={12}/> Open in Google Maps</a>
                </div>
                <iframe title="pickup-map" src={mapSrc} width="100%" height="300" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                <div className="bg-[#f8fafc] px-4 py-2.5 flex items-center gap-2 text-[11px] text-slate-600"><MapPin size={12} className="text-blue-600"/><span className="font-bold">{locationQuery}</span><span className="text-slate-400">• Free pickup available • Live location verified</span></div>
              </div>

              <div className="flex items-center gap-2 mt-4 text-[11px] text-gray-500"><ShieldCheck size={14} className="text-green-600"/> Free cancellation • 24hr before pickup • Instant confirmation</div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black tracking-[2px] text-blue-600">PRICE BREAKDOWN</p>
              <div className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={10}/> Backend Verified</div>
            </div>
            <div className="mt-5 space-y-3 text-[13px]">
              <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-bold">{vehicle.brand} {vehicle.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Price per day</span><span className="font-bold">₹{vehicle.pricePerDay?.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rental Days</span><span className="font-bold">{days} × ₹{vehicle.pricePerDay?.toLocaleString()}</span></div>
              <div className="border-t border-dashed my-3"></div>
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{subtotal.toLocaleString()}</span></div>

              <div className="bg-[#f8fafc] border border-slate-200 rounded-[14px] p-3 mt-3">
                <p className="text-[10px] font-black tracking-widest text-slate-700 flex items-center gap-1 mb-2"><Tag size={12}/> HAVE A COUPON?</p>
                {!appliedCode? (
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME10 / FLAT200" className="flex-1 bg-white border border-slate-200 rounded-[10px] px-3 py-2.5 text-[13px] font-bold uppercase outline-none focus:border-blue-500" />
                    <button onClick={applyCoupon} disabled={couponLoading} className="bg-blue-600 text-white px-4 py-2.5 rounded-[10px] text-[12px] font-black disabled:opacity-50">{couponLoading?'...':'Apply'}</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-[10px] px-3 py-2.5">
                    <span className="text-[12px] font-bold text-green-700">{appliedCode} • -₹{discount}</span>
                    <button onClick={removeCoupon} className="text-green-700 hover:bg-green-100 p-1 rounded-full"><X size={14}/></button>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">Try: WELCOME10 (10% off) or FLAT200</p>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold"><span>Discount ({appliedCode})</span><span>-₹{discount.toLocaleString()}</span></div>
              )}
            </div>
            <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[16px] p-4 flex justify-between items-center">
              <span className="font-black text-[13px] tracking-widest">TOTAL PAYABLE</span>
              <span className="font-black text-[22px]">₹{total.toLocaleString()}</span>
            </div>
            <button onClick={confirm} disabled={loading} className="w-full mt-5 bg-slate-900 hover:bg-black text-white py-4 rounded-[14px] font-black text-[14px] disabled:opacity-50 active:scale-[0.98] transition shadow-lg">
              {loading? 'Confirming...' : `Confirm Booking • ₹${total.toLocaleString()}`}
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-3">✓ Secure booking • Coupon + Maps enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingSummary;