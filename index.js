
const path = require('path')
const fs = require('fs')

// ------------

const {
  app,
  BrowserWindow,
  clipboard,
} = require('electron')
  
//const settings = require('electron-settings');

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
  createWindow()
})

const createWindow = require('./CreateWindow')

require('./IpcEventManager')
