import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { usePAStatusData } from "../hooks/usePAStatusData";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Calendar,
  ChevronDown,
  Zap,
  Shield,
  ShieldCheck,
  Package,
} from "lucide-react";

const PAStatusDashboard = ({
  caseData = null,
  caseId = null,
  workflowData = null,
  isEmbedded = true,
  onUploadClick = null,
  missingDocuments = null,
}) => {
  // Fetch real PA status data from backend
  const { workflowData: realWorkflowData, loading } = usePAStatusData(
    caseId,
    caseData,
  );

  // Use only real data from backend - no mock data fallbacks
  const finalCaseData = caseData;
  const finalStatusSteps = realWorkflowData?.steps || [];

  const totalTime = realWorkflowData?.totalTime;
  const efficiency = realWorkflowData?.efficiency;
  const agentExecutionSummary = realWorkflowData?.agentExecutionSummary || [];

  // Real progress metrics from backend
  const statusLabel = realWorkflowData?.statusLabel;
  const progressLabel = realWorkflowData?.progressLabel;
  const progressCurrent = realWorkflowData?.progressCurrent;
  const progressTotal = realWorkflowData?.progressTotal;
  const elapsedTime = realWorkflowData?.elapsedTime;

  const getStatusColor = (status) => {
    const colors = {
      CREATED: "bg-blue-50 text-blue-700 border-blue-200",
      GAP_FOUND: "bg-yellow-50 text-yellow-700 border-yellow-200",
      DOCUMENTS_UPLOADED: "bg-purple-50 text-purple-700 border-purple-200",
      GAP_CLEARED: "bg-green-50 text-green-700 border-green-200",
      ELIGIBILITY_RUNNING: "bg-cyan-50 text-cyan-700 border-cyan-200",
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      PACKET_READY: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
    return colors[status] || colors.CREATED;
  };

  const getCompletedStepsCount = () =>
    finalStatusSteps.filter((s) => s.completed).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Loading/Processing State */}
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div>
            <p className="text-sm font-semibold text-blue-700">
              PA System Processing...
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Agents analyzing case data and generating authorization package
            </p>
          </div>
        </div>
      )}

      {/* No Real Data Yet */}
      {!loading && realWorkflowData?.hasRealData === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0 flex items-center justify-center">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Processing New Case
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Backend agents are analyzing your case. Workflow data will appear
              once processing begins. This usually takes a few moments.
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards - Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {/* Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={20} strokeWidth={1.5} />
            </div>
            <span
              className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-1 rounded ${
                statusLabel === "Ready"
                  ? "bg-emerald-50 text-emerald-600"
                  : statusLabel === "Approved"
                    ? "bg-green-50 text-green-600"
                    : "bg-yellow-50 text-yellow-600"
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Status
          </p>
          <p className="text-sm font-bold text-slate-900">{statusLabel}</p>
        </div>

        {/* Agent Execution Card - Real Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} strokeWidth={1.5} />
            </div>
            <span className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">
              Real Data
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Agents Running
          </p>
          {realWorkflowData?.hasRealData ? (
            <>
              <p className="text-sm font-bold text-slate-900">
                {agentExecutionSummary && agentExecutionSummary.length > 0
                  ? `${agentExecutionSummary.length} Agent${agentExecutionSummary.length !== 1 ? "s" : ""}`
                  : "No agents tracked"}
              </p>
              {agentExecutionSummary && agentExecutionSummary.length > 0 && (
                <div className="text-[8px] text-slate-600 mt-2 space-y-0.5">
                  {agentExecutionSummary.slice(0, 2).map((agent, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {agent.agent_name}
                    </div>
                  ))}
                  {agentExecutionSummary.length > 2 && (
                    <p className="text-slate-500">
                      +{agentExecutionSummary.length - 2} more
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Awaiting audit log data...
            </p>
          )}
        </div>

        {/* Agent Automation Highlights Card - Real Data */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={20} strokeWidth={1.5} />
            </div>
            <span className="text-[8px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
              Real Data
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Key Operations
          </p>
          {realWorkflowData?.hasRealData &&
          efficiency !== null &&
          efficiency !== undefined ? (
            <>
              <p className="text-sm font-bold text-slate-900">
                {efficiency} Operations
              </p>
              <p className="text-[8px] text-slate-600 mt-2">
                Real agent operations from workflow
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Calculating metrics...
            </p>
          )}
        </div>

        {/* Time Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-orange-200 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <Clock size={20} strokeWidth={1.5} />
            </div>
            <span className="text-[8px] font-extrabold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded">
              Elapsed
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            Processing
          </p>
          <p className="text-sm font-bold text-slate-900">{elapsedTime}</p>
        </div>
      </motion.div>

      {/* Timeline Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-[#38A3A5]/10 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-[#38A3A5]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[11px] font-extrabold text-[#38A3A5] uppercase tracking-widest">
            Workflow Timeline
          </h3>
        </div>

        <div className="space-y-4">
          {(finalStatusSteps && finalStatusSteps.length > 0
            ? finalStatusSteps
            : []
          ).map((step, index) => {
            const Icon = step.icon;
            const isLast =
              index ===
              (finalStatusSteps && finalStatusSteps.length > 0
                ? finalStatusSteps
                : []
              ).length -
                1;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="flex gap-4"
              >
                {/* Timeline connector */}
                <div className="flex flex-col items-center shrink-0">
                  <motion.div
                    animate={
                      step.completed ? { scale: [1, 1.15, 1] } : { scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      step.completed
                        ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                  </motion.div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-12 my-1.5 ${
                        step.completed ? "bg-emerald-200" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 pt-0.5 pb-2">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        {step.name}
                      </h4>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap ${getStatusColor(
                        step.status,
                      )}`}
                    >
                      {step.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} className="opacity-60" />
                    {step.timestamp} • {step.duration}
                  </p>

                  {/* Display missing documents for Gap Analysis step */}
                  {step.name === "Gap Analysis" &&
                    missingDocuments &&
                    missingDocuments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                          Missing Documents:
                        </p>
                        <ul className="space-y-1">
                          {missingDocuments.slice(0, 3).map((doc, docIdx) => (
                            <li
                              key={docIdx}
                              className="text-[8px] text-slate-600 flex items-start gap-2"
                            >
                              <span className="text-slate-400 mt-0.5">•</span>
                              <span className="line-clamp-2">
                                {typeof doc === "string"
                                  ? doc
                                  : doc.document_name || doc.name}
                              </span>
                            </li>
                          ))}
                          {missingDocuments.length > 3 && (
                            <li className="text-[8px] text-slate-500 italic">
                              +{missingDocuments.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PAStatusDashboard;
