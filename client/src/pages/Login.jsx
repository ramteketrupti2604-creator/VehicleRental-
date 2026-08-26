import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      const role = user?.role || user?.user?.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1931] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1080px] h-auto md:h-[68vh] bg-white rounded-[24px] shadow-[0_20px_80px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row">
        {/* LEFT IMAGE */}
        <div className="relative w-full md:w-[52%] h-[280px] md:h-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1200"
            alt="Driving"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10"></div>
          <div className="absolute inset-0 bg-blue-900/20"></div>
          <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-end">
            <h1 className="text-[38px] md:text-[54px] font-black leading-[0.9] tracking-tighter text-white">
              Drive Your<br/>Dreams<br/><span className="text-sky-300">Today.</span>
            </h1>
            <p className="text-white/70 text-[13px] mt-4 max-w-[300px] leading-relaxed">
              Choose from 100+ premium vehicles. Instant booking, best prices.
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-[48%] bg-white flex items-center justify-center p-7 md:p-12">
          <div className="w-full max-w-[320px]">
            <h2 className="text-[24px] font-bold text-slate-900">Welcome back</h2>
            <p className="text-[13px] text-slate-500 mt-1">Please enter your details to sign in</p>

            <form onSubmit={submitHandler} className="mt-8 space-y-4">
              {error && <div className="bg-red-50 border border-red-100 text-red-600 px-3 py-2.5 rounded-xl text-[12px] font-medium">{error}</div>}
              <div>
                <label className="text-[11px] font-bold tracking-wide text-slate-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 w-full bg-[#f6f7f9] border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-[#0a1931] focus:ring-4 focus:ring-[#0a1931]/10 transition" required />
              </div>
              <div>
                <label className="text-[11px] font-bold tracking-wide text-slate-700">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 w-full bg-[#f6f7f9] border border-slate-200 rounded-xl px-4 py-3.5 text-[14px] outline-none focus:border-[#0a1931] focus:ring-4 focus:ring-[#0a1931]/10 transition" required />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#0a1931] text-white rounded-full py-3.5 font-bold text-[13px] hover:bg-black transition disabled:opacity-60 mt-2 shadow-lg">
                {loading? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-center text-[13px] text-slate-500 pt-2">
                Don't have an account? <Link to="/register" className="font-bold text-[#0a1931]">Sign up</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;