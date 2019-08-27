let ShortcutHelper = {
  inited: false,
  lib: {
    path: null,
    iconExtractor: null,
    ElectronFileHelper: null,
    FolderConfigHelper: null,
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    // -------------
    
    this.lib.path = RequireHelper.require('path')
    this.lib.iconExtractor = RequireHelper.require('icon-extractor')
    this.lib.ElectronFileHelper = RequireHelper.require('helpers/electron/ElectronFileHelper')
    this.lib.FolderConfigHelper = RequireHelper.require('helpers/FolderConfigHelper')
    
    // -------------
    this.inited = true
    return this
  },
  buildMockShortcut: function (i) {
    return {
      icon: this.lib.path.join(__dirname, '/imgs/icons8-app-symbol-256.png'),
      name: `${i} APP`,
      //exec: `C:\\Windows\\notepad.exe "APP ${i}.txt"`,p
      exec: `"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" --ignore-certificate-errors --app=https://blog.pulipuli.info --test APP${i}`,
      description: 'description',
      order: i
    }
  },
  createMockShortcuts: function () {
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
          order: i
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
          order: i
        })
      }
      else {
        shortcuts.push(this.buildMockShortcut(i))
      }
    }
    return shortcuts
  },
  getShortcutsOnWindows: function (dirPath) {
    dirPath = 'D:/xampp/htdocs/projects-electron/Electron-Launch-Pad/demo-shortcuts/win32'
    
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = dirPath
//passsing directoryPath and callback function
fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach((file) => {
        // Do whatever you want to do with the file
        let filepath = path.join(dirPath, file)
        let isDir = fs.lstatSync(filepath).isDirectory()
        console.log(file, isDir); 
        
        if (file.endsWith('.lnk')) {
          var ws = require('windows-shortcuts');
          ws.query(filepath, (err, data) => {
            console.log(data)
            
            let icon = data.icon
            if (icon === '') {
              icon = data.target
            }
            if (icon.endsWith('.exe')) {
              this.getIconFromEXE(icon, (iconPath) => {
                console.log(iconPath)
              })
            }
          });
 
        }
    });
});
    
    console.error('getShortcutsOnWindows');
    return []
  },
  getIconFromEXE: function (filepath, callback) {
    let iconFilename = filepath
    if (iconFilename.endsWith('.exe')) {
      iconFilename = iconFilename.slice(0, -4)
    }
    let lengthLimit = 150
    if (iconFilename.length > lengthLimit) {
      iconFilename = iconFilename.slice(-1 * lengthLimit)
    }
    iconFilename = escape(iconFilename) + '.ico'
    let iconFilepath = this.lib.ElectronFileHelper.resolve('cache/icon/' + iconFilename)
    
    if (this.lib.ElectronFileHelper.existsSync(iconFilepath)) {
      if (typeof(callback) === 'function') {
        callback(iconFilepath)
      }
      return this
    }
    
    //var iconExtractor = require('icon-extractor');

    this.lib.iconExtractor.emitter.on('icon', (data) => {
      //console.log('Here is my context: ' + data.Context);
      //console.log('Here is the path it was for: ' + data.Path);
      let icon = data.Base64ImageData;
      //console.log(icon)
      this.lib.ElectronFileHelper.writeFileBase64Sync(iconFilepath, icon)
      if (typeof(callback) === 'function') {
        callback(iconFilepath)
      }
    });

    this.lib.iconExtractor.getIcon('ANY_TEXT', filepath);
  },
  getShortcutsOnLinux: function (dirPath) {
    console.error('getShortcutsOnLinux');
    return []
  },
  get: function (dirPath) {
    this.init()
    
    // 先做mock
    let shortcuts
    //return this.createMockShortcuts()
    
    if (process.platform === 'win32') {
      shortcuts = this.getShortcutsOnWindows(dirPath)
    }
    else if (process.platform === 'linux') {
      shortcuts = this.getShortcutsOnLinux(dirPath)
    }
    
    //console.log(shortcuts)
    
    return shortcuts
  }
}

if (typeof(window) !== 'undefined') {
  window.ShortcutHelper = ShortcutHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = ShortcutHelper
}