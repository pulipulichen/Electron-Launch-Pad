let ShortcutHelper = {
  debug: {
    enableShortcutCache: false,
    enableIconCache: false,
    useTextDir: false,
  },
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
      name: `APP ${i}`,
      exec: `echo "APP ${i}"`,
      description: 'description',
      order: i
    }
  },
  get: function (dirPath) {
    this.init()
    
    // 先做mock
    
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
          name: `APP ${i}`,
          //exec: `echo "APP ${i}"`,
          description: 'description',
          items: items,
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
          name: `APP ${i}`,
          //exec: `echo "APP ${i}"`,
          description: 'description',
          items: items,
          order: i
        })
      }
      else {
        shortcuts.push(this.buildMockShortcut(i))
      }
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
