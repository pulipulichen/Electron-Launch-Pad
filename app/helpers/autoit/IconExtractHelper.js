let IconExtractHelper = {
  inited: false,
  lib: {
    fs: null,
    path: null,
    exec: null
  },
  iconExtractorPath: null,
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.fs = require('fs')
    this.lib.path = require('path')
    this.lib.exec = require('child_process').exec
    
    this.iconExtractorPath = this.lib.path.resolve(__dirname, '../win32-helpers/icon-extractor/icon-extractor.exe')
    //console.log(this.iconExtractorPath)
    
    this.inited = true
    return this
  },
  extract: function (exePath, filename, callback) {
    this.init()
    if (this.lib.fs.existsSync(exePath) === false) {
      console.error('exe is not found: ' + exePath)
      callback()
      return
    }
    
    if (filename.endsWith('.png') === false) {
      filename = filename + '.png'
    }
    
    let command = `"${this.iconExtractorPath}" "${exePath}" "${filename}"`
    //console.log(command)
    this.lib.exec(command, (err, stdout, stderr) => {
      let filepath = this.lib.path.resolve(__dirname, '../win32-helpers/icon-extractor/' + filename)
      
      if (typeof(callback) === 'function') {
        callback(filepath)
      }
    })
  }
}

if (typeof(window) !== 'undefined') {
  window.IconExtractHelper = IconExtractHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = IconExtractHelper
}