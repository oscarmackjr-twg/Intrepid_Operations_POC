// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";

import LandingPage from "./pages/LandingPage";
import RunsPage from "./pages/RunsPage";
import RunSummaryPage from "./pages/RunSummaryPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import RunPipelinePage from "./pages/RunPipelinePage";
import LoanDetailPage from "./pages/LoanDetailPage";
// import HealthPage from "./pages/HealthPage"; // optional, if you implement it

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Runs & summaries */}
            <Route path="/runs" element={<RunsPage />} />
            <Route path="/runs/:runId" element={<RunSummaryPage />} />
            <Route
              path="/runs/:runId/exceptions"
              element={<ExceptionsPage />}
            />
            <Route
              path="/runs/:runId/loan/:loanNo"
              element={<LoanDetailPage />}
            />

            {/* Run pipeline */}
            <Route path="/run-pipeline" element={<RunPipelinePage />} />

            {/* Health (optional) */}
            {/* <Route path="/health" element={<HealthPage />} /> */}

            {/* Fallback */}
            <Route
              path="*"
              element={
                <div className="p-4">
                  <h1 className="text-xl font-semibold mb-2">
                    404 – Page not found
                  </h1>
                  <p className="mb-2">
                    The page you are looking for does not exist.
                  </p>
                  <a href="/" className="text-blue-600 underline">
                    Go back home
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
