import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Activity, FileText, CheckCircle2, FlaskConical, Building, Calendar, Phone, Fingerprint, ShieldCheck, AlertTriangle, UploadCloud, CheckCircle, RefreshCcw, Loader2, Sparkles } from 'lucide-react';
import { casesApi } from '../api/api';

const GapAnalysisModule = ({ caseId, onUpdate, initialStatus }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [submittingAll, setSubmittingAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);     
  const [pipelineStatus, setPipelineStatus] = useState(initialStatus); 
  const navigate = useNavigate();

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await casesApi.fetchGapAnalysis(caseId);
      setAnalysis(data);
    } catch (err) {
      console.error("Error fetching gap analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [caseId]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await casesApi.syncEhr(caseId);
      await fetchAnalysis();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handleInputChange = (docName, value) => {
    setFormValues(prev => ({ ...prev, [docName]: value }));
  };

  const handleSubmitAll = async () => {
    const docsToSubmit = (analysis?.missing_documents || []).filter(doc => {
      const val = formValues[doc.document_name];
      return val !== undefined && val !== null && val !== '';
    });
    if (docsToSubmit.length === 0) return;

    try {
      setSubmittingAll(true);

      // Submit each document sequentially using the new file-aware logic
      // Note: Sequential is used to prevent database race conditions in SQLite
      for (const doc of docsToSubmit) {
        const value = formValues[doc.document_name];
        const isFile = doc.html_input_type === 'file';
        const payload = {
          document_name: doc.document_name,
          missing_key: doc.document_name,
          file: isFile ? value : null,
          field_value: isFile ? null : value
        };
        await casesApi.uploadGapData(caseId, payload);
      }

      // ✅ Documents uploaded — backend will auto-trigger eligibility in background.
      setSubmitted(true);
      setPipelineStatus('PROCESSING');

      // Poll case status every 3s for up to 60s
      let attempts = 0;
      const maxAttempts = 20;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const caseData = await casesApi.fetchCaseById(caseId);
          const st = caseData?.status;
          if (st === 'APPROVED' || st === 'DENIED' || st === 'ELIGIBLE' || st === 'NOT_ELIGIBLE' || st === 'GAP_ANALYSIS_FAILED') {
            clearInterval(poll);
            setPipelineStatus(st);
            if (onUpdate) onUpdate();
          } else if (attempts >= maxAttempts) {
            clearInterval(poll);
            setPipelineStatus('TIMEOUT');
          }
        } catch {
          // silently ignore transient fetch errors
        }
      }, 3000);

    } catch (err) {
      console.error("Bulk submission failed:", err);
    } finally {
      setSubmittingAll(false);
    }
  };

  const handleSubmitField = async (doc) => {
    const value = formValues[doc.document_name];
    if (!value) return;

    try {
      setSubmitting(prev => ({ ...prev, [doc.document_name]: true }));
      
      const isFile = doc.html_input_type === 'file';
      const payload = {
        document_name: doc.document_name,
        missing_key: doc.document_name,
        file: isFile ? value : null,
        field_value: isFile ? null : value
      };

      await casesApi.uploadGapData(caseId, payload);

      // Mark field as staged in local UI — backend handles gap checking automatically
      setFormValues(prev => ({ ...prev, [`${doc.document_name}_submitted`]: true }));
      
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(prev => ({ ...prev, [doc.document_name]: false }));
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse text-xs font-bold uppercase tracking-widest">Aggregating Gaps...</div>;

  // ── Final Package / Submission Module ───────────────────────────────────────
  const isPacketReady = onUpdate && (pipelineStatus === 'PACKET_READY' || pipelineStatus === 'PENDING_APPROVAL');
  const isSubmitted = pipelineStatus === 'SUBMITTED' || pipelineStatus === 'TRACKING';

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(casesApi.previewPaPackage(caseId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Preview failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      alert("Could not load PDF preview. Make sure the packet has been generated.");
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSyncing(true); // Reuse syncing state for submission button loader
      await casesApi.submitCase(caseId);
      setPipelineStatus('SUBMITTED');
      
      // Poll for TRACKING status
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const caseData = await casesApi.fetchCaseById(caseId);
          if (caseData.status === 'TRACKING' || attempts >= 10) {
            clearInterval(poll);
            setPipelineStatus(caseData.status);
            if (onUpdate) onUpdate();
          }
        } catch {}
      }, 2000);
      
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  if (isPacketReady || isSubmitted) {
    return (
      <div className={`rounded-3xl p-8 text-center flex flex-col items-center gap-4 border ${
        isSubmitted ? 'bg-emerald-50 border-emerald-100' : 'bg-[#38A3A5]/5 border-[#38A3A5]/20'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
          isSubmitted ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-[#38A3A5] text-white shadow-[#38A3A5]/20'
        }`}>
          {isSubmitted ? <CheckCircle size={32} /> : <FileText size={32} />}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${isSubmitted ? 'text-emerald-800' : 'text-slate-900'}`}>
            {isSubmitted ? 'Case Submitted' : 'PA Package Ready'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            {isSubmitted 
              ? 'The package has been transmitted to the payer portal. Status is being tracked.'
              : 'The medical necessity package and clinical checklist have been generated and merged with your clinical uploads.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-[#38A3A5] border border-[#38A3A5] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all font-outfit"
          >
            <FileText size={14} /> Preview Package
          </button>
          
          {!isSubmitted && (
            <button 
              onClick={handleFinalSubmit}
              disabled={syncing}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#38A3A5] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#2D8284] transition-all font-outfit shadow-lg shadow-[#38A3A5]/20"
            >
              {syncing ? <Loader2 size={14} className="animate-spin" /> : <ChevronLeft size={14} className="rotate-180" />}
              Approve & Submit to Insurance
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Submitted / Pipeline Running Banner ────────────────────────────────────
  if (submitted) {
    const isDone = pipelineStatus === 'APPROVED' || pipelineStatus === 'DENIED' || pipelineStatus === 'ELIGIBLE' || pipelineStatus === 'NOT_ELIGIBLE';
    const isFailed = pipelineStatus === 'GAP_ANALYSIS_FAILED' || pipelineStatus === 'TIMEOUT';

    return (
      <div className={`rounded-3xl p-8 text-center flex flex-col items-center gap-4 border ${
        isDone ? 'bg-emerald-50 border-emerald-100' : isFailed ? 'bg-rose-50 border-rose-100' : 'bg-blue-50 border-blue-100'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
          isDone ? 'bg-emerald-500 text-white shadow-emerald-200' : isFailed ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-[#38A3A5] text-white shadow-[#38A3A5]/20'
        }`}>
          {isDone ? <CheckCircle size={32} /> : isFailed ? <AlertTriangle size={32} /> : <Sparkles size={32} className="animate-pulse" />}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${
            isDone ? 'text-emerald-800' : isFailed ? 'text-rose-800' : 'text-slate-900'
          }`}>
            {isDone ? 'Pipeline Complete' : isFailed ? 'Processing Issue' : 'Documents Submitted'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {isDone
              ? `Eligibility verdict: ${pipelineStatus}. Refresh to see full results.`
              : isFailed
              ? 'Pipeline encountered an issue. You can manually re-sync.'
              : 'Running eligibility check in background…'}
          </p>
        </div>
        {!isDone && !isFailed && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#38A3A5] uppercase tracking-widest">
            <Loader2 size={12} className="animate-spin" /> Processing
          </div>
        )}
        {(isDone || isFailed) && (
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold text-[#38A3A5] uppercase tracking-widest hover:underline flex items-center gap-2 mt-1"
          >
            <RefreshCcw size={12} /> Refresh Page
          </button>
        )}
      </div>
    );
  }

  if (!analysis?.missing_documents || analysis.missing_documents.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
           <CheckCircle size={32} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Authorization Ready</h3>
          <p className="text-sm text-slate-500 mt-1">All policy requirements have been satisfied.</p>
        </div>
        <button onClick={handleSync} className="text-xs font-bold text-[#38A3A5] uppercase tracking-widest hover:underline flex items-center gap-2">
          {syncing ? <Loader2 size={12} className="animate-spin"/> : <RefreshCcw size={12}/>} Force Review
        </button>
      </div>
    );
  }

  const stagedCount = (analysis?.missing_documents || []).filter(doc => {
    const val = formValues[doc.document_name];
    return val !== undefined && val !== null && val !== '';
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertTriangle size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Requirement Gaps</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stagedCount} of {analysis?.missing_documents?.length || 0} prepared</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {stagedCount > 0 && (
            <button 
              onClick={handleSubmitAll}
              disabled={submittingAll || syncing}
              className="flex items-center gap-2 px-6 py-2 bg-[#38A3A5] text-white rounded-xl shadow-lg shadow-[#38A3A5]/20 hover:shadow-[#38A3A5]/40 transition-all text-xs font-bold uppercase tracking-widest border border-[#38A3A5]"
            >
              {submittingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              Submit All ({stagedCount})
            </button>
          )}
          <button 
            onClick={handleSync}
            disabled={syncing || submittingAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
          >
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
            Sync Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(analysis?.missing_documents || []).map((doc, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:border-[#38A3A5]/30 transition-all flex flex-col">
            <div className="mb-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                {doc.label || doc.document_name}
                {doc.is_mandatory && <span className="text-rose-500">*</span>}
              </h4>
              <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">{doc.reason}</p>
            </div>

            <div className="mt-auto space-y-3">
              {doc.html_input_type === 'file' ? (
                <div className="relative group">
                  <input 
                    type="file" 
                    id={`file-${idx}`}
                    className="hidden" 
                    accept={doc.accept}
                    onChange={(e) => handleInputChange(doc.document_name, e.target.files[0])}
                  />
                  <label 
                    htmlFor={`file-${idx}`}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-[#38A3A5] hover:bg-slate-50 transition-all group"
                  >
                    <UploadCloud size={20} className="text-slate-300 group-hover:text-[#38A3A5] mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      {formValues[doc.document_name]?.name || 'Select File'}
                    </span>
                  </label>
                </div>
              ) : doc.html_input_type === 'textarea' ? (
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-[#38A3A5]/20 focus:outline-none placeholder:text-slate-300"
                  placeholder={doc.placeholder || 'Enter details...'}
                  onChange={(e) => handleInputChange(doc.document_name, e.target.value)}
                />
              ) : doc.html_input_type === 'select' ? (
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-600 focus:outline-none"
                  onChange={(e) => handleInputChange(doc.document_name, e.target.value)}
                >
                  <option value="">Select Option</option>
                  {doc.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input 
                  type={doc.html_input_type || 'text'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none"
                  placeholder={doc.placeholder || 'Enter value...'}
                  onChange={(e) => handleInputChange(doc.document_name, e.target.value)}
                />
              )}

              <button 
                onClick={() => handleSubmitField(doc)}
                disabled={!formValues[doc.document_name] || submitting[doc.document_name] || formValues[`${doc.document_name}_submitted`]}
                className={`w-full py-3 transition-all flex items-center justify-center rounded-2xl text-[10px] font-bold uppercase tracking-widest ${
                  formValues[`${doc.document_name}_submitted`] 
                  ? 'bg-emerald-500 text-white shadow-emerald-200 cursor-default' 
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200 shadow-none disabled:opacity-50'
                }`}
              >
                {submitting[doc.document_name] ? <Loader2 size={14} className="animate-spin" /> : (
                  formValues[`${doc.document_name}_submitted`] ? <div className="flex items-center gap-2"><CheckCircle size={14}/> Staged</div> : 'Confirm Field'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
            
            {/* NEW: Gap Analysis Integration */}
            <GapAnalysisModule 
              caseId={id} 
              initialStatus={caseData.status}
              onUpdate={() => {
                // Trigger a re-fetch of the main case data if needed
                window.location.reload(); 
              }} 
            />

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
             {(caseData.physician_name || caseData.physician_npi || caseData.physician_specialty || caseData.facility_name) && (
             <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center">
                    <Building size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Ordering Entity</h3>
               </div>
               
               <div className="space-y-4 text-sm font-medium text-slate-600">
                  {caseData.physician_name && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Physician</span>
                     <span className="font-bold text-slate-800">{caseData.physician_name}</span>
                  </div>
                  )}
                  {caseData.physician_npi && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">NPI Number</span>
                     <span>{caseData.physician_npi}</span>
                  </div>
                  )}
                  {caseData.physician_specialty && (
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Specialty</span>
                     <span>{caseData.physician_specialty}</span>
                  </div>
                  )}
                  {caseData.facility_name && (
                  <div className="flex items-center justify-between pb-1">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Facility</span>
                     <span>{caseData.facility_name}</span>
                  </div>
                  )}
               </div>
             </div>
             )}

             {/* Diagnostics / Labs */}
             {caseData.lab_results && Object.keys(caseData.lab_results).length > 0 && (
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
                                  <span className="font-bold text-slate-700">{value && typeof value === 'object' ? `${value.value} ${value.unit}` : value}</span>
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
             )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CaseDetails;
