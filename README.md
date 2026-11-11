# Work Dashboard desktop app

A window around the live dashboard. Sign-in is required, so the app shows nothing to anyone else.

Downloads: https://github.com/SunnyTCF/work-dashboard-app/releases/latest

## Install on Windows

1. Open the downloads page and click `Work-Dashboard-Setup-<version>.exe`.
2. Open the downloaded file. On the blue "Windows protected your PC" box, click **More info**, then **Run anyway**. This appears because the app is not signed.
3. Sign in with GitHub.

## Install on Mac

1. Click the Apple menu, then **About This Mac**.
   - If it says **Chip: Apple M...**, you need the file ending `mac-arm64.dmg`.
   - If it says **Processor: Intel**, you need the file ending `mac-x64.dmg`.
2. Open the downloads page and click that file.
3. Open the downloaded file and drag **Work Dashboard** onto **Applications**.
4. The first time only, the Mac will block it because there is no Apple certificate:
   - Open **Applications**, hold **Control** and click **Work Dashboard**, then choose **Open**, then **Open** again.
   - If there is no **Open** button (newer macOS): click **Done**, open **System Settings**, **Privacy & Security**, scroll to the bottom, and click **Open Anyway** next to Work Dashboard. Then confirm with your Mac password or Touch ID.
5. Sign in with GitHub.

## Updates

- The dashboard itself is the live website. New features there appear on refresh (Ctrl+R, or Cmd+R on Mac). No app update needed.
- The app only needs an update when the window itself changes.
  - **Windows:** the update downloads by itself, then a box offers **Restart now**. Choosing **Later** installs it the next time the app closes.
  - **Mac:** a box offers **Download**. Download the new file and drag it into Applications, replacing the old one. A Mac app without an Apple certificate is not allowed to replace itself.

## Releasing a new version (for whoever maintains this)

This folder lives in the private dashboard repo as `desktop/`. The public repo `SunnyTCF/work-dashboard-app` holds only this folder and builds both apps on GitHub when a version tag is pushed.

From the dashboard repo's root, after raising `version` in `desktop/package.json` and committing:

```bash
git subtree split --prefix=desktop -b desktop-app
git push app desktop-app:main
git push app desktop-app:refs/tags/v<version>
```

`app` is the remote `https://github.com/SunnyTCF/work-dashboard-app.git`. The tag must match the version in `package.json`. The release appears, with all files, about ten minutes later.
