/**
 * Status Colors & Icons Mapping
 * Centralizes all case status color and icon references
 * Used across CaseDetails, CasesData, PAStatusDashboard
 */
import {
  CheckCircle2,
  AlertCircle,
  Upload,
  Shield,
  Package,
  XCircle,
} from "lucide-react";

// Status to color class mapping
export const STATUS_COLORS = {
  CREATED: "bg-blue-50 text-blue-700 border-blue-200",
  GAP_FOUND: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DOCUMENTS_UPLOADED: "bg-purple-50 text-purple-700 border-purple-200",
  GAP_CLEARED: "bg-green-50 text-green-700 border-green-200",
  ELIGIBILITY_RUNNING: "bg-cyan-50 text-cyan-700 border-cyan-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DENIED: "bg-rose-50 text-rose-700 border-rose-100",
  PACKET_READY: "bg-indigo-50 text-indigo-700 border-indigo-200",
  GAP_ANALYSIS_REQUIRED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  DOCUMENTS_NEEDED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PENDING_APPROVAL: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ELIGIBILITY_REVIEW: "bg-cyan-50 text-cyan-700 border-cyan-200",
};

// Status to icon mapping
export const STATUS_ICONS = {
  CREATED: CheckCircle2,
  GAP_FOUND: AlertCircle,
  DOCUMENTS_UPLOADED: Upload,
  GAP_CLEARED: CheckCircle2,
  ELIGIBILITY_RUNNING: Shield,
  APPROVED: CheckCircle2,
  DENIED: XCircle,
  PACKET_READY: Package,
  GAP_ANALYSIS_REQUIRED: AlertCircle,
  DOCUMENTS_NEEDED: Upload,
  PENDING_APPROVAL: Package,
  ELIGIBILITY_REVIEW: Shield,
};

/**
 * Get color classes for a status
 * @param {string} status - Case status
 * @returns {string} Tailwind color classes
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.CREATED;
};

/**
 * Get icon component for a status
 * @param {string} status - Case status
 * @returns {React.Component} Icon component
 */
export const getStatusIcon = (status) => {
  return STATUS_ICONS[status] || CheckCircle2;
};

// Badge color shortcuts
export const BADGE_COLORS = {
  success: "bg-emerald-50 text-emerald-600 border-emerald-200",
  warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
  error: "bg-rose-50 text-rose-600 border-rose-100",
  info: "bg-blue-50 text-blue-600 border-blue-200",
  primary: "bg-[#38A3A5]/10 text-[#38A3A5] border border-[#38A3A5]/20",
};

// Progress colors
export const PROGRESS_COLORS = {
  complete: "bg-emerald-500",
  inProgress: "bg-blue-500",
  pending: "bg-amber-500",
  failed: "bg-rose-500",
};
