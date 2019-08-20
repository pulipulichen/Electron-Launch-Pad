const {
  app,
  BrowserWindow,
  clipboard,
} = require('electron')

const url = require('url')
const path = require('path')

let mode = 'production'
if (process.argv.indexOf('--mode') - process.argv.indexOf('development') === -1) {
  mode = "development"
}
// For test
//mode = 'development'

module.exports = function (dirpath, callback) {
  
  let optionBrowserWindow = {
    //fullscreen: true,
    frame: false,
    icon: './app/imgs/icon256.ico',
    //useContentSize: true,
    webPreferences: {
      nodeIntegration: true
    }
  }
  
  if (process.platform === 'win') {
    optionBrowserWindow.icon = optionBrowserWindow.icon.slice(0, optionBrowserWindow.icon.lastIndexOf('.')) 
            + '.ico'
  }
  let win = new BrowserWindow(optionBrowserWindow)
  win.maximize();
  
  if (mode === 'production') {
    win.setMenu(null)
    win.setMenuBarVisibility(false)
  }
  
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'app', 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  
  //settings.set('mode', mode);
  
  if (mode === 'development') {
    win.webContents.openDevTools()
  }
  
  //win.rendererSideName.filepath = filepath
  //win.rendererSideName.mode = mode
  win.mode = mode
  win.dirpath = dirpath
  
  //return win
  win.webContents.once('dom-ready', () => {
    if (typeof(callback) === 'function') {
      callback(win)
    }
  })
  return win
}