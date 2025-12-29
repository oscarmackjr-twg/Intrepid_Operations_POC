// backend/app.ts
import express from "express";
import cors from "cors";

import runs from "./routes/runs";
import summary from "./routes/summary";
import exceptions from "./routes/exceptions";
import loanDetail from "./routes/loandetail";
import portfolioExceptions from "./routes/portfolioExceptions";
import dataset from "./routes/dataset";
import pipeline from "./routes/pipeline";

console.log("[app] Creating Express app");

const app = express();

// --- ENABLE CORS ---
app.use(
  cors({
    origin: "http://localhost:5173", // React dev server
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// --- ROUTES ---
app.use("/api/runs", runs);
app.use("/api/summary", summary);
app.use("/api/exceptions", exceptions);
app.use("/api/loan", loanDetail);
app.use("/api/portfolio-exceptions", portfolioExceptions);
app.use("/api/dataset", dataset);
app.use("/api/pipeline", pipeline);

// Simple health check route (optional but handy)
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

export default app;
