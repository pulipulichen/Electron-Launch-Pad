let ImageMagickHelper = {
  inited: false,
  lib: {
    imageSize: null,
    //gm: null,
    //imagemagick: null,
    fs: null,
    path: null,
    exec: null
  },
  imagemagickPath: null,
  init: function () {
    if (this.inited === true) {
      return this
    }
    
    this.lib.fs = require('fs')
    this.lib.path = require('path')
    this.lib.exec = require('child_process').exec
    
    this.lib.imageSize = require('image-size')
    this.imagemagickPath = this.lib.path.resolve(__dirname, '../win32-helpers/imagemagick/convert.exe')
    //this.lib.imagemagick = require('imagemagick')
    //this.lib.gm = require('gm').subClass({imageMagick: false})
    
    this.inited = true
    return this
  },
  sizeOf: function (imagePath) {
    this.init()
    let dimension = this.lib.imageSize(imagePath)
    //console.log([imagePath, dimension])
    return dimension
  },
  transfromSafeName: function (path) {
    let dirPath = this.lib.path.dirname(path)
    let basename = this.lib.path.basename(path)
    let basenameNoExt = basename
    let ext = ''
    if (basenameNoExt.indexOf('.') > -1) {
      basenameNoExt = basenameNoExt.slice(0, basenameNoExt.lastIndexOf('.'))
      ext = basename.slice(basename.lastIndexOf('.') + 1)
    }
    console.log(basenameNoExt)
    if (basenameNoExt.endsWith(']') && basenameNoExt.indexOf('[') > 0) {
      basenameNoExt = basenameNoExt.slice(0, basenameNoExt.indexOf('['))
    }
    console.log(basenameNoExt)
    
    // ---------------------
    // 合併
    
    if (ext !== '') {
      basename = basenameNoExt + '.' + ext
    }
    
    return this.lib.path.join(dirPath, basename)
  },
  icoToPng: function (icoPath, callback) {
    this.init()
    if (typeof(callback) !== 'function') {
      return false
    }
    
    const source = this.lib.fs.readFileSync(icoPath)
    
    let pngPath = icoPath.slice(0, -3) +  'png'
    pngPath = this.transfromSafeName(pngPath)
    
    if (this.lib.fs.existsSync(pngPath)) {
      return callback(pngPath)
    }

    console.log(['Start convert: ', icoPath, pngPath])
    
    let command = `"${this.imagemagickPath}" convert "${icoPath}" "${pngPath}"`
    this.lib.exec(command, (err) => {
      if (err) {
        console.error(err)
      }
      callback(pngPath)
    })
    
    return this
    /*
    this.lib.imagemagick.readMetadata(icoPath, function(err, metadata){
      if (err) throw err;
      console.log('Shot at '+metadata.exif.dateTimeOriginal);
    })
    */
    /*
    this.lib.imagemagick.convert([icoPath, pngPath], (err, stdout) => {
    //this.lib.gm(icoPath)
            //.noProfile()
    //        .write(pngPath, (err) => {
      if (err) {
        //throw err
        console.error(err)
      }
      //console.log('stdout:', stdout)
  
      console.log(pngPath)
      if (typeof(callback) === 'function') {
        callback(pngPath)
      }
    })
    */
  }
}


if (typeof(window) === 'object') {
  window.ImageMagickHelper = ImageMagickHelper
}
if (typeof(module) === 'object') {
  module.exports = ImageMagickHelper
}
