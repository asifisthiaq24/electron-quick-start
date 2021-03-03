// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const {  dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
  setInterval(()=>{
    mainWindow.webContents.send('checking_for_update', { version: app.getVersion() });
    autoUpdater.checkForUpdatesAndNotify();
  },10000)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('checking_for_update', { x:"update available" });
  mainWindow.webContents.send('update_available', { version: app.getVersion() });
});
autoUpdater.on('update-downloaded', () => {
  
  mainWindow.webContents.send('update_downloaded', { version: app.getVersion() });
});

/*checking for updates*/
autoUpdater.on("checking-for-update", () => {
  //your code
  mainWindow.webContents.send('checking_for_update', { x:"checking-for-update" });
});

/*No updates available*/
autoUpdater.on("update-not-available", info => {
  //your code
  mainWindow.webContents.send('checking_for_update', { x:"update not availaable" });
});

/*Download Status Report*/
autoUpdater.on("download-progress", progressObj => {
 //your code
 mainWindow.webContents.send('checking_for_update', { x:"download progress" });
});



autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
  mainWindow.webContents.send('checking_for_update', { error: message, x:"error khaise" });
})

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});