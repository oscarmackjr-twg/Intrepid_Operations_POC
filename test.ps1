Invoke-RestMethod `
  -Uri http://localhost:3001/api/pipeline/run `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    runId           = "TEST_RUN_003"

    primeExhibitA   = "inputs\prime.xlsx"
    sfyExhibitA     = "inputs\sfy.xlsx"
    masterSheet     = "inputs\master.xlsx"
    masterSheetNotes= "inputs\notes.xlsx"

    # Optional extras – include only if you have these CSVs
    tapeCsv        = "inputs\tape.csv"
    # fx3Csv         = "inputs\fx3.csv"
    # fx4Csv         = "inputs\fx4.csv"

    outputDir       = "outputs\TEST_RUN_003"
    dryRun          = $false

    # Optional: override DB URL if you don't want to use LOAN_ENGINE_DB_URL env var
    dbUrl         = "postgresql://postgres:Gillian2026!!!@localhost:5432/intrepid"
  } | ConvertTo-Json)
