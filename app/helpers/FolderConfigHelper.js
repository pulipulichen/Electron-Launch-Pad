let FolderConfigHelper = {
  inited: false,
  lib: {
    ElectronHelper: null,
    ElectronFileHelper: null,
    path: null
  },
  cache: {},
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
    
    folderPath = folderPath.split('/').join('|')
    
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
    let configPath = this.lib.ElectronFileHelper.resolve('cache/config/' + configName)
    //console.log([folderPath, configPath])
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
    
    let configJSON = {}
    if (typeof(this.cache[folderPath]) === 'undefined') {

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
      try {
        configText = configText.trim()
        if (configText !== '' && configText.startsWith('{') && configText.endsWith('}')) {
          configJSON = JSON.parse(configText)
        }
      }
      catch (e) {
        console.error(e)
      }
    }
    else {
      configJSON = this.cache[folderPath]
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
      if (value !== undefined) {
        configJSON[key] = value
      }
      else {
        delete configJSON[key]
      }
    }
    else if (typeof(key) === 'object') {
      for (let k in key) {
        if (typeof(key[k]) !== 'undefined') {
          configJSON[k] = key[k]
        }
        else {
          delete configJSON[k]
        }
      }
    }
    
    let configPath = this._getConfigPath(folderPath)
    let configText = JSON.stringify(configJSON, null, "\t")
    //console.log(configPath)
    this.lib.ElectronFileHelper.writeFileDelay(configPath, configText)
    return this
  },
  reset: function (folderPath, key) {
    return this.write(folderPath, key)
  },
  writeMainItemsSort: function (folderPath, sorted, itemsCount) {
    this.init()
    return this.write(folderPath, {
      'mainItemsSorted': sorted,
      'itemsCount': itemsCount
    })
  },
  resetMainItemSort: function (folderPath) {
    this.init()
    return this.write(folderPath, {
      'mainItemsSorted': undefined,
      'itemsCount': undefined
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
    
    return this.write(folderPath, configJSON)
  },
  resetSubItemsSort: function (folderPath) {
    this.init()
    return this.write(folderPath, 'subItemsSorted')
  },
  readShortcutMetadata: function (folderPath, shortcutPath, key) {
    this.init()
    let shortcutMetadata = this.read(folderPath, 'ShortcutMetadata')
    
    if (typeof(shortcutMetadata) !== 'object') {
      //console.error('no config data :' + folderPath)
      return
    }
    else {
      let metadata = shortcutMetadata[shortcutPath]
      if (typeof(key) === 'string' 
              && typeof(metadata) === 'object' 
              && typeof(metadata[key]) !== 'undefined' ) {
        return metadata[key]
      }
      else {
        return metadata
      }
    }
  },
  writeShortcutMetadata: function (folderPath, shortcutPath, data) {
    //console.log('writeShortcutMetadata')
    let configJSON = this.read(folderPath)
    let key = 'ShortcutMetadata'
    if (typeof(configJSON[key]) !== 'object') {
      configJSON[key] = {}
    }
    configJSON[key][shortcutPath] = data
    /*
    let configPath = this._getConfigPath(folderPath)
    let configText = JSON.stringify(configJSON, null, "\t")
    this.lib.ElectronFileHelper.writeFileSync(configPath, configText)
    */
    return this.write(folderPath, configJSON)
  },
  resetShortcutMetadata: function (folderPath) {
    this.init()
    return this.write(folderPath, 'ShortcutMetadata')
  },
}

if (typeof(window) !== 'undefined') {
  window.FolderConfigHelper = FolderConfigHelper
}
if (typeof(exports) !== 'undefined') {
  exports.default = FolderConfigHelper
}