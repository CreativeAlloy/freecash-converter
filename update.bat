@echo off
echo Checking for Freecash Converter updates...
cd /d "%~dp0"

:: Fetch changes from GitHub safely
git fetch origin main

:: Get the local and remote commit hashes
for /f "tokens=*" %%a in ('git rev-parse HEAD') do set LOCAL=%%a
for /f "tokens=*" %%b in ('git rev-parse origin/main') do set REMOTE=%%b

if "%LOCAL%" NEQ "%REMOTE%" (
    echo.
    echo [NEW UPDATE FOUND] Pulling latest changes...
    git pull origin main
    echo.
    echo Update complete!
    echo.
    echo Opening chrome://extensions so you can refresh the extension...
    start chrome chrome://extensions
    echo.
    echo If Chrome is not your default browser, please manually go to:
    echo chrome://extensions/
) else (
    echo.
    echo Extension is already up to date.
)

echo.
pause