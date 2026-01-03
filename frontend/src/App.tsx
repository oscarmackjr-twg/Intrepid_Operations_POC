// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RunListPage } from "./pages/RunListPage";
import { RunSummaryPage } from "./pages/RunSummaryPage";
import { RunExceptionsPage } from "./pages/RunExceptionsPage";
import { Layout } from "./components/Layout";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* This ensures you always see the layout frame + content */}
      <Layout>
        <Routes>
          {/* Home: list of runs */}
          <Route path="/" element={<RunListPage />} />

          {/* Run summary detail */}
          <Route path="/runs/:runId" element={<RunSummaryPage />} />

          {/* Exceptions for a run */}
          <Route path="/runs/:runId/exceptions" element={<RunExceptionsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </div>
  );
};

export default App;
