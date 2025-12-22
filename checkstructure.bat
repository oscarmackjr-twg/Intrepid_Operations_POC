@echo off
setlocal ENABLEDELAYEDEXPANSION

echo.
echo ========================================
echo  Loan Review App – Structure Check
echo ========================================
echo.

set FAIL=0

REM ----------------------------
REM Helper functions
REM ----------------------------
call :check_dir backend
call :check_dir backend\routes
call :check_dir backend\db
call :check_dir rules
call :check_dir tests
call :check_dir tests\data

call :check_file backend\app.ts
call :check_file backend\db\pool.ts

call :check_file backend\routes\runs.ts
call :check_file backend\routes\summary.ts
call :check_file backend\routes\exceptions.ts
call :check_file backend\routes\loanDetail.ts
call :check_file backend\routes\portfolioExceptions.ts

call :check_file rules\eligibility.py
call :check_file rules\comap.py
call :check_file rules\engine.py

call :check_file tests\test_eligibility_rules.py
call :check_file tests\test_comap_rules.py
call :check_file tests\fixtures.py

call :check_file tests\data\comap_input.csv
call :check_file tests\data\comap_expected.csv

echo.
if %FAIL%==0 (
    echo ✅ ALL CHECKS PASSED
) else (
    echo ❌ CHECKS FAILED – Missing items found
)

echo.
pause
exit /b

REM ----------------------------
REM Functions
REM ----------------------------

:check_dir
if exist "%~1\" (
    echo [ OK ] Directory: %~1
) else (
    echo [FAIL] Directory missing: %~1
    set FAIL=1
)
exit /b

:check_file
if exist "%~1" (
    echo [ OK ] File: %~1
) else (
    echo [FAIL] File missing: %~1
    set FAIL=1
)
exit /b
