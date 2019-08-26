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
    isPopupVisiable: false,
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
      ShortcutHelper: null,
      Draggable: null
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
    this.lib.Draggable = RequireHelper.require('Draggable')
    
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
      this.shortcuts = this.lib.ShortcutHelper.get(this.shortcutDirPath)
      this.initDraggable()
      this.initPopup()
      this.initHotKeys()
    },
    initDraggable: function () {
      const draggable = new this.lib.Draggable.Sortable(document.getElementById('AppList'), {
        draggable: 'div.launchpad-item',
        scrollable: {
          speed: 0
        }
      });
      
      draggable.on('drag:start', (event) => {
        this.enableDragScroll = true
      });
      draggable.on('drag:stop', () => {
        this.enableDragScroll = false
        this.initPopup()
      });
    },
    getTabIndex: function (item) {
      if (item === null) {
        return -1
      }
      else {
        return 0
      }
    },
    initPopup: function () {
      
      // https://semantic-ui.com/modules/popup.html
      let html = $(`<div class="popup-panel" style="overflow: auto;"></div>`)
      //html = $('#AAA')
      
      let popupOptions = {
        on: 'click',
        position: 'top center',
        hoverable: true, 
        
        //popup: $('#popup-content'),
        //hoverable: true, 
        delay: {
          //show: 50,
          hide: 1000 * 30
        },
        exclusive: true,
        movePopup: false,
        //preserve: true,
        html  : html,  
        onShow: (trigger) => {
          this.isPopupVisiable = true
          let index = trigger.getAttribute('data-shortcut-index')
          index = parseInt(index, 10)
          //console.log(index)
          //console.log(this.getSortedShortcuts[index])
          let items = this.getSortedShortcuts[index].items
          //console.log(a.getAttribute('data-shortcut-index'))
          //console.log(items)

          // 先做比較簡單的形式吧
          html.html(this.buildFolderItems(items))
          
          let size = Math.ceil(Math.sqrt(items.length))
          if (size > 4) {
            size = ">4"
          }
          html.attr('data-grid-size', size)
          //html.html('AAA')
        },
        onVisible: function () {
          this.isPopupVisiable = true
          //console.log(2)
          //console.log(this)
          //$('#redips-drag').css('pointer-events', 'none')

          setTimeout(() => {
            let popupContent = $('.popup-content:visible:first')[0]
            //console.log(popupContent)
            const draggable = new Draggable.Sortable(popupContent, {
              draggable: 'div'
            });
          }, 300)
        },
        /*
        onHide: () => {
          //console.log('A')
          //$('#redips-drag').css('pointer-events', 'all')
          if ($('.popup-panel:visible').length === 0) {
            this.isPopupVisiable = false
          }
          //console.log('onHide')
        },
        */
        onHidden: () => {
          //console.log('A')
          //$('#redips-drag').css('pointer-events', 'all')
          if ($('.popup-panel:visible').length === 0) {
            this.isPopupVisiable = false
          }
          //console.log('onHidden')
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
       
        let items = $(this.$refs.main).find('.launchpad-item.folder:not(.empty) > .item-wrapper')
        items.popup(popupOptions)
      }, 0)
    },
    buildFolderItems: function (shortcuts) {
      let container = $('<div class="items-wrpper"></div>')
      if (Array.isArray(shortcuts)) {
        shortcuts.forEach((shortcut) => {
          let item = $(`
            <div class="launchpad-item" 
                 title="${shortcut.description}"
                 data-exec="${shortcut.exec}">
              <img class="icon" draggable="false"
                   src="${shortcut.icon}" />
              <div class="name">
                ${shortcut.name}
              </div>
            </div>`)
          
          container.append(item)
        })
        
        const draggable = new this.lib.Draggable.Sortable(container[0], {
          draggable: 'div.launchpad-item'
        });
        
        draggable.on('drag:start', (event) => {
          console.log('folder item drag:start')
        });
        draggable.on('drag:stop', () => {
          console.log('folder item drag:stop')
        });
      }
      
      return container
    },
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
      if (this.waitDragScroll === true || this.isPopupVisiable === true) {
        return this
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
      console.error('addPage')
    },
    removePage: function () {
      if (this.isPageRemovable === false) {
        return this
      }
      console.error('addPage')
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
