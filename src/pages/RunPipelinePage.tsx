// src/pages/RunPipelinePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api } from "../api";

const todayIso = new Date().toISOString().slice(0, 10);

export const RunPipelinePage: React.FC = () => {
  const navigate = useNavigate();
  const [asOfDate, setAsOfDate] = useState(todayIso);
  const [irrTarget, setIrrTarget] = useState(8.05);
  const [portfolio, setPortfolio] = useState<"PRIME" | "SFY" | "ALL">("ALL");

  // You can pre-fill these with your typical folder/paths or leave blank
  const [primeExhibitA, setPrimeExhibitA] = useState("inputs/prime.xlsx");
  const [sfyExhibitA, setSfyExhibitA] = useState("inputs/sfy.xlsx");
  const [masterSheet, setMasterSheet] = useState("inputs/master.xlsx");
  const [masterSheetNotes, setMasterSheetNotes] = useState("inputs/notes.xlsx");
  const [tape, setTape] = useState("inputs/tape.csv");
  const [fx3, setFx3] = useState("inputs/FX3.xlsx");
  const [fx4, setFx4] = useState("inputs/FX4.xlsx");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResultMessage(null);

    try {
      const res = await Api.runPipeline({
        asOfDate,
        irrTarget,
        portfolio,
        inputFiles: {
          primeExhibitA,
          sfyExhibitA,
          masterSheet,
          masterSheetNotes,
          tape,
          fx3,
          fx4,
        },
      });

      setResultMessage(
        `Run ${res.runId} started with status ${res.status}${
          res.message ? `: ${res.message}` : ""
        }`
      );

      // If the backend returns COMPLETED immediately, you can jump
      // straight to the run summary. Otherwise, go to the runs list.
      if (res.status === "COMPLETED" || res.status === "RUNNING") {
        navigate(`/runs/${encodeURIComponent(res.runId)}`);
      } else {
        navigate("/runs");
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to start pipeline");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Run Loan Engine Pipeline</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="border rounded p-3">
          <legend className="font-medium">Run Parameters</legend>

          <label className="block mb-2">
            <span className="block text-sm font-medium">As-of Date</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">IRR Target (%)</span>
            <input
              type="number"
              step="0.01"
              value={irrTarget}
              onChange={(e) => setIrrTarget(parseFloat(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">Portfolio</span>
            <select
              value={portfolio}
              onChange={(e) =>
                setPortfolio(e.target.value as "PRIME" | "SFY" | "ALL")
              }
              className="border rounded px-2 py-1 w-full"
            >
              <option value="ALL">All</option>
              <option value="PRIME">Prime</option>
              <option value="SFY">SFY</option>
            </select>
          </label>
        </fieldset>

        <fieldset className="border rounded p-3">
          <legend className="font-medium">Input Files / Identifiers</legend>

          <label className="block mb-2">
            <span className="block text-sm font-medium">
              Prime Exhibit A path
            </span>
            <input
              type="text"
              value={primeExhibitA}
              onChange={(e) => setPrimeExhibitA(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">
              SFY Exhibit A path
            </span>
            <input
              type="text"
              value={sfyExhibitA}
              onChange={(e) => setSfyExhibitA(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">MASTER_SHEET path</span>
            <input
              type="text"
              value={masterSheet}
              onChange={(e) => setMasterSheet(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">
              MASTER_SHEET - Notes path
            </span>
            <input
              type="text"
              value={masterSheetNotes}
              onChange={(e) => setMasterSheetNotes(e.target.value)}
              className="border rounded px-2 py-1 w-full"
              required
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">Tape path</span>
            <input
              type="text"
              value={tape}
              onChange={(e) => setTape(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">FX3 path</span>
            <input
              type="text"
              value={fx3}
              onChange={(e) => setFx3(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </label>

          <label className="block mb-2">
            <span className="block text-sm font-medium">FX4 path</span>
            <input
              type="text"
              value={fx4}
              onChange={(e) => setFx4(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </label>
        </fieldset>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {resultMessage && (
          <p className="text-green-700 text-sm">{resultMessage}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        >
          {submitting ? "Running..." : "Run Pipeline"}
        </button>
      </form>
    </div>
  );
};

export default RunPipelinePage;
