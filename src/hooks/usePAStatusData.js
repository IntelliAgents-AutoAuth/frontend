import { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  Shield,
  ShieldCheck,
  Package,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { casesApi } from "../api/api";
import { POLLING_CONFIG } from "../config/polling.config";

export const usePAStatusData = (caseId, caseData) => {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (!caseId) {
      setLoading(false);
      return;
    }

    let retryCount = 0;
    let pollingTimeout = null;

    const fetchPAWorkflow = async () => {
      let auditLog = [];
      let latestHasRealData = false;

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Audit Log
        try {
          const response = await casesApi.fetchAuditLog(caseId);
          auditLog = Array.isArray(response) ? response : (response?.audit_log || []);
        } catch (apiError) {
          console.warn("[usePAStatusData] API Fetch failed:", apiError);
          if (!workflowData?.hasRealData) throw apiError;
        }

        // 2. Process Data
        latestHasRealData = auditLog && auditLog.length > 0;
        
        const steps = transformAuditToSteps(auditLog, caseData);
        const agentExecutionSummary = latestHasRealData ? buildAgentExecutionSummary(auditLog) : [];
        const activeMs = latestHasRealData ? calculateActiveProcessingTime(auditLog) : 0;
        const totalTime = formatDuration(activeMs);
        const efficiency = latestHasRealData ? calculateEfficiency(auditLog) : null;
        const progressMetrics = calculateProgressMetrics(caseData, auditLog);
        const statusLabel = getStatusLabel(caseData?.status);

        setWorkflowData({
          steps,
          agentExecutionSummary,
          totalTime,
          efficiency,
          ...progressMetrics,
          statusLabel,
          lastUpdated: new Date().toISOString(),
          hasRealData: latestHasRealData,
          retryAttempt: retryCount,
        });

        setIsDataLoaded(true);
      } catch (err) {
        console.error("[usePAStatusData] Processing error:", err);
        setError(err.message);

        setWorkflowData((prev) => {
          if (prev?.hasRealData) {
            return {
              ...prev,
              progressLabel: "Re-connecting...",
              statusLabel: "Retrying...",
              lastUpdated: new Date().toISOString(),
            };
          }

          const isInProgress = caseData?.status && [
            "DRAFT", "EHR_FETCHING", "GAP_ANALYSIS_RUNNING", "ELIGIBILITY_RUNNING", "PACKET_GENERATING"
          ].includes(caseData.status);

          return {
            steps: [],
            agentExecutionSummary: [],
            totalTime: null,
            efficiency: null,
            progressLabel: isInProgress ? "Connecting..." : "Offline",
            progressCurrent: 0,
            progressTotal: 0,
            elapsedTime: null,
            statusLabel: isInProgress ? "Connecting..." : "Error",
            lastUpdated: new Date().toISOString(),
            hasRealData: false,
            retryAttempt: retryCount,
          };
        });
      } finally {
        setLoading(false);

        // 3. Schedule Next Poll
        const isInProgress = caseData?.status && [
          "DRAFT", "EHR_FETCHING", "GAP_ANALYSIS_RUNNING", "ELIGIBILITY_RUNNING", "PACKET_GENERATING"
        ].includes(caseData.status);
        
        const isCompleted = ["APPROVED", "DENIED", "PACKET_READY"].includes(caseData?.status);
        const shouldContinue = isInProgress && !isCompleted;

        if (shouldContinue && !pollingTimeout) {
          const hasData = latestHasRealData || workflowData?.hasRealData;
          const delayMs = !hasData 
            ? POLLING_CONFIG.STATUS_POLLING.calculateDelay(retryCount) 
            : 3000;

          if (!hasData) retryCount++;

          pollingTimeout = setTimeout(() => {
            pollingTimeout = null;
            fetchPAWorkflow();
          }, delayMs);
        }
      }
    };

    fetchPAWorkflow();

    return () => {
      if (pollingTimeout) clearTimeout(pollingTimeout);
    };
  }, [caseId, caseData?.status]);

  return { workflowData, loading, error };
};

// ── HELPER FUNCTIONS ──

const transformAuditToSteps = (auditLog, caseData) => {
  const caseStatus = caseData?.status || "DRAFT";
  
  const coreSteps = [
    { key: "CASE_CREATED", name: "Case Created", icon: FileText, desc: "Initial PA request submitted" },
    { key: "EHR_FETCH", name: "Clinical Data Fetch", icon: Users, desc: "Retrieving patient records from EHR" },
    { key: "GAP_ANALYSIS", name: "Gap Analysis", icon: AlertCircle, desc: "Identifying missing clinical evidence" },
    { key: "ELIGIBILITY", name: "Eligibility Review", icon: Shield, desc: "Verifying insurance medical necessity" },
    { key: "PACKET_GEN", name: "PA Document Generation", icon: Package, desc: "Generating clinical justification package" },
    { key: "SUBMISSION", name: "Submission", icon: CheckCircle2, desc: "Package submitted to insurance" },
  ];

  const eventLogs = {};
  if (auditLog && auditLog.length > 0) {
    auditLog.forEach((log) => {
      let eventName = "UNKNOWN";
      if (log.event) {
        eventName = log.event.replace(/_START$|_STARTED$|_COMPLETE$|_COMPLETED$/i, "");
      } else if (log.step) {
        eventName = log.step.toUpperCase();
      }
      if (eventName === "PATIENT_DATA") eventName = "EHR_FETCH";
      if (eventName === "PACKET_GENERATED") eventName = "PACKET_GEN";

      if (!eventLogs[eventName]) eventLogs[eventName] = [];
      eventLogs[eventName].push(log);
    });
  }

  const steps = [];
  let highestCompletedIndex = -1;

  coreSteps.forEach((core, index) => {
    const logs = eventLogs[core.key] || [];
    const hasLogs = logs.length > 0;
    
    const completionLog = logs.find(l => 
        l.status === "SUCCESS" || l.event?.includes("COMPLETE") || (l.step && l.result)
    );
    
    let isCompleted = !!completionLog;
    if (core.key === "CASE_CREATED") isCompleted = true; // Always completed if we have a case
    
    if (isCompleted) highestCompletedIndex = index;

    const startLog = logs[0];
    const endLog = completionLog || logs[logs.length - 1];
    
    let status = "PENDING";
    if (isCompleted) {
        status = (core.key === "GAP_ANALYSIS" && completionLog?.status === "GAP_FOUND") ? "GAP_FOUND" : "COMPLETED";
        if (core.key === "ELIGIBILITY" && caseStatus === "APPROVED") status = "APPROVED";
        if (core.key === "ELIGIBILITY" && caseStatus === "DENIED") status = "DENIED";
    } else if (hasLogs) {
        status = "RUNNING";
    }

    const formatTimestamp = (ts) => {
        if (!ts) return "Pending";
        const dateStr = (typeof ts === "string" && !ts.includes("Z") && !ts.includes("+")) ? `${ts}Z` : ts;
        return new Date(dateStr).toLocaleString();
    };

    let duration = "0s";
    if (hasLogs) {
        const totalDurationMs = logs.reduce((acc, log) => acc + (log.duration_ms || 0), 0);
        duration = totalDurationMs > 0 
            ? (totalDurationMs > 1000 ? `${(totalDurationMs / 1000).toFixed(1)}s` : `${totalDurationMs}ms`)
            : (startLog && endLog ? calculateDuration(startLog.timestamp, endLog.timestamp) : "10ms");
    }

    let timestamp = "Pending";
    if (core.key === "CASE_CREATED" && caseData?.created_at) {
        timestamp = formatTimestamp(caseData.created_at);
    } else if (startLog) {
        timestamp = formatTimestamp(startLog.timestamp);
    }

    steps.push({
      id: core.key,
      name: core.name,
      status,
      description: core.desc,
      timestamp,
      completed: isCompleted,
      duration,
      icon: core.icon,
      isProcessing: status === "RUNNING"
    });
  });

  // ── LOGICAL BACKFILL ──
  steps.forEach((step, index) => {
    if (index < highestCompletedIndex && !step.completed) {
      step.completed = true;
      step.status = "COMPLETED";
      if (step.duration === "0s") step.duration = "100ms";
    }
    if (index === 0 && caseData?.created_at) {
        step.completed = true;
        if (step.status === "PENDING") step.status = "CREATED";
    }
  });

  // ── ACTIVE STEP LOGIC ──
  const isHalted = ["DENIED", "GAP_FOUND", "FAILED", "GAP_ANALYSIS_FAILED"].includes(caseStatus);
  
  if (!isHalted && !steps.find(s => s.status === "RUNNING")) {
      const nextStep = steps.find(s => s.status === "PENDING");
      if (nextStep) nextStep.status = "QUEUED";
  }

  return steps;
};

const calculateDuration = (startTime, endTime) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    if (diffMs < 1000) {
        return diffMs > 0 ? `${diffMs}ms` : "10ms"; 
    }
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return `${diffSecs}s`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ${diffSecs % 60}s`;
    return `${Math.floor(diffSecs / 3600)}h ${Math.floor((diffSecs % 3600) / 60)}m`;
  } catch { return "N/A"; }
};

const calculateActiveProcessingTime = (auditLog) => {
  if (!auditLog || auditLog.length === 0) return 0;
  let totalMs = 0;
  auditLog.forEach((log) => {
    if (log.duration_ms && typeof log.duration_ms === "number") totalMs += log.duration_ms;
  });
  if (totalMs === 0) {
    const grouped = {};
    auditLog.forEach((log) => {
      const eventBase = log.event?.replace(/_START$|_STARTED$|_COMPLETE$|_COMPLETED$/i, "");
      if (!eventBase) return;
      if (!grouped[eventBase]) grouped[eventBase] = { start: log.timestamp, end: log.timestamp };
      else {
        if (new Date(log.timestamp) < new Date(grouped[eventBase].start)) grouped[eventBase].start = log.timestamp;
        if (new Date(log.timestamp) > new Date(grouped[eventBase].end)) grouped[eventBase].end = log.timestamp;
      }
    });
    Object.values(grouped).forEach((g) => {
      const diff = new Date(g.end) - new Date(g.start);
      if (diff > 0 && diff < 3600000) totalMs += diff;
    });
  }
  return totalMs;
};

const formatDuration = (totalMs) => {
  const diffSecs = Math.floor(totalMs / 1000);
  const hours = Math.floor(diffSecs / 3600);
  const mins = Math.floor((diffSecs % 3600) / 60);
  const secs = diffSecs % 60;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`; 
};

const calculateEfficiency = (auditLog) => {
  if (!auditLog || auditLog.length === 0) return 0;
  let successfulRuns = 0;
  auditLog.forEach((log) => {
    const isInternal = ["ORCHESTRATOR", "STEP_START"].some(term => (log.event || "").includes(term) || (log.agent_name || "").includes(term));
    if (!isInternal && (log.status === "SUCCESS" || log.status === "COMPLETED" || log.status === "RUNNING" || log.result)) successfulRuns++;
  });
  return successfulRuns; 
};

const buildAgentExecutionSummary = (audit_log) => {
  if (!audit_log || audit_log.length === 0) return [];
  const grouped = {};
  
  // 1. Expanded internal noise filter
  const internalEvents = [
    "ORCHESTRATOR", "STEP_START", "STEP_END", "LLM_VERDICT", "PDF_BUILD", "BATCH_PA", 
    "EXTRACTION", "LOG", "STATUS", "RETRY", "ERROR_RETRY", "RAG_SEARCH", "CACHE_HIT"
  ];
  
  // 2. Comprehensive agent mapping to unify sub-tasks
  const agentMapping = {
    // Clinical Data Agent
    EHR_FETCH: "Clinical Data Agent", PATIENT_DATA: "Clinical Data Agent", EHR_DATA: "Clinical Data Agent", 
    EHR_CACHE: "Clinical Data Agent", EHR_SYNC: "Clinical Data Agent",
    
    // Gap Analysis Agent
    GAP_ANALYSIS: "Gap Analysis Agent", DELTA_ANALYSIS: "Gap Analysis Agent", POLICY_DATA: "Gap Analysis Agent", 
    REQUIRED_DOCS: "Gap Analysis Agent", POLICY_RAG: "Gap Analysis Agent", RULES_LOADED: "Gap Analysis Agent",
    
    // Eligibility Agent
    ELIGIBILITY: "Eligibility Agent", ELIGIBILITY_CHECK: "Eligibility Agent", VERDICT: "Eligibility Agent",
    REASONING: "Eligibility Agent", ELIGIBILITY_RUNNING: "Eligibility Agent",
    
    // Summarization Agent
    SUMMARIZATION: "Summarization Agent", AUTO_SUMMARIZATION: "Summarization Agent", 
    DISTILLED_SUMMARY: "Summarization Agent", PARALLEL_SUMMARIZE: "Summarization Agent",
    
    // PA Document Agent
    PACKET_GEN: "PA Document Agent", PA_CONTENT: "PA Document Agent", DOCUMENT_GENERATION: "PA Document Agent", 
    COVER_LETTER: "PA Document Agent", CLINICAL_SUMMARY: "PA Document Agent", CHECKLIST: "PA Document Agent",
    PDF_GENERATOR: "PA Document Agent",
    
    // Submission Agent
    SUBMISSION: "Submission Agent", SUBMITTED: "Submission Agent", INSURANCE_SUBMIT: "Submission Agent",
    AUTO_SUBMIT: "Submission Agent"
  };

  audit_log.forEach((log) => {
    const eventName = log.event || "";
    const agent_name = log.agent_name || "";
    
    // Skip if it's internal noise
    if (internalEvents.some((internal) => eventName.toUpperCase().includes(internal) || agent_name.toUpperCase().includes(internal))) return;
    
    let eventBase = "OTHER";
    if (log.event) eventBase = log.event.replace(/_START$|_STARTED$|_COMPLETE$|_COMPLETED$/i, "");
    else if (log.step) eventBase = log.step.toUpperCase();
    
    // Map to a parent agent
    const mappedAgentName = agentMapping[eventBase] || agentMapping[agent_name] || eventBase.replace(/_/g, " ").toUpperCase();
    const groupKey = agentMapping[eventBase] || mappedAgentName;
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = { 
        agent_name: groupKey, 
        event: log.event || `${log.step}_COMPLETED`, 
        start_time: log.timestamp, 
        end_time: log.timestamp, 
        status: log.status || "RUNNING", 
        count: 1 
      };
    } else {
      grouped[groupKey].count++;
      if (new Date(log.timestamp) < new Date(grouped[groupKey].start_time)) grouped[groupKey].start_time = log.timestamp;
      if (new Date(log.timestamp) > new Date(grouped[groupKey].end_time)) {
        grouped[groupKey].end_time = log.timestamp;
        if (log.status === "FAILED" || log.status === "ERROR") grouped[groupKey].status = log.status;
        else if (grouped[groupKey].status !== "FAILED" && grouped[groupKey].status !== "ERROR") grouped[groupKey].status = log.status || "SUCCESS";
      }
    }
  });
  
  return Object.values(grouped).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
};

const getStatusLabel = (caseStatus) => {
  const statusMap = { DRAFT: "Ready", EHR_FETCHING: "Processing EHR", GAP_FOUND: "Documents Needed", GAP_CLEARED: "Reviewing", ELIGIBILITY_RUNNING: "Verifying Eligibility", APPROVED: "Approved", PACKET_READY: "Ready for Submission", ELIGIBILITY_REVIEW: "Pending Approval" };
  return statusMap[caseStatus] || caseStatus || "Ready";
};

const calculateProgressMetrics = (caseData, auditLog) => {
  if (!caseData) return { progressLabel: "Upload Documents", progressCurrent: 0, progressTotal: 1, elapsedTime: "0s" };
  const steps = transformAuditToSteps(auditLog, caseData);
  const progressCurrent = steps.filter(s => s.completed).length;
  const progressTotal = 6;
  let progressLabel = "Awaiting EHR";
  if (progressCurrent === 0) progressLabel = "Processing Started";
  else if (progressCurrent === progressTotal) progressLabel = "Workflow Complete";
  else {
      const activeStep = steps.find(s => s.status === "RUNNING") || steps.find(s => s.status === "QUEUED");
      progressLabel = activeStep ? activeStep.name : `${progressCurrent} of ${progressTotal} Steps`;
  }
  const activeMs = calculateActiveProcessingTime(auditLog);
  return { progressLabel, progressCurrent, progressTotal, elapsedTime: formatDuration(activeMs) };
};
