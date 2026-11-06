import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createVehicle, getVehicleById, updateVehicle } from '../../services/vehicleService';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FALLBACK_CATEGORIES = ['Hatchback','Sedan','SUV','MUV','Luxury','Electric'];

const getToken = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo?.token || localStorage.getItem('token');
  } catch {
    return localStorage.getItem('token');
  }
};

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [preview, setPreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', brand: '', model: '', category: 'SUV', registrationNumber: '', year: 2024,
    fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: '', location: '',
    description: '', features: '', status: 'AVAILABLE', images: []
  });

  // Category - Backend se load karo, fail ho toh fallback list rakho
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/categories`, { headers: { Authorization: `Bearer ${token}` } });
        const list = res.data?.categories || res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
          const names = list.map(c => typeof c === 'string' ? c : (c.name || c.title)).filter(Boolean);
          if (names.length > 0) setCategories(names);
        }
      } catch (err) {
        console.log('Category load failed, fallback use kar rahe hai', err);
        setCategories(FALLBACK_CATEGORIES);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if(id) {
      getVehicleById(id).then(data => {
        if(!data) return;
        // Edit me purani image ka preview dikhao
        if (data.images?.[0]) setPreview(data.images[0]);
        if (data.image) setPreview(data.image);
        setFormData({
          name: data.name || '',
          brand: data.brand || '',
          model: data.model || '',
          category: data.category?.name || data.category || 'SUV',
          registrationNumber: data.registrationNumber || '',
          year: data.year || 2024,
          fuelType: data.fuelType || 'Petrol',
          transmission: data.transmission || 'Manual',
          seats: data.seats || 5,
          pricePerDay: data.pricePerDay || '',
          location: data.location || '',
          description: data.description || '',
          features: Array.isArray(data.features) ? data.features.join(', ') : (data.features || ''),
          status: data.status || 'AVAILABLE',
          images: data.images || (data.image ? [data.image] : [])
        });
      }).catch(err => {
        console.log(err);
        toast.error('Vehicle load nahi hua');
      });
    }
  }, [id]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  // Image Upload + Preview - FIX
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setFormData(prev => ({ ...prev, images: [reader.result] }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats),
        year: Number(formData.year),
        images: formData.images?.length > 0 ? formData.images : (preview ? [preview] : []),
        image: preview || formData.images?.[0] || '',
      };
      if(id) await updateVehicle(id, payload);
      else await createVehicle(payload);
      toast.success(`Vehicle ${id ? 'Updated' : 'Created'}`);
      navigate('/admin/vehicles');
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || 'Save failed - backend check karo');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto grid grid-cols-2 gap-4">
      <h1 className="col-span-2 text-2xl font-bold">{id ? 'Edit' : 'Add'} Vehicle</h1>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="border p-2" required />
      <input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} className="border p-2" required />
      <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} className="border p-2" required />
      <select name="category" value={formData.category} onChange={handleChange} className="border p-2">
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input name="registrationNumber" placeholder="Reg No" value={formData.registrationNumber} onChange={handleChange} className="border p-2" required />
      <input name="pricePerDay" type="number" placeholder="Price Per Day" value={formData.pricePerDay} onChange={handleChange} className="border p-2" required />
      <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="border p-2" required />
      <input name="year" type="number" placeholder="Year" value={formData.year} onChange={handleChange} className="border p-2" />
      <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border p-2">
        <option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option><option>Hybrid</option>
      </select>
      <select name="transmission" value={formData.transmission} onChange={handleChange} className="border p-2">
        <option>Manual</option><option>Automatic</option>
      </select>
      <input name="seats" type="number" placeholder="Seats" value={formData.seats} onChange={handleChange} className="border p-2" />
      <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="border p-2 col-span-2" />
      <select name="status" value={formData.status} onChange={handleChange} className="border p-2">
        <option>AVAILABLE</option><option>BOOKED</option><option>MAINTENANCE</option>
      </select>
      <textarea name="features" placeholder="Features, comma separated" value={formData.features} onChange={handleChange} className="border p-2 col-span-2" />

      {/* IMAGE UPLOAD - FIXED */}
      <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
        <p className="font-bold text-[13px] mb-2">Vehicle Image</p>
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-white border p-2 rounded" />
        {preview ? (
          <img src={preview} alt="preview" className="mt-3 w-[200px] h-[130px] object-cover rounded-lg border shadow" />
        ) : (
          <p className="text-[11px] text-gray-400 mt-2">Photo select karte hi yaha preview dikhega</p>
        )}
      </div>

      <button disabled={saving} className="col-span-2 bg-blue-600 text-white py-2 rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save Vehicle'}</button>
    </form>
  );
};
export default VehicleForm;