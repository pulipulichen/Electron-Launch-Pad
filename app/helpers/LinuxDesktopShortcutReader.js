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
    return this
  },
  cache: {},
  read: function (path) {
    this.init()
    
    if (path.endsWith('.desktop') === false
          || this.lib.fs.existsSync(path) === false) {
      return undefined
    }
    
    let cache = this.cache[path]
    if (typeof(cache) !== 'undefined') {
      return cache
    }
    
    //console.log(path)
    let content = this.lib.fs.readFileSync(path, 'utf8')
    //console.log(content)
    let result = {}
    content.split('\n').forEach((line) => {
      line = line.trim()
      if (line === '' || line.indexOf('=') === -1) {
        return this
      }
      
      let key = line.slice(0, line.indexOf('=')).trim()
      let value = line.slice(line.indexOf('=')+1).trim()
      result[key] = value
    })
    
    // -----------------
    // remove shortcut which is not existed
    
    if (typeof(result["Exec"]) !== 'string') {
      return undefined
    }
    else {
      let execCommend = result["Exec"]
      if (execCommend.startsWith('"')) {
        execCommend = execCommend.slice(1, execCommend.indexOf('"', 1))
      }
      else if (execCommend.startsWith("'")) {
        execCommend = execCommend.slice(1, execCommend.indexOf("'", 1))
      }
      else {
        execCommend = execCommend.slice(0, execCommend.indexOf(' '))
      }
      
      if (this.lib.fs.existsSync(execCommend) === false) {
        return undefined
      }
    }
    
    // -----------------
    
    //console.log(result)
    this.cache[path] = result
    
    
    return result
  }
}

// file:///home/pudding/NetBeansProjects/[nodejs]/Electron-Launch-Pad/app/chrome-aohghmighlieiainnegkcijnfilokake-Default

if (typeof(window) !== 'undefined') {
  window.LinuxDesktopShortcutReader = LinuxDesktopShortcutReader
}
if (typeof(exports) !== 'undefined') {
  exports.default = LinuxDesktopShortcutReader
}