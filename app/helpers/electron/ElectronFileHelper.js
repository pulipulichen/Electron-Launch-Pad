/* global __dirname */

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
      return this
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
    this.init()
    return this.lib.fs.readFileSync(filepath, 'utf8')
  },
  writeFileSync: function (filepath, content) {
    this.init()
    this.lib.fs.writeFileSync(filepath, content, 'utf8')
    return filepath
  },
  writeFileAsync: function (filepath, content, callback) {
    this.init()
    this.lib.fs.writeFile(filepath, content, 'utf8', () => {
      if (typeof(callback) === 'function') {
        callback(filepath, content)
      }
    })
    return this
  },
  writeFileDelayTimer: {},
  /**
   * 
   * @param {type} filepath
   * @param {type} content
   * @param {type} delaySec 延遲時間，預設是1秒
   * @param {type} callback
   * @returns {unresolved}
   */
  writeFileDelay: function (filepath, content, delaySec, callback) {
    this.init()
    if (typeof(delaySec) === 'function') {
      callback = delaySec
      delaySec = 1000
    }
    if (typeof(callback) !== 'function') {
      callback = () => {}
    }
    
    if (this.writeFileDelayTimer[filepath] !== null) {
      clearTimeout(this.writeFileDelayTimer[filepath])
      this.writeFileDelayTimer[filepath] = null
    }
    
    this.writeFileDelayTimer[filepath] = setTimeout(() => {
      this.writeFileAsync(filepath, content, () => {
        this.writeFileDelayTimer[filepath] = null
        
        if (typeof(callback) === 'function') {
          callback(filepath)
        }
      })
    }, delaySec * 1000)
    
    return this
  },
  writeFileBase64Sync: function (filepath, base64) {
    this.init()
    this.lib.fs.writeFileSync(filepath, base64, 'base64')
    return this
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
  },
  showInFolder: function (path) {
    if (this.existsSync(path)) {
      this.lib.shell.openExternal(path)
    }
    return this
  },
  readDirectory: function (dirPath, callback) {
    
    let fileList = []
    let dirList = []
    
    if (typeof(callback) !== 'function') {
      return this
    }
    else if (this.isDirSync(dirPath) === false) {
      callback({
        file: fileList,
        dir: dirList
      })
    }
    
    this.lib.fs.readdir(dirPath, (err, files) => {
        //handling error
        if (err) {
            return console.error('Unable to scan directory: ' + dirPath + '\n' + err);
        } 
        //listing all files using forEach
        files.forEach((file) => {
          // Do whatever you want to do with the file
          let filepath = this.lib.path.join(dirPath, file)
          let isDir = this.lib.fs.lstatSync(filepath).isDirectory()

          if (isDir) {
            dirList.push(filepath)
          }
          else {
            fileList.push(filepath)
          }
        })
        
        callback({
          file: fileList.sort(),
          dir: dirList.sort()
        })
    })
    return this
  }
}

//ElectronFileHelper.init()

if (typeof(window) === 'object') {
  window.ElectronFileHelper = ElectronFileHelper
}
if (typeof(module) === 'object') {
  module.exports = ElectronFileHelper
}
