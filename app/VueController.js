let VueControllerConfig = {
  el: '#app',
  data: {
    popupHideDelay: 1000 * 60,
    dragDelay: 100,
    maxRows: 4,
    maxCols: 4,
    hotkeyConfig: [1,2,3,4,'q','w','e','r','a','s','d','f','z','x','c','v'],
    
    searchKeyword: "",
    currentSearchResultPage: 0,
    
    currentPage: 0,
    maxPages: 99,
    shortcutDirPath: null,
    shortcuts: [],
    enableDragScroll: false,
    isPopupVisiable: false,
    waitDragScroll: false,
    shortcutsFolderPath: 'folder-path-for-test',
    mainItemsDraggable: null,
    currentPopupTrigger: null,
    mainItemHotkeyLabelInited: false,
    
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
    debug: {
      enableExit: true,
      enableClick: true,
      enableSortPersist: true,
    }
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
    isSearchMode: function () {
      let keyword = this.searchKeyword.trim()
      return (keyword !== "")
    },
    sortedMainItems: function () {
      if (this.lib.FolderConfigHelper === null
              || Array.isArray(this.shortcuts) === false) {
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
      }
      else {
        sortedShortcuts = this.shortcuts
      }
      
      let pageItemCount = this.pageItemCount
      while (sortedShortcuts.length % pageItemCount !== 0) {
        sortedShortcuts.push(null)
      }
      
      this.maxPages = sortedShortcuts.length / pageItemCount
      
      return sortedShortcuts
    },
    pageItemCount: function () {
      return this.maxRows * this.maxCols
    },
    searchResultList: function () {
      let keywords = this.searchKeyword.trim().toLowerCase()
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
      if (this.debug.enableSortPersist === false) {
        return this
      }
      
      let currentPage = this.lib.FolderConfigHelper.read(this.shortcutsFolderPath, 'currentPage')
      if (typeof(currentPage) === 'number') {
        this.scrollPage(currentPage, false)
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
    setupMainItemsKeyEvents: function (container) {
      let options = {
        focus: this.scrollAndFocusMainItem,
        maxCols: this.maxCols,
        pageItemCount: this.pageItemCount,
        exit: () => {
          this.exit()
        },
        exec: (item) => {
          item.find('.item-wrapper:first').click()
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
      container.find('.launchpad-item').bind('keydown', (event) => {
        //console.log(event)
        let item = $(event.target)
        let index = item.index()
        let parent = item.parent()
        //console.log()
        //console.log(item.find('.name:first').text(), event.keyCode)
        let keyCode = event.keyCode
        let searchItem
        let itemsCount
        
        switch (keyCode) {
          case 37: // left
            // 搜尋前一個不是empty的item
            searchItem = item.prevAll('.launchpad-item:not(.empty):first')
            options.focus(searchItem)
            break;
          case 39: // right
            searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            options.focus(searchItem)
            break;
          case 38: // up
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            if (index <= options.maxCols) {
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
            break;
          case 40: // down
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            itemsCount = parent.find('.launchpad-item').length
            if (index >= (itemsCount - options.maxCols) ) {
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
            break;
          case 33: // page up
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            if (index < options.pageItemCount) {
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
            break;
          case 34: // page down
            //let searchItem = item.nextAll('.launchpad-item:not(.empty):first')
            itemsCount = parent.find('.launchpad-item').length
            if (index > (itemsCount - options.pageItemCount) ) {
              // @TODO 這裡可能會有錯
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
            break;
          case 36: // home
            searchItem = parent.children('.launchpad-item:not(.empty):first')
            options.focus(searchItem)
            break;
          case 35: // end
            searchItem = parent.children('.launchpad-item:not(.empty):last')
            options.focus(searchItem)
            break;
          case 13: // enter
          case 32: // space
            //console.log(item.hasClass('folder'))
            //if (item.hasClass('folder') === false) {
            options.exec(item)
            break;
          case 27: // esc
          case 8: // backspace
            options.exit()
            break
        }
      })
      //console.log(container.find('.launchpad-item').length)
      return this
    },
    attrTabIndex: function (item) {
      if (item === null) {
        return -1
      }
      else {
        return 0
      }
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
      let container = $('<div class="launchpad-items-container"></div>')
      container.attr('data-folder-name', folderName)
      
      let size = this.calcPopupSize(shortcuts)
      container.attr('data-grid-size', size)
      
      if (Array.isArray(shortcuts)) {
        shortcuts = this.getSortedSubItems(folderName, shortcuts)
        
        shortcuts.forEach((shortcut) => {
          let item = $(`
            <div class="launchpad-item sub-item" 
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
          let container = event.sourceContainer
          let folderName = container.getAttribute('data-folder-name')
          
          this.onSubItemDropped(folderName, container)
          //console.log('folder item drag:stop')
        })
        
        setTimeout(() => {
          container.find('.launchpad-item:first').focus()
          this.setupSubItemsKeyEvents(container)
        }, 50)
      }
      
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
    initHotKeys: function () {
      //console.log('i')
      window.addEventListener("wheel", event => {
        if (this.waitDragScroll === false) {
          this.scrollPage((event.deltaY > 0))
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
      
      let duration = 700
      if (typeof(doTransition) === 'number') {
        duration = doTransition
      }
      else if (doTransition === false) {
        duration = 10
      }
      
      //this.currentPage++
      //console.log([this.currentPage, this.maxPages])
      
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
    exec: function (execCommand) {
      if (typeof(execCommand) !== 'string') {
        return this
      }
      if (this.debug.enableClick === false) {
        console.log(`Degub: ${execCommand}`)
        return this
      }
      
      //let parameters = []
      this.lib.win.hide()
      if (process.platform === 'win32') {
        execCommand = '"' + this.lib.ElectronFileHelper.resolve('exec/exec.exe') + '" ' + execCommand
        console.log(execCommand)
      }
      
      /*
      this.lib.exec(execCommand, (err, data) => {
        //console.log(err)
        //console.log(data.toString());
        
        return this.exit()
      })
       */
      const exec = require('child_process').exec
      exec(execCommand, () => {
        return this.exit()
      })
      
      //fork(exec)
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
      let container
      if (this.isSearchMode === false) {
        container = $(this.$refs.AppList)
      }
      else if (this.isSearchMode === true) {
        container = $(this.$refs.SearchResultList)
      }
      //console.log(container.children('.launchpad-item').length)
      container.children('.launchpad-item').each((i, item) => {
        let key = this.calcHotKeyFromItemIndex(i)
        let label = $(item).find('.hotkey-label .hotkey')
        label.text(key)
      })
      
      setTimeout(() => {
        this.mainItemHotkeyLabelInited = true
      }, 500)
    },
    calcHotKeyFromItemIndex: function (i) {
      let keyIndex = i % this.pageItemCount
      if (typeof(this.hotkeyConfig[keyIndex]) !== 'undefined') {
        return this.hotkeyConfig[keyIndex]
      }
      else {
        return ''
      }
    }
  }
}

if (typeof(window) !== 'undefined') {
  window.VueController = new Vue(VueControllerConfig)
}
if (typeof(exports) !== 'undefined') {
  exports.default = new Vue(VueControllerConfig)
}
