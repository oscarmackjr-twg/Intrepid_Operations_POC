@echo off
setlocal ENABLEDELAYEDEXPANSION

echo.
echo ============================================
echo  Python Virtual Environment Health Check
echo ============================================
echo.

REM ------------------------------------------------
REM CONFIG
REM ------------------------------------------------
set VENV_DIR=venv
set REQUIREMENTS=requirements.txt

REM ------------------------------------------------
REM PYTHON CHECK
REM ------------------------------------------------
where python >nul 2>nul || (
    echo ❌ Python not found in PATH
    goto FAIL
)

echo ✅ Python found
python --version
echo.

REM ------------------------------------------------
REM VENV EXISTS
REM ------------------------------------------------
if not exist "%VENV_DIR%\Scripts\activate.bat" (
    echo ❌ Virtualenv not found: %VENV_DIR%
    echo   Run: python -m venv venv
    goto FAIL
)

echo ✅ Virtualenv exists
echo.

REM ------------------------------------------------
REM ACTIVATE VENV
REM ------------------------------------------------
call "%VENV_DIR%\Scripts\activate.bat"

if "%VIRTUAL_ENV%"=="" (
    echo ❌ Virtualenv activation failed
    goto FAIL
)

echo ✅ Virtualenv activated
echo   %VIRTUAL_ENV%
echo.

REM ------------------------------------------------
REM INTERPRETER CONSISTENCY
REM ------------------------------------------------
python - <<EOF >nul 2>nul
import sys
import os
assert os.environ.get("VIRTUAL_ENV") in sys.executable
EOF

if errorlevel 1 (
    echo ❌ Wrong Python interpreter in use
    goto FAIL
)

echo ✅ Correct Python interpreter
echo.

REM ------------------------------------------------
REM REQUIREMENTS CHECK
REM ------------------------------------------------
if not exist "%REQUIREMENTS%" (
    echo ❌ requirements.txt missing
    goto FAIL
)

echo ✅ requirements.txt found
echo.

echo Checking installed packages...
pip install --quiet --requirement %REQUIREMENTS% --dry-run >nul 2>nul

if errorlevel 1 (
    echo ❌ Missing or incompatible packages detected
    echo   Run: pip install -r requirements.txt
    goto F
