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
    let configPath = this.lib.ElectronFileHelper.resolve('config/' + configName)
    //console.log(configPath)
    return configPath
  },
  read: function (folderPath, key) {
    if (typeof(folderPath) !== 'string') {
      // || this.lib.ElectronFileHelper.existsSync(folderPath) === false
      if (typeof(key) === 'string') {
        return undefined
      }
      else if (Array.isArray(key) === true) {
        let result = {}
        key.forEach(k => {
          result[k] = undefined
        })
        return result
      }
      else {
        return {}
      }
    }
    
    this.init()
    
    let configPath = this._getConfigPath(folderPath)
    
    if (this.lib.ElectronFileHelper.existsSync(configPath) === false) {
      if (typeof(key) === 'string') {
        return undefined
      }
      else if (Array.isArray(key) === true) {
        let result = {}
        key.forEach(k => {
          result[k] = undefined
        })
        return result
      }
      else {
        return {}
      }
    }
    
    let configText = this.lib.ElectronFileHelper.readFileSync(configPath)
    let configJSON = {}
    try {
      configText = configText.trim()
      if (configText !== '' && configText.startsWith('{') && configText.endsWith('}')) {
        configJSON = JSON.parse(configText)
      }
    }
    catch (e) {
      console.error(e)
    }
    
    if (typeof(key) === 'string') {
      return configJSON[key]
    }
    else if (Array.isArray(key) === true) {
      let result = {}
      key.forEach(k => {
        result[k] = configJSON[k]
      })
      return result
    }
    else {
      return configJSON
    }
  },
  readSubItemSort: function (folderPath, folderName) {
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
    
    if (typeof(configJSON['subItemsSorted']) !== 'object') {
      return {}
    }
    else {
      return configJSON['subItemsSorted'][folderName]
    }
  },
  write: function (folderPath, key, value) {
    this.init()
    
    let configJSON = this.read(folderPath)
    
    if (typeof(key) === 'string') {
      configJSON[key] = value
    }
    else if (typeof(key) === 'object') {
      for (let k in key) {
        configJSON[k] = key[k]
      }
    }
    
    let configPath = this._getConfigPath(folderPath)
    let configText = JSON.stringify(configJSON, null, "\t")
    this.lib.ElectronFileHelper.writeFileSync(configPath, configText)
    return this
  },
  writeMainItemsSort: function (folderPath, sorted, itemsCount) {
    this.init()
    return this.write(folderPath, {
      'mainItemsSorted': sorted,
      'itemsCount': itemsCount
    })
  },
  writeSubItemsSort: function (folderPath, folderName, sorted) {
    this.init()
    
    let configJSON = this.read(folderPath)
    let key = 'subItemsSorted'
    if (typeof(configJSON[key]) !== 'object') {
      configJSON[key] = {}
    }
    configJSON[key][folderName] = sorted
    
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