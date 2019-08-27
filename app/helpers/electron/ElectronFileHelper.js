let ElectronFileHelper = {
  inited: false,
  lib: {
    readChunk: null,
    fileType: null,
    path: null,
    fs: null,
    exec: null,
  },
  init: function () {
    if (this.inited === true) {
      return
    }
    
    this.lib.readChunk = RequireHelper.require('read-chunk')
    this.lib.fileType = RequireHelper.require('file-type')
    this.lib.path = RequireHelper.require('path')
    this.lib.fs = RequireHelper.require('fs')
    this.lib.exec = RequireHelper.require('child_process').exec
    
    this.inited = true
  },
  getExt: function (filepath) {
    this.init()
    
    let ext
    if (typeof(filepath) === 'string') {
      ext = filepath.slice(filepath.lastIndexOf('.') + 1)
    }
    return ext
  },
  getFileType: function (filepath) {
    this.init()
    
    const buffer = this.lib.readChunk.sync(filepath, 0, this.lib.fileType.minimumBytes);
    let fileTypeResult = this.lib.fileType(buffer)
    return fileTypeResult
  },
  basename: function (filepath) {
    this.init()
    return this.lib.path.basename(filepath)
  },
  existsSync: function (filepath) {
    this.init()
    return this.lib.fs.existsSync(filepath)
  },
  readFileSync: function (filepath) {
    return this.lib.fs.readFileSync(filepath, 'utf8')
  },
  writeFileSync: function (filepath, content) {
    return this.lib.fs.writeFileSync(filepath, content, 'utf8')
  },
  writeFileBase64Sync: function (filepath, content) {
    return this.lib.fs.writeFileSync(filepath, content, 'base64')
  },
  getBasePath: function () {
    this.init()
    
    if (this.basepath === null) {
      let basepath = './'
      if (typeof(process.env.PORTABLE_EXECUTABLE_DIR) === 'string') {
        basepath = process.env.PORTABLE_EXECUTABLE_DIR
      }
      this.basepath = basepath
    }
    return this.basepath
  },
  basepath: null,
  resolve: function (filePath) {
    this.init()
    
    let basepath = this.getBasePath()
    return this.lib.path.resolve(basepath, filePath)
  },
  _tmpDirChecked: false,
  getTmpDirPath: function (filePath) {
    this.init()
    
    let tmpDirPath
    if (this._tmpDirChecked === false) {
      tmpDirPath = this.resolve('tmp')
      if (this.lib.fs.existsSync(tmpDirPath) === false) {
        this.lib.fs.mkdirSync(tmpDirPath)
      }
      this._tmpDirChecked = true
    }
    
    if (typeof(filePath) === 'string') {
      filePath = 'tmp/' + filePath
      tmpDirPath = this.resolve(filePath)
    }
    else {
      tmpDirPath = this.resolve('tmp')
    }
    
    return tmpDirPath
  },
  resolveAppPath: function (filePath) {
    this.init()
    
    //console.log([process.env.PORTABLE_EXECUTABLE_DIR, filePath, __dirname])
    
    return this.lib.path.join(__dirname, filePath)
    /*
    if (typeof(process.env.PORTABLE_EXECUTABLE_DIR) === 'string') {
      //console.log(FileSet)
      //alert(['error', filePath ])
      //throw Error('resolveAppPath')
      //console.log(filePath)
      filePath = path.join(__dirname, '/resources/app.asar/app/', filePath)
      return filePath
    }
    else {
      return this.resolve('app/' + filePath)
    }
    */
  },
  execExternalCommand: function (execCommand, callback) {
    if (process.platform === 'win32') {
      execCommand = '"' + this.resolve('exec/exec.exe') + '" ' + execCommand
      console.log(execCommand)
    }
    //const exec = require('child_process').exec
    this.lib.exec(execCommand, callback)
  }
}

//ElectronFileHelper.init()

if (typeof(window) === 'object') {
  window.ElectronFileHelper = ElectronFileHelper
}
if (typeof(module) === 'object') {
  module.exports = ElectronFileHelper
}