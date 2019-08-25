let fs = require('fs')
let path = require('path')

let PrcoessArgvHelper = {
  getFilePaths: function () {
    let filepaths = []
    if (typeof(process) === 'object'
        && Array.isArray(process.argv)) {
      process.argv.forEach(arg => {
        if (fs.existsSync(arg)) {
          filepaths.push(path.resolve(arg))
        }
      })
    }
    return filepaths
  },
  getDirPaths: function () {
    let dirPaths = []
    if (typeof(process) === 'object'
            && Array.isArray(process.argv)) {
        process.argv.forEach(arg => {
          if (fs.existsSync(arg) 
                  && fs.lstatSync(arg).isDirectory()) {
            dirPaths.push(arg)
          }
        })
    }
    return dirPaths
  }
}

module.exports = PrcoessArgvHelper