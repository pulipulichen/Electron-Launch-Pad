# Electron-Launch-Pad
A Mac style launch pad with Electron.js

- Project: https://github.com/pulipulichen/Electron-Launch-Pad
- Issues: https://github.com/pulipulichen/Electron-Launch-Pad/issues
- Download: https://github.com/pulipulichen/Electron-Launch-Pad/releases

- Last update: 2019/08/26

----

# ICON
- http://www.icons101.com/icon/id_16252/setid_1784/Mac_Apps_by_Rudolf/launcher
- https://icons8.com/icons/set/app
- https://semantic-ui.com/elements/icon.html

----

# REDIPS
- https://www.redips.net/javascript/redips-drag-documentation/

----

# NPM

## Install electron in Linux

Error message
````
/usr/local/bin/electron -> /usr/local/lib/node_modules/electron/cli.js
````

Install command
````bash
sudo npm install -g electron --unsafe-perm=true
````

# platform-folders(node-gyp)

Error message
````
MSBUILD : error MSB3428: 無法載入 Visual C++ 元件 "VCBuild.exe"。若要修正這個問題，請1) 安裝 .NET Framework 2.0 SDK，2) 安裝 Microsoft Visual Studio 2005，或 3) 將元件位置加入至系統路徑 (如果元件安裝在別的位置)。 [C:\Users\USER\AppData\Roaming\npm\node_modules\platform-folders\build\binding.sln]
````

Install command
````
npm install --global --production windows-build-tools@4.0.0
````

我依然裝不起來，放棄
