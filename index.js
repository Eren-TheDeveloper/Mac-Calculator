const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
function createWindow() {
  const win = new BrowserWindow({
    width: 320, height: 440, useContentSize: true, frame: false,
    backgroundColor: '#49394d', resizable: false, maximizable: false,
    show: false, autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'index.html'));
}
for (const action of ['close', 'minimize']) {
  ipcMain.on(`window:${action}`, event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && event.senderFrame === win.webContents.mainFrame) win[action]();
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
