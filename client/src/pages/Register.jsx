import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => { setFormData({...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password!== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await API.post('/auth/register', { name: formData.name, email: formData.email, phone: formData.phone, password: formData.password });
      toast.success("Account created successfully!");
      navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0a1931] flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-[860px] h-[88vh] md:h-[78vh] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="relative w-full md:w-[46%] h-[200px] md:h-full shrink-0 overflow-hidden bg-[#0a1931]">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop" alt="Luxury Car" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1931]/90 via-[#0a1931]/50 to-blue-900/20"></div>
          <div className="relative z-10 p-6 md:p-7 h-full flex flex-col justify-end text-white">
            <h1 className="text-[30px] md:text-[40px] font-black leading-[0.9] tracking-tighter">Join &<br/>Start Your<br/><span className="text-sky-300">Journey.</span></h1>
            <p className="text-blue-100/70 text-[11px] mt-3 max-w-[240px] leading-relaxed">Rent premium cars in 2 minutes. Trusted by 10,000+ customers.</p>
            <div className="flex gap-2 mt-4">
              <span className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold">✓ No Deposit</span>
              <span className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold">✓ Instant Booking</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-[54%] bg-white flex items-center justify-center p-5 md:p-7 overflow-hidden">
          <div className="w-full max-w-[300px]">
            <div className="w-10 h-10 bg-[#0a1931] rounded-xl flex items-center justify-center"><span className="text-white">🚗</span></div>
            <h2 className="text-[19px] font-black text-slate-900 mt-3 tracking-tight">Create Account</h2>
            <p className="text-[11px] text-slate-500">Join us and rent your dream ride</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
              <div className="relative"><User className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-[#f6f7f9] border border-slate-200 rounded-xl text-[12px] outline-none focus:border-[#0a1931] focus:bg-white transition" /></div>
              <div className="relative"><Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-[#f6f7f9] border border-slate-200 rounded-xl text-[12px] outline-none focus:border-[#0a1931] focus:bg-white transition" /></div>
              <div className="relative"><Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-[#f6f7f9] border border-slate-200 rounded-xl text-[12px] outline-none focus:border-[#0a1931] focus:bg-white transition" /></div>
              <div className="relative"><Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-[#f6f7f9] border border-slate-200 rounded-xl text-[12px] outline-none focus:border-[#0a1931] focus:bg-white transition" /></div>
              <div className="relative"><Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-10 pr-3 py-2.5 bg-[#f6f7f9] border border-slate-200 rounded-xl text-[12px] outline-none focus:border-[#0a1931] focus:bg-white transition" /></div>
              <button type="submit" disabled={loading} className="w-full bg-[#0a1931] text-white py-3 rounded-full font-black text-[11px] tracking-widest mt-1 hover:bg-black transition disabled:opacity-60 shadow-lg">{loading? "CREATING..." : "SIGN UP →"}</button>
            </form>
            <p className="text-center text-[11px] text-slate-500 mt-3">Already have an account? <Link to="/login" className="font-black text-[#0a1931] hover:underline">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}