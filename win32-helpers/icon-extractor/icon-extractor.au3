#include <GDIPlus.au3>
#include <WinAPIShellEx.au3>

;ExtractIcon("D:\PortableApps\[Development\npp.7.2.2.bin\notepad++.exe", @ScriptDir & "\notepad.png")

Func ExtractIcon($file, $output)
    $hIcon = _WinAPI_ShellExtractIcon($file, 0, 32, 32)
    _GDIPlus_Startup()
    $pBitmap = _GDIPlus_BitmapCreateFromHICON($hIcon)
    _GDIPlus_ImageSaveToFileEx($pBitmap, $output, _GDIPlus_EncodersGetCLSID("PNG"))
    _GDIPlus_ImageDispose($pBitmap)
    _GDIPlus_Shutdown()
    _WinAPI_DestroyIcon($hIcon)
EndFunc

If $CmdLine[0] > 1 Then
  ExtractIcon($CmdLine[1], @ScriptDir & "\" & $CmdLine[2])
EndIf