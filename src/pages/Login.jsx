import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, Shield, CheckCircle2 } from 'lucide-react';
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

      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50/50 relative">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="w-full max-w-[420px] fade-in relative z-10">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] p-10 sm:p-14 overflow-hidden relative">
          {/* Subtle Accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#38A3A5]/10" />
          
          <div className="flex flex-col items-center">
            {/* Minimalist Branding inside Box */}
            <div className="flex flex-col items-center mb-10 text-center">
              <Logo className="h-9 sm:h-11 mb-5" textClassName="text-3xl sm:text-[2.25rem]" />
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-none mb-2">
                Prior Authorization Automation
              </h2>
            </div>

            <div className="w-full space-y-8">
              <div className="text-center">
                <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>Welcome Back</h1>
                <p className="text-slate-400 text-xs mt-2 font-medium tracking-tight">Sign in to manage active clinical cases</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38A3A5] transition-all">
                      <Mail size={16} strokeWidth={2.5} />
                    </div>
                    <input
                      type="email"
                      className="w-full h-12 bg-slate-50 border border-slate-100/80 rounded-xl pl-11 text-sm font-semibold text-slate-700 placeholder:text-slate-400/60 focus:outline-none focus:border-[#38A3A5]/40 focus:bg-white shadow-sm transition-all"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#38A3A5] transition-all">
                      <Lock size={16} strokeWidth={2.5} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full h-12 bg-slate-50 border border-slate-100/80 rounded-xl pl-11 pr-12 text-sm font-semibold text-slate-700 placeholder:text-slate-400/60 focus:outline-none focus:border-[#38A3A5]/40 focus:bg-white shadow-sm transition-all"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-200 hover:text-[#38A3A5] transition-colors"
                    >
                      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#38A3A5] hover:bg-[#2D8284] text-white rounded-xl text-[13px] font-bold uppercase tracking-widest shadow-lg shadow-[#38A3A5]/10 hover:shadow-[#38A3A5]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <LogIn size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <div className="text-center">
                    <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-[11px] font-bold text-rose-500 text-center py-2.5 bg-rose-50/50 rounded-xl border border-rose-100/40 fade-in">
                    {error}
                  </div>
                )}

                <div className="py-2 flex items-center gap-4">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[8px] font-bold text-slate-200 uppercase tracking-[0.4em]">Integrated Secure Node</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="relative group cursor-not-allowed">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#38A3A5] opacity-50">
                      <Shield size={16} />
                   </div>
                   <div className="w-full h-12 rounded-xl border border-[#38A3A5]/10 bg-slate-50/50 flex items-center pl-11 pr-4 shadow-sm group-hover:bg-slate-50 transition-colors">
                      <span className="text-xs font-bold text-slate-500">SMART on <span className="text-[#38A3A5]/80">FHIR</span> Login</span>
                      <div className="ml-auto px-2 py-0.5 rounded-lg bg-white/80 border border-slate-100 shadow-sm">
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Locked</span>
                      </div>
                   </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-14 text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] opacity-80 text-center leading-loose">
           Protected by AutoAuth Security Gateway v4.2.0 • HIPAA Complient Infrastructure
        </div>
      </div>
    </div>
  );
};

export default Login;
