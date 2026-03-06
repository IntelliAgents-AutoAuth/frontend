import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';
import { authApi } from '../api/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AutoAuth | Secure Gateway";
  }, []);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('A valid clinical email is required.');
      return false;
    }
    if (password.length < 4) {
      setError('Security protocol requires at least 4 characters.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      
      if (!response.user) {
        throw new Error('Authentication response was incomplete.');
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden font-sans">
      {/* Premium Background Decor */}
      <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-gradient-to-bl from-[#38A3A5]/20 to-transparent rounded-bl-full opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-[#2D8284]/10 to-transparent rounded-tr-full opacity-50 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#2D8284] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#38A3A5] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none" />

      <div className="w-full max-w-[420px] fade-in relative z-10 flex flex-col items-center">
        
        {/* Branding Outside Box */}
        <div className="flex flex-col items-center mb-8 text-center pt-8">
          <Logo className="h-10 mb-2" textClassName="text-[2.25rem] text-slate-900" />
          <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Prior Authorization Automation
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#38A3A5] to-[#2D8284] opacity-80 mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10 w-full border border-white/60 relative overflow-hidden">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#38A3A5]/40 to-transparent" />

          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#38A3A5] transition-all">
                <Mail size={18} strokeWidth={2.5} />
              </div>
              <input
                type="email"
                className="w-full h-[52px] bg-slate-50 border border-slate-200/60 rounded-xl pl-12 pr-4 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:outline-none focus:border-[#38A3A5]/50 focus:ring-4 focus:ring-[#38A3A5]/10 shadow-sm transition-all"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#38A3A5] transition-all">
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-[52px] bg-slate-50 border border-slate-200/60 rounded-xl pl-12 pr-12 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:outline-none focus:border-[#38A3A5]/50 focus:ring-4 focus:ring-[#38A3A5]/10 shadow-sm transition-all"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#38A3A5] transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {error && (
              <div className="text-[13px] font-bold text-rose-500 text-center py-2.5 bg-rose-50/80 rounded-xl border border-rose-100 fade-in">
                {error}
              </div>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-gradient-to-r from-[#38A3A5] to-[#2D8284] hover:from-[#2D8284] hover:to-[#226668] text-white rounded-xl text-[15px] font-bold shadow-lg shadow-[#38A3A5]/20 hover:shadow-[#38A3A5]/30 hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform ml-1" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button type="button" className="text-xs font-bold text-[#38A3A5] hover:text-[#2D8284] transition-colors uppercase tracking-widest">
                Forgot Password?
              </button>
            </div>

            <div className="py-2 mt-4">
              <div className="flex items-center gap-4 w-[85%] mx-auto opacity-60">
                <div className="flex-1 border-t border-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">OR</span>
                <div className="flex-1 border-t border-slate-300" />
              </div>
            </div>

            <div className="w-full h-[52px] rounded-xl border border-slate-200/60 bg-slate-50/50 flex items-center px-4 cursor-not-allowed group hover:bg-slate-50 transition-colors shadow-sm">
              <Lock size={16} strokeWidth={2.5} className="text-[#38A3A5]/50 mr-3" />
              <span className="text-[13px] font-bold text-slate-500">SMART on <span className="text-[#38A3A5]">FHIR</span> Login</span>
              <div className="ml-auto px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-sm">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Coming Soon</span>
              </div>
            </div>

          </form>
        </div>

        <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center flex items-center justify-center gap-1.5 opacity-60 pb-8">
           © 2026 AutoAuth | Secure & Compliant <Lock size={12} className="mt-[1px]" />
        </div>
      </div>
    </div>
  );
};

export default Login;
