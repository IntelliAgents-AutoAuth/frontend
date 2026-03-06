
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, XCircle } from 'lucide-react';
import { casesApi } from '../api/api';

const NewCase = () => {
  const [patientId, setPatientId] = useState('MRN-99201');
  const [cptCode, setCptCode] = useState('75563');
  const [insuranceName, setInsuranceName] = useState('United Healthcare');
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

    try {
      const response = await casesApi.createCase({
        patientName: patientId, // Using Patient ID as the identifier
        cptCode: cptCode,
        insuranceName: insuranceName
      });
      navigate(`/cases/${response.case_id}/prefill`);
    } catch (err) {
      setError('An error occurred during case initialization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl glass-card rounded-[2.5rem] border border-white/60 overflow-hidden fade-in relative">
        
        {/* Modal Header */}
        <div className="px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-50 flex items-center justify-between bg-white/40">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-outfit truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>Initialize New Case</h2>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">Status: Secure Protocol Active</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-10 h-10 flex-shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all ml-4">
            <XCircle size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8 bg-white/20">
          
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Patient Identifier (MRN)</label>
            <input 
              type="text" 
              className="input-field h-14 text-base font-bold text-slate-700"
              placeholder="e.g. MRN-12345"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">CPT Procedure Code</label>
            <input 
              type="text" 
              className="input-field h-14 text-base font-bold text-slate-700"
              placeholder="e.g. 75563"
              value={cptCode}
              onChange={(e) => setCptCode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] ml-1">Insurance Provider Name</label>
            <input 
              type="text" 
              className="input-field h-14 text-base font-bold text-slate-700"
              placeholder="e.g. Aetna, United Healthcare"
              value={insuranceName}
              onChange={(e) => setInsuranceName(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-4 fade-in">
              <Info size={20} />
              <span className="text-sm font-bold tracking-tight">{error}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-6 sm:pt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-5">
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary h-14 px-10 border-transparent bg-slate-100/50 hover:bg-slate-100 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary h-14 px-12 text-base order-1 sm:order-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                "Submit Case"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-40 animate-pulse">
         Protocol Enforced • PHI Encrypted Bridge Active
      </div>
    </div>
  );
};

export default NewCase;
