import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, FileText, Database, LogOut, Settings, CheckCircle, XCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { casesApi } from '../api/api';

const CasesData = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (!storedUser || storedUser === 'undefined' || !storedToken) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Failed to parse user session data:", err);
      navigate('/login');
      return;
    }

    document.title = "AutoAuth | Cases Data";
    const loadData = async () => {
      try {
        const data = await casesApi.fetchCases();
        setCases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const successfulCases = cases.filter(c => c.status === 'APPROVED');
  const failedCases = cases.filter(c => ['DENIED', 'GAP_ANALYSIS_FAILED', 'NOT_ELIGIBLE'].includes(c.status));

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-slate-600 font-sans relative overflow-hidden">
      {/* Sidebar copied from Dashboard but Active on Cases Data */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col fixed inset-y-0 z-20 overflow-y-auto scrollbar-hide">
        <div className="p-10 pb-12">
          <Logo onClick={() => navigate('/dashboard')} className="h-10 transform hover:scale-105 transition-transform cursor-pointer" textClassName="text-2xl" />
        </div>

        <nav className="flex-1 px-4 space-y-1.5 focus:outline-none">
          <div className="sidebar-link group cursor-pointer hover:bg-slate-50" onClick={() => navigate('/dashboard')}>
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Dashboard</span>
          </div>
          <div className="sidebar-link sidebar-link-active group cursor-pointer">
            <Activity size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Cases Data</span>
          </div>
          <div className="sidebar-link group cursor-pointer hover:bg-slate-50">
            <FileText size={20} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Case Reports</span>
          </div>
          <div className="sidebar-link group cursor-pointer hover:bg-slate-50">
            <Database size={20} className="group-hover:scale-110 transition-transform" />
            <span>EHR Integration</span>
          </div>

          <div className="mt-12 px-2 pt-8 border-t border-slate-50 opacity-40">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">AutoAuth v1.0</p>
          </div>
        </nav>

        <div className="p-8 border-t border-slate-50">
          <div className="bg-slate-50/50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#38A3A5] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#38A3A5]/20">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Provider</p>
                <p className="text-sm font-bold text-slate-900 leading-tight truncate">{user?.name || 'Dr. Administrator'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-3 py-3 rounded-xl border border-rose-100 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest whitespace-nowrap"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0 bg-[#FDFDFD]">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center sticky top-0 z-10 w-full">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-6 lg:px-12">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>Cases Data Analytics</h1>
            </div>

            <div className="flex items-center gap-4 lg:gap-6 ml-4">
              <button className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#38A3A5] hover:bg-slate-50 transition-all flex-shrink-0">
                <Settings size={22} />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
          <section className="p-6 lg:p-12 space-y-8 lg:space-y-10 fade-in flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 text-slate-400 py-32">
                <div className="w-10 h-10 border-4 border-[#38A3A5]/10 border-t-[#38A3A5] rounded-full animate-spin" />
                <p className="font-bold text-xs uppercase tracking-widest">Loading Analytics...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Cases */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-[#38A3A5]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                        <Activity size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total</span>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-slate-900">{cases.length}</h3>
                      <p className="text-sm font-semibold text-slate-500 mt-1">Total Cases Tracked</p>
                    </div>
                  </div>

                  {/* Successful Cases */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <CheckCircle size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Success</span>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-emerald-600">{successfulCases.length}</h3>
                      <p className="text-sm font-semibold text-slate-500 mt-1">Approved Cases</p>
                    </div>
                  </div>

                  {/* Failed Cases */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-rose-500/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                        <XCircle size={24} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Failed</span>
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-rose-600">{failedCases.length}</h3>
                      <p className="text-sm font-semibold text-slate-500 mt-1">Denied Cases</p>
                    </div>
                  </div>
                </div>

                {/* Additional Insights / List */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Recent Status Overview</h2>
                  <div className="space-y-4">
                    {cases.slice(0, 10).map(c => {
                      const isSuccess = c.status === 'APPROVED';
                      const isFailed = ['DENIED', 'GAP_ANALYSIS_FAILED', 'NOT_ELIGIBLE'].includes(c.status);
                      const statusColor = isSuccess ? 'text-emerald-500 bg-emerald-50' : (isFailed ? 'text-rose-500 bg-rose-50' : 'text-amber-500 bg-amber-50');
                      const Icon = isSuccess ? CheckCircle : (isFailed ? XCircle : Activity);
                      return (
                        <div key={c.case_id} onClick={() => navigate(`/cases/${c.case_id}`)} className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusColor}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{c.patient_name || 'Unknown Patient'}</p>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.case_id}</p>
                            </div>
                          </div>
                          <div className={`self-start sm:self-auto px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${statusColor.replace('bg-', 'border-').replace('50', '200')}`}>
                            {c.status.replace(/_/g, ' ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </section>

          <footer className="py-8 px-6 lg:px-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase bg-white/50 backdrop-blur-sm mt-auto">
            <p className="text-center sm:text-left">© 2026 AutoAuth Technologies</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default CasesData;
