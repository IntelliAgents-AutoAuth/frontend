
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, FileText, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

const EhrPrefill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.title = `AutoAuth | EHR Prefill - ${id}`;
    
    // Simulate loading/prefilling progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setLoading(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [id]);

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl glass-card rounded-[2.5rem] border border-white/60 overflow-hidden fade-in relative flex flex-col md:flex-row">
        
        {/* Left Side: Status & Progress */}
        <div className="w-full md:w-1/3 bg-[#38A3A5]/5 p-10 border-r border-slate-100/50 flex flex-col">
          <div className="mb-12">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-[#38A3A5]/10 flex items-center justify-center text-[#38A3A5] mb-6">
              <Database size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>EHR Connector</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Identifier: {id}</p>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Sync Pipeline</span>
                <span className="text-[#38A3A5]">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#38A3A5] to-[#2D8284] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${progress > 20 ? 'text-slate-900' : 'text-slate-300'}`}>
                <CheckCircle2 size={16} className={progress > 20 ? 'text-[#38A3A5]' : 'text-slate-200'} />
                <span>FHIR Metadata Linked</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${progress > 50 ? 'text-slate-900' : 'text-slate-300'}`}>
                <CheckCircle2 size={16} className={progress > 50 ? 'text-[#38A3A5]' : 'text-slate-200'} />
                <span>Clinical Notes Parsed</span>
              </div>
              <div className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${progress > 80 ? 'text-slate-900' : 'text-slate-300'}`}>
                <CheckCircle2 size={16} className={progress > 80 ? 'text-[#38A3A5]' : 'text-slate-200'} />
                <span>ICD-10 Mappings Ready</span>
              </div>
            </div>
          </div>

          <div className="mt-12 p-5 bg-white/40 rounded-2xl border border-white/60">
             <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="text-[#38A3A5] mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-widest">
                  Encryption Layer Active. PHI Masked by Protocol V4.
                </p>
             </div>
          </div>
        </div>

        {/* Right Side: Data Review */}
        <div className="w-full md:w-2/3 p-10 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-1 w-12 bg-[#38A3A5] rounded-full" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Clinical Data Review</h3>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient Identity</p>
                  <p className="text-base font-bold text-slate-900 font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>John D. Smith (MRN-90201)</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insurance Node</p>
                  <p className="text-base font-bold text-slate-900 font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>United Healthcare Platinum</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-[#38A3A5]/20 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#38A3A5] shadow-sm">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pre-filled Clinical Case</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">Cardiac Protocol Analysis v2</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#38A3A5] group-hover:translate-x-1 transition-all" />
              </div>

              <div className="p-6 bg-white border border-slate-100 rounded-3xl space-y-4">
                <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={14} className="text-orange-500" />
                  Manual Review Required
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  The HL7 adapter detected multiple Procedure Codes (75563, 75561). Please verify the preferred authorization node.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-50">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
            >
              Cancel Sync
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className={`btn-primary h-14 px-10 text-xs transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
            >
              Validate & Finalize Submit
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-40 animate-pulse">
         Protocol Enforced • PHI Encrypted Bridge Active
      </div>
    </div>
  );
};

export default EhrPrefill;
