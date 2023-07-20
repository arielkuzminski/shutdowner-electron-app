const electron = require('electron');
const url = require('url');
const path = require('path');
const nodeCmd = require('node-cmd');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Listen for app to be ready

function createWindow () {

}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
          }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

app.on('ready', () => {
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
        width: 404,
        height: 375
    });
    win.loadFile('index.html');

    // enable or disable DevTools
    // win.webContents.openDevTools();
});

ipcMain.on('start', (e) => {
    // DEBUG ONLY
    // nodeCmd.get('winver', (err, data, stderr) => console.log(err, data, stderr));
    nodeCmd.get('shutdown -s -t 00', (err, data, stderr) => console.log(err, data, stderr));
})