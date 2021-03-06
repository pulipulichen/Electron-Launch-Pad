/* global __dirname */

let ShortcutHelper = {
  debug: {
    enableShortcutCache: true,
    enableIconCache: true,
    useTestDir: false,
  },
  inited: false,
  lib: {
    path: null,
    IconExtractHelper: null,
    windowShortcut: null,
    ElectronFileHelper: null,
    FolderConfigHelper: null,
    LinuxDesktopShortcutReader: null,
    ImageMagickHelper: null,
    PredefinedIconsHelper: null
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    // -------------
    
    this.lib.path = RequireHelper.require('path')
    if (process.platform === 'win32') {
      //this.lib.windowShortcut = RequireHelper.require('windows-shortcuts')
      this.lib.WindowsShortcutHelper = RequireHelper.require('./helpers/WindowsShortcutHelper')
      this.lib.IconExtractHelper = RequireHelper.require('./helpers/IconExtractHelper')
    }
    this.lib.ElectronFileHelper = RequireHelper.require('./helpers/electron/ElectronFileHelper')
    this.lib.FolderConfigHelper = RequireHelper.require('./helpers/FolderConfigHelper')
    this.lib.LinuxDesktopShortcutReader = RequireHelper.require('./helpers/LinuxDesktopShortcutReader')
    
    this.lib.ImageMagickHelper = RequireHelper.require('./helpers/autoit/ImageMagickHelper')
    
    this.lib.PredefinedIconsHelper = RequireHelper.require('./helpers/PredefinedIconsHelper')
    if (typeof(this.lib.PredefinedIconsHelper) === 'object') {
      this.lib.PredefinedIconsHelper = this.lib.PredefinedIconsHelper.default
    }
    //console.log(this.lib.PredefinedIconsHelper)
    
    // -------------
    this.inited = true
    return this
  },
  cache: {
    shortcuts: {},
    icon: {},
  },
  buildMockShortcut: function (i) {
    let mock = {
      icon: this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
      name: `${i} APP`,
      //exec: `C:\\Windows\\notepad.exe "APP ${i}.txt"`,p
      exec: `"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --ignore-certificate-errors --app=https://blog.pulipuli.info --test APP${i}`,
      //exec: 'gedit',
      description: 'description',
      //order: i
    }
    
    if (process.platform === 'linux') {
      //mock.exec = '/opt/google/chrome/google-chrome --app=http://blog.pulipuli.info'
      mock.exec = 'gedit'
    }
    
    
    return mock
  },
  createMockShortcuts: function () {
    this.init()
    let shortcuts = []
    
    for (let i = 0; i < 23; i++) {
      if (i % 7 === 2) {
        let items = []
        for (let j = 0; j < 3; j++) {
          items.push(this.buildMockShortcut(j))
        }
        
        shortcuts.push({
          icon: [
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png')
          ],
          name: `${i} APP`,
          //exec: `echo "APP ${i}"`,
          description: 'description',
          subItems: items,
          //order: i
        })
      }
      else if (i % 7 === 6) {
        let items = []
        for (let j = 0; j < 20; j++) {
          items.push(this.buildMockShortcut(j))
        }
        
        shortcuts.push({
          icon: [
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
            this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png')
          ],
          name: `${i} APP`,
          //exec: `echo "APP ${i}"`,
          description: 'description',
          subItems: items,
          //order: i
        })
      }
      else {
        shortcuts.push(this.buildMockShortcut(i))
      }
    }
    return shortcuts
  },
  getDirListShortcuts: function (baseDirPath, dirList, callback) {
    this.init()
    
    //console.log(dirList)
    //return 
    
    if (typeof(callback) !== 'function') {
      return this
    }
    
    let shortcutList = []
    
    let continueLoop = (i) => {
      i++
      loop(i)
    }
    //console.log('getDirListShortcuts', -1)
    let loop = (i) => {
      //console.log('getDirListShortcuts', i)
      if (i < dirList.length) {
        let dirPath = dirList[i]
        //console.log(dirPath)
        this.getDirShortcutMetadata(baseDirPath, dirPath, (shortcut) => {
          //return console.log(shortcut)
          if (shortcut !== undefined && typeof(shortcut) === 'object') {
            shortcutList.push(shortcut)
          }
          continueLoop(i)
        })
      }
      else {
        callback(shortcutList)
      }
      return this
    }
    
    return loop(0)
  },
  getDirShortcutMetadata: function (baseDirPath, subDirPath, callback) {
    this.init()
    if (typeof(callback) !== 'function') {
      return this
    }
    
    if (typeof(subDirPath) !== 'string' 
            || this.lib.ElectronFileHelper.isDirSync(subDirPath) === false) {
      console.error('Is not dir: ' + subDirPath)
      //console.log()
      //"D:\\xampp\\htdocs\\projects-electron\\Electron-Launch-Pad\\demo-shortcuts\\win32\\JDownloader"
      callback()
      return this
    }
    
    let shortcut = this.lib.FolderConfigHelper.readShortcutMetadata(baseDirPath, subDirPath)
    if (typeof(shortcut) === 'object') {
      //console.log(shortcut)
      callback(shortcut)
      return this
    }
    
    // -------------------------
    let dirShortcut = {
      name: this.lib.path.basename(subDirPath),
      subItems: [],
      //path: subDirPath
    }
    
    //return console.log(subDirPath)
    
    this.lib.ElectronFileHelper.readDirectoryFilesRecursively(subDirPath, (files) => {
      //console.log(files)
      //let files = list.file
      
      let continueLoop = (i) => {
        i++
        return loop(i)
      }
      
      let loop = (i) => {
        if (i < files.length) {
          let file = files[i]
          if (this.isShortcut(file) === false) {
            return continueLoop(i)
          }
          
          this.getShortcutMetadata(baseDirPath, file, (shortcut) => {
            if (typeof(shortcut) === 'object') {
              dirShortcut.subItems.push(shortcut)
            }
            continueLoop(i)
          })
        }
        else {
          if (dirShortcut.subItems.length > 0) {
            callback(dirShortcut)
          }
          else {
            callback()
          }
        }
        return true
      }
      
      loop(0)
    })
    return this
  },
  getFileListShortcuts: function (baseDirPath, fileList, callback) {
    this.init()
    if (typeof(callback) !== 'function') {
      return this
    }
    
    let result = []
    
    //console.log(fileList)
    
    let continueLoop = (i) => {
      //console.log(i)
      i++
      setTimeout(() => {
        loop(i)
      }, 0)
    }
    
    let loop = (i) => {
      if (i < fileList.length) {
        let shortcutPath = fileList[i]
        if (this.isShortcut(shortcutPath)) {
          //console.log([i, shortcutPath])
          this.getShortcutMetadata(baseDirPath, shortcutPath, (metadata) => {
            //console.log([i, shortcutPath])
            //console.log(metadata)
            if (typeof(metadata) === 'object') {
              result.push(metadata)
              //console.log(metadata)
            }
            return continueLoop(i)
          })
        }
        else {
          return continueLoop(i)
        }
      }
      else {
        callback(result)
      }
    }
    loop(0)
    return this
  },
  isShortcut: function (path) {
    if (process.platform === 'win32') {
      return path.endsWith('.lnk')
    }
    else if (process.platform === 'linux') {
      return path.endsWith('.desktop')
    }
    else {
      return false
    }
  },
  getShortcutMetadata: function (baseDirPath, shortcutPath, callback) {
    let cacheShortcutMetadata = localStorage.getItem('getShortcutMetadata' + '.'  + baseDirPath + '.' + shortcutPath)
    if (cacheShortcutMetadata) {
      if (typeof(callback) === 'function') {
        return callback(JSON.parse(cacheShortcutMetadata))
      }
    }
    
    let addShortcutCache = (shortcut) => {
      
      this.cache.shortcuts[shortcutPath] = shortcut
      localStorage.setItem('getShortcutMetadata' + '.'  + baseDirPath + '.' + shortcutPath, JSON.stringify(shortcut))
      
      if (typeof(callback) === 'function') {
        callback(shortcut)
      }
    }
    
    if (process.platform === 'win32') {
      return this.getShortcutMetadataOnWindows(baseDirPath, shortcutPath, addShortcutCache)
    }
    else if (process.platform === 'linux') {
      return this.getShortcutMetadataOnLinux(baseDirPath, shortcutPath, addShortcutCache)
    }
    else {
      console.error(`Platform is not support: ${process.platform}`)
      return this
    }
  },
  getShortcutMetadataOnWindows: function (dirPath, shortcutPath, callback) {
    this.init()
    if (typeof(callback) !== 'function') {
      return this
    }
    
    if (typeof(shortcutPath) !== 'string' 
            || shortcutPath.endsWith('.lnk') === false) {
      callback()
      return this
    }
    
    let shortcut = this.lib.FolderConfigHelper.readShortcutMetadata(dirPath, shortcutPath)
    if (typeof(shortcut) === 'object' 
            && this.debug.enableShortcutCache === true
            && this.lib.ElectronFileHelper.existsSync(shortcut.icon)) {
      callback(shortcut)
      return this
    }
    
    //console.log('開始查詢shortcut資料: ' + shortcutPath)
    //this.lib.windowShortcut.query(shortcutPath, (err, data) => {
    this.lib.WindowsShortcutHelper.query(shortcutPath, (data) => {
      //console.log(data)

      let name = this.lib.path.basename(shortcutPath)
      if (name.endsWith('.lnk')) {
        name = name.slice(0, -4)
      }
      name = name.trim()
      
      let execCommand = data.Exec
      
      //let iconv = RequireHelper.require('iconv-lite')
      //execCommand = iconv.decode(execCommand, 'UTF8')
      //console.log(execCommand)

      shortcut = {
        //icon: iconPath,
        name: name,
        exec: execCommand,
        //workingDir: data.workingDir,
        description: data.Comment,
        path: shortcutPath,
      }
      
      this.extractIcon(data, (iconPath) => {
        shortcut.icon = iconPath
        //this.lib.FolderConfigHelper.writeShortcutMetadata(dirPath, shortcutPath, shortcut)
        callback(shortcut)
        return true
      })
    })
    return this
  },
  getShortcutMetadataOnLinux: function (dirPath, shortcutPath, callback) {
    this.init()
    if (typeof(callback) !== 'function') {
      return this
    }
    
    if (typeof(shortcutPath) !== 'string' 
            || shortcutPath.endsWith('.desktop') === false) {
      callback()
      return this
    }
    
    let shortcut = this.lib.FolderConfigHelper.readShortcutMetadata(dirPath, shortcutPath)
    if (typeof(shortcut) === 'object') {
      callback(shortcut)
      return this
    }
    
    let metadata = this.lib.LinuxDesktopShortcutReader.read(shortcutPath)
    //if (metadata === undefined) {
    //  callback()
    //  return this
    //}
    
    //console.log(data)

    let name = metadata.Name
    if (name.endsWith(".desktop")) {
      name = name.slice(0, -8)
    }
    
    let icon = metadata.Icon
    if (typeof(icon) === 'string' 
            && icon.startsWith('chrome-') 
            && icon.endsWith('-Default') 
            || (typeof(icon) === 'undefined')) {
      icon = this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png')
    }
    
    let execCommand = metadata.Exec
    if (execCommand.indexOf('google-chrome') > -1 
            && execCommand.indexOf(' --app-id=') > -1 ) {
      callback()
      return true
    }

    shortcut = {
      //icon: iconPath,
      name: name,
      exec: execCommand,
      //workingDir: data.workingDir,
      description: metadata.Comment,
      icon: icon,
      path: shortcutPath,
    }
    
    //this.lib.FolderConfigHelper.writeShortcutMetadata(dirPath, shortcutPath, shortcut)
    callback(shortcut)
    return true
  },
  extractIcon: function (data, callback) {
    this.init()
    
    if (typeof(callback) !== 'function') {
      return this
    }
    
    //console.log('extractIcon', data)
    let icon = data.Icon
    
    if (icon.endsWith('.ico')) {
      let dimensions = this.lib.ImageMagickHelper.sizeOf(icon)
      //console.log(dimensions)
      if (dimensions.width > 128 || dimensions.height > 128) {
        // 轉換成png之後另存新檔
        return this.lib.ImageMagickHelper.icoToPng(icon, callback)
      }
    }
    
//    console.log(this.lib.PredefinedIconsHelper)
//    if (!this.lib.PredefinedIconsHelper) {
//      this.lib.PredefinedIconsHelper = RequireHelper.require('./helpers/PredefinedIconsHelper')
//      console.log(this.lib.PredefinedIconsHelper)
//    }
    icon = this.lib.PredefinedIconsHelper(icon, data)
    
    if (typeof(icon) === 'string' 
            && icon.endsWith('.exe') === false 
            && icon.endsWith('.dll') === false 
            && this.lib.ElectronFileHelper.existsSync(icon) === true) {
      // 就是這個icon了
      //console.log(icon)
      return callback(icon)
    }
    
    let iconFilename = icon
    if (iconFilename.endsWith('.exe') 
            || iconFilename.endsWith('.dll')) {
      iconFilename = iconFilename.slice(0, -4)
    }
    //iconFilename = iconFilename.split(':').join('')
    //iconFilename = iconFilename.split('\\').join('_')
    
    let lengthLimit = 150
    if (iconFilename.length > lengthLimit) {
      iconFilename = iconFilename.slice(-1 * lengthLimit)
    }
    iconFilename = md5(iconFilename)
    if (iconFilename.length > lengthLimit) {
      iconFilename = iconFilename.slice(-1 * lengthLimit)
    }
    iconFilename = iconFilename + '.png'
    let iconFilepath = this.lib.ElectronFileHelper.resolve('cache/icon/' + iconFilename)
    
    if (this.lib.ElectronFileHelper.existsSync(iconFilepath) && this.debug.enableIconCache) {
      //console.log('有資料' + iconFilepath)
      if (typeof(callback) === 'function') {
        callback(iconFilepath)
      }
      return this
    }
    
    //var iconExtractor = require('icon-extractor');
    if (icon === '') {
      console.error(data)
    }

    console.log('Try to extract icon: ' + icon)
    //this.lib.iconExtractor = RequireHelper.require('icon-extractor')
    //this.lib.iconExtractor.emitter.once('icon', (data) => {
    this.lib.IconExtractHelper.extract(icon, iconFilename, (tmpPath) => {
      if (tmpPath !== undefined) {
        this.lib.ElectronFileHelper.move(tmpPath, iconFilepath)
        callback(iconFilepath)
      }
      else {
        callback()
      }
    })

    //this.lib.iconExtractor.getIcon(filepath, filepath)
    return this
  },
  /*
  getShortcutsOnLinux: function (dirPath) {
    this.init()
    //console.error('getShortcutsOnLinux');
    return this.createMockShortcuts()
  },
  */
  get: function (dirPath, callback) {
    
    //console.log('get', 1)
    this.init()
    //console.log(dirPath)
    if (typeof(callback) !== 'function') {
      return this
    }
    
    // 先做mock
    //let shortcuts
    //return callback(this.createMockShortcuts())
    
    /*
    if (process.platform === 'win32') {
      shortcuts = this.getShortcutsOnWindows(dirPath)
    }
    else if (process.platform === 'linux') {
      shortcuts = this.getShortcutsOnLinux(dirPath)
    }
    */
    //console.log('get', 2)
    if (this.debug.useTestDir === true) {
      if (process.platform === 'linux') {
        //dirPath = '/home/pudding/.local/share/applications/test/'
        dirPath = '/home/pudding/.local/share/applications'
      }
      else if (process.platform === 'win32') {
        dirPath = 'D:/xampp/htdocs/projects-electron/Electron-Launch-Pad/demo-shortcuts/win32'
      }
    }
    
    //console.log('get', 3)
    this.lib.ElectronFileHelper.readDirectory(dirPath, (list) => {
      //console.log('get', 5)
      this.getDirListShortcuts(dirPath, list.dir, (shortcuts) => {
        //console.log('get', 6)
        //console.log(shortcuts)
        let dirShortcuts = []
        if (Array.isArray(shortcuts)) {
          dirShortcuts = shortcuts
        }
        
        //console.log('get', 7)
        this.getFileListShortcuts(dirPath, list.file, (shortcuts) => {
          //console.log(shortcuts)
          let fileShortcus = []
          if (Array.isArray(shortcuts)) {
            fileShortcus = shortcuts
          }
          
          let totalShortcuts = dirShortcuts.concat(fileShortcus)
          //console.log('get', 8)
          if (this.debug.enableShortcutCache === true) { 
            this.lib.FolderConfigHelper.write(dirPath, 'ShortcutMetadata', this.cache.shortcuts)
          }
          //console.log(totalShortcuts)
          callback(totalShortcuts)
        })
      })
    })
    
    //console.log('get', 4)
    //console.log(shortcuts)
    
    return this
  }
}

if (typeof(window) !== 'undefined') {
  window.ShortcutHelper = ShortcutHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = ShortcutHelper
}
