let WindowsShortcutHelper = {
  inited: false,
  lib: {
    fs: null,
    path: null,
    exec: null,
    iconv: null,
    WindowsEnvVarHelper: null,
    imageSize: null,
  },
  shortcutReaderPath: null,
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.fs = require('fs')
    this.lib.path = require('path')
    this.lib.exec = require('child_process').exec
    this.lib.iconv = require('iconv-lite')
    this.lib.imageSize = require('image-size')
    
    this.lib.WindowsEnvVarHelper = RequireHelper.require('./helpers/autoit/WindowsEnvVarHelper')
    
    this.shortcutReaderPath = this.lib.path.resolve(__dirname, '../win32-helpers/shortcut-reader/shortcut-reader.exe')
    //console.log(this.shortcutReaderPath)
    
    this.inited = true
    return this
  },
  query: function (lnkPath, callback) {
    this.init()
    if (lnkPath.endsWith('.lnk') === false
            || this.lib.fs.existsSync(lnkPath) === false) {
      console.error('lnk is not found: ' + lnkPath)
      callback()
      return this
    }
    
    let command = `"${this.shortcutReaderPath}" "${lnkPath}"`
    //console.log(command)
    this.lib.exec(command, {
      encoding: 'buffer'
    }, (err, stdout, stderr) => {
      let result = {}
      let outText = stdout
      //console.log(outText)
      outText = this.lib.iconv.decode(outText, 'big5')
      //console.log(outText)
      
      outText.split('\n').forEach(line => {
        line = line.trim()
        let quelPos = line.indexOf('=')
        if (line === '' || quelPos === -1) {
          return this
        }
        
        let key = line.slice(0, quelPos)
        let value = line.slice(quelPos + 1).trim()
        
        if (['Exec', 'Target', 'Icon'].indexOf(key) > -1) {
          value = this.lib.WindowsEnvVarHelper.replaceEnvVars(value)
        }
        
        result[key] = value
      })
      
      
      result['Path'] = lnkPath
      
      let altPath = this.getAlternativeIcon(result['Icon'])
      if (typeof(altPath) === 'string') {
        result['Icon'] = altPath
      }
      else if (result['Target'].endsWith('chrome.exe') 
              && result['Target'] !== result['Exec']) {
        // do nothing
      }
      else {
        altPath = this.getAlternativeIcon(result['Target'])
        if (typeof(altPath) === 'string') {
          result['Icon'] = altPath
        }
      }
      
      if (typeof(callback) === 'function') {
        callback(result)
      }
    })
    return this
  },
  getAlternativeIcon: function (anchorPath) {
    if (typeof(anchorPath) !== 'string' 
            || this.lib.fs.existsSync(anchorPath) === false
            || anchorPath.lastIndexOf('.') === -1) {
      return false
    }
    
    let pathWithoutExt = anchorPath.slice(0, anchorPath.lastIndexOf('.') + 1)
    let alternativeList = [
      pathWithoutExt + 'png',
      pathWithoutExt + 'jpg',
      pathWithoutExt + 'jpeg',
      pathWithoutExt + 'gif',
    ]
    
    let width = 0
    if (anchorPath.endsWith('.ico')) {
      width = this.lib.imageSize(anchorPath).width
    }
    else if (anchorPath.endsWith('chrome.exe') === false) {
      alternativeList.push(pathWithoutExt + 'ico')
    }
    
    for (let i = 0; i < alternativeList.length; i++) {
      let altPath = alternativeList[i]
      if (this.lib.fs.existsSync(altPath) 
              && this.lib.imageSize(altPath).width > width) {
        return altPath
      }
    }
  }
}

if (typeof(window) !== 'undefined') {
  window.WindowsShortcutHelper = WindowsShortcutHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = WindowsShortcutHelper
}