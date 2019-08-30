#pragma compile(Icon, '../app/imgs/icon128.ico')
#pragma compile(Console, True)
#include <MsgBoxConstants.au3>


FileChangeDir(@ScriptDir)
If $CmdLine[0] = False Then
   ShellExecute('run.bat', "", "", "", @SW_HIDE)
   Exit
EndIf

For $i = 1 To $CmdLine[0]
   ;MsgBox($MB_SYSTEMMODAL, "Title", $CmdLine[$i], 10)
   ShellExecute('run.bat', '"' & $CmdLine[$i] & '"', "", "", @SW_HIDE)
Next
