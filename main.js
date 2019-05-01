const {app, Tray, Menu, BrowserWindow, ipcMain, globalShortcut} = require('electron')
const ClipboardManager = require('./clipboard-manager.js');

let tray = null;
let selectorWindow =  null;
let manager = null;

function launchSelectorWindow() {
  selectorWindow = new BrowserWindow({
    width: 600,
    height: 600,
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  selectorWindow.loadFile('clipboard-selector.html');

  selectorWindow.on('closed', () => {
    selectorWindow = null;
  });
}

function init () {
  manager = ClipboardManager.create();

  tray = new Tray('./app.ico');
  tray.setToolTip('Clipboard Manager');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      type: 'normal',
      click: () => {
        manager && manager.stop();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  const ret = globalShortcut.register("Ctrl+Alt+V", () => {
    if (selectorWindow) {
      return;
    }
    launchSelectorWindow();
  });

  if (!ret) {
    console.error('failed to register hot key');
  }
}

ipcMain.on('get-clipboard-history', (event, arg) => {
  event.returnValue = manager.getHistory();
});

ipcMain.on('value-written-to-clipboard', (event, arg) => {
  selectorWindow.close();
  selectorWindow = null;
  tray.displayBalloon({
    title: 'Copied!',
    content: 'Your text is ready to paste.',
  });
});

app.on('ready', init)

app.on('window-all-closed', () => {});

app.on('activate', function () {
  if (tray === null) init();
});