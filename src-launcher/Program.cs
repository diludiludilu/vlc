using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace VlcWebLauncher
{
    static class Program
    {
        private static HttpListener listener;
        private static Thread serverThread;
        private static bool isRunning = true;
        private static int assignedPort = 3000;
        private static string distPath;
        private static NotifyIcon trayIcon;
        private static Process browserProcess;

        [STAThread]
        static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string exeDir = AppDomain.CurrentDomain.BaseDirectory;

            // 1. Resolve dist directory: Local dist/ folder first, otherwise extracted embedded assets
            string localDist = Path.Combine(exeDir, "dist");
            if (Directory.Exists(localDist) && File.Exists(Path.Combine(localDist, "index.html")))
            {
                distPath = localDist;
            }
            else
            {
                string appDataDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "VlcWebPlayer",
                    "app"
                );
                EnsureExtractedAssets(appDataDir);
                distPath = appDataDir;
            }

            // 2. Ensure icon exists for shortcuts
            EnsureIconFile();

            // 3. Check for shortcut installation argument
            foreach (string arg in args)
            {
                if (arg.Equals("/install", StringComparison.OrdinalIgnoreCase) ||
                    arg.Equals("--install", StringComparison.OrdinalIgnoreCase) ||
                    arg.Equals("-i", StringComparison.OrdinalIgnoreCase))
                {
                    CreateDesktopShortcut();
                    MessageBox.Show(
                        "Desktop shortcut for VLC Media Player created successfully!",
                        "VLC Media Player",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information
                    );
                    return;
                }
            }

            // 4. Find an open port starting at 3000
            assignedPort = FindAvailablePort(3000, 3050);

            // 5. Start embedded static HTTP server
            StartHttpServer();

            // 6. Setup System Tray Icon
            SetupTrayIcon();

            // 7. Launch Desktop Application Window
            LaunchAppWindow();

            Application.Run();
        }

        private static void EnsureExtractedAssets(string targetDir)
        {
            try
            {
                string markerFile = Path.Combine(targetDir, "index.html");
                if (Directory.Exists(targetDir) && File.Exists(markerFile))
                {
                    return;
                }

                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                Assembly assembly = Assembly.GetExecutingAssembly();
                using (Stream stream = assembly.GetManifestResourceStream("dist.zip"))
                {
                    if (stream != null)
                    {
                        string tempZip = Path.Combine(Path.GetTempPath(), "vlc_dist_" + Guid.NewGuid().ToString("N") + ".zip");
                        using (FileStream fs = new FileStream(tempZip, FileMode.Create, FileAccess.Write))
                        {
                            stream.CopyTo(fs);
                        }

                        ZipFile.ExtractToDirectory(tempZip, targetDir);

                        try { File.Delete(tempZip); } catch { }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to unpack application assets:\n" + ex.Message, "VLC Launcher Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void EnsureIconFile()
        {
            try
            {
                string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "VlcWebPlayer");
                if (!Directory.Exists(appDir)) Directory.CreateDirectory(appDir);
                string iconPath = Path.Combine(appDir, "vlc.ico");

                if (!File.Exists(iconPath))
                {
                    Assembly assembly = Assembly.GetExecutingAssembly();
                    using (Stream stream = assembly.GetManifestResourceStream("vlc.ico"))
                    {
                        if (stream != null)
                        {
                            using (FileStream fs = new FileStream(iconPath, FileMode.Create, FileAccess.Write))
                            {
                                stream.CopyTo(fs);
                            }
                        }
                    }
                }
            }
            catch { }
        }

        private static int FindAvailablePort(int startPort, int endPort)
        {
            for (int port = startPort; port <= endPort; port++)
            {
                try
                {
                    TcpListener tcpListener = new TcpListener(IPAddress.Loopback, port);
                    tcpListener.Start();
                    tcpListener.Stop();
                    return port;
                }
                catch
                {
                    // Port in use, try next
                }
            }
            return startPort;
        }

        private static void StartHttpServer()
        {
            try
            {
                listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + assignedPort + "/");
                listener.Prefixes.Add("http://localhost:" + assignedPort + "/");
                listener.Start();

                serverThread = new Thread(ServeRequests)
                {
                    IsBackground = true
                };
                serverThread.Start();
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to start embedded web server on port " + assignedPort + ":\n" + ex.Message,
                    "VLC Launcher Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static void ServeRequests()
        {
            while (isRunning && listener != null && listener.IsListening)
            {
                try
                {
                    HttpListenerContext context = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((ctx) => HandleRequest((HttpListenerContext)ctx), context);
                }
                catch
                {
                    if (!isRunning) break;
                }
            }
        }

        private static void HandleRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.RawUrl;
                if (rawUrl.Contains("?"))
                {
                    rawUrl = rawUrl.Substring(0, rawUrl.IndexOf('?'));
                }

                string relativePath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                if (string.IsNullOrEmpty(relativePath))
                {
                    relativePath = "index.html";
                }

                string filePath = Path.Combine(distPath, relativePath);

                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(distPath, "index.html");
                }

                byte[] data = File.ReadAllBytes(filePath);
                string extension = Path.GetExtension(filePath).ToLowerInvariant();
                context.Response.ContentType = GetMimeType(extension);
                context.Response.ContentLength64 = data.Length;
                context.Response.AddHeader("Access-Control-Allow-Origin", "*");
                context.Response.StatusCode = (int)HttpStatusCode.OK;

                context.Response.OutputStream.Write(data, 0, data.Length);
                context.Response.OutputStream.Close();
            }
            catch
            {
                try
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.Close();
                }
                catch { }
            }
        }

        private static string GetMimeType(string ext)
        {
            switch (ext)
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js":
                case ".mjs": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json";
                case ".svg": return "image/svg+xml";
                case ".png": return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".gif": return "image/gif";
                case ".ico": return "image/x-icon";
                case ".woff": return "font/woff";
                case ".woff2": return "font/woff2";
                case ".ttf": return "font/ttf";
                case ".mp3": return "audio/mpeg";
                case ".mp4": return "video/mp4";
                case ".webm": return "video/webm";
                default: return "application/octet-stream";
            }
        }

        private static void LaunchAppWindow()
        {
            string url = "http://127.0.0.1:" + assignedPort;

            string[] potentialBrowsers = new string[]
            {
                @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                @"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                @"C:\Program Files\Google\Chrome\Application\chrome.exe",
                @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Google\Chrome\Application\chrome.exe")
            };

            string browserPath = null;
            foreach (string path in potentialBrowsers)
            {
                if (File.Exists(path))
                {
                    browserPath = path;
                    break;
                }
            }

            try
            {
                if (browserPath != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo(
                        browserPath,
                        string.Format("--app=\"{0}\" --window-size=1280,820 --app-id=vlc-web-media-player", url)
                    )
                    {
                        UseShellExecute = false
                    };
                    browserProcess = Process.Start(psi);
                    if (browserProcess != null)
                    {
                        browserProcess.EnableRaisingEvents = true;
                        browserProcess.Exited += (s, e) =>
                        {
                            ExitApplication();
                        };
                    }
                }
                else
                {
                    Process.Start(url);
                }
            }
            catch
            {
                Process.Start(url);
            }
        }

        private static void SetupTrayIcon()
        {
            trayIcon = new NotifyIcon();

            try
            {
                string iconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "vlc.ico");
                if (File.Exists(iconPath))
                {
                    trayIcon.Icon = new Icon(iconPath);
                }
                else
                {
                    string fallbackIcon = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "VlcWebPlayer",
                        "vlc.ico"
                    );
                    if (File.Exists(fallbackIcon))
                    {
                        trayIcon.Icon = new Icon(fallbackIcon);
                    }
                    else
                    {
                        trayIcon.Icon = SystemIcons.Application;
                    }
                }
            }
            catch
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.Text = "VLC Web Media Player (Port " + assignedPort + ")";
            trayIcon.Visible = true;

            ContextMenu menu = new ContextMenu();
            menu.MenuItems.Add("Open VLC Player", (s, e) => LaunchAppWindow());
            menu.MenuItems.Add("Create Desktop Shortcut", (s, e) =>
            {
                CreateDesktopShortcut();
                trayIcon.ShowBalloonTip(2000, "VLC Media Player", "Desktop shortcut created!", ToolTipIcon.Info);
            });
            menu.MenuItems.Add("-");
            menu.MenuItems.Add("Open in Web Browser", (s, e) => Process.Start("http://127.0.0.1:" + assignedPort));
            menu.MenuItems.Add("About VLC Web", (s, e) => MessageBox.Show(
                "VLC Web Media Player\nVersion 1.0\n\nHigh-performance desktop & web media player inspired by VLC.\nStandalone single-file executable with embedded assets.",
                "About VLC Web Media Player", MessageBoxButtons.OK, MessageBoxIcon.Information
            ));
            menu.MenuItems.Add("-");
            menu.MenuItems.Add("Exit", (s, e) => ExitApplication());

            trayIcon.ContextMenu = menu;
            trayIcon.DoubleClick += (s, e) => LaunchAppWindow();
        }

        private static void CreateDesktopShortcut()
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    string shortcutPath = Path.Combine(desktopPath, "VLC Media Player.lnk");
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);

                    string exePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
                    shortcut.TargetPath = exePath;
                    shortcut.WorkingDirectory = Path.GetDirectoryName(exePath);
                    shortcut.Description = "VLC Web Media Player";

                    string iconPath = Path.Combine(Path.GetDirectoryName(exePath), "vlc.ico");
                    if (!File.Exists(iconPath))
                    {
                        iconPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "VlcWebPlayer", "vlc.ico");
                    }
                    if (File.Exists(iconPath))
                    {
                        shortcut.IconLocation = iconPath + ",0";
                    }

                    shortcut.Save();
                }
            }
            catch { }
        }

        private static void ExitApplication()
        {
            isRunning = false;
            try
            {
                if (trayIcon != null)
                {
                    trayIcon.Visible = false;
                    trayIcon.Dispose();
                }
                if (listener != null && listener.IsListening)
                {
                    listener.Stop();
                    listener.Close();
                }
            }
            catch { }

            Application.Exit();
            Environment.Exit(0);
        }
    }
}
