import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RunsPage from "./pages/RunsPage";
import RunSummaryPage from "./pages/RunSummaryPage";
import ExceptionsPage from "./pages/ExceptionsPage";
import NavBar from "./components/NavBar";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/runs" element={<RunsPage />} />
        <Route path="/runs/:runId" element={<RunSummaryPage />} />
        <Route path="/runs/:runId/exceptions" element={<ExceptionsPage />} />
      </Routes>
    </>
  );
}

