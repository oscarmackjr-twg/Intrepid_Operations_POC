// app.ts
import express from "express";

import runs from "./routes/runs";
import summary from "./routes/summary";
import exceptions from "./routes/exceptions";
import loanDetail from "./routes/loanDetail";
import portfolioExceptions from "./routes/portfolioExceptions";

const app = express();
app.use(express.json());

app.use("/api/runs", runs);
app.use("/api/summary", summary);
app.use("/api/exceptions", exceptions);
app.use("/api/loan", loanDetail);
app.use("/api/portfolio-exceptions", portfolioExceptions);

export default app;