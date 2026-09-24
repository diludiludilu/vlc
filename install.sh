#!/usr/bin/env bash
# ======================================================================
# VLC Web Media Player - Easy Installer for Linux & macOS
# ======================================================================

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${YELLOW}======================================================================${RESET}"
echo -e "${BOLD}         VLC Web Media Player - Automated Setup & Installer           ${RESET}"
echo -e "${YELLOW}======================================================================${RESET}"
echo ""

# 1. Check Node.js and npm
echo -e "${CYAN}[*] Checking for Node.js and npm...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}[x] Node.js is not installed.${RESET}"
    echo -e "${YELLOW}Please install Node.js (v18+ recommended):${RESET}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  brew install node"
    else
        echo "  Using NVM (recommended): curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && nvm install --lts"
        echo "  Or via apt (Debian/Ubuntu): sudo apt update && sudo apt install -y nodejs npm"
    fi
    exit 1
fi

NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo -e "${GREEN}[+] Node.js detected: ${NODE_VER}${RESET}"
echo -e "${GREEN}[+] npm detected:     v${NPM_VER}${RESET}"
echo ""

# 2. Setup .env file
if [ ! -f .env ] && [ -f .env.example ]; then
    echo -e "${CYAN}[*] Creating .env file from .env.example...${RESET}"
    cp .env.example .env
    echo -e "${GREEN}[+] Configuration file .env created.${RESET}"
fi

# 3. Install NPM dependencies
echo -e "${CYAN}[*] Installing dependencies with npm...${RESET}"
npm install

# Make scripts executable
chmod +x start.sh 2>/dev/null || true
chmod +x install.sh 2>/dev/null || true

echo ""
echo -e "${YELLOW}======================================================================${RESET}"
echo -e "${GREEN}[SUCCESS] VLC Web Media Player installed successfully!${RESET}"
echo -e "${YELLOW}======================================================================${RESET}"
echo ""
echo "To run the application anytime:"
echo -e "  ${CYAN}./start.sh${RESET}  or  ${CYAN}npm run dev${RESET}"
echo ""

read -p "Would you like to start VLC Web Player now? [y/N]: " RUN_NOW
if [[ "$RUN_NOW" =~ ^[Yy]$ ]]; then
    ./start.sh
fi
