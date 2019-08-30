let WindowsEnvVarHelper = {
  inited: false,
  lib: {
    exec: null,
    iconv: null
  },
  envVars: {},
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.execSync = require('child_process').execSync
    this.lib.iconv = require('iconv-lite')
    
    let stdout = this.lib.execSync(`set`, {
      encoding: 'buffer'
    })
    let result = {}
    let outText = stdout
    //console.log(outText)
    outText = this.lib.iconv.decode(outText, 'big5')

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

    this.envVars = result
    
    this.inited = true
    return this
  },
  replaceEnvVars: function (filepath) {
    if (typeof(filepath) !== 'string'
            || filepath.split('%').length < 3) {
      return filepath
      return this
    }
    
    this.init()
    for (let key in this.envVars) {
      let value = this.envVars[key]
      filepath = filepath.split(`%${key}%`).join(value)
    }
    return filepath
  }
}

if (typeof(window) !== 'undefined') {
  window.WindowsEnvVarHelper = WindowsEnvVarHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = WindowsEnvVarHelper
}