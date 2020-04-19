const electron = require('electron');
const url = require('url');
const path = require('path');
const nodeCmd = require('node-cmd');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

// Listen for app to be ready
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        },
        width: 404,
        height: 350
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true,
    }));
    // mainWindow.webContents.openDevTools();
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

ipcMain.on('start', (e) => {
    // DEBUG ONLY
    // nodeCmd.get('winver', (err, data, stderr) => console.log(err, data, stderr));
    nodeCmd.get('shutdown -s -t 00', (err, data, stderr) => console.log(err, data, stderr));
})

const mainMenuTemplate = [
    {
        label: 'App',
        submenu: [
            {
                label: 'Quit',
                click() {
                    app.quit();
                }
            }
        ]
    },
];