$udpClient = New-Object System.Net.Sockets.UdpClient
$bytes = [System.Text.Encoding]::ASCII.GetBytes("100 Test message from database")
$udpClient.Send($bytes, $bytes.Length, "localhost", 8889)
$udpClient.Close()
Write-Host "Test message sent successfully"
