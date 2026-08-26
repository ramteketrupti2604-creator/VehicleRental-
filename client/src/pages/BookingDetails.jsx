import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingDetails.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const getName = (f) => {
    if (!f) return '';
    if (typeof f === 'object') return f.name || f.title || f.city || '';
    return f;
  };

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(data.booking || data.data || data);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    fetchOne();
  }, [id]);

  if (loading) return <div className="bd-wrapper"><div className="bd-loading">Loading...</div></div>;
  if (!booking) return <div className="bd-wrapper"><div className="bd-empty"><h2>Booking not found</h2><Link to="/mybookings">Back to My Bookings</Link></div></div>;

  const v = booking.vehicle || {};
  const vehicleName = v.name || getName(v) || 'Vehicle';
  const imageUrl = v.images?.[0]?.url || v.images?.[0] || v.image || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800';
  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="bd-wrapper">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="bd-card">
        {/* Top Success Header */}
        <div className="bd-success-header">
          <div className="check-circle">✓</div>
          <h1>Booking Confirmed</h1>
          <p className="booking-id">{booking.bookingNumber || `VR-${booking._id.slice(-8).toUpperCase()}`}</p>
          <span className={`status-badge ${booking.status}`}>{booking.status}</span>
        </div>

        {/* Main Content */}
        <div className="bd-body">
          <div className="bd-left">
            <img src={imageUrl} alt={vehicleName} onError={(e) => e.target.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800'} />
            <div className="vehicle-info">
              <h2>{vehicleName}</h2>
              <p>{getName(v.brand)} • {v.model} • {v.year} • {getName(v.category)}</p>
              <div className="tags">
                <span>👥 {v.seats || 5} Seats</span>
                <span>⛽ {getName(v.fuelType) || 'Petrol'}</span>
                <span>⚙️ {getName(v.transmission) || 'Manual'}</span>
                <span>📍 {getName(v.location) || 'Nagpur'}</span>
              </div>
            </div>
          </div>

          <div className="bd-right">
            <h3>Booking Summary</h3>
            <div className="summary-list">
              <div className="row"><span>Pickup Date</span><b>{formatDate(booking.pickupDate)}</b></div>
              <div className="row"><span>Return Date</span><b>{formatDate(booking.returnDate)}</b></div>
              <div className="row"><span>Rental Days</span><b>{booking.rentalDays} Days</b></div>
              <div className="row"><span>Price / Day</span><b>₹{Number(booking.pricePerDay).toLocaleString('en-IN')}</b></div>
              <div className="divider"></div>
              <div className="row total"><span>Total Amount</span><b>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</b></div>
              <div className="row"><span>Payment Status</span><b className="pay-badge">{booking.paymentStatus || 'PENDING'}</b></div>
              <div className="row"><span>Customer</span><b>{booking.user?.name || booking.user?.email || 'You'}</b></div>
              <div className="row"><span>Booking Date</span><b>{formatDate(booking.createdAt)}</b></div>
            </div>

            <div className="note-box">
              <b>📌 Important:</b> Carry Driving License at pickup. Cancel free before 24hrs of pickup.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bd-actions">
          <Link to="/mybookings" className="btn-dark">Back to My Bookings</Link>
          <Link to="/" className="btn-light">Browse More Cars →</Link>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;