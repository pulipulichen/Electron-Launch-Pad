let FolderConfigHelper = {
  inited: false,
  lib: {
    ElectronFileHelper: null,
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.ElectronFileHelper = RequireHelper.require('./electon/ElectronFileHelper')
    
    this.inited = true
  }
}

if (typeof(window) !== 'undefined') {
  window.FolderConfigHelper = FolderConfigHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = FolderConfigHelper
}