let FolderConfigHelper = {
  inited: false,
  lib: {
    ElectronHelper: null,
    ElectronFileHelper: null,
    path: null
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    //this.lib.ElectronHelper = RequireHelper.require('./electon/ElectronHelper')
    this.lib.ElectronFileHelper = RequireHelper.require('./electon/ElectronFileHelper')
    this.lib.path = RequireHelper.require('path')
    
    this.inited = true
  },
  _getConfigName: function (folderPath) {
    if (typeof(folderPath) !== 'string') {
      folderPath = 'folder-path-for-test'
    }
    
    if (folderPath.length > 30) {
      folderPath = folderPath.slice(-30)
    }
    folderPath = escape(folderPath)
    //if (folderPath.length > 30) {
    //  folderPath = folderPath.slice(-30)
    //}
    return folderPath + '.json'
  },
  _getConfigPath: function (folderPath) {
    let configName = this._getConfigName(folderPath)
    let configPath = this.lib.ElectronFileHelper.resolve(configName)
    console.log(configPath)
    return configPath
  },
  read: function (folderPath) {
    if (typeof(folderPath) !== 'string') {
      // || this.lib.ElectronFileHelper.existsSync(folderPath) === false
      return {}
    }
    
    this.init()
    
    let configPath = this._getConfigPath(folderPath)
    
    if (this.lib.ElectronFileHelper.existsSync(configPath) === false) {
      return {}
    }
    
    let configText = this.lib.ElectronFileHelper.readFileSync(configPath)
    let configJSON = {}
    try {
      configJSON = JSON.parse(configText)
    }
    catch (e) {
      console.error(e)
    }
    return configJSON
  },
  write: function (folderPath, key, value) {
    this.init()
    
    let configJSON = this.read(folderPath)
    configJSON[key] = value
    
    let configPath = this._getConfigPath(folderPath)
    let configText = JSON.stringify(configJSON, null, "\t")
    this.lib.ElectronFileHelper.writeFileSync(configPath, configText)
  }
}

if (typeof(window) !== 'undefined') {
  window.FolderConfigHelper = FolderConfigHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = FolderConfigHelper
}