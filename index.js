const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');

function createWindow () {
  // Create the browser window with the `nodeIntegration` option enabled.
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//This hack is to open links in default system browser. We can't do it from renderer?
ipcMain.on('tmiclicked', (event, arg) => {
  event.returnValue = 'Message received!'
  require('electron').shell.openExternal(`https://twitchapps.com/tmi/`);
})
ipcMain.on('aiclicked', (event, arg) => {
  event.returnValue = 'Message received!'
  require('electron').shell.openExternal(`https://beta.openai.com/account/api-keys`);
})