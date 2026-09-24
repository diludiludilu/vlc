@echo off
setlocal
title VLC Web Media Player

echo ======================================================================
echo                      VLC Web Media Player
echo ======================================================================
echo.

:: Check if node_modules exists; if not, run installer first
if not exist node_modules (
    echo [!] Dependencies not found. Running installation first...
    call install.bat
    if %errorlevel% neq 0 (
        echo [x] Setup failed.
        pause
        exit /b %errorlevel%
    )
)

:: Ensure .env exists
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
    )
)

echo [*] Starting VLC Web Media Player server at http://localhost:3000 ...
echo [*] Opening your browser...
echo.

:: Open browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Start the Vite development server
call npm run dev

pause
