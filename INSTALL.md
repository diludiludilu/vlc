# VLC Web Media Player - Easy Installation Guide

Welcome to **VLC Web Media Player**! This guide details the simplest ways to install and run the software across Windows, macOS, Linux, Mobile, and Docker.

---

## ⚡ Quick Summary: Pick Your Method

| Platform | Recommended Easy Method | Alternative |
| :--- | :--- | :--- |
| **Windows (Executable)** | **Double-click `vlc.exe`** (Zero installation/dependencies) | `vlc.exe --install` (creates desktop shortcut) |
| **Windows (Scripts)** | Double-click `start.bat` or `install.bat` | `.\setup.ps1` in PowerShell |
| **macOS & Linux** | Run `./install.sh` (or `./start.sh`) | `npm install && npm run dev` |
| **Desktop & Mobile (Any OS)** | **1-Click Install as App (PWA)** via Browser | No local installation needed |
| **Docker / Server** | `docker compose up -d` | Multi-stage Docker build |

---

## 1. 🪟 Windows Installation

### Option A: Standalone Executable (`vlc.exe`) — Easiest (No Node.js Required)
1. **Run:** In the project root, simply double-click **`vlc.exe`**.
2. **What happens:**
   - It runs completely standalone with embedded application assets.
   - It starts an embedded lightweight local web server and launches a dedicated desktop application window (via Microsoft Edge or Chrome in app mode).
   - A tray icon appears with options to reopen, create desktop shortcuts, or exit.
3. **Create a Desktop Shortcut:**
   - Run in terminal: `vlc.exe --install`
   - Or right-click the VLC tray icon and click **"Create Desktop Shortcut"**.
4. **Rebuilding `vlc.exe` (Developers):**
   - Run `build-exe.bat` or `npm run build:exe`.

### Option B: Batch Files (`start.bat` / `install.bat`)
1. In the project folder, double-click **`start.bat`**.
   - If dependencies are missing, it automatically runs `npm install`.
   - Starts the dev server and opens `http://localhost:3000` in your default browser.
2. To explicitly configure and check Node.js, run **`install.bat`**.

### Option C: PowerShell Script (`setup.ps1`)
1. Open PowerShell in the project directory.
2. Run:
   ```powershell
   .\setup.ps1
   ```
3. The script verifies Node.js, runs `npm install`, and prompts to generate a **VLC Web Media Player** desktop shortcut.

---

## 2. 🍎 macOS & 🐧 Linux

1. Open your terminal in the project directory.
2. Run the automated installer:
   ```bash
   chmod +x install.sh start.sh
   ./install.sh
   ```
3. To launch the player in the future:
   ```bash
   ./start.sh
   ```
   *(This launches the dev server and opens `http://localhost:3000` in your default browser automatically).*

---

## 3. 📱 1-Click Browser App Installation (PWA)

VLC Web Media Player is a certified Progressive Web App. You can install it directly from your web browser as a standalone desktop or mobile application with **zero terminal commands**:

### On Desktop (Google Chrome, Microsoft Edge, Brave)
1. Open the app at `http://localhost:3000` (or your hosted URL).
2. Click the **"Install"** button in the top menu bar, or click the **Install icon (⊕)** in the right side of your browser's address bar.
3. Click **Install**.
4. The player will now run in its own frameless window and can be pinned to your Windows Taskbar, Start Menu, or macOS Dock!

### On iPhone & iPad (Safari)
1. Open the player in Safari.
2. Tap the **Share** button (box with upward arrow) at the bottom.
3. Tap **Add to Home Screen**.
4. Tap **Add**. VLC Web Media Player will appear on your home screen with its VLC icon.

### On Android (Chrome / Firefox)
1. Open the player in your mobile browser.
2. Tap the three dots **(⋮)** menu in the top right.
3. Tap **Install app** or **Add to Home screen**.

---

## 4. 🐳 Docker & Docker Compose (Zero Local Dependencies)

If you don't have Node.js installed or want an isolated container:

1. Ensure [Docker Desktop](https://www.docker.com/) is running.
2. Start the container:
   ```bash
   docker compose up -d
   ```
3. Open `http://localhost:3000` in your browser.
4. To stop the container:
   ```bash
   docker compose down
   ```

---

## 5. 💻 Manual Installation via NPM

If you prefer standard Node.js package manager commands:

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or later recommended).
- [npm](https://www.npmjs.com/) (included with Node.js).

### Steps
1. Clone or download this repository.
2. Open terminal in the directory and run:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
   *(Or simply run `npm start`)*
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Useful NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start development server on port 3000 |
| `npm start` | Alias for `npm run dev` |
| `npm run setup` | Install all dependencies |
| `npm run build` | Build production-ready optimized bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Type-check TypeScript files |

---

## ❓ Troubleshooting & FAQ

#### `Node.js is not recognized as an internal or external command`
- Download and install Node.js (LTS version) from [https://nodejs.org/](https://nodejs.org/). Make sure the option *"Add to PATH"* is checked during installation.
- On Windows, you can also run `winget install OpenJS.NodeJS.LTS` in PowerShell or Command Prompt.
- Restart your terminal after installing Node.js.

#### Port 3000 is already in use
- You can specify a different port when running:
  ```bash
  npx vite --port 3001
  ```

#### How do I add videos and music to the player?
- Click **Media** → **Open File(s)...** (or press `Ctrl+O`) to load videos or audio files directly from your computer.
- You can also drag and drop audio/video files directly into the player window.
- Click **Media** → **Open Network Stream...** (or press `Ctrl+N`) to stream online media URLs (HLS, MP4, MP3, etc.).
