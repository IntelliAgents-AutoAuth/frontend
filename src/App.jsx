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
