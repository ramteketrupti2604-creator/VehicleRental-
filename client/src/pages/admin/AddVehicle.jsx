import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AddVehicle.css';

const AddVehicle = () => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: '',
    category: '',
    pricePerDay: '',
    location: '',
    description: '',
    registrationNumber: '',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: '',
    features: '',
    status: 'AVAILABLE'
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/categories');
        setCategories(Array.isArray(data)? data : data.categories || []);
      } catch (err) {
        toast.error('Failed to fetch categories');
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const featuresArray = formData.features? formData.features.split(',').map(f => f.trim()) : [];
      const finalName = formData.name || `${formData.brand} ${formData.model}`.trim();
      const payload = {
      ...formData,
        name: finalName,
        features: featuresArray,
        images: image? [image] : [],
        year: Number(formData.year),
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats)
      };
      await axios.post('http://localhost:5000/api/vehicles', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vehicle Added Successfully!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add vehicle');
    }
    setLoading(false);
  }

  return (
    <div className="add-vehicle-wrapper">
      <div className="add-vehicle-card">
        <div className="card-header">
          <h1>Add New Vehicle</h1>
          <p>Add a new vehicle to your rental fleet with premium details</p>
        </div>

        <form onSubmit={handleSubmit} className="form-body">
          <div className="form-grid">
            <div className="input-group">
              <label>Brand *</label>
              <input name="brand" placeholder="e.g. Maruti" value={formData.brand} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Model Name *</label>
              <input name="name" placeholder="e.g. Swift" value={formData.name} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Variant *</label>
              <input name="model" placeholder="e.g. VXI" value={formData.model} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Year *</label>
              <input name="year" type="number" placeholder="2024" value={formData.year} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Registration No. *</label>
              <input name="registrationNumber" placeholder="MH12AB1234" value={formData.registrationNumber} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Price Per Day ₹ *</label>
              <input name="pricePerDay" type="number" placeholder="2500" value={formData.pricePerDay} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Seats *</label>
              <input name="seats" type="number" placeholder="5" value={formData.seats} onChange={handleChange} required/>
            </div>
            <div className="input-group">
              <label>Location *</label>
              <input name="location" placeholder="Aurangabad" value={formData.location} onChange={handleChange} required/>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="input-group">
              <label>Fuel Type</label>
              <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div className="input-group">
              <label>Transmission</label>
              <select name="transmission" value={formData.transmission} onChange={handleChange}>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div className="input-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="UNAVAILABLE">UNAVAILABLE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>

          <div className="input-group full-width" style={{marginTop:'18px'}}>
            <label>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {Array.isArray(categories) && categories.length > 0? (
                categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))
              ) : (
                <option disabled>No Categories Found</option>
              )}
            </select>
          </div>

          <div className="input-group full-width">
            <label>Image URL</label>
            <input placeholder="https://images.unsplash.com/..." value={image} onChange={e => setImage(e.target.value)}/>
          </div>

          <div className="input-group full-width">
            <label>Features - comma separated</label>
            <input name="features" placeholder="AC, GPS, Music System, Airbags" value={formData.features} onChange={handleChange}/>
          </div>

          <div className="input-group full-width">
            <label>Description</label>
            <textarea name="description" placeholder="Vehicle description, comfort, mileage..." value={formData.description} onChange={handleChange} rows="3"></textarea>
          </div>

          <button disabled={loading} className="btn-submit">
            {loading? 'Adding Vehicle...' : '🚀 Add Vehicle to Fleet'}
          </button>
        </form>
      </div>
    </div>
  )
}
export default AddVehicle;