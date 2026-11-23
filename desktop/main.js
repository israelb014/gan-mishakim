/* גן משחקים — Electron main process.
   Loads the bundled web files (./web, copied from the repo root at build time), always full-screen. */
'use strict';
const { app, BrowserWindow, Menu, ipcMain, session, screen, powerMonitor } = require('electron');
const path = require('path');

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
  win.loadFile(path.join(__dirname, 'web', 'index.html'));
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

  // Never open other windows or navigate away from the bundled game.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) e.preventDefault(); });
}

ipcMain.on('gan:quit', () => { allowQuit = true; app.quit(); });

// The system (not a child) is ending the session: let the app close.
function systemQuit() { allowQuit = true; app.quit(); }
// app.quit() is only reached from the "יציאה" button or from the system (SIGTERM at Linux logout/shutdown,
// which Chromium turns into app.quit()); children can't trigger it (Ctrl+Q and the menu are disabled).
app.on('before-quit', () => { allowQuit = true; });

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === 'fullscreen'));
  powerMonitor.on('shutdown', systemQuit); // Linux/macOS shutdown or reboot
  createWindow();
});
app.on('window-all-closed', () => { if (allowQuit) app.quit(); });
