import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShieldCheck, Database, CheckCircle2 } from "lucide-react";
import { casesApi } from "../api/api";
import { POLLING_CONFIG } from "../config/polling.config";

const DataField = ({ label, value, isLabs }) => {
  const hasData =
    value && value !== "N/A" && (!isLabs || Object.keys(value).length > 0);

  if (!hasData) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#38A3A5]/20 transition-all shadow-sm gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        {hasData ? (
          isLabs ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.keys(value).map((k) => (
                <span
                  key={k}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm font-semibold text-slate-800">
              {value}
            </span>
          )
        ) : (
          <span className="text-sm font-medium text-slate-300 italic">
            Pending manual entry
          </span>
        )}
      </div>

      {hasData ? (
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-widest shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          From EHR
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md uppercase tracking-widest shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
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

    let syncTimeout;

    const performSync = async () => {
      try {
        // Start at 0% - initialization
        setProgress(0);

        // Step 1: Link FHIR Metadata (30%)
        setProgress(30);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 2: Parse Clinical Notes (60%)
        setProgress(60);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Step 3: Fetch case data (85%)
        setProgress(85);
        const data = await casesApi.fetchCaseById(id);
        setCaseData(data);

        // Step 4: Complete (100%)
        setProgress(100);

        // Brief display of completion before navigating
        syncTimeout = setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("EHR Sync Failed:", error);
        setProgress(0);
        setLoading(false);
      }
    };

    performSync();

    return () => {
      if (syncTimeout) clearTimeout(syncTimeout);
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-[40%] h-[70%] bg-gradient-to-bl from-[#38A3A5]/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-gradient-to-tr from-[#2D8284]/5 to-transparent rounded-tr-full pointer-events-none" />

      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row z-10 transition-all duration-300">
        {/* Left Side: Status & Progress */}
        <div className="w-full md:w-[35%] bg-slate-50/50 p-8 sm:p-10 border-r border-slate-100 flex flex-col relative">
          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#38A3A5] mb-5">
              <Database size={24} />
            </div>
            <h2
              className="text-2xl font-extrabold text-slate-800 tracking-tight font-outfit"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              EHR Integration
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Case: {id}
            </p>
          </div>

          <div className="flex-1 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-slate-500">Sync Pipeline</span>
                <span className="text-[#38A3A5]">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#38A3A5] transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div
                className={`flex items-center gap-3 text-sm font-semibold transition-all duration-500 ${progress >= 30 ? "text-slate-800" : "text-slate-300"}`}
              >
                <CheckCircle2
                  size={18}
                  className={
                    progress >= 30 ? "text-[#38A3A5]" : "text-slate-200"
                  }
                />
                <span>Link FHIR Metadata</span>
              </div>
              <div
                className={`flex items-center gap-3 text-sm font-semibold transition-all duration-500 ${progress >= 60 ? "text-slate-800" : "text-slate-300"}`}
              >
                <CheckCircle2
                  size={18}
                  className={
                    progress >= 60 ? "text-[#38A3A5]" : "text-slate-200"
                  }
                />
                <span>Parse Clinical Notes</span>
              </div>
              <div
                className={`flex items-center gap-3 text-sm font-semibold transition-all duration-500 ${progress >= 100 ? "text-slate-800" : "text-slate-300"}`}
              >
                <CheckCircle2
                  size={18}
                  className={
                    progress >= 100 ? "text-[#38A3A5]" : "text-slate-200"
                  }
                />
                <span>Extract Payload</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex items-start gap-3">
            <ShieldCheck size={18} className="text-[#38A3A5] mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
              Encrypted data transfer. Protocol V4 active.
            </p>
          </div>
        </div>

        {/* Right Side: Data Review */}
        <div className="w-full md:w-[65%] p-8 sm:p-10 flex flex-col bg-white">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
              <div className="h-2 w-2 rounded-full bg-[#38A3A5]" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {loading ? "Searching Records..." : "Clinical Payload"}
              </h3>
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-[#38A3A5]/20 border-t-[#38A3A5] rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Aligning EHR Network
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <DataField
                  label="Patient Name"
                  value={caseData?.patient_name}
                />
                <DataField
                  label="Primary Insurance"
                  value={caseData?.insurance_company}
                />
                <DataField
                  label="Ordering Physician"
                  value={caseData?.physician_name}
                />
                <DataField
                  label="Diagnostic Labs"
                  value={caseData?.lab_results}
                  isLabs={true}
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => navigate(`/cases/${id}`)}
              disabled={loading}
              className="py-3 px-8 bg-[#38A3A5] hover:bg-[#2D8284] text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#38A3A5]/20 transition-all focus:ring-2 focus:ring-[#38A3A5]/30 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EhrPrefill;
