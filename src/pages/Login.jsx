import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const [activeRole, setActiveRole] = useState('school_admin'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: activeRole,
          registration_no: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && (data.status === 'success' || response.status === 200)) {
        const tokenString = data.token || data.data?.token || '';

        if (tokenString) {
          localStorage.setItem('token', tokenString);
          localStorage.setItem('jwt', tokenString);
        }

        const userPayload = {
          ...(data.data || {}),
          token: tokenString,
          role: data.data?.role || activeRole,
        };

        if (login) {
          login(userPayload);
        }

        // Direct Routing based on response role
        const userRole = data.data?.role || activeRole;
        
        if (userRole === 'super_admin') {
          navigate('/super-admin/dashboard');
        } else if (userRole === 'teacher') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/academic-dashboard');
        }
      } else {
        setError(data.message || 'Invalid credentials provided.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Light Ambient Glow background effect matching Home layout */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200/80 w-full max-w-md space-y-6">
        
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition duration-200"
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-1 border border-emerald-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Login to E-Taaluma</h2>
          <p className="text-slate-500 text-xs md:text-sm">Select your role and enter credentials to continue</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => { setActiveRole('school_admin'); setError(''); }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition duration-200 cursor-pointer text-xs md:text-sm ${
              activeRole === 'school_admin'
                ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-lg mb-0.5">🏫</span>
            <span>School</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('teacher'); setError(''); }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition duration-200 cursor-pointer text-xs md:text-sm ${
              activeRole === 'teacher'
                ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-lg mb-0.5">🧑‍🏫</span>
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('super_admin'); setError(''); }}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition duration-200 cursor-pointer text-xs md:text-sm ${
              activeRole === 'super_admin'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-lg mb-0.5">🥷</span>
            <span>Super Admin</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-xs p-3 rounded-xl border border-rose-200 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Username / Registration No
            </label>
            <input
              type="text"
              required
              placeholder={
                activeRole === 'school_admin'
                  ? 'Enter school registration number'
                  : activeRole === 'teacher'
                  ? 'Enter teacher registration number'
                  : 'Enter super admin username'
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm bg-slate-50/50 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-sm bg-slate-50/50 placeholder:text-slate-400 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 rounded-xl transition shadow-lg disabled:opacity-50 cursor-pointer text-sm mt-2 ${
              activeRole === 'super_admin' 
                ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20' 
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 font-medium pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-bold hover:underline">
            Register School
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;