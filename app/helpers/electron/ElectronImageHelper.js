let ElectronImageHelper = {
  inited: false,
  lib: {
    imageSize: null,
    imagemagick: null,
    fs: null
  },
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.fs = require('fs')
    this.lib.imageSize = require('image-size')
    this.lib.imagemagick = require('imagemagick')
    
    this.inited = true
    return this
  },
  sizeOf: function (imagePath) {
    this.init()
    let dimension = this.lib.imageSize(imagePath)
    //console.log([imagePath, dimension])
    return dimension
  },
  icoToPng: function (icoPath, callback) {
    this.init()
    if (typeof(callback) !== 'function') {
      return false
    }
    
    const source = this.lib.fs.readFileSync(icoPath)
    
    let pngPath = icoPath.slice(0, -3) + 'png'
    if (this.lib.fs.existsSync(pngPath)) {
      return callback(pngPath)
    }

    this.lib.imagemagick.convert([icoPath, pngPath], () => {
      
      //console.log(pngPath)
      if (typeof(callback) === 'function') {
        callback(pngPath)
      }
    })
  }
}


if (typeof(window) === 'object') {
  window.ElectronImageHelper = ElectronImageHelper
}
if (typeof(module) === 'object') {
  module.exports = ElectronImageHelper
}
