#AutoIt3Wrapper_Change2CUI=y
#pragma compile(Console, True)

If $CmdLine[0] > 0 Then
   Local $aDetails = FileGetShortcut($CmdLine[1])

   ConsoleWrite("Exec=" & $aDetails[0] & ' ' & $aDetails[2] & @CRLF)
   ConsoleWrite("Description=" & $aDetails[3] & @CRLF)
   ConsoleWrite("Icon=" & $aDetails[4])
EndIf