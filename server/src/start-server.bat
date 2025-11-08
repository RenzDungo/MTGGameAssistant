@echo off
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ Node.js is not installed or not in PATH.
  pause
  exit /b
)
where tsx >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ tsx is not installed locally.
  echo Installing tsx...
  call npm install tsx --save-dev
)
echo Starting MTGLifeAppServer...
cd /d "%~dp0"
npx tsx server.ts
pause >nul