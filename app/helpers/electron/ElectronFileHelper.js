/* global __dirname */

let ElectronFileHelper = {
  inited: false,
  lib: {
    readChunk: null,
    fileType: null,
    path: null,
    fs: null,
    exec: null,
    shell: null,
    spawn: null,
    electron: null,
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.readChunk = RequireHelper.require('read-chunk')
    this.lib.fileType = RequireHelper.require('file-type')
    this.lib.path = RequireHelper.require('path')
    this.lib.fs = RequireHelper.require('fs')
    const child_process = RequireHelper.require('child_process')
    this.lib.exec = child_process.exec
    this.lib.spawn = child_process.spawn
    
    this.lib.electron = RequireHelper.require('electron')
    this.lib.shell = this.lib.electron.shell
    
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
    if (typeof(filepath) !== 'string') {
      return false
    }
    return this.lib.fs.existsSync(filepath)
  },
  isDirSync: function (dirpath) {
    this.init()
    if (this.existsSync(dirpath)) {
      return this.lib.fs.lstatSync(dirpath).isDirectory()
    }
    else {
      return false
    }
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
    //console.log(filepath)
    //return this.writeFileSync(filepath, content)
    
    if (typeof(delaySec) === 'function') {
      callback = delaySec
      delaySec = 1
    }
    if (typeof(callback) !== 'function') {
      callback = () => {}
    }
    
    if (this.writeFileDelayTimer[filepath] !== null) {
      clearTimeout(this.writeFileDelayTimer[filepath])
      this.writeFileDelayTimer[filepath] = null
    }
    
    //console.log('writeFile', filepath)
    this.writeFileDelayTimer[filepath] = setTimeout(() => {
      this.writeFileSync(filepath, content, () => {
        this.writeFileDelayTimer[filepath] = null
        
        if (typeof(callback) === 'function') {
          callback(filepath)
        }
      })
    }, delaySec * 1000)
    
    return this
  },
  writeFileBase64Async: function (filepath, base64, callback) {
    this.init()
    //console.log('write base64: ' + filepath)
    //console.log(base64)
    this.lib.fs.writeFile(filepath, base64, 'base64', callback)
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
      let tmpFolderPath = execCommand
      if (tmpFolderPath.startsWith('"') && tmpFolderPath.endsWith('"')) {
        tmpFolderPath = tmpFolderPath.slice(1, -1)
      }
      //console.log([tmpFolderPath, this.isDirSync(tmpFolderPath)])
      if (this.isDirSync(tmpFolderPath)) {
        this.lib.shell.openItem(tmpFolderPath)
        if (typeof(callback) === 'function') {
          callback()
        }
      }
      else {
        execCommand = '"' + this.resolve('win32-helpers/exec-external/exec-external.exe') + '" ' + execCommand
        console.log(execCommand)

        //const exec = require('child_process').exec
        this.lib.exec(execCommand, callback)
      }
    }
    else if (process.platform === 'linux') {
      //execCommand = `nohup ${execCommand} &`
      //console.log(execCommand)
      
      /*
      let spawn = require('child_process').spawn
      //spawn("gedit", {}, {shell: true})
      // /opt/google/chrome/google-chrome --app=http://blog.pulipuli.info
      spawn("/opt/google/chrome/google-chrome", [
        '--app=http://blog.pulipuli.info'
      ], {shell: true})
       */
      //let te= require('terminal-exec')
      //te('/opt/google/chrome/google-chrome --app=http://blog.pulipuli.info')
      //te('gedit')
      
      execCommand = `nohup /usr/bin/xfce4-terminal --command "${execCommand}" &`
      
      this.lib.exec(execCommand, callback)
      //callback()
      /*
      this.lib.spawn('/usr/bin/xfce4-terminal', [
        "--command",
        "/opt/google/chrome/google-chrome --app=http://blog.pulipuli.info"
      ])
      //callback()
      */
    }
  },
  showInFolder: function (path) {
    if (this.existsSync(path)) {
      if (this.isDirSync(path)) {
        this.lib.shell.openExternal(path)
      }
      else {
        this.lib.shell.showItemInFolder(path)
      }
    }
    return this
  },
  readDirectoryFilesRecursively: function (dirPath, callback) {
    let fileList = []
    
    if (typeof(callback) !== 'function') {
      return this
    }
    else if (this.isDirSync(dirPath) === false) {
      callback(fileList)
      return this
    }
    
    let addDir = (dirPath, callback) => {
      
      this.readDirectory(dirPath, (list) => {
        fileList = fileList.concat(list.file)
        //console.log(list)
        let loop = (i) => {
          if (i < list.dir.length) {
            addDir(list.dir[i], () => {
              //console.log(list)
              //fileList = fileList.concat(list)
              i++
              loop(i)
            })
          }
          else {
            callback()
          }
        }
        loop(0)
      })
    }
    
    addDir(dirPath, () => {
      callback(fileList)
    })
    
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
      return this
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
  },
  move: function (oldPath, newPath) {
    if (this.existsSync(oldPath)) {
      this.lib.fs.renameSync(oldPath, newPath)
    }
    return this
  },
  remove: function (path) {
    if (this.existsSync(path)) {
      this.lib.fs.unlinkSync(path)
    }
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
