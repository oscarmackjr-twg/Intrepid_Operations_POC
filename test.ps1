Invoke-RestMethod `
  -Uri http://localhost:3001/api/pipeline/run `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    runId            = "TEST_RUN_008"

    primeExhibitA    = "inputs\prime.xlsx"
    sfyExhibitA      = "inputs\sfy.xlsx"
    masterSheet      = "inputs\master.xlsx"
    masterSheetNotes = "inputs\notes.xlsx"

    tapeCsv          = "inputs\tape.csv"

    # NEW: path to your CoMAP grid file (relative to repo root or absolute)
    comapXlsx        = "inputs\Underwriting_Grids_COMAP.xlsx"

    outputDir        = "outputs\TEST_RUN_008"
    dryRun           = $false

    dbUrl            = "postgresql://postgres:Gillian2026!!!@localhost:5432/intrepid"
  } | ConvertTo-Json)
