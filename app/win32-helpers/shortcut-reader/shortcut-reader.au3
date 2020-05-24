#AutoIt3Wrapper_Change2CUI=y
#pragma compile(Console, True)

If $CmdLine[0] > 0 Then
   Local $aDetails = FileGetShortcut($CmdLine[1])

   ConsoleWrite("Target=" & $aDetails[0] & @CRLF)

   If $aDetails[2] <> "" Then
     ConsoleWrite('Exec="' & $aDetails[0] & '" ' & $aDetails[2] & @CRLF)
   Else
     ConsoleWrite('Exec=' & $aDetails[0] & @CRLF)
   EndIf
   ConsoleWrite("Comment=" & $aDetails[3] & @CRLF)
   ConsoleWrite("Icon=" & $aDetails[4])
EndIf
