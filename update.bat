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
    echo Please restart Google Chrome for the changes to take effect.
    echo Alternatively, you may manually refresh the extension at chrome://extensions/ without restarting Chrome (if you have important unsaved work, etc.)
) else (
    echo.
    echo Extension is already up to date.
)

echo.
pause