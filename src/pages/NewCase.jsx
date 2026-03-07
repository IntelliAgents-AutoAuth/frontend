
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, XCircle, FileText, UserPlus, FilePlus, ChevronRight } from 'lucide-react';
import { casesApi } from '../api/api';

const NewCase = () => {
  const [patientId, setPatientId] = useState('');
  const [cptCode, setCptCode] = useState('');
  const [insuranceName, setInsuranceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AutoAuth | Initialize Case";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!patientId.trim()) {
      setError('Patient Identifier (MRN) is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await casesApi.createCase({
        patient_id: patientId,
        cpt_code: cptCode || undefined,
        insurance_company: insuranceName || undefined
      });
      navigate(`/cases/${response.case_id}/prefill`);
    } catch (err) {
      setError('An error occurred during case initialization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50 relative overflow-hidden font-sans">
      {/* Premium Background Decor */}
      <div className="absolute top-0 right-0 w-[50%] h-[70%] bg-gradient-to-bl from-[#38A3A5]/10 to-transparent rounded-bl-full opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-[#2D8284]/5 to-transparent rounded-tr-full opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-[#2D8284] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#38A3A5] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 pointer-events-none" />

      <div className="w-full max-w-2xl fade-in relative z-10">

        {/* Top Header outside card */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-[#38A3A5] ml-2">
              <FilePlus size={24} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>Initialize New Case</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Start Prior Authorization</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden">

          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#38A3A5]/40 to-transparent" />

          <div className="px-8 sm:px-12 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.15em]">Case Details</h2>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38A3A5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38A3A5]"></span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">

            <div className="space-y-2.5 group">
              <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 flex justify-between">
                <span>Patient Identifier (MRN) <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full h-[56px] bg-slate-50 border border-slate-200/60 rounded-xl px-4 text-[16px] font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#38A3A5]/50 focus:ring-4 focus:ring-[#38A3A5]/10 shadow-sm transition-all"
                  placeholder="e.g. MRN-123456"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 flex justify-between">
                  <span>Procedure Code</span>
                  <span className="text-slate-400 font-medium">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full h-[56px] bg-slate-50 border border-slate-200/60 rounded-xl px-4 text-[16px] font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#38A3A5]/50 focus:ring-4 focus:ring-[#38A3A5]/10 shadow-sm transition-all"
                    placeholder="e.g. 75563"
                    value={cptCode}
                    onChange={(e) => setCptCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em] ml-1 flex justify-between">
                  <span>Insurance Provider</span>
                  <span className="text-slate-400 font-medium">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full h-[56px] bg-slate-50 border border-slate-200/60 rounded-xl px-4 text-[16px] font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#38A3A5]/50 focus:ring-4 focus:ring-[#38A3A5]/10 shadow-sm transition-all"
                    placeholder="e.g. Aetna"
                    value={insuranceName}
                    onChange={(e) => setInsuranceName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3 fade-in shadow-sm">
                <Info size={18} strokeWidth={2.5} />
                <span className="text-sm font-bold tracking-wide">{error}</span>
              </div>
            )}

            {/* Form Footer Actions */}
            <div className="pt-8 mt-4 border-t border-slate-100/80 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-[56px] px-10 bg-gradient-to-r from-[#38A3A5] to-[#2D8284] hover:from-[#2D8284] hover:to-[#226668] text-white rounded-xl text-[15px] font-bold shadow-lg shadow-[#38A3A5]/20 hover:shadow-[#38A3A5]/30 hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <>
                    Initialize Protocol
                    <ChevronRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-60 text-center flex items-center justify-center gap-2">
          HIPAA & HITRUST Protocol Active <div className="w-1.5 h-1.5 rounded-full bg-[#38A3A5]"></div>
        </div>
      </div>
    </div>
  );
};

export default NewCase;
