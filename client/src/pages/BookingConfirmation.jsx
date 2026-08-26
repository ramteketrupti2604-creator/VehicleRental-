import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, MapPin, Copy, ArrowRight, Calendar, Fuel, Clock, ShieldCheck, QrCode, CreditCard } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BookingConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const [booking, setBooking] = useState(location.state || JSON.parse(localStorage.getItem('lastBooking') || 'null'));
  const [loading, setLoading] = useState(!location.state);
  const [paying, setPaying] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (location.state) { setLoading(false); return; }
    const load = async () => {
      try {
        if (!token) return;
        const { data } = await axios.get(`${API_URL}/bookings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setBooking(data.booking || data);
      } catch {
        const saved = localStorage.getItem('lastBooking');
        if (saved) setBooking(JSON.parse(saved));
      } finally { setLoading(false); }
    };
    if (!booking) load(); else setLoading(false);
  }, [id]);

  if (loading) return <div className="min-h-screen bg-blue-600 flex items-center justify-center"><div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div></div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center p-6 bg-blue-600"><div className="bg-white p-6 rounded-[20px] text-center"><p className="font-black text-sm">Booking not found</p><Link to="/" className="mt-3 inline-block bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold">Go Home</Link></div></div>;

  const days = booking.rentalDays || Math.max(differenceInDays(new Date(booking.returnDate), new Date(booking.pickupDate)), 1);
  const vehicleName = booking.vehicle?.name?.startsWith(booking.vehicle?.brand)? booking.vehicle.name : `${booking.vehicle?.brand} ${booking.vehicle?.name}`;
  const qrValue = `VR RENTAL\nBooking: ${booking.bookingNumber}\nVehicle: ${vehicleName}\nTotal: ₹${booking.totalAmount}\nPayment: ${isPaid? 'PAID' : 'PENDING'}`;

  const handlePayment = async () => {
    setPaying(true);
    try {
      const { data } = await axios.post(`${API_URL}/payment/create-order`, { amount: booking.totalAmount });
      toast.success(`Order: ${data.order.id}`);
      setTimeout(async () => {
        await axios.post(`${API_URL}/payment/verify`);
        toast.success('Paid ₹' + booking.totalAmount);
        setIsPaid(true);
        setBooking(prev => ({...prev, paymentStatus: 'PAID' }));
        setPaying(false);
      }, 1500);
    } catch {
      toast.success('Mock Payment Success');
      setTimeout(() => { setIsPaid(true); setPaying(false); }, 1000);
    }
  };

  return (
    <div className="min-h-[88vh] relative overflow-hidden flex items-center justify-center py-2 px-3">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#1e3a8a]"></div>

      <div className="relative w-full max-w-[520px]">
        <div className="bg-white rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* HEADER - HEIGHT KAM KIYA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="text-white leading-none">
              <h1 className="text-[15px] font-black">Booking Confirmed!</h1>
              <p className="text-[10px] opacity-80 mt-1 flex items-center gap-1"><ShieldCheck size={10}/> Reserved</p>
            </div>
            <div className="ml-auto bg-white text-blue-700 text-[8px] font-black tracking-widest px-2.5 py-1 rounded-full">✓ {booking.status || 'CONFIRMED'}</div>
          </div>

          <div className="p-3">
            {/* BOOKING NUMBER */}
            <div className="bg-slate-900 text-white rounded-[12px] px-3.5 py-2.5 flex justify-between items-center">
              <div>
                <p className="text-[7px] tracking-[1.5px] opacity-50 font-black">BOOKING NUMBER</p>
                <p className="font-black text-[12px] tracking-wider mt-0.5">{booking.bookingNumber}</p>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(booking.bookingNumber); toast.success('Copied!'); }} className="bg-white/10 p-2 rounded-lg"><Copy size={12} /></button>
            </div>

            {/* VEHICLE - HEIGHT KAM */}
            <div className="mt-2.5 flex gap-3 items-center bg-[#f0f6ff] border border-blue-100 rounded-[12px] p-2.5">
              <img src={booking.vehicle?.images?.[0]} className="w-12 h-12 rounded-[10px] object-cover border border-white shadow-sm" alt="" />
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-[13px] truncate">{vehicleName}</h2>
                <p className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin size={10} />{booking.vehicle?.location} • {booking.vehicle?.seats} Seats • {booking.vehicle?.fuelType}</p>
              </div>
              <div className="text-right bg-slate-900 text-white rounded-[8px] px-2.5 py-1.5">
                <p className="text-[7px] opacity-60 font-black">TOTAL</p>
                <p className="font-black text-[11px]">₹{booking.totalAmount?.toLocaleString()}</p>
              </div>
            </div>

            {/* DATES - COMPACT */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              <div className="bg-white border border-slate-200 rounded-[10px] p-2.5">
                <p className="text-[7px] font-black opacity-40">PICKUP</p>
                <p className="font-bold text-[11px] mt-1">{format(new Date(booking.pickupDate), 'MMM d, yyyy')}</p>
                <p className="text-[9px] opacity-60">{format(new Date(booking.pickupDate), 'h:mm aa')}</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-[10px] p-2.5">
                <p className="text-[7px] font-black opacity-40">RETURN</p>
                <p className="font-bold text-[11px] mt-1">{format(new Date(booking.returnDate), 'MMM d, yyyy')}</p>
                <p className="text-[9px] opacity-60">{format(new Date(booking.returnDate), 'h:mm aa')}</p>
              </div>
              <div className="bg-blue-600 text-white rounded-[10px] p-2.5">
                <p className="text-[7px] font-black opacity-70">PRICE</p>
                <p className="font-black text-[12px] mt-1">{days} Days</p>
                <p className="text-[9px] opacity-80">{days}×₹{booking.pricePerDay}</p>
              </div>
            </div>

            {/* PAYMENT - COMPACT */}
            <button onClick={handlePayment} disabled={paying || isPaid} className={`w-full mt-2.5 py-2.5 rounded-[10px] font-black text-[11px] flex items-center justify-center gap-1.5 ${isPaid? 'bg-green-600 text-white' : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'}`}>
              <CreditCard size={14} /> {isPaid? `✓ Paid ₹${booking.totalAmount}` : paying? 'Processing...' : `Pay Now ₹${booking.totalAmount}`}
            </button>

            {/* QR CODE - HEIGHT BAHUT KAM KIYA */}
            <div className="mt-2.5 bg-slate-900 rounded-[12px] p-2.5 flex gap-3 items-center">
              <div className="bg-white rounded-[8px] p-1.5 shrink-0">
                <QRCodeCanvas value={qrValue} size={60} bgColor="#ffffff" fgColor="#0f172a" level="H" />
              </div>
              <div className="text-white">
                <h3 className="font-black text-[9px] tracking-[1px] flex items-center gap-1"><QrCode size={10}/> QR CODE</h3>
                <p className="text-[9px] text-white/60 mt-0.5">Show at counter • {booking.bookingNumber}</p>
                <p className="text-[8px] font-bold bg-white/10 px-2 py-0.5 rounded-full mt-1 w-fit">{isPaid? 'PAID' : 'PENDING'}</p>
              </div>
            </div>

            {/* BUTTONS - COMPACT */}
            <div className="flex gap-2 mt-2.5">
              <Link to="/my-bookings" className="flex-1 bg-slate-900 text-white py-2.5 rounded-[10px] font-black text-[11px] text-center flex items-center justify-center gap-1">
                My Bookings <ArrowRight size={12} />
              </Link>
              <Link to="/" className="flex-1 bg-white border border-slate-900 text-slate-900 py-2.5 rounded-[10px] font-black text-[11px] text-center">Browse More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookingConfirmation;