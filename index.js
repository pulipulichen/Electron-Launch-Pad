
const path = require('path')
const fs = require('fs')

// ------------

const {
  app,
  BrowserWindow,
  clipboard,
} = require('electron')

const ProcessArgvHelper = require('./app/helpers/electron/ProcessArgvHelper')

let dirPath
ProcessArgvHelper.getDirPaths().forEach(path => {
  if (dirPath === undefined) {
    dirPath = path
  }
})

// ------------

//app.on('ready', createWindow)

app.on('window-all-closed', () => {
  // darwin = MacOS
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.commandLine.appendSwitch('disable-site-isolation-trials');

//app.on('activate', () => {
app.on('ready', () => {
  createWindow(dirPath)
})

const createWindow = require('./CreateWindow')

require('./IpcEventManager')
