import { Router, Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const router = Router();

type RunPipelineBody = {
  runId: string;

  primeExhibitA: string;
  sfyExhibitA: string;
  masterSheet: string;
  masterSheetNotes: string;

  tapeCsv?: string;
  fx3Csv?: string;
  fx4Csv?: string;

  // NEW: CoMAP grid Excel path
  comapXlsx?: string;

  outputDir: string;
  dryRun?: boolean;
  dbUrl?: string; // optional override, otherwise env LOAN_ENGINE_DB_URL
};

function exists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

router.post("/run", async (req: Request, res: Response) => {
  const body = req.body as Partial<RunPipelineBody>;

  const required = [
    "runId",
    "primeExhibitA",
    "sfyExhibitA",
    "masterSheet",
    "masterSheetNotes",
    "outputDir",
  ] as const;

  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return res.status(400).json({ error: "Missing required fields", missing });
  }

  const {
    runId,
    primeExhibitA,
    sfyExhibitA,
    masterSheet,
    masterSheetNotes,
    tapeCsv,
    fx3Csv,
    fx4Csv,
    comapXlsx,
    outputDir,
    dryRun,
    dbUrl,
  } = body as RunPipelineBody;

  // Repo root: rely on the process working directory (run `npm` from repo root)
  const repoRoot = process.cwd();

  // Resolve input paths relative to repo root if they are relative
  const resolvePath = (p: string) => (path.isAbsolute(p) ? p : path.join(repoRoot, p));

  const primePath = resolvePath(primeExhibitA);
  const sfyPath = resolvePath(sfyExhibitA);
  const masterPath = resolvePath(masterSheet);
  const notesPath = resolvePath(masterSheetNotes);
  const outDirPath = resolvePath(outputDir);

  const tapePath = tapeCsv ? resolvePath(tapeCsv) : undefined;
  const fx3Path = fx3Csv ? resolvePath(fx3Csv) : undefined;
  const fx4Path = fx4Csv ? resolvePath(fx4Csv) : undefined;

  // NEW: CoMAP grid path
  const comapPath = comapXlsx ? resolvePath(comapXlsx) : undefined;

  const inputsToCheck: [string, string | undefined][] = [
    ["primeExhibitA", primePath],
    ["sfyExhibitA", sfyPath],
    ["masterSheet", masterPath],
    ["masterSheetNotes", notesPath],
    ["tapeCsv", tapePath],
    ["fx3Csv", fx3Path],
    ["fx4Csv", fx4Path],
    ["comapXlsx", comapPath],
  ];

  const missingFiles = inputsToCheck
    .filter(([, p]) => p && !exists(p))
    .map(([name, p]) => ({ name, path: p }));

  if (missingFiles.length) {
    return res.status(400).json({
      error: "One or more input files do not exist on the server",
      missingFiles,
      repoRoot,
    });
  }

  // Ensure output directory exists
  fs.mkdirSync(outDirPath, { recursive: true });

  const pythonExe = process.env.PYTHON_EXE || "python";
  const scriptPath = path.join(repoRoot, "python", "run_pipeline.py");

  if (!exists(scriptPath)) {
    return res.status(500).json({
      error: "run_pipeline.py not found",
      scriptPath,
      repoRoot,
    });
  }

  const args: string[] = [
    scriptPath,
    "--run-id",
    runId,
    "--prime-exhibit-a",
    primePath,
    "--sfy-exhibit-a",
    sfyPath,
    "--master-sheet",
    masterPath,
    "--master-sheet-notes",
    notesPath,
    "--output-dir",
    outDirPath,
  ];

  if (tapePath) args.push("--tape", tapePath);
  if (fx3Path) args.push("--fx3", fx3Path);
  if (fx4Path) args.push("--fx4", fx4Path);

  // NEW: pass CoMAP grid path if provided
  if (comapPath) args.push("--comap-xlsx", comapPath);

  if (dryRun) args.push("--dry-run");

  // Allow dbUrl override from request; else use env LOAN_ENGINE_DB_URL
  const effectiveDbUrl = dbUrl || process.env.LOAN_ENGINE_DB_URL;
  if (effectiveDbUrl) {
    args.push("--db-url", effectiveDbUrl);
  }

  const proc = spawn(pythonExe, args, {
    cwd: repoRoot,
    env: process.env,
    windowsHide: true,
  });

  let stdout = "";
  let stderr = "";

  proc.stdout.on("data", (d) => (stdout += d.toString()));
  proc.stderr.on("data", (d) => (stderr += d.toString()));

  proc.on("error", (err) => {
    return res.status(500).json({
      error: "Failed to start pipeline",
      details: String(err),
      pythonExe,
      args,
    });
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: "Pipeline execution failed",
        exitCode: code,
        stdout,
        stderr,
      });
    }

    const artifacts = {
      engineInputCsv: path.join(outDirPath, "engine_input.csv"),
      borrowingFile: path.join(outDirPath, "borrowing_file.csv"),
      ratiosXlsx: path.join(outDirPath, "ratios.xlsx"),
      exceptionsCsv: path.join(outDirPath, "exceptions.csv"),
      comapNotPassedXlsx: path.join(outDirPath, "comap_not_passed.xlsx"),
      purchasePriceMismatchXlsx: path.join(outDirPath, "purchase_price_mismatch.xlsx"),
      purchasePriceMismatchCsv: path.join(outDirPath, "purchase_price_mismatch.csv"),
      // NEW:
      flaggedLoansXlsx: path.join(outDirPath, "flagged_loans.xlsx"),
      notesFlaggedLoansXlsx: path.join(outDirPath, "NOTES_Flagged_loans.xlsx"),
      manifest: path.join(outDirPath, "run_manifest.json"),
    };


    // Count exceptions rows if present
    let exceptionCount = 0;
    if (exists(artifacts.exceptionsCsv)) {
      const lines = fs.readFileSync(artifacts.exceptionsCsv, "utf8").split(/\r?\n/);
      exceptionCount = Math.max(0, lines.length - 1);
    }

    return res.json({
      runId,
      artifacts,
      exceptionCount,
      stdout,
      stderr,
    });
  });
});

export default router;
