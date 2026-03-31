import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  Activity,
  FileText,
  CheckCircle2,
  FlaskConical,
  Building,
  Calendar,
  Phone,
  Fingerprint,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  CheckCircle,
  RefreshCcw,
  Loader2,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { casesApi } from "../api/api";
import { POLLING_CONFIG } from "../config/polling.config";
import PAStatusDashboard from "../components/PAStatusDashboard";

const GapAnalysisModule = ({
  caseId,
  onUpdate,
  initialStatus,
  onAnalysisUpdate,
}) => {
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
      if (onAnalysisUpdate) onAnalysisUpdate(data);
    } catch (err) {
      console.error("Error fetching gap analysis:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [caseId]);

  useEffect(() => {
    if (initialStatus) {
      setPipelineStatus(initialStatus);
    }
  }, [initialStatus]);

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
    setFormValues((prev) => ({ ...prev, [docName]: value }));
  };

  const handleSubmitAll = async () => {
    const docsToSubmit = (analysis?.missing_documents || []).filter((doc) => {
      const val = formValues[doc.document_name];
      return val !== undefined && val !== null && val !== "";
    });
    if (docsToSubmit.length === 0) return;

    try {
      setSubmittingAll(true);

      for (const doc of docsToSubmit) {
        const value = formValues[doc.document_name];
        const isFile = doc.html_input_type === "file";
        const payload = {
          document_name: doc.document_name,
          missing_key: doc.document_name,
          file: isFile ? value : null,
          field_value: isFile ? null : value,
        };
        await casesApi.uploadGapData(caseId, payload);
      }

      setSubmitted(true);
      setPipelineStatus("PROCESSING");

      let attempts = 0;
      const maxAttempts = POLLING_CONFIG.CASE_STATUS_POLLING.maxAttempts;
      const pollInterval = POLLING_CONFIG.CASE_STATUS_POLLING.intervalMs;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const caseData = await casesApi.fetchCaseById(caseId);
          const st = caseData?.status;
          if (
            st === "APPROVED" ||
            st === "DENIED" ||
            st === "ELIGIBLE" ||
            st === "NOT_ELIGIBLE" ||
            st === "GAP_ANALYSIS_FAILED"
          ) {
            clearInterval(poll);
            setPipelineStatus(st);
            if (onUpdate) onUpdate();
          } else if (attempts >= maxAttempts) {
            clearInterval(poll);
            setPipelineStatus("TIMEOUT");
          }
        } catch {}
      }, pollInterval);
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
      setSubmitting((prev) => ({ ...prev, [doc.document_name]: true }));

      const isFile = doc.html_input_type === "file";
      const payload = {
        document_name: doc.document_name,
        missing_key: doc.document_name,
        file: isFile ? value : null,
        field_value: isFile ? null : value,
      };

      await casesApi.uploadGapData(caseId, payload);
      setFormValues((prev) => ({
        ...prev,
        [`${doc.document_name}_submitted`]: true,
      }));
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting((prev) => ({ ...prev, [doc.document_name]: false }));
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse text-[10px] font-bold uppercase tracking-widest">
        Evaluating Gaps...
      </div>
    );

  const isPacketReady =
    onUpdate &&
    (pipelineStatus === "PACKET_READY" ||
      pipelineStatus === "PENDING_APPROVAL");
  const isSubmitted =
    pipelineStatus === "SUBMITTED" || pipelineStatus === "TRACKING";

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(casesApi.previewPaPackage(caseId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Preview failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      alert(
        "Could not load PDF preview. Make sure the packet has been generated.",
      );
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSyncing(true);
      await casesApi.submitCase(caseId);
      setPipelineStatus("SUBMITTED");

      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const caseData = await casesApi.fetchCaseById(caseId);
          if (caseData.status === "TRACKING" || attempts >= 10) {
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
      <div
        className={`rounded-2xl p-6 text-center flex flex-col items-center gap-3 border ${
          isSubmitted
            ? "bg-emerald-50 border-emerald-100"
            : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
            isSubmitted
              ? "bg-emerald-500 text-white shadow-emerald-200"
              : "bg-[#38A3A5] text-white shadow-[#38A3A5]/20"
          }`}
        >
          {isSubmitted ? <CheckCircle size={24} /> : <FileText size={24} />}
        </div>
        <div>
          <h3
            className={`text-lg font-bold ${isSubmitted ? "text-emerald-800" : "text-slate-900"}`}
          >
            {isSubmitted ? "Case Submitted" : "PA Package Ready"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {isSubmitted
              ? "Transmitted to payer portal. Status is being tracked."
              : "Medical necessity package generated and merged with clinical uploads."}
          </p>
          
          {/* AI Confidence Score Badge */}
          {onUpdate && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm ${
                (analysis?.confidence_score || 0) >= 80 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                <Sparkles size={16} className={(analysis?.confidence_score || 0) >= 80 ? "animate-pulse" : ""} />
                <span className="text-xs font-black uppercase tracking-tighter">
                  {analysis?.confidence_score || 0}% AI Confidence
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400 italic">
                {analysis?.auto_submit_reason || "Verified against clinical policy."}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#38A3A5] border border-[#38A3A5] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all focus:outline-none"
          >
            <FileText size={14} /> View Packet Preview
          </button>

          {!isSubmitted && (
            <button
              onClick={handleFinalSubmit}
              disabled={syncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#38A3A5] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#2D8284] transition-all shadow-md shadow-[#38A3A5]/20 focus:outline-none disabled:opacity-70"
            >
              {syncing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Force Manual Submit
            </button>
          )}
        </div>
      </div>
    );
  }

  if (submitted) {
    const isDone =
      pipelineStatus === "APPROVED" ||
      pipelineStatus === "DENIED" ||
      pipelineStatus === "ELIGIBLE" ||
      pipelineStatus === "NOT_ELIGIBLE";
    const isFailed =
      pipelineStatus === "GAP_ANALYSIS_FAILED" || pipelineStatus === "TIMEOUT";

    return (
      <div
        className={`rounded-2xl p-6 text-center flex flex-col items-center gap-3 border ${
          isDone
            ? "bg-emerald-50 border-emerald-100"
            : isFailed
              ? "bg-rose-50 border-rose-100"
              : "bg-blue-50 border-blue-100"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
            isDone
              ? "bg-emerald-500 text-white shadow-emerald-200"
              : isFailed
                ? "bg-rose-500 text-white shadow-rose-200"
                : "bg-[#38A3A5] text-white shadow-[#38A3A5]/20"
          }`}
        >
          {isDone ? (
            <CheckCircle size={24} />
          ) : isFailed ? (
            <AlertTriangle size={24} />
          ) : (
            <Sparkles size={24} className="animate-pulse" />
          )}
        </div>
        <div>
          <h3
            className={`text-sm font-bold ${
              isDone
                ? "text-emerald-800"
                : isFailed
                  ? "text-rose-800"
                  : "text-slate-900"
            }`}
          >
            {isDone
              ? "Pipeline Complete"
              : isFailed
                ? "Processing Issue"
                : "Documents Active"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isDone
              ? `Verdict: ${pipelineStatus.replace(/_/g, " ")}.`
              : isFailed
                ? "Encountered an issue. Manually re-sync available."
                : "Case is being processed."}
          </p>
        </div>
        {(isDone || isFailed) && (
          <button
            onClick={() => window.location.reload()}
            className="text-[10px] font-bold text-[#38A3A5] uppercase tracking-widest hover:underline flex items-center gap-1.5 mt-2 focus:outline-none"
          >
            <RefreshCcw size={12} /> Reload Result
          </button>
        )}
      </div>
    );
  }

  if (!analysis?.missing_documents || analysis.missing_documents.length === 0) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900">
            Authorization Ready
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            All clinical policy requirements satisfied.
          </p>
        </div>
        <button
          onClick={handleSync}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm focus:outline-none flex items-center gap-2 shrink-0"
        >
          {syncing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <RefreshCcw size={12} />
          )}{" "}
          Review
        </button>
      </div>
    );
  }

  const stagedCount = (analysis?.missing_documents || []).filter((doc) => {
    const val = formValues[doc.document_name];
    return val !== undefined && val !== null && val !== "";
  }).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={14} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">
              Requirement Gaps
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              {stagedCount} of {analysis?.missing_documents?.length || 0} Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {stagedCount > 0 && (
            <button
              onClick={handleSubmitAll}
              disabled={submittingAll || syncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#38A3A5] text-white rounded-lg shadow-sm hover:shadow-[#38A3A5]/40 transition-all text-[10px] font-bold uppercase tracking-widest focus:outline-none"
            >
              {submittingAll ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle size={12} />
              )}
              Submit
            </button>
          )}
          <button
            onClick={handleSync}
            disabled={syncing || submittingAll}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-500 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest focus:outline-none"
          >
            {syncing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCcw size={12} />
            )}
            Sync
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {(analysis?.missing_documents || []).map((doc, idx) => (
          <div
            key={idx}
            className="bg-slate-50/50 border border-slate-100/80 rounded-lg p-2 flex flex-col lg:flex-row lg:items-center gap-2 hover:bg-white hover:border-slate-200 transition-colors"
          >
            {/* Context */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 leading-tight truncate">
                {doc.label || doc.document_name}
                {doc.is_mandatory && (
                  <span className="text-rose-500 text-lg leading-none">*</span>
                )}
              </h4>
              <p className="text-[9px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                {doc.reason}
              </p>
            </div>

            {/* Input & Action */}
            <div className="flex items-center gap-1.5 lg:w-[280px] shrink-0">
              <div className="flex-1">
                {doc.html_input_type === "file" ? (
                  <div className="relative group">
                    <input
                      type="file"
                      id={`file-${idx}`}
                      className="hidden"
                      accept={doc.accept}
                      onChange={(e) =>
                        handleInputChange(doc.document_name, e.target.files[0])
                      }
                    />
                    <label
                      htmlFor={`file-${idx}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleInputChange(
                            doc.document_name,
                            e.dataTransfer.files[0],
                          );
                        }
                      }}
                      className={`flex flex-row items-center gap-2 border ${formValues[doc.document_name] ? "border-[#38A3A5] bg-[#38A3A5]/5" : "border-slate-200 border-dashed hover:border-[#38A3A5] bg-white"} rounded-lg py-1.5 px-3 cursor-pointer transition-all h-[34px] group w-full overflow-hidden`}
                    >
                      <UploadCloud
                        size={14}
                        className={`${formValues[doc.document_name] ? "text-[#38A3A5]" : "text-slate-400 group-hover:text-[#38A3A5]"} shrink-0`}
                      />
                      <span className="text-[9px] font-bold text-slate-500 truncate w-full">
                        {formValues[doc.document_name]?.name || "Select File"}
                      </span>
                    </label>
                  </div>
                ) : doc.html_input_type === "select" ? (
                  <select
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 h-[34px] text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-[#38A3A5] focus:ring-1 focus:ring-[#38A3A5]/20 shadow-sm"
                    onChange={(e) =>
                      handleInputChange(doc.document_name, e.target.value)
                    }
                  >
                    <option value="">Select Option</option>
                    {doc.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={doc.html_input_type || "text"}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 h-[34px] text-[11px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#38A3A5] focus:ring-1 focus:ring-[#38A3A5]/20 shadow-sm"
                    placeholder={doc.placeholder || "Enter value..."}
                    onChange={(e) =>
                      handleInputChange(doc.document_name, e.target.value)
                    }
                  />
                )}
              </div>

              <button
                onClick={() => handleSubmitField(doc)}
                disabled={
                  !formValues[doc.document_name] ||
                  submitting[doc.document_name] ||
                  formValues[`${doc.document_name}_submitted`]
                }
                className={`h-[34px] px-3 transition-all flex items-center justify-center rounded-lg text-[9px] font-bold uppercase tracking-widest shrink-0 focus:outline-none ${
                  formValues[`${doc.document_name}_submitted`]
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm disabled:opacity-50"
                }`}
              >
                {submitting[doc.document_name] ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : formValues[`${doc.document_name}_submitted`] ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle size={12} /> OK
                  </div>
                ) : (
                  "Confirm"
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
  const [fullData, setFullData] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState(null);

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      const [payload, logs] = await Promise.all([
        casesApi.fetchCaseFullDetails(id),
        casesApi.fetchAuditLog(id).catch(() => []),
      ]);
      setCaseData(payload.case);
      setFullData(payload);
      setAuditLog(logs);
    } catch (err) {
      console.error("Error refreshing case:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    document.title = `AutoAuth | Case ${id}`;

    const fetchCase = async () => {
      try {
        const [payload, logs] = await Promise.all([
          casesApi.fetchCaseFullDetails(id),
          casesApi.fetchAuditLog(id).catch(() => []),
        ]);
        setCaseData(payload.case);
        setFullData(payload);
        setAuditLog(logs);
      } catch (err) {
        console.error("Error fetching case:", err);
        setError("Failed to load case data. It might not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  useEffect(() => {
    const fetchGapAnalysis = async () => {
      try {
        const data = await casesApi.fetchGapAnalysis(id);
        setGapAnalysis(data);
      } catch (err) {
        console.warn("Failed to fetch gap analysis:", err);
        // Continue without gap analysis data
      }
    };

    if (id) {
      fetchGapAnalysis();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-[#38A3A5]/20 border-t-[#38A3A5] rounded-full animate-spin mb-3" />
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Compiling Records...
        </p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle size={20} />
        </div>
        <h2 className="text-sm font-bold text-slate-800 mb-2">
          Notice: {error}
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 bg-[#38A3A5] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-[#2D8284]"
        >
          Return Dashboard
        </button>
      </div>
    );
  }

  // Compile valid detailed EHR entries
  const combinedData = {
    ...(fullData?.case || {}),
    ...(fullData?.ehr || {}),
    ...(fullData?.extracted_data || {}),
  };
  const ignoreKeys = [
    "case_id",
    "created_at",
    "updated_at",
    "patient_id",
    "patient_first_name",
    "patient_last_name",
    "extracted_id",
    "patient_name",
    "status",
    "gap_result",
    "uploaded_files",
    "audit_log",
    "total_required",
    "total_matched",
    "total_missing",
    "gap_percentage",
    "created_by",
    "priority",
  ];
  const validEHREntries = Object.entries(combinedData).filter(
    ([k, v]) => v && typeof v !== "object" && !ignoreKeys.includes(k),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-[1400px] mx-auto flex flex-col min-h-[calc(100vh-80px)]">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-sm z-20 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 focus:outline-none transition-colors"
            >
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <div>
              <h1
                className="text-xl font-extrabold text-slate-900 tracking-tight font-outfit"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Case Profile
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold text-[#38A3A5] uppercase tracking-widest">
                  {caseData.case_id}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1.5 border-l border-slate-300">
                  Priority: {caseData.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Refresh case data"
              className="w-9 h-9 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-[#38A3A5] hover:border-[#38A3A5] hover:bg-slate-50 disabled:opacity-50 focus:outline-none transition-all"
            >
              <RefreshCcw
                size={16}
                strokeWidth={2.5}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </button>
            <div className="px-3 py-1.5 bg-white rounded-md border border-slate-200 shadow-sm flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38A3A5] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#38A3A5]"></span>
              </span>
              <span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest">
                {caseData.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </header>

        {/* 2-Column Dashboard Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start flex-1">
          {/* LEFT SIDEBAR: Static Metadata */}
          <div className="w-full lg:w-[320px] xl:w-[360px] shrink-0 flex flex-col gap-6">
            {/* Patient Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100/50">
                <Fingerprint size={24} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-bold text-slate-900 truncate tracking-tight">
                  {caseData.patient_name || "Anonymous"}
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                  MRN: {caseData.patient_id}
                </p>
              </div>
              <div className="absolute -right-6 -bottom-6 text-slate-50 opacity-50 pointer-events-none">
                <Fingerprint size={100} strokeWidth={1} />
              </div>
            </div>

            {/* Ordering Entity */}
            {(caseData.physician_name || caseData.facility_name) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-violet-600">
                  <Building size={14} strokeWidth={2.5} />
                  <h3 className="text-[11px] font-bold tracking-widest uppercase">
                    Ordering Entity
                  </h3>
                </div>
                <div className="space-y-3">
                  {caseData.physician_name && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Physician
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {caseData.physician_name}
                      </span>
                    </div>
                  )}
                  {caseData.physician_npi && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        NPI Number
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {caseData.physician_npi}
                      </span>
                    </div>
                  )}
                  {caseData.facility_name && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        Facility
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {caseData.facility_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Consolidated EHR List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col flex-1 max-h-[500px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl flex items-center gap-2">
                <Activity size={14} className="text-[#38A3A5]" />
                <h3 className="text-[10px] font-extrabold text-[#38A3A5] uppercase tracking-widest">
                  EHR Details Segment
                </h3>
              </div>
              <div className="overflow-y-auto p-4 space-y-0 scrollbar-thin scrollbar-thumb-slate-200">
                {validEHREntries.length > 0 ? (
                  validEHREntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col py-3 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0 gap-0.5"
                    >
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {value}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400">
                    <FileText size={20} className="mx-auto opacity-50 mb-2" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      No Context Synced
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Blueprint Banner */}
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-[#38A3A5]/30 transition-colors">
                <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-extrabold uppercase tracking-widest border border-slate-100">
                  ICD-10
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Primary Diagnosis{" "}
                    {caseData.icd10_code && (
                      <span className="text-[#38A3A5]">
                        {caseData.icd10_code}
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                    {caseData.diagnosis || "Unspecified"}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:border-[#38A3A5]/30 transition-colors">
                <div className="w-10 h-10 bg-[#38A3A5]/10 text-[#38A3A5] rounded-xl flex items-center justify-center shrink-0 text-[10px] font-extrabold uppercase tracking-widest border border-[#38A3A5]/20">
                  CPT
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    Req Procedure{" "}
                    {caseData.cpt_code && (
                      <span className="text-[#38A3A5]">
                        {caseData.cpt_code}
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                    {caseData.procedure_name || "Unspecified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Diagnostic Biomarkers */}
            {caseData.lab_results &&
              Object.keys(caseData.lab_results).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <FlaskConical size={14} className="text-cyan-500" />
                    <h3 className="text-[10px] font-extrabold text-slate-800 tracking-widest uppercase">
                      Diagnostic Biomarkers
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(caseData.lab_results).map(
                      ([testLabel, resultsMap]) => (
                        <div
                          key={testLabel}
                          className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 border-l-2 border-l-cyan-400"
                        >
                          <p className="text-[9px] font-extrabold text-cyan-700 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <CheckCircle2 size={10} /> {testLabel}
                          </p>
                          <ul className="space-y-1">
                            {Object.entries(resultsMap).map(([key, value]) => (
                              <li
                                key={key}
                                className="flex justify-between items-center text-[10px]"
                              >
                                <span className="text-slate-500 truncate mr-2">
                                  {key}
                                </span>
                                <span className="font-semibold text-slate-700">
                                  {value && typeof value === "object"
                                    ? `${value.value} ${value.unit}`
                                    : value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT MAIN CONTENT: Workflow & Gap Analysis - Full Width */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* PA Status Dashboard - Shows all sections in proper order */}
            <PAStatusDashboard
              caseId={id}
              caseData={combinedData}
              isEmbedded={true}
              onUploadClick={() => setShowGapAnalysis(true)}
              missingDocuments={gapAnalysis?.missing_documents}
            />

            {/* Gap Analysis Form - Show when user clicks Upload OR during gap phase */}
            {(showGapAnalysis ||
              caseData.status === "GAP_FOUND" ||
              caseData.status === "GAP_ANALYSIS_REQUIRED" ||
              caseData.status === "DOCUMENTS_NEEDED" ||
              caseData.status === "PACKET_READY" ||
              caseData.status === "PENDING_APPROVAL" ||
              caseData.status === "SUBMITTED" || 
              caseData.status === "TRACKING" || 
              caseData.status === "APPROVED" || 
              caseData.status === "DENIED" ||
              caseData.status === "ELIGIBLE" ||
              caseData.status === "NOT_ELIGIBLE" ||
              caseData.status === "GAP_ANALYSIS_FAILED" ||
              caseData.status === "TIMEOUT") && (
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Upload Required Documents
                  </h3>
                  {showGapAnalysis && (
                    <button
                      onClick={() => setShowGapAnalysis(false)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                    >
                      Close
                    </button>
                  )}
                </div>
                <GapAnalysisModule
                  caseId={id}
                  initialStatus={caseData.status}
                  onUpdate={() => window.location.reload()}
                  onAnalysisUpdate={setGapAnalysis}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
