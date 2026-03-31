import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Reusable Loading Spinner Component
 * Consolidates spinner used in 5+ files
 */
export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-[#38A3A5]/10 border-t-[#38A3A5] rounded-full animate-spin ${className}`}
    />
  );
};

/**
 * Loading State Display
 * Full page loading with spinner and message
 */
export const LoadingDisplay = ({
  message = "Loading...",
  fullPage = false,
}) => {
  const containerClass = fullPage
    ? "min-h-screen flex flex-col items-center justify-center"
    : "flex flex-col items-center justify-center gap-4 text-slate-400 py-32";

  return (
    <div className={containerClass}>
      <LoadingSpinner size={fullPage ? "lg" : "md"} />
      <p className="font-bold text-xs uppercase tracking-widest">{message}</p>
    </div>
  );
};

/**
 * Error State Display
 * Shows error message with optional retry button
 */
export const ErrorDisplay = ({ error, onRetry = null, fullPage = true }) => {
  const containerClass = fullPage
    ? "min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center"
    : "bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center text-center";

  return (
    <div className={containerClass}>
      <AlertTriangle size={32} className="text-rose-500 mb-4" />
      <h2 className="text-sm font-bold text-slate-800 mb-4">{error}</h2>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 h-10 rounded-xl bg-[#38A3A5] hover:bg-[#2D8284] text-white font-bold text-xs uppercase transition-all"
        >
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * Empty State Display
 * Shows when there's no data to display
 */
export const EmptyDisplay = ({
  message = "No data available",
  icon: Icon = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-32 text-slate-400">
      {Icon && <Icon size={32} className="text-slate-300" />}
      <p className="font-bold text-xs uppercase tracking-widest">{message}</p>
    </div>
  );
};
