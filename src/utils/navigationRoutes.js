/**
 * Centralized Application Routes
 * Consolidates navigation endpoints used across 8+ pages
 * Eliminates duplicate navigation onClick handlers
 */

export const ROUTES = {
  // Auth
  LOGIN: "/login",
  LOGOUT: "/logout",

  // Dashboard
  DASHBOARD: "/dashboard",
  CASES_DATA: "/cases-data",

  // Cases
  NEW_CASE: "/new-case",
  CASE_DETAILS: (caseId) => `/cases/${caseId}`,
  CASE_EDIT: (caseId) => `/cases/${caseId}/edit`,

  // EHR Integration
  EHR_PREFILL: (caseId) => `/cases/${caseId}/prefill`,
  EHR_SYNC: (caseId) => `/cases/${caseId}/ehr-sync`,

  // PA Workflow
  PA_STATUS: "/pa-status",
  PA_DETAILS: (caseId) => `/pa/${caseId}`,

  // Reports
  CASE_REPORTS: "/reports",
  CASE_REPORT: (caseId) => `/reports/${caseId}`,

  // Admin
  ADMIN: "/admin",
  SETTINGS: "/settings",
};

/**
 * Get all navigation links for sidebar/menu
 */
export const getNavLinks = () => [
  { id: "dashboard", label: "Dashboard", href: ROUTES.DASHBOARD },
  { id: "cases", label: "Cases Data", href: ROUTES.CASES_DATA },
  { id: "reports", label: "Case Reports", href: ROUTES.CASE_REPORTS },
  { id: "ehr", label: "EHR Integration", href: ROUTES.EHR_PREFILL("") },
];

/**
 * Check if current route matches a nav link
 */
export const isActiveRoute = (currentPath, routePath) => {
  return currentPath === routePath || currentPath.startsWith(routePath + "/");
};
