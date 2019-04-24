const {app, Tray, Menu, BrowserWindow, ipcMain, globalShortcut} = require('electron')
const ClipboardManager = require('./clipboard-manager.js');

let tray = null;
let selectorWindow =  null;
let manager = null;

function launchSelectorWindow() {
  selectorWindow = new BrowserWindow({
    width: 600,
    height: 600,
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
  manager = ClipboardManager.create((result) => {
    tray.displayBalloon({
      title: 'You Copied...',
      content: `${result}`,
    });
  });


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

app.on('ready', init)

app.on('window-all-closed', () => {});

app.on('activate', function () {
  if (tray === null) init();
});