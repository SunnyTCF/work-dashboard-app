// A thin desktop window around the hosted dashboard.
// The dashboard itself lives on Vercel, so every change shows up the next time
// this window opens or you press Ctrl+R / Cmd+R. Nothing to reinstall.
// This shell only updates itself (from GitHub Releases) when the shell changes.
const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const { url } = require(path.join(__dirname, "config.json"));
const HOME = process.env.DASHBOARD_URL || url;
const homeOrigin = new URL(HOME).origin;

// Links that open other apps on this computer.
const APP_LINKS = ["voyager:", "grokbot:"];
// Sign-in happens on GitHub, inside the window.
const SIGN_IN = ["https://github.com"];

function route(target, event) {
  const u = new URL(target);
  if (u.origin === homeOrigin || SIGN_IN.includes(u.origin)) return true;
  if (event) event.preventDefault();
  if (APP_LINKS.includes(u.protocol) || u.protocol === "https:" || u.protocol === "http:") shell.openExternal(target);
  return false;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 420,
    backgroundColor: "#F3EEE6",
    autoHideMenuBar: true,
    title: "Work Dashboard",
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.webContents.on("will-navigate", (e, target) => route(target, e));
  win.webContents.setWindowOpenHandler(({ url: target }) => {
    route(target);
    return { action: "deny" };
  });
  // Always open on the start screen, so you choose a workspace every time.
  win.loadURL(HOME);
}

app.whenReady().then(() => {
  createWindow();
  if (app.isPackaged) {
    try {
      require("electron-updater").autoUpdater.checkForUpdatesAndNotify();
    } catch {
      // updating is best-effort; the dashboard itself is always current
    }
  }
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
