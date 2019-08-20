const fs = require('fs')

let ProcessArgvHelper = {
  getDirPaths: function () {
    let dirPaths = []
    if (typeof(process) === 'object'
            && Array.isArray(process.argv))
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

module.export = ProcessArgvHelper