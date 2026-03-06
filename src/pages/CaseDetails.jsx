import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Activity, FileText, CheckCircle2, FlaskConical, Building, Calendar, Phone, Fingerprint, ShieldCheck } from 'lucide-react';
import { casesApi } from '../api/api';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = `AutoAuth | Case ${id}`;
    
    const fetchCase = async () => {
      try {
        const data = await casesApi.fetchCaseById(id);
        setCaseData(data);
      } catch (err) {
        console.error("Error fetching case:", err);
        setError("Failed to load case data. It might not exist or you don't have permission.");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#38A3A5]/20 border-t-[#38A3A5] rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Decrypting Payload...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
          <FileText size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Notice: {error}</h2>
        <button onClick={() => navigate('/dashboard')} className="mt-6 btn-primary px-8 h-12">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Premium Background Decor */}
      <div className="absolute top-0 right-0 w-[40%] h-[70%] bg-gradient-to-bl from-[#38A3A5]/10 to-transparent rounded-bl-full opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[40%] h-[50%] bg-gradient-to-br from-[#2D8284]/10 to-transparent rounded-br-full opacity-50 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col min-h-[calc(100vh-80px)]">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-11 h-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50/80 transition-all"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Case Profile
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[11px] font-bold text-[#38A3A5] uppercase tracking-widest">{caseData.case_id}</p>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Priority: {caseData.priority}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">{caseData.status.replace('_', ' ')}</span>
            </div>
          </div>
        </header>

        {/* Content Modules */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 flex-1">
          
          {/* Column 1: Patient & Insurance */}
          <div className="space-y-6 sm:space-y-8">
            {/* Patient Meta */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:border-[#38A3A5]/30 transition-colors">
              <div className="absolute top-0 right-0 p-6 text-[#38A3A5]/10 group-hover:text-[#38A3A5]/20 transition-colors pointer-events-none">
                <User size={80} strokeWidth={1} className="translate-x-4 -translate-y-4" />
              </div>
              
              <div className="mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                  <Fingerprint size={24} strokeWidth={2} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{caseData.patient_name || 'Patient Name Not Set'}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">MRN: {caseData.patient_id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12}/> DOB</span>
                  <p className="text-sm font-semibold text-slate-700">{caseData.date_of_birth || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12}/> Gender</span>
                  <p className="text-sm font-semibold text-slate-700">{caseData.gender || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Insurance Info */}
            <div className="bg-[#38A3A5] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-[#38A3A5]/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay opacity-10 blur-xl pointer-events-none -translate-y-8 translate-x-8" />
              
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>{caseData.insurance_company}</h3>
                  <p className="text-[11px] font-medium text-white/70 uppercase tracking-widest mt-1">Primary Network</p>
                </div>
                <ShieldCheck size={28} className="text-white/80" strokeWidth={1.5} />
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest mb-1">Plan Name</p>
                  <p className="text-sm font-bold tracking-tight">{caseData.plan_name || 'Standard Plan'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                    <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest mb-1">Group No</p>
                    <p className="text-sm font-bold tracking-tight">{caseData.group_number || 'N/A'}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
                    <p className="text-[10px] text-white/60 font-medium uppercase tracking-widest mb-1">Member ID</p>
                    <p className="text-sm font-bold tracking-tight">{caseData.member_id || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Clinical & Details */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Clinical Overview */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <Activity size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Clinical Blueprint</h3>
              </div>

              <div className="space-y-8">
                {/* Diagnosis */}
                <div className="p-5 bg-slate-50 border border-slate-100/80 rounded-2xl relative">
                  <span className="absolute -top-3 left-4 bg-white px-3 py-0.5 border border-slate-200 rounded-full text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Primary Diagnosis
                  </span>
                  <div className="mt-2 flex items-start gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 flex items-center justify-center rounded-xl flex-shrink-0 text-slate-600 font-bold uppercase tracking-widest text-[10px]">
                      ICD-10
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{caseData.diagnosis || 'Diagnosis Not Documented'}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-bold text-[#38A3A5]">{caseData.icd10_code || 'N/A'}</span>
                         <span className="text-slate-300">•</span>
                         <span className="text-[10px] text-slate-400 font-medium tracking-wide">Dated: {caseData.diagnosis_date || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Procedure */}
                <div className="p-5 bg-slate-50 border border-slate-100/80 rounded-2xl relative">
                  <span className="absolute -top-3 left-4 bg-white px-3 py-0.5 border border-slate-200 rounded-full text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Requested Procedure
                  </span>
                  <div className="mt-2 flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38A3A5]/10 border border-[#38A3A5]/20 flex items-center justify-center rounded-xl flex-shrink-0 text-[#38A3A5] font-bold uppercase tracking-widest text-[10px]">
                      CPT
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{caseData.procedure_name || 'Procedure Not Documented'}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs font-bold text-[#38A3A5]">{caseData.cpt_code || 'N/A'}</span>
                         {caseData.procedure_date && (
                           <>
                             <span className="text-slate-300">•</span>
                             <span className="text-[10px] text-slate-400 font-medium tracking-wide">Target: {caseData.procedure_date}</span>
                           </>
                         )}
                         {caseData.place_of_service && (
                           <>
                             <span className="text-slate-300">•</span>
                             <span className="text-[10px] text-slate-400 font-medium tracking-wide">Facility: {caseData.place_of_service}</span>
                           </>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* Lower Grid: Routing Provider & Lab Data */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-2">
             
             {/* Ordering Physician */}
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                    <Building size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Ordering Entity</h3>
               </div>
               
               <div className="space-y-4 text-sm font-medium text-slate-600">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Physician</span>
                     <span className="font-bold text-slate-800">{caseData.physician_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">NPI Number</span>
                     <span>{caseData.physician_npi || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Specialty</span>
                     <span>{caseData.physician_specialty || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Facility</span>
                     <span>{caseData.facility_name || 'N/A'}</span>
                  </div>
               </div>
             </div>

             {/* Diagnostics / Labs */}
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                      <FlaskConical size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Diagnostic Biomarkers</h3>
                 </div>
                 <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-widest">EHR Synced</span>
               </div>
               
               <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100/80 p-5 overflow-auto max-h-48 scrollbar-hide">
                  {caseData.lab_results && Object.keys(caseData.lab_results).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(caseData.lab_results).map(([testLabel, resultsMap]) => (
                        <div key={testLabel}>
                           <p className="text-[11px] font-extrabold text-[#38A3A5] uppercase tracking-widest mb-2 border-b border-slate-200 pb-1 inline-block">{testLabel}</p>
                           <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                             {Object.entries(resultsMap).map(([key, value]) => (
                               <li key={key} className="text-xs flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">{key}</span>
                                  <span className="font-bold text-slate-700">{typeof value === 'object' ? `${value.value} ${value.unit}` : value}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                       <FileText size={24} className="opacity-50" />
                       <p className="text-xs font-bold uppercase tracking-widest">No diagnostics detected</p>
                    </div>
                  )}
               </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CaseDetails;
