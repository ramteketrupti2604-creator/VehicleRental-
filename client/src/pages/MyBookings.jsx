import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import './MyBookings.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  // Reschedule States - NEW
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newPickup, setNewPickup] = useState('');
  const [newReturn, setNewReturn] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const downloadReceipt = (booking) => {
    const doc = new jsPDF();
    const bookingNo = booking.bookingNumber || booking._id.slice(-6).toUpperCase();
    const vehicleName = booking.vehicle?.brand? `${booking.vehicle.brand} ${booking.vehicle.name}` : booking.vehicle?.name || 'Vehicle';
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 15, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Vehicle Rental System', 15, 28);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Booking Receipt | Premium Cars | Secure & Verified', 15, 35);
    doc.setFillColor(255,255,255);
    doc.roundedRect(130, 12, 65, 22, 5, 5, 'F');
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('BOOKING NO', 135, 19);
    doc.setFontSize(10);
    doc.text(bookingNo, 135, 26);
    doc.setTextColor(30,41,59);
    let y = 60;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Booking Details', 15, y);
    y+=8;
    doc.setDrawColor(37,99,235);
    doc.setLineWidth(0.8);
    doc.line(15, y, 50, y);
    y+=10;
    const addLine = (label, value) => {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${label}:`, 15, y);
      doc.setFont(undefined, 'normal');
      doc.text(`${value}`, 48, y);
      y+=8;
    };
    addLine('Vehicle', vehicleName);
    addLine('Location', booking.vehicle?.location || 'India');
    addLine('Pickup', new Date(booking.pickupDate).toLocaleString('en-IN'));
    addLine('Return', new Date(booking.returnDate).toLocaleString('en-IN'));
    addLine('Days', `${booking.rentalDays} Days | Price/Day: Rs. ${booking.pricePerDay}`);
    addLine('Status', booking.status);
    y+=4;
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(15, y, 180, 16, 4, 4, 'F');
    doc.setFillColor(37,99,235);
    doc.roundedRect(15, y, 4, 16, 2, 2, 'F');
    doc.setTextColor(15,23,42);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text(`Total Paid: Rs. ${booking.totalAmount?.toLocaleString()} /-`, 25, y+10);
    y+=25;
    doc.setFontSize(9);
    doc.setTextColor(100,116,139);
    doc.text('Thank you for choosing us! This is computer generated receipt.', 15, y);
    doc.save(`Receipt-${bookingNo}.pdf`);
    toast.success('Receipt Downloaded! 📄');
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      let res;
      try {
        res = await axios.get(`${API_URL}/bookings/mybookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch {
        res = await axios.get(`${API_URL}/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const data = Array.isArray(res.data)? res.data : res.data.bookings || [];
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? Note: Cannot cancel within 24 hours of pickup.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking cancelled');
      setBookings(prev => prev.map(b => b._id === id? {...b, status: 'CANCELLED'} : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel within 24 hrs - Try future date booking');
    }
  };

  // RESCHEDULE LOGIC - FIXED
  const handleRescheduleClick = (booking) => {
    setSelectedBooking(booking);
    setNewPickup(new Date(booking.pickupDate).toISOString().split('T')[0]);
    setNewReturn(new Date(booking.returnDate).toISOString().split('T')[0]);
    setShowReschedule(true);
  };

  const handleRescheduleSubmit = async () => {
    if(!newPickup ||!newReturn){
      toast.error('Please select both dates');
      return;
    }
    if(new Date(newReturn) <= new Date(newPickup)){
      toast.error('Return date must be after pickup');
      return;
    }
    setRescheduling(true);
    try{
      const token = localStorage.getItem('token');
      console.log("Rescheduling:", selectedBooking._id, newPickup, newReturn);
      const res = await axios.put(`${API_URL}/bookings/${selectedBooking._id}/reschedule`, {
        pickupDate: newPickup,
        returnDate: newReturn,
        startDate: newPickup,
        endDate: newReturn
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Booking Rescheduled! 📅');
      setBookings(prev => prev.map(b => b._id === selectedBooking._id? res.data.booking : b));
      setShowReschedule(false);
      // Optional: reload to confirm
      fetchBookings();
    }catch(err){
      console.log("Reschedule error full:", err.response?.data);
      toast.error(err.response?.data?.message || 'Reschedule failed');
    }finally{
      setRescheduling(false);
    }
  };

  if (loading) return <div className="loading-shimmer">Loading bookings...</div>;

  // ===== FIXED LOGIC =====
  const getStatus = (b) => (b.status || '').toUpperCase();

  const isCancelled = (b) => {
    const s = getStatus(b);
    return s === 'CANCELLED' || s === 'CANCELED';
  }
  const isCompletedByDate = (b) => {
    if(isCancelled(b)) return false;
    const returnDate = new Date(b.returnDate || b.endDate);
    return returnDate < new Date();
  }

  const filtered = bookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return!isCancelled(b) &&!isCompletedByDate(b);
    if (filter === 'Completed') return!isCancelled(b) && isCompletedByDate(b);
    if (filter === 'Cancelled') return isCancelled(b);
    return true;
  });

  const counts = {
    All: bookings.length,
    Upcoming: bookings.filter(b =>!isCancelled(b) &&!isCompletedByDate(b)).length,
    Completed: bookings.filter(b =>!isCancelled(b) && isCompletedByDate(b)).length,
    Cancelled: bookings.filter(b => isCancelled(b)).length,
  };

  return (
    <div className="mybooking-wrapper blue-bg">
      <div className="blue-blob blob1"></div>
      <div className="blue-blob blob2"></div>

      <div className="mybooking-hero">
        <div>
          <h1>My Bookings ({bookings.length})</h1>
          <p>Upcoming, completed & cancelled rides • BONUS: PDF Receipt</p>
        </div>
        <div className="hero-stats">
          <div><b>{counts.All}</b><span>Total</span></div>
          <div><b>{counts.Upcoming}</b><span>Active</span></div>
          <div className="active-stat"><b>{counts.Completed}</b><span>Done</span></div>
        </div>
      </div>

      <div className="tabs">
        {['All','Upcoming','Completed','Cancelled'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={filter===f?'active':''}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {filtered.length===0? (
        <div className="empty-card">
          <div className="empty-icon">🚗</div>
          <h2>No {filter} bookings</h2>
          <p>Book a vehicle to see it here. Your booking history will appear here.</p>
          <Link to="/" className="cta-btn">Browse Vehicles</Link>
        </div>
      ) : (
        <div className="booking-list">
          {filtered.map(b => {
            const statusUpper = getStatus(b);
            const completed = isCompletedByDate(b);
            const displayStatus = isCancelled(b)? 'CANCELLED' : completed? 'COMPLETED' : statusUpper || 'CONFIRMED';

            return (
            <div key={b._id} className="b-card">
              <div className="b-left">
                <img src={b.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400'} alt="" />
                <span className={`b-status ${displayStatus}`}>{displayStatus}</span>
              </div>

              <div className="b-middle">
                <div className="b-top">
                  <h3>{b.vehicle?.brand} {b.vehicle?.name}</h3>
                  <span className="b-number">{b.bookingNumber || 'VR-' + b._id.slice(-8).toUpperCase()}</span>
                </div>
                <p className="b-sub">{new Date(b.pickupDate).toDateString()} → {new Date(b.returnDate).toDateString()} • {b.rentalDays || 2} Days</p>

                <div className="b-grid">
                  <div><label>Pickup</label><b>{new Date(b.pickupDate).toLocaleDateString()}</b></div>
                  <div><label>Return</label><b>{new Date(b.returnDate).toLocaleDateString()}</b></div>
                  <div><label>Price/Day</label><b>₹{b.pricePerDay || b.vehicle?.pricePerDay}</b></div>
                  <div><label>Total Paid</label><b className="price">₹{b.totalAmount?.toLocaleString()}</b></div>
                </div>

                <div className="b-meta">
                  <span>📍 {b.vehicle?.location}</span>
                  <span>⏱ {b.rentalDays || 2} Days</span>
                  <span>💳 {displayStatus}</span>
                </div>
              </div>

              <div className="b-right">
                <button onClick={()=>downloadReceipt(b)} className="btn-pdf">📄 PDF Receipt</button>
                <Link to={`/booking/${b._id}`} className="btn-view">View Details</Link>
                {!isCancelled(b) &&!completed? (
                  <>
                    <button onClick={()=>handleRescheduleClick(b)} className="btn-reschedule" style={{background:'#2563eb', color:'#fff', padding:'8px 14px', borderRadius:'999px', fontWeight:'800', fontSize:'12px', border:'none', cursor:'pointer'}}>📅 Reschedule</button>
                    <button onClick={()=>handleCancel(b._id)} className="btn-cancel">Cancel Booking</button>
                  </>
                ) : (
                  <div className="btn-disabled">{displayStatus}</div>
                )}
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* RESCHEDULE MODAL - NEW */}
      {showReschedule && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999, padding:'16px'}}>
          <div style={{background:'#fff', borderRadius:'16px', padding:'20px', width:'100%', maxWidth:'380px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <h3 style={{fontWeight:900, fontSize:'16px', marginBottom:'4px'}}>Reschedule Booking</h3>
            <p style={{fontSize:'12px', color:'#64748b', marginBottom:'14px'}}>{selectedBooking?.vehicle?.brand} {selectedBooking?.vehicle?.name} - {selectedBooking?.bookingNumber}</p>

            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <div>
                <label style={{fontSize:'10px', fontWeight:800, color:'#475569'}}>NEW PICKUP DATE *</label>
                <input type="date" value={newPickup} onChange={e=>setNewPickup(e.target.value)} style={{width:'100%', marginTop:'4px', padding:'9px 10px', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'13px', fontWeight:600}} />
              </div>
              <div>
                <label style={{fontSize:'10px', fontWeight:800, color:'#475569'}}>NEW RETURN DATE *</label>
                <input type="date" value={newReturn} onChange={e=>setNewReturn(e.target.value)} style={{width:'100%', marginTop:'4px', padding:'9px 10px', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'13px', fontWeight:600}} />
              </div>
            </div>

            <div style={{display:'flex', gap:'8px', marginTop:'16px', justifyContent:'flex-end'}}>
              <button onClick={()=>setShowReschedule(false)} style={{padding:'8px 18px', borderRadius:'999px', border:'1.5px solid #e2e8f0', background:'#fff', fontWeight:700, fontSize:'12px', cursor:'pointer'}}>Cancel</button>
              <button onClick={handleRescheduleSubmit} disabled={rescheduling} style={{padding:'8px 18px', borderRadius:'999px', border:'none', background:'#2563eb', color:'#fff', fontWeight:800, fontSize:'12px', cursor:'pointer'}}>
                {rescheduling? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;