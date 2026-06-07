@echo off
echo Preparing to clone Freecash Multi-Currency Converter...
cd /d "%~dp0"

:: Check if the current directory contains any files or folders
dir /b /a | findstr . >nul

if %errorlevel% equ 0 (
    echo.
    echo [NOTICE] This folder is not empty. 
    echo Cloning into a 'freecash-converter' subfolder to prevent overwriting your files...
    echo.
    git clone https://github.com/CreativeAlloy/freecash-converter.git
) else (
    echo.
    echo [NOTICE] Folder is empty. Cloning directly into this directory...
    echo.
    git clone https://github.com/CreativeAlloy/freecash-converter.git .
)

echo.
echo Setup step complete!
pause