// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RunListPage } from "./pages/RunListPage";
import { RunSummaryPage } from "./pages/RunSummaryPage";
import { RunExceptionsPage } from "./pages/RunExceptionsPage";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Home: list of runs */}
      <Route path="/" element={<RunListPage />} />

      {/* Run summary detail */}
      <Route path="/runs/:runId" element={<RunSummaryPage />} />

      {/* Exceptions for a run */}
      <Route path="/runs/:runId/exceptions" element={<RunExceptionsPage />} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
