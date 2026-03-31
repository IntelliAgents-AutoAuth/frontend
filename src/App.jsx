/**
 * App.jsx — Frontend Entry Point & Routing
 * ========================================
 * 
 * This is the main shell of the IntelliAgents React application.
 * It defines the client-side routing structure using 'react-router-dom', 
 * ensuring that users can navigate between the Login, Dashboard, 
 * and Case-specific views.
 *
 * Core Routes:
 * ------------
 * /login             : User authentication.
 * /dashboard         : Main overview of all cases and status cards.
 * /new-case          : Form to start a new Prior Authorization request.
 * /cases/:id/prefill : EHR data extraction and patient review.
 * /cases/:id         : Interactive case view (Orchestrator interface).
 * /pa-status         : Real-time monitoring of payer outcomes.
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewCase from "./pages/NewCase";
import EhrPrefill from "./pages/EhrPrefill";
import CaseDetails from "./pages/CaseDetails";
import CasesData from "./pages/CasesData";
import PAStatusMonitor from "./pages/PAStatusMonitor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-case" element={<NewCase />} />
        <Route path="/cases/:id/prefill" element={<EhrPrefill />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/cases-data" element={<CasesData />} />
        <Route path="/pa-status" element={<PAStatusMonitor />} />
        {/* Wildcard to redirect back to login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
