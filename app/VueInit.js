let ViewInitConfig = {
  el: '#app',
  data: {
    shortcutDirPath: null,
    shortcuts: [],
    lib: {
      ElectronHelper: null,
      electron: null,
      ipc: null,
      path: null,
      remote: null,
      mode: null,
      REDIPSHelper: null,
      ShortcutHelper: null
      /*
      readChunk: null,
      fileType: null,
      exec: null,
      ElectronHelper: null,
      ArffHelper: null,
      ElectronFileHelper: null,
      ElectronSheetHelper: null,
      FileDragNDropHelper: null,
      */
    },
  },
  mounted: function () {
    this.lib.ElectronHelper = RequireHelper.require('./helpers/electron/ElectronHelper')
    this.lib.electron = RequireHelper.require('electron')
    this.lib.remote = this.lib.electron.remote
    this.lib.win = this.lib.remote.getCurrentWindow()
    this.lib.mode = this.lib.win.mode
    this.lib.shortcutDirPath = this.lib.win.shortcutDirPath
    
    this.lib.REDIPSHelper = RequireHelper.require('./helpers/REDIPSHelper')
    this.lib.ShortcutHelper = RequireHelper.require('./helpers/ShortcutHelper')
    
    /*
    this.lib.electron = RequireHelper.require('electron')
    this.lib.ipc = this.lib.electron.ipcRenderer
    this.lib.path = RequireHelper.require('path')
    this.lib.remote = this.lib.electron.remote
    this.lib.win = this.lib.remote.getCurrentWindow()
    this.lib.mode = this.lib.win.mode
    this.lib.filepath = this.lib.win.filepath
    //this.lib.readChunk = RequireHelper.require('read-chunk')
    //this.lib.readChunk = RequireHelper.require('file-type')
    this.lib.exec = RequireHelper.require('child_process').exec
    
    this.lib.ElectronHelper = RequireHelper.require('./electron/ElectronHelper')
    this.lib.ArffHelper = RequireHelper.require('./ArffHelper')
    this.lib.ElectronFileHelper = RequireHelper.require('./electron/ElectronFileHelper')
    this.lib.ElectronSheetHelper = RequireHelper.require('./electron/ElectronSheetHelper')
    this.lib.DayjsHelper = RequireHelper.require('./DayjsHelper')
    this.lib.FileDragNDropHelper = RequireHelper.require('./FileDragNDropHelper')
    */
    this.lib.ElectronHelper.mount(this, this.persistAttrs, () => {
      this._afterMounted()
    })
  },
  watch: {
  },
  computed: {
    getTablesAAA: function () {
      if (Array.isArray(this.shortcuts) === false) {
        return []
      }
      
      let tables = []
      
      let lastTable
      let lastRow
      let maxCols = 4
      let maxRows = 4
      
      this.shortcuts.forEach((shortcut, i) => {
        if (i % (maxCols * maxRows) === 0) {
          lastTable = []
          tables.push(lastTable)
        }
        
        if (i % maxCols === 0) {
          lastRow = []
          lastTable.push(lastRow)
        }
        
        lastRow.push(shortcut)
      })
      
      //console.log(tables)
      
      return tables
    }
  },
  methods: {
    _afterMounted: function () {
      //this.shortcus.slice(0, this.shortcus.length)
      
      setTimeout(() => {
        this.shortcus = this.lib.ShortcutHelper.get(this.shortcutDirPath)
        console.log(this.shortcuts)
        //console.log(this.getTables())
        this.lib.REDIPSHelper.init()
        console.log('bbb')
      }, 0)
    },
    getTables: function () {
      if (Array.isArray(this.shortcuts) === false) {
        return []
      }
      
      let tables = []
      
      let lastTable
      let lastRow
      let maxCols = 4
      let maxRows = 4
      
      this.shortcuts.forEach((shortcut, i) => {
        if (i % (maxCols * maxRows) === 0) {
          lastTable = []
          tables.push(lastTable)
        }
        
        if (i % maxCols === 0) {
          lastRow = []
          lastTable.push(lastRow)
        }
        
        lastRow.push(shortcut)
      })
      
      //console.log(tables)
      
      return tables
    }
  }
}

if (typeof(window) !== 'undefined') {
  window.ViewInit = new Vue(ViewInitConfig)
}
if (typeof(exports) !== 'undefined') {
  exports.default = new Vue(ViewInitConfig)
}