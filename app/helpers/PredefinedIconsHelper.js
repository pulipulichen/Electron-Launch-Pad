/* global __dirname */

exports.default = function (icon, data) {
  
  let ElectronFileHelper = RequireHelper.require('./helpers/electron/ElectronFileHelper')
  let path = RequireHelper.require('path')


  //console.log(data)
  //console.log([icon === '', ElectronFileHelper.existsSync(icon), ElectronFileHelper.existsSync(data.Target)])
  if (icon === ''
          || ElectronFileHelper.existsSync(icon) === false) {
    if (ElectronFileHelper.existsSync(data.Target) === true) {
      icon = data.Target

      if (ElectronFileHelper.isDirSync(icon)) {
        icon = path.join(__dirname, '/imgs/predefined/folderopened_yellow.png')
      } else if (icon.endsWith('.bat')) {
        icon = path.join(__dirname, '/imgs/predefined/filetype_bat.png')
      } else if (icon.endsWith('.yaml')) {
        icon = path.join(__dirname, '/imgs/predefined/text_xml.png')
      } else if (icon.indexOf('Firefox') > -1) {
        icon = path.join(__dirname, '/imgs/predefined/firefox-logo-300x310.png')
      }
    }
  }

  if (icon === 'C:\\Windows\\system32\\narrator.exe') {
    icon = path.join(__dirname, '/imgs/predefined/narrator.png')
  }

  return icon
}