// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const axios = require('axios')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL("http://google.com")
  mainWindow.webContents.session.protocol.interceptStreamProtocol('http', handleHttp)
  mainWindow.webContents.session.protocol.interceptStreamProtocol('https', handleHttp)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function handleHttp(request, callback){
  axios[request.method.toLowerCase()](request.url,
    {
        responseType: "stream",
        headers: request.headers,
        maxRedirects: 0,
    }).then((response) => {
        const resp = {
            statusCode: response.status,
            headers: response.headers,
            data: response.data,
        };
        callback(resp);
    }).catch((err) => {
        const resp = {
            statusCode: err.response.status,
            headers: err.response.headers,
            data: err.response.data,
        };
        callback(resp);
    });

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

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
