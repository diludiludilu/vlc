@echo off
setlocal
title Build VLC Executable (vlc.exe)

echo ======================================================================
echo                 Building VLC Media Player (vlc.exe)
echo ======================================================================
echo.

:: 1. Build React/Vite production assets
echo [*] Step 1/4: Building frontend web assets into dist/...
call npm run build
if %errorlevel% neq 0 (
    echo [x] Frontend build failed.
    pause
    exit /b %errorlevel%
)

:: 2. Verify or generate icon
if not exist vlc.ico (
    echo [*] Step 2/4: Generating vlc.ico icon...
    powershell -ExecutionPolicy Bypass -File build-icon.ps1
) else (
    echo [*] Step 2/4: vlc.ico verified.
)

:: 3. Compress dist into dist.zip for embedding
echo [*] Step 3/4: Packaging assets into dist.zip...
powershell -Command "if (Test-Path dist.zip) { Remove-Item dist.zip }; Compress-Archive -Path dist\* -DestinationPath dist.zip -Force"

:: 4. Compile native Windows executable vlc.exe using built-in csc.exe
echo [*] Step 4/4: Compiling native Windows binary vlc.exe with embedded assets...
set CSC="C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist %CSC% (
    set CSC="C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if not exist %CSC% (
    echo [x] Microsoft C# Compiler (csc.exe) not found in Windows directory.
    pause
    exit /b 1
)

%CSC% /nologo /target:winexe /optimize+ /out:vlc.exe /win32icon:vlc.ico /resource:dist.zip,dist.zip /resource:vlc.ico,vlc.ico /reference:System.dll,System.Windows.Forms.dll,System.Drawing.dll,System.Core.dll,Microsoft.CSharp.dll,System.IO.Compression.FileSystem.dll src-launcher\Program.cs

if %errorlevel% neq 0 (
    echo [x] Compilation of vlc.exe failed.
    pause
    exit /b %errorlevel%
)

echo.
echo ======================================================================
echo [SUCCESS] vlc.exe built successfully as a standalone executable!
echo ======================================================================
echo You can now double-click vlc.exe to run the application immediately.
echo.
pause
