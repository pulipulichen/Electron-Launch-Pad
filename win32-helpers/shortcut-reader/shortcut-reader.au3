#AutoIt3Wrapper_Change2CUI=y
#pragma compile(Console, True)

If $CmdLine[0] > 0 Then
   Local $aDetails = FileGetShortcut($CmdLine[1])

   ConsoleWrite("Target=" & $aDetails[0] & @CRLF)
   ConsoleWrite("Exec=" & $aDetails[0] & ' ' & $aDetails[2] & @CRLF)
   ConsoleWrite("Comment=" & $aDetails[3] & @CRLF)
   ConsoleWrite("Icon=" & $aDetails[4])
EndIf