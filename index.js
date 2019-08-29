const path = require('path')
const fs = require('fs')

// ------------

const electron = require('electron')

const {
  app,
  BrowserWindow,
  clipboard,
} = electron

const ProcessArgvHelper = require('./electron-shell/ProcessArgvHelper.js')

let dirPath
//console.log(ProcessArgvHelper.getDirPaths())
ProcessArgvHelper.getDirPaths().forEach(path => {
  if (dirPath === undefined) {
    dirPath = path
  }
})
//console.log(dirPath)

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

const createWindow = require('./electron-shell/CreateWindow')

const IPCEventManager = require('./electron-shell/IpcEventManager')
IPCEventManager()
