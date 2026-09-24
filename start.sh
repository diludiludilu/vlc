#!/usr/bin/env bash
# ======================================================================
# VLC Web Media Player - Launcher for Linux & macOS
# ======================================================================

set -e

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "[!] Dependencies not found. Running installation first..."
    ./install.sh
fi

# Ensure .env exists
if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

echo "[*] Starting VLC Web Media Player server at http://localhost:3000 ..."
echo "[*] Opening in your default browser..."

# Open browser in background after short delay
(
    sleep 2
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3000" &> /dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:3000" &> /dev/null &
    fi
) &

npm run dev
