import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, LayoutDashboard, Database, Activity, User, LogOut, FileText, Settings, ShieldCheck, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';
import { casesApi } from '../api/api';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    // Robust check for missing or invalid user data
    if (!storedUser || storedUser === 'undefined' || !storedToken) {
      console.warn('Authentication data missing or corrupted. Redirecting to login.');
      localStorage.clear();
      navigate('/login');
      return;
    }

    // Check token expiration
    try {
      const payloadBase64 = storedToken.split('.')[1];
      if (payloadBase64) {
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decodedPayload.exp && decodedPayload.exp < currentTime) {
          console.warn('Token has expired. Redirecting to login.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
      }
    } catch (err) {
      console.error('Failed to decode token:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Failed to parse user session data:', err);
      localStorage.clear();
      navigate('/login');
      return;
    }

    document.title = "AutoAuth | Dashboard";
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex text-slate-600 font-sans relative overflow-hidden">
      {/* Premium Sidebar - Fixed width on Desktop, hidden on mobile logic could be added later */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col fixed inset-y-0 z-20 overflow-y-auto scrollbar-hide">
        <div className="p-10 pb-12">
          <Logo onClick={handleLogout} className="h-10 transform hover:scale-105 transition-transform" textClassName="text-2xl" />
        </div>

        <nav className="flex-1 px-4 space-y-1.5 focus:outline-none">
          <div className="sidebar-link sidebar-link-active group cursor-pointer">
            <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Dashboard</span>
          </div>
          <div className="sidebar-link group cursor-pointer hover:bg-slate-50">
            <Activity size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Active Pipeline</span>
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
            className="flex items-center justify-center w-full gap-3 py-3 rounded-xl border border-rose-100 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all uppercase tracking-widest"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen min-w-0 bg-[#FDFDFD]">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center sticky top-0 z-10 w-full">
          <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between px-6 lg:px-12">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4 lg:gap-6 ml-4">
              <button
                 onClick={() => navigate('/new-case')}
                 className="btn-primary h-12 px-5 lg:px-6 rounded-2xl text-xs whitespace-nowrap"
               >
                 <Plus size={18} strokeWidth={3} />
                 <span className="hidden sm:inline">New Case</span>
               </button>
              <div className="h-10 w-px bg-slate-100 hidden md:block" />
              <button className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#38A3A5] hover:bg-slate-50 transition-all flex-shrink-0">
                <Settings size={22} />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
          <section className="p-6 lg:p-12 space-y-8 lg:space-y-10 fade-in flex-1 min-w-0">
            {/* Top Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 bg-[#38A3A5] rounded-full" />
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Prior Auth Cases</h2>
              </div>
            </div>

            {/* Table Area with horizontal scroll support */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100 uppercase tracking-widest text-[10px] font-bold">
                      <th className="px-6 sm:px-10 py-5 w-[180px] sm:w-[220px]">Case Info</th>
                      <th className="px-6 py-5">Patient & Protocol</th>
                      <th className="px-10 py-5 hidden 2xl:table-cell w-[350px]">Procedure Node</th>
                      <th className="px-6 py-5 w-[150px] sm:w-[180px]">Status</th>
                      <th className="px-6 sm:px-10 py-5 text-right pr-6 sm:pr-12 w-[110px] sm:w-[140px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-10 py-24 text-center">
                          <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                            <div className="w-10 h-10 border-4 border-[#38A3A5]/10 border-t-[#38A3A5] rounded-full animate-spin" />
                            <p className="font-bold text-xs uppercase tracking-widest">Loading Cases...</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      cases.map((c) => {
                        const dateString = c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active';
                        
                        // Map status dynamically to colors
                        const statusColors = {
                          "APPROVED": "bg-emerald-50 text-emerald-600 border-emerald-100",
                          "SUBMITTED": "bg-sky-50 text-sky-600 border-sky-100",
                          "PENDING_REVIEW": "bg-amber-50 text-amber-600 border-amber-100",
                          "DRAFT": "bg-slate-50 text-slate-500 border-slate-200",
                          "DENIED": "bg-rose-50 text-rose-600 border-rose-100"
                        };
                        const colorClass = statusColors[c.status] || "bg-slate-50 text-slate-400 border-slate-100";
                        const displayStatus = c.status ? c.status.replace('_', ' ') : 'DRAFT';

                        return (
                        <tr key={c.case_id} className="group hover:bg-slate-50/80 transition-all cursor-pointer border-b border-slate-50 last:border-0" onClick={() => navigate(`/cases/${c.case_id}`)}>
                          <td className="px-6 sm:px-10 py-5 sm:py-7">
                            <div className="flex flex-col gap-1.5">
                              <p className="font-bold text-slate-900 tracking-tight text-sm sm:text-base font-outfit whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>{c.case_id}</p>
                              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap hidden sm:block">{dateString}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5 sm:py-7">
                            <div className="flex flex-col">
                              <p className="font-bold text-slate-800 text-sm h-5 flex items-center mb-2">{c.patient_name || 'Unknown Patient'}</p>
                              <div className="2xl:hidden flex flex-col gap-1">
                                <p className="text-[10px] sm:text-[11px] font-bold text-[#38A3A5] uppercase tracking-wider h-4 flex items-center">{c.procedure_name}</p>
                                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter truncate">CPT: {c.cpt_code} • {c.insurance_company}</p>
                              </div>
                              <p className="text-xs font-medium text-slate-400 hidden 2xl:flex items-center gap-1.5 truncate mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                {c.insurance_company}
                              </p>
                            </div>
                          </td>
                          <td className="px-10 py-5 sm:py-7 hidden 2xl:table-cell">
                            <div className="flex flex-col gap-2">
                              <p className="font-bold text-slate-700 text-sm leading-none h-4 flex items-center">{c.procedure_name}</p>
                              <div className="flex">
                                <span className="bg-slate-50 text-[10px] font-bold text-[#38A3A5] px-2 py-1 rounded-md border border-[#38A3A5]/10 tracking-widest whitespace-nowrap">CODE {c.cpt_code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 sm:py-7">
                            <div className="flex items-center h-full">
                              <span className={`inline-block px-3 sm:px-4 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${colorClass}`}>
                                {displayStatus}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 sm:px-10 py-5 sm:py-7 text-right pr-6 sm:pr-12">
                            <div className="flex justify-end items-center h-full">
                              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-50 rounded-xl text-slate-300 group-hover:bg-[#38A3A5] group-hover:text-white group-hover:shadow-lg group-hover:shadow-[#38A3A5]/20 transition-all flex items-center justify-center">
                                <ChevronRight size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="py-8 px-6 lg:px-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase bg-white/50 backdrop-blur-sm mt-auto">
            <p className="text-center sm:text-left">© 2026 AutoAuth Technologies</p>
            <div className="flex gap-6 lg:gap-10">
              <span className="hover:text-[#38A3A5] transition-colors cursor-pointer">Support</span>
              <span className="hover:text-[#38A3A5] transition-colors cursor-pointer">Privacy</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
