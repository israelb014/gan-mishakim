/* גן משחקים — Electron main process. Always full-screen.
   Content: the live site (so games update without reinstalling); offline the site's service-worker cache serves it,
   and if that is not available either, the copy bundled in ./web (copied from the repo root at build time).
   Progress and drawings are stored by this process (preload bridge), so they are the same in every mode. */
'use strict';
const { app, BrowserWindow, Menu, ipcMain, session, screen, powerMonitor, net } = require('electron');
const path = require('path');
const fs = require('fs');

const SITE = process.env.GAN_SITE || 'https://israelb014.github.io/gan-mishakim/';
const SITE_ORIGIN = new URL(SITE).origin;

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
Menu.setApplicationMenu(null);
if (process.platform === 'linux') {
  // Electron derives the X11 window class from the app name; use an ASCII one matching StartupWMClass
  // in the .desktop entry, so Cinnamon's panel shows Popo's icon. Saved progress lives in ~/.config/gan-mishakim.
  app.setName('gan-mishakim');
  app.setPath('userData', path.join(app.getPath('appData'), 'gan-mishakim'));
  app.setDesktopName('gan-mishakim.desktop');
}

if (!app.requestSingleInstanceLock()) { app.quit(); }

const DEV = !app.isPackaged;
let win = null;
let allowQuit = false;
let source = 'online';

/* ---------- storage: progress.json + gallery/<id>.json in the app's own folder ---------- */
const DATA = () => app.getPath('userData');
const PROGRESS = () => path.join(DATA(), 'progress.json');
const GALLERY = () => path.join(DATA(), 'gallery');
function readJSON(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fallback; } }
function writeJSON(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj));
  fs.renameSync(tmp, file); // atomic: a crash never leaves a half-written file
}
let progress = null;
const store = () => progress || (progress = readJSON(PROGRESS(), {}));

/** Only our own pages (live site or bundled files) may use the bridge. */
function trusted(e) {
  const url = (e.senderFrame && e.senderFrame.url) || '';
  return url.startsWith(SITE_ORIGIN + '/') || url.startsWith('file://');
}
const safeId = (id) => String(id).replace(/[^\w.-]/g, '_').slice(0, 80);

ipcMain.on('gan:store-get', (e, key) => { e.returnValue = trusted(e) ? (store()[key] ?? null) : null; });
ipcMain.on('gan:store-set', (e, key, value) => {
  if (trusted(e) && typeof value === 'string') { store()[key] = value; try { writeJSON(PROGRESS(), progress); } catch (err) { /* disk full */ } }
  e.returnValue = true;
});
ipcMain.on('gan:info', (e) => { e.returnValue = { version: app.getVersion(), source }; });
ipcMain.handle('gan:gallery-list', (e, child) => {
  if (!trusted(e)) return [];
  let files = [];
  try { files = fs.readdirSync(GALLERY()).filter((f) => f.endsWith('.json')); } catch (err) { return []; }
  return files.map((f) => readJSON(path.join(GALLERY(), f), null)).filter((r) => r && r.child === child)
    .map(({ paint, image, ...meta }) => meta).sort((a, b) => b.updated - a.updated);
});
ipcMain.handle('gan:gallery-get', (e, id) => (trusted(e) ? readJSON(path.join(GALLERY(), safeId(id) + '.json'), null) : null));
ipcMain.handle('gan:gallery-put', (e, rec) => { if (trusted(e) && rec && rec.id) writeJSON(path.join(GALLERY(), safeId(rec.id) + '.json'), rec); return true; });
ipcMain.handle('gan:gallery-del', (e, id) => { if (trusted(e)) { try { fs.unlinkSync(path.join(GALLERY(), safeId(id) + '.json')); } catch (err) { /* gone */ } } return true; });
/* A PNG copy of every saved drawing goes to Pictures/גן משחקים. */
ipcMain.on('gan:save-picture', (e, name, dataURL) => {
  if (!trusted(e) || typeof dataURL !== 'string' || !dataURL.startsWith('data:image/png;base64,')) return;
  try {
    const dir = path.join(app.getPath('pictures'), 'גן משחקים');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, String(name).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120));
    fs.writeFileSync(file.endsWith('.png') ? file : file + '.png', Buffer.from(dataURL.slice(22), 'base64'));
  } catch (err) { /* no Pictures folder: the drawing is still in the gallery */ }
});

/* ---------- one-time migration: progress saved by v1.0.x lived in the bundled page's localStorage ---------- */
function migrateOldProgress() {
  if (fs.existsSync(PROGRESS())) return Promise.resolve();
  return new Promise((resolve) => {
    const w = new BrowserWindow({ show: false, webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true } });
    const done = () => { clearTimeout(t); ipcMain.removeListener('gan:migrated', done); if (!w.isDestroyed()) w.destroy(); if (!progress) { progress = {}; } try { writeJSON(PROGRESS(), store()); } catch (e) { /* ignore */ } resolve(); };
    const t = setTimeout(done, 5000);
    ipcMain.on('gan:migrated', done);
    w.loadFile(path.join(__dirname, 'migrate.html')).catch(done);
  });
}

/* ---------- loading: live site → its offline cache → bundled copy ---------- */
function loadBundled() {
  source = 'bundled';
  win.loadFile(path.join(__dirname, 'web', 'index.html'));
}
function loadContent() {
  if (process.env.GAN_OFFLINE) return loadBundled();
  source = 'online';
  let settled = false;
  const fail = (e, code, desc, url, isMain) => {
    if (isMain === false || settled || code === -3) return; // -3 = aborted by a newer navigation
    settled = true; loadBundled();
  };
  win.webContents.once('did-fail-load', fail);
  win.webContents.once('did-finish-load', () => { settled = true; win.webContents.removeListener('did-fail-load', fail); });
  win.loadURL(SITE).catch(() => {});
  if (!net.isOnline()) source = 'cache';
}

function createWindow() {
  const { bounds } = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    title: 'גן משחקים',
    x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
    fullscreen: true,
    kiosk: true,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#FFF6E6',
    icon: path.join(__dirname, 'build', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      devTools: DEV,
      autoplayPolicy: 'no-user-gesture-required',
      spellcheck: false,
    },
  });
  win.setMenuBarVisibility(false);
  loadContent();
  win.once('ready-to-show', () => {
    win.show(); win.focus();
    // X11 window managers (e.g. Cinnamon/Muffin) honour full-screen reliably only once the window is mapped,
    // so re-assert it after showing: the window then covers the panel/taskbar.
    if (process.platform === 'linux') { win.setKiosk(true); win.setFullScreen(true); setTimeout(refull, 500); }
  });

  // Keys that could leave the game: Esc, F11, Alt+F4, reload, dev tools, zoom.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    const k = (input.key || '').toLowerCase();
    const ctrl = input.control || input.meta;
    if (k === 'escape' || k === 'f11' || k === 'f5' || k === 'f12' ||
        (input.alt && k === 'f4') ||
        (ctrl && ['r', 'w', 'q', 'n', 't', 'p', '+', '-', '=', '0'].includes(k)) ||
        (ctrl && input.shift && ['i', 'j', 'c'].includes(k))) {
      if (!(DEV && k === 'f12')) event.preventDefault();
      if (DEV && k === 'f12') win.webContents.toggleDevTools();
    }
  });
  win.webContents.on('zoom-changed', () => win.webContents.setZoomFactor(1));
  win.webContents.setVisualZoomLevelLimits(1, 1);

  // Stay full-screen no matter what.
  const refull = () => { if (!allowQuit && win && !win.isDestroyed()) { win.setKiosk(true); win.setFullScreen(true); } };
  win.on('leave-full-screen', refull);
  win.on('leave-html-full-screen', refull);
  win.on('minimize', () => { if (!allowQuit) { win.restore(); refull(); } });
  // Window managers can drop full-screen on their own (e.g. a Cinnamon shortcut) without Electron noticing,
  // so also compare the real window size with the screen and force it back.
  const coversScreen = () => {
    const b = win.getBounds(), d = screen.getDisplayMatching(b).bounds;
    return b.x <= d.x + 2 && b.y <= d.y + 2 && b.width >= d.width - 2 && b.height >= d.height - 2;
  };
  const guard = setInterval(() => {
    if (!win || win.isDestroyed()) return clearInterval(guard);
    if (allowQuit) return;
    if (win.isMinimized()) win.restore();
    // On Linux a minimize / "show desktop" from the window manager isn't always reported: take focus back.
    if (process.platform === 'linux' && !win.isFocused()) { win.restore(); win.show(); win.moveTop(); win.focus(); }
    if (!win.isFullScreen()) refull();
    else if (process.platform === 'linux' && !coversScreen()) { win.setFullScreen(false); win.setFullScreen(true); win.setKiosk(true); }
  }, 1500);

  // The window only closes through the "יציאה" button in the parents corner.
  win.on('close', (e) => { if (!allowQuit) e.preventDefault(); });
  // ...but never block logout / shutdown / reboot.
  win.on('session-end', systemQuit); // Windows logoff or shutdown
  // If the page still manages to close (e.g. window.close()), bring the game straight back.
  win.on('closed', () => { win = null; if (!allowQuit) setTimeout(createWindow, 300); });

  // Never open other windows or navigate away from the game (live site or bundled copy).
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://') && !url.startsWith(SITE_ORIGIN + '/')) e.preventDefault(); });
}

ipcMain.on('gan:quit', (e) => { if (trusted(e)) { allowQuit = true; app.quit(); } });

// The system (not a child) is ending the session: let the app close.
function systemQuit() { allowQuit = true; app.quit(); }
// app.quit() is only reached from the "יציאה" button or from the system (SIGTERM at Linux logout/shutdown,
// which Chromium turns into app.quit()); children can't trigger it (Ctrl+Q and the menu are disabled).
app.on('before-quit', () => { allowQuit = true; });

/* Windows: check GitHub Releases silently, download in the background, install when the app next closes. */
function autoUpdate() {
  if (process.platform !== 'win32' || DEV) return;
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('error', () => { /* offline or GitHub unreachable: try again next start */ });
    autoUpdater.checkForUpdates().catch(() => {});
  } catch (e) { /* updater not available */ }
}

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === 'fullscreen'));
  powerMonitor.on('shutdown', systemQuit); // Linux/macOS shutdown or reboot
  await migrateOldProgress();
  createWindow();
  setTimeout(autoUpdate, 8000);
});
app.on('window-all-closed', () => { if (allowQuit) app.quit(); });
