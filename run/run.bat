cd /D "%~dp0"
cd ..
echo %1 
electron index.js --mode production %1