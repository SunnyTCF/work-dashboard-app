// A thin desktop window around the hosted dashboard.
// The dashboard itself lives on Vercel, so every change shows up the next time
// this window opens or you press Ctrl+R / Cmd+R. Nothing to reinstall.
// This shell only updates itself (from GitHub Releases) when the shell changes.
const { app, BrowserWindow, dialog, shell } = require("electron");
const path = require("path");

const { url, downloads } = require(path.join(__dirname, "config.json"));
const HOME = process.env.DASHBOARD_URL || url;
const homeOrigin = new URL(HOME).origin;

// Links that open other apps on this computer.
const APP_LINKS = ["voyager:", "grokbot:", "slack:", "discord:"];
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

// The shell checks for a newer version of itself when it opens and every few hours.
// Windows: the update downloads quietly, then a box offers "Restart now".
// Mac: the app is not signed by Apple, so it cannot swap itself; the box offers
// "Download" and opens the page with the new version instead.
function setUpUpdates() {
  if (!app.isPackaged) return;
  let autoUpdater;
  try {
    ({ autoUpdater } = require("electron-updater"));
  } catch {
    return; // updating is best-effort; the dashboard itself is always current
  }
  const isMac = process.platform === "darwin";
  let asked = false;
  autoUpdater.autoDownload = !isMac;
  autoUpdater.on("error", (err) => console.error("[update] error:", err && err.message));
  autoUpdater.on("update-available", (info) => console.log("[update] found", info.version));
  autoUpdater.on("update-not-available", () => console.log("[update] already on the newest version"));

  autoUpdater.on("update-downloaded", async (info) => {
    if (asked) return;
    asked = true;
    const { response } = await dialog.showMessageBox({
      type: "info",
      title: "Update ready",
      message: `Work Dashboard ${info.version} is ready.`,
      detail: "Restart to finish updating. It takes a few seconds.",
      buttons: ["Restart now", "Later"],
      defaultId: 0,
      cancelId: 1,
    });
    if (response === 0) autoUpdater.quitAndInstall();
    // "Later": it installs by itself the next time the app is closed.
  });

  if (isMac) {
    autoUpdater.on("update-available", async (info) => {
      if (asked) return;
      asked = true;
      const { response } = await dialog.showMessageBox({
        type: "info",
        title: "Update available",
        message: `Work Dashboard ${info.version} is available.`,
        detail: "Download it, open the file, and drag Work Dashboard into Applications to replace the old one.",
        buttons: ["Download", "Later"],
        defaultId: 0,
        cancelId: 1,
      });
      if (response === 0 && downloads) shell.openExternal(downloads);
    });
  }

  const check = () => autoUpdater.checkForUpdates().catch(() => {});
  check();
  setInterval(check, 4 * 60 * 60 * 1000);
}

app.whenReady().then(() => {
  createWindow();
  setUpUpdates();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
