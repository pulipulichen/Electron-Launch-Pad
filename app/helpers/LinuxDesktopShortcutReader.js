let LinuxDesktopShortcutReader = {
  inited: false,
  lib: {
    path: null,
    fs: null
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.path = require('path')
    this.lib.fs = require('fs')
    
    this.inited = true
  },
  read: function (path) {
    this.init()
    
    if (path.endsWith('.desktop') === false
          || this.lib.fs.existsSync(path) === false) {
      return undefined
    }
    
    let content = this.lib.fs.readFileSync(path, 'utf8')
    
    let result = {}
    content.split('\n', (line) => {
      line = line.trim()
      if (line === '' || line.indexOf('=') === -1) {
        return
      }
      
      let key = line.slice(0, line.indexOf('=')).trim()
      let value = line.slice(line.indexOf('=')+1).trim()
      result[key] = value
    })
    
    return result
  }
}

if (typeof(window) !== 'undefined') {
  window.LinuxDesktopShortcutReader = LinuxDesktopShortcutReader
}
if (typeof(exports) !== 'undefined') {
  exports.default = LinuxDesktopShortcutReader
}