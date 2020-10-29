/* global __dirname */

exports.default = function (icon, data) {

  //console.log(data)
  //console.log([icon === '', this.lib.ElectronFileHelper.existsSync(icon), this.lib.ElectronFileHelper.existsSync(data.Target)])
  if (icon === ''
          || this.lib.ElectronFileHelper.existsSync(icon) === false) {
    if (this.lib.ElectronFileHelper.existsSync(data.Target) === true) {
      icon = data.Target

      if (this.lib.ElectronFileHelper.isDirSync(icon)) {
        icon = this.lib.path.join(__dirname, '/imgs/predefined/folderopened_yellow.png')
      } else if (icon.endsWith('.bat')) {
        icon = this.lib.path.join(__dirname, '/imgs/predefined/filetype_bat.png')
      } else if (icon.endsWith('.yaml')) {
        icon = this.lib.path.join(__dirname, '/imgs/predefined/text_xml.png')
      } else if (icon.indexOf('Firefox') > -1) {
        icon = this.lib.path.join(__dirname, '/imgs/predefined/firefox-logo-300x310.png')
      }
    }
  }

  if (icon === 'C:\\Windows\\system32\\narrator.exe') {
    icon = this.lib.path.join(__dirname, '/imgs/predefined/narrator.png')
  }

  return icon
}