let VueControllerConfig = {
  el: '#app',
  data: {
    
    debug: {
      enableAskDirPath: true,
      enableExit: true,
      enableClick: true,
      enableSortPersist: true,
    },
    
    popupHideDelay: 1000 * 60,
    dragDelay: 500,
    maxRows: 4,
    maxCols: 4,
    hotkeyConfig: [1,2,3,4,'q','w','e','r','a','s','d','f','z','x','c','v'],
    
    searchKeyword: "",
    currentSearchResultPage: 0,
    shortcutsFolderPath: null,
    
    mainItemsInited: false,
    currentPage: 0,
    maxPages: 99,
    shortcuts: [],
    enableDragScroll: false,
    isPopupVisiable: false,
    waitDragScroll: false,
    mainItemsDraggable: null,
    currentPopupTrigger: null,
    mainItemHotkeyLabelInited: false,
    isSearchInputFocused: false,
    lastFocusIndex: null,
    isEditingMode: false,
    
    cache: {
      subItemsSorted: {}
    },
    
    lib: {
      ElectronHelper: null,
      ElectronFileHelper: null,
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
  },
  mounted: function () {
    this.lib.ElectronHelper = RequireHelper.require('./helpers/electron/ElectronHelper')
    this.lib.ElectronFileHelper = RequireHelper.require('./helpers/electron/ElectronFileHelper')
    this.lib.FolderConfigHelper = RequireHelper.require('./helpers/FolderConfigHelper')
    this.lib.electron = RequireHelper.require('electron')
    this.lib.remote = this.lib.electron.remote
    this.lib.execFile = RequireHelper.require('child_process').execFile;
    this.lib.win = this.lib.remote.getCurrentWindow()
    this.lib.mode = this.lib.win.mode
    this.shortcutsFolderPath = this.lib.win.shortcutsDirPath
    this.lib.ipc = this.lib.electron.ipcRenderer
    
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
      //console.log('mounted?')
      this._afterMounted()
    })
  },
  //watch: {
  //},
  computed: {
    isSearchMode: function () {
      setTimeout(() => {
        this.initDropdownMenu()
      }, 10)
      
      let keyword = this.searchKeyword.trim()
      return (keyword !== "")
    },
    sortedMainItems: function () {
      if (this.lib.FolderConfigHelper === null
              || Array.isArray(this.shortcuts) === false) {
        this.maxPages = 1
        return []
      }
      let {mainItemsSorted, itemsCount} = this.lib.FolderConfigHelper.read(this.shortcutsFolderPath, ['mainItemsSorted', 'itemsCount'])
      
      
      //console.log(mainItemsSorted)
      
      let sortedShortcuts = []
      
      if (mainItemsSorted !== undefined) {
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
        
        // 移除最後是null的部分
        while (sortedShortcuts[(sortedShortcuts.length - 1)] === null) {
          sortedShortcuts.pop()
        }
      }
      else {
        sortedShortcuts = this.shortcuts
      }
      
      let pageItemCount = this.pageItemCount
      if (sortedShortcuts.length > 0) {
        while (sortedShortcuts.length % pageItemCount !== 0) {
          sortedShortcuts.push(null)
        }
        this.maxPages = sortedShortcuts.length / pageItemCount
      }
      else {
        for (let i = 0; i < pageItemCount; i++) {
          sortedShortcuts.push(null)
        }
        this.maxPages = 1
      }
      //console.log(sortedShortcuts)
      
      return sortedShortcuts
    },
    pageItemCount: function () {
      return this.maxRows * this.maxCols
    },
    searchResultList: function () {
      let keywords = this.searchKeyword.trim().toLowerCase()
      this.lastFocusIndex = null
      if (keywords === '') {
        return []
      }
      
      let searchResult = []
      
      keywords = keywords.split(' ')
      let uniqueList = []
      keywords.forEach(keyword => {
        if (uniqueList.indexOf(keyword) === -1) {
          uniqueList.push(keyword)
        }
      })
      keywords = uniqueList
      
      this.sortedMainItems.forEach(item => {
        if (item === null) {
          return this
        }
        
        if (Array.isArray(item.subItems) === false) {
          keywords.forEach(keyword => {
            if (keyword === '') {
              return false
            }
            if ((item.name.toLowerCase().indexOf(keyword) > -1)
                    || (typeof(item.description) === 'string' && item.description.toLowerCase().indexOf(keyword) > -1)
                    || item.exec.toLowerCase().indexOf(keyword) > -1) {
              searchResult.push(item)
            }
          })
        }
        else {
          let folderName = item.name
          let subItems = item.subItems
          
          if (Array.isArray(this.cache.subItemsSorted[folderName])) {
            subItems = this.cache.subItemsSorted[folderName]
          }
          
          subItems.forEach(item => {
            keywords.forEach(keyword => {
              if (keyword === '') {
                return false
              }
              if ((item.name.toLowerCase().indexOf(keyword) > -1)
                      || (typeof(item.description) === 'string' && item.description.toLowerCase().indexOf(keyword) > -1)
                      || item.exec.toLowerCase().indexOf(keyword) > -1) {
                let cloneItem = JSON.parse(JSON.stringify(item))
                cloneItem.name = folderName + '/' + cloneItem.name
                searchResult.push(cloneItem)
              }
            })
          })
        }
      })
      
      setTimeout(() => {
        this.setupMainItemsKeyEvents($(this.$refs.SearchResultList))
      }, 100)
      
      return searchResult
    },
    searchResultPageLength: function () {
      let pageItemCount = this.pageItemCount
      return Math.ceil(this.searchResultList.length / pageItemCount)
    },
    isPageRemovable: function () {
      // 計算現在頁面數量跟格子數量
      let pageItemCount = this.pageItemCount
      let minItems = pageItemCount * (this.maxPages - 1)
      
      let items = $(this.$refs.AppList).find('.launchpad-item:not(.empty)').length
      
      return (items <= minItems)
    },
    visibleCurrentPage: function () {
      if (this.isSearchMode === false) {
        return this.currentPage
      }
      else {
        return this.currentSearchResultPage
      }
    },
    visibleCurrentFirstItemIndex: function () {
      let page = this.visibleCurrentPage
      return page * this.pageItemCount
    },
    visibleCurrentLastItemIndex: function () {
      let page = this.visibleCurrentPage
      return ((page + 1) * this.pageItemCount - 1)
    },
    visibleListElement: function () {
      if (this.isSearchMode === false) {
        return this.$refs.AppList
      }
      else {
        return this.$refs.SearchResultList
      }
    },
    displayEditingMode: function () {
      if (this.isEditingMode === true) {
        return 'EDIT'
      }
      else {
        return 'OPEN'
      }
    }
  },  // computed
  methods: {
    _afterMounted: function () {
      //console.log('_afterMounted()')
      this.lib.ShortcutHelper.get(this.shortcutsFolderPath, (shortcuts) => {
        //console.log('after ShortcutHelper.get()')
        this.shortcuts = shortcuts
        
        this.initDraggable()
        this.initPopup()
        this.initMouseWheelKeys()
        this.initIPCEvent()
        this.initDropdownMenu()
        //console.log('before initCurrentPage()')
        this.initCurrentPage(() => {
          this.mainItemsInited = true
          //this.setupSearchInputKeyEvents()
          this.$refs.SearchInput.focus()
          //console.log('finished?')
          //console.log(this.shortcutsFolderPath)
          if (this.debug.enableAskDirPath === true 
                  && this.lib.ElectronFileHelper.isDirSync(this.shortcutsFolderPath) === false) {
            this.changeFolder()
            
          }
        })
      })  // this.lib.ShortcutHelper.get(this.shortcutDirPath, (shortcuts) => {
        
    },
    initCurrentPage: function (callback) {
      if (this.debug.enableSortPersist === false) {
        return this
      }
      
      let currentPage = this.lib.FolderConfigHelper.read(this.shortcutsFolderPath, 'currentPage')
      if (typeof(currentPage) === 'number') {
        //console.log(['initCurrentPage', currentPage])
        setTimeout(() => {
          this.scrollPage(currentPage, false, callback)
        }, 0)
      }
      else {
        if (typeof(callback) === 'function') {
          callback()
        }
      }
    },
    initDraggable: function () {
      if (this.mainItemsDraggable !== null && typeof(this.mainItemsDraggable.destroy) === 'function') {
        //console.log(111)
        this.mainItemsDraggable.destroy()
      }
      
      const draggable = new this.lib.Draggable.Sortable(this.$refs.AppList, {
        draggable: 'div.launchpad-item',
        scrollable: {
          speed: 0
        },
        delay: this.dragDelay,
        handle: 'div.launchpad-item:not(.empty):not(.sub-item)'
      });
      
      draggable.on('drag:start', (event) => {
        this.enableDragScroll = true
      });
      draggable.on('drag:stop', () => {
        this.enableDragScroll = false
        this.initPopup()
        this.onMainItemDropped()
      });
      this.mainItemsDraggable = draggable
      setTimeout(() => {
        this.setupMainItemsKeyEvents($(this.$refs.AppList))
      }, 100)
      return this
    },
    initIPCEvent: function () {
      //this.lib.ipc.send('select-folder', filepath)
      
      this.lib.ipc.on('change-folder-callback', (event, path) => {
        //console.log(['[', path, ']'])
        this.changeFolderCallback(path)
      })
      return this
    },
    initDropdownMenu: function () {
      let menu = $(this.$refs.DropdownMenu)
      
      let className = 'dropdown-menu-inited'
      if (menu.hasClass(className) === false) {
        menu.addClass(className)
              .dropdown()
      }
      return this
    },
    getPageByItemIndex: function (index) {
      return Math.floor(index / this.pageItemCount)
    },
    scrollAndFocusMainItem: function (searchItem) {
      if (searchItem.length > 0) {
        searchItemPage = this.getPageByItemIndex(searchItem.index())
        this.scrollPage(searchItemPage, 100, () => {
          searchItem.focus()
        })
      } 
      return this
    },
    setLastFocus: function (event) {
      let item = $(event.target)
      let index = item.index()
      this.lastFocusIndex = index
      return this
    },
    setupMainItemsKeyEvents: function (container) {
      let options = {
        focus: this.scrollAndFocusMainItem,
        maxCols: this.maxCols,
        pageItemCount: this.pageItemCount,
        exit: (index) => {
          //this.exit()
          //console.log('exit')
          //this.lastFocusIndex = index
          this.$refs.SearchInput.focus()
          //console.log(this.$refs.SearchInput)
          /*
          this.$refs.SearchInput.click()
          setTimeout(() => {
            console.log('focused')
            this.$refs.SearchInput.focus()
          }, 50)
          event.preventDefault()
          event.stopPropagation()
          */
        },
        exec: (item) => {
          if (item.length > 0) {
            item.find('.item-wrapper:first').click()
          }
        }
      }
      return this.setupItemsKeyEvents(container, options)
    },
    setupSubItemsKeyEvents: function (container) {
      let size = container.attr('data-grid-size')
      size = parseInt(size, 10)
      
      let options = {
        focus: (searchItem) => {
          if (searchItem.length > 0) {
            searchItem.focus()
          }
        },
        maxCols: size,
        pageItemCount: size * size,
        exit: () => {
          
          //this.exit()
          //console.log('有辦法關閉popup嗎？')
          if (this.currentPopupTrigger !== null) {
            let trigger = $(this.currentPopupTrigger)
            trigger.click()
            trigger.parents('.launchpad-item:first').focus()
          }
        },
        exec: (item) => {
          item.click()
        }
      }
      return this.setupItemsKeyEvents(container, options)
    },
    setupItemsKeyEvents: function (container, options) {
      // https://github.com/jaywcjlove/hotkeys
      
      /*
      let homeEvent = (parent) => {
        searchItem = parent.children('.launchpad-item:not(.empty):first')
        options.focus(searchItem)
      }
      let endEvent = (parent) => {
        searchItem = parent.children('.launchpad-item:not(.empty):first')
        options.focus(searchItem)
      }
      */
      
      let hotkeysHandler = (event) => { 
        //console.log(handler.key)
        //console.log(event.srcElement)
        let keyCode = event.keyCode
        //console.log(keyCode)
        
        let item = $(event.target)
        let index = item.index()
        let parent = item.parent()
        //console.log()
        //console.log(item.find('.name:first').text(), event.keyCode)
        //let keyCode = event.keyCode
        let searchItem
        let itemsCount
        
        switch (keyCode) {
          case 37: // left
            // 搜尋前一個不是empty的item
            searchItem = item.prevAll('.launchpad-item:not(.empty):first')
            options.focus(searchItem)
            break
          case 39: // right
            searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            options.focus(searchItem)
            break
          case 38: // up
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            if (index < options.maxCols) {
              options.exit(index)
              return this
            }
            searchItem = item.prevAll(`.launchpad-item:eq(${options.maxCols-1}):first`)
            if (searchItem.hasClass('empty')) {
              searchItem = searchItem.prevAll('.launchpad-item:not(.empty):first')
            }
            if (searchItem.length === 0) {
              searchItem = searchItem.nextAll('.launchpad-item:not(.empty):first')
            }
            options.focus(searchItem)
            break
          case 40: // down
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            itemsCount = parent.find('.launchpad-item').length
            if (index > (itemsCount - options.maxCols) ) {
              // @TODO 這裡可能會有錯
              return this
            }
            searchItem = item.nextAll(`.launchpad-item:eq(${options.maxCols-1}):first`)
            if (searchItem.hasClass('empty')) {
              searchItem = searchItem.nextAll('.launchpad-item:not(.empty):first')
            }
            if (searchItem.length === 0) {
              searchItem = searchItem.prevAll('.launchpad-item:not(.empty):first')
            }
            options.focus(searchItem)
            break
          case 33: // page up
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            if (index < options.pageItemCount) {
              searchItem = parent.children('.launchpad-item:not(.empty):first')
              options.focus(searchItem)
              return this
            }
            searchItem = item.prevAll(`.launchpad-item:eq(${options.pageItemCount-1}):first`)
            if (searchItem.hasClass('empty')) {
              searchItem = searchItem.prevAll('.launchpad-item:not(.empty):first')
            }
            if (searchItem.length === 0) {
              searchItem = searchItem.nextAll('.launchpad-item:not(.empty):first')
            }
            options.focus(searchItem)
            break
          case 34: // page down
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            itemsCount = parent.find('.launchpad-item').length
            if (index > (itemsCount - options.pageItemCount) ) {
              // @TODO 這裡可能會有錯
              searchItem = parent.children('.launchpad-item:not(.empty):last')
              options.focus(searchItem)
              return this
            }
            searchItem = item.nextAll(`.launchpad-item:eq(${options.pageItemCount-1}):first`)
            if (searchItem.hasClass('empty')) {
              searchItem = searchItem.nextAll('.launchpad-item:not(.empty):first')
            }
            if (searchItem.length === 0) {
              searchItem = searchItem.prevAll('.launchpad-item:not(.empty):first')
            }
            options.focus(searchItem)
            break
          case 36: // home
            searchItem = parent.children('.launchpad-item:not(.empty):first')
            options.focus(searchItem)
            break
          case 35: // end
            searchItem = parent.children('.launchpad-item:not(.empty):last')
            options.focus(searchItem)
            break
          case 13: // enter
          case 32: // space
            //console.log(item.hasClass('folder'))
            //if (item.hasClass('folder') === false) {
            options.exec(item)
            break
          case 27: // esc
          case 45: // backspace
            options.exit(index)
            break
        }
        event.preventDefault()
        event.stopPropagation()
      }
      
      //console.log(container.children('.launchpad-item').length)
      //container.children('.launchpad-item').each((i, ele) => {
      /*
      let ele = container.children('.launchpad-item:not(.empty)')
      console.log(ele)
        hotkeys('left, right, up, down, pageup, pagedown, home, end, enter, space, esc, backspace', {
          element: ele,
        }, hotkeysHandler)
        //$(ele).addClass('hotkeys-inited')
      //})
      */
      container.children('.launchpad-item:not(.empty)').keydown(hotkeysHandler)
      
      //console.log(container.find('.launchpad-item').length)
      return this
    },
    onSearchInputFocus: function (event) {
      this.isSearchInputFocused = true
      let selector = '.launchpad-item.visible-in-current-page.item:first'
      if (typeof(this.lastFocusIndex) === 'number') {
        selector = `.launchpad-item:eq(${this.lastFocusIndex})`
      }
      //console.log(['focus', selector, $(this.visibleListElement).find(selector).length])
      $(this.visibleListElement).find('.search-open-candidate').removeClass('search-open-candidate')
      $(this.visibleListElement).find(selector).addClass('search-open-candidate')
    },
    onSearchInputBlur: function (event) {
      this.isSearchInputFocused = false
      $(this.visibleListElement).find('.search-open-candidate').removeClass('search-open-candidate')
    },
    onSearchInputKeyDown: function (event) {
      
      let keyCode = event.keyCode
      let options = {
        focus: this.scrollAndFocusMainItem,
        exit: () => {
          if (this.searchKeyword !== '') {
            this.searchKeyword = ''
            event.preventDefault()
            event.stopPropagation()
          }
          else {
            event.preventDefault()
            event.stopPropagation()
            this.exit()
          }
        },
        getLastFocusItem: (container) => {
          // 選擇現在這一頁來focus
          let itemIndex = this.visibleCurrentFirstItemIndex
          if (this.lastFocusIndex !== null) {
            itemIndex = this.lastFocusIndex
          }
          
          //console.log(itemIndex)
          selectedItem = container.children(`.launchpad-item:eq(${itemIndex})`)
          if (selectedItem.hasClass('visible-in-current-page') === false) {
            itemIndex = this.visibleCurrentFirstItemIndex
            selectedItem = container.children(`.launchpad-item:eq(${itemIndex})`)
          }
          
          if (selectedItem.hasClass('empty')) {
            selectedItem = selectedItem.nextAll('.launchpad-item:not(.empty):first')
          }
          if (selectedItem.length === 0) {
            selectedItem = selectedItem.prevAll('.launchpad-item:not(.empty):first')
          }
          return selectedItem
        },
        exec: (item) => {
          if (item.length > 0) {
            event.preventDefault()
            event.stopPropagation()
            item.find('.item-wrapper:first').click()
          }
        }
      }
      
      //console.log(keyCode)
      let itemIndex
      let container = $(this.visibleListElement)
      let selectedItem

      switch (keyCode) {
        case 40: // down
        case 9:  // tab
          // 選擇現在這一頁來focus
          selectedItem = options.getLastFocusItem(container)
          /*
          if (selectedItem.length > 0) {
            let tmp = selectedItem.nextAll('.launchpad-item:not(.empty):first')
            if (tmp.length > 0) {
              selectedItem = tmp
            }
          }
          */
          options.focus(selectedItem)
          break
        case 38: // down
          // 選擇現在這一頁來focus
          itemIndex = this.visibleCurrentLastItemIndex
          //console.log(itemIndex)
          selectedItem = container.children(`.launchpad-item:eq(${itemIndex})`)
          if (selectedItem.hasClass('empty')) {
            selectedItem = selectedItem.prevAll('.launchpad-item:not(.empty):first')
          }
          if (selectedItem.length === 0) {
            selectedItem = selectedItem.nextAll('.launchpad-item:not(.empty):first')
          }
          options.focus(selectedItem)
          break
        case 34: // pagedown
          this.lastFocusIndex = null
          this.scrollPage(true, () => {
            this.onSearchInputFocus()
          })
          break
        case 33: // pageup
          this.lastFocusIndex = null
          this.scrollPage(false, () => {
            this.onSearchInputFocus()
          })
          break
        case 27: // esc
        //case 8: // backspace
          options.exit()
          break
        case 13: // enter
        //case 32: // space
          // open first item
          selectedItem = options.getLastFocusItem(container)
          //console.log(selectedItem.length)
          options.exec(selectedItem)
          break
        default:
          setTimeout(() => {
            this.onSearchInputFocus()
          })
          break
      }
      
    },
    attrTabIndex: function (item) {
      if (item === null) {
        return -1
      }
      else {
        return 0
      }
    },
    isVisibleInCurrentPage: function (index) {
      return (index >= this.visibleCurrentFirstItemIndex && index <= this.visibleCurrentLastItemIndex)
    },
    initPopup: function () {
      
      // https://semantic-ui.com/modules/popup.html
      let html = $(`<div class="popup-panel"></div>`)
      //html = $('#AAA')
      
      let popupOptions = {
        on: 'click',
        position: 'top center',
        hoverable: true, 
        
        //popup: $('#popup-content'),
        //hoverable: true, 
        delay: {
          //show: 50,
          hide: this.popupHideDelay
        },
        exclusive: true,
        movePopup: false,
        //preserve: true,
        html  : html,  
        onShow: (trigger) => {
          this.isPopupVisiable = true
          this.currentPopupTrigger = trigger
          let index = trigger.getAttribute('data-shortcut-index')
          index = parseInt(index, 10)
          //console.log(index)
          //console.log(this.getSortedShortcuts[index])
          let folderName = this.sortedMainItems[index].name
          let subItems = this.sortedMainItems[index].subItems
          //console.log(a.getAttribute('data-shortcut-index'))
          //console.log(items)

          // 先做比較簡單的形式吧
          html.html(this.buildSubItems(folderName, subItems))
          
          let size = this.calcPopupSize(subItems)
          html.attr('data-grid-size', size)
          //html.find('.launchpad-item:first').focus()
          //html.html('AAA')
        },
        onVisible: () => {
          //this.isPopupVisiable = true
          //console.log(2)
          //console.log(this)
          //$('#redips-drag').css('pointer-events', 'none')
          /*
          setTimeout(() => {
            let popupPanel = $('.popup-panel:visible:first > .launchpad-items-container')
            //let popupPanel = $('.popup-panel:visible:first')[0]
            //console.log(popupContent)
            console.log(popupPanel[0])
            const draggable = new this.lib.Draggable.Sortable(popupPanel[0], {
              draggable: 'div',
              delay: this.dragDelay,
              
            })
            
            setTimeout(() => {
              //console.log('focus')
              //popupPanel.find('.launchpad-item:first').focus()
            }, 0)
          }, 300)
          */
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
            this.currentPopupTrigger = null
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
    calcPopupSize: function (subItems) {
      let size = Math.ceil(Math.sqrt(subItems.length))
      if (size > 4) {
        size = "4"
      }
      return size
    },
    buildSubItems: function (folderName, shortcuts) {
      let _this = this
      let container = $(`<div>
        <div class="folder-name" title="${folderName}">
            <i class="folder open outline icon"></i>
            ${folderName}
        </div>
        <div class="launchpad-items-container"></div>
      </div>`)
      
      container.find('.folder-name:first').click((event) => {
        this.openFolder(this.shortcutsFolderPath + '/' + folderName)
        this.exit()
        event.stopPropagation()
      })
      
      let itemsContainer = container.find('.launchpad-items-container:first')
      
      itemsContainer.attr('data-folder-name', folderName)
      
      
      let size = this.calcPopupSize(shortcuts)
      itemsContainer.attr('data-grid-size', size)
      
      if (Array.isArray(shortcuts)) {
        shortcuts = this.getSortedSubItems(folderName, shortcuts)
        
        shortcuts.forEach((shortcut) => {
          let item = $(`
            <div class="launchpad-item sub-item" 
                 title="${this.displayDescription(shortcut)}">
              <img class="icon" draggable="false" />
              <div class="name">
                ${shortcut.name}
              </div>
            </div>`)
          
          item.attr('data-exec', shortcut.exec)
          item.attr('data-path', shortcut.path)
          
          if (typeof(shortcut.icon) === 'string') {
            item.find('img.icon').attr('src', shortcut.icon)
          }
          
          item.click(function (event) {
            let data
            if (_this.isEditingMode === true) {
              data = this.getAttribute('data-path')
            }
            else {
              data = this.getAttribute('data-exec')
            }
            //console.log(data)
            if (process.platform === 'win32') {
              if (data.indexOf(' ') > -1 
                      && data.startsWith('"') === false
                      && data.indexOf('"') === -1) {
                data = `"${data}"`
              }
            }
            
            //console.log(data)
            
            //window.alert(data)
            _this.exec(data)
            event.stopPropagation()
          })
          
          itemsContainer.append(item)
        })
        
        const draggable = new this.lib.Draggable.Sortable(itemsContainer[0], {
          draggable: 'div.launchpad-item',
          delay: this.dragDelay
        })
        
        /*
        setTimeout(() => {
          container.find('[tabindex="0"]').prop('tabindex', '-1')
          container.prop('tabindex', '-1')
        }, 100)
         */
        
        
        //draggable.on('drag:start', (event) => {
        //  console.log('folder item drag:start')
        //});
        
        draggable.on('drag:stop', (event) => {
          //console.log(event.)
          let itemsContainer = event.sourceContainer
          let folderName = itemsContainer.getAttribute('data-folder-name')
          
          this.onSubItemDropped(folderName, itemsContainer)
          //console.log('folder item drag:stop')
        })
        
        setTimeout(() => {
          itemsContainer.find('.launchpad-item:first').focus()
          this.setupSubItemsKeyEvents(itemsContainer)
        }, 50)
      }
      
      container.click(() => {
        container.find('.launchpad-item:first').focus()
      })
      
      return container
    },
    getSortedSubItems: function (folderName, shortcuts) {
      let subItemsSorted = this.lib.FolderConfigHelper.readSubItemSort(this.shortcutsFolderPath, folderName)
      if (subItemsSorted === undefined) {
        this.cache.subItemsSorted[folderName] = shortcuts
        return shortcuts
      }
      
      if (Array.isArray(this.cache.subItemsSorted[folderName])) {
        return this.cache.subItemsSorted[folderName]
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
      
      this.cache.subItemsSorted[folderName] = sorted
      
      return sorted
    },
    initMouseWheelKeys: function () {
      //console.log('i')
      window.addEventListener("wheel", event => {
        if (this.waitDragScroll === false) {
          this.scrollPage((event.deltaY > 0), () => {
            if (this.isSearchInputFocused === true) {
              this.lastFocusIndex = null
              this.onSearchInputFocus()
            }
            else if (typeof(this.lastFocusIndex) === 'number') {
              let container = $(this.visibleListElement)
              let itemIndex = this.visibleCurrentFirstItemIndex
              selectedItem = container.children(`.launchpad-item:eq(${itemIndex})`)
              if (selectedItem.hasClass('empty')) {
                selectedItem = selectedItem.nextAll('.launchpad-item:not(.empty):first')
              }
              if (selectedItem.length === 0) {
                selectedItem = selectedItem.prevAll('.launchpad-item:not(.empty):first')
              }
              if (selectedItem.length > 0) {
                selectedItem.focus()
              }
            }
          })
        }
      })
      
      setTimeout(() => {
        this.setupMainItemHoykeyLabel()
      }, 100)
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
    scrollPage: function (isNext, doTransition, callback) {
      if (this.waitDragScroll === true || this.isPopupVisiable === true) {
        return this
      }
      
      if (typeof(doTransition) === 'function' && callback === undefined) {
        callback = doTransition
        doTransition = true
      }
      
      if (typeof(isNext) === 'number') {
        if ( (this.isSearchMode === false && isNext === this.currentPage) 
                || (this.isSearchMode === true && isNext === this.currentSearchResultPage)) {
          if (typeof(callback) === 'function') {
            callback(isNext)
          }
          return this
        }
      }
      
      let duration = 100
      if (typeof(doTransition) === 'number') {
        duration = doTransition
      }
      else if (doTransition === false) {
        duration = 10
      }
      
      //this.currentPage++
      // 20190830 克服要捲動頁面超過最大頁面的問題
      //console.log([this.currentPage, this.maxPages, isNext])
      if (typeof(isNext) === 'number' 
              && isNext >= this.maxPages) {
        isNext = this.maxPages - 1
        if (isNext === this.currentPage) {
          //console.log('不捲動')
          if (typeof(callback) === 'function') {
            callback()
          }
          return this
        }
      }
      
      let page = this.currentPage
      let pageLength = this.maxPages
      if (this.isSearchMode === true) {
        page = this.currentSearchResultPage
        pageLength = this.searchResultPageLength
      }
      
      if (typeof(isNext) === 'number') {
        page = isNext
      }
      else if (isNext === undefined || isNext === true) {
        page = (page + 1) % pageLength
      }
      else {
        page--
        if (page < 0) {
          page = pageLength - 1
        }
      }
      
      if (this.isSearchMode === false) {
        this.currentPage = page
      }
      else {
        this.currentSearchResultPage = page
      }
      
      //this.$refs.AppList.scrollTop = $(this.$refs.AppList).height() * this.currentPage
      let appList
      if (this.isSearchMode === false) {
        appList = $(this.$refs.AppList)
      }
      else {
        appList = $(this.$refs.SearchResultList)
      }
      
      appList.animate({
        scrollTop: (appList.height() * page)
      }, duration)
              .promise()
              .done(callback);
      
      let pager
      if (this.isSearchMode === false) {
        pager = $(this.$refs.pager)
      }
      else {
        pager = $(this.$refs.searchResultPager)
      }
      let pagerHeight = pager.height()
      let pagerNumberPerPage = 20
      let pagerPage = parseInt(page / pagerNumberPerPage, 10)
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
      if (this.isSearchMode === false) {
        this.lib.FolderConfigHelper.write(this.shortcutsFolderPath, 'currentPage', this.currentPage)
      }
      
      this.waitDragScroll = true
      setTimeout(() => {
        this.waitDragScroll = false
      }, duration)
      return this
    },
    addPage: function () {
      //console.error('addPage')
      let itemCountInPage = this.maxCols * this.maxRows
      
      let anchorIndex = ((this.currentPage + 1) * itemCountInPage) - 1
      let anchorItem = $(this.$refs.AppList).children(`.launchpad-item:eq(${anchorIndex})`)
      //console.log(anchorIndex)
      //anchorItem.css('background-color', 'red')
      
      for (let i = 0; i < itemCountInPage; i++) {
        anchorItem.after(this.buildEmptyItem())
      }
      
      //this.initDraggable()
      
      this.maxPages++
      //this.isPopupVisiable = true
      setTimeout(() => {
        this.scrollPage(true)
        this.initDraggable()
        //this.isPopupVisiable = false
      }, 300)
      //
      
      return this
    },
    buildEmptyItem: function () {
      return `<div tabindex="-1" class="launchpad-item empty">
  <div class="item-wrapper">
    <img draggable="false" class="icon">
    <div class="name">(NULL)</div>
  </div>
</div>`
    },
    removePage: function () {
      if (this.isPageRemovable === false) {
        return this
      }
      //console.error('removePage')
      
      let itemCountInPage = this.pageItemCount
      
      let anchorIndex = (this.currentPage * itemCountInPage) - 1
      let anchorItem = $(this.$refs.AppList).children(`.launchpad-item:eq(${anchorIndex})`)
      //anchorItem.css('background-color', 'red')
      
      // 嘗試移除16個格子吧
      let removedCount = 0
      let isForward = true
      while (removedCount < itemCountInPage) {
        if (isForward === true) {
          if (anchorItem.next().length > 0) {
            if (anchorItem.next().hasClass('empty')) {
              anchorItem.next().remove()
              removedCount++
            }
            else {
              anchorItem = anchorItem.next()
            }
          }
          else {
            isForward = false
          }
        }
        else {
          if (anchorItem.prev().hasClass('empty')) {
            anchorItem.prev().remove()
            removedCount++
          }
          else {
            anchorItem = anchorItem.prev()
          }
        }
      }
      
      this.maxPages--
      if (this.currentPage > this.maxPages - 1) {
        this.currentPage = this.maxPages - 1
      }
      //this.isPopupVisiable = true
      //setTimeout(() => {
        //this.scrollPage(false)
        this.initDraggable()
        //this.isPopupVisiable = false
      //}, 300)
      
      return this
    },
    displayDescription: function (item) {
      let description = []
      
      if (typeof(item) === 'object' && item !== null) { 
        if (typeof(item.name) === 'string'
                && item.name.trim() !== '') {
          description.push(item.name.trim())
        }
        if (typeof(item.description) === 'string' 
                && item.description.trim() !== '') {
          description.push(item.description.trim())
        }
      }
      
      return description.join(': ')
    },
    openFolder: function (dirpath) {
      //console.error('openFolder folder')
      if (typeof(dirpath) !== 'string') {
        dirpath = this.shortcutsFolderPath
      }
      if (typeof(dirpath) === 'string'
              && this.lib.ElectronFileHelper.existsSync(dirpath)) {
        //console.log(dirpath)
        this.lib.ElectronFileHelper.showInFolder(dirpath)
        //this.exit()
      }
      return this
    },
    changeFolder: function () {
      //console.error('change folder')
      //this.lib.ipc.send
      this.lib.ipc.send('change-folder', this.shortcutsFolderPath)
      return this
    },
    changeFolderCallback: function (dirpath) {
      if (typeof(dirpath) === 'string'
              && this.lib.ElectronFileHelper.isDirSync(dirpath)) {
        //console.log(dirpath)
        this.shortcutsFolderPath = dirpath
        this.searchKeyword = ''
        this.mainItemsInited = false
        this.lib.ShortcutHelper.get(this.shortcutsFolderPath, (shortcuts) => {
          this.shortcuts = shortcuts
          this.initDraggable()
          this.initPopup()
          this.scrollPage(0, false)
          this.mainItemsInited = true
          this.$refs.SearchInput.focus()
        })
      }
      return this
    },
    exit: function () {
      if (this.debug.enableExit === false) {
        console.log('debug: exit()')
        return this
      }
      this.lib.win.close()
      return this
    },
    onMainItemDropped: function () {
      if (this.debug.enableSortPersist === false) {
        return this
      }
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
        
        this.setupMainItemHoykeyLabel()
      }, 100)
              
      return this
    },
    onSubItemDropped: function (folderName, container) {
      if (this.debug.enableSortPersist === false) {
        return this
      }
      
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
        delete this.cache.subItemsSorted[folderName]
      }, 100)

      return this
    },
    exec: function (shortcut) {
      //console.log(JSON.stringify(shortcut))
      //window.alert(JSON.stringify(shortcut))
      if (this.isEditingMode === true) {
        let path = shortcut
        if (typeof(path) === 'object' 
                && typeof(path.path) === 'string') {
          path = path.path
        }
        //console.log(path)
        if (typeof(path) === 'string') {
          this.openFolder(path)
          setTimeout(() => {
            return this.exit()
          }, 500)
        }
        return this
      }
      
      let execCommand = shortcut
      if (typeof(execCommand.exec) === 'string') {
        execCommand = execCommand.exec
      }
      
      if (typeof(execCommand) !== 'string') {
        return this
      }
      if (this.debug.enableClick === false) {
        console.log(`Degub: ${execCommand}`)
        return this
      }
      
      //let parameters = []
      //this.lib.win.hide()
      
      //console.log({execCommand})
      //window.alert(execCommand)
      
      this.lib.ElectronFileHelper.execExternalCommand(execCommand,() => {
        return this.exit()
      })
      return this
    },
    displaySearchNameMatch: function (name) {
      let keywords = this.searchKeyword.trim()
      if (keywords === '') {
        return name
      }
      
      //let markedKeyword = `<span class="match">${keyword}</span>`
      //let markedName = name.split(keyword).join(markedKeyword)
      keywords = keywords.split(' ')
      let uniqueList = []
      keywords.forEach(keyword => {
        if (uniqueList.indexOf(keyword) === -1) {
          uniqueList.push(keyword)
        }
      })
      keywords = uniqueList
      
      let markedName = name
      //keywords.forEach(keyword => {
      let re = new RegExp(keywords.join('|'),"gi");
      markedName = markedName.replace(re, (match) => {
        return `<span class="match">${match}</span>`
      });
      //})
      
      return markedName
    },
    setupMainItemHoykeyLabel: function () {
      // 我現在不想要用這個功能了，關掉它吧
      return this;
      
      let container
      if (this.isSearchMode === false) {
        container = $(this.$refs.AppList)
      }
      else if (this.isSearchMode === true) {
        container = $(this.$refs.SearchResultList)
      }
      //console.log(container.children('.launchpad-item').length)
      container.children('.launchpad-item').each((i, item) => {
        let key = 'alt+' + this.calcHotKeyFromItemIndex(i)
        let label = $(item).find('.hotkey-label .hotkey')
        label.text(key)
      })
      
      setTimeout(() => {
        this.mainItemHotkeyLabelInited = true
      }, 500)
      return this
    },
    calcHotKeyFromItemIndex: function (i) {
      let keyIndex = i % this.pageItemCount
      if (typeof(this.hotkeyConfig[keyIndex]) !== 'undefined') {
        return this.hotkeyConfig[keyIndex]
      }
      else {
        return ''
      }
    },
    getSubItemIcons: function (item) {
      let list = []
      if (Array.isArray(item.subItems)) {
        // 這邊需要取得排序
        let subItems = this.getSortedSubItems(item.name, item.subItems)
        
        for (let i = 0; i < subItems.length; i++) {
          list.push(subItems[i].icon)
          if (list.length === 4) {
            break
          }
        }
      }
      return list
    },
    resetAllConfig: function () {
      this.resetOrder(false)
      this.resetShortcutsCache(false)
      this.resetIconsCache(true)
      return this
    },
    resetOrder: function (doReload) {
      this.lib.FolderConfigHelper.reset(this.shortcutsFolderPath, ['mainItemsSorted', 'itemsCount', 'subItemsSorted'])
      // 重新載入icon吧
      if (doReload !== false) {
        //this.changeFolderCallback(this.shortcutsFolderPath)
        location.reload()
      }
      return this
    },
    resetShortcutsCache: function (doReload) {
      //console.error('resetShortcutsCache')
      this.lib.FolderConfigHelper.reset(this.shortcutsFolderPath, 'ShortcutMetadata')
      // 重新載入icon吧
      if (doReload !== false) {
        //this.changeFolderCallback(this.shortcutsFolderPath)
        location.reload()
      }
      return this
    },
    resetIconsCache: function (doReload) {
      //console.error('resetIconsCache')
      // 遍歷現在的shortcuts中，開頭為抽取出來的檔案的icon
      let header = this.lib.ElectronFileHelper.resolve('cache/icon/')
      let checkAndRemoveIcons = (shortcut) => {
        if (typeof(shortcut.icon) === 'string' 
                && shortcut.icon.startsWith(header)) {
          this.lib.ElectronFileHelper.remove(shortcut.icon)
        }
      }
      
      this.shortcuts.forEach(shortcut => {
        if (shortcut === null) {
          return
        }
        
        if (Array.isArray(shortcut.subItems) === false) {
          checkAndRemoveIcons(shortcut)
        }
        else {
          shortcut.subItems.forEach(subShortcut => {
            checkAndRemoveIcons(subShortcut)
          })
        }
      })
      
      // 重新載入icon吧
      if (doReload !== false) {
        //this.changeFolderCallback(this.shortcutsFolderPath)
        location.reload()
      }
      return this
    },
    toggleEditingMode: function () {
      this.isEditingMode = (this.isEditingMode === false)
      return this
    },
    openURL: function (url) {
      this.lib.ElectronHelper.openURL(url)
      return this
    }
  } // methods
}

if (typeof(window) !== 'undefined') {
  window.VueController = new Vue(VueControllerConfig)
}
if (typeof(exports) !== 'undefined') {
  exports.default = new Vue(VueControllerConfig)
}
