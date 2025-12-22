import { Router, Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const router = Router();

type BuildDatasetBody = {
  primeExhibitA: string;
  sfyExhibitA: string;
  masterSheet: string;
  masterSheetNotes: string;
  outputCsv: string;
};

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

router.post("/build", async (req: Request, res: Response) => {
  const body = req.body as Partial<BuildDatasetBody>;

  const required: (keyof BuildDatasetBody)[] = [
    "primeExhibitA",
    "sfyExhibitA",
    "masterSheet",
    "masterSheetNotes",
    "outputCsv",
  ];

  const missing = required.filter((k) => !body[k]);
  if (missing.length) {
    return res.status(400).json({
      error: "Missing required fields",
      missing,
    });
  }

  const primeExhibitA = body.primeExhibitA!;
  const sfyExhibitA = body.sfyExhibitA!;
  const masterSheet = body.masterSheet!;
  const masterSheetNotes = body.masterSheetNotes!;
  const outputCsv = body.outputCsv!;

  // Basic server-side path checks (helps diagnose bad client paths quickly)
  const missingFiles = [
    ["primeExhibitA", primeExhibitA],
    ["sfyExhibitA", sfyExhibitA],
    ["masterSheet", masterSheet],
    ["masterSheetNotes", masterSheetNotes],
  ].filter(([, p]) => !fileExists(p));

  if (missingFiles.length) {
    return res.status(400).json({
      error: "One or more input files do not exist on the server",
      missingFiles: missingFiles.map(([name, p]) => ({ name, path: p })),
      note:
        "If you are selecting files in the browser, you likely need an upload endpoint instead of sending local file paths.",
    });
  }

  // Use venv python if provided (recommended for Windows)
  const pythonExe = process.env.PYTHON_EXE || "python";

  // repoRoot should be the folder that contains /python and /backend.
  // If this file is backend/routes/dataset.ts -> repoRoot is ../..
  const repoRoot = path.resolve(__dirname, "..", "..");

  const scriptPath = path.join(repoRoot, "python", "build_dataset.py");

  if (!fileExists(scriptPath)) {
    return res.status(500).json({
      error: "build_dataset.py not found",
      scriptPath,
      repoRoot,
    });
  }

  const args = [
    scriptPath,
    "--prime-exhibit-a",
    primeExhibitA,
    "--sfy-exhibit-a",
    sfyExhibitA,
    "--master-sheet",
    masterSheet,
    "--master-sheet-notes",
    masterSheetNotes,
    "--output-csv",
    outputCsv,
  ];

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
      error: "Failed to spawn python process",
      details: String(err),
      pythonExe,
      scriptPath,
      args,
    });
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: "build_dataset failed",
        exitCode: code,
        pythonExe,
        scriptPath,
        args,
        stdout,
        stderr,
      });
    }

    return res.json({
      outputCsv,
      stdout,
      stderr, // keep for diagnostics; often empty on success
    });
  });
});

export default router;
