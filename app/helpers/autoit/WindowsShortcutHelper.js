let WindowsShortcutHelper = {
  inited: false,
  lib: {
    fs: null,
    path: null,
    exec: null,
    iconv: null
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
        result[key] = value
      })
      
      if (typeof(callback) === 'function') {
        callback(result)
      }
    })
  }
}

if (typeof(window) !== 'undefined') {
  window.WindowsShortcutHelper = WindowsShortcutHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = WindowsShortcutHelper
}