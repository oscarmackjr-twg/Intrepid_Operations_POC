@echo off
setlocal ENABLEDELAYEDEXPANSION

echo.
echo ============================================
echo  Loan Review App – End-to-End Test Runner
echo ============================================
echo.

REM ------------------------------------------------
REM CONFIGURATION
REM ------------------------------------------------
set NODE_ENV=test
set TEST_DB_URL=postgresql://localhost/loan_test
set SERVER_LOG=e2e_server.log

REM ------------------------------------------------
REM PREREQUISITE CHECKS
REM ------------------------------------------------
where node >nul 2>nul || (
  echo ❌ Node.js not found in PATH
  goto FAIL
)

where npm >nul 2>nul || (
  echo ❌ npm not found
  goto FAIL
)

where python >nul 2>nul || (
  echo ❌ Python not found in PATH
  goto FAIL
)

echo ✅ Node, npm, and Python detected
echo.

REM ------------------------------------------------
REM INSTALL DEPENDENCIES (SAFE TO RE-RUN)
REM ------------------------------------------------
echo Installing Node dependencies...
npm install || goto FAIL

echo.
echo Installing Python dependencies...
pip install -r requirements.txt || goto FAIL

REM ------------------------------------------------
REM START BACKEND IN TEST MODE
REM ------------------------------------------------
echo.
echo Starting Node backend (test mode)...
start "NodeTestServer" cmd /c "npm run start:test > %SERVER_LOG% 2>&1"

REM Allow server time to boot
timeout /t 5 >nul

REM ------------------------------------------------
REM RUN E2E TESTS
REM ------------------------------------------------
echo.
echo Running Jest E2E tests...
npm test || goto FAIL

REM ------------------------------------------------
REM CLEANUP
REM ------------------------------------------------
echo.
echo Stopping Node backend...
taskkill /FI "WINDOWTITLE eq NodeTestServer*" /T /F >nul 2>&1

echo.
echo ✅ END-TO-END TESTS PASSED
goto END

:FAIL
echo.
echo ❌ END-TO-END TESTS FAILED
echo Check %SERVER_LOG% for backend errors

REM Attempt cleanup even on failure
taskkill /FI "WINDOWTITLE eq NodeTestServer*" /T /F >nul 2>&1
exit /b 1

:END
echo.
pause
exit /b 0
