<#
.SYNOPSIS
    Automated setup script for VLC Web Media Player.
.DESCRIPTION
    Checks prerequisites (Node.js, npm), installs dependencies,
    creates configuration files, and optionally creates a Desktop shortcut.
#>

[CmdletBinding()]
param(
    [switch]$StartAfterInstall,
    [switch]$CreateDesktopShortcut
)

$ErrorActionPreference = 'Stop'

function Write-Header {
    Write-Host "======================================================================" -ForegroundColor DarkYellow
    Write-Host "             VLC Web Media Player - Easy Setup & Installer            " -ForegroundColor Yellow
    Write-Host "======================================================================" -ForegroundColor DarkYellow
    Write-Host ""
}

Write-Header

# 1. Check Node.js
Write-Host "[*] Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node -v 2>$null
    if (-not $nodeVersion) { throw "Node.js not found" }
    $npmVersion = npm -v 2>$null
    Write-Host "[+] Found Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "[+] Found npm:     v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[!] Node.js is not installed or not in your PATH." -ForegroundColor Red
    
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget) {
        $installWinget = Read-Host "Windows Package Manager (winget) is available. Would you like to install Node.js LTS now? (Y/N)"
        if ($installWinget -match '^[Yy]') {
            Write-Host "[*] Installing Node.js LTS via winget..." -ForegroundColor Cyan
            Start-Process winget -ArgumentList "install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements" -Wait -NoNewWindow
            Write-Host "[!] Please restart PowerShell to refresh your PATH, then re-run setup.ps1." -ForegroundColor Yellow
            return
        }
    }
    
    Write-Host "Please download and install Node.js (LTS recommended) from:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor White -Underline
    return
}

# 2. Setup .env file
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "[*] Setting up .env configuration file..." -ForegroundColor Cyan
        Copy-Item ".env.example" ".env"
        Write-Host "[+] Created .env file successfully." -ForegroundColor Green
    }
}

# 3. Install NPM Dependencies
Write-Host "`n[*] Installing dependencies with npm..." -ForegroundColor Cyan
try {
    npm install
    Write-Host "`n[+] Dependencies successfully installed!" -ForegroundColor Green
} catch {
    Write-Host "[x] Error installing dependencies. Please check error message above." -ForegroundColor Red
    return
}

# 4. Optional Desktop Shortcut creation on Windows
if ($IsWindows -or ($env:OS -like "*Windows*")) {
    $createShortcut = $CreateDesktopShortcut
    if (-not $PSBoundParameters.ContainsKey('CreateDesktopShortcut')) {
        $response = Read-Host "`nWould you like to create a Desktop shortcut for VLC Web Player? (Y/N)"
        if ($response -match '^[Yy]') { $createShortcut = $true }
    }

    if ($createShortcut) {
        try {
            $desktopDir = [Environment]::GetFolderPath("Desktop")
            $wshShell = New-Object -ComObject WScript.Shell
            $shortcutPath = Join-Path $desktopDir "VLC Web Media Player.lnk"
            $shortcut = $wshShell.CreateShortcut($shortcutPath)
            $shortcut.TargetPath = (Join-Path $PSScriptRoot "start.bat")
            $shortcut.WorkingDirectory = $PSScriptRoot
            $shortcut.Description = "VLC Web Media Player"
            $shortcut.Save()
            Write-Host "[+] Desktop shortcut created at: $shortcutPath" -ForegroundColor Green
        } catch {
            Write-Host "[!] Could not create desktop shortcut: $_" -ForegroundColor DarkGray
        }
    }
}

Write-Host "`n======================================================================" -ForegroundColor DarkYellow
Write-Host " [SUCCESS] Setup is complete! VLC Web Media Player is ready to run.   " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor DarkYellow
Write-Host "`nTo start the player anytime, run:" -ForegroundColor White
Write-Host "  - Double-click start.bat" -ForegroundColor Cyan
Write-Host "  - Or run: npm run dev" -ForegroundColor Cyan
Write-Host ""

$launchNow = $StartAfterInstall
if (-not $PSBoundParameters.ContainsKey('StartAfterInstall')) {
    $launchResponse = Read-Host "Would you like to start VLC Web Player right now? (Y/N)"
    if ($launchResponse -match '^[Yy]') { $launchNow = $true }
}

if ($launchNow) {
    Write-Host "[*] Launching VLC Web Player at http://localhost:3000..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    npm run dev
}
