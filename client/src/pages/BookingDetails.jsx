import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const isObjectId = (str) => /^[a-f0-9]{24}$/i.test(str);

  useEffect(() => {
    const fetchDetail = async () => {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        let data = (await axios.get(`http://localhost:5000/api/bookings/${id}`, config).catch(()=>null))?.data;
        if(!data){
          const myRes = await axios.get(`http://localhost:5000/api/bookings/mybookings`, config);
          const list = Array.isArray(myRes.data)? myRes.data : myRes.data.bookings || [];
          data = list.find(b => b._id === id);
        }
        if(data?.vehicle && typeof data.vehicle === 'string'){
          const vRes = await axios.get(`http://localhost:5000/api/vehicles/${data.vehicle}`).catch(()=>null);
          if(vRes) data.vehicle = vRes.data.vehicle || vRes.data;
        }
        setBooking(data);
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [id]);

  const handlePrint = () => {
    const v = booking.vehicle || {};
    const pickup = new Date(booking.pickupDate || booking.startDate);
    const returnD = new Date(booking.returnDate || booking.endDate);
    const categoryName = v.category &&!isObjectId(v.category)? v.category : "SUV";
    const receiptHtml = `
      <html><head><title>Receipt - ${booking.bookingNumber}</title>
      <style>body{font-family:Arial;display:flex;justify-content:center;padding:40px;background:#f8fafc}.card{width:700px;border:3px solid #2563eb;border-radius:16px;overflow:hidden;background:white}.header{background:#2563eb;color:white;padding:20px;text-align:center}.header h1{margin:0;font-size:22px}.body{padding:24px;font-size:14px;line-height:2.4}.row{display:flex;justify-content:space-between}.footer{text-align:center;font-size:11px;color:#888;margin-top:20px;border-top:1px solid #eee;padding-top:12px}</style></head>
      <body><div class="card"><div class="header"><h1>VehicleRental - Booking Receipt</h1></div><div class="body">
      <div class="row"><span>Booking No:</span><b>${booking.bookingNumber}</b></div>
      <div class="row"><span>Vehicle:</span><b>${v.name || "Thar"} (${categoryName})</b></div>
      <div class="row"><span>Pickup:</span><b>${pickup.toDateString()} - ${booking.pickupLocation || "Nagpur"}</b></div>
      <div class="row"><span>Return:</span><b>${returnD.toDateString()}</b></div>
      <div class="row"><span>Total:</span><b>₹${booking.totalAmount}</b></div>
      <div class="row"><span>Status:</span><b style="color:#2563eb">${booking.status}</b></div>
      <div class="footer">Thank you for choosing VehicleRental!</div>
      </div></div><script>window.onload=()=>window.print()</script></body></html>`;
    const win = window.open("", "_blank", "width=800,height=700");
    win.document.write(receiptHtml); win.document.close();
  };

  if (loading) return <div className="min-h-screen bg-[#0a2540] flex items-center justify-center text-white">Loading...</div>;
  if (!booking) return <div className="min-h-screen bg-[#0a2540] flex items-center justify-center text-white">Not Found</div>;

  const v = booking.vehicle || {};
  const pickup = new Date(booking.pickupDate || booking.startDate);
  const returnD = new Date(booking.returnDate || booking.endDate);
  const categoryName = v.category &&!isObjectId(v.category)? v.category : "SUV";

  return (
    <>
      <style>{`
        html, body { overflow-x: hidden; }
        body { scrollbar-width: none; -ms-overflow-style: none; }
        body::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="min-h-screen bg-[#0a2540] relative p-4 md:p-8 overflow-hidden">
        {/* Blur - ab isse scroll nahi ayega */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-500 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-cyan-400 rounded-full blur-[130px] opacity-40 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <Link to="/mybookings" className="text-blue-200 text-sm">← Back to My Bookings</Link>
          <h1 className="text-3xl font-black text-white mt-2">Booking Details 💙</h1>
          <p className="text-blue-200 text-sm mb-6">Your trip is confirmed</p>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-[24px] overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between text-white">
                <div><p className="text-[10px] tracking-widest opacity-80">BOOKING NUMBER</p><p className="font-black text-lg">{booking.bookingNumber}</p></div>
                <span className="bg-white text-blue-700 px-4 py-1.5 rounded-full text-xs font-black">{booking.status}</span>
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6">
                <img src={v.image || v.images?.[0] || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600"} className="w-full md:w-60 h-44 object-cover rounded-2xl" alt="" />
                <div className="flex-1">
                  <h2 className="text-3xl font-black">{v.name || "Thar"}</h2>
                  <p className="text-sm text-slate-500">{categoryName} • {v.fuelType || "Diesel"} • {v.transmission || "Manual"} • {v.seats || 4} Seats</p>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-blue-50 rounded-2xl p-4"><p className="text-[10px] font-black text-blue-600">PICKUP</p><p className="font-bold">{pickup.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</p><p className="text-xs">📍 {booking.pickupLocation || "Nagpur"}</p></div>
                    <div className="bg-slate-50 rounded-2xl p-4"><p className="text-[10px] font-black">RETURN</p><p className="font-bold">{returnD.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</p></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-[22px] p-6 shadow-xl">
                <h3 className="font-black text-blue-700 mb-3">Price Summary</h3>
                <div className="flex justify-between text-sm"><span>{booking.rentalDays} × ₹{booking.pricePerDay}</span><span>₹{booking.rentalDays*booking.pricePerDay}</span></div>
                <div className="flex justify-between font-black text-xl text-blue-700 mt-3"><span>Total Paid</span><span>₹{booking.totalAmount}</span></div>
                <button onClick={handlePrint} className="mt-5 w-full bg-blue-600 text-white font-black py-3 rounded-full">📄 Download PDF Receipt</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetails;