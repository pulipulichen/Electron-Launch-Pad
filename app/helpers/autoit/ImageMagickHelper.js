/* global __dirname */

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
    
    this.lib.fs = require('fs-extra')
    this.lib.path = require('path')
    this.lib.exec = require('child_process').exec
    
    this.lib.imageSize = require('image-size')
    
    //this.imagemagickPath = this.lib.path.resolve(__dirname, '../win32-helpers/imagemagick/convert.exe')
    this.imagemagickPath = this.lib.path.resolve(__dirname, './cache/imagemagick/convert.exe')
    if (process.platform === 'win32'
      && this.lib.fs.existsSync(this.imagemagickPath) === false) {
      
      let ElectronFileHelper = RequireHelper.require('./helpers/electron/ElectronFileHelper')
      let originalExe = ElectronFileHelper.resolveAppPath('win32-helpers/imagemagick/convert.exe')
      
      if (this.lib.fs.existsSync(originalExe) === false) {
        let errorMessage = 'convert.exe is not found: ' + originalExe
        alert(errorMessage)
        throw Error(errorMessage)
        return false
      }
      
      let dir = this.lib.path.dirname(this.imagemagickPath)
      if (this.lib.fs.existsSync(dir) === false) {
        this.lib.fs.mkdirSync(dir, {
          recursive: true
        })
      }
      
      this.lib.fs.copyFileSync(originalExe, this.imagemagickPath)
    }
    
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
    //console.log(basenameNoExt)
    if (basenameNoExt.endsWith(']') && basenameNoExt.indexOf('[') > 0) {
      basenameNoExt = basenameNoExt.slice(0, basenameNoExt.indexOf('['))
    }
    //console.log(basenameNoExt)
    
    // ---------------------
    // 合併
    
    if (ext !== '') {
      basename = basenameNoExt + '.' + ext
    }
    
    return this.lib.path.join(dirPath, basename)
  },
  icoToPng: function (icoPath, callback) {
    //console.log({ icoPath, cb: typeof(callback) })
    this.init()
    if (typeof(callback) !== 'function') {
      return false
    }
    
    const source = this.lib.fs.readFileSync(icoPath)
    
    let pngPath = icoPath.slice(0, -3) + 'png'
    pngPath = this.transfromSafeName(pngPath)
    
    //console.log({pngPath})
    if (this.lib.fs.existsSync(pngPath)) {
      // 把它變成base64好了
      pngPath = this.base64_encode(pngPath)
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
  },
  base64_encode(file) {
      // read binary data
      var bitmap = this.lib.fs.readFileSync(file);
      // convert binary data to base64 encoded string
      return 'data:image/png;base64,' + new Buffer(bitmap).toString('base64')
  }
}

if (typeof(window) === 'object') {
  window.ImageMagickHelper = ImageMagickHelper
}
if (typeof(module) === 'object') {
  module.exports = ImageMagickHelper
}
