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
    shortcutsFolderPath: 'folder-path-for-test',
    
    lib: {
      ElectronHelper: null,
      FolderConfigHelper: null,
      electron: null,
      ipc: null,
      path: null,
      remote: null,
      execFile: null,
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
    debug: {
      enableClick: false
    }
  },
  mounted: function () {
    this.lib.ElectronHelper = RequireHelper.require('./helpers/electron/ElectronHelper')
    this.lib.FolderConfigHelper = RequireHelper.require('./helpers/FolderConfigHelper')
    this.lib.electron = RequireHelper.require('electron')
    this.lib.remote = this.lib.electron.remote
    this.lib.execFile = RequireHelper.require('child_process').execFile;
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
    getSortedMainItems: function () {
      if (this.lib.FolderConfigHelper === null) {
        return []
      }
      let {mainItemsSorted, itemsCount} = this.lib.FolderConfigHelper.read(this.shortcutsFolderPath, ['mainItemsSorted', 'itemsCount'])
      //console.log(mainItemsSorted)
      
      let sortedShortcuts = []
      if (typeof(itemsCount) === 'number') {
        for (let i = 0; i < itemsCount; i++) {
          sortedShortcuts.push(null)
        }
      }
      
      
      let notInSorted = []
      this.shortcuts.forEach((shortcut, i) => {
        //if (i === 5) {
        //  sortedShortcuts.push(null)
        //}
        //sortedShortcuts.push(shortcut)
        
        // 檢查這個項目有沒有在sort裡面
        let name = shortcut.name
        if (typeof(mainItemsSorted[name]) === 'number') {
          sortedShortcuts[mainItemsSorted[name]] = shortcut
        }
        else {
          notInSorted.push(shortcut)
        }
      })
      
      // 把未填滿的部分填滿
      if (notInSorted.length > 0) {
        for (let i = 0; i < sortedShortcuts.length; i++) {
          if (sortedShortcuts[i] === null) {
            sortedShortcuts[i] = notInSorted.shift()
            if (notInSorted.length === 0) {
              break;
            }
          }
        }
        
        // 如果全部填滿了位置還是不夠，那就再新增吧
        if (notInSorted.length > 0) {
          sortedShortcuts = sortedShortcuts.concat(notInSorted)
        }
      }
      
      let pageItemCount = this.maxRows * this.maxCols
      while (sortedShortcuts.length % pageItemCount !== 0) {
        sortedShortcuts.push(null)
      }
      
      this.maxPages = sortedShortcuts.length / pageItemCount
      
      return sortedShortcuts
    },
    isPageRemovable: function () {
      return false
    }
  },
  methods: {
    _afterMounted: function () {
      this.shortcuts = this.lib.ShortcutHelper.get(this.shortcutDirPath)
      this.initDraggable()
      this.initPopup()
      this.initHotKeys()
      this.initCurrentPage()
    },
    initCurrentPage: function () {
      let currentPage = this.lib.FolderConfigHelper.read(this.shortcutsFolderPath, 'currentPage')
      if (typeof(currentPage) === 'number') {
        this.scrollPage(currentPage, false)
      }
    },
    initDraggable: function () {
      const draggable = new this.lib.Draggable.Sortable(document.getElementById('AppList'), {
        draggable: 'div.launchpad-item',
        scrollable: {
          speed: 0
        },
        delay: 500,
      });
      
      draggable.on('drag:start', (event) => {
        this.enableDragScroll = true
      });
      draggable.on('drag:stop', () => {
        this.enableDragScroll = false
        this.initPopup()
        this.onMainItemDropped()
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
          let folderName = this.getSortedMainItems[index].name
          let subItems = this.getSortedMainItems[index].subItems
          //console.log(a.getAttribute('data-shortcut-index'))
          //console.log(items)

          // 先做比較簡單的形式吧
          html.html(this.buildSubItems(folderName, subItems))
          
          let size = Math.ceil(Math.sqrt(subItems.length))
          if (size > 4) {
            size = ">4"
          }
          html.attr('data-grid-size', size)
          //html.html('AAA')
        },
        onVisible: () => {
          this.isPopupVisiable = true
          //console.log(2)
          //console.log(this)
          //$('#redips-drag').css('pointer-events', 'none')

          setTimeout(() => {
            let popupContent = $('.popup-content:visible:first')[0]
            //console.log(popupContent)
            const draggable = new this.lib.Draggable.Sortable(popupContent, {
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
    buildSubItems: function (folderName, shortcuts) {
      let _this = this
      let container = $('<div class="launchpad-items-container"></div>')
      container.attr('data-folder-name', folderName)
      if (Array.isArray(shortcuts)) {
        shortcuts = this.getSortedSubItems(folderName, shortcuts)
        
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
          
          item.click(function () {
            let exec = this.getAttribute('data-exec')
            _this.exec(exec)
          })
          
          container.append(item)
        })
        
        const draggable = new this.lib.Draggable.Sortable(container[0], {
          draggable: 'div.launchpad-item'
        });
        
        setTimeout(() => {
          container.find('[tabindex="0"]').prop('tabindex', '-1')
          container.prop('tabindex', '-1')
        }, 100)
        
        
        //draggable.on('drag:start', (event) => {
        //  console.log('folder item drag:start')
        //});
        draggable.on('drag:stop', (event) => {
          //console.log(event.)
          let container = event.sourceContainer
          let folderName = container.getAttribute('data-folder-name')
          
          this.onSubItemDropped(folderName, container)
          //console.log('folder item drag:stop')
        });
      }
      
      return container
    },
    getSortedSubItems: function (folderName, shortcuts) {
      let subItemsSorted = this.lib.FolderConfigHelper.readSubItemSort(this.shortcutsFolderPath, folderName)
      if (subItemsSorted === undefined) {
        return shortcuts
      }
      
      let sorted = []
      
      for (let i = 0; i < shortcuts.length; i++) {
        sorted.push(undefined)
      }
      
      shortcuts.forEach(shortcut => {
        let name = shortcut.name
        if (typeof(subItemsSorted[name]) === 'number') {
          sorted[subItemsSorted[name]] = shortcut
        }
        else {
          sorted.push(shortcut)
        }
      })
      
      // 移除空白的資料
      sorted = sorted.filter(item => (item !== undefined))
      
      //console.log(subItemsSorted)
      
      return sorted
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
    scrollPage: function (isNext, doTransition) {
      if (this.waitDragScroll === true || this.isPopupVisiable === true) {
        return this
      }
      
      let duration = 700
      if (doTransition === false) {
        duration = 10
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
      }, duration);
      
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
        }, duration);
      }
      
      // 保存現在頁數
      this.lib.FolderConfigHelper.write(this.shortcutsFolderPath, 'currentPage', this.currentPage)
      
      this.waitDragScroll = true
      setTimeout(() => {
        this.waitDragScroll = false
      }, duration)
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
    openFolder: function () {
      console.error('open folder')
    },
    changeFolder: function () {
      console.error('change folder')
    },
    exit: function () {
      this.lib.win.close()
      return this
    },
    onMainItemDropped: function () {
      //console.log('onDropped')
      
      setTimeout(() => {
        // 開始蒐集所有排序的順序
        let sorted = {}
        //console.log($(this.$refs.AppList).children('.launchpad-item').length)
        let items = $(this.$refs.AppList).children('.launchpad-item')
        //$(this.$refs.AppList).children('.launchpad-item').each((i, ele) => {
        for (let i = 0; i < items.length; i++) {
          let ele = items.eq(i)
          //console.log(i)
          //ele = $(ele)
          if (ele.hasClass('empty')) {
            continue;
          }

          let name = ele.find('.name:first').text().trim()
          sorted[name] = i
        }

        //console.log(sorted)
        this.lib.FolderConfigHelper.writeMainItemsSort(this.shortcutsFolderPath, sorted, items.length)
      }, 100)
              
      return this
    },
    onSubItemDropped: function (folderName, container) {
      // 這個要考慮到現在是那一個folder的問題
      //console.log(folderName)
      
      setTimeout(() => {
        // 開始蒐集所有排序的順序
        let sorted = {}
        //console.log($(this.$refs.AppList).children('.launchpad-item').length)
        let items = $(container).children('.launchpad-item')
        //$(this.$refs.AppList).children('.launchpad-item').each((i, ele) => {
        for (let i = 0; i < items.length; i++) {
          let ele = items.eq(i)
          let name = ele.find('.name:first').text().trim()
          sorted[name] = i
        }

        //console.log(sorted)
        this.lib.FolderConfigHelper.writeSubItemsSort(this.shortcutsFolderPath, folderName, sorted)
      }, 100)

      return this
    },
    exec: function (execCommand) {
      if (typeof(execCommand) !== 'string') {
        return this
      }
      if (this.debug.enableClick === false) {
        return this
      }
      
      //let parameters = []
      this.lib.win.hide()
      this.lib.execFile(execCommand, (err, data) => {
        //console.log(err)
        //console.log(data.toString());
        
        return this.exit()
      })
      //const { shell } = require('electron')
      //shell.openExternal(execCommand)
      //fork(exec)
    }
  }
}

if (typeof(window) !== 'undefined') {
  window.VueController = new Vue(VueControllerConfig)
}
if (typeof(exports) !== 'undefined') {
  exports.default = new Vue(VueControllerConfig)
}
