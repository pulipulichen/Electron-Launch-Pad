let ShortcutHelper = {
  inited: false,
  lib: {
    path: null,
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    // -------------
    
    this.lib.path = RequireHelper.require('path')
    
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
    console.error('getShortcutsOnWindows');
    return []
  },
  getShortcutsOnLinux: function (dirPath) {
    console.error('getShortcutsOnLinux');
    return []
  },
  get: function (dirPath) {
    this.init()
    
    // 先做mock
    let shortcuts
    return this.createMockShortcuts()
    
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