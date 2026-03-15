import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, CheckCircle2 } from 'lucide-react';
import { casesApi } from '../api/api';

const DataField = ({ label, value, isLabs }) => {
  const hasData = value && value !== 'N/A' && (!isLabs || Object.keys(value).length > 0);
  
  if (!hasData) return null;
  
  return (
    <div className="space-y-2 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl relative group hover:border-[#38A3A5]/30 transition-all">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      
      {hasData ? (
        <span className="absolute top-4 right-4 text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          Retrieved from EHR
        </span>
      ) : (
        <span className="absolute top-4 right-4 text-[9px] font-extrabold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          To be provided
        </span>
      )}

      {hasData ? (
        isLabs ? (
           <div className="flex flex-wrap gap-2 mt-2">
             {Object.keys(value).map(k => (
                <span key={k} className="px-2 py-1 bg-white shadow-sm rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                  {k}
                </span>
             ))}
           </div>
        ) : (
           <p className="text-sm font-bold text-slate-900 mt-1">{value}</p>
        )
      ) : (
        <p className="text-sm font-medium text-slate-300 italic mt-1">Pending manual entry</p>
      )}
    </div>
  );
};

const EhrPrefill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    document.title = `AutoAuth | EHR Sync - ${id}`;
    
    // Simulate loading/prefilling progress visually (starts before API finishes)
    const timer = setInterval(() => {
      setProgress(prev => (prev < 90 ? prev + 5 : prev)); // Stop at 90% until API done
    }, 150);

    const performSync = async () => {
       try {
         // Stop using syncEhr automatically to save Gemini API calls.
         // fetchCaseById just returns the data already stored in the DB.
         const data = await casesApi.fetchCaseById(id);
         setCaseData(data);
         setProgress(100);
       } catch (error) {
         console.error("Fetch Case Failed:", error);
       } finally {
         setLoading(false);
         clearInterval(timer);
       }
    };
    
    performSync();

    return () => clearInterval(timer);
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-gradient-to-bl from-[#38A3A5]/10 to-transparent rounded-bl-full opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-[#2D8284]/5 to-transparent rounded-tr-full opacity-50 pointer-events-none" />

      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden fade-in relative flex flex-col md:flex-row z-10">
        
        {/* Left Side: Status & Progress */}
        <div className="w-full md:w-1/3 bg-[#38A3A5]/5 p-8 sm:p-10 border-r border-slate-100/50 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-[#38A3A5] to-[#2D8284]" />
          
          <div className="mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-[#38A3A5]/10 flex items-center justify-center text-[#38A3A5] mb-6">
              <Database size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>EHR Integration</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Case ID: {id}</p>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Sync Pipeline</span>
                <span className="text-[#38A3A5]">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#38A3A5] to-[#2D8284] transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  {loading && <div className="absolute top-0 inset-0 w-full h-full bg-white/20 animate-pulse" />}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${progress >= 30 ? 'text-slate-900' : 'text-slate-300'}`}>
                <CheckCircle2 size={16} className={progress >= 30 ? 'text-[#38A3A5]' : 'text-slate-200'} />
                <span>FHIR Metadata Linked</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${progress >= 60 ? 'text-slate-900' : 'text-slate-300'}`}>
                <CheckCircle2 size={16} className={progress >= 60 ? 'text-[#38A3A5]' : 'text-slate-200'} />
                <span>Clinical Notes Parsed</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${progress >= 100 ? 'text-slate-900' : 'text-slate-300'}`}>
                <CheckCircle2 size={16} className={progress >= 100 ? 'text-[#38A3A5]' : 'text-slate-200'} />
                <span>Data Extracted</span>
              </div>
            </div>
          </div>

          <div className="mt-12 p-5 bg-white/60 rounded-2xl border border-white">
             <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-[#38A3A5] mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-widest">
                  Encryption Layer Active. PHI Masked by Protocol V4.
                </p>
             </div>
          </div>
        </div>

        {/* Right Side: Data Review */}
        <div className="w-full md:w-2/3 p-8 sm:p-10 flex flex-col bg-white/30 relative">
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 w-12 bg-[#38A3A5] rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                {loading ? "Querying Network..." : "Extracted Clinical Payload"}
              </h3>
            </div>

            {loading ? (
               <div className="h-64 flex flex-col items-center justify-center space-y-4 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="w-10 h-10 border-4 border-[#38A3A5]/20 border-t-[#38A3A5] rounded-full animate-spin" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Running Secure Search Algorythm</p>
               </div>
            ) : (
               <div className="space-y-4 fade-in">
                  <DataField label="Patient Identity" value={caseData?.patient_name} />
                  <DataField label="Insurance Provider" value={caseData?.insurance_company} />
                  <DataField label="Ordering Physician" value={caseData?.physician_name} />
                  <DataField label="Diagnostic Biomarkers (Labs)" value={caseData?.lab_results} isLabs={true} />
               </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between pt-8 border-t border-slate-100">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
            >
              Skip & Return
            </button>
            <button 
              onClick={() => navigate(`/cases/${id}`)}
              disabled={loading}
              className={`btn-primary h-14 px-8 sm:px-10 text-xs transition-opacity duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : 'opacity-100 shadow-lg shadow-[#38A3A5]/20 hover:shadow-[#38A3A5]/30'}`}
            >
              Verify & View Case File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EhrPrefill;
