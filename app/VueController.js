let VueControllerConfig = {
  el: '#app',
  data: {
    searchKeyword: "",
    currentPage: 0,
    maxPages: 3,
    maxRows: 4,
    maxCols: 4,
    shortcutDirPath: null,
    shortcuts: [],
    enableDragScroll: false,
    waitDragScroll: false,
    shortcutsFolderPath: null,
    
    lib: {
      ElectronHelper: null,
      electron: null,
      ipc: null,
      path: null,
      remote: null,
      mode: null,
      win: null,
      //REDIPSHelper: null,
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
    
    //this.lib.REDIPSHelper = RequireHelper.require('./helpers/REDIPSHelper')
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
    getSortedShortcuts: function () {
      let sortedShortcuts = [null]
      this.shortcuts.forEach((shortcut, i) => {
        if (i === 5) {
          sortedShortcuts.push(null)
        }
        sortedShortcuts.push(shortcut)
      })
      
      let pageItemCount = this.maxRows * this.maxCols
      while (sortedShortcuts.length % pageItemCount !== 0) {
        sortedShortcuts.push(null)
      }
      
      this.maxPages = sortedShortcuts.length / pageItemCount
      
      return sortedShortcuts
    },
    isPageRemoable: function () {
      return false
    }
  },
  methods: {
    _afterMounted: function () {
      //this.shortcus.slice(0, this.shortcus.length)

      this.shortcuts = this.lib.ShortcutHelper.get(this.shortcutDirPath)
      //console.log(this.shortcuts)
      //console.log(this.getTables)
      //console.log('bbb')
      this.initDraggable()
      this.initPopup()
      this.initHotKeys()
    },
    initDraggable: function () {
      
      $('.div.launchpad-item').on('dragstart', (event) => {
        event.stopPropagation()
        event.preventDefault()
        event.cancelBubble()
        return false
      })
      
      const draggable = new Draggable.Sortable(document.getElementById('AppList'), {
        draggable: 'div.launchpad-item',
        scrollable: {
          speed: 0
        }
      });
      
      draggable.on('drag:start', (event) => {
        console.log('drag:start')
        //console.log(event)
        /*
        if ($(event.source).hasClass('disable')) {
          event.stopPropagation()
          event.preventDefault()
          return false
        }
        */
        /*
        event.stopPropagation()
        event.preventDefault()
        event.cancelBubble()
        return false
        */
        
        this.enableDragScroll = true
      });
      //draggable.on('drag:move', () => {
      //  console.log('drag:move')
      //});
      draggable.on('drag:stop', () => {
        console.log('drag:stop')
        this.enableDragScroll = false
        this.initPopup()
      });
      
      $(this.$refs.AppList).find('.launchpad-item.empty').removeAttr('tabindex')
    },
    getTabIndex: function (item) {
      if (item === null) {
        return -1
      }
      else {
        return 0
      }
    },
    initREDIPS: function () {
      
      return this
      
      this.lib.REDIPSHelper.init({
        ondropped: (targetCell) => {
          this.initPopup()
          this.enableDragScroll = false
        },
        onmoved: () => {
          this.enableDragScroll = true
        }
      })
    },
    initPopup: function () {
      
      let html = $(`<div>
  <div class="popup-content">
    <div class="launchpad-item">
      A
    </div>
    <div class="launchpad-item">
      B
    </div>
    <div class="launchpad-item">
      C
    </div>
  </div>
</div>`)
      html = $('#AAA')
      
      let popupOptions = {
        on: 'click',
        position: 'bottom center',
        hoverable: true, 
        //popup: $('#popup-content'),
        //hoverable: true, 
        
        html  : html,  
          onShow: function (a, b) {
            console.log(a.getAttribute('data-shortcut-index'))
            console.log(b)
            html.find('div.launchpad-item').html('ddd')
          },
          onVisible: function () {
            //console.log(2)
            //console.log(this)
            $('#redips-drag').css('pointer-events', 'none')

            setTimeout(() => {
              let popupContent = $('.popup-content:visible:first')[0]
              //console.log(popupContent)
              const draggable = new Draggable.Sortable(popupContent, {
                draggable: 'div'
              });
            }, 300)
          },
          onHidden: () => {
            console.log('A')
            $('#redips-drag').css('pointer-events', 'all')
          }
        
      }
      
      setTimeout(() => {
        /*
        $(this.$refs.main).find('.redips-drag').each((i, ele) => {
          $(ele).popup({
            on: 'click',
            //hoverable: true, 
            //position: 'top left'
          })
        })
        */
       
        let items = $(this.$refs.main).find('.launchpad-item:not(.empty)')
        items.popup(popupOptions)
        items.click(function () {
        })
        /*
        tippy('.redips-drag[data-order="3"]', {
          content: `<div>
  <div class="ui three column divided center aligned grid">
    <div class="column">
      <h4 class="ui header">Basic Plan</h4>
      <p><b>2</b> projects, $10 a month</p>
      <div class="ui button">Choose</div>
    </div>
    <div class="column">
      <h4 class="ui header">Business Plan</h4>
      <p><b>5</b> projects, $20 a month</p>
      <div class="ui button">Choose</div>
    </div>
    <div class="column">
      <h4 class="ui header">Premium Plan</h4>
      <p><b>8</b> projects, $25 a month</p>
      <div class="ui button">Choose</div>
    </div>
  </div>
</div>`,
        })
        */
      }, 100)
    },
    /*
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
    */
    initHotKeys: function () {
      //console.log('i')
      window.addEventListener("wheel", event => {
        if (this.waitDragScroll === false) {
          this.scrollPage((event.deltaY > 0))
        }
      });
    },
    scrollPaddingDragUpEnter: function (event) {
      if (this.enableDragScroll === true 
              && this.waitDragScroll === false) {
        event.stopPropagation()
        
        this.scrollPage(false)
      }
    },
    scrollPaddingDragDownEnter: function (event) {
      //console.log([this.enableDragScroll, this.waitDragScroll])
      if (this.enableDragScroll === true 
              && this.waitDragScroll === false) {
        event.stopPropagation()
        
        this.scrollPage(true)
      }
    },
    scrollPage: function (isNext) {
      if (this.waitDragScroll === true) {
        return
      }
      
      //this.currentPage++
      //console.log([this.currentPage, this.maxPages])
      if (typeof(isNext) === 'number') {
        this.currentPage = isNext
      }
      else if (isNext === undefined || isNext === true) {
        this.currentPage = (this.currentPage + 1) % this.maxPages
      }
      else {
        this.currentPage--
        if (this.currentPage < 0) {
          this.currentPage = this.maxPages - 1
        }
      }
      
      //this.$refs.AppList.scrollTop = $(this.$refs.AppList).height() * this.currentPage
      let appList = $(this.$refs.AppList)
      appList.animate({
        scrollTop: (appList.height() * this.currentPage)
      }, 700);
      
      let pager = $(this.$refs.pager)
      let pagerHeight = pager.height()
      let pagerNumberPerPage = 20
      let pagerPage = parseInt(this.currentPage / pagerNumberPerPage, 10)
      let pagerMinTop = pagerHeight * pagerPage
      let pagerMaxTop = pagerHeight * (pagerPage + 1)
      let pagerScrollTop = pager[0].scrollTop
      //console.log([pagerHeight, pagerMinTop, pagerMaxTop, pagerScrollTop])
      if (pagerScrollTop < pagerMinTop || pagerScrollTop >= pagerMaxTop) {
        pager.animate({
          scrollTop: pagerMinTop
        }, 700);
      }
      
      this.waitDragScroll = true
      setTimeout(() => {
        this.waitDragScroll = false
      }, 700)
    },
    addPage: function () {
      console.log('addPage')
    },
    removePage: function () {
      if (this.isPageRemovable === false) {
        return this
      }
      console.log('addPage')
    },
    displayDescription: function (item) {
      if (item === null || typeof(item.description) !== 'string') {
        return ''
      }
      else {
        return item.description
      }
    },
    changeFolder: function () {
      console.error('change folder')
    },
    exit: function () {
      this.lib.win.close()
    }
  }
}

if (typeof(window) !== 'undefined') {
  window.VueController = new Vue(VueControllerConfig)
}
if (typeof(exports) !== 'undefined') {
  exports.default = new Vue(VueControllerConfig)
}
