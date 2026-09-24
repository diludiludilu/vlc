@echo off
setlocal enabledelayedexpansion
title VLC Web Media Player - Easy Installer

echo ======================================================================
echo           VLC Web Media Player - Automated Setup & Installer
echo ======================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js was not detected on your computer.
    echo.
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        echo Windows Package Manager (winget) is available.
        set /p INSTALL_NODE="Would you like to automatically install Node.js LTS now? [Y/N]: "
        if /i "!INSTALL_NODE!"=="Y" (
            echo [*] Installing Node.js LTS via winget...
            winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
            echo.
            echo [*] Please restart this installer or open a new terminal window to refresh your PATH.
            pause
            exit /b 0
        )
    )
    echo [x] Node.js is required to run VLC Web Media Player.
    echo Please download and install Node.js (LTS version) from:
    echo     https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Display Node & NPM versions
for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VER=%%v
for /f "tokens=*" %%v in ('npm -v 2^>nul') do set NPM_VER=%%v
echo [+] Node.js detected: %NODE_VER%
echo [+] NPM detected:     v%NPM_VER%
echo.

:: 2. Set up environment file if missing
if not exist .env (
    if exist .env.example (
        echo [*] Creating .env file from .env.example...
        copy .env.example .env >nul
        echo [+] Configuration file .env created.
    )
)

:: 3. Install NPM dependencies
echo [*] Installing dependencies (this may take a minute)...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [x] Installation failed during npm install. Please check error logs above.
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo [SUCCESS] VLC Web Media Player has been installed successfully!
echo ======================================================================
echo.
echo You can start the app anytime by double-clicking:
echo   - start.bat
echo Or running in terminal:
echo   - npm run dev
echo.

set /p RUN_NOW="Would you like to start VLC Web Player right now? [Y/N]: "
if /i "%RUN_NOW%"=="Y" (
    echo [*] Starting VLC Web Player...
    start "" start.bat
) else (
    echo You're all set! Enjoy VLC Web Media Player.
    pause
)
