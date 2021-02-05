/* global __dirname */

const debug = {
  useMousePositionDisplay: true
}

const electron = require('electron')
const {
  app,
  BrowserWindow,
  clipboard,
  globalShortcut 
} = electron

const url = require('url')
const path = require('path')

let mode = 'production'
if (process.argv.indexOf('--mode') - process.argv.indexOf('development') === -1) {
  mode = "development"
}
// For test
//mode = 'development'

module.exports = function (shortcutsDirPath, callback) {
  
  let iconPath = path.join(__dirname, '../app/imgs/icon256.ico')
  if (process.platform === 'linux') {
    iconPath = path.join(__dirname, '../app/imgs/icon256.png')
  }
  
  // https://electronjs.org/docs/api/screen
  let screen = electron.screen
  let display
  if (debug.useMousePositionDisplay) {
    let point = screen.getCursorScreenPoint()
    display = screen.getDisplayNearestPoint(point)
  }
  else {
    // 測試用，固定用最後一個熒幕
    let displays = screen.getAllDisplays()
    display = displays[0]
  }
  
  let offsetX = display.bounds.x
  let offsetY = display.bounds.y
  //let displays = screen.getAllDisplays()
  //console.log(display)
  
  let {width, height} = display.workArea
  
  let optionBrowserWindow = {
    x: offsetX,
    y: offsetY,
    //fullscreen: true,
    frame: false,
    icon: iconPath,
    transparent: true,
    width: width,
    height: height,
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
  win.maximize()
  
  if (mode === 'production') {
    win.setMenu(null)
    win.setMenuBarVisibility(false)
  }
  
  win.setResizable(false)
  
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../app', 'index.html'),
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
  win.shortcutsDirPath = shortcutsDirPath
  
  //return win
  win.webContents.once('dom-ready', () => {
    
    //const electronVibrancy = require('electron-vibrancy')
    //electronVibrancy.SetVibrancy(win, 0)
    
    if (typeof(callback) === 'function') {
      callback(win)
    }
  })
  
  globalShortcut.register('Ctrl+W', () => {
    win.close()
  })
  
  let escPressed = false
  globalShortcut.register('ESC', () => {
    win.close()
  })
  
  return win
}