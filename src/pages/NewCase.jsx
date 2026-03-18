import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Activity, User, CreditCard } from 'lucide-react';
import { casesApi } from '../api/api';

const NewCase = () => {
  const [patientId, setPatientId] = useState('');
  const [cptCode, setCptCode] = useState('');
  const [insuranceName, setInsuranceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AutoAuth | New Case";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!patientId.trim()) {
      setError('Patient MRN is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await casesApi.createCase({
        patient_id: patientId,
        cpt_code: cptCode || undefined,
        insurance_company: insuranceName || undefined,
      });
      navigate(`/cases/${response.case_id}/prefill`);
    } catch (err) {
      setError('An error occurred during case setup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden font-sans">
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[70%] bg-gradient-to-bl from-[#38A3A5]/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-[#2D8284]/5 to-transparent rounded-tr-full pointer-events-none" />

      <div className="w-full max-w-lg z-10 transition-all">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider"
        >
          <ChevronLeft size={16} strokeWidth={2.5} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transform transition-all duration-300">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Start a New Case
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Enter the patient's MRN to begin the authorization process.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in">
                  <Info size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-[#38A3A5]" />
                  Patient MRN <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#38A3A5] focus:ring-2 focus:ring-[#38A3A5]/20 outline-none transition-all"
                  placeholder="e.g. PA-001"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex justify-between items-center gap-2">
                    <span className="flex items-center gap-2">
                      <Activity size={14} className="text-[#38A3A5]" />
                      Procedure
                    </span>
                    <span className="text-[9px] text-slate-400">OPTIONAL</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#38A3A5] focus:ring-2 focus:ring-[#38A3A5]/20 outline-none transition-all"
                    placeholder="CPT Code"
                    value={cptCode}
                    onChange={(e) => setCptCode(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-widest flex justify-between items-center gap-2">
                    <span className="flex items-center gap-2">
                      <CreditCard size={14} className="text-[#38A3A5]" />
                      Insurance
                    </span>
                    <span className="text-[9px] text-slate-400">OPTIONAL</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#38A3A5] focus:ring-2 focus:ring-[#38A3A5]/20 outline-none transition-all"
                    placeholder="Provider Name"
                    value={insuranceName}
                    onChange={(e) => setInsuranceName(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#38A3A5] hover:bg-[#2D8284] text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg shadow-[#38A3A5]/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Case"
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
               Secure Environment <span className="w-1.5 h-1.5 rounded-full bg-[#38A3A5]"></span> HIPAA Compliant
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCase;
