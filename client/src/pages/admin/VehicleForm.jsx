import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createVehicle, getVehicleById, updateVehicle } from '../../services/vehicleService';
import toast from 'react-hot-toast';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', brand: '', model: '', category: 'SUV', registrationNumber: '', year: 2024,
    fuelType: 'Petrol', transmission: 'Manual', seats: 5, pricePerDay: '', location: '',
    description: '', features: '', status: 'AVAILABLE'
  });

  useEffect(() => {
    if(id) getVehicleById(id).then(data => setFormData({...data, features: data.features.join(', ')}));
  }, [id]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {...formData, features: formData.features.split(',').map(f => f.trim())};
    if(id) await updateVehicle(id, payload);
    else await createVehicle(payload);
    toast.success(`Vehicle ${id ? 'Updated' : 'Created'}`);
    navigate('/admin/vehicles');
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-3xl mx-auto grid grid-cols-2 gap-4">
      <h1 className="col-span-2 text-2xl font-bold">{id ? 'Edit' : 'Add'} Vehicle</h1>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="border p-2" required />
      <input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} className="border p-2" required />
      <input name="model" placeholder="Model" value={formData.model} onChange={handleChange} className="border p-2" required />
      <select name="category" value={formData.category} onChange={handleChange} className="border p-2">
        {['Hatchback','Sedan','SUV','MUV','Luxury','Electric'].map(c => <option key={c}>{c}</option>)}
      </select>
      <input name="registrationNumber" placeholder="Reg No" value={formData.registrationNumber} onChange={handleChange} className="border p-2" required />
      <input name="pricePerDay" type="number" placeholder="Price Per Day" value={formData.pricePerDay} onChange={handleChange} className="border p-2" required />
      <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} className="border p-2" required />
      <textarea name="features" placeholder="Features, comma separated" value={formData.features} onChange={handleChange} className="border p-2 col-span-2" />
      <button className="col-span-2 bg-blue-600 text-white py-2 rounded">Save Vehicle</button>
    </form>
  );
};
export default VehicleForm;