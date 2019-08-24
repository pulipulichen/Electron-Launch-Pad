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
  get: function (dirPath) {
    this.init()
    
    // 先做mock
    
    let shortcuts = []
    
    for (let i = 0; i < 23; i++) {
      shortcuts.push({
        icon: this.lib.path.join(__dirname, '../imgs/icons8-app-symbol-256.png'),
        name: `APP ${i}`,
        exec: `echo "APP ${i}"`
      })
    }
    return shortcuts
  }
}

if (typeof(window) !== 'undefined') {
  window.ShortcutHelper = ShortcutHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = ShortcutHelper
}